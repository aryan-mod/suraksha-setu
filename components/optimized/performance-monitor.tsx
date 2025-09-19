'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});

  useEffect(() => {
    // Measure Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        switch (entry.entryType) {
          case 'largest-contentful-paint':
            setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
            break;
          case 'first-input':
            setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
            break;
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              setMetrics(prev => ({ 
                ...prev, 
                cls: (prev.cls || 0) + (entry as any).value 
              }));
            }
            break;
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
            }
            break;
          case 'navigation':
            const navEntry = entry as PerformanceNavigationTiming;
            setMetrics(prev => ({ 
              ...prev, 
              ttfb: navEntry.responseStart - navEntry.requestStart 
            }));
            break;
        }
      });
    });

    // Observe different entry types
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      observer.observe({ entryTypes: ['first-input'] });
      observer.observe({ entryTypes: ['layout-shift'] });
      observer.observe({ entryTypes: ['paint'] });
      observer.observe({ entryTypes: ['navigation'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }

    // Log metrics to console (or send to analytics)
    const logMetrics = () => {
      console.log('Core Web Vitals:', metrics);
      
      // Example: Send to analytics service
      if (typeof gtag !== 'undefined') {
        Object.entries(metrics).forEach(([name, value]) => {
          if (value !== undefined) {
            gtag('event', name, {
              event_category: 'Web Vitals',
              value: Math.round(value),
              non_interaction: true,
            });
          }
        });
      }
    };

    const timeoutId = setTimeout(logMetrics, 5000);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [metrics]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white text-xs rounded-lg z-50">
      <h4 className="font-bold mb-2">Performance Metrics</h4>
      <div className="space-y-1">
        {metrics.lcp && (
          <div className={`${metrics.lcp <= 2500 ? 'text-green-400' : metrics.lcp <= 4000 ? 'text-yellow-400' : 'text-red-400'}`}>
            LCP: {Math.round(metrics.lcp)}ms
          </div>
        )}
        {metrics.fid && (
          <div className={`${metrics.fid <= 100 ? 'text-green-400' : metrics.fid <= 300 ? 'text-yellow-400' : 'text-red-400'}`}>
            FID: {Math.round(metrics.fid)}ms
          </div>
        )}
        {metrics.cls !== undefined && (
          <div className={`${metrics.cls <= 0.1 ? 'text-green-400' : metrics.cls <= 0.25 ? 'text-yellow-400' : 'text-red-400'}`}>
            CLS: {metrics.cls.toFixed(3)}
          </div>
        )}
        {metrics.fcp && (
          <div>FCP: {Math.round(metrics.fcp)}ms</div>
        )}
        {metrics.ttfb && (
          <div>TTFB: {Math.round(metrics.ttfb)}ms</div>
        )}
      </div>
    </div>
  );
}