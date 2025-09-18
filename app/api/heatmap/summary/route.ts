import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hours = Number.parseInt(searchParams.get("hours") || "24")

    const supabase = await createClient()

    const { data, error } = await supabase.rpc("get_heatmap_summary", {
      hours_back: hours,
    })

    if (error) {
      console.error("[v0] Error fetching heatmap summary:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: data && data.length > 0 ? data[0] : null,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Heatmap summary API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
