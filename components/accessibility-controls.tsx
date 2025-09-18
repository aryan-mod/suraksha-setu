"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Accessibility, Eye, Volume2, Keyboard, Type, Contrast, Settings, X } from "lucide-react"

interface AccessibilityControlsProps {
  currentLanguage: string
}

export function AccessibilityControls({ currentLanguage }: AccessibilityControlsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState({
    highContrast: false,
    textToSpeech: false,
    keyboardNavigation: true,
    fontSize: 16,
    reducedMotion: false,
    screenReaderMode: false,
  })

  useEffect(() => {
    // Load saved accessibility settings
    const savedSettings = localStorage.getItem("safetour-accessibility")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  useEffect(() => {
    // Apply accessibility settings to document
    const root = document.documentElement

    if (settings.highContrast) {
      root.classList.add("high-contrast")
    } else {
      root.classList.remove("high-contrast")
    }

    if (settings.reducedMotion) {
      root.classList.add("reduce-motion")
    } else {
      root.classList.remove("reduce-motion")
    }

    root.style.fontSize = `${settings.fontSize}px`

    // Save settings
    localStorage.setItem("safetour-accessibility", JSON.stringify(settings))
  }, [settings])

  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const speakText = (text: string) => {
    if (settings.textToSpeech && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = currentLanguage === "hi" ? "hi-IN" : "en-US"
      speechSynthesis.speak(utterance)
    }
  }

  const resetSettings = () => {
    const defaultSettings = {
      highContrast: false,
      textToSpeech: false,
      keyboardNavigation: true,
      fontSize: 16,
      reducedMotion: false,
      screenReaderMode: false,
    }
    setSettings(defaultSettings)
  }

  return (
    <>
      {/* Accessibility Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="glassmorphism bg-card/50 border-border/50 hover:bg-card/70"
        aria-label={currentLanguage === "hi" ? "पहुंच नियंत्रण" : "Accessibility Controls"}
      >
        <Accessibility className="h-5 w-5" />
      </Button>

      {/* Accessibility Panel */}
      {isOpen && (
        <Card className="absolute top-12 right-0 w-80 glassmorphism bg-card/95 border-border/50 shadow-2xl z-50">
          <CardHeader className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Accessibility className="h-5 w-5 text-primary" />
                {currentLanguage === "hi" ? "पहुंच सेटिंग्स" : "Accessibility Settings"}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-6">
            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Contrast className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{currentLanguage === "hi" ? "उच्च कंट्रास्ट" : "High Contrast"}</p>
                  <p className="text-xs text-muted-foreground">
                    {currentLanguage === "hi" ? "बेहतर दृश्यता के लिए" : "For better visibility"}
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.highContrast}
                onCheckedChange={(checked) => updateSetting("highContrast", checked)}
              />
            </div>

            {/* Text to Speech */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{currentLanguage === "hi" ? "टेक्स्ट टू स्पीच" : "Text to Speech"}</p>
                  <p className="text-xs text-muted-foreground">
                    {currentLanguage === "hi" ? "सुरक्षा अलर्ट के लिए" : "For safety alerts"}
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.textToSpeech}
                onCheckedChange={(checked) => updateSetting("textToSpeech", checked)}
              />
            </div>

            {/* Keyboard Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Keyboard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {currentLanguage === "hi" ? "कीबोर्ड नेवीगेशन" : "Keyboard Navigation"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentLanguage === "hi" ? "कीबोर्ड शॉर्टकट सक्षम करें" : "Enable keyboard shortcuts"}
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.keyboardNavigation}
                onCheckedChange={(checked) => updateSetting("keyboardNavigation", checked)}
              />
            </div>

            {/* Font Size */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Type className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{currentLanguage === "hi" ? "फ़ॉन्ट आकार" : "Font Size"}</p>
                  <p className="text-xs text-muted-foreground">
                    {currentLanguage === "hi" ? "पाठ का आकार समायोजित करें" : "Adjust text size"}
                  </p>
                </div>
              </div>
              <div className="px-3">
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([value]) => updateSetting("fontSize", value)}
                  min={12}
                  max={24}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>12px</span>
                  <Badge variant="outline" className="text-xs">
                    {settings.fontSize}px
                  </Badge>
                  <span>24px</span>
                </div>
              </div>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{currentLanguage === "hi" ? "कम गति" : "Reduced Motion"}</p>
                  <p className="text-xs text-muted-foreground">
                    {currentLanguage === "hi" ? "एनीमेशन कम करें" : "Minimize animations"}
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.reducedMotion}
                onCheckedChange={(checked) => updateSetting("reducedMotion", checked)}
              />
            </div>

            {/* Screen Reader Mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {currentLanguage === "hi" ? "स्क्रीन रीडर मोड" : "Screen Reader Mode"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentLanguage === "hi" ? "स्क्रीन रीडर के लिए अनुकूलित" : "Optimized for screen readers"}
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.screenReaderMode}
                onCheckedChange={(checked) => updateSetting("screenReaderMode", checked)}
              />
            </div>

            {/* Test Text to Speech */}
            {settings.textToSpeech && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  speakText(
                    currentLanguage === "hi"
                      ? "टेक्स्ट टू स्पीच सक्रिय है। यह एक परीक्षण संदेश है।"
                      : "Text to speech is active. This is a test message.",
                  )
                }
                className="w-full glassmorphism bg-card/50 border-border/50"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                {currentLanguage === "hi" ? "आवाज़ परीक्षण" : "Test Voice"}
              </Button>
            )}

            {/* Reset Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={resetSettings}
              className="w-full glassmorphism bg-card/50 border-border/50"
            >
              {currentLanguage === "hi" ? "डिफ़ॉल्ट रीसेट करें" : "Reset to Default"}
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  )
}
