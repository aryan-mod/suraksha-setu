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
  Sparkles,
  Loader2,
} from "lucide-react"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  language?: string
  isTyping?: boolean
}

interface ChatbotSidebarProps {
  isOpen: boolean
  onToggle: () => void
  currentLanguage: string
}

export function ChatbotSidebar({ isOpen, onToggle, currentLanguage }: ChatbotSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        currentLanguage === "hi"
          ? "नमस्ते! मैं SafeTour AI असिस्टेंट हूं। मैं Google Gemini द्वारा संचालित हूं और आपकी यात्रा की सुरक्षा में मदद कर सकता हूं। कैसे सहायता कर सकता हूं?"
          : "Hello! I'm SafeTour AI Assistant, powered by Google Gemini. I'm here to help keep you safe during your travels. How can I assist you today?",
      timestamp: new Date(),
      language: currentLanguage,
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Quick action buttons with enhanced functionality
  const quickActions = [
    {
      id: "emergency",
      label: currentLanguage === "hi" ? "आपातकाल सहायता" : "Emergency Help",
      icon: <AlertTriangle className="h-4 w-4" />,
      action: () => handleQuickAction("emergency"),
      color: "bg-red-500/10 border-red-500/20 text-red-600 hover:bg-red-500/20",
    },
    {
      id: "directions",
      label: currentLanguage === "hi" ? "सुरक्षित मार्ग" : "Safe Routes",
      icon: <MapPin className="h-4 w-4" />,
      action: () => handleQuickAction("directions"),
      color: "bg-blue-500/10 border-blue-500/20 text-blue-600 hover:bg-blue-500/20",
    },
    {
      id: "safety",
      label: currentLanguage === "hi" ? "सुरक्षा सुझाव" : "Safety Tips",
      icon: <Shield className="h-4 w-4" />,
      action: () => handleQuickAction("safety"),
      color: "bg-green-500/10 border-green-500/20 text-green-600 hover:bg-green-500/20",
    },
    {
      id: "contact",
      label: currentLanguage === "hi" ? "आपातकालीन संपर्क" : "Emergency Contacts",
      icon: <Phone className="h-4 w-4" />,
      action: () => handleQuickAction("contact"),
      color: "bg-purple-500/10 border-purple-500/20 text-purple-600 hover:bg-purple-500/20",
    },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize speech recognition with enhanced error handling
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
        // Auto-send voice messages for emergency scenarios
        if (transcript.toLowerCase().includes("emergency") || transcript.toLowerCase().includes("help")) {
          handleSendMessage(transcript)
        }
      }

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
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
        message =
          currentLanguage === "hi"
            ? "मुझे तत्काल आपातकालीन सहायता चाहिए। कृपया मुझे बताएं कि क्या करना चाहिए।"
            : "I need immediate emergency assistance. Please tell me what I should do."
        break
      case "directions":
        message =
          currentLanguage === "hi"
            ? "मुझे निकटतम सुरक्षित स्थान का रास्ता चाहिए। कृपया सबसे सुरक्षित मार्ग बताएं।"
            : "I need directions to the nearest safe location. Please provide the safest route."
        break
      case "safety":
        message =
          currentLanguage === "hi"
            ? "इस क्षेत्र के लिए सुरक्षा सुझाव दें और मुझे बताएं कि किन बातों का ध्यान रखना चाहिए।"
            : "Give me safety tips for this area and tell me what precautions I should take."
        break
      case "contact":
        message =
          currentLanguage === "hi"
            ? "मुझे आपातकालीन संपर्क नंबर चाहिए और बताएं कि किसे कॉल करना चाहिए।"
            : "I need emergency contact numbers and tell me who I should call."
        break
    }

    if (message) {
      setInputMessage(message)
      handleSendMessage(message)
    }
  }

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim()
    if (!text || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: text,
      timestamp: new Date(),
      language: currentLanguage,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)
    setIsTyping(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          language: currentLanguage,
          context: {
            userLocation: "Gateway of India, Mumbai",
            safetyScore: 95,
            isEmergency: text.toLowerCase().includes("emergency") || text.toLowerCase().includes("आपातकाल"),
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

        // Auto-speak emergency responses
        if (text.toLowerCase().includes("emergency") || text.toLowerCase().includes("आपातकाल")) {
          speakMessage(data.response)
        }
      } else {
        throw new Error(data.error || "Failed to get AI response")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content:
          currentLanguage === "hi"
            ? "क्षमा करें, मुझे कुछ तकनीकी समस्या हो रही है। कृपया फिर से कोशिश करें या आपातकाल के लिए 112 डायल करें।"
            : "Sorry, I'm experiencing some technical issues. Please try again or dial 112 for emergencies.",
        timestamp: new Date(),
        language: currentLanguage,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const speakMessage = (text: string) => {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = currentLanguage === "hi" ? "hi-IN" : "en-US"
      utterance.rate = 0.9
      utterance.volume = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full glassmorphism bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl z-50 transition-all duration-300 hover:scale-110"
      >
        <div className="relative">
          <MessageCircle className="h-7 w-7" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <Sparkles className="absolute -top-2 -left-2 h-4 w-4 text-yellow-400 animate-pulse" />
        </div>
      </Button>
    )
  }

  return (
    <Card
      className={`fixed bottom-6 right-6 w-96 glassmorphism shadow-2xl z-50 transition-all duration-500 ${
        isMinimized ? "h-20" : "h-[700px]"
      } ${isDarkTheme ? "bg-gray-900/95 border-gray-700/50" : "bg-card/95 border-border/50"}`}
    >
      <CardHeader className={`p-4 border-b ${isDarkTheme ? "border-gray-700/50" : "border-border/50"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative p-2 rounded-lg bg-primary/20 animate-pulse-glow">
              <Bot className="h-5 w-5 text-primary" />
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400" />
            </div>
            <div>
              <CardTitle className="text-sm font-serif flex items-center gap-2">
                SafeTour AI Assistant
                <Badge className="bg-green-500/20 text-green-600 text-xs">Powered by Gemini</Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
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
        <CardContent className="p-0 flex flex-col h-[calc(700px-88px)]">
          <div className="p-4 border-b border-border/50">
            <p className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              {currentLanguage === "hi" ? "त्वरित कार्य:" : "Quick Actions:"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={action.action}
                  className={`glassmorphism ${action.color} justify-start text-xs transition-all duration-300 hover:scale-105`}
                  disabled={isLoading}
                >
                  {action.icon}
                  <span className="ml-2 truncate">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 max-h-[calc(70vh-200px)] overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
                >
                  {message.type === "ai" && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/20">
                        <Bot className="h-4 w-4 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className={`max-w-[85%] ${message.type === "user" ? "order-first" : ""}`}>
                    <div
                      className={`p-3 rounded-lg text-sm transition-all duration-300 ${
                        message.type === "user"
                          ? "bg-primary text-primary-foreground ml-auto rounded-br-sm"
                          : `glassmorphism ${isDarkTheme ? "bg-gray-800/50 border-gray-600/50" : "bg-muted/50 border-border/50"} rounded-bl-sm`
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
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
                          className="h-6 w-6 p-0 hover:bg-primary/10"
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
                <div className="flex gap-3 justify-start animate-in slide-in-from-bottom-2 duration-300">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/20">
                      <Bot className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`glassmorphism p-3 rounded-lg rounded-bl-sm ${isDarkTheme ? "bg-gray-800/50 border-gray-600/50" : "bg-muted/50 border-border/50"}`}
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
                        {currentLanguage === "hi" ? "AI सोच रहा है..." : "AI is thinking..."}
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
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  placeholder={currentLanguage === "hi" ? "अपना संदेश टाइप करें..." : "Type your message..."}
                  className="glassmorphism bg-input/50 border-border/50 pr-12 focus:ring-2 focus:ring-primary/20"
                  disabled={isLoading}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={isListening ? stopListening : startListening}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 transition-all duration-300 ${
                    isListening ? "text-red-500 animate-pulse scale-110" : "text-muted-foreground hover:text-primary"
                  }`}
                  disabled={isLoading}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="glassmorphism bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-105"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            {isListening && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2 animate-pulse">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                {currentLanguage === "hi" ? "सुन रहा हूं..." : "Listening for voice input..."}
              </p>
            )}
            {isLoading && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                <Sparkles className="h-3 w-3 animate-spin" />
                {currentLanguage === "hi" ? "Gemini AI से जवाब आ रहा है..." : "Getting response from Gemini AI..."}
              </p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
