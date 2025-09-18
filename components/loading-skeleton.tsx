"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface LoadingSkeletonProps {
  variant?: "card" | "list" | "dashboard" | "map" | "chat" | "form"
  count?: number
  className?: string
}

export function LoadingSkeleton({ variant = "card", count = 1, className = "" }: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case "dashboard":
        return (
          <div className={`space-y-6 ${className}`}>
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
              <div className="h-8 w-48 bg-muted/50 rounded-lg animate-pulse" />
              <div className="h-10 w-32 bg-muted/50 rounded-lg animate-pulse" />
            </div>

            {/* Stats cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="glassmorphism bg-card/50 border-border/50">
                  <CardHeader className="pb-3">
                    <div className="h-4 w-24 bg-muted/50 rounded animate-pulse" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 w-16 bg-muted/50 rounded animate-pulse mb-2" />
                    <div className="h-3 w-32 bg-muted/50 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glassmorphism bg-card/50 border-border/50">
                <CardHeader>
                  <div className="h-6 w-32 bg-muted/50 rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted/30 rounded-lg animate-pulse" />
                </CardContent>
              </Card>

              <Card className="glassmorphism bg-card/50 border-border/50">
                <CardHeader>
                  <div className="h-6 w-40 bg-muted/50 rounded animate-pulse" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted/50 rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-muted/50 rounded animate-pulse" />
                        <div className="h-3 w-1/2 bg-muted/50 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "map":
        return (
          <div className={`h-96 bg-muted/30 rounded-lg relative overflow-hidden ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-muted/40 animate-pulse" />
            <div className="absolute top-4 left-4 space-y-2">
              <div className="h-4 w-32 bg-muted/60 rounded animate-pulse" />
              <div className="h-3 w-24 bg-muted/60 rounded animate-pulse" />
            </div>
            <div className="absolute bottom-4 right-4">
              <div className="h-10 w-10 bg-muted/60 rounded-full animate-pulse" />
            </div>
            {/* Simulated map markers */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute w-4 h-4 bg-primary/60 rounded-full animate-pulse"
                style={{
                  top: `${20 + i * 20}%`,
                  left: `${30 + i * 15}%`,
                }}
              />
            ))}
          </div>
        )

      case "chat":
        return (
          <div className={`space-y-4 ${className}`}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                {i % 2 !== 0 && <div className="w-8 h-8 bg-muted/50 rounded-full animate-pulse" />}
                <div className={`max-w-[80%] ${i % 2 === 0 ? "order-first" : ""}`}>
                  <div className={`p-3 rounded-lg ${i % 2 === 0 ? "bg-primary/20" : "bg-muted/30"} animate-pulse`}>
                    <div className="h-4 w-32 bg-muted/50 rounded mb-2" />
                    <div className="h-4 w-24 bg-muted/50 rounded" />
                  </div>
                </div>
                {i % 2 === 0 && <div className="w-8 h-8 bg-muted/50 rounded-full animate-pulse" />}
              </div>
            ))}
          </div>
        )

      case "form":
        return (
          <div className={`space-y-6 ${className}`}>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-muted/50 rounded animate-pulse" />
                  <div className="h-10 w-full bg-muted/30 rounded-lg animate-pulse" />
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-24 bg-muted/50 rounded-lg animate-pulse" />
              <div className="h-10 w-32 bg-primary/30 rounded-lg animate-pulse" />
            </div>
          </div>
        )

      case "list":
        return (
          <div className={`space-y-3 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 glassmorphism bg-card/30 border-border/50 rounded-lg">
                <div className="w-12 h-12 bg-muted/50 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted/50 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-muted/50 rounded animate-pulse" />
                </div>
                <div className="h-8 w-20 bg-muted/50 rounded animate-pulse" />
              </div>
            ))}
          </div>
        )

      default: // card
        return (
          <div className={`space-y-4 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
              <Card key={i} className="glassmorphism bg-card/50 border-border/50">
                <CardHeader>
                  <div className="h-6 w-48 bg-muted/50 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-muted/50 rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-muted/50 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-muted/50 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-muted/50 rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
    }
  }

  return renderSkeleton()
}
