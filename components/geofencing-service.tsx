"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, MapPin, AlertTriangle, CheckCircle, Navigation, Clock, Zap } from "lucide-react"

interface GeofenceZone {
  id: string
  name: string
  latitude: number
  longitude: number
  radius: number
  type: "safe" | "caution" | "restricted" | "emergency"
  description: string
  alertMessage?: string
  emergencyContacts?: string[]
}

interface GeofenceEvent {
  id: string
  zoneId: string
  zoneName: string
  eventType: "enter" | "exit"
  timestamp: number
  location: {
    latitude: number
    longitude: number
  }
}

interface GeofencingServiceProps {
  currentLocation?: {
    latitude: number
    longitude: number
  }
  onZoneEnter?: (zone: GeofenceZone, event: GeofenceEvent) => void
  onZoneExit?: (zone: GeofenceZone, event: GeofenceEvent) => void
  onEmergencyZoneAlert?: (zone: GeofenceZone) => void
}

// Enhanced geofence zones with more detailed information
const geofenceZones: GeofenceZone[] = [
  {
    id: "safe-001",
    name: "Gateway of India",
    latitude: 18.922,
    longitude: 72.8347,
    radius: 500,
    type: "safe",
    description: "Major tourist attraction with 24/7 security presence and CCTV monitoring",
    alertMessage: "Welcome to Gateway of India - a verified safe zone",
  },
  {
    id: "safe-002",
    name: "Marine Drive Promenade",
    latitude: 18.9434,
    longitude: 72.8234,
    radius: 800,
    type: "safe",
    description: "Well-lit waterfront promenade with regular police patrols",
    alertMessage: "You're now in the Marine Drive safe zone",
  },
  {
    id: "caution-001",
    name: "Crawford Market Area",
    latitude: 18.9467,
    longitude: 72.8342,
    radius: 300,
    type: "caution",
    description: "Busy market area - stay alert for pickpockets and crowded conditions",
    alertMessage: "Entering Crawford Market - please stay alert and keep belongings secure",
  },
  {
    id: "restricted-001",
    name: "Dharavi Slum Area",
    latitude: 19.0376,
    longitude: 72.8562,
    radius: 1000,
    type: "restricted",
    description: "High-risk area not recommended for tourists, especially after dark",
    alertMessage: "WARNING: You are approaching a restricted area. Consider alternate routes.",
    emergencyContacts: ["Mumbai Police: 100", "Tourist Helpline: 1363"],
  },
  {
    id: "emergency-001",
    name: "Mumbai Police Station - Colaba",
    latitude: 18.9067,
    longitude: 72.8147,
    radius: 100,
    type: "emergency",
    description: "Police station and emergency services hub",
    alertMessage: "You are near Colaba Police Station - emergency services available",
  },
]

export function GeofencingService({
  currentLocation,
  onZoneEnter,
  onZoneExit,
  onEmergencyZoneAlert,
}: GeofencingServiceProps) {
  const [activeZones, setActiveZones] = useState<GeofenceZone[]>([])
  const [recentEvents, setRecentEvents] = useState<GeofenceEvent[]>([])
  const [nearbyZones, setNearbyZones] = useState<GeofenceZone[]>([])
  const [isMonitoring, setIsMonitoring] = useState(true)

  // Calculate distance between two coordinates
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }, [])

  // Check geofence boundaries
  const checkGeofences = useCallback(
    (location: { latitude: number; longitude: number }) => {
      if (!isMonitoring) return

      const currentActiveZones: GeofenceZone[] = []
      const currentNearbyZones: GeofenceZone[] = []

      geofenceZones.forEach((zone) => {
        const distance = calculateDistance(location.latitude, location.longitude, zone.latitude, zone.longitude)

        const wasActive = activeZones.some((activeZone) => activeZone.id === zone.id)
        const isNowActive = distance <= zone.radius

        if (isNowActive) {
          currentActiveZones.push(zone)

          // Zone entry event
          if (!wasActive) {
            const event: GeofenceEvent = {
              id: `event-${Date.now()}-${zone.id}`,
              zoneId: zone.id,
              zoneName: zone.name,
              eventType: "enter",
              timestamp: Date.now(),
              location: location,
            }

            setRecentEvents((prev) => [event, ...prev.slice(0, 9)]) // Keep last 10 events
            onZoneEnter?.(zone, event)

            // Special handling for emergency/restricted zones
            if (zone.type === "restricted" || zone.type === "emergency") {
              onEmergencyZoneAlert?.(zone)
            }
          }
        } else if (wasActive) {
          // Zone exit event
          const event: GeofenceEvent = {
            id: `event-${Date.now()}-${zone.id}`,
            zoneId: zone.id,
            zoneName: zone.name,
            eventType: "exit",
            timestamp: Date.now(),
            location: location,
          }

          setRecentEvents((prev) => [event, ...prev.slice(0, 9)])
          onZoneExit?.(zone, event)
        }

        // Track nearby zones (within 2x radius)
        if (distance <= zone.radius * 2 && !isNowActive) {
          currentNearbyZones.push({
            ...zone,
            distance: Math.round(distance),
          } as any)
        }
      })

      setActiveZones(currentActiveZones)
      setNearbyZones(currentNearbyZones)
    },
    [activeZones, calculateDistance, isMonitoring, onZoneEnter, onZoneExit, onEmergencyZoneAlert],
  )

  // Monitor location changes
  useEffect(() => {
    if (currentLocation) {
      checkGeofences(currentLocation)
    }
  }, [currentLocation, checkGeofences])

  const getZoneIcon = (type: string) => {
    switch (type) {
      case "safe":
        return <Shield className="h-4 w-4 text-green-600" />
      case "caution":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "restricted":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "emergency":
        return <Zap className="h-4 w-4 text-blue-600" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const getZoneColor = (type: string) => {
    switch (type) {
      case "safe":
        return "bg-green-500/10 border-green-500/20 text-green-700"
      case "caution":
        return "bg-yellow-500/10 border-yellow-500/20 text-yellow-700"
      case "restricted":
        return "bg-red-500/10 border-red-500/20 text-red-700"
      case "emergency":
        return "bg-blue-500/10 border-blue-500/20 text-blue-700"
      default:
        return "bg-muted/10 border-border/20"
    }
  }

  const formatEventTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  return (
    <Card className="glassmorphism bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <Navigation className="h-5 w-5 text-primary" />
          Geofencing Monitor
          <Badge
            className={`ml-auto ${isMonitoring ? "bg-secondary/20 text-secondary" : "bg-muted/50 text-muted-foreground"}`}
          >
            {isMonitoring ? "Active" : "Paused"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Monitoring Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Geofence Monitoring</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
            className="glassmorphism bg-card/50 border-border/50"
          >
            {isMonitoring ? "Pause" : "Resume"}
          </Button>
        </div>

        {/* Active Zones */}
        {activeZones.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-secondary" />
              Current Zones ({activeZones.length})
            </h4>
            <div className="space-y-2">
              {activeZones.map((zone) => (
                <Alert key={zone.id} className={`border ${getZoneColor(zone.type)}`}>
                  <div className="flex items-start gap-3">
                    {getZoneIcon(zone.type)}
                    <div className="flex-1">
                      <div className="font-semibold">{zone.name}</div>
                      <AlertDescription className="mt-1">{zone.alertMessage || zone.description}</AlertDescription>
                      {zone.emergencyContacts && (
                        <div className="mt-2 text-xs">
                          <strong>Emergency Contacts:</strong>
                          <div>{zone.emergencyContacts.join(" • ")}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Nearby Zones */}
        {nearbyZones.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Nearby Zones ({nearbyZones.length})
            </h4>
            <div className="space-y-2">
              {nearbyZones.map((zone) => (
                <div key={zone.id} className="p-3 glassmorphism bg-card/30 border-border/50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {getZoneIcon(zone.type)}
                      <span className="font-medium">{zone.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {(zone as any).distance}m away
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{zone.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Events */}
        {recentEvents.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              Recent Activity
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recentEvents.map((event) => (
                <div key={event.id} className="p-2 glassmorphism bg-card/20 border-border/30 rounded text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {event.eventType === "enter" ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <Navigation className="h-3 w-3 text-blue-600" />
                      )}
                      <span>
                        {event.eventType === "enter" ? "Entered" : "Exited"} {event.zoneName}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatEventTime(event.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Summary */}
        <div className="grid grid-cols-3 gap-2 text-xs text-center">
          <div className="p-2 glassmorphism bg-secondary/10 border-secondary/20 rounded">
            <div className="font-semibold text-secondary">{activeZones.length}</div>
            <div className="text-muted-foreground">Active Zones</div>
          </div>
          <div className="p-2 glassmorphism bg-primary/10 border-primary/20 rounded">
            <div className="font-semibold text-primary">{nearbyZones.length}</div>
            <div className="text-muted-foreground">Nearby Zones</div>
          </div>
          <div className="p-2 glassmorphism bg-accent/10 border-accent/20 rounded">
            <div className="font-semibold text-accent">{recentEvents.length}</div>
            <div className="text-muted-foreground">Recent Events</div>
          </div>
        </div>

        {/* No location warning */}
        {!currentLocation && (
          <Alert className="border-yellow-500/50 bg-yellow-500/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Location data not available. Enable location services to use geofencing features.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
