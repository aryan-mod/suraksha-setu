import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const notification = await request.json()

    if (!notification) {
      return NextResponse.json({ error: "Missing notification data" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: notification.userId,
        type: notification.type || "system",
        title: notification.title,
        message: notification.message,
        priority: notification.priority || "medium",
        location: notification.location,
        latitude: notification.latitude,
        longitude: notification.longitude,
        action_required: notification.actionRequired || false,
        metadata: notification.metadata || {},
        expires_at: notification.expiresAt,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error syncing notification:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      notification: data,
    })
  } catch (error) {
    console.error("[v0] Notification sync API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("[v0] Error fetching notifications:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
    })
  } catch (error) {
    console.error("[v0] Notification fetch API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
