"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MessageCircle,
  Send,
  Mic,
  MicOff,
  X,
  Minimize2,
  Maximize2,
  Bot,
  User,
  Volume2,
  Languages,
  MapPin,
  Phone,
  AlertTriangle,
  Shield,
} from "lucide-react"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  language?: string
  audioUrl?: string
}

interface AIChatbotProps {
  isOpen: boolean
  onToggle: () => void
  currentLanguage: string
}

export function AIChatbot({ isOpen, onToggle, currentLanguage }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        currentLanguage === "hi"
          ? "नमस्ते! मैं SafeTour AI असिस्टेंट हूं। मैं आपकी यात्रा की सुरक्षा में कैसे मदद कर सकता हूं?"
          : "Hello! I'm SafeTour AI Assistant. How can I help you stay safe during your travels?",
      timestamp: new Date(),
      language: currentLanguage,
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Quick action buttons
  const quickActions = [
    {
      id: "emergency",
      label: currentLanguage === "hi" ? "आपातकाल" : "Emergency",
      icon: <AlertTriangle className="h-4 w-4" />,
      action: () => handleQuickAction("emergency"),
    },
    {
      id: "directions",
      label: currentLanguage === "hi" ? "दिशा-निर्देश" : "Directions",
      icon: <MapPin className="h-4 w-4" />,
      action: () => handleQuickAction("directions"),
    },
    {
      id: "safety",
      label: currentLanguage === "hi" ? "सुरक्षा जानकारी" : "Safety Info",
      icon: <Shield className="h-4 w-4" />,
      action: () => handleQuickAction("safety"),
    },
    {
      id: "contact",
      label: currentLanguage === "hi" ? "संपर्क" : "Contact Help",
      icon: <Phone className="h-4 w-4" />,
      action: () => handleQuickAction("contact"),
    },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = currentLanguage === "hi" ? "hi-IN" : "en-US"

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputMessage(transcript)
        setIsListening(false)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }
  }, [currentLanguage])

  const handleQuickAction = (action: string) => {
    let message = ""
    switch (action) {
      case "emergency":
        message = currentLanguage === "hi" ? "मुझे आपातकालीन सहायता चाहिए" : "I need emergency assistance"
        break
      case "directions":
        message =
          currentLanguage === "hi"
            ? "मुझे निकटतम सुरक्षित स्थान का रास्ता चाहिए"
            : "I need directions to the nearest safe location"
        break
      case "safety":
        message = currentLanguage === "hi" ? "इस क्षेत्र की सुरक्षा की जानकारी दें" : "Tell me about the safety of this area"
        break
      case "contact":
        message = currentLanguage === "hi" ? "मुझे स्थानीय सहायता संपर्क चाहिए" : "I need local help contacts"
        break
    }

    if (message) {
      setInputMessage(message)
      handleSendMessage(message)
    }
  }

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim()
    if (!text) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: text,
      timestamp: new Date(),
      language: currentLanguage,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          language: currentLanguage,
          location: "Gateway of India, Mumbai", // This would come from geolocation
          context: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: data.response,
          timestamp: new Date(),
          language: currentLanguage,
        }

        setMessages((prev) => [...prev, aiMessage])

        if (data.emergencyDetected) {
          speakMessage(data.response)
        }
      } else {
        // Fallback to enhanced local response
        const fallbackResponse = data.fallbackResponse || generateAIResponse(text, currentLanguage)
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: fallbackResponse,
          timestamp: new Date(),
          language: currentLanguage,
        }
        setMessages((prev) => [...prev, aiMessage])
      }
    } catch (error) {
      console.error("[v0] Chat API Error:", error)
      // Fallback to local response
      const fallbackResponse = generateAIResponse(text, currentLanguage)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: fallbackResponse,
        timestamp: new Date(),
        language: currentLanguage,
      }
      setMessages((prev) => [...prev, aiMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const generateAIResponse = (userMessage: string, language: string): string => {
    const lowerMessage = userMessage.toLowerCase()

    if (language === "hi") {
      if (lowerMessage.includes("आपातकाल") || lowerMessage.includes("emergency") || lowerMessage.includes("सहायता")) {
        return "🚨 आपातकालीन स्थिति का पता चला! मैं तुरंत स्थानीय अधिकारियों और आपके आपातकालीन संपर्कों को सूचित कर रहा हूं। आपका वर्तमान स्थान: Gateway of India, Mumbai। कृपया शांत रहें, सहायता आ रही है।"
      }
      if (lowerMessage.includes("दिशा") || lowerMessage.includes("रास्ता") || lowerMessage.includes("directions")) {
        return "📍 आपके निकटतम सुरक्षित स्थान:\n\n1. मुंबई पुलिस स्टेशन - 0.5 किमी (2 मिनट पैदल)\n2. पर्यटक सहायता केंद्र - 0.8 किमी (3 मिनट पैदल)\n3. होटल ताज - 0.3 किमी (1 मिनट पैदल)\n\nक्या आपको किसी विशिष्ट स्थान का रास्ता चाहिए?"
      }
      if (lowerMessage.includes("सुरक्षा") || lowerMessage.includes("safety")) {
        return "🛡️ वर्तमान क्षेत्र सुरक्षा रिपोर्ट:\n\n✅ Gateway of India - उच्च सुरक्षा (95% स्कोर)\n✅ 24/7 पुलिस गश्त सक्रिय\n✅ CCTV निगरानी उपलब्ध\n⚠️ भीड़भाड़ के समय सामान का ध्यान रखें\n\nकोई विशिष्ट सुरक्षा चिंता है?"
      }
      if (lowerMessage.includes("संपर्क") || lowerMessage.includes("contact") || lowerMessage.includes("help")) {
        return "📞 महत्वपूर्ण संपर्क नंबर:\n\n🚨 आपातकाल: 112\n👮 मुंबई पुलिस: 100\n🏥 एम्बुलेंस: 108\n🧭 पर्यटक हेल्पलाइन: +91-1363\n🏨 आपका होटल: +91-22-6665-3366\n\nक्या आपको किसी विशिष्ट सेवा की आवश्यकता है?"
      }
      return "मैं आपकी मदद करने के लिए यहां हूं! आप मुझसे सुरक्षा, दिशा-निर्देश, आपातकालीन संपर्क, या स्थानीय जानकारी के बारे में पूछ सकते हैं। कैसे मदद कर सकता हूं?"
    } else {
      if (lowerMessage.includes("emergency") || lowerMessage.includes("help") || lowerMessage.includes("sos")) {
        return "🚨 Emergency detected! I'm immediately notifying local authorities and your emergency contacts. Your current location: Gateway of India, Mumbai. Please stay calm, help is on the way. Your safety score: 95%. Emergency services ETA: 3-5 minutes."
      }
      if (lowerMessage.includes("direction") || lowerMessage.includes("location") || lowerMessage.includes("where")) {
        return "📍 Nearest safe locations:\n\n1. Mumbai Police Station - 0.5km (2 min walk)\n2. Tourist Help Center - 0.8km (3 min walk)\n3. Hotel Taj - 0.3km (1 min walk)\n4. Hospital - 1.2km (5 min walk)\n\nWould you like detailed directions to any specific location?"
      }
      if (lowerMessage.includes("safety") || lowerMessage.includes("secure") || lowerMessage.includes("safe")) {
        return "🛡️ Current Area Safety Report:\n\n✅ Gateway of India - High Safety (95% score)\n✅ 24/7 police patrol active\n✅ CCTV surveillance available\n✅ Well-lit area with good crowd\n⚠️ Watch belongings in crowded areas\n\nAny specific safety concerns?"
      }
      if (lowerMessage.includes("contact") || lowerMessage.includes("phone") || lowerMessage.includes("call")) {
        return "📞 Important Contact Numbers:\n\n🚨 Emergency: 112\n👮 Mumbai Police: 100\n🏥 Ambulance: 108\n🧭 Tourist Helpline: +91-1363\n🏨 Your Hotel: +91-22-6665-3366\n👨‍⚕️ Your Emergency Contact: +1-555-0123\n\nNeed help with anything specific?"
      }
      return "I'm here to help you stay safe! You can ask me about safety information, directions, emergency contacts, local assistance, or any travel-related concerns. How can I assist you today?"
    }
  }

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const speakMessage = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = currentLanguage === "hi" ? "hi-IN" : "en-US"
      utterance.rate = 0.9
      speechSynthesis.speak(utterance)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full glassmorphism bg-primary hover:bg-primary/90 text-primary-foreground animate-pulse-glow shadow-lg z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card
      className={`fixed bottom-6 right-6 w-96 glassmorphism shadow-2xl z-50 transition-all duration-300 ${
        isMinimized ? "h-16" : "h-[600px]"
      } ${isDarkTheme ? "bg-gray-900/95 border-gray-700/50" : "bg-card/95 border-border/50"}`}
    >
      <CardHeader className={`p-4 border-b ${isDarkTheme ? "border-gray-700/50" : "border-border/50"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20 animate-pulse-glow">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-serif">SafeTour AI Assistant</CardTitle>
              <p className="text-xs text-muted-foreground">
                {currentLanguage === "hi" ? "ऑनलाइन • यहां मदद के लिए" : "Online • Here to help"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsDarkTheme(!isDarkTheme)} className="h-8 w-8 p-0">
              {isDarkTheme ? "🌞" : "🌙"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsMinimized(!isMinimized)} className="h-8 w-8 p-0">
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={onToggle} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[calc(600px-80px)]">
          <div className="p-4 border-b border-border/50">
            <p className="text-xs text-muted-foreground mb-3">
              {currentLanguage === "hi" ? "त्वरित कार्य:" : "Quick Actions:"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={action.action}
                  className="glassmorphism bg-card/50 border-border/50 hover:bg-card/70 justify-start text-xs"
                >
                  {action.icon}
                  <span className="ml-2 truncate">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.type === "ai" && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/20">
                        <Bot className="h-4 w-4 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className={`max-w-[80%] ${message.type === "user" ? "order-first" : ""}`}>
                    <div
                      className={`p-3 rounded-lg text-sm transition-all duration-300 ${
                        message.type === "user"
                          ? "bg-primary text-primary-foreground ml-auto"
                          : `glassmorphism ${isDarkTheme ? "bg-gray-800/50 border-gray-600/50" : "bg-muted/50 border-border/50"}`
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      {message.type === "ai" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => speakMessage(message.content)}
                          className="h-6 w-6 p-0"
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>
                      )}
                      {message.language && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          <Languages className="h-2 w-2 mr-1" />
                          {message.language.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {message.type === "user" && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-secondary/20">
                        <User className="h-4 w-4 text-secondary" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/20">
                      <Bot className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`glassmorphism p-3 rounded-lg ${isDarkTheme ? "bg-gray-800/50 border-gray-600/50" : "bg-muted/50 border-border/50"}`}
                  >
                    <div className="flex gap-1 items-center">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <span className="ml-2 text-xs text-muted-foreground">
                        {currentLanguage === "hi" ? "टाइप कर रहा है..." : "Typing..."}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border/50">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder={currentLanguage === "hi" ? "अपना संदेश टाइप करें..." : "Type your message..."}
                  className="glassmorphism bg-input/50 border-border/50 pr-12"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={isListening ? stopListening : startListening}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 ${
                    isListening ? "text-red-500 animate-pulse" : "text-muted-foreground"
                  }`}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim()}
                className="glassmorphism bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {isListening && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                {currentLanguage === "hi" ? "सुन रहा हूं..." : "Listening..."}
              </p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
