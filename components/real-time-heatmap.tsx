"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import L from 'leaflet'
import 'leaflet.heat'
import LeafletMap from './leaflet-map'

// Leaflet Heatmap Component
const LeafletHeatmap = ({ zones, height = "24rem" }: { zones: ZoneHeatmapData[], height?: string }) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<any>(null)
  const heatLayerRef = useRef<any>(null)
  const markersLayerRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return

    // Initialize Leaflet map
    leafletMapRef.current = L.map(mapRef.current, {
      center: [22.7196, 75.8577], // Central India coordinates
      zoom: 6,
      zoomControl: true,
    })

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(leafletMapRef.current)

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
        heatLayerRef.current = null
        markersLayerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!leafletMapRef.current || !zones.length) return

    // Remove existing heat layer and markers
    if (heatLayerRef.current) {
      leafletMapRef.current.removeLayer(heatLayerRef.current)
    }
    if (markersLayerRef.current) {
      leafletMapRef.current.removeLayer(markersLayerRef.current)
    }
    
    // Create new markers layer group
    markersLayerRef.current = L.layerGroup().addTo(leafletMapRef.current)

    // Convert zones to heat points: [lat, lng, intensity]
    const heatPoints: [number, number, number][] = zones.map(zone => [
      zone.latitude,
      zone.longitude,
      zone.intensity
    ])

    // Create heat layer with Leaflet.heat
    heatLayerRef.current = (L as any).heatLayer(heatPoints, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: {
        0.0: '#313695',
        0.1: '#4575b4', 
        0.2: '#74add1',
        0.3: '#abd9e9',
        0.4: '#e0f3f8',
        0.5: '#ffffcc',
        0.6: '#fee090',
        0.7: '#fdae61',
        0.8: '#f46d43',
        0.9: '#d73027',
        1.0: '#a50026'
      }
    }).addTo(leafletMapRef.current)

    // Add zone markers to the layer group
    zones.forEach(zone => {
      const color = zone.status === 'safe' ? '#10b981' : 
                   zone.status === 'caution' ? '#f59e0b' : '#ef4444'
      
      const marker = L.circleMarker([zone.latitude, zone.longitude], {
        radius: Math.max(8, zone.tourist_count / 2),
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(markersLayerRef.current)

      marker.bindPopup(`
        <div class="p-2">
          <h4 class="font-semibold">${zone.zone_name}</h4>
          <p class="text-sm text-gray-600">${zone.zone_description}</p>
          <p class="text-sm">Status: <span class="font-medium" style="color: ${color}">${zone.status}</span></p>
          <p class="text-sm">Tourists: ${zone.tourist_count}</p>
          <p class="text-sm">Safety Score: ${zone.safety_score.toFixed(0)}%</p>
        </div>
      `)
    })
  }, [zones])

  return (
    <div 
      ref={mapRef} 
      className="w-full rounded-lg"
      style={{ height }}
    />
  )
}
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
              {/* Leaflet Map with Heatmap */}
              <div className="relative w-full h-96 rounded-lg overflow-hidden border-2 border-border/20">
                <LeafletHeatmap 
                  zones={heatmapData as ZoneHeatmapData[]}
                  height="24rem"
                />
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
