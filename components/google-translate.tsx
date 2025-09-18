"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Languages, ChevronDown, X } from "lucide-react"
import { useLanguage } from "./language-provider"

declare global {
  interface Window {
    google: any
    googleTranslateElementInit: () => void
  }
}

interface GoogleTranslateProps {
  variant?: "widget" | "custom"
  className?: string
}

export function GoogleTranslate({ variant = "custom", className = "" }: GoogleTranslateProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [currentTranslation, setCurrentTranslation] = useState("en")
  const { translate } = useLanguage()

  const supportedLanguages = [
    { code: "en", name: "English", native: "English" },
    { code: "hi", name: "Hindi", native: "हिंदी" },
    { code: "es", name: "Spanish", native: "Español" },
    { code: "fr", name: "French", native: "Français" },
    { code: "de", name: "German", native: "Deutsch" },
    { code: "pt", name: "Portuguese", native: "Português" },
    { code: "it", name: "Italian", native: "Italiano" },
    { code: "ja", name: "Japanese", native: "日本語" },
    { code: "ko", name: "Korean", native: "한국어" },
    { code: "zh", name: "Chinese", native: "中文" },
    { code: "ar", name: "Arabic", native: "العربية" },
    { code: "ru", name: "Russian", native: "Русский" },
    { code: "th", name: "Thai", native: "ไทย" },
    { code: "vi", name: "Vietnamese", native: "Tiếng Việt" },
    { code: "id", name: "Indonesian", native: "Bahasa Indonesia" },
    { code: "ms", name: "Malay", native: "Bahasa Melayu" },
    { code: "tl", name: "Filipino", native: "Filipino" },
    { code: "sw", name: "Swahili", native: "Kiswahili" },
    { code: "tr", name: "Turkish", native: "Türkçe" },
    { code: "pl", name: "Polish", native: "Polski" },
  ]

  useEffect(() => {
    const loadGoogleTranslate = () => {
      if (window.google?.translate) {
        setIsLoaded(true)
        return
      }

      // Create script element
      const script = document.createElement("script")
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
      script.async = true

      // Define initialization function
      window.googleTranslateElementInit = () => {
        if (window.google?.translate) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "auto",
              includedLanguages: supportedLanguages.map((lang) => lang.code).join(","),
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
              multilanguagePage: true,
            },
            "google_translate_element",
          )
          setIsLoaded(true)
        }
      }

      document.body.appendChild(script)

      // Cleanup function
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script)
        }
        delete window.googleTranslateElementInit
      }
    }

    const cleanup = loadGoogleTranslate()
    return cleanup
  }, [])

  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = `
      .skiptranslate { display: none !important; }
      .goog-te-banner-frame { display: none !important; }
      .goog-te-menu-value { display: none !important; }
      .goog-logo-link { display: none !important; }
      .goog-te-gadget { display: none !important; }
      .goog-te-combo { display: none !important; }
      body { top: 0 !important; }
      #google_translate_element { display: none !important; }
      .goog-te-spinner { display: none !important; }
    `
    document.head.appendChild(style)

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])

  const switchLanguage = (langCode: string) => {
    if (!isLoaded) return

    // Set Google Translate cookie
    const cookieValue = langCode === "en" ? "/auto/en" : `/auto/${langCode}`
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`

    setCurrentTranslation(langCode)
    setIsOpen(false)

    // Reload page to apply translation
    window.location.reload()
  }

  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(";").shift()
      return null
    }

    const googtrans = getCookie("googtrans")
    if (googtrans) {
      const langCode = googtrans.split("/")[2]
      if (langCode && langCode !== currentTranslation) {
        setCurrentTranslation(langCode)
      }
    }
  }, [currentTranslation])

  if (variant === "widget") {
    return (
      <div className={`${className}`}>
        <div id="google_translate_element" />
        {!isLoaded && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Languages className="h-4 w-4 animate-spin" />
            Loading translator...
          </div>
        )}
      </div>
    )
  }

  const currentLang = supportedLanguages.find((lang) => lang.code === currentTranslation)

  return (
    <div className={`relative ${className}`}>
      {/* Hidden Google Translate element */}
      <div id="google_translate_element" style={{ display: "none" }} />

      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={!isLoaded}
        className="glassmorphism bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300 flex items-center gap-2"
      >
        <Languages className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLang ? currentLang.native : "Translate"}</span>
        <ChevronDown className="h-4 w-4" />
        {!isLoaded && <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />}
      </Button>

      {isOpen && isLoaded && (
        <Card className="absolute top-12 right-0 w-72 glassmorphism bg-card/95 border-border/50 shadow-2xl z-50 max-h-80 overflow-hidden">
          <CardContent className="p-0">
            <div className="p-3 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Google Translate</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-6 w-6 p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>

            <div className="max-h-64 overflow-y-auto">
              <div className="p-2 space-y-1">
                {supportedLanguages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant="ghost"
                    onClick={() => switchLanguage(lang.code)}
                    className={`w-full justify-start h-auto p-3 glassmorphism transition-all duration-200 ${
                      currentTranslation === lang.code ? "bg-primary/10 border-primary/20" : ""
                    }`}
                  >
                    <div className="flex flex-col items-start w-full">
                      <span className="font-medium text-sm">{lang.native}</span>
                      <span className="text-xs text-muted-foreground">{lang.name}</span>
                    </div>
                    {currentTranslation === lang.code && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        Active
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            <div className="p-3 border-t border-border/50 text-center">
              <p className="text-xs text-muted-foreground">Powered by Google Translate</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
