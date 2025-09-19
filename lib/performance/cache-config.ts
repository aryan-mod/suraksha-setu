// Cache configuration for optimal performance
export const cacheConfig = {
  // API route caching
  apiRoutes: {
    heatmap: 300, // 5 minutes
    userLocation: 30, // 30 seconds
    emergencyAlerts: 10, // 10 seconds
    chatHistory: 600, // 10 minutes
  },
  
  // Static content caching
  staticContent: {
    images: 86400, // 24 hours
    css: 31536000, // 1 year
    js: 31536000, // 1 year
    fonts: 31536000, // 1 year
  },
  
  // Database query caching
  database: {
    userProfile: 300, // 5 minutes
    safetyZones: 1800, // 30 minutes
    emergencyContacts: 3600, // 1 hour
  }
}

// Cache headers helper
export function getCacheHeaders(type: keyof typeof cacheConfig.apiRoutes) {
  const maxAge = cacheConfig.apiRoutes[type];
  return {
    'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
    'CDN-Cache-Control': `public, max-age=${maxAge}`,
    'Vercel-CDN-Cache-Control': `public, max-age=${maxAge}`,
  };
}

// Service Worker cache strategies
export const swCacheStrategies = {
  // Cache First - for static assets
  static: {
    cacheName: 'static-cache-v1',
    strategy: 'CacheFirst',
    maxEntries: 50,
    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Network First - for API calls
  api: {
    cacheName: 'api-cache-v1',
    strategy: 'NetworkFirst',
    maxEntries: 100,
    maxAgeSeconds: 5 * 60, // 5 minutes
  },
  
  // Stale While Revalidate - for frequently updated content
  dynamic: {
    cacheName: 'dynamic-cache-v1',
    strategy: 'StaleWhileRevalidate',
    maxEntries: 200,
    maxAgeSeconds: 24 * 60 * 60, // 24 hours
  }
};