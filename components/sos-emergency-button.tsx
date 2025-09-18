"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Phone, MapPin, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { createClient } from '@/lib/supabase/client'

interface SOSEmergencyButtonProps {
  className?: string
}

export default function SOSEmergencyButton({ className }: SOSEmergencyButtonProps) {
  const { t } = useTranslation('common')
  const [isPressed, setIsPressed] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isFlashing, setIsFlashing] = useState(false)
  const supabase = createClient()

  // Get current location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error("Location error:", error)
        },
        { enableHighAccuracy: true }
      )
    }
  }, [])

  const handleSOSPress = async () => {
    setIsPressed(true)
    setIsFlashing(true)
    
    try {
      // Save SOS alert to Supabase if available
      if (supabase) {
        const { error } = await supabase
          .from('sos_alerts')
          .insert([
            {
              timestamp: new Date().toISOString(),
              location: location,
              user_agent: navigator.userAgent,
              status: 'active'
            }
          ])
        
        if (error) {
          console.warn('Could not save to Supabase:', error)
        }
      }
      
      // Show confirmation modal
      setShowConfirmation(true)
      
      // Flash animation for 3 seconds
      setTimeout(() => {
        setIsFlashing(false)
      }, 3000)
      
      // For prototype: Simulate emergency services notification
      console.log('🚨 EMERGENCY ALERT:', {
        timestamp: new Date().toISOString(),
        location: location,
        message: 'Tourist emergency assistance required'
      })
      
    } catch (error) {
      console.error('SOS Error:', error)
    }
  }

  const resetSOS = () => {
    setIsPressed(false)
    setShowConfirmation(false)
    setIsFlashing(false)
  }

  return (
    <>
      {/* SOS Button */}
      <div className={`relative ${className}`}>
        <Button
          onClick={handleSOSPress}
          disabled={isPressed}
          className={`
            relative h-20 w-20 rounded-full bg-red-600 hover:bg-red-700 
            text-white font-bold text-lg shadow-2xl transform transition-all duration-200
            ${isFlashing ? 'animate-pulse scale-110' : ''}
            ${isPressed ? 'scale-95' : 'hover:scale-105'}
          `}
        >
          <div className="flex flex-col items-center">
            <AlertTriangle className="h-6 w-6 mb-1" />
            <span className="text-xs">SOS</span>
          </div>
          
          {/* Animated ring effect when pressed */}
          {isFlashing && (
            <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping" />
          )}
        </Button>
        
        {/* Pulsing glow effect */}
        {isFlashing && (
          <div className="absolute inset-0 rounded-full bg-red-500 opacity-30 animate-ping scale-150" />
        )}
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmation} onOpenChange={resetSOS}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              {t('emergency.alertSent')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Phone className="h-3 w-3 mr-1" />
                {t('emergency.help')}
              </Badge>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
              
              {location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{t('emergency.location')}</span>
                </div>
              )}
              
              <p className="text-center mt-4 text-sm">
                {t('emergency.location')}
              </p>
            </div>
            
            <div className="flex justify-center">
              <Button onClick={resetSOS} variant="outline" className="w-full">
                {t('common.close')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}