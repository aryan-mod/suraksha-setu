"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Mail, Lock, LogIn, LogOut, UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface SupabaseAuthProps {
  className?: string
  onAuthChange?: (user: SupabaseUser | null, role?: string) => void
}

export default function SupabaseAuth({ className, onAuthChange }: SupabaseAuthProps) {
  const { t } = useTranslation('common')
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [userRole, setUserRole] = useState<string>('tourist')
  const supabase = createClient()

  useEffect(() => {
    // Check current auth status
    const checkAuth = async () => {
      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          setUser(user)
          
          // Get user role if user exists
          if (user) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('role')
              .eq('user_id', user.id)
              .single()
            
            const role = profile?.role || 'tourist'
            setUserRole(role)
            onAuthChange?.(user, role)
          } else {
            onAuthChange?.(null)
          }
        } catch (error) {
          console.warn('Auth check error:', error)
        }
      }
      setLoading(false)
    }

    checkAuth()

    // Listen for auth changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          const user = session?.user || null
          setUser(user)
          
          if (user && event === 'SIGNED_IN') {
            // Get or create user profile
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('role')
              .eq('user_id', user.id)
              .single()
            
            if (!profile) {
              // Create profile for new user
              await supabase
                .from('user_profiles')
                .insert([{
                  user_id: user.id,
                  email: user.email,
                  role: 'tourist',
                  created_at: new Date().toISOString()
                }])
              setUserRole('tourist')
              onAuthChange?.(user, 'tourist')
            } else {
              setUserRole(profile.role)
              onAuthChange?.(user, profile.role)
            }
          } else {
            setUserRole('tourist')
            onAuthChange?.(null)
          }
        }
      )

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [supabase, onAuthChange])

  const handleSignUp = async () => {
    if (!supabase) return
    
    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    setAuthLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error
      
      // Show success message
      alert('Check your email for verification link!')
      
    } catch (error) {
      console.error('Sign up error:', error)
      alert(error instanceof Error ? error.message : 'Sign up failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignIn = async () => {
    if (!supabase) return

    setAuthLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      
    } catch (error) {
      console.error('Sign in error:', error)
      alert(error instanceof Error ? error.message : 'Sign in failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    if (!supabase) return

    setAuthLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setAuthLoading(false)
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive'
      case 'police': return 'default'
      case 'tourism': return 'secondary'
      default: return 'outline'
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">{t('common.loading')}</div>
        </CardContent>
      </Card>
    )
  }

  if (user) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('nav.profile')}
            </div>
            <Badge variant={getRoleBadgeVariant(userRole)}>
              {userRole.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t('auth.email')}</Label>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{user.email}</span>
            </div>
          </div>
          
          <div>
            <Label>User ID</Label>
            <div className="text-xs font-mono text-muted-foreground mt-1">
              {user.id.substring(0, 8)}...
            </div>
          </div>
          
          <Button 
            onClick={handleSignOut} 
            disabled={authLoading}
            variant="outline"
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t('auth.logout')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Authentication
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">{t('auth.login')}</TabsTrigger>
            <TabsTrigger value="signup">{t('auth.signup')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="space-y-4">
            <div>
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
            <Button 
              onClick={handleSignIn}
              disabled={authLoading || !email || !password}
              className="w-full"
            >
              <LogIn className="h-4 w-4 mr-2" />
              {authLoading ? t('common.loading') : t('auth.login')}
            </Button>
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4">
            <div>
              <Label htmlFor="signup-email">{t('auth.email')}</Label>
              <Input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="signup-password">{t('auth.password')}</Label>
              <Input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">{t('auth.confirmPassword')}</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
              />
            </div>
            <Button 
              onClick={handleSignUp}
              disabled={authLoading || !email || !password || !confirmPassword}
              className="w-full"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {authLoading ? t('common.loading') : t('auth.signup')}
            </Button>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 text-xs text-center text-muted-foreground">
          Protected by Supabase Auth
        </div>
      </CardContent>
    </Card>
  )
}