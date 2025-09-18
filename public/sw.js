const CACHE_NAME = "safetour-v1"
const urlsToCache = ["/", "/dashboard", "/offline.html", "/icon-192x192.png", "/badge-72x72.png"]

// Install service worker and cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Opened cache")
      return cache.addAll(urlsToCache)
    }),
  )
})

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response
        }
        return fetch(event.request)
      })
      .catch(() => {
        // If both cache and network fail, show offline page
        if (event.request.destination === "document") {
          return caches.match("/offline.html")
        }
      }),
  )
})

// Handle push notifications
self.addEventListener("push", (event) => {
  console.log("[SW] Push received:", event)

  let notificationData = {
    title: "SafeTour Alert",
    body: "You have a new safety notification",
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    tag: "safetour-notification",
    data: {},
  }

  if (event.data) {
    try {
      notificationData = { ...notificationData, ...event.data.json() }
    } catch (error) {
      console.error("[SW] Error parsing push data:", error)
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    data: notificationData.data,
    requireInteraction: notificationData.data.priority === "critical",
    actions: [
      {
        action: "view",
        title: "View Details",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification(notificationData.title, options))
})

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event)

  event.notification.close()

  if (event.action === "view") {
    // Open the app to view notification details
    event.waitUntil(clients.openWindow("/dashboard?notification=" + event.notification.tag))
  } else if (event.action === "dismiss") {
    // Just close the notification
    return
  } else {
    // Default action - open the app
    event.waitUntil(clients.openWindow("/dashboard"))
  }
})

// Handle background sync for offline notifications
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync-notifications") {
    event.waitUntil(syncNotifications())
  }
})

async function syncNotifications() {
  try {
    // Sync any pending notifications when back online
    const cache = await caches.open(CACHE_NAME)
    const pendingNotifications = await cache.match("/pending-notifications")

    if (pendingNotifications) {
      const notifications = await pendingNotifications.json()

      // Process pending notifications
      for (const notification of notifications) {
        await fetch("/api/notifications/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(notification),
        })
      }

      // Clear pending notifications
      await cache.delete("/pending-notifications")
    }
  } catch (error) {
    console.error("[SW] Background sync failed:", error)
  }
}
