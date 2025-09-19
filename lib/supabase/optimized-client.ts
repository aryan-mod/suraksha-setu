import { createBrowserClient } from "@supabase/ssr"

export function createOptimizedClient() {
  // Handle swapped environment variables temporarily
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://') 
    ? process.env.NEXT_PUBLIC_SUPABASE_URL 
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('eyJ') 
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
    : process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!url || !key) {
    return null
  }

  return createBrowserClient(url, key, {
    // Performance optimizations
    auth: {
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'x-application-name': 'suraksha-setu',
      }
    },
    // Connection pooling optimization
    db: {
      schema: 'public'
    }
  })
}

// Optimized query helper with caching
export async function optimizedQuery(client: any, table: string, query: any, cacheKey?: string) {
  const cacheTimeout = 5 * 60 * 1000; // 5 minutes
  
  if (cacheKey && typeof window !== 'undefined') {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < cacheTimeout) {
        return { data, error: null };
      }
    }
  }
  
  const result = await client.from(table).select(query);
  
  if (cacheKey && result.data && typeof window !== 'undefined') {
    localStorage.setItem(cacheKey, JSON.stringify({
      data: result.data,
      timestamp: Date.now()
    }));
  }
  
  return result;
}