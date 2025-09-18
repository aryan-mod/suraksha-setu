-- Create location_tracking table for storing user location history
CREATE TABLE IF NOT EXISTS public.location_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(8, 2),
  altitude DECIMAL(8, 2),
  heading DECIMAL(5, 2),
  speed DECIMAL(8, 2),
  location_name TEXT,
  safe_zone_id TEXT,
  safe_zone_status TEXT CHECK (safe_zone_status IN ('safe', 'caution', 'restricted')),
  is_emergency BOOLEAN DEFAULT false,
  metadata JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create safe_zones table for geofencing
CREATE TABLE IF NOT EXISTS public.safe_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  radius INTEGER NOT NULL, -- in meters
  status TEXT DEFAULT 'safe' CHECK (status IN ('safe', 'caution', 'restricted')),
  zone_type TEXT DEFAULT 'general' CHECK (zone_type IN ('general', 'tourist', 'emergency', 'restricted')),
  contact_info JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.location_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safe_zones ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for location_tracking
CREATE POLICY "location_tracking_select_own" ON public.location_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "location_tracking_insert_own" ON public.location_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "location_tracking_update_own" ON public.location_tracking FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "location_tracking_delete_own" ON public.location_tracking FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for safe_zones (public read for authenticated users)
CREATE POLICY "safe_zones_select_all" ON public.safe_zones FOR SELECT TO authenticated USING (is_active = true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_location_tracking_user_id ON public.location_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_location_tracking_recorded_at ON public.location_tracking(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_location_tracking_coordinates ON public.location_tracking(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_location_tracking_safe_zone ON public.location_tracking(safe_zone_id);
CREATE INDEX IF NOT EXISTS idx_safe_zones_coordinates ON public.safe_zones(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_safe_zones_status ON public.safe_zones(status);

-- Create function to update updated_at timestamp for safe_zones
CREATE TRIGGER update_safe_zones_updated_at BEFORE UPDATE ON public.safe_zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample safe zones data
INSERT INTO public.safe_zones (name, description, latitude, longitude, radius, status, zone_type) VALUES
('Gateway of India', 'Tourist attraction with 24/7 security monitoring', 18.922, 72.8347, 500, 'safe', 'tourist'),
('Marine Drive', 'Well-lit promenade with police patrol', 18.9434, 72.8234, 300, 'safe', 'tourist'),
('Crawford Market Area', 'Crowded market area - stay alert for pickpockets', 18.9467, 72.8342, 200, 'caution', 'general'),
('Chhatrapati Shivaji Terminus', 'Major railway station with security presence', 18.9398, 72.8355, 400, 'safe', 'general'),
('Colaba Causeway', 'Shopping street with tourist police', 18.9067, 72.8147, 250, 'safe', 'tourist'),
('Dharavi Slum Area', 'High-risk area - avoid after dark', 19.0376, 72.8562, 1000, 'restricted', 'restricted');
