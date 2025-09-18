-- Create function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL(10, 8),
  lng1 DECIMAL(11, 8),
  lat2 DECIMAL(10, 8),
  lng2 DECIMAL(11, 8)
) RETURNS DECIMAL(10, 2) AS $$
DECLARE
  earth_radius CONSTANT DECIMAL := 6371000; -- Earth's radius in meters
  lat1_rad DECIMAL;
  lat2_rad DECIMAL;
  delta_lat DECIMAL;
  delta_lng DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  lat1_rad := radians(lat1);
  lat2_rad := radians(lat2);
  delta_lat := radians(lat2 - lat1);
  delta_lng := radians(lng2 - lng1);
  
  a := sin(delta_lat/2) * sin(delta_lat/2) + 
       cos(lat1_rad) * cos(lat2_rad) * 
       sin(delta_lng/2) * sin(delta_lng/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql;

-- Create function to get nearby safe zones
CREATE OR REPLACE FUNCTION get_nearby_safe_zones(
  user_lat DECIMAL(10, 8),
  user_lng DECIMAL(11, 8),
  radius_km DECIMAL DEFAULT 2.0
) RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  radius INTEGER,
  status TEXT,
  zone_type TEXT,
  distance_meters DECIMAL(10, 2),
  is_inside BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sz.id,
    sz.name,
    sz.description,
    sz.latitude,
    sz.longitude,
    sz.radius,
    sz.status,
    sz.zone_type,
    calculate_distance(user_lat, user_lng, sz.latitude, sz.longitude) as distance_meters,
    (calculate_distance(user_lat, user_lng, sz.latitude, sz.longitude) <= sz.radius) as is_inside
  FROM public.safe_zones sz
  WHERE sz.is_active = true
    AND calculate_distance(user_lat, user_lng, sz.latitude, sz.longitude) <= (radius_km * 1000)
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user's location statistics
CREATE OR REPLACE FUNCTION get_location_stats(
  user_id_param UUID,
  days_back INTEGER DEFAULT 7
) RETURNS TABLE (
  total_locations INTEGER,
  safe_zone_visits INTEGER,
  caution_zone_visits INTEGER,
  restricted_zone_visits INTEGER,
  average_accuracy DECIMAL(8, 2),
  distance_traveled_km DECIMAL(10, 2),
  most_visited_zone TEXT
) AS $$
DECLARE
  start_date TIMESTAMP WITH TIME ZONE;
BEGIN
  start_date := NOW() - (days_back || ' days')::INTERVAL;
  
  RETURN QUERY
  WITH location_stats AS (
    SELECT 
      COUNT(*) as total_count,
      COUNT(CASE WHEN safe_zone_status = 'safe' THEN 1 END) as safe_count,
      COUNT(CASE WHEN safe_zone_status = 'caution' THEN 1 END) as caution_count,
      COUNT(CASE WHEN safe_zone_status = 'restricted' THEN 1 END) as restricted_count,
      AVG(accuracy) as avg_accuracy
    FROM public.location_tracking lt
    WHERE lt.user_id = user_id_param 
      AND lt.recorded_at >= start_date
  ),
  distance_calc AS (
    SELECT 
      SUM(
        calculate_distance(
          LAG(latitude) OVER (ORDER BY recorded_at),
          LAG(longitude) OVER (ORDER BY recorded_at),
          latitude,
          longitude
        )
      ) / 1000.0 as total_distance
    FROM public.location_tracking lt
    WHERE lt.user_id = user_id_param 
      AND lt.recorded_at >= start_date
  ),
  popular_zone AS (
    SELECT location_name
    FROM public.location_tracking lt
    WHERE lt.user_id = user_id_param 
      AND lt.recorded_at >= start_date
      AND location_name IS NOT NULL
    GROUP BY location_name
    ORDER BY COUNT(*) DESC
    LIMIT 1
  )
  SELECT 
    ls.total_count::INTEGER,
    ls.safe_count::INTEGER,
    ls.caution_count::INTEGER,
    ls.restricted_count::INTEGER,
    ls.avg_accuracy,
    COALESCE(dc.total_distance, 0),
    pz.location_name
  FROM location_stats ls
  CROSS JOIN distance_calc dc
  LEFT JOIN popular_zone pz ON true;
END;
$$ LANGUAGE plpgsql;
