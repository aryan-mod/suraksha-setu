import { NextRequest } from 'next/server';
import { withCache, optimizedSupabaseQuery } from '@/lib/performance/optimized-api';
import { createClient } from '@/lib/supabase/server';

async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'locations';
  const hours = parseInt(searchParams.get('hours') || '24');

  try {
    const supabase = await createClient();
    
    // Optimized query with proper indexing
    const result = await optimizedSupabaseQuery(
      supabase,
      async () => {
        return await supabase
          .from('location_tracking')
          .select('latitude, longitude, accuracy, created_at')
          .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(1000); // Limit for performance
      },
      // Fallback mock data
      [
        { latitude: 28.6139, longitude: 77.2090, accuracy: 10, created_at: new Date().toISOString() },
        { latitude: 28.6129, longitude: 77.2080, accuracy: 15, created_at: new Date().toISOString() },
      ]
    );

    return Response.json({
      success: true,
      data: result.data,
      count: result.data?.length || 0,
      cached: false
    });

  } catch (error) {
    console.error('Heatmap API error:', error);
    return Response.json({
      success: false,
      error: 'Failed to fetch heatmap data',
      data: []
    }, { status: 500 });
  }
}

export const GET = withCache(handler, 'heatmap');