import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const locationData = await request.json()

    if (!locationData.latitude || !locationData.longitude) {
      return NextResponse.json({ error: "Missing required location coordinates" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("location_tracking")
      .insert({
        user_id: locationData.userId,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        altitude: locationData.altitude,
        heading: locationData.heading,
        speed: locationData.speed,
        location_name: locationData.locationName,
        safe_zone_id: locationData.safeZoneId,
        safe_zone_status: locationData.safeZoneStatus,
        is_emergency: locationData.isEmergency || false,
        metadata: locationData.metadata || {},
        recorded_at: locationData.timestamp ? new Date(locationData.timestamp).toISOString() : new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error storing location data:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    const { data: nearbyZones, error: zonesError } = await supabase.rpc("get_nearby_safe_zones", {
      user_lat: locationData.latitude,
      user_lng: locationData.longitude,
      radius_km: 2,
    })

    return NextResponse.json({
      success: true,
      location: data,
      nearbyZones: nearbyZones || [],
    })
  } catch (error) {
    console.error("[v0] Location tracking API error:", error)
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

    const { data: locations, error } = await supabase
      .from("location_tracking")
      .select("*")
      .eq("user_id", userId)
      .gte("recorded_at", hoursAgo)
      .order("recorded_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("[v0] Error fetching location history:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    const { data: safeZones, error: zonesError } = await supabase.from("safe_zones").select("*").eq("is_active", true)

    if (zonesError) {
      console.error("[v0] Error fetching safe zones:", zonesError)
    }

    return NextResponse.json({
      success: true,
      locations: locations || [],
      safeZones: safeZones || [],
      totalRecords: locations?.length || 0,
    })
  } catch (error) {
    console.error("[v0] Location fetch API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
