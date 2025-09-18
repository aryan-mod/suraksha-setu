"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import {
  Shield,
  MapPin,
  AlertTriangle,
  Phone,
  Navigation,
  Clock,
  CheckCircle,
  Zap,
  Heart,
  Activity,
  Bell,
  Route,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Thermometer,
  Wind,
  Eye,
  Smartphone,
  Headphones,
} from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts"
import Link from "next/link"
import { ChatbotSidebar } from "@/components/ChatbotSidebar"
import { VoiceAssistant } from "@/components/voice-assistant"
import { useLanguage } from "@/components/language-provider"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { EnhancedNavbar } from "@/components/enhanced-navbar"
import { FloatingEmergencyButton } from "@/components/floating-emergency-button"
import { EnhancedAlertSystem } from "@/components/enhanced-alert-system"
import { createClient } from "@/lib/supabase/client"
import { EnhancedLocationService } from "@/components/enhanced-location-service"
import { ThemeToggle } from "@/components/theme-toggle"
import { RealTimeNotificationSystem } from "@/components/real-time-notification-system"
import { RealTimeHeatmap } from "@/components/real-time-heatmap"

const safetyData = [
  { name: "Safe", value: 85, color: "#10b981" },
  { name: "Caution", value: 10, color: "#f59e0b" },
  { name: "Risk", value: 5, color: "#ef4444" },
]

const heartRateData = [
  { time: "09:00", rate: 72 },
  { time: "10:00", rate: 75 },
  { time: "11:00", rate: 78 },
  { time: "12:00", rate: 82 },
  { time: "13:00", rate: 79 },
  { time: "14:00", rate: 76 },
  { time: "15:00", rate: 74 },
]

const safetyAnalyticsData = [
  { day: "Mon", score: 92, incidents: 2, alerts: 5 },
  { day: "Tue", score: 88, incidents: 3, alerts: 7 },
  { day: "Wed", score: 95, incidents: 1, alerts: 3 },
  { day: "Thu", score: 90, incidents: 2, alerts: 4 },
  { day: "Fri", score: 87, incidents: 4, alerts: 8 },
  { day: "Sat", score: 93, incidents: 1, alerts: 2 },
  { day: "Sun", score: 96, incidents: 0, alerts: 1 },
]

const mockAlerts = [
  {
    id: "1",
    type: "success" as const,
    title: "Safe Zone Entered",
    message: "You've entered Gateway of India - a verified safe zone with 24/7 security monitoring",
    location: "Gateway of India, Mumbai",
    timestamp: "2 minutes ago",
    isRead: false,
    priority: "low" as const,
  },
  {
    id: "2",
    type: "warning" as const,
    title: "Weather Advisory",
    message: "Light rain expected in your area. Carry an umbrella and avoid outdoor activities",
    location: "Mumbai Central",
    timestamp: "1 hour ago",
    isRead: false,
    priority: "medium" as const,
  },
  {
    id: "3",
    type: "danger" as const,
    title: "High Crime Area Alert",
    message: "You are approaching an area with increased security risks. Consider alternate routes",
    location: "Crawford Market Area",
    timestamp: "3 hours ago",
    isRead: true,
    priority: "high" as const,
  },
]

// Mock travel timeline data
const travelTimeline = [
  {
    id: 1,
    title: "Arrived at Mumbai Airport",
    time: "09:30 AM",
    status: "completed",
    location: "Chhatrapati Shivaji International Airport",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  {
    id: 2,
    title: "Hotel Check-in",
    time: "11:45 AM",
    status: "completed",
    location: "The Taj Mahal Palace Hotel",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  {
    id: 3,
    title: "Gateway of India Visit",
    time: "02:30 PM",
    status: "current",
    location: "Gateway of India, Mumbai",
    icon: <MapPin className="h-4 w-4" />,
  },
  {
    id: 4,
    title: "Marine Drive Walk",
    time: "04:00 PM",
    status: "upcoming",
    location: "Marine Drive, Mumbai",
    icon: <Clock className="h-4 w-4" />,
  },
  {
    id: 5,
    title: "Dinner at Local Restaurant",
    time: "07:30 PM",
    status: "upcoming",
    location: "Trishna Restaurant",
    icon: <Clock className="h-4 w-4" />,
  },
]

// Mock map zones data
const mapZones = [
  { id: 1, name: "Gateway of India", status: "safe", x: 45, y: 60, tourists: 23 },
  { id: 2, name: "Marine Drive", status: "safe", x: 30, y: 45, tourists: 18 },
  { id: 3, name: "Colaba Market", status: "caution", x: 50, y: 70, tourists: 12 },
  { id: 4, name: "Crawford Market", status: "restricted", x: 60, y: 40, tourists: 5 },
  { id: 5, name: "Bandra West", status: "safe", x: 25, y: 30, tourists: 31 },
]

// Panic Button Component
const PanicButton = () => {
  const [isPressed, setIsPressed] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const handlePanicPress = () => {
    setIsPressed(true)
    setCountdown(5)

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Simulate emergency alert
          alert("Emergency alert sent to authorities and emergency contacts!")
          setIsPressed(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleCancel = () => {
    setIsPressed(false)
    setCountdown(0)
  }

  return (
    <Card className="glassmorphism bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Emergency SOS
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        {!isPressed ? (
          <Button
            onClick={handlePanicPress}
            className="w-32 h-32 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground animate-pulse-glow text-lg font-bold"
          >
            <div className="flex flex-col items-center">
              <Zap className="h-8 w-8 mb-2" />
              SOS
            </div>
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="w-32 h-32 rounded-full bg-destructive/20 border-4 border-destructive flex items-center justify-center mx-auto animate-pulse">
              <div className="text-2xl font-bold text-destructive">{countdown}</div>
            </div>
            <p className="text-sm text-muted-foreground">Emergency alert will be sent in {countdown} seconds</p>
            <Button variant="outline" onClick={handleCancel} className="glassmorphism bg-card/50 border-border/50">
              Cancel
            </Button>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-4">
          Hold for 5 seconds to send emergency alert to authorities and your emergency contacts
        </p>
      </CardContent>
    </Card>
  )
}

// Safety Score Component
const SafetyScoreChart = ({ score }: { score: number }) => {
  return (
    <div className="relative w-48 h-48 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={safetyData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            {safetyData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold text-foreground">{score}%</div>
          <div className="text-sm text-muted-foreground">Safety Score</div>
        </div>
      </div>
    </div>
  )
}

// Live Map Component
const LiveMap = ({ isTrackingEnabled }: { isTrackingEnabled: boolean }) => {
  const [selectedZone, setSelectedZone] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationAccuracy, setLocationAccuracy] = useState<number>(0)

  const handleLocationUpdate = (location: any) => {
    setUserLocation({
      lat: location.latitude,
      lng: location.longitude,
    })
    setLocationAccuracy(location.accuracy)
  }

  const handleSafeZoneEnter = (zone: any) => {
    console.log("[v0] Entered safe zone:", zone.name)
    // Could trigger notification here
  }

  const handleSafeZoneExit = (zone: any) => {
    console.log("[v0] Exited safe zone:", zone.name)
    // Could trigger notification here
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Location Service */}
      <EnhancedLocationService
        onLocationUpdate={handleLocationUpdate}
        onSafeZoneEnter={handleSafeZoneEnter}
        onSafeZoneExit={handleSafeZoneExit}
        enableGeofencing={isTrackingEnabled}
      />

      {/* Live Map Visualization */}
      <Card className="glassmorphism bg-card/50 border-border/50" id="live-map">
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Live Safety Map
            {userLocation && <Badge className="ml-auto bg-secondary/20 text-secondary">GPS Active</Badge>}
          </CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Safe</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Caution</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Restricted</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-64 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg overflow-hidden border-2 border-border/20">
            {/* Simulated map background */}
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full bg-gradient-to-br from-blue-200 via-green-200 to-yellow-200"></div>
            </div>

            {/* Map zones */}
            {mapZones.map((zone) => (
              <div
                key={zone.id}
                className={`
                  absolute w-4 h-4 rounded-full cursor-pointer transition-all duration-300 hover:scale-150
                  ${zone.status === "safe" ? "bg-green-500 animate-pulse" : ""}
                  ${zone.status === "caution" ? "bg-yellow-500 animate-pulse" : ""}
                  ${zone.status === "restricted" ? "bg-red-500 animate-pulse" : ""}
                `}
                style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                onClick={() => setSelectedZone(zone)}
              />
            ))}

            {/* Real user location from GPS */}
            {userLocation && isTrackingEnabled && (
              <div
                className="absolute w-6 h-6 rounded-full bg-primary border-2 border-white animate-pulse-glow"
                style={{
                  left: "45%", // In real app, convert GPS coords to map position
                  top: "60%",
                }}
              >
                <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping"></div>
                {/* Accuracy circle */}
                <div
                  className="absolute border-2 border-primary/30 rounded-full animate-pulse"
                  style={{
                    width: `${Math.min(locationAccuracy / 10, 50)}px`,
                    height: `${Math.min(locationAccuracy / 10, 50)}px`,
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
              </div>
            )}

            {/* Geo-fence visualization */}
            {userLocation && isTrackingEnabled && (
              <div
                className="absolute border-2 border-primary/30 rounded-full animate-pulse"
                style={{ left: "35%", top: "50%", width: "20%", height: "30%" }}
              />
            )}
          </div>

          {selectedZone && (
            <div className="mt-4 p-3 glassmorphism bg-card/30 border-border/50 rounded-lg">
              <h4 className="font-semibold text-foreground">{selectedZone.name}</h4>
              <p className="text-sm text-muted-foreground">
                Status:{" "}
                <span
                  className={`font-semibold ${selectedZone.status === "safe" ? "text-green-600" : selectedZone.status === "caution" ? "text-yellow-600" : "text-red-600"}`}
                >
                  {selectedZone.status.charAt(0).toUpperCase() + selectedZone.status.slice(1)}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">Active tourists: {selectedZone.tourists}</p>
            </div>
          )}

          {!isTrackingEnabled && (
            <div className="mt-4 p-4 glassmorphism bg-yellow-500/10 border-yellow-500/20 rounded-lg text-center">
              <WifiOff className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm text-yellow-700">
                Live tracking is disabled. Enable tracking to see your real-time location.
              </p>
            </div>
          )}

          {/* Real location info */}
          {userLocation && (
            <div className="mt-4 p-3 glassmorphism bg-secondary/10 border-secondary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="h-4 w-4 text-secondary" />
                <span className="font-semibold text-secondary">Live GPS Location</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <div>Lat: {userLocation.lat.toFixed(6)}°</div>
                <div>Lng: {userLocation.lng.toFixed(6)}°</div>
                <div>Accuracy: ±{locationAccuracy.toFixed(0)}m</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Travel Timeline Component
const TravelTimeline = () => {
  return (
    <Card className="glassmorphism bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <Route className="h-5 w-5 text-primary" />
          Travel Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {travelTimeline.map((item, index) => (
            <div key={item.id} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${item.status === "completed" ? "bg-green-500 border-green-500 text-white" : ""}
                  ${item.status === "current" ? "bg-primary border-primary text-white animate-pulse-glow" : ""}
                  ${item.status === "upcoming" ? "bg-muted border-border text-muted-foreground" : ""}
                `}
                >
                  {item.icon}
                </div>
                {index < travelTimeline.length - 1 && (
                  <div
                    className={`
                    w-0.5 h-8 mt-2 transition-all duration-300
                    ${item.status === "completed" ? "bg-green-500" : "bg-border"}
                  `}
                  />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-foreground">{item.title}</h4>
                  <span className="text-sm text-muted-foreground">{item.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">{item.location}</p>
                {item.status === "current" && (
                  <Badge className="mt-2 bg-primary/20 text-primary border-primary/30">
                    <Activity className="h-3 w-3 mr-1" />
                    Current Location
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Heart Rate Monitor Component
const HeartRateMonitor = () => {
  const currentHeartRate = 76
  const isNormal = currentHeartRate >= 60 && currentHeartRate <= 100

  return (
    <Card className="glassmorphism bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Health Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-foreground">{currentHeartRate} BPM</div>
            <div className={`text-sm ${isNormal ? "text-green-600" : "text-red-600"}`}>
              {isNormal ? "Normal" : "Alert"}
            </div>
          </div>
          <div className={`p-3 rounded-full ${isNormal ? "bg-green-500/20" : "bg-red-500/20"}`}>
            <Heart className={`h-6 w-6 ${isNormal ? "text-green-600 animate-pulse" : "text-red-600 animate-bounce"}`} />
          </div>
        </div>

        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={heartRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis domain={[60, 90]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: "#ef4444", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// IoT Sensor Panel Component
const IoTSensorPanel = () => {
  const [sensorData, setSensorData] = useState({
    temperature: 28,
    humidity: 65,
    airQuality: 85,
    noiseLevel: 45,
    crowdDensity: 23,
    wifiStrength: 92,
    bluetoothDevices: 12,
    emergencyBeacons: 3,
  })

  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    // Simulate real-time IoT data updates
    const interval = setInterval(() => {
      setSensorData((prev) => ({
        temperature: Math.max(20, Math.min(35, prev.temperature + (Math.random() - 0.5) * 2)),
        humidity: Math.max(40, Math.min(80, prev.humidity + (Math.random() - 0.5) * 5)),
        airQuality: Math.max(60, Math.min(100, prev.airQuality + (Math.random() - 0.5) * 3)),
        noiseLevel: Math.max(30, Math.min(70, prev.noiseLevel + (Math.random() - 0.5) * 8)),
        crowdDensity: Math.max(5, Math.min(50, prev.crowdDensity + Math.floor((Math.random() - 0.5) * 4))),
        wifiStrength: Math.max(70, Math.min(100, prev.wifiStrength + (Math.random() - 0.5) * 5)),
        bluetoothDevices: Math.max(5, Math.min(25, prev.bluetoothDevices + Math.floor((Math.random() - 0.5) * 3))),
        emergencyBeacons: Math.max(1, Math.min(8, prev.emergencyBeacons + Math.floor((Math.random() - 0.5) * 2))),
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getSensorStatus = (value: number, type: string) => {
    switch (type) {
      case "temperature":
        return value > 32 ? "warning" : value < 22 ? "info" : "good"
      case "humidity":
        return value > 70 ? "warning" : value < 50 ? "info" : "good"
      case "airQuality":
        return value > 80 ? "good" : value > 60 ? "warning" : "danger"
      case "noiseLevel":
        return value > 60 ? "warning" : value > 50 ? "info" : "good"
      case "crowdDensity":
        return value > 40 ? "warning" : value > 25 ? "info" : "good"
      default:
        return "good"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-600 bg-green-500/10 border-green-500/20"
      case "warning":
        return "text-yellow-600 bg-yellow-500/10 border-yellow-500/20"
      case "danger":
        return "text-red-600 bg-red-500/10 border-red-500/20"
      case "info":
        return "text-blue-600 bg-blue-500/10 border-blue-500/20"
      default:
        return "text-gray-600 bg-gray-500/10 border-gray-500/20"
    }
  }

  return (
    <Card className="glassmorphism bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-primary" />
          IoT Environmental Sensors
          <Badge className={`ml-auto ${isConnected ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"}`}>
            {isConnected ? "Connected" : "Offline"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div
            className={`p-3 rounded-lg border ${getStatusColor(getSensorStatus(sensorData.temperature, "temperature"))}`}
          >
            <div className="flex items-center justify-between mb-1">
              <Thermometer className="h-4 w-4" />
              <span className="text-xs font-semibold">TEMP</span>
            </div>
            <div className="text-lg font-bold">{sensorData.temperature.toFixed(1)}°C</div>
            <div className="text-xs opacity-75">Comfortable</div>
          </div>

          <div className={`p-3 rounded-lg border ${getStatusColor(getSensorStatus(sensorData.humidity, "humidity"))}`}>
            <div className="flex items-center justify-between mb-1">
              <Wind className="h-4 w-4" />
              <span className="text-xs font-semibold">HUMID</span>
            </div>
            <div className="text-lg font-bold">{sensorData.humidity}%</div>
            <div className="text-xs opacity-75">Normal</div>
          </div>

          <div
            className={`p-3 rounded-lg border ${getStatusColor(getSensorStatus(sensorData.airQuality, "airQuality"))}`}
          >
            <div className="flex items-center justify-between mb-1">
              <Eye className="h-4 w-4" />
              <span className="text-xs font-semibold">AIR</span>
            </div>
            <div className="text-lg font-bold">{sensorData.airQuality}</div>
            <div className="text-xs opacity-75">Good Quality</div>
          </div>

          <div
            className={`p-3 rounded-lg border ${getStatusColor(getSensorStatus(sensorData.noiseLevel, "noiseLevel"))}`}
          >
            <div className="flex items-center justify-between mb-1">
              <Headphones className="h-4 w-4" />
              <span className="text-xs font-semibold">NOISE</span>
            </div>
            <div className="text-lg font-bold">{sensorData.noiseLevel} dB</div>
            <div className="text-xs opacity-75">Quiet</div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Crowd Density</span>
            <span className="font-semibold">{sensorData.crowdDensity} people nearby</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">WiFi Strength</span>
            <span className="font-semibold">{sensorData.wifiStrength}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Bluetooth Devices</span>
            <span className="font-semibold">{sensorData.bluetoothDevices} detected</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Emergency Beacons</span>
            <span className="font-semibold text-green-600">{sensorData.emergencyBeacons} active</span>
          </div>
        </div>

        <div className="mt-4 p-2 glassmorphism bg-primary/10 border-primary/20 rounded-lg">
          <div className="flex items-center gap-2 text-xs text-primary">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Real-time environmental monitoring active
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const SafetyAnalytics = () => {
  return (
    <Card className="glassmorphism bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="font-serif">Safety Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Safety Score Trend */}
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Weekly Safety Trend</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={safetyAnalyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "currentColor" }} />
                  <YAxis domain={[80, 100]} tick={{ fontSize: 12, fill: "currentColor" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#10b981" fill="url(#safetyGradient)" strokeWidth={2} />
                  <defs>
                    <linearGradient id="safetyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Incident Reports */}
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Incident Reports</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={safetyAnalyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "currentColor" }} />
                  <YAxis tick={{ fontSize: 12, fill: "currentColor" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="incidents" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="alerts" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 glassmorphism bg-primary/10 border-primary/20 rounded-lg">
            <div className="text-2xl font-bold text-primary">96%</div>
            <div className="text-sm text-muted-foreground">Avg Safety Score</div>
          </div>
          <div className="text-center p-4 glassmorphism bg-secondary/10 border-secondary/20 rounded-lg">
            <div className="text-2xl font-bold text-secondary">13</div>
            <div className="text-sm text-muted-foreground">Total Incidents</div>
          </div>
          <div className="text-center p-4 glassmorphism bg-accent/10 border-accent/20 rounded-lg">
            <div className="text-2xl font-bold text-accent">30</div>
            <div className="text-sm text-muted-foreground">Safety Alerts</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Location Heatmap Component
const LocationHeatmap = () => {
  return <RealTimeHeatmap type="locations" autoRefresh={true} refreshInterval={60000} showSummary={false} />
}

export default function TouristDashboard() {
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(true)
  const [notifications, setNotifications] = useState(3)
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const { currentLanguage, translate } = useLanguage()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }

    checkUser()
  }, [])

  const userData = {
    name: user?.user_metadata?.full_name || "Alex Johnson",
    email: user?.email || "alex@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    safetyScore: 95,
    location: "Mumbai, India",
    tripDuration: "Day 3 of 7",
  }

  const handleVoiceCommand = (command: string, params?: any) => {
    switch (command) {
      case "emergency":
        alert(translate("emergency.sent"))
        break
      case "map":
        document.getElementById("live-map")?.scrollIntoView({ behavior: "smooth" })
        break
      case "contact":
        document.getElementById("emergency-contacts")?.scrollIntoView({ behavior: "smooth" })
        break
      case "safety":
        setIsChatbotOpen(true)
        break
    }
  }

  const handleEmergencyAction = (action: string, data: any) => {
    console.log("[v0] Emergency action triggered:", action, data)
    switch (action) {
      case "view_details":
        toast({
          title: data.title,
          description: data.message,
          variant: data.priority === "critical" || data.priority === "high" ? "destructive" : "default",
        })
        break
      case "contact_emergency":
        alert(translate("emergency.calling"))
        break
      case "share_location":
        // Enhanced location sharing with real GPS coordinates
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude, accuracy } = position.coords
              const locationData = {
                lat: latitude,
                lng: longitude,
                accuracy: accuracy,
                timestamp: new Date().toISOString(),
                mapsUrl: `https://maps.google.com/?q=${latitude},${longitude}`,
              }
              console.log("[v0] Enhanced location shared:", locationData)

              // In real app, this would send to emergency contacts/authorities
              if (navigator.share) {
                navigator
                  .share({
                    title: "Emergency Location Share",
                    text: `Emergency location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (±${accuracy.toFixed(0)}m)`,
                    url: locationData.mapsUrl,
                  })
                  .catch(console.error)
              }
            },
            (error) => {
              console.error("[v0] Location sharing failed:", error)
              alert("Unable to get current location for sharing")
            },
            { enableHighAccuracy: true, timeout: 10000 },
          )
        } else {
          alert("Geolocation not supported by this browser")
        }
        break
      default:
        break
    }
  }

  const handleAlertAction = async (id: string) => {
    console.log("[v0] Alert marked as read:", id)
    try {
      if (user?.id) {
        await supabase.from("notifications").update({ is_read: true }).eq("id", id).eq("user_id", user.id)
      }
    } catch (error) {
      console.error("[v0] Error updating alert status:", error)
    }
  }

  const handleAlertDismiss = async (id: string) => {
    console.log("[v0] Alert dismissed:", id)
    try {
      if (user?.id) {
        await supabase.from("notifications").delete().eq("id", id).eq("user_id", user.id)
      }
    } catch (error) {
      console.error("[v0] Error dismissing alert:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <LoadingSkeleton variant="dashboard" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <EnhancedNavbar user={userData} />

      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif font-bold text-4xl text-foreground mb-2">Welcome back, {userData.name}!</h2>
              <p className="text-xl text-muted-foreground">
                {userData.location} • {userData.tripDuration}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Live Tracking</span>
                <Switch checked={isTrackingEnabled} onCheckedChange={setIsTrackingEnabled} />
                {isTrackingEnabled ? (
                  <Wifi className="h-4 w-4 text-secondary" />
                ) : (
                  <WifiOff className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <ThemeToggle />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="glassmorphism bg-card/50 border-border/50 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/20">
                  <Shield className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{userData.safetyScore}%</div>
                  <div className="text-sm text-muted-foreground">Safety Score</div>
                </div>
              </div>
            </Card>

            <Card className="glassmorphism bg-card/50 border-border/50 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Battery className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">85%</div>
                  <div className="text-sm text-muted-foreground">Device Battery</div>
                </div>
              </div>
            </Card>

            <Card className="glassmorphism bg-card/50 border-border/50 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/20">
                  <Signal className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">Strong</div>
                  <div className="text-sm text-muted-foreground">Signal</div>
                </div>
              </div>
            </Card>

            <Card className="glassmorphism bg-card/50 border-border/50 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Bell className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{notifications}</div>
                  <div className="text-sm text-muted-foreground">Active Alerts</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-3 space-y-8">
            {/* Safety Analytics */}
            <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <SafetyAnalytics />
            </div>

            {/* Enhanced Alert System */}
            <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Card className="glassmorphism bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="font-serif">Safety Alerts & Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <EnhancedAlertSystem
                    alerts={mockAlerts}
                    onMarkAsRead={handleAlertAction}
                    onDismiss={handleAlertDismiss}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Location Heatmap */}
            <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <LocationHeatmap />
            </div>

            {/* Live Map */}
            <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <LiveMap isTrackingEnabled={isTrackingEnabled} />
            </div>

            {/* Real-time Notification System */}
            <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
              {user?.id && (
                <RealTimeNotificationSystem
                  currentLanguage={currentLanguage}
                  userId={user.id}
                  onEmergencyAction={handleEmergencyAction}
                />
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Travel Timeline */}
            <div className="animate-slide-in-right" style={{ animationDelay: "0.1s" }}>
              <TravelTimeline />
            </div>

            {/* Health Monitor */}
            <div className="animate-slide-in-right" style={{ animationDelay: "0.2s" }}>
              <HeartRateMonitor />
            </div>

            {/* IoT Sensors */}
            <div className="animate-slide-in-right" style={{ animationDelay: "0.3s" }}>
              <IoTSensorPanel />
            </div>

            {/* Quick Actions */}
            <div className="animate-slide-in-right" style={{ animationDelay: "0.4s" }}>
              <Card className="glassmorphism bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="font-serif flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full glassmorphism bg-card/50 border-border/50 hover:bg-card/70 justify-start"
                    onClick={() => {
                      // Call emergency contact functionality
                      window.location.href = "tel:+15551234567"
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Emergency Contact
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full glassmorphism bg-card/50 border-border/50 hover:bg-card/70 justify-start"
                    onClick={() => {
                      // Share live location functionality
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((position) => {
                          const { latitude, longitude } = position.coords
                          const shareText = `My current location: https://maps.google.com/?q=${latitude},${longitude}`
                          if (navigator.share) {
                            navigator.share({
                              title: "My Live Location",
                              text: shareText,
                            })
                          } else {
                            navigator.clipboard.writeText(shareText)
                            alert("Location copied to clipboard!")
                          }
                        })
                      }
                    }}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Share Live Location
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full glassmorphism bg-card/50 border-border/50 hover:bg-card/70 justify-start"
                    onClick={() => {
                      // Get directions to nearest police station
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((position) => {
                          const { latitude, longitude } = position.coords
                          window.open(
                            `https://maps.google.com/maps?q=police+station&ll=${latitude},${longitude}`,
                            "_blank",
                          )
                        })
                      }
                    }}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Directions to Safety
                  </Button>
                  <Link href="/generate-id">
                    <Button
                      variant="outline"
                      className="w-full glassmorphism bg-card/50 border-border/50 hover:bg-card/70 justify-start"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      View Tourist ID
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Emergency Contacts */}
            <div className="animate-slide-in-right" style={{ animationDelay: "0.5s" }}>
              <Card className="glassmorphism bg-card/50 border-border/50" id="emergency-contacts">
                <CardHeader>
                  <CardTitle className="font-serif flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    Emergency Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 glassmorphism bg-card/30 border-border/50 rounded-lg">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Sarah Johnson</p>
                      <p className="text-xs text-muted-foreground">Spouse • +1 (555) 123-4567</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="glassmorphism bg-card/50 border-border/50"
                      onClick={() => (window.location.href = "tel:+15551234567")}
                    >
                      <Phone className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 glassmorphism bg-card/30 border-border/50 rounded-lg">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Tourist Helpline</p>
                      <p className="text-xs text-muted-foreground">24/7 Support • 1800-111-363</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="glassmorphism bg-card/50 border-border/50"
                      onClick={() => (window.location.href = "tel:1800111363")}
                    >
                      <Phone className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 glassmorphism bg-card/30 border-border/50 rounded-lg">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Local Police</p>
                      <p className="text-xs text-muted-foreground">Mumbai Police • 100</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="glassmorphism bg-card/50 border-border/50"
                      onClick={() => (window.location.href = "tel:100")}
                    >
                      <Phone className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <FloatingEmergencyButton />

        <ChatbotSidebar
          isOpen={isChatbotOpen}
          onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
          currentLanguage={currentLanguage}
        />

        <VoiceAssistant currentLanguage={currentLanguage} onCommand={handleVoiceCommand} />
      </div>
    </div>
  )
}
