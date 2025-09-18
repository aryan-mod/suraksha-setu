"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import {
  Bell,
  X,
  AlertTriangle,
  Shield,
  MapPin,
  Clock,
  CheckCircle,
  Volume2,
  VolumeX,
  Settings,
  Zap,
  CloudRain,
  Car,
  Wifi,
  WifiOff,
  Smartphone,
} from "lucide-react"

interface RealTimeNotification {
  id: string
  type: "emergency" | "weather" | "traffic" | "safety" | "geofence" | "system" | "push"
  title: string
  message: string
  timestamp: Date
  priority: "low" | "medium" | "high" | "critical"
  isRead: boolean
  location?: string
  actionRequired?: boolean
  expiresAt?: Date
  userId?: string
  metadata?: any
}

interface RealTimeNotificationSystemProps {
  currentLanguage: string
  userId?: string
  onEmergencyAction: (action: string, data: any) => void
}

export function RealTimeNotificationSystem({
  currentLanguage,
  userId,
  onEmergencyAction,
}: RealTimeNotificationSystemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<RealTimeNotification[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [subscription, setSubscription] = useState<any>(null)

  const supabase = createClient()
  const { toast } = useToast()
  const serviceWorkerRef = useRef<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    initializeRealTimeSystem()
    setupNetworkMonitoring()

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [userId])

  const initializeRealTimeSystem = async () => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        console.log("[v0] Initializing Service Worker...")

        // Check if service worker is already registered
        const existingRegistration = await navigator.serviceWorker.getRegistration()

        let registration
        if (existingRegistration) {
          registration = existingRegistration
          console.log("[v0] Using existing Service Worker registration:", registration)
        } else {
          registration = await navigator.serviceWorker.register("/sw.js/route", {
            scope: "/",
            updateViaCache: "none",
          })
          console.log("[v0] Service Worker registered:", registration)
        }

        serviceWorkerRef.current = registration

        // Wait for service worker to be ready
        await navigator.serviceWorker.ready
        console.log("[v0] Service Worker is ready")

        // Check if push notifications are already enabled
        const existingSubscription = await registration.pushManager.getSubscription()
        if (existingSubscription) {
          setPushEnabled(true)
          console.log("[v0] Found existing push subscription")
        }

        // Listen for service worker updates
        registration.addEventListener("updatefound", () => {
          console.log("[v0] Service Worker update found")
        })
      } catch (error) {
        console.error("[v0] Service Worker registration failed:", error)

        let errorMessage = "Push notifications may not work properly. Please refresh the page."

        if (error instanceof TypeError) {
          if (error.message.includes("MIME type")) {
            errorMessage = "Service worker configuration issue. Trying alternative setup..."
            // Try fallback registration
            try {
              const fallbackRegistration = await navigator.serviceWorker.register("/sw.js", {
                scope: "/",
                updateViaCache: "none",
              })
              serviceWorkerRef.current = fallbackRegistration
              console.log("[v0] Fallback Service Worker registered successfully")
              return // Exit early on successful fallback
            } catch (fallbackError) {
              console.error("[v0] Fallback registration also failed:", fallbackError)
              errorMessage = "Service worker setup failed. Push notifications disabled."
            }
          } else if (error.message.includes("Failed to fetch")) {
            errorMessage = "Network issue preventing service worker setup. Please check your connection."
          }
        }

        toast({
          title: "Notification Setup Issue",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } else {
      console.warn("[v0] Service Workers or Push Manager not supported")
      toast({
        title: "Browser Not Supported",
        description: "Your browser doesn't support push notifications.",
        variant: "destructive",
      })
    }

    // Setup Supabase real-time subscription for notifications
    if (userId) {
      const channel = supabase
        .channel("notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log("[v0] Real-time notification received:", payload)
            handleNewNotification(payload.new as RealTimeNotification)
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log("[v0] Notification updated:", payload)
            updateNotification(payload.new as RealTimeNotification)
          },
        )
        .subscribe()

      setSubscription(channel)
    }

    // Load existing notifications
    await loadNotifications()
  }

  const loadNotifications = async () => {
    if (!userId) return

    try {
      const response = await fetch(`/api/notifications/sync?userId=${userId}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error)
      }

      const formattedNotifications = result.notifications.map((notification: any) => ({
        ...notification,
        timestamp: new Date(notification.created_at),
        expiresAt: notification.expires_at ? new Date(notification.expires_at) : undefined,
        isRead: notification.is_read,
        actionRequired: notification.action_required,
      }))

      setNotifications(formattedNotifications)
    } catch (error) {
      console.error("[v0] Error loading notifications:", error)
      try {
        const { data, error: supabaseError } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(50)

        if (supabaseError) throw supabaseError

        const formattedNotifications = data.map((notification) => ({
          ...notification,
          timestamp: new Date(notification.created_at),
          expiresAt: notification.expires_at ? new Date(notification.expires_at) : undefined,
          isRead: notification.is_read,
          actionRequired: notification.action_required,
        }))

        setNotifications(formattedNotifications)
      } catch (fallbackError) {
        console.error("[v0] Fallback notification loading failed:", fallbackError)
      }
    }
  }

  const handleNewNotification = (notification: RealTimeNotification) => {
    const formattedNotification = {
      ...notification,
      timestamp: new Date(notification.timestamp),
      expiresAt: notification.expiresAt ? new Date(notification.expiresAt) : undefined,
    }

    setNotifications((prev) => [formattedNotification, ...prev])

    // Show toast notification
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.priority === "critical" || notification.priority === "high" ? "destructive" : "default",
    })

    // Play sound if enabled
    if (soundEnabled) {
      playNotificationSound(notification.priority)
    }

    // Send push notification if enabled and app is in background
    if (pushEnabled && document.hidden) {
      sendPushNotification(notification)
    }

    // Auto-speak critical notifications
    if (notification.priority === "critical" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        `${currentLanguage === "hi" ? "आपातकालीन चेतावनी" : "Emergency Alert"}: ${notification.message}`,
      )
      utterance.lang = currentLanguage === "hi" ? "hi-IN" : "en-US"
      speechSynthesis.speak(utterance)
    }
  }

  const updateNotification = (updatedNotification: RealTimeNotification) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === updatedNotification.id
          ? {
              ...updatedNotification,
              timestamp: new Date(updatedNotification.timestamp),
              expiresAt: updatedNotification.expiresAt ? new Date(updatedNotification.expiresAt) : undefined,
            }
          : n,
      ),
    )
  }

  const setupNetworkMonitoring = () => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
      if (navigator.onLine) {
        // Reconnect real-time subscriptions when back online
        loadNotifications()
      }
    }

    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }

  const enablePushNotifications = async () => {
    if (!serviceWorkerRef.current) {
      toast({
        title: "Push notifications not supported",
        description: "Your browser doesn't support push notifications.",
        variant: "destructive",
      })
      return
    }

    try {
      let permission = Notification.permission

      if (permission === "default") {
        permission = await Notification.requestPermission()
      }

      if (permission !== "granted") {
        toast({
          title: "Permission denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        })
        return
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) {
        console.error("[v0] VAPID public key not found")
        toast({
          title: "Configuration Error",
          description: "Push notifications are not properly configured.",
          variant: "destructive",
        })
        return
      }

      const subscription = await serviceWorkerRef.current.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      })

      // Save subscription to database
      if (userId) {
        const { error } = await supabase.from("push_subscriptions").upsert({
          user_id: userId,
          subscription: subscription.toJSON(),
          created_at: new Date().toISOString(),
        })

        if (error) {
          console.error("[v0] Error saving push subscription:", error)
          throw error
        }
      }

      setPushEnabled(true)
      toast({
        title: currentLanguage === "hi" ? "पुश नोटिफिकेशन सक्षम" : "Push notifications enabled",
        description:
          currentLanguage === "hi" ? "आपको अब रियल-टाइम अलर्ट मिलेंगे।" : "You will now receive real-time alerts.",
      })
    } catch (error) {
      console.error("[v0] Push notification setup failed:", error)
      toast({
        title: "Setup failed",
        description: "Could not enable push notifications. Please try again.",
        variant: "destructive",
      })
    }
  }

  const sendPushNotification = async (notification: RealTimeNotification) => {
    if (!serviceWorkerRef.current) return

    try {
      await fetch("/api/notifications/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          notification: {
            title: notification.title,
            body: notification.message,
            icon: "/icon-192x192.png",
            badge: "/badge-72x72.png",
            tag: notification.id,
            data: {
              notificationId: notification.id,
              type: notification.type,
              priority: notification.priority,
            },
          },
        }),
      })
    } catch (error) {
      console.error("[v0] Push notification send failed:", error)
    }
  }

  // Update unread count
  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.isRead).length)
  }, [notifications])

  const playNotificationSound = (priority: string) => {
    if (!soundEnabled) return

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      const frequencies = {
        low: 400,
        medium: 600,
        high: 800,
        critical: 1000,
      }

      oscillator.frequency.setValueAtTime(
        frequencies[priority as keyof typeof frequencies] || 600,
        audioContext.currentTime,
      )
      oscillator.type = "sine"
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)

      oscillator.start()
      oscillator.stop(audioContext.currentTime + (priority === "critical" ? 0.5 : 0.2))
    } catch (error) {
      console.error("[v0] Audio playback failed:", error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await supabase.from("notifications").update({ is_read: true }).eq("id", id)

      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    } catch (error) {
      console.error("[v0] Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      if (userId) {
        await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false)
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch (error) {
      console.error("[v0] Error marking all notifications as read:", error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await supabase.from("notifications").delete().eq("id", id)

      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch (error) {
      console.error("[v0] Error deleting notification:", error)
    }
  }

  const getNotificationIcon = (type: RealTimeNotification["type"]) => {
    switch (type) {
      case "emergency":
        return <AlertTriangle className="h-4 w-4" />
      case "weather":
        return <CloudRain className="h-4 w-4" />
      case "traffic":
        return <Car className="h-4 w-4" />
      case "safety":
        return <Shield className="h-4 w-4" />
      case "geofence":
        return <MapPin className="h-4 w-4" />
      case "system":
        return <Settings className="h-4 w-4" />
      case "push":
        return <Smartphone className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: RealTimeNotification["priority"]) => {
    switch (priority) {
      case "critical":
        return "text-red-500 bg-red-500/10 border-red-500/20"
      case "high":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20"
      case "medium":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
      case "low":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20"
      default:
        return "text-gray-500 bg-gray-500/10 border-gray-500/20"
    }
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true
    if (filter === "unread") return !n.isRead
    return n.type === filter
  })

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  return (
    <>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative glassmorphism bg-card/50 border-border/50 hover:bg-card/70"
      >
        <div className="relative">
          <Bell className="h-5 w-5" />
          {!isOnline && <WifiOff className="absolute -top-1 -right-1 h-3 w-3 text-red-500" />}
        </div>
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs animate-pulse-glow">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute top-12 right-0 w-96 max-h-[600px] glassmorphism bg-card/95 border-border/50 shadow-2xl z-50">
          <CardHeader className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                {currentLanguage === "hi" ? "सूचनाएं" : "Notifications"}
                {!isOnline && (
                  <Badge variant="destructive" className="text-xs">
                    {currentLanguage === "hi" ? "ऑफलाइन" : "Offline"}
                  </Badge>
                )}
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} {currentLanguage === "hi" ? "नई" : "new"}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="h-8 w-8 p-0"
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={pushEnabled ? () => setPushEnabled(false) : enablePushNotifications}
                  className="h-8 w-8 p-0"
                >
                  <Smartphone className={`h-4 w-4 ${pushEnabled ? "text-green-500" : "text-muted-foreground"}`} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-2 text-xs">
              {isOnline ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Wifi className="h-3 w-3" />
                  <span>{currentLanguage === "hi" ? "रियल-टाइम कनेक्टेड" : "Real-time connected"}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <WifiOff className="h-3 w-3" />
                  <span>{currentLanguage === "hi" ? "कनेक्शन नहीं" : "No connection"}</span>
                </div>
              )}
              {pushEnabled && (
                <div className="flex items-center gap-1 text-blue-600">
                  <Smartphone className="h-3 w-3" />
                  <span>{currentLanguage === "hi" ? "पुश सक्षम" : "Push enabled"}</span>
                </div>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 mt-3">
              {["all", "unread", "emergency", "weather", "traffic", "safety"].map((filterType) => (
                <Button
                  key={filterType}
                  variant={filter === filterType ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(filterType)}
                  className="text-xs h-7"
                >
                  {filterType === "all" && (currentLanguage === "hi" ? "सभी" : "All")}
                  {filterType === "unread" && (currentLanguage === "hi" ? "अपठित" : "Unread")}
                  {filterType === "emergency" && (currentLanguage === "hi" ? "आपातकाल" : "Emergency")}
                  {filterType === "weather" && (currentLanguage === "hi" ? "मौसम" : "Weather")}
                  {filterType === "traffic" && (currentLanguage === "hi" ? "यातायात" : "Traffic")}
                  {filterType === "safety" && (currentLanguage === "hi" ? "सुरक्षा" : "Safety")}
                </Button>
              ))}
            </div>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="mt-2 text-xs glassmorphism bg-card/50 border-border/50"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                {currentLanguage === "hi" ? "सभी को पढ़ा हुआ चिह्नित करें" : "Mark all as read"}
              </Button>
            )}
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{currentLanguage === "hi" ? "कोई सूचना नहीं" : "No notifications"}</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-muted/30 transition-colors cursor-pointer group ${
                        !notification.isRead ? "bg-primary/5 border-l-4 border-l-primary" : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getPriorityColor(notification.priority)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-semibold text-foreground truncate">{notification.title}</h4>
                            <div className="flex items-center gap-2">
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteNotification(notification.id)
                                }}
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{notification.message}</p>

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(notification.timestamp)}
                            </div>
                            {notification.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate max-w-20">{notification.location}</span>
                              </div>
                            )}
                          </div>

                          {notification.actionRequired && (
                            <Button
                              size="sm"
                              className="mt-2 h-7 text-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                onEmergencyAction("view_details", notification)
                              }}
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              {currentLanguage === "hi" ? "कार्रवाई आवश्यक" : "Action Required"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </>
  )
}
