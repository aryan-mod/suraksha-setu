import { NextRequest, NextResponse } from 'next/server';
import { getCacheHeaders } from './cache-config';

// Optimized API response wrapper
export function withCache(
  handler: (req: NextRequest) => Promise<Response>,
  cacheType: keyof typeof import('./cache-config').cacheConfig.apiRoutes
) {
  return async (req: NextRequest) => {
    try {
      const response = await handler(req);
      const data = await response.json();
      
      return NextResponse.json(data, {
        status: 200,
        headers: getCacheHeaders(cacheType),
      });
    } catch (error) {
      console.error(`API Error in ${cacheType}:`, error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}

// Database connection optimization
export async function optimizedSupabaseQuery(
  client: any,
  queryFn: () => Promise<any>,
  fallbackData?: any
) {
  try {
    const startTime = Date.now();
    const result = await queryFn();
    const queryTime = Date.now() - startTime;
    
    // Log slow queries for optimization
    if (queryTime > 1000) {
      console.warn(`Slow query detected: ${queryTime}ms`);
    }
    
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    
    // Return fallback data instead of throwing
    if (fallbackData) {
      return { data: fallbackData, error: null };
    }
    
    throw error;
  }
}

// Rate limiting for API endpoints
const rateLimitMap = new Map();

export function rateLimit(identifier: string, limit: number, windowMs: number) {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimitMap.has(identifier)) {
    rateLimitMap.set(identifier, []);
  }
  
  const requests = rateLimitMap.get(identifier);
  const validRequests = requests.filter((time: number) => time > windowStart);
  
  if (validRequests.length >= limit) {
    return false;
  }
  
  validRequests.push(now);
  rateLimitMap.set(identifier, validRequests);
  
  return true;
}

// Compression helper for large payloads
export function compressResponse(data: any): string {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error('Compression error:', error);
    return JSON.stringify({ error: 'Data processing error' });
  }
}