"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Volume2, VolumeX, Zap, MapPin, Phone, Shield } from "lucide-react"

interface VoiceAssistantProps {
  currentLanguage: string
  onCommand: (command: string, params?: any) => void
}

export function VoiceAssistant({ currentLanguage, onCommand }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [lastCommand, setLastCommand] = useState("")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const recognitionRef = useRef<any>(null)

  const voiceCommands = {
    en: {
      emergency: ["emergency", "help", "sos", "danger"],
      map: ["map", "location", "where am i", "directions"],
      contact: ["call", "contact", "phone", "help line"],
      safety: ["safety", "secure", "safe area", "protection"],
    },
    hi: {
      emergency: ["आपातकाल", "मदद", "सहायता", "खतरा"],
      map: ["नक्शा", "स्थान", "मैं कहां हूं", "दिशा"],
      contact: ["कॉल", "संपर्क", "फोन", "हेल्पलाइन"],
      safety: ["सुरक्षा", "सुरक्षित", "सुरक्षित क्षेत्र", "सुरक्षा"],
    },
  }

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = false
      recognition.lang = currentLanguage === "hi" ? "hi-IN" : "en-US"

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase()
        setLastCommand(transcript)
        processVoiceCommand(transcript)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        if (isActive) {
          recognition.start() // Restart if still active
        } else {
          setIsListening(false)
        }
      }

      recognitionRef.current = recognition
    }
  }, [currentLanguage, isActive])

  const processVoiceCommand = (transcript: string) => {
    const commands = voiceCommands[currentLanguage as keyof typeof voiceCommands] || voiceCommands.en

    for (const [command, keywords] of Object.entries(commands)) {
      if (keywords.some((keyword) => transcript.includes(keyword))) {
        executeCommand(command, transcript)
        break
      }
    }
  }

  const executeCommand = (command: string, transcript: string) => {
    let response = ""

    switch (command) {
      case "emergency":
        onCommand("emergency", { transcript })
        response = currentLanguage === "hi" ? "आपातकालीन सेवाओं को सूचित कर रहा हूं" : "Notifying emergency services"
        break
      case "map":
        onCommand("map", { transcript })
        response = currentLanguage === "hi" ? "मानचित्र खोल रहा हूं" : "Opening map"
        break
      case "contact":
        onCommand("contact", { transcript })
        response = currentLanguage === "hi" ? "संपर्क जानकारी दिखा रहा हूं" : "Showing contact information"
        break
      case "safety":
        onCommand("safety", { transcript })
        response = currentLanguage === "hi" ? "सुरक्षा जानकारी प्रदान कर रहा हूं" : "Providing safety information"
        break
      default:
        response = currentLanguage === "hi" ? "कमांड समझ नहीं आया" : "Command not understood"
    }

    speak(response)
  }

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      setIsSpeaking(true)
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = currentLanguage === "hi" ? "hi-IN" : "en-US"
      utterance.rate = 0.9
      utterance.onend = () => setIsSpeaking(false)
      speechSynthesis.speak(utterance)
    }
  }

  const toggleVoiceAssistant = () => {
    if (isActive) {
      // Deactivate
      setIsActive(false)
      setIsListening(false)
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    } else {
      // Activate
      setIsActive(true)
      setIsListening(true)
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }
      speak(
        currentLanguage === "hi" ? "वॉयस असिस्टेंट सक्रिय। मैं आपकी सुन रहा हूं।" : "Voice assistant activated. I'm listening.",
      )
    }
  }

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  return (
    <div className="fixed bottom-24 right-6 z-40">
      {isActive && (
        <Card className="glassmorphism bg-card/95 border-border/50 shadow-lg mb-4 w-80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isListening ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
                <span className="text-sm font-semibold text-foreground">
                  {currentLanguage === "hi" ? "वॉयस असिस्टेंट" : "Voice Assistant"}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={isSpeaking ? stopSpeaking : undefined} className="h-8 w-8 p-0">
                {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {currentLanguage === "hi" ? "उपलब्ध कमांड:" : "Available Commands:"}
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">
                  <Zap className="h-2 w-2 mr-1" />
                  {currentLanguage === "hi" ? "आपातकाल" : "Emergency"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <MapPin className="h-2 w-2 mr-1" />
                  {currentLanguage === "hi" ? "मानचित्र" : "Map"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Phone className="h-2 w-2 mr-1" />
                  {currentLanguage === "hi" ? "संपर्क" : "Contact"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-2 w-2 mr-1" />
                  {currentLanguage === "hi" ? "सुरक्षा" : "Safety"}
                </Badge>
              </div>
            </div>

            {lastCommand && (
              <div className="mt-3 p-2 glassmorphism bg-muted/30 border-border/50 rounded">
                <p className="text-xs text-muted-foreground">
                  {currentLanguage === "hi" ? "अंतिम कमांड:" : "Last Command:"}
                </p>
                <p className="text-xs font-mono text-foreground">{lastCommand}</p>
              </div>
            )}

            {isListening && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1 h-4 bg-green-500 rounded animate-pulse" />
                  <div className="w-1 h-6 bg-green-500 rounded animate-pulse" style={{ animationDelay: "0.1s" }} />
                  <div className="w-1 h-5 bg-green-500 rounded animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <div className="w-1 h-7 bg-green-500 rounded animate-pulse" style={{ animationDelay: "0.3s" }} />
                </div>
                <span className="text-xs text-green-600">
                  {currentLanguage === "hi" ? "सुन रहा हूं..." : "Listening..."}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Button
        onClick={toggleVoiceAssistant}
        className={`w-14 h-14 rounded-full glassmorphism shadow-lg transition-all duration-300 ${
          isActive
            ? "bg-green-500 hover:bg-green-600 text-white animate-pulse-glow"
            : "bg-card/80 hover:bg-card text-foreground border border-border/50"
        }`}
      >
        {isActive ? (
          isListening ? (
            <Mic className="h-6 w-6" />
          ) : (
            <MicOff className="h-6 w-6" />
          )
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </Button>
    </div>
  )
}
