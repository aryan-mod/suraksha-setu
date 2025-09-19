import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Optimized loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
)

// Lazy load heavy components for better performance
export const LazyHeatmap = dynamic(() => import('@/components/real-time-heatmap'), {
  loading: () => <LoadingSpinner />,
  ssr: false // Disable SSR for client-only components
})

export const LazyChatbot = dynamic(() => import('@/components/ai-chatbot'), {
  loading: () => <LoadingSpinner />,
  ssr: false
})

export const LazyLocationTracker = dynamic(() => import('@/components/live-location-tracker'), {
  loading: () => <LoadingSpinner />,
  ssr: false
})

export const LazyEmergencyButton = dynamic(() => import('@/components/sos-emergency-button'), {
  loading: () => <LoadingSpinner />,
  ssr: false
})

// HOC for lazy loading with intersection observer
export function withLazyLoading<T extends object>(
  Component: React.ComponentType<T>,
  options?: { threshold?: number }
) {
  return function LazyLoadedComponent(props: T) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Component {...props} />
      </Suspense>
    )
  }
}

// Performance-optimized image component
export const OptimizedImage = dynamic(() => import('next/image'), {
  loading: () => <div className="bg-gray-200 animate-pulse rounded"></div>
})