"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

interface UseAuthGuardOptions {
  redirectTo?: string
  requireAuth?: boolean
}

export function useAuthGuard({ 
  redirectTo = '/auth/login', 
  requireAuth = true 
}: UseAuthGuardOptions = {}) {
  const { user, loading, isSupabaseConfigured } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return // Wait for auth state to load

    // If Supabase is not configured, allow access (demo mode)
    if (!isSupabaseConfigured) return

    if (requireAuth && !user) {
      router.push(redirectTo)
    } else if (!requireAuth && user) {
      // Redirect authenticated users away from auth pages
      router.push('/dashboard')
    }
  }, [user, loading, requireAuth, redirectTo, router, isSupabaseConfigured])

  return {
    user,
    loading,
    isAuthenticated: !!user || !isSupabaseConfigured,
    isSupabaseConfigured
  }
}