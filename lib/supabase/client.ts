import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  // Handle potentially swapped environment variables
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://') 
    ? process.env.NEXT_PUBLIC_SUPABASE_URL 
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('eyJ') 
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
    : process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!url || !key) {
    // Return a mock client when Supabase credentials are not available
    return null
  }
  return createBrowserClient(url!, key!)
}
