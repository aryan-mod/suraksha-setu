import { type NextRequest, NextResponse } from "next/server"
import webpush from "web-push"
import { createClient } from "@/lib/supabase/server"

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  "mailto:support@safetour.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function POST(request: NextRequest) {
  try {
    const { userId, notification } = await request.json()

    if (!userId || !notification) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get user's push subscriptions
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", userId)

    if (error) {
      console.error("[v0] Error fetching push subscriptions:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: "No push subscriptions found" }, { status: 200 })
    }

    // Send push notification to all user's devices
    const pushPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(sub.subscription, JSON.stringify(notification))
        return { success: true }
      } catch (error) {
        console.error("[v0] Push notification failed:", error)
        return { success: false, error }
      }
    })

    const results = await Promise.all(pushPromises)
    const successCount = results.filter((r) => r.success).length

    return NextResponse.json({
      success: true,
      sent: successCount,
      total: subscriptions.length,
    })
  } catch (error) {
    console.error("[v0] Push notification API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
