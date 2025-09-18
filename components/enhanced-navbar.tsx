"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Shield, MapPin, Menu, X, Sun, Moon, User, Settings, LogOut, Bell } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { EnhancedLanguageSelector } from "./enhanced-language-selector"

interface NavbarProps {
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

export function EnhancedNavbar({ user }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!mounted) return null

  return (
    <nav
      className={`
      fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${
        scrolled ? "glassmorphism-strong bg-background/80 border-b border-border/50 backdrop-blur-xl" : "bg-transparent"
      }
    `}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="p-2 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors animate-pulse-glow">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1">
                <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">SafeTour AI</h1>
              <p className="text-xs text-muted-foreground">Smart Safety System</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/dashboard">
              <Button variant="ghost" className="glassmorphism hover:bg-primary/10">
                <MapPin className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>

            <Link href="/routes">
              <Button variant="ghost" className="glassmorphism hover:bg-primary/10">
                Routes
              </Button>
            </Link>

            <Link href="/alerts">
              <Button variant="ghost" className="glassmorphism hover:bg-primary/10 relative">
                Alerts
                <Badge className="ml-2 bg-destructive text-destructive-foreground animate-pulse">3</Badge>
              </Button>
            </Link>

            <EnhancedLanguageSelector
              variant="dropdown"
              showGoogleTranslate={true}
              showFlags={true}
              showNativeNames={true}
            />

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="glassmorphism"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="glassmorphism flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="hidden lg:block">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="glassmorphism bg-card/90 w-56">
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" className="glassmorphism">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-primary hover:bg-primary/90 animate-pulse-glow">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="sm" className="md:hidden glassmorphism" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden glassmorphism bg-card/90 rounded-lg mt-2 p-4 animate-slide-up">
            <div className="flex flex-col gap-3">
              <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/routes" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Routes
                </Button>
              </Link>
              <Link href="/alerts" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Alerts
                  <Badge className="ml-auto bg-destructive text-destructive-foreground">3</Badge>
                </Button>
              </Link>

              <div className="border-t border-border/50 pt-3 mt-3">
                <div className="mb-3">
                  <EnhancedLanguageSelector
                    variant="inline"
                    showGoogleTranslate={true}
                    showFlags={true}
                    showNativeNames={true}
                  />
                </div>
              </div>

              <div className="border-t border-border/50 pt-3 mt-3">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 p-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Button variant="ghost" className="justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                    <Button variant="ghost" className="justify-start text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-primary hover:bg-primary/90">Get Started</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
