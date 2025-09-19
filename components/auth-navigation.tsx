"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, LogOut, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

interface AuthNavigationProps {
  className?: string
}

export function AuthNavigation({ className }: AuthNavigationProps) {
  const { user, signOut, loading, isSupabaseConfigured } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleSignIn = () => {
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-10 bg-muted rounded"></div>
      </div>
    )
  }

  if (!isSupabaseConfigured) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Demo Mode</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (user) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Welcome back
            </div>
            <Badge variant="outline">Tourist</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm truncate">{user.email}</p>
            </div>
            <Button 
              onClick={handleSignOut} 
              variant="outline"
              size="sm"
              className="w-full"
            >
              <LogOut className="h-3 w-3 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Access your safety dashboard</p>
          <Button onClick={handleSignIn} className="w-full">
            Sign In
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}