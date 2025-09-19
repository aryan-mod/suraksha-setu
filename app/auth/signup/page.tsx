"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Shield, MapPin, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { signUp, user, loading, isSupabaseConfigured } = useAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    const { error: signUpError } = await signUp(email, password, fullName)
    
    if (signUpError) {
      setError(signUpError)
      setIsLoading(false)
    } else {
      setSuccess(true)
      setIsLoading(false)
      if (isSupabaseConfigured) {
        setTimeout(() => router.push("/auth/verify-email"), 2000)
      } else {
        setTimeout(() => router.push("/dashboard"), 2000)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <MapPin className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Tourist Safety System</h1>
          <p className="text-gray-600 mt-2">Create your safety account</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">Create Account</CardTitle>
            <CardDescription>Join our safety network today</CardDescription>
          </CardHeader>
          <CardContent>
            {!isSupabaseConfigured && (
              <div className="mb-4 p-3 text-sm text-amber-700 bg-amber-50 rounded-md border border-amber-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Demo Mode: Authentication service not configured
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 rounded-md border border-green-200">
                Account created successfully! {isSupabaseConfigured ? "Check your email for verification." : "Redirecting to dashboard..."}
              </div>
            )}
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-white/50"
                  disabled={!isSupabaseConfigured}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/50"
                  disabled={!isSupabaseConfigured}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/50"
                  disabled={!isSupabaseConfigured}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white/50"
                  disabled={!isSupabaseConfigured}
                />
              </div>
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
                disabled={isLoading || !isSupabaseConfigured}
              >
                {isLoading ? "Creating account..." : isSupabaseConfigured ? "Create Account" : "Demo Mode - Auth Disabled"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
