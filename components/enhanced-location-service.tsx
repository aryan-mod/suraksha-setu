"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/components/language-provider"
import {
  MapPin,
  Navigation,
  Crosshair,
  AlertTriangle,
  CheckCircle,
  Satellite,
  Route,
  Clock,
  Wifi,
  WifiOff,
  Database,
  TrendingUp,
} from "lucide-react"

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  altitude?: number
  heading?: number
  speed?: number
  timestamp: number
}

interface SafeZone {
  id: string
  name: string
  latitude: number
  longitude: number
  radius: number // in meters
  status: "safe" | "caution" | "restricted"
  description: string
  zone_type?: string
  distance_meters?: number
  is_inside?: boolean
}

interface LocationServiceProps {
  userId?: string
  onLocationUpdate?: (location: LocationData) => void
  onSafeZoneEnter?: (zone: SafeZone) => void
  onSafeZoneExit?: (zone: SafeZone) => void
  enableGeofencing?: boolean
  enableDatabaseStorage?: boolean
  trackingInterval?: number
}

export function EnhancedLocationService({
  userId,
  onLocationUpdate,
  onSafeZoneEnter,
  onSafeZoneExit,
  enableGeofencing = true,
  enableDatabaseStorage = true,
  trackingInterval = 10000,
}: LocationServiceProps) {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<"granted" | "denied" | "prompt" | "unknown">("unknown")
  const [watchId, setWatchId] = useState<number | null>(null)
  const [nearbyZones, setNearbyZones] = useState<SafeZone[]>([])
  const [currentZone, setCurrentZone] = useState<SafeZone | null>(null)
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([])
  const [isHighAccuracy, setIsHighAccuracy] = useState(true)
  const [safeZones, setSafeZones] = useState<SafeZone[]>([])
  const [locationStats, setLocationStats] = useState<any>(null)
  const [isStoringToDatabase, setIsStoringToDatabase] = useState(false)

  const { translate } = useLanguage()

  const supabase = createClient()

  // Load safe zones from database
  const loadSafeZones = useCallback(async () => {
    if (!userId) return

    try {
      const response = await fetch(`/api/location/track?userId=${userId}`)
      const result = await response.json()

      if (result.success && result.safeZones) {
        setSafeZones(result.safeZones)
      }
    } catch (error) {
      console.error("[v0] Error loading safe zones:", error)
    }
  }, [userId])

  // Store location to database
  const storeLocationToDatabase = useCallback(
    async (location: LocationData, zoneInfo?: { zone: SafeZone | null; nearbyZones: SafeZone[] }) => {
      if (!enableDatabaseStorage || !userId) return

      setIsStoringToDatabase(true)

      try {
        const locationData = {
          userId,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          altitude: location.altitude,
          heading: location.heading,
          speed: location.speed,
          timestamp: location.timestamp,
          locationName: zoneInfo?.zone?.name,
          safeZoneId: zoneInfo?.zone?.id,
          safeZoneStatus: zoneInfo?.zone?.status,
          metadata: {
            nearbyZonesCount: zoneInfo?.nearbyZones?.length || 0,
            trackingMode: isHighAccuracy ? "high_accuracy" : "standard",
          },
        }

        const response = await fetch("/api/location/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(locationData),
        })

        const result = await response.json()

        if (result.success && result.nearbyZones) {
          setNearbyZones(result.nearbyZones.filter((zone: SafeZone) => !zone.is_inside))

          const insideZone = result.nearbyZones.find((zone: SafeZone) => zone.is_inside)
          if (insideZone && currentZone?.id !== insideZone.id) {
            setCurrentZone(insideZone)
            onSafeZoneEnter?.(insideZone)
          } else if (!insideZone && currentZone) {
            onSafeZoneExit?.(currentZone)
            setCurrentZone(null)
          }
        }
      } catch (error) {
        console.error("[v0] Error storing location to database:", error)
      } finally {
        setIsStoringToDatabase(false)
      }
    },
    [enableDatabaseStorage, userId, isHighAccuracy, currentZone, onSafeZoneEnter, onSafeZoneExit],
  )

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

  // Check if location is within safe zones (fallback for offline mode)
  const checkSafeZones = useCallback(
    (location: LocationData) => {
      const nearby: SafeZone[] = []
      let currentZoneFound: SafeZone | null = null

      safeZones.forEach((zone) => {
        const distance = calculateDistance(location.latitude, location.longitude, zone.latitude, zone.longitude)

        if (distance <= zone.radius) {
          currentZoneFound = zone
          if (currentZone?.id !== zone.id) {
            onSafeZoneEnter?.(zone)
          }
        } else if (distance <= zone.radius * 2) {
          nearby.push(zone)
        }
      })

      // Check if we left a zone
      if (currentZone && !currentZoneFound) {
        onSafeZoneExit?.(currentZone)
      }

      setCurrentZone(currentZoneFound)
      setNearbyZones(nearby)

      return { zone: currentZoneFound, nearbyZones: nearby }
    },
    [safeZones, currentZone, calculateDistance, onSafeZoneEnter, onSafeZoneExit],
  )

  // Request location permission
  const requestLocationPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser")
      return false
    }

    try {
      // Check current permission status
      if ("permissions" in navigator) {
        const permission = await navigator.permissions.query({ name: "geolocation" })
        setPermissionStatus(permission.state)

        if (permission.state === "denied") {
          setLocationError("Location permission denied. Please enable location access in browser settings.")
          return false
        }
      }

      return true
    } catch (error) {
      console.error("Error checking location permission:", error)
      return true // Fallback to trying anyway
    }
  }, [])

  // Get current location
  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"))
        return
      }

      const options: PositionOptions = {
        enableHighAccuracy: isHighAccuracy,
        timeout: 15000,
        maximumAge: 60000,
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: position.timestamp,
          }
          resolve(locationData)
        },
        (error) => {
          let errorMessage = "Failed to get location"
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied"
              setPermissionStatus("denied")
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable"
              break
            case error.TIMEOUT:
              errorMessage = "Location request timed out"
              break
          }
          reject(new Error(errorMessage))
        },
        options,
      )
    })
  }, [isHighAccuracy])

  // Start location tracking
  const startTracking = useCallback(async () => {
    const hasPermission = await requestLocationPermission()
    if (!hasPermission) return

    setLocationError(null)
    setIsTracking(true)

    const options: PositionOptions = {
      enableHighAccuracy: isHighAccuracy,
      timeout: 15000,
      maximumAge: 5000,
    }

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
          timestamp: position.timestamp,
        }

        setCurrentLocation(locationData)
        setLocationHistory((prev) => [...prev.slice(-49), locationData]) // Keep last 50 locations
        onLocationUpdate?.(locationData)

        let zoneInfo = null
        if (enableGeofencing) {
          zoneInfo = checkSafeZones(locationData)
        }

        if (enableDatabaseStorage) {
          await storeLocationToDatabase(locationData, zoneInfo)
        }

        setLocationError(null)
      },
      (error) => {
        let errorMessage = "Location tracking failed"
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied"
            setPermissionStatus("denied")
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location unavailable"
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out"
            break
        }
        setLocationError(errorMessage)
      },
      options,
    )

    setWatchId(id)
  }, [
    requestLocationPermission,
    isHighAccuracy,
    onLocationUpdate,
    enableGeofencing,
    enableDatabaseStorage,
    checkSafeZones,
    storeLocationToDatabase,
  ])

  // Stop location tracking
  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
    setIsTracking(false)
  }, [watchId])

  // Get single location update
  const getLocationOnce = useCallback(async () => {
    const hasPermission = await requestLocationPermission()
    if (!hasPermission) return

    setLocationError(null)

    try {
      const location = await getCurrentLocation()
      if (location) {
        setCurrentLocation(location)
        onLocationUpdate?.(location)

        let zoneInfo = null
        if (enableGeofencing) {
          zoneInfo = checkSafeZones(location)
        }

        if (enableDatabaseStorage) {
          await storeLocationToDatabase(location, zoneInfo)
        }
      }
    } catch (error) {
      setLocationError((error as Error).message)
    }
  }, [
    requestLocationPermission,
    getCurrentLocation,
    onLocationUpdate,
    enableGeofencing,
    enableDatabaseStorage,
    checkSafeZones,
    storeLocationToDatabase,
  ])

  // Share location (copy coordinates to clipboard)
  const shareLocation = useCallback(async () => {
    if (!currentLocation) return

    const locationText = `My location: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`
    const mapsUrl = `https://maps.google.com/?q=${currentLocation.latitude},${currentLocation.longitude}`

    try {
      if (navigator.share && navigator.canShare) {
        const shareData = {
          title: "My Current Location",
          text: locationText,
          url: mapsUrl,
        }

        // Check if the data can be shared
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData)
          return
        }
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(`${locationText}\n${mapsUrl}`)
        // Show success feedback (you could add a toast here)
        console.log("[v0] Location copied to clipboard")
      } else {
        const textArea = document.createElement("textarea")
        textArea.value = `${locationText}\n${mapsUrl}`
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
        console.log("[v0] Location copied using fallback method")
      }
    } catch (error) {
      console.error("[v0] Error sharing location:", error)
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(`${locationText}\n${mapsUrl}`)
          console.log("[v0] Location copied to clipboard as fallback")
        }
      } catch (clipboardError) {
        console.error("[v0] Clipboard fallback also failed:", clipboardError)
      }
    }
  }, [currentLocation])

  // Load location statistics
  const loadLocationStats = useCallback(async () => {
    if (!userId || !enableDatabaseStorage) return

    try {
      const { data, error } = await supabase.rpc("get_location_stats", {
        user_id_param: userId,
        days_back: 7,
      })

      if (error) {
        console.error("[v0] Error loading location stats:", error)
        return
      }

      if (data && data.length > 0) {
        setLocationStats(data[0])
      }
    } catch (error) {
      console.error("[v0] Error loading location stats:", error)
    }
  }, [userId, enableDatabaseStorage, supabase])

  // Initialize component
  useEffect(() => {
    if (userId) {
      loadSafeZones()
      loadLocationStats()
    }
  }, [userId, loadSafeZones, loadLocationStats])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [watchId])

  const formatCoordinate = (coord: number) => coord.toFixed(6)
  const formatAccuracy = (accuracy: number) =>
    accuracy < 1000 ? `${Math.round(accuracy)}m` : `${(accuracy / 1000).toFixed(1)}km`

  return (
    <Card className="glassmorphism bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <Satellite className="h-5 w-5 text-primary" />
          {translate("location.enhancedService")}
          <div className="flex items-center gap-2 ml-auto">
            {enableDatabaseStorage && (
              <Badge
                className={`${isStoringToDatabase ? "bg-blue-500/20 text-blue-600 animate-pulse" : "bg-secondary/20 text-secondary"}`}
              >
                <Database className="h-3 w-3 mr-1" />
                {isStoringToDatabase ? translate("common.syncing") : translate("common.database")}
              </Badge>
            )}
            <Badge className={`${isTracking ? "bg-secondary/20 text-secondary" : "bg-muted/50 text-muted-foreground"}`}>
              {isTracking ? translate("status.active") : translate("status.inactive")}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Permission Status */}
        {permissionStatus === "denied" && (
          <Alert className="border-destructive/50 bg-destructive/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{translate("location.permissionDenied")}</AlertDescription>
          </Alert>
        )}

        {/* Location Error */}
        {locationError && (
          <Alert className="border-yellow-500/50 bg-yellow-500/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{locationError}</AlertDescription>
          </Alert>
        )}

        {/* Location Statistics */}
        {locationStats && enableDatabaseStorage && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 glassmorphism bg-primary/10 border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">{translate("location.weeklyStats")}</span>
              </div>
              <div className="text-xs">
                <div>
                  {locationStats.total_locations} {translate("location.locationsTracked")}
                </div>
                <div>
                  {locationStats.distance_traveled_km?.toFixed(1)}km {translate("location.traveled")}
                </div>
              </div>
            </div>

            <div className="p-3 glassmorphism bg-secondary/10 border-secondary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-secondary" />
                <span className="text-sm font-semibold">{translate("location.zoneVisits")}</span>
              </div>
              <div className="text-xs">
                <div>
                  {locationStats.safe_zone_visits} {translate("safety.safe")} {translate("safety.zone")}
                </div>
                <div>
                  {locationStats.caution_zone_visits} {translate("safety.caution")} {translate("safety.zone")}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Current Location Info */}
        {currentLocation && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 glassmorphism bg-primary/10 border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">{translate("location.coordinates")}</span>
                </div>
                <div className="text-xs font-mono">
                  <div>{formatCoordinate(currentLocation.latitude)}°N</div>
                  <div>{formatCoordinate(currentLocation.longitude)}°E</div>
                </div>
              </div>

              <div className="p-3 glassmorphism bg-secondary/10 border-secondary/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Crosshair className="h-4 w-4 text-secondary" />
                  <span className="text-sm font-semibold">{translate("location.accuracy")}</span>
                </div>
                <div className="text-xs">
                  <div>{formatAccuracy(currentLocation.accuracy)}</div>
                  <div className="text-muted-foreground">
                    {currentLocation.accuracy < 10
                      ? translate("location.excellent")
                      : currentLocation.accuracy < 50
                        ? translate("location.good")
                        : currentLocation.accuracy < 100
                          ? translate("location.fair")
                          : translate("location.poor")}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Location Data */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              {currentLocation.altitude && (
                <div className="text-center p-2 glassmorphism bg-card/30 border-border/50 rounded">
                  <div className="font-semibold">{translate("location.altitude")}</div>
                  <div>{Math.round(currentLocation.altitude)}m</div>
                </div>
              )}
              {currentLocation.speed && (
                <div className="text-center p-2 glassmorphism bg-card/30 border-border/50 rounded">
                  <div className="font-semibold">{translate("location.speed")}</div>
                  <div>{(currentLocation.speed * 3.6).toFixed(1)} km/h</div>
                </div>
              )}
              {currentLocation.heading && (
                <div className="text-center p-2 glassmorphism bg-card/30 border-border/50 rounded">
                  <div className="font-semibold">{translate("location.heading")}</div>
                  <div>{Math.round(currentLocation.heading)}°</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Current Safe Zone */}
        {currentZone && (
          <div
            className={`p-4 rounded-lg border ${
              currentZone.status === "safe"
                ? "bg-secondary/10 border-secondary/20"
                : currentZone.status === "caution"
                  ? "bg-yellow-500/10 border-yellow-500/20"
                  : "bg-destructive/10 border-destructive/20"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle
                className={`h-4 w-4 ${
                  currentZone.status === "safe"
                    ? "text-secondary"
                    : currentZone.status === "caution"
                      ? "text-yellow-600"
                      : "text-destructive"
                }`}
              />
              <span className="font-semibold">
                {translate("location.currentZone")}: {currentZone.name}
              </span>
              {currentZone.distance_meters !== undefined && (
                <Badge variant="outline" className="text-xs">
                  {currentZone.distance_meters < 1000
                    ? `${Math.round(currentZone.distance_meters)}m`
                    : `${(currentZone.distance_meters / 1000).toFixed(1)}km`}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{currentZone.description}</p>
          </div>
        )}

        {/* Nearby Zones */}
        {nearbyZones.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              {translate("location.nearbySafeZones")}
            </h4>
            <div className="space-y-2">
              {nearbyZones.map((zone) => (
                <div key={zone.id} className="p-2 glassmorphism bg-card/30 border-border/50 rounded text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{zone.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {zone.status}
                      </Badge>
                      {zone.distance_meters !== undefined && (
                        <Badge variant="outline" className="text-xs">
                          {zone.distance_meters < 1000
                            ? `${Math.round(zone.distance_meters)}m`
                            : `${(zone.distance_meters / 1000).toFixed(1)}km`}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={isTracking ? stopTracking : startTracking}
            className={`flex-1 ${isTracking ? "bg-destructive hover:bg-destructive/90" : "bg-secondary hover:bg-secondary/90"}`}
            disabled={permissionStatus === "denied"}
          >
            {isTracking ? (
              <>
                <WifiOff className="h-4 w-4 mr-2" />
                {translate("location.stopTracking")}
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4 mr-2" />
                {translate("location.startTracking")}
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={getLocationOnce}
            disabled={permissionStatus === "denied"}
            className="glassmorphism bg-card/50 border-border/50"
          >
            <Crosshair className="h-4 w-4 mr-2" />
            {translate("location.getLocation")}
          </Button>

          {currentLocation && (
            <Button variant="outline" onClick={shareLocation} className="glassmorphism bg-card/50 border-border/50">
              <Route className="h-4 w-4 mr-2" />
              {translate("common.share")}
            </Button>
          )}
        </div>

        {/* Settings */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{translate("location.highAccuracyGPS")}</span>
            <Button variant="ghost" size="sm" onClick={() => setIsHighAccuracy(!isHighAccuracy)} className="h-8 px-2">
              <Badge variant={isHighAccuracy ? "default" : "outline"}>
                {isHighAccuracy ? translate("common.on") : translate("common.off")}
              </Badge>
            </Button>
          </div>

          {userId && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{translate("location.databaseStorage")}</span>
              <Badge variant={enableDatabaseStorage ? "default" : "outline"}>
                {enableDatabaseStorage ? translate("common.enabled") : translate("common.disabled")}
              </Badge>
            </div>
          )}
        </div>

        {/* Location History Summary */}
        {locationHistory.length > 0 && (
          <div className="text-xs text-muted-foreground text-center">
            <Clock className="h-3 w-3 inline mr-1" />
            {locationHistory.length} {translate("location.updatesRecorded")}
            {currentLocation && (
              <span className="ml-2">
                {translate("location.lastUpdate")}: {new Date(currentLocation.timestamp).toLocaleTimeString()}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
