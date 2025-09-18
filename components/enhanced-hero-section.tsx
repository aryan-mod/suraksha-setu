"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Shield, MapPin, Zap, Users, Star, ArrowRight, Play, Globe, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"

// Animated background particles
const BackgroundParticles = () => {
  const [particles, setParticles] = useState<
    Array<{
      id: number
      x: number
      y: number
      size: number
      color: string
      speed: number
    }>
  >([])

  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      color: Math.random() > 0.5 ? "#0ea5e9" : "#10b981",
      speed: Math.random() * 2 + 1,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full opacity-20 animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            animationDelay: `${particle.id * 0.5}s`,
            animationDuration: `${particle.speed + 4}s`,
          }}
        />
      ))}
    </div>
  )
}

// Stats counter animation
const AnimatedCounter = ({
  end,
  duration = 2000,
  suffix = "",
}: {
  end: number
  duration?: number
  suffix?: string
}) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      setCount(Math.floor(progress * end))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [end, duration])

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

export function EnhancedHeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90" />
      <BackgroundParticles />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(rgba(14, 165, 233, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14, 165, 233, 0.1) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          {/* Status Badge */}
          <div className="text-center mb-8 animate-slide-up">
            <Badge className="glassmorphism bg-primary/20 text-primary border-primary/30 px-4 py-2 animate-pulse-glow">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                <Zap className="h-4 w-4" />
                <span className="font-semibold">AI-Powered Safety Monitoring</span>
              </div>
            </Badge>
          </div>

          {/* Main Heading */}
          <div className="text-center mb-12 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h1 className="font-serif font-bold text-5xl md:text-7xl lg:text-8xl mb-6 text-balance leading-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-gradient">
                Smart Tourist
              </span>
              <br />
              <span className="text-foreground">Safety System</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty leading-relaxed">
              Experience next-generation tourist safety with{" "}
              <span className="text-primary font-semibold">AI-powered monitoring</span>,{" "}
              <span className="text-secondary font-semibold">blockchain-based digital IDs</span>, and{" "}
              <span className="text-accent font-semibold">real-time emergency response</span> designed to keep you
              protected wherever you travel.
            </p>
          </div>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up"
            style={{ animationDelay: "0.4s" }}
          >
            <Link href="/generate-id">
              <Button
                size="lg"
                className="glassmorphism bg-primary hover:bg-primary/90 text-primary-foreground animate-pulse-glow px-8 py-6 text-lg font-semibold group"
              >
                <Shield className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                Generate Your Tourist ID
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Button
              variant="outline"
              size="lg"
              className="glassmorphism bg-card/50 border-border/50 hover:bg-card/70 px-8 py-6 text-lg group"
            >
              <Play className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
          </div>

          {/* Stats Grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16 animate-slide-up"
            style={{ animationDelay: "0.6s" }}
          >
            <Card className="glassmorphism bg-card/50 border-border/50 p-6 text-center neumorphism hover:scale-105 transition-all duration-300 group">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                <AnimatedCounter end={50000} suffix="+" />
              </div>
              <p className="text-sm text-muted-foreground">Protected Tourists</p>
            </Card>

            <Card className="glassmorphism bg-card/50 border-border/50 p-6 text-center neumorphism hover:scale-105 transition-all duration-300 group">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 rounded-xl bg-secondary/20 group-hover:bg-secondary/30 transition-colors">
                  <MapPin className="h-8 w-8 text-secondary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                <AnimatedCounter end={200} suffix="+" />
              </div>
              <p className="text-sm text-muted-foreground">Safe Zones</p>
            </Card>

            <Card className="glassmorphism bg-card/50 border-border/50 p-6 text-center neumorphism hover:scale-105 transition-all duration-300 group">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 rounded-xl bg-accent/20 group-hover:bg-accent/30 transition-colors">
                  <Globe className="h-8 w-8 text-accent" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                <AnimatedCounter end={25} suffix="+" />
              </div>
              <p className="text-sm text-muted-foreground">Countries</p>
            </Card>

            <Card className="glassmorphism bg-card/50 border-border/50 p-6 text-center neumorphism hover:scale-105 transition-all duration-300 group">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 rounded-xl bg-yellow-500/20 group-hover:bg-yellow-500/30 transition-colors">
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                <AnimatedCounter end={99} suffix=".9%" />
              </div>
              <p className="text-sm text-muted-foreground">Safety Score</p>
            </Card>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: "0.8s" }}>
            <Card className="glassmorphism bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 p-8 neumorphism hover:scale-105 transition-all duration-300 group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-foreground">Blockchain Security</h3>
                  <p className="text-sm text-muted-foreground">Tamper-proof digital identity</p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Advanced blockchain technology ensures your digital tourist ID is secure, verifiable, and protected
                against fraud.
              </p>
            </Card>

            <Card className="glassmorphism bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20 p-8 neumorphism hover:scale-105 transition-all duration-300 group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-secondary/20 group-hover:bg-secondary/30 transition-colors">
                  <Clock className="h-8 w-8 text-secondary" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-foreground">Real-time Monitoring</h3>
                  <p className="text-sm text-muted-foreground">24/7 safety tracking</p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                AI-powered location monitoring with smart zone detection and automated safety alerts for complete peace
                of mind.
              </p>
            </Card>

            <Card className="glassmorphism bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 p-8 neumorphism hover:scale-105 transition-all duration-300 group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-accent/20 group-hover:bg-accent/30 transition-colors">
                  <TrendingUp className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-foreground">Smart Analytics</h3>
                  <p className="text-sm text-muted-foreground">Predictive safety insights</p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Machine learning algorithms analyze patterns to predict and prevent potential safety issues before they
                occur.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
