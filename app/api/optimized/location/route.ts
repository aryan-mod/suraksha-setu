import { NextRequest } from 'next/server';
import { withCache, rateLimit } from '@/lib/performance/optimized-api';
import { createClient } from '@/lib/supabase/server';

async function handler(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  
  // Rate limiting: 60 requests per minute
  if (!rateLimit(ip, 60, 60 * 1000)) {
    return Response.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const { latitude, longitude, accuracy, user_id } = body;

      // Validate input
      if (!latitude || !longitude || !user_id) {
        return Response.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from('location_tracking')
        .insert({
          user_id,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          accuracy: accuracy || 0,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return Response.json({
        success: true,
        data,
        message: 'Location updated successfully'
      });

    } catch (error) {
      console.error('Location update error:', error);
      return Response.json(
        { error: 'Failed to update location' },
        { status: 500 }
      );
    }
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}

export const POST = handler;