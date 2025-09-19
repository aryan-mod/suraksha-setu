"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Navigation, Satellite, Clock, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'

// Dynamically import LeafletMap to avoid SSR issues
const LeafletMap = dynamic(() => import('./leaflet-map'), { 
  ssr: false,
  loading: () => (
    <div className="h-40 bg-muted rounded-lg flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <MapPin className="h-8 w-8 mx-auto mb-2 animate-pulse" />
        <p className="text-sm">Loading Map...</p>
      </div>
    </div>
  )
})

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
  altitude?: number
  heading?: number
  speed?: number
}

interface LiveLocationTrackerProps {
  className?: string
  showMap?: boolean
}

export default function LiveLocationTracker({ className, showMap = true }: LiveLocationTrackerProps) {
  const { t } = useTranslation('common')
  const [location, setLocation] = useState<LocationData | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updateCount, setUpdateCount] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const supabase = createClient()

  // Simulate movement for demo purposes when real location doesn't change
  const simulateMovement = (baseLocation: LocationData): LocationData => {
    const variance = 0.0001 // Small movement simulation
    return {
      ...baseLocation,
      latitude: baseLocation.latitude + (Math.random() - 0.5) * variance,
      longitude: baseLocation.longitude + (Math.random() - 0.5) * variance,
      timestamp: Date.now()
    }
  }

  const getCurrentLocation = () => {
    return new Promise<LocationData>((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        reject(new Error("Geolocation not supported"))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
            altitude: position.coords.altitude || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
          }
          resolve(locationData)
        },
        (error) => {
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    })
  }

  const updateLocation = async () => {
    try {
      let newLocation = await getCurrentLocation()
      
      // If location hasn't changed much, simulate small movement for demo
      if (location && 
          Math.abs(newLocation.latitude - location.latitude) < 0.00001 &&
          Math.abs(newLocation.longitude - location.longitude) < 0.00001) {
        newLocation = simulateMovement(newLocation)
      }

      setLocation(newLocation)
      setUpdateCount(prev => prev + 1)
      setError(null)

      // Save location to Supabase if available and user is authenticated
      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { error } = await supabase
              .from('location_tracking')
              .insert([{
                user_id: user.id,
                latitude: newLocation.latitude,
                longitude: newLocation.longitude,
                accuracy: newLocation.accuracy,
                timestamp: new Date(newLocation.timestamp).toISOString(),
                altitude: newLocation.altitude,
                heading: newLocation.heading,
                speed: newLocation.speed,
              }])
            
            if (error) {
              console.warn('Could not save to Supabase:', error)
            }
          }
        } catch (dbError) {
          console.warn('Database error:', dbError)
        }
      }
      
    } catch (error) {
      setError(error instanceof Error ? error.message : t('location.error'))
    }
  }

  const startTracking = async () => {
    setIsTracking(true)
    setError(null)
    
    // Get initial location
    await updateLocation()
    
    // Use watchPosition for more efficient tracking
    if ("geolocation" in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
            altitude: position.coords.altitude || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
          }

          // Apply simulation if needed for demo
          let newLocation = locationData
          if (location && 
              Math.abs(newLocation.latitude - location.latitude) < 0.00001 &&
              Math.abs(newLocation.longitude - location.longitude) < 0.00001) {
            newLocation = simulateMovement(newLocation)
          }

          setLocation(newLocation)
          setUpdateCount(prev => prev + 1)
          setError(null)

          // Save location to Supabase if available and user is authenticated
          if (supabase) {
            supabase.auth.getUser().then(({ data: { user } }) => {
              if (user) {
                supabase
                  .from('location_tracking')
                  .insert([{
                    user_id: user.id,
                    latitude: newLocation.latitude,
                    longitude: newLocation.longitude,
                    accuracy: newLocation.accuracy,
                    timestamp: new Date(newLocation.timestamp).toISOString(),
                    altitude: newLocation.altitude,
                    heading: newLocation.heading,
                    speed: newLocation.speed,
                  }])
                  .then(({ error }) => {
                    if (error) {
                      console.warn('Could not save to Supabase:', error)
                    }
                  })
              }
            }).catch(console.warn)
          }
        },
        (error) => {
          setError(error.message)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    }
    
    // Fallback: Update every 5 seconds if watchPosition fails
    intervalRef.current = setInterval(() => {
      if (!watchIdRef.current) {
        updateLocation()
      }
    }, 5000)
  }

  const stopTracking = () => {
    setIsTracking(false)
    
    // Clear watchPosition
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    
    // Clear interval fallback
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const getAccuracyLabel = (accuracy: number) => {
    if (accuracy < 10) return t('location.excellent')
    if (accuracy < 50) return t('location.good')
    if (accuracy < 100) return t('location.fair')
    return t('location.poor')
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy < 10) return 'bg-green-500'
    if (accuracy < 50) return 'bg-blue-500'
    if (accuracy < 100) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t('location.tracking')}
          </div>
          <Badge variant={isTracking ? "default" : "secondary"}>
            {isTracking ? t('common.on') : t('common.off')}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        
        {location && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">{t('location.coordinates')}</div>
                <div className="font-mono">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">{t('location.accuracy')}</div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getAccuracyColor(location.accuracy)}`} />
                  <span>{Math.round(location.accuracy)}m</span>
                  <span className="text-xs text-muted-foreground">
                    ({getAccuracyLabel(location.accuracy)})
                  </span>
                </div>
              </div>
            </div>

            {showMap && (
              <LeafletMap
                latitude={location.latitude}
                longitude={location.longitude}
                accuracy={location.accuracy}
                height="160px"
                zoom={16}
                showAccuracyCircle={true}
                className="rounded-lg"
              />
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {t('location.lastUpdate')}: {new Date(location.timestamp).toLocaleTimeString()}
              </div>
              <div className="flex items-center gap-1">
                <Satellite className="h-3 w-3" />
                {updateCount} {t('location.updatesRecorded')}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          {!isTracking ? (
            <Button onClick={startTracking} className="flex-1">
              <Navigation className="h-4 w-4 mr-2" />
              {t('location.startTracking')}
            </Button>
          ) : (
            <Button onClick={stopTracking} variant="outline" className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('location.stopTracking')}
            </Button>
          )}
        </div>
        
        {isTracking && (
          <div className="text-center text-xs text-muted-foreground">
            {t('location.updating')}
          </div>
        )}
      </CardContent>
    </Card>
  )
}