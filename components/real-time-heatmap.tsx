"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import L from 'leaflet'
import 'leaflet.heat'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BarChart3, Users, MapPin, RefreshCw, Shield, AlertTriangle, Clock, Activity } from "lucide-react"

interface ZoneHeatmapData {
  zone_id: string
  zone_name: string
  zone_description: string
  latitude: number
  longitude: number
  radius: number
  status: "safe" | "caution" | "restricted"
  zone_type: string
  tourist_count: number
  recent_visits: number
  safety_score: number
  intensity: number
  last_activity: string
}

interface LocationHeatmapData {
  location_name: string
  visit_count: number
  unique_visitors: number
  safety_percentage: number
  average_accuracy: number
  last_visit: string
  coordinates: {
    latitude: number
    longitude: number
  }
}

interface HeatmapSummary {
  total_active_tourists: number
  total_locations_visited: number
  average_safety_score: number
  high_risk_zones: number
  recent_incidents: number
  most_popular_zone: string
  safest_zone: string
}

interface RealTimeHeatmapProps {
  type?: "zones" | "locations"
  autoRefresh?: boolean
  refreshInterval?: number
  showSummary?: boolean
}

export function RealTimeHeatmap({
  type = "zones",
  autoRefresh = true,
  refreshInterval = 30000,
  showSummary = true,
}: RealTimeHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<ZoneHeatmapData[] | LocationHeatmapData[]>([])
  const [summary, setSummary] = useState<HeatmapSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [hours, setHours] = useState(24)

  // Fetch heatmap data
  const fetchHeatmapData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/heatmap?type=${type}&hours=${hours}`)
      const result = await response.json()

      if (result.success) {
        setHeatmapData(result.data)
        setLastUpdated(result.lastUpdated)
      } else {
        setError(result.error || "Failed to fetch heatmap data")
      }
    } catch (err) {
      setError("Network error while fetching heatmap data")
      console.error("[v0] Heatmap fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [type, hours])

  // Fetch summary data
  const fetchSummary = useCallback(async () => {
    if (!showSummary) return

    try {
      const response = await fetch("/api/heatmap/summary")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.error) {
        console.error("[v0] Summary fetch error:", result.error)
        return
      }

      setSummary(result.data || result)
    } catch (err) {
      console.error("[v0] Summary fetch error:", err)
      // Don't show error to user for summary data - it's not critical
    }
  }, [showSummary])

  // Auto-refresh effect
  useEffect(() => {
    fetchHeatmapData()
    fetchSummary()

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchHeatmapData()
        fetchSummary()
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [fetchHeatmapData, fetchSummary, autoRefresh, refreshInterval])

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }

  const getSafetyColor = (safety: number) => {
    if (safety >= 90) return "text-green-600 bg-green-500/20 border-green-500/30"
    if (safety >= 70) return "text-yellow-600 bg-yellow-500/20 border-yellow-500/30"
    return "text-red-600 bg-red-500/20 border-red-500/30"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe":
        return "text-green-600 bg-green-500/20 border-green-500/30"
      case "caution":
        return "text-yellow-600 bg-yellow-500/20 border-yellow-500/30"
      case "restricted":
        return "text-red-600 bg-red-500/20 border-red-500/30"
      default:
        return "text-gray-600 bg-gray-500/20 border-gray-500/30"
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {showSummary && summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glassmorphism bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{summary.total_active_tourists}</p>
                  <p className="text-xs text-muted-foreground">Active Tourists</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-secondary" />
                <div>
                  <p className="text-2xl font-bold">{summary.total_locations_visited}</p>
                  <p className="text-xs text-muted-foreground">Locations Visited</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{summary.average_safety_score.toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">Avg Safety</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{summary.recent_incidents}</p>
                  <p className="text-xs text-muted-foreground">Recent Incidents</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Heatmap */}
      <Card className="glassmorphism bg-card/50 border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-serif flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Real-time {type === "zones" ? "Zone" : "Location"} Heatmap
              {isLoading && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
            </CardTitle>
            <div className="flex items-center gap-2">
              <select
                value={hours}
                onChange={(e) => setHours(Number.parseInt(e.target.value))}
                className="text-sm bg-background border border-border rounded px-2 py-1"
              >
                <option value={1}>Last Hour</option>
                <option value={6}>Last 6 Hours</option>
                <option value={24}>Last 24 Hours</option>
                <option value={168}>Last Week</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchHeatmapData}
                disabled={isLoading}
                className="glassmorphism bg-card/50 border-border/50"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {lastUpdated && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              Last updated: {formatTimeAgo(lastUpdated)}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border-destructive/50 bg-destructive/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {type === "zones" ? (
            // Zone-based heatmap view
            <div className="space-y-4">
              {/* Visual map representation */}
              <div className="relative w-full h-96 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg overflow-hidden border-2 border-border/20">
                <div className="absolute inset-0 opacity-20">
                  <div className="w-full h-full bg-gradient-to-br from-blue-200 via-green-200 to-yellow-200"></div>
                </div>

                {(heatmapData as ZoneHeatmapData[]).map((zone, index) => (
                  <div
                    key={zone.zone_id}
                    className={`
                      absolute rounded-full cursor-pointer transition-all duration-300 hover:scale-110
                      ${getStatusColor(zone.status)} border-2
                    `}
                    style={{
                      left: `${(index % 5) * 20 + 10}%`,
                      top: `${Math.floor(index / 5) * 25 + 15}%`,
                      width: `${Math.max(30, zone.intensity * 80)}px`,
                      height: `${Math.max(30, zone.intensity * 80)}px`,
                      transform: "translate(-50%, -50%)",
                    }}
                    title={`${zone.zone_name}: ${zone.tourist_count} tourists, ${zone.safety_score.toFixed(0)}% safe`}
                  >
                    <div className="absolute inset-0 rounded-full animate-ping opacity-30 bg-current"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">
                      {zone.tourist_count}
                    </div>
                  </div>
                ))}
              </div>

              {/* Zone details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(heatmapData as ZoneHeatmapData[]).map((zone) => (
                  <div key={zone.zone_id} className="glassmorphism bg-card/30 border-border/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground">{zone.zone_name}</h4>
                      <Badge className={getStatusColor(zone.status)}>{zone.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{zone.zone_description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Active Tourists:</span>
                        <span className="font-semibold">{zone.tourist_count}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Recent Visits:</span>
                        <span className="font-semibold">{zone.recent_visits}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Safety Score:</span>
                        <Badge className={getSafetyColor(zone.safety_score)}>{zone.safety_score.toFixed(0)}%</Badge>
                      </div>
                      {zone.last_activity && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Last Activity:</span>
                          <span className="text-xs">{formatTimeAgo(zone.last_activity)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Location-based heatmap view
            <div className="space-y-4">
              {(heatmapData as LocationHeatmapData[]).map((location, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 glassmorphism bg-card/30 border-border/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground">{location.location_name}</h4>
                      <Badge className={getSafetyColor(location.safety_percentage)}>
                        {location.safety_percentage.toFixed(0)}% Safe
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-2">
                      <span>{location.visit_count} visits</span>
                      <span>{location.unique_visitors} unique visitors</span>
                      <span>Accuracy: {location.average_accuracy.toFixed(0)}m</span>
                      <span>Last visit: {formatTimeAgo(location.last_visit)}</span>
                    </div>
                    <div className="flex-1 bg-muted/50 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          location.safety_percentage >= 90
                            ? "bg-green-500"
                            : location.safety_percentage >= 70
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${location.safety_percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-4">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {heatmapData.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No heatmap data available for the selected time period.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
