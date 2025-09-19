"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  isSupabaseConfigured: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const isSupabaseConfigured = supabase !== null

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          console.error('Auth error:', error)
        } else {
          setUser(user)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        
        if (event === 'SIGNED_IN' && currentUser) {
          // Create or update user profile if needed
          try {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('user_id', currentUser.id)
              .single()

            if (!profile) {
              await supabase
                .from('user_profiles')
                .insert({
                  user_id: currentUser.id,
                  email: currentUser.email,
                  role: 'tourist',
                  created_at: new Date().toISOString()
                })
            }
          } catch (error) {
            // Profile creation is optional, don't break auth flow
            console.warn('Profile creation failed:', error)
          }
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [isSupabaseConfigured])

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      return { error: 'Authentication service not configured' }
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        return { error: error.message }
      }
      
      return { error: null }
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Sign in failed' 
      }
    }
  }

  const signUp = async (email: string, password: string, fullName?: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      return { error: 'Authentication service not configured' }
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: fullName ? { full_name: fullName } : undefined
        }
      })
      
      if (error) {
        return { error: error.message }
      }
      
      return { error: null }
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Sign up failed' 
      }
    }
  }

  const signOut = async (): Promise<void> => {
    if (!isSupabaseConfigured) {
      return
    }

    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      }
      // Clear user state immediately
      setUser(null)
    } catch (error) {
      console.error('Sign out error:', error)
      // Clear user state even if sign out fails
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      isSupabaseConfigured
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}