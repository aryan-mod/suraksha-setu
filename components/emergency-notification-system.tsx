"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
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
} from "lucide-react"

interface EmergencyNotification {
  id: string
  type: "emergency" | "weather" | "traffic" | "safety" | "geofence" | "system"
  title: string
  message: string
  timestamp: Date
  priority: "low" | "medium" | "high" | "critical"
  isRead: boolean
  location?: string
  actionRequired?: boolean
  expiresAt?: Date
}

interface EmergencyNotificationSystemProps {
  currentLanguage: string
  onEmergencyAction: (action: string, data: any) => void
}

export function EmergencyNotificationSystem({ currentLanguage, onEmergencyAction }: EmergencyNotificationSystemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<EmergencyNotification[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly generate notifications for demo
      if (Math.random() < 0.3) {
        generateRandomNotification()
      }
    }, 15000)

    // Initial notifications
    generateInitialNotifications()

    return () => clearInterval(interval)
  }, [currentLanguage])

  // Update unread count
  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.isRead).length)
  }, [notifications])

  const generateInitialNotifications = () => {
    const initialNotifications: EmergencyNotification[] = [
      {
        id: "1",
        type: "safety",
        title: currentLanguage === "hi" ? "उच्च सुरक्षा क्षेत्र" : "High Safety Zone",
        message:
          currentLanguage === "hi"
            ? "आप एक सुरक्षित क्षेत्र में प्रवेश कर गए हैं। 24/7 निगरानी सक्रिय है।"
            : "You've entered a high safety zone. 24/7 surveillance is active.",
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        priority: "medium",
        isRead: false,
        location: "Gateway of India, Mumbai",
      },
      {
        id: "2",
        type: "weather",
        title: currentLanguage === "hi" ? "मौसम चेतावनी" : "Weather Alert",
        message:
          currentLanguage === "hi"
            ? "अगले 2 घंटों में हल्की बारिश की संभावना। छाता ले जाना सुनिश्चित करें।"
            : "Light rain expected in next 2 hours. Make sure to carry an umbrella.",
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        priority: "low",
        isRead: true,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      },
      {
        id: "3",
        type: "emergency",
        title: currentLanguage === "hi" ? "आपातकालीन संपर्क अपडेट" : "Emergency Contact Updated",
        message:
          currentLanguage === "hi"
            ? "आपका आपातकालीन संपर्क सफलतापूर्वक अपडेट हो गया है।"
            : "Your emergency contact has been successfully updated.",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        priority: "high",
        isRead: false,
        actionRequired: true,
      },
    ]
    setNotifications(initialNotifications)
  }

  const generateRandomNotification = () => {
    const types: EmergencyNotification["type"][] = ["weather", "traffic", "safety", "geofence", "system"]
    const type = types[Math.floor(Math.random() * types.length)]

    const notificationTemplates = {
      weather: {
        en: {
          title: "Weather Update",
          message: "Temperature rising to 32°C. Stay hydrated and seek shade when possible.",
        },
        hi: {
          title: "मौसम अपडेट",
          message: "तापमान 32°C तक बढ़ रहा है। हाइड्रेटेड रहें और जब संभव हो तो छाया की तलाश करें।",
        },
      },
      traffic: {
        en: {
          title: "Traffic Alert",
          message: "Heavy traffic detected on Marine Drive. Consider alternate routes.",
        },
        hi: {
          title: "यातायात चेतावनी",
          message: "मरीन ड्राइव पर भारी यातायात का पता चला। वैकल्पिक मार्गों पर विचार करें।",
        },
      },
      safety: {
        en: {
          title: "Safety Reminder",
          message: "Keep your belongings secure in crowded areas. Tourist police nearby.",
        },
        hi: {
          title: "सुरक्षा अनुस्मारक",
          message: "भीड़भाड़ वाले इलाकों में अपना सामान सुरक्षित रखें। पर्यटक पुलिस पास में है।",
        },
      },
      geofence: {
        en: {
          title: "Area Notification",
          message: "You're approaching a restricted area. Please maintain safe distance.",
        },
        hi: {
          title: "क्षेत्र अधिसूचना",
          message: "आप एक प्रतिबंधित क्षेत्र के पास पहुंच रहे हैं। कृपया सुरक्षित दूरी बनाए रखें।",
        },
      },
      system: {
        en: {
          title: "System Update",
          message: "SafeTour app updated with new safety features. Restart recommended.",
        },
        hi: {
          title: "सिस्टम अपडेट",
          message: "SafeTour ऐप नई सुरक्षा सुविधाओं के साथ अपडेट हुआ। पुनः आरंभ की सिफारिश की गई।",
        },
      },
    }

    const template =
      notificationTemplates[type][currentLanguage as keyof (typeof notificationTemplates)[typeof type]] ||
      notificationTemplates[type].en

    const newNotification: EmergencyNotification = {
      id: Date.now().toString(),
      type,
      title: template.title,
      message: template.message,
      timestamp: new Date(),
      priority: Math.random() > 0.7 ? "high" : Math.random() > 0.4 ? "medium" : "low",
      isRead: false,
      location: "Current Location",
    }

    setNotifications((prev) => [newNotification, ...prev])

    if (soundEnabled) {
      playNotificationSound(newNotification.priority)
    }
  }

  const playNotificationSound = (priority: string) => {
    // Simulate notification sound based on priority
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Different frequencies for different priorities
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
    oscillator.stop(audioContext.currentTime + 0.2)
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const getNotificationIcon = (type: EmergencyNotification["type"]) => {
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
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: EmergencyNotification["priority"]) => {
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
        <Bell className="h-5 w-5" />
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
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
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
                      className={`p-4 hover:bg-muted/30 transition-colors cursor-pointer ${
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
