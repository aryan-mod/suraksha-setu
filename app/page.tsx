"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, MapPin, Users, Zap, Globe, Star, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import EnhancedLanguageSelectorNew from "@/components/enhanced-language-selector-new"
import SOSEmergencyButton from "@/components/sos-emergency-button"
import LiveLocationTracker from "@/components/live-location-tracker"
import SupabaseAuth from "@/components/supabase-auth"

// Particle component for background animation
const Particle = ({ delay }: { delay: number }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const animate = () => {
      setPosition({
        x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200),
        y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
      })
    }

    const interval = setInterval(animate, 4000 + delay * 500)
    animate()

    return () => clearInterval(interval)
  }, [delay])

  return (
    <div
      className="absolute rounded-full animate-float transition-all duration-1000 ease-in-out"
      style={{
        left: position.x,
        top: position.y,
        width: Math.random() * 4 + 2,
        height: Math.random() * 4 + 2,
        backgroundColor: Math.random() > 0.5 ? "rgba(5, 150, 105, 0.3)" : "rgba(16, 185, 129, 0.3)",
        animationDelay: `${delay * 0.5}s`,
      }}
    />
  )
}

// Real-time advisories ticker
const AdvisoriesTicker = () => {
  const advisories = [
    {
      type: "info",
      message: "Weather Alert: Light rain expected in Mumbai region",
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    {
      type: "success",
      message: "All tourist zones in Goa are currently safe",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      type: "warning",
      message: "Traffic congestion reported near India Gate, Delhi",
      icon: <Clock className="h-4 w-4" />,
    },
    { type: "info", message: "New safety checkpoint activated in Rajasthan", icon: <Shield className="h-4 w-4" /> },
  ]

  return (
    <div className="w-full bg-primary/10 border-y border-primary/20 py-3 overflow-hidden">
      <div className="animate-ticker flex gap-8 whitespace-nowrap">
        {[...advisories, ...advisories].map((advisory, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className={`
              ${advisory.type === "success" ? "text-green-600" : ""}
              ${advisory.type === "warning" ? "text-yellow-600" : ""}
              ${advisory.type === "info" ? "text-primary" : ""}
            `}
            >
              {advisory.icon}
            </div>
            <span className="text-foreground/80">{advisory.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const { translate } = useLanguage()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Particle Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {Array.from({ length: 15 }).map((_, i) => (
          <Particle key={i} delay={i * 0.3} />
        ))}
      </div>

      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 animate-gradient z-0" />

      {/* Header */}
      <header className="relative z-10 glassmorphism bg-card/30 border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/20 animate-pulse-glow">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-xl text-foreground">SafeTour AI</h1>
              <p className="text-xs text-muted-foreground">Smart Tourist Safety System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <EnhancedLanguageSelectorNew
              variant="dropdown"
              showFlags={true}
              showNativeNames={true}
            />
            <ThemeToggle />
            <Link href="/dashboard">
              <Button variant="outline" className="glassmorphism bg-card/50 border-border/50 hover:bg-card/70">
                {translate("nav.dashboard")}
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" className="glassmorphism bg-card/50 border-border/50 hover:bg-card/70">
                {translate("nav.admin")}
              </Button>
            </Link>
            <Button variant="outline" className="glassmorphism bg-card/50 border-border/50 hover:bg-card/70">
              {translate("nav.signIn")}
            </Button>
          </div>
        </div>
      </header>

      {/* Real-time Advisories Ticker */}
      <AdvisoriesTicker />

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-6 glassmorphism bg-primary/30 text-primary-foreground border-primary/50 animate-pulse-glow">
            <Zap className="h-4 w-4 mr-2" />
            AI-Powered Safety Monitoring
          </Badge>

          <div className="flex flex-col justify-center items-center min-h-[60vh] text-center">
            <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 text-balance leading-tight">
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient block">
                Smart Tourist Safety
              </span>
              <span className="text-foreground block mt-2">Monitoring System</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty leading-relaxed">
              Experience next-generation tourist safety with AI-powered monitoring, blockchain-based digital IDs, and
              real-time emergency response systems designed to keep you protected wherever you travel.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/generate-id">
                <Button
                  size="lg"
                  className="glassmorphism bg-primary hover:bg-primary/90 text-primary-foreground animate-pulse-glow px-8 py-6 text-lg font-semibold w-full sm:w-auto"
                >
                  <Shield className="mr-2 h-5 w-5" />
                  Generate Your Tourist ID
                </Button>
              </Link>

              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="glassmorphism bg-card/50 border-border/50 hover:bg-card/70 px-8 py-6 text-lg w-full sm:w-auto"
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Card className="glassmorphism bg-card/50 border-border/50 p-6 neumorphism hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">50K+</p>
                  <p className="text-sm text-muted-foreground">Protected Tourists</p>
                </div>
              </div>
            </Card>

            <Card className="glassmorphism bg-card/50 border-border/50 p-6 neumorphism hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-secondary/20">
                  <MapPin className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">200+</p>
                  <p className="text-sm text-muted-foreground">Safe Zones</p>
                </div>
              </div>
            </Card>

            <Card className="glassmorphism bg-card/50 border-border/50 p-6 neumorphism hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">99.9%</p>
                  <p className="text-sm text-muted-foreground">Safety Score</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Live Demo Section - New Features */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge className="mb-6 glassmorphism bg-secondary/30 text-secondary-foreground border-secondary/50 animate-pulse-glow">
            <Zap className="h-4 w-4 mr-2" />
            Live Prototype Features
          </Badge>
          <h2 className="font-serif font-bold text-4xl mb-4 text-foreground">Suraksha Setu Demo</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Experience the core safety features in action - live location tracking, emergency SOS, and multilingual support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* SOS Emergency Button */}
          <Card className="glassmorphism bg-card/50 border-border/50 p-6 text-center">
            <h3 className="font-serif font-bold text-xl mb-4">Emergency SOS</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              Instant emergency alert with location sharing
            </p>
            <SOSEmergencyButton className="mx-auto" />
          </Card>

          {/* Live Location Tracker */}
          <LiveLocationTracker className="lg:col-span-2" showMap={true} />
        </div>

        {/* Authentication Demo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SupabaseAuth />
          
          {/* Language Demo */}
          <Card className="glassmorphism bg-card/50 border-border/50 p-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Multilingual Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Choose your preferred language from 5+ Indian languages with native script support:
              </p>
              <EnhancedLanguageSelectorNew 
                variant="inline" 
                showFlags={true}
                showNativeNames={true}
              />
              <div className="text-xs text-muted-foreground pt-2">
                Language preference saved in localStorage
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-4xl mb-4 text-foreground">Advanced Safety Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Cutting-edge technology designed to provide comprehensive protection and peace of mind for modern travelers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Shield className="h-8 w-8" />,
              title: "Blockchain Digital ID",
              description:
                "Tamper-proof digital identity with secure blockchain verification and immutable travel records.",
              color: "primary",
            },
            {
              icon: <MapPin className="h-8 w-8" />,
              title: "Real-time Geo-fencing",
              description: "AI-powered location monitoring with smart zone detection and automated safety alerts.",
              color: "secondary",
            },
            {
              icon: <Zap className="h-8 w-8" />,
              title: "Emergency SOS",
              description: "One-tap emergency response system with instant notification to authorities and contacts.",
              color: "destructive",
            },
            {
              icon: <Users className="h-8 w-8" />,
              title: "Multi-user Dashboard",
              description: "Separate interfaces for tourists, police, and tourism departments with role-based access.",
              color: "primary",
            },
            {
              icon: <Globe className="h-8 w-8" />,
              title: "Multilingual Support",
              description: "Available in 10+ languages with real-time translation for emergency communications.",
              color: "secondary",
            },
            {
              icon: <AlertTriangle className="h-8 w-8" />,
              title: "AI Anomaly Detection",
              description: "Smart alerts for route deviation, prolonged inactivity, and unusual behavior patterns.",
              color: "destructive",
            },
          ].map((feature, index) => (
            <Card
              key={index}
              className="glassmorphism bg-card/50 border-border/50 p-6 neumorphism hover:scale-105 transition-all duration-300 group"
            >
              <div
                className={`
                p-3 rounded-xl mb-4 w-fit group-hover:scale-110 transition-transform duration-300
                ${feature.color === "primary" ? "bg-primary/20 text-primary" : ""}
                ${feature.color === "secondary" ? "bg-secondary/20 text-secondary" : ""}
                ${feature.color === "destructive" ? "bg-destructive/20 text-destructive" : ""}
              `}
              >
                {feature.icon}
              </div>
              <h3 className="font-serif font-bold text-xl mb-3 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <Card className="glassmorphism bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-border/50 p-12 text-center neumorphism">
          <h2 className="font-serif font-bold text-4xl mb-6 text-foreground">Ready to Travel Safely?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Join thousands of travelers who trust SafeTour AI to keep them protected during their journeys.
          </p>
          <Link href="/generate-id">
            <Button
              size="lg"
              className="glassmorphism bg-primary hover:bg-primary/90 text-primary-foreground animate-pulse-glow px-12 py-6 text-xl font-semibold"
            >
              <Shield className="mr-3 h-6 w-6" />
              Get Started Now
            </Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="relative z-10 glassmorphism bg-card/30 border-t border-border/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="p-2 rounded-xl bg-primary/20">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-foreground">SafeTour AI</h3>
                <p className="text-sm text-muted-foreground">Smart Tourist Safety System</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Support
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p>© 2024 SafeTour AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
