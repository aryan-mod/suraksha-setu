// Optimized Service Worker for Suraksha Setu
const CACHE_NAME = 'suraksha-setu-v2';
const STATIC_CACHE = 'static-cache-v2';
const DYNAMIC_CACHE = 'dynamic-cache-v2';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/_next/static/css/',
  '/_next/static/js/',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (![STATIC_CACHE, DYNAMIC_CACHE].includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // API requests - Network First strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Static assets - Cache First strategy
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/static/') ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|webp|svg|ico)$/)
  ) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Pages - Stale While Revalidate strategy
  event.respondWith(staleWhileRevalidateStrategy(request));
});

// Cache First Strategy
async function cacheFirstStrategy(request) {
  try {
    const cacheResponse = await caches.match(request);
    if (cacheResponse) {
      return cacheResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache First failed:', error);
    return new Response('Network error', { status: 408 });
  }
}

// Network First Strategy
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cacheResponse = await caches.match(request);
    if (cacheResponse) {
      return cacheResponse;
    }
    
    return new Response(JSON.stringify({ 
      error: 'Network unavailable',
      cached: false 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cacheResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    throw error;
  });

  return cacheResponse || fetchPromise;
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Retry failed location updates or emergency alerts
  const failedRequests = await getFailedRequests();
  
  for (const request of failedRequests) {
    try {
      await fetch(request.url, request.options);
      await removeFailedRequest(request.id);
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: data.data,
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'emergency') {
    event.waitUntil(
      clients.openWindow('/emergency')
    );
  } else if (event.notification.data?.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Helper functions for IndexedDB operations
async function getFailedRequests() {
  // Implementation for retrieving failed requests from IndexedDB
  return [];
}

async function removeFailedRequest(id) {
  // Implementation for removing processed requests from IndexedDB
}