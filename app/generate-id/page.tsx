"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Shield,
  User,
  MapPin,
  Phone,
  Download,
  Share2,
  QrCode,
  Star,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Globe,
  Heart,
  Zap,
  Sparkles,
  Eye,
  Crown,
} from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider"
import { EmergencyNotificationSystem } from "@/components/emergency-notification-system"
import { AccessibilityControls } from "@/components/accessibility-controls"
import { LoadingSkeleton } from "@/components/loading-skeleton"

const TouristIDCard = ({ formData, isFlipped, onFlip }: any) => {
  const safetyScore = 95
  const { currentLanguage, translate } = useLanguage()

  return (
    <div className="relative w-full max-w-md mx-auto h-80 perspective-1000">
      <div
        className={`relative w-full h-full transition-all duration-1000 transform-style-preserve-3d cursor-pointer hover:scale-105 ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        onClick={onFlip}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <div className="absolute inset-0 w-full h-full backface-hidden" style={{ backfaceVisibility: "hidden" }}>
          <Card className="w-full h-full luxury-card glassmorphism-gold-strong border-2 border-primary/40 overflow-hidden relative group">
            <CardContent className="p-6 h-full flex flex-col justify-between relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 animate-gold-shimmer opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 animate-pulse-slow" />

              <div className="absolute inset-0 overflow-hidden">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-primary/80 rounded-full animate-luxury-float"
                    style={{
                      left: `${15 + i * 12}%`,
                      top: `${25 + (i % 4) * 18}%`,
                      animationDelay: `${i * 0.7}s`,
                      animationDuration: `${4 + i * 0.3}s`,
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/30 animate-gold-pulse-glow border-2 border-primary/40">
                    <Crown className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary tracking-wider font-serif">SAFETOUR PREMIUM</p>
                    <p className="text-xs text-secondary font-medium">{translate("id.digital")}</p>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-primary/30 to-secondary/30 text-primary border-primary/40 animate-gold-pulse-glow shadow-lg font-bold">
                  <Star className="h-3 w-3 mr-1 animate-spin-slow" />
                  {safetyScore}%
                </Badge>
              </div>

              <div className="flex items-center gap-4 relative z-10">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/40 to-secondary/40 p-1 border-2 border-primary/30 shadow-xl">
                    <div className="w-full h-full rounded-xl overflow-hidden bg-card">
                      {formData.photo ? (
                        <img
                          src={formData.photo || "/placeholder.svg"}
                          alt="Tourist"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                          <User className="h-8 w-8 text-primary" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-card animate-pulse">
                    <Shield className="h-3 w-3 text-primary-foreground" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-serif font-bold text-xl text-primary mb-1 tracking-wide">
                    {formData.fullName || "Tourist Name"}
                  </h3>
                  <p className="text-sm text-secondary font-medium mb-2">{formData.nationality || "Nationality"}</p>
                  <p className="text-xs text-primary font-mono bg-primary/10 px-3 py-1 rounded-lg border border-primary/20 font-bold">
                    ID: TST-{Math.random().toString(36).substr(2, 8).toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between relative z-10">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center border-2 border-primary/30 shadow-xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <QrCode className="h-16 w-16 text-foreground relative z-10" />
                  <div className="absolute top-1 right-1 w-3 h-3 bg-secondary rounded-full animate-pulse" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Valid Until</p>
                  <p className="text-sm font-bold text-primary">
                    {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                  <Badge variant="outline" className="text-xs mt-1 border-secondary/30 text-secondary">
                    <CheckCircle className="h-2 w-2 mr-1" />
                    {translate("id.verified")}
                  </Badge>
                </div>
              </div>

              <div className="absolute bottom-3 right-3 w-12 h-12 rounded-full relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary animate-spin-slow opacity-80" />
                <div className="absolute inset-1 bg-gradient-to-br from-primary/80 via-secondary/60 to-primary/80 rounded-full animate-pulse" />
                <div className="absolute inset-2 bg-card rounded-full flex items-center justify-center">
                  <Crown className="h-4 w-4 text-primary animate-pulse" />
                </div>
              </div>

              <div className="absolute top-3 right-3">
                <Badge className="bg-gradient-to-r from-secondary/20 to-primary/20 text-primary border-primary/30 text-xs animate-gold-pulse-glow">
                  <Shield className="h-2 w-2 mr-1" />
                  {translate("id.blockchain")}
                </Badge>
              </div>

              <div className="absolute top-6 right-16">
                <Sparkles className="h-3 w-3 text-primary animate-pulse" />
              </div>
              <div className="absolute bottom-16 left-6">
                <Sparkles className="h-2 w-2 text-secondary animate-pulse" style={{ animationDelay: "1s" }} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <Card className="w-full h-full luxury-card glassmorphism-gold-strong border-2 border-secondary/40 relative overflow-hidden">
            <CardContent className="p-6 h-full flex flex-col justify-between relative">
              <div className="absolute inset-0 bg-gradient-to-bl from-secondary/10 via-transparent to-primary/10 animate-gold-shimmer" />

              <div className="relative z-10">
                <h4 className="font-serif font-bold text-sm text-primary mb-4 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary animate-pulse" />
                  {translate("emergency.contacts")}
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="p-3 glassmorphism-gold border border-primary/30 rounded-xl">
                    <p className="font-bold text-primary mb-1">{formData.emergencyName || "Emergency Contact"}</p>
                    <p className="text-muted-foreground font-mono">{formData.emergencyPhone || "+1-XXX-XXX-XXXX"}</p>
                  </div>
                  <div className="p-3 glassmorphism-gold border border-secondary/30 rounded-xl">
                    <p className="font-bold text-secondary mb-1">Tourist Helpline</p>
                    <p className="text-muted-foreground font-mono">+91-1363</p>
                  </div>
                </div>
              </div>

              <div className="relative z-10">
                <h4 className="font-serif font-bold text-sm text-primary mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-secondary animate-pulse" />
                  Trip Highlights
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2 glassmorphism-gold border border-primary/20 rounded-lg">
                    <span className="text-muted-foreground">Destination:</span>
                    <span className="font-semibold text-primary">{formData.destination || "India"}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 glassmorphism-gold border border-secondary/20 rounded-lg">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-semibold text-secondary">{formData.duration || "7 days"}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 glassmorphism-gold border border-primary/20 rounded-lg">
                    <span className="text-muted-foreground">Purpose:</span>
                    <span className="font-semibold text-primary">{formData.purpose || "Tourism"}</span>
                  </div>
                </div>
              </div>

              <div className="text-center relative z-10">
                <p className="text-xs text-muted-foreground mb-2 flex items-center justify-center gap-1">
                  <Shield className="h-3 w-3" />
                  Blockchain Hash
                </p>
                <div className="p-3 glassmorphism-gold border border-primary/30 rounded-xl">
                  <p className="text-xs font-mono text-primary break-all font-bold">
                    0x{Math.random().toString(16).substr(2, 32)}
                  </p>
                </div>
                <Badge className="mt-2 bg-secondary/20 text-secondary border-secondary/30 text-xs animate-gold-pulse-glow">
                  <CheckCircle className="h-2 w-2 mr-1" />
                  Immutable Record
                </Badge>
              </div>

              <div className="absolute bottom-3 left-3 w-8 h-8 rounded-full bg-gradient-to-r from-secondary via-primary to-secondary animate-spin-slow opacity-60" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Multi-step form component
const MultiStepForm = ({ currentStep, formData, setFormData, onNext, onPrev }: any) => {
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (field: string, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setFormData((prev: any) => ({ ...prev, [field]: e.target?.result }))
    }
    reader.readAsDataURL(file)
  }

  switch (currentStep) {
    case 1:
      return (
        <Card className="glassmorphism bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName || ""}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Enter your full name"
                  className="glassmorphism bg-input/50 border-border/50"
                />
              </div>
              <div>
                <Label htmlFor="nationality">Nationality *</Label>
                <Select onValueChange={(value) => handleInputChange("nationality", value)}>
                  <SelectTrigger className="glassmorphism bg-input/50 border-border/50">
                    <SelectValue placeholder="Select nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indian">Indian</SelectItem>
                    <SelectItem value="american">American</SelectItem>
                    <SelectItem value="british">British</SelectItem>
                    <SelectItem value="canadian">Canadian</SelectItem>
                    <SelectItem value="australian">Australian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="passportNumber">Passport Number *</Label>
                <Input
                  id="passportNumber"
                  value={formData.passportNumber || ""}
                  onChange={(e) => handleInputChange("passportNumber", e.target.value)}
                  placeholder="Enter passport number"
                  className="glassmorphism bg-input/50 border-border/50"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth || ""}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  className="glassmorphism bg-input/50 border-border/50"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="photo">Upload Photo *</Label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload("photo", e.target.files[0])}
                  className="hidden"
                  id="photo-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("photo-upload")?.click()}
                  className="glassmorphism bg-card/50 border-border/50 hover:bg-card/70 w-full"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {formData.photo ? "Photo Uploaded" : "Upload Photo"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )

    case 2:
      return (
        <Card className="glassmorphism bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Travel Itinerary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="destination">Destination *</Label>
                <Input
                  id="destination"
                  value={formData.destination || ""}
                  onChange={(e) => handleInputChange("destination", e.target.value)}
                  placeholder="e.g., Mumbai, India"
                  className="glassmorphism bg-input/50 border-border/50"
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration *</Label>
                <Input
                  id="duration"
                  value={formData.duration || ""}
                  onChange={(e) => handleInputChange("duration", e.target.value)}
                  placeholder="e.g., 7 days"
                  className="glassmorphism bg-input/50 border-border/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="arrivalDate">Arrival Date *</Label>
                <Input
                  id="arrivalDate"
                  type="date"
                  value={formData.arrivalDate || ""}
                  onChange={(e) => handleInputChange("arrivalDate", e.target.value)}
                  className="glassmorphism bg-input/50 border-border/50"
                />
              </div>
              <div>
                <Label htmlFor="departureDate">Departure Date *</Label>
                <Input
                  id="departureDate"
                  type="date"
                  value={formData.departureDate || ""}
                  onChange={(e) => handleInputChange("departureDate", e.target.value)}
                  className="glassmorphism bg-input/50 border-border/50"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="purpose">Purpose of Visit *</Label>
              <Select onValueChange={(value) => handleInputChange("purpose", value)}>
                <SelectTrigger className="glassmorphism bg-input/50 border-border/50">
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tourism">Tourism</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="family">Family Visit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="accommodation">Accommodation Details</Label>
              <Textarea
                id="accommodation"
                value={formData.accommodation || ""}
                onChange={(e) => handleInputChange("accommodation", e.target.value)}
                placeholder="Hotel name, address, contact details..."
                className="glassmorphism bg-input/50 border-border/50"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )

    case 3:
      return (
        <Card className="glassmorphism bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyName">Emergency Contact Name *</Label>
                <Input
                  id="emergencyName"
                  value={formData.emergencyName || ""}
                  onChange={(e) => handleInputChange("emergencyName", e.target.value)}
                  placeholder="Full name"
                  className="glassmorphism bg-input/50 border-border/50"
                />
              </div>
              <div>
                <Label htmlFor="emergencyRelation">Relationship *</Label>
                <Input
                  id="emergencyRelation"
                  value={formData.emergencyRelation || ""}
                  onChange={(e) => handleInputChange("emergencyRelation", e.target.value)}
                  placeholder="e.g., Spouse, Parent, Friend"
                  className="glassmorphism bg-input/50 border-border/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyPhone">Phone Number *</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyPhone || ""}
                  onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                  placeholder="+1-XXX-XXX-XXXX"
                  className="glassmorphism bg-input/50 border-border/50"
                />
              </div>
              <div>
                <Label htmlFor="emergencyEmail">Email Address</Label>
                <Input
                  id="emergencyEmail"
                  type="email"
                  value={formData.emergencyEmail || ""}
                  onChange={(e) => handleInputChange("emergencyEmail", e.target.value)}
                  placeholder="email@example.com"
                  className="glassmorphism bg-input/50 border-border/50"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="medicalInfo">Medical Information (Optional)</Label>
              <Textarea
                id="medicalInfo"
                value={formData.medicalInfo || ""}
                onChange={(e) => handleInputChange("medicalInfo", e.target.value)}
                placeholder="Allergies, medications, medical conditions..."
                className="glassmorphism bg-input/50 border-border/50"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="insuranceInfo">Travel Insurance Details (Optional)</Label>
              <Textarea
                id="insuranceInfo"
                value={formData.insuranceInfo || ""}
                onChange={(e) => handleInputChange("insuranceInfo", e.target.value)}
                placeholder="Insurance provider, policy number, contact..."
                className="glassmorphism bg-input/50 border-border/50"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )

    default:
      return null
  }
}

export default function GenerateIDPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({})
  const [isCardFlipped, setIsCardFlipped] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const { currentLanguage, translate } = useLanguage()

  const totalSteps = 3
  const progress = (currentStep / totalSteps) * 100

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      handleGenerateID()
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGenerateID = async () => {
    setIsGenerating(true)
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500)) // KYC verification
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Blockchain transaction
    await new Promise((resolve) => setTimeout(resolve, 1000)) // ID generation
    setIsGenerating(false)
    setIsLoading(false)
    setIsGenerated(true)
  }

  const handleDownload = () => {
    const formats = ["PDF", "PNG", "SVG"]
    const format = formats[Math.floor(Math.random() * formats.length)]
    const link = document.createElement("a")
    link.href = "#"
    link.download = `tourist-id-${formData.fullName || "tourist"}.${format.toLowerCase()}`
    link.click()

    // Show success notification
    if (typeof window !== "undefined") {
      const event = new CustomEvent("notification", {
        detail: {
          type: "success",
          title: currentLanguage === "hi" ? "डाउनलोड सफल" : "Download Successful",
          message:
            currentLanguage === "hi" ? `आईडी ${format} फॉर्मेट में डाउनलोड हो गई` : `ID downloaded in ${format} format`,
        },
      })
      window.dispatchEvent(event)
    }
  }

  const handleShare = () => {
    const shareUrl = `https://safetour.ai/verify/${Math.random().toString(36).substr(2, 16)}`
    if (navigator.share) {
      navigator.share({
        title: "My Digital Tourist ID",
        text: "Check out my secure digital tourist ID",
        url: shareUrl,
      })
    } else {
      navigator.clipboard.writeText(shareUrl)
      alert(
        currentLanguage === "hi"
          ? "सुरक्षित सत्यापन लिंक क्लिपबोर्ड में कॉपी हो गया!"
          : "Secure verification link copied to clipboard!",
      )
    }
  }

  const handleEmergencyAction = (action: string, data: any) => {
    console.log("[v0] Emergency action triggered:", action, data)
    // Handle emergency actions from notification system
    switch (action) {
      case "view_details":
        // Open emergency details modal
        break
      case "contact_emergency":
        // Initiate emergency contact
        break
      default:
        break
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="glassmorphism bg-card/30 border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="glassmorphism bg-card/50 border-border/50">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-serif font-bold text-xl text-foreground">{translate("id.generate")}</h1>
              <p className="text-sm text-muted-foreground">Secure blockchain-based identification</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="relative">
              <EmergencyNotificationSystem
                currentLanguage={currentLanguage}
                onEmergencyAction={handleEmergencyAction}
              />
            </div>
            <div className="relative">
              <AccessibilityControls currentLanguage={currentLanguage} />
            </div>
            <Badge className="glassmorphism bg-primary/20 text-primary border-primary/30 animate-pulse-glow">
              <Shield className="h-4 w-4 mr-2" />
              {translate("id.blockchain")}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="max-w-4xl mx-auto">
            <LoadingSkeleton variant="form" className="mb-8" />
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-primary">
                <Zap className="h-5 w-5 animate-spin" />
                <span className="text-lg font-semibold">
                  {currentLanguage === "hi" ? "आईडी जेनरेट हो रही है..." : "Generating your ID..."}
                </span>
              </div>
            </div>
          </div>
        ) : !isGenerated ? (
          <div className="max-w-4xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif font-bold text-2xl text-foreground">
                  Step {currentStep} of {totalSteps}
                </h2>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-3 glassmorphism bg-muted/50">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 animate-pulse-glow"
                  style={{ width: `${progress}%` }}
                />
              </Progress>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-center mb-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300
                    ${
                      step <= currentStep
                        ? "bg-primary text-primary-foreground animate-pulse-glow"
                        : "bg-muted text-muted-foreground"
                    }
                  `}
                  >
                    {step < currentStep ? <CheckCircle className="h-5 w-5" /> : step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`
                      w-16 h-1 mx-2 transition-all duration-300
                      ${step < currentStep ? "bg-primary" : "bg-muted"}
                    `}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Form */}
            <MultiStepForm
              currentStep={currentStep}
              formData={formData}
              setFormData={setFormData}
              onNext={handleNext}
              onPrev={handlePrev}
            />

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="glassmorphism bg-card/50 border-border/50 hover:bg-card/70"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {translate("common.previous")}
              </Button>

              <Button
                onClick={handleNext}
                disabled={isGenerating}
                className="glassmorphism bg-primary hover:bg-primary/90 text-primary-foreground animate-pulse-glow"
              >
                {isGenerating ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    {currentLanguage === "hi" ? "आईडी बनाई जा रही है..." : "Generating ID..."}
                  </>
                ) : currentStep === totalSteps ? (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    {translate("id.generate")}
                  </>
                ) : (
                  <>
                    {translate("common.next")}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Generated ID Display */
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <Badge className="mb-4 glassmorphism bg-secondary/20 text-secondary border-secondary/30 animate-pulse-glow">
                <CheckCircle className="h-4 w-4 mr-2" />
                {currentLanguage === "hi" ? "आईडी सफलतापूर्वक बनाई गई" : "ID Successfully Generated"}
              </Badge>
              <h2 className="font-serif font-bold text-4xl mb-4 text-foreground">{translate("id.digital")}</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                {currentLanguage === "hi"
                  ? "आपकी सुरक्षित ब्लॉकचेन-आधारित पर्यटक आईडी बनाई गई है। विवरण देखने के लिए कार्ड पर क्लिक करें।"
                  : "Your secure blockchain-based tourist ID has been generated. Click the card to flip and view details."}
              </p>
            </div>

            <div className="mb-8" ref={cardRef}>
              <TouristIDCard
                formData={formData}
                isFlipped={isCardFlipped}
                onFlip={() => setIsCardFlipped(!isCardFlipped)}
              />
              <p className="text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
                <Eye className="h-4 w-4" />
                {currentLanguage === "hi"
                  ? "कार्ड को फ्लिप करने के लिए क्लिक करें"
                  : "Click the card to flip and view back details"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button
                onClick={handleDownload}
                className="glassmorphism bg-primary hover:bg-primary/90 text-primary-foreground animate-pulse-glow"
              >
                <Download className="h-4 w-4 mr-2" />
                {translate("common.download")}
              </Button>

              <Button
                variant="outline"
                onClick={handleShare}
                className="glassmorphism bg-card/50 border-border/50 hover:bg-card/70"
              >
                <Share2 className="h-4 w-4 mr-2" />
                {translate("common.share")}
              </Button>

              <Button variant="outline" className="glassmorphism bg-card/50 border-border/50 hover:bg-card/70">
                <QrCode className="h-4 w-4 mr-2" />
                {translate("common.export")}
              </Button>
            </div>

            {/* Blockchain Transaction Info */}
            <Card className="glassmorphism bg-card/50 border-border/50 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2 justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                  {translate("blockchain.details")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">{translate("blockchain.hash")}:</p>
                    <p className="font-mono text-primary">0x{Math.random().toString(16).substr(2, 32)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{translate("blockchain.block")}:</p>
                    <p className="font-mono text-foreground">{Math.floor(Math.random() * 1000000)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{translate("blockchain.gas")}:</p>
                    <p className="font-mono text-foreground">{Math.floor(Math.random() * 50000 + 21000)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{translate("blockchain.timestamp")}:</p>
                    <p className="font-mono text-foreground">{new Date().toLocaleString()}</p>
                  </div>
                </div>
                <Separator />
                <div className="text-center">
                  <Badge className="bg-secondary/20 text-secondary border-secondary/30">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {translate("blockchain.verified")}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <div className="mt-12">
              <h3 className="font-serif font-bold text-2xl mb-6 text-foreground">{translate("next.title")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glassmorphism bg-card/50 border-border/50 p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-center">
                    <div className="p-3 rounded-xl bg-primary/20 w-fit mx-auto mb-4">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-serif font-bold text-lg mb-2 text-foreground">{translate("next.dashboard")}</h4>
                    <p className="text-sm text-muted-foreground mb-4">{translate("next.dashboard_desc")}</p>
                    <Button variant="outline" size="sm" className="glassmorphism bg-card/50 border-border/50">
                      {translate("next.go_dashboard")}
                    </Button>
                  </div>
                </Card>

                <Card className="glassmorphism bg-card/50 border-border/50 p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-center">
                    <div className="p-3 rounded-xl bg-secondary/20 w-fit mx-auto mb-4">
                      <Heart className="h-6 w-6 text-secondary" />
                    </div>
                    <h4 className="font-serif font-bold text-lg mb-2 text-foreground">{translate("next.tracking")}</h4>
                    <p className="text-sm text-muted-foreground mb-4">{translate("next.tracking_desc")}</p>
                    <Button variant="outline" size="sm" className="glassmorphism bg-card/50 border-border/50">
                      {translate("next.enable")}
                    </Button>
                  </div>
                </Card>

                <Card className="glassmorphism bg-card/50 border-border/50 p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-center">
                    <div className="p-3 rounded-xl bg-yellow-500/20 w-fit mx-auto mb-4">
                      <Globe className="h-6 w-6 text-yellow-500" />
                    </div>
                    <h4 className="font-serif font-bold text-lg mb-2 text-foreground">{translate("next.app")}</h4>
                    <p className="text-sm text-muted-foreground mb-4">{translate("next.app_desc")}</p>
                    <Button variant="outline" size="sm" className="glassmorphism bg-card/50 border-border/50">
                      {translate("next.download")}
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
