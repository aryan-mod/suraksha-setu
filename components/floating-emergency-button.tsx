"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle, Phone, MapPin, Clock } from "lucide-react"

export function FloatingEmergencyButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isEmergencyActive, setIsEmergencyActive] = useState(false)

  const handleEmergencyClick = () => {
    setIsOpen(true)
  }

  const activateEmergency = () => {
    setIsEmergencyActive(true)
    // Here you would trigger the actual emergency response
    console.log("[v0] Emergency activated - sending alerts to authorities and emergency contacts")

    // Simulate emergency response
    setTimeout(() => {
      setIsEmergencyActive(false)
      setIsOpen(false)
    }, 5000)
  }

  return (
    <>
      {/* Floating Emergency Button */}
      <Button
        onClick={handleEmergencyClick}
        className="floating-button bg-destructive hover:bg-destructive/90 text-destructive-foreground animate-emergency-pulse"
        size="lg"
      >
        <AlertTriangle className="h-6 w-6" />
      </Button>

      {/* Emergency Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="glassmorphism bg-card/95 border-destructive/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Emergency SOS
            </DialogTitle>
            <DialogDescription>
              {isEmergencyActive
                ? "Emergency alert has been sent. Help is on the way."
                : "This will immediately alert authorities and your emergency contacts."}
            </DialogDescription>
          </DialogHeader>

          {isEmergencyActive ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center p-8">
                <div className="relative">
                  <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center animate-pulse-glow">
                    <AlertTriangle className="h-10 w-10 text-destructive" />
                  </div>
                  <div className="absolute inset-0 border-4 border-destructive/30 rounded-full animate-ping" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="font-semibold text-destructive">Emergency Alert Sent</p>
                <p className="text-sm text-muted-foreground">
                  Your location and emergency details have been shared with:
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Phone className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">Local Emergency Services</p>
                    <p className="text-sm text-muted-foreground">Alert sent at {new Date().toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <MapPin className="h-4 w-4 text-secondary" />
                  <div>
                    <p className="font-medium">Tourist Safety Department</p>
                    <p className="text-sm text-muted-foreground">Location shared</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Clock className="h-4 w-4 text-accent" />
                  <div>
                    <p className="font-medium">Emergency Contacts</p>
                    <p className="text-sm text-muted-foreground">2 contacts notified</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center p-6 bg-destructive/10 rounded-lg border border-destructive/20">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-3" />
                <p className="font-semibold text-destructive mb-2">Are you in immediate danger?</p>
                <p className="text-sm text-muted-foreground">
                  This will send your exact location and emergency alert to local authorities and your emergency
                  contacts.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={activateEmergency}
                  className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground animate-pulse-glow"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Send Emergency Alert
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
