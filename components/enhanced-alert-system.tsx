"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, Info, X, MapPin, Clock, Bell, BellOff } from "lucide-react"

interface Alert {
  id: string
  type: "success" | "warning" | "danger" | "info"
  title: string
  message: string
  location?: string
  timestamp: string
  isRead: boolean
  priority: "low" | "medium" | "high" | "critical"
}

interface EnhancedAlertSystemProps {
  alerts: Alert[]
  onMarkAsRead?: (id: string) => void
  onDismiss?: (id: string) => void
  showNotifications?: boolean
}

export function EnhancedAlertSystem({
  alerts,
  onMarkAsRead,
  onDismiss,
  showNotifications = true,
}: EnhancedAlertSystemProps) {
  const [visibleAlerts, setVisibleAlerts] = useState<Alert[]>([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  useEffect(() => {
    if (showNotifications) {
      setVisibleAlerts(alerts.filter((alert) => !alert.isRead))
    } else {
      setVisibleAlerts(alerts)
    }
  }, [alerts, showNotifications])

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5" />
      case "warning":
        return <AlertTriangle className="h-5 w-5" />
      case "danger":
        return <AlertTriangle className="h-5 w-5" />
      case "info":
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const getAlertStyles = (type: string, priority: string) => {
    const baseStyles = "glassmorphism border-l-4 animate-slide-in-right"

    const typeStyles = {
      success: "border-l-secondary bg-secondary/10 text-secondary-foreground",
      warning: "border-l-yellow-500 bg-yellow-500/10 text-yellow-600",
      danger: "border-l-destructive bg-destructive/10 text-destructive-foreground",
      info: "border-l-primary bg-primary/10 text-primary-foreground",
    }

    const priorityStyles = {
      critical: "animate-pulse-glow",
      high: "shadow-lg",
      medium: "",
      low: "opacity-90",
    }

    return `${baseStyles} ${typeStyles[type as keyof typeof typeStyles]} ${priorityStyles[priority as keyof typeof priorityStyles]}`
  }

  const getPriorityBadge = (priority: string) => {
    const styles = {
      critical: "bg-destructive text-destructive-foreground animate-pulse",
      high: "bg-yellow-500 text-yellow-50",
      medium: "bg-primary text-primary-foreground",
      low: "bg-muted text-muted-foreground",
    }

    return <Badge className={styles[priority as keyof typeof styles]}>{priority.toUpperCase()}</Badge>
  }

  const handleDismiss = (id: string) => {
    setVisibleAlerts((prev) => prev.filter((alert) => alert.id !== id))
    onDismiss?.(id)
  }

  const handleMarkAsRead = (id: string) => {
    setVisibleAlerts((prev) => prev.map((alert) => (alert.id === id ? { ...alert, isRead: true } : alert)))
    onMarkAsRead?.(id)
  }

  if (visibleAlerts.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 text-secondary mx-auto mb-3" />
        <p className="text-muted-foreground">No active alerts</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Alert Controls */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Safety Alerts ({visibleAlerts.length})</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          className="glassmorphism"
        >
          {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        </Button>
      </div>

      {/* Scrolling Ticker for High Priority Alerts */}
      {visibleAlerts.some((alert) => alert.priority === "critical" || alert.priority === "high") && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-2 overflow-hidden">
          <div className="animate-ticker flex gap-8 whitespace-nowrap">
            {visibleAlerts
              .filter((alert) => alert.priority === "critical" || alert.priority === "high")
              .map((alert, index) => (
                <div key={`${alert.id}-${index}`} className="flex items-center gap-2 text-sm">
                  {getAlertIcon(alert.type)}
                  <span className="font-medium">{alert.title}</span>
                  <span className="text-muted-foreground">•</span>
                  <span>{alert.message}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Alert List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {visibleAlerts.map((alert) => (
          <Card key={alert.id} className={getAlertStyles(alert.type, alert.priority)}>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5">{getAlertIcon(alert.type)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{alert.title}</h4>
                      {getPriorityBadge(alert.priority)}
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {alert.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{alert.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{alert.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {!alert.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(alert.id)}
                      className="h-8 w-8 p-0"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleDismiss(alert.id)} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
