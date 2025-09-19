"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, AlertTriangle, Activity, PhoneCall, MapPin } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface HeartRateData {
  bpm: number
  timestamp: Date
  status: 'normal' | 'elevated' | 'critical'
}

interface HeartRateMonitorProps {
  onEmergencyAlert?: (data: { bpm: number; location?: { lat: number; lng: number } }) => void
  autoStart?: boolean
  alertThreshold?: number
  criticalThreshold?: number
}

export function HeartRateMonitor({ 
  onEmergencyAlert, 
  autoStart = false, 
  alertThreshold = 120,
  criticalThreshold = 150
}: HeartRateMonitorProps) {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [currentBPM, setCurrentBPM] = useState<number | null>(null)
  const [heartRateHistory, setHeartRateHistory] = useState<HeartRateData[]>([])
  const [showAlert, setShowAlert] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Simulate heart rate monitoring (in real app, would connect to device/sensor)
  const simulateHeartRate = useCallback(() => {
    // Generate realistic heart rate data with some variation
    const baseRate = 70 + Math.random() * 30 // 70-100 base range
    const stress = Math.random() > 0.9 ? 50 : 0 // Occasional stress spike
    const activity = Math.random() > 0.8 ? 30 : 0 // Occasional activity spike
    
    return Math.round(baseRate + stress + activity)
  }, [])

  // Get current location
  const getCurrentLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.warn("Could not get location for heart rate monitoring:", error)
        }
      )
    }
  }, [])

  // Monitor heart rate
  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      const bpm = simulateHeartRate()
      const now = new Date()
      
      let status: 'normal' | 'elevated' | 'critical' = 'normal'
      if (bpm >= criticalThreshold) {
        status = 'critical'
      } else if (bpm >= alertThreshold) {
        status = 'elevated'
      }

      const newData: HeartRateData = { bpm, timestamp: now, status }
      
      setCurrentBPM(bpm)
      setHeartRateHistory(prev => [...prev.slice(-29), newData]) // Keep last 30 readings

      // Trigger alert if BPM exceeds threshold
      if (bpm >= alertThreshold && !showAlert) {
        setShowAlert(true)
        if (onEmergencyAlert) {
          onEmergencyAlert({ bpm, location: location || undefined })
        }
      }
    }, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [isMonitoring, simulateHeartRate, alertThreshold, criticalThreshold, showAlert, onEmergencyAlert, location])

  // Auto-start monitoring
  useEffect(() => {
    if (autoStart) {
      startMonitoring()
    }
  }, [autoStart])

  const startMonitoring = () => {
    setIsMonitoring(true)
    setError(null)
    getCurrentLocation()
  }

  const stopMonitoring = () => {
    setIsMonitoring(false)
    setCurrentBPM(null)
    setShowAlert(false)
  }

  const getHeartRateColor = (bpm: number) => {
    if (bpm >= criticalThreshold) return "text-red-600 bg-red-500/20 border-red-500/30"
    if (bpm >= alertThreshold) return "text-yellow-600 bg-yellow-500/20 border-yellow-500/30"
    return "text-green-600 bg-green-500/20 border-green-500/30"
  }

  const getStatusText = (bpm: number) => {
    if (bpm >= criticalThreshold) return "CRITICAL"
    if (bpm >= alertThreshold) return "ELEVATED"
    return "NORMAL"
  }

  const handleEmergencyCall = () => {
    // In real app, would initiate emergency call
    console.log("🚨 EMERGENCY CALL INITIATED - Heart Rate Alert:", { bpm: currentBPM, location })
    alert("Emergency services would be contacted in a real implementation")
    setShowAlert(false)
  }

  const dismissAlert = () => {
    setShowAlert(false)
  }

  return (
    <>
      <Card className="glassmorphism bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Heart Rate Monitor
            {isMonitoring && <Activity className="h-4 w-4 animate-pulse text-green-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Current BPM Display */}
          <div className="text-center space-y-2">
            <div className="text-6xl font-bold text-foreground">
              {currentBPM || "--"}
            </div>
            <div className="text-sm text-muted-foreground">BPM</div>
            {currentBPM && (
              <Badge className={getHeartRateColor(currentBPM)}>
                {getStatusText(currentBPM)}
              </Badge>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-2 justify-center">
            <Button
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              variant={isMonitoring ? "destructive" : "default"}
              className="glassmorphism"
            >
              {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
            </Button>
          </div>

          {/* Recent Readings */}
          {heartRateHistory.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Recent Readings</h4>
              <div className="grid grid-cols-3 gap-2">
                {heartRateHistory.slice(-6).map((reading, index) => (
                  <div
                    key={reading.timestamp.getTime()}
                    className="text-center p-2 rounded border border-border/50 bg-background/50"
                  >
                    <div className="text-lg font-semibold">{reading.bpm}</div>
                    <div className="text-xs text-muted-foreground">
                      {reading.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alert Threshold Info */}
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <div>Alert Threshold: {alertThreshold} BPM</div>
            <div>Critical Threshold: {criticalThreshold} BPM</div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Alert Dialog */}
      <Dialog open={showAlert} onOpenChange={setShowAlert}>
        <DialogContent className="glassmorphism bg-card/95 border-red-500/50">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              HEART RATE ALERT
            </DialogTitle>
            <DialogDescription>
              Your heart rate has exceeded the safety threshold.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <div className="text-3xl font-bold text-red-600">{currentBPM} BPM</div>
              <div className="text-sm text-red-600">Above {alertThreshold} BPM threshold</div>
            </div>

            {location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</span>
              </div>
            )}

            <div className="space-y-2 text-sm">
              <p><strong>Recommended Actions:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Sit down and rest immediately</li>
                <li>Take deep, slow breaths</li>
                <li>Drink water if available</li>
                <li>Contact emergency services if symptoms persist</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleEmergencyCall}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <PhoneCall className="h-4 w-4 mr-2" />
                Emergency Call
              </Button>
              <Button
                onClick={dismissAlert}
                variant="outline"
                className="flex-1"
              >
                I'm Okay
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}