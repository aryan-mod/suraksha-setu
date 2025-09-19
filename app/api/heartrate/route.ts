import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const heartRateData = await request.json()

    if (!heartRateData.bpm || !heartRateData.userId) {
      return NextResponse.json({ error: "Missing required heart rate data" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("heart_rate_monitoring")
      .insert({
        user_id: heartRateData.userId,
        bpm: heartRateData.bpm,
        status: heartRateData.status || 'normal',
        latitude: heartRateData.latitude,
        longitude: heartRateData.longitude,
        is_emergency: heartRateData.isEmergency || false,
        device_info: heartRateData.deviceInfo || {},
        metadata: heartRateData.metadata || {},
        recorded_at: heartRateData.timestamp ? new Date(heartRateData.timestamp).toISOString() : new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error storing heart rate data:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    // Check if this is an emergency alert
    if (heartRateData.isEmergency) {
      // In real implementation, trigger emergency notification system
      console.log("🚨 HEART RATE EMERGENCY ALERT:", {
        userId: heartRateData.userId,
        bpm: heartRateData.bpm,
        location: { lat: heartRateData.latitude, lng: heartRateData.longitude },
        timestamp: new Date().toISOString()
      })

      // Store emergency alert
      const { error: alertError } = await supabase
        .from("emergency_alerts")
        .insert({
          user_id: heartRateData.userId,
          alert_type: "heart_rate_critical",
          latitude: heartRateData.latitude,
          longitude: heartRateData.longitude,
          message: `Critical heart rate detected: ${heartRateData.bpm} BPM`,
          severity: "critical",
          metadata: {
            bpm: heartRateData.bpm,
            status: heartRateData.status,
            device_info: heartRateData.deviceInfo || {}
          }
        })

      if (alertError) {
        console.error("[v0] Error storing emergency alert:", alertError)
      }
    }

    return NextResponse.json({
      success: true,
      heartRate: data,
      emergency: heartRateData.isEmergency || false
    })
  } catch (error) {
    console.error("[v0] Heart rate monitoring API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const hours = Number.parseInt(searchParams.get("hours") || "24")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 })
    }

    const supabase = await createClient()
    const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

    const { data: heartRateHistory, error } = await supabase
      .from("heart_rate_monitoring")
      .select("*")
      .eq("user_id", userId)
      .gte("recorded_at", hoursAgo)
      .order("recorded_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("[v0] Error fetching heart rate history:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    // Calculate statistics
    const readings = heartRateHistory || []
    const avgBPM = readings.length > 0 
      ? Math.round(readings.reduce((sum, r) => sum + r.bpm, 0) / readings.length)
      : 0
    const maxBPM = readings.length > 0 ? Math.max(...readings.map(r => r.bpm)) : 0
    const minBPM = readings.length > 0 ? Math.min(...readings.map(r => r.bpm)) : 0
    const emergencyCount = readings.filter(r => r.is_emergency).length

    return NextResponse.json({
      success: true,
      heartRateHistory: readings,
      statistics: {
        avgBPM,
        maxBPM,
        minBPM,
        totalReadings: readings.length,
        emergencyCount,
        timeRange: `${hours} hours`
      }
    })
  } catch (error) {
    console.error("[v0] Heart rate fetch API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}