"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Shield,
  Users,
  MapPin,
  AlertTriangle,
  Search,
  Filter,
  FileText,
  Clock,
  XCircle,
  Eye,
  Phone,
  Navigation,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Bell,
  Settings,
  Home,
  Database,
  UserCheck,
  AlertCircle,
  Zap,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import { RealTimeHeatmap } from "@/components/real-time-heatmap"

// Mock data for tourist database
const touristData = [
  {
    id: "TST-A1B2C3D4",
    name: "Alex Johnson",
    nationality: "American",
    safetyScore: 95,
    location: "Gateway of India, Mumbai",
    lastActivity: "2 minutes ago",
    status: "active",
    phone: "+1-555-0123",
    emergencyContact: "Sarah Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "TST-E5F6G7H8",
    name: "Maria Garcia",
    nationality: "Spanish",
    safetyScore: 88,
    location: "Marine Drive, Mumbai",
    lastActivity: "15 minutes ago",
    status: "active",
    phone: "+34-600-123456",
    emergencyContact: "Carlos Garcia",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "TST-I9J0K1L2",
    name: "David Chen",
    nationality: "Canadian",
    safetyScore: 72,
    location: "Colaba Market, Mumbai",
    lastActivity: "1 hour ago",
    status: "caution",
    phone: "+1-416-555-0789",
    emergencyContact: "Lisa Chen",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "TST-M3N4O5P6",
    name: "Emma Wilson",
    nationality: "British",
    safetyScore: 91,
    location: "Bandra West, Mumbai",
    lastActivity: "30 minutes ago",
    status: "active",
    phone: "+44-20-7946-0958",
    emergencyContact: "James Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "TST-Q7R8S9T0",
    name: "Raj Patel",
    nationality: "Indian",
    safetyScore: 65,
    location: "Crawford Market, Mumbai",
    lastActivity: "3 hours ago",
    status: "alert",
    phone: "+91-98765-43210",
    emergencyContact: "Priya Patel",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

// Mock data for alerts
const alertsData = [
  {
    id: 1,
    type: "emergency",
    tourist: "Raj Patel",
    location: "Crawford Market, Mumbai",
    message: "SOS button activated - immediate assistance required",
    timestamp: "5 minutes ago",
    status: "active",
    priority: "high",
  },
  {
    id: 2,
    type: "geofence",
    tourist: "David Chen",
    location: "Colaba Market, Mumbai",
    message: "Tourist entered restricted area",
    timestamp: "1 hour ago",
    status: "acknowledged",
    priority: "medium",
  },
  {
    id: 3,
    type: "anomaly",
    tourist: "Maria Garcia",
    location: "Marine Drive, Mumbai",
    message: "Unusual movement pattern detected",
    timestamp: "2 hours ago",
    status: "resolved",
    priority: "low",
  },
  {
    id: 4,
    type: "health",
    tourist: "Alex Johnson",
    location: "Gateway of India, Mumbai",
    message: "Heart rate spike detected",
    timestamp: "3 hours ago",
    status: "resolved",
    priority: "medium",
  },
]

// Mock data for heatmap zones
const heatmapData = [
  { zone: "Gateway of India", tourists: 45, safety: "high", x: 45, y: 60, intensity: 0.8 },
  { zone: "Marine Drive", tourists: 32, safety: "high", x: 30, y: 45, intensity: 0.6 },
  { zone: "Colaba Market", tourists: 18, safety: "medium", x: 50, y: 70, intensity: 0.4 },
  { zone: "Crawford Market", tourists: 12, safety: "low", x: 60, y: 40, intensity: 0.3 },
  { zone: "Bandra West", tourists: 28, safety: "high", x: 25, y: 30, intensity: 0.5 },
  { zone: "Juhu Beach", tourists: 22, safety: "high", x: 20, y: 25, intensity: 0.4 },
]

// Mock data for statistics
const statsData = [
  { name: "Mon", tourists: 120, alerts: 5, resolved: 4 },
  { name: "Tue", tourists: 145, alerts: 8, resolved: 7 },
  { name: "Wed", tourists: 132, alerts: 3, resolved: 3 },
  { name: "Thu", tourists: 158, alerts: 12, resolved: 10 },
  { name: "Fri", tourists: 189, alerts: 15, resolved: 13 },
  { name: "Sat", tourists: 234, alerts: 18, resolved: 16 },
  { name: "Sun", tourists: 198, alerts: 9, resolved: 8 },
]

// Sidebar Navigation Component
const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) => {
  const menuItems = [
    { id: "overview", label: "Overview", icon: <Home className="h-5 w-5" />, tooltip: "Dashboard Overview" },
    { id: "tourists", label: "Tourists", icon: <Users className="h-5 w-5" />, tooltip: "Tourist Database" },
    { id: "heatmap", label: "Heatmap", icon: <BarChart3 className="h-5 w-5" />, tooltip: "Real-time Heatmap" },
    { id: "alerts", label: "Alerts", icon: <AlertTriangle className="h-5 w-5" />, tooltip: "Alert Management" },
    { id: "efir", label: "E-FIR", icon: <FileText className="h-5 w-5" />, tooltip: "Electronic FIR Generator" },
    { id: "analytics", label: "Analytics", icon: <PieChart className="h-5 w-5" />, tooltip: "Safety Analytics" },
  ]

  return (
    <TooltipProvider>
      <div className="w-64 h-screen glassmorphism bg-sidebar/90 border-r border-sidebar-border sticky top-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-xl bg-primary/20 animate-pulse-glow">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg text-sidebar-foreground">SafeTour Admin</h1>
              <p className="text-xs text-sidebar-foreground/60">Police & Tourism Dashboard</p>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-left
                      ${
                        activeTab === item.id
                          ? "bg-sidebar-primary text-sidebar-primary-foreground animate-pulse-glow"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }
                    `}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="glassmorphism bg-sidebar-accent/20 border-sidebar-border/50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>
                  <UserCheck className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-sidebar-foreground">Officer Smith</p>
                <p className="text-xs text-sidebar-foreground/60">Mumbai Police</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full glassmorphism bg-sidebar/50 border-sidebar-border/50">
              <Settings className="h-3 w-3 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

// Overview Dashboard Component
const OverviewDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glassmorphism bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Tourists</p>
                <p className="text-3xl font-bold text-foreground">1,247</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% from yesterday
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primary/20">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-3xl font-bold text-foreground">23</p>
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +3 new alerts
                </p>
              </div>
              <div className="p-3 rounded-xl bg-destructive/20">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Safety Score</p>
                <p className="text-3xl font-bold text-foreground">94.2%</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +0.8% improvement
                </p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/20">
                <Shield className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Response Time</p>
                <p className="text-3xl font-bold text-foreground">2.4m</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  -15s faster
                </p>
              </div>
              <div className="p-3 rounded-xl bg-yellow-500/20">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glassmorphism bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Weekly Tourist Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip />
                  <Bar dataKey="tourists" fill="#0891b2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Alert Resolution Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={statsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="alerts"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="glassmorphism bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alertsData.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className="flex items-center gap-4 p-3 glassmorphism bg-card/30 border-border/50 rounded-lg"
              >
                <div
                  className={`p-2 rounded-lg ${
                    alert.type === "emergency"
                      ? "bg-red-500/20 text-red-600"
                      : alert.type === "geofence"
                        ? "bg-yellow-500/20 text-yellow-600"
                        : alert.type === "anomaly"
                          ? "bg-blue-500/20 text-blue-600"
                          : "bg-purple-500/20 text-purple-600"
                  }`}
                >
                  {alert.type === "emergency" ? (
                    <Zap className="h-4 w-4" />
                  ) : alert.type === "geofence" ? (
                    <MapPin className="h-4 w-4" />
                  ) : alert.type === "anomaly" ? (
                    <Activity className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {alert.tourist} • {alert.location}
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    className={`${
                      alert.status === "active"
                        ? "bg-red-500/20 text-red-600 border-red-500/30"
                        : alert.status === "acknowledged"
                          ? "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
                          : "bg-green-500/20 text-green-600 border-green-500/30"
                    }`}
                  >
                    {alert.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{alert.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Tourist Database Component
const TouristDatabase = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTourist, setSelectedTourist] = useState<any>(null)

  const filteredTourists = touristData.filter((tourist) => {
    const matchesSearch =
      tourist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tourist.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tourist.nationality.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || tourist.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="glassmorphism bg-card/50 border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or nationality..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glassmorphism bg-input/50 border-border/50"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 glassmorphism bg-input/50 border-border/50">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="caution">Caution</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="glassmorphism bg-card/50 border-border/50">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tourist Table */}
      <Card className="glassmorphism bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Tourist Database ({filteredTourists.length} records)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tourist</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Safety Score</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTourists.map((tourist) => (
                  <TableRow key={tourist.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={tourist.avatar || "/placeholder.svg"} alt={tourist.name} />
                          <AvatarFallback>
                            {tourist.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">{tourist.name}</p>
                          <p className="text-sm text-muted-foreground">{tourist.nationality}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{tourist.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={tourist.safetyScore} className="w-16 h-2" />
                        <span className="text-sm font-semibold">{tourist.safetyScore}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{tourist.location}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{tourist.lastActivity}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          tourist.status === "active"
                            ? "bg-green-500/20 text-green-600 border-green-500/30"
                            : tourist.status === "caution"
                              ? "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
                              : "bg-red-500/20 text-red-600 border-red-500/30"
                        }`}
                      >
                        {tourist.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTourist(tourist)}
                          className="glassmorphism bg-card/50 border-border/50"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="glassmorphism bg-card/50 border-border/50">
                          <Phone className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Tourist Profile Modal */}
      {selectedTourist && (
        <Card className="glassmorphism bg-card/50 border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Tourist Profile
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTourist(null)}
                className="glassmorphism bg-card/50 border-border/50"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedTourist.avatar || "/placeholder.svg"} alt={selectedTourist.name} />
                    <AvatarFallback>
                      {selectedTourist.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-serif font-bold text-xl text-foreground">{selectedTourist.name}</h3>
                    <p className="text-muted-foreground">{selectedTourist.nationality}</p>
                    <p className="text-sm font-mono text-muted-foreground">{selectedTourist.id}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Safety Score</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={selectedTourist.safetyScore} className="flex-1 h-3" />
                      <span className="text-lg font-bold text-foreground">{selectedTourist.safetyScore}%</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Current Location</Label>
                    <p className="text-foreground font-semibold">{selectedTourist.location}</p>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Last Activity</Label>
                    <p className="text-foreground">{selectedTourist.lastActivity}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Contact Information</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{selectedTourist.phone}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Emergency Contact</Label>
                  <p className="text-foreground font-semibold">{selectedTourist.emergencyContact}</p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge
                      className={`${
                        selectedTourist.status === "active"
                          ? "bg-green-500/20 text-green-600 border-green-500/30"
                          : selectedTourist.status === "caution"
                            ? "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
                            : "bg-red-500/20 text-red-600 border-red-500/30"
                      }`}
                    >
                      {selectedTourist.status.charAt(0).toUpperCase() + selectedTourist.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 glassmorphism bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Tourist
                  </Button>
                  <Button variant="outline" className="flex-1 glassmorphism bg-card/50 border-border/50">
                    <Navigation className="h-4 w-4 mr-2" />
                    Track Location
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Heatmap Component
const HeatmapView = () => {
  return (
    <div className="space-y-6">
      <RealTimeHeatmap type="zones" autoRefresh={true} refreshInterval={30000} showSummary={true} />
    </div>
  )
}

// E-FIR Generator Component
const EFIRGenerator = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({})

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      // Generate E-FIR
      alert("E-FIR generated successfully! Reference ID: FIR-" + Math.random().toString(36).substr(2, 8).toUpperCase())
      setCurrentStep(1)
      setFormData({})
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="glassmorphism bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Electronic FIR Generator
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Step {currentStep} of 3</p>
            <Progress value={(currentStep / 3) * 100} className="w-32 h-2" />
          </div>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg text-foreground">Incident Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="incidentType">Incident Type *</Label>
                  <Select onValueChange={(value) => handleInputChange("incidentType", value)}>
                    <SelectTrigger className="glassmorphism bg-input/50 border-border/50">
                      <SelectValue placeholder="Select incident type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="theft">Theft</SelectItem>
                      <SelectItem value="assault">Assault</SelectItem>
                      <SelectItem value="harassment">Harassment</SelectItem>
                      <SelectItem value="fraud">Fraud</SelectItem>
                      <SelectItem value="missing">Missing Person</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="severity">Severity Level *</Label>
                  <Select onValueChange={(value) => handleInputChange("severity", value)}>
                    <SelectTrigger className="glassmorphism bg-input/50 border-border/50">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="incidentDate">Date of Incident *</Label>
                  <Input
                    id="incidentDate"
                    type="datetime-local"
                    onChange={(e) => handleInputChange("incidentDate", e.target.value)}
                    className="glassmorphism bg-input/50 border-border/50"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="Enter incident location"
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="glassmorphism bg-input/50 border-border/50"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Incident Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed description of the incident..."
                  rows={4}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="glassmorphism bg-input/50 border-border/50"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg text-foreground">Tourist Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="touristName">Tourist Name *</Label>
                  <Input
                    id="touristName"
                    placeholder="Enter tourist name"
                    onChange={(e) => handleInputChange("touristName", e.target.value)}
                    className="glassmorphism bg-input/50 border-border/50"
                  />
                </div>
                <div>
                  <Label htmlFor="touristId">Tourist ID</Label>
                  <Input
                    id="touristId"
                    placeholder="TST-XXXXXXXX"
                    onChange={(e) => handleInputChange("touristId", e.target.value)}
                    className="glassmorphism bg-input/50 border-border/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="touristPhone">Contact Number *</Label>
                  <Input
                    id="touristPhone"
                    placeholder="+1-XXX-XXX-XXXX"
                    onChange={(e) => handleInputChange("touristPhone", e.target.value)}
                    className="glassmorphism bg-input/50 border-border/50"
                  />
                </div>
                <div>
                  <Label htmlFor="nationality">Nationality *</Label>
                  <Input
                    id="nationality"
                    placeholder="Enter nationality"
                    onChange={(e) => handleInputChange("nationality", e.target.value)}
                    className="glassmorphism bg-input/50 border-border/50"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="accommodation">Accommodation Details</Label>
                <Textarea
                  id="accommodation"
                  placeholder="Hotel name, address, contact details..."
                  rows={3}
                  onChange={(e) => handleInputChange("accommodation", e.target.value)}
                  className="glassmorphism bg-input/50 border-border/50"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg text-foreground">Officer Information & Review</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="officerName">Reporting Officer *</Label>
                  <Input
                    id="officerName"
                    placeholder="Enter officer name"
                    onChange={(e) => handleInputChange("officerName", e.target.value)}
                    className="glassmorphism bg-input/50 border-border/50"
                  />
                </div>
                <div>
                  <Label htmlFor="badgeNumber">Badge Number *</Label>
                  <Input
                    id="badgeNumber"
                    placeholder="Enter badge number"
                    onChange={(e) => handleInputChange("badgeNumber", e.target.value)}
                    className="glassmorphism bg-input/50 border-border/50"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="station">Police Station *</Label>
                <Input
                  id="station"
                  placeholder="Enter police station name"
                  onChange={(e) => handleInputChange("station", e.target.value)}
                  className="glassmorphism bg-input/50 border-border/50"
                />
              </div>
              <div>
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  placeholder="Any additional information or notes..."
                  rows={3}
                  onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                  className="glassmorphism bg-input/50 border-border/50"
                />
              </div>

              {/* Review Summary */}
              <div className="mt-6 p-4 glassmorphism bg-muted/20 border-border/50 rounded-lg">
                <h4 className="font-semibold text-foreground mb-3">FIR Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Incident Type:</p>
                    <p className="font-semibold text-foreground">{formData.incidentType || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tourist Name:</p>
                    <p className="font-semibold text-foreground">{formData.touristName || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location:</p>
                    <p className="font-semibold text-foreground">{formData.location || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Severity:</p>
                    <p className="font-semibold text-foreground">{formData.severity || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="glassmorphism bg-card/50 border-border/50"
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              className="glassmorphism bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {currentStep === 3 ? "Generate E-FIR" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewDashboard />
      case "tourists":
        return <TouristDatabase />
      case "heatmap":
        return <HeatmapView />
      case "alerts":
        return <OverviewDashboard /> // Simplified for demo
      case "efir":
        return <EFIRGenerator />
      case "analytics":
        return <OverviewDashboard /> // Simplified for demo
      default:
        return <OverviewDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 overflow-auto">
        <header className="glassmorphism bg-card/30 border-b border-border/50 sticky top-0 z-40">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="font-serif font-bold text-2xl text-foreground">
                {activeTab === "overview" && "Dashboard Overview"}
                {activeTab === "tourists" && "Tourist Database"}
                {activeTab === "heatmap" && "Real-time Heatmap"}
                {activeTab === "alerts" && "Alert Management"}
                {activeTab === "efir" && "E-FIR Generator"}
                {activeTab === "analytics" && "Safety Analytics"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {activeTab === "overview" && "Monitor tourist safety and system performance"}
                {activeTab === "tourists" && "Search and manage tourist profiles"}
                {activeTab === "heatmap" && "View tourist distribution and safety zones"}
                {activeTab === "alerts" && "Manage safety alerts and incidents"}
                {activeTab === "efir" && "Generate electronic First Information Reports"}
                {activeTab === "analytics" && "Analyze safety trends and statistics"}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" className="glassmorphism bg-card/50 border-border/50">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" className="glassmorphism bg-card/50 border-border/50">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" className="relative bg-transparent">
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs">
                  3
                </Badge>
              </Button>
            </div>
          </div>
        </header>

        <main className="p-8">{renderContent()}</main>
      </div>
    </div>
  )
}
