"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, QrCode, User, Phone, Calendar, Download, Share2, RotateCcw, Star, Crown, Sparkles } from "lucide-react"

interface TouristIdData {
  id: string
  name: string
  nationality: string
  passportNumber: string
  phone: string
  emergencyContact: string
  emergencyPhone: string
  issueDate: string
  expiryDate: string
  status: "active" | "expired" | "suspended"
  photo?: string
}

interface DigitalTouristIdProps {
  data: TouristIdData
  showActions?: boolean
}

export function DigitalTouristId({ data, showActions = true }: DigitalTouristIdProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary text-primary-foreground animate-gold-pulse-glow"
      case "expired":
        return "bg-destructive text-destructive-foreground"
      case "suspended":
        return "bg-yellow-500 text-yellow-50"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="perspective-1000">
        <div
          className={`
            relative w-full h-80 transform-style-preserve-3d transition-transform duration-700 cursor-pointer
            ${isFlipped ? "rotate-y-180" : ""}
          `}
          onClick={handleFlip}
        >
          <Card className="absolute inset-0 backface-hidden luxury-card glassmorphism-gold-strong p-0 overflow-hidden group hover:scale-105 transition-all duration-500">
            <div className="relative h-full p-6 flex flex-col justify-between">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 animate-gold-shimmer" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl animate-luxury-float" />
              <div
                className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-2xl animate-luxury-float"
                style={{ animationDelay: "1s" }}
              />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/20 border border-primary/30 animate-gold-pulse-glow">
                    <Crown className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary tracking-wider font-serif">PREMIUM TOURIST ID</p>
                    <p className="text-xs text-secondary font-medium">Blockchain Verified</p>
                  </div>
                </div>
                <Badge className={`${getStatusColor(data.status)} border-primary/30 font-semibold`}>
                  <Star className="h-3 w-3 mr-1" />
                  {data.status.toUpperCase()}
                </Badge>
              </div>

              <div className="flex items-center gap-4 relative z-10">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 p-1">
                    <div className="w-full h-full rounded-xl overflow-hidden bg-card border border-primary/20">
                      {data.photo ? (
                        <img
                          src={data.photo || "/placeholder.svg"}
                          alt="Tourist photo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                          <User className="h-8 w-8 text-primary" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-card">
                    <Shield className="h-3 w-3 text-primary-foreground" />
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-serif font-bold text-xl text-primary mb-1 tracking-wide">{data.name}</h3>
                  <p className="text-sm text-secondary font-medium mb-2">{data.nationality}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="h-3 w-3 text-primary" />
                    <span className="text-muted-foreground">Valid until</span>
                    <span className="font-semibold text-primary">{data.expiryDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between relative z-10">
                <div className="text-xs">
                  <p className="text-muted-foreground mb-1">Tourist ID</p>
                  <p className="font-mono text-primary font-bold tracking-wider bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
                    {data.id}
                  </p>
                </div>
                <div className="relative">
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border-2 border-primary/30 shadow-lg group-hover:border-primary/50 transition-colors">
                    <QrCode className="h-12 w-12 text-foreground" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full animate-pulse border border-card" />
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <p className="text-xs text-primary font-medium">Scan to verify</p>
                  </div>
                </div>
              </div>

              <div className="absolute top-4 right-4">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="absolute bottom-4 left-4">
                <Sparkles className="h-3 w-3 text-secondary animate-pulse" style={{ animationDelay: "0.5s" }} />
              </div>
            </div>
          </Card>

          <Card className="absolute inset-0 backface-hidden rotate-y-180 luxury-card glassmorphism-gold-strong p-0 overflow-hidden">
            <div className="relative h-full p-6 flex flex-col justify-between">
              <div className="absolute inset-0 bg-gradient-to-tl from-secondary/10 via-transparent to-primary/10 animate-gold-shimmer" />
              <div className="absolute top-0 left-0 w-28 h-28 bg-gradient-to-br from-secondary/20 to-transparent rounded-full blur-3xl animate-luxury-float" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary animate-pulse" />
                    <span className="text-sm font-bold text-primary font-serif tracking-wider">EMERGENCY CONTACTS</span>
                  </div>
                  <Shield className="h-5 w-5 text-secondary" />
                </div>

                <div className="space-y-3">
                  <div className="glassmorphism-gold p-3 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-primary" />
                      <span className="text-xs text-secondary font-medium">Primary Contact</span>
                    </div>
                    <p className="font-bold text-primary text-sm">{data.emergencyContact}</p>
                    <p className="text-muted-foreground text-xs font-mono">{data.emergencyPhone}</p>
                  </div>

                  <div className="glassmorphism-gold p-3 rounded-xl border border-secondary/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Phone className="h-4 w-4 text-secondary" />
                      <span className="text-xs text-primary font-medium">Tourist Helpline</span>
                    </div>
                    <p className="font-bold text-secondary text-sm">24/7 Emergency Support</p>
                    <p className="text-muted-foreground text-xs font-mono">+91-1363</p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 text-center">
                <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 border-2 border-primary/30 shadow-xl">
                  <QrCode className="h-16 w-16 text-foreground" />
                </div>
                <p className="text-xs text-primary font-medium mb-1">Emergency QR Code</p>
                <p className="text-xs text-muted-foreground">Scan for instant emergency contact</p>
              </div>

              <div className="relative z-10 space-y-2">
                <div className="flex justify-between items-center text-xs glassmorphism-gold p-2 rounded-lg border border-primary/20">
                  <span className="text-muted-foreground">Passport:</span>
                  <span className="font-mono text-primary font-bold">{data.passportNumber}</span>
                </div>
                <div className="flex justify-between items-center text-xs glassmorphism-gold p-2 rounded-lg border border-secondary/20">
                  <span className="text-muted-foreground">Issued:</span>
                  <span className="font-mono text-secondary font-bold">{data.issueDate}</span>
                </div>
                <div className="text-center">
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                    <Shield className="h-2 w-2 mr-1" />
                    Blockchain Secured
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {showActions && (
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFlip}
            className="flex-1 glassmorphism-gold border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 bg-transparent"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Flip Card
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="glassmorphism-gold border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 bg-transparent"
          >
            <Download className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="glassmorphism-gold border-secondary/30 text-secondary hover:bg-secondary/10 hover:border-secondary/50 transition-all duration-300 bg-transparent"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
