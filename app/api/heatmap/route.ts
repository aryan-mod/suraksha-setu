import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hours = Number.parseInt(searchParams.get("hours") || "24")
    const type = searchParams.get("type") || "zones" // zones or locations

    // Handle case where Supabase is not configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('[v0] Supabase not configured, returning mock heatmap data')
      return NextResponse.json({
        success: true,
        type,
        data: [],
        lastUpdated: new Date().toISOString(),
        message: 'Demo mode: Supabase not configured'
      })
    }

    const supabase = await createClient()
    const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

    if (type === "zones") {
      const { data: zoneData, error: zoneError } = await supabase.rpc("get_zone_heatmap_data", {
        hours_back: hours,
      })

      if (zoneError) {
        console.error("[v0] Error fetching zone heatmap data:", zoneError)
        return NextResponse.json({ error: "Database error" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        type: "zones",
        data: zoneData || [],
        lastUpdated: new Date().toISOString(),
      })
    } else {
      const { data: locationData, error: locationError } = await supabase.rpc("get_location_heatmap_data", {
        hours_back: hours,
      })

      if (locationError) {
        console.error("[v0] Error fetching location heatmap data:", locationError)
        return NextResponse.json({ error: "Database error" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        type: "locations",
        data: locationData || [],
        lastUpdated: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error("[v0] Heatmap API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()

    // Handle case where Supabase is not configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('[v0] Supabase not configured, skipping zone update')
      return NextResponse.json({
        success: false,
        message: 'Demo mode: Supabase not configured'
      })
    }

    if (action === "update_zone_safety") {
      const supabase = await createClient()

      const { data: result, error } = await supabase
        .from("safe_zones")
        .update({
          status: data.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.zoneId)
        .select()

      if (error) {
        console.error("[v0] Error updating zone safety:", error)
        return NextResponse.json({ error: "Database error" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        zone: result[0],
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Heatmap update API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
