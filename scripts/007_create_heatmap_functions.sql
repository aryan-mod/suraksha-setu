-- Create function to get zone-based heatmap data
CREATE OR REPLACE FUNCTION get_zone_heatmap_data(
  hours_back INTEGER DEFAULT 24
) RETURNS TABLE (
  zone_id UUID,
  zone_name TEXT,
  zone_description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  radius INTEGER,
  status TEXT,
  zone_type TEXT,
  tourist_count INTEGER,
  recent_visits INTEGER,
  safety_score DECIMAL(5, 2),
  intensity DECIMAL(3, 2),
  last_activity TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  start_time TIMESTAMP WITH TIME ZONE;
BEGIN
  start_time := NOW() - (hours_back || ' hours')::INTERVAL;
  
  RETURN QUERY
  WITH zone_activity AS (
    SELECT 
      sz.id,
      sz.name,
      sz.description,
      sz.latitude,
      sz.longitude,
      sz.radius,
      sz.status,
      sz.zone_type,
      COUNT(DISTINCT lt.user_id) as unique_tourists,
      COUNT(lt.id) as total_visits,
      MAX(lt.recorded_at) as last_visit,
      -- Calculate safety score based on zone status and recent incidents
      CASE 
        WHEN sz.status = 'safe' THEN 95.0
        WHEN sz.status = 'caution' THEN 75.0
        WHEN sz.status = 'restricted' THEN 45.0
        ELSE 60.0
      END as base_safety_score,
      -- Calculate intensity based on visit frequency
      LEAST(1.0, COUNT(lt.id)::DECIMAL / 50.0) as visit_intensity
    FROM public.safe_zones sz
    LEFT JOIN public.location_tracking lt ON (
      lt.safe_zone_id = sz.id::TEXT 
      AND lt.recorded_at >= start_time
    )
    WHERE sz.is_active = true
    GROUP BY sz.id, sz.name, sz.description, sz.latitude, sz.longitude, sz.radius, sz.status, sz.zone_type
  ),
  incident_impact AS (
    SELECT 
      sz.id as zone_id,
      COUNT(er.id) as incident_count,
      -- Reduce safety score based on recent incidents
      GREATEST(0, 20 - COUNT(er.id) * 5) as safety_penalty
    FROM public.safe_zones sz
    LEFT JOIN public.efir_reports er ON (
      calculate_distance(sz.latitude, sz.longitude, er.latitude, er.longitude) <= sz.radius
      AND er.created_at >= start_time
      AND er.status IN ('submitted', 'under_review')
    )
    WHERE sz.is_active = true
    GROUP BY sz.id
  )
  SELECT 
    za.id,
    za.name,
    za.description,
    za.latitude,
    za.longitude,
    za.radius,
    za.status,
    za.zone_type,
    za.unique_tourists::INTEGER,
    za.total_visits::INTEGER,
    GREATEST(0, za.base_safety_score - COALESCE(ii.safety_penalty, 0)),
    GREATEST(0.1, za.visit_intensity),
    za.last_visit
  FROM zone_activity za
  LEFT JOIN incident_impact ii ON za.id = ii.zone_id
  ORDER BY za.unique_tourists DESC, za.total_visits DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get location-based heatmap data
CREATE OR REPLACE FUNCTION get_location_heatmap_data(
  hours_back INTEGER DEFAULT 24
) RETURNS TABLE (
  location_name TEXT,
  visit_count INTEGER,
  unique_visitors INTEGER,
  safety_percentage DECIMAL(5, 2),
  average_accuracy DECIMAL(8, 2),
  last_visit TIMESTAMP WITH TIME ZONE,
  coordinates JSONB
) AS $$
DECLARE
  start_time TIMESTAMP WITH TIME ZONE;
BEGIN
  start_time := NOW() - (hours_back || ' hours')::INTERVAL;
  
  RETURN QUERY
  WITH location_stats AS (
    SELECT 
      COALESCE(lt.location_name, 'Unknown Location') as loc_name,
      COUNT(lt.id) as visits,
      COUNT(DISTINCT lt.user_id) as unique_users,
      AVG(lt.accuracy) as avg_accuracy,
      MAX(lt.recorded_at) as latest_visit,
      AVG(lt.latitude) as avg_lat,
      AVG(lt.longitude) as avg_lng,
      -- Calculate safety based on zone status and incidents
      AVG(
        CASE 
          WHEN lt.safe_zone_status = 'safe' THEN 95.0
          WHEN lt.safe_zone_status = 'caution' THEN 75.0
          WHEN lt.safe_zone_status = 'restricted' THEN 45.0
          ELSE 70.0
        END
      ) as avg_safety
    FROM public.location_tracking lt
    WHERE lt.recorded_at >= start_time
      AND lt.location_name IS NOT NULL
    GROUP BY lt.location_name
  ),
  incident_adjustments AS (
    SELECT 
      ls.loc_name,
      ls.visits,
      ls.unique_users,
      ls.avg_accuracy,
      ls.latest_visit,
      ls.avg_lat,
      ls.avg_lng,
      -- Adjust safety score based on nearby incidents
      GREATEST(30.0, ls.avg_safety - (
        SELECT COUNT(er.id) * 5
        FROM public.efir_reports er
        WHERE calculate_distance(ls.avg_lat, ls.avg_lng, er.latitude, er.longitude) <= 500
          AND er.created_at >= start_time
          AND er.status IN ('submitted', 'under_review')
      )) as final_safety
    FROM location_stats ls
  )
  SELECT 
    ia.loc_name,
    ia.visits::INTEGER,
    ia.unique_users::INTEGER,
    ia.final_safety,
    ia.avg_accuracy,
    ia.latest_visit,
    jsonb_build_object(
      'latitude', ia.avg_lat,
      'longitude', ia.avg_lng
    )
  FROM incident_adjustments ia
  WHERE ia.visits >= 3  -- Only include locations with meaningful activity
  ORDER BY ia.visits DESC, ia.unique_users DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get real-time heatmap summary
CREATE OR REPLACE FUNCTION get_heatmap_summary(
  hours_back INTEGER DEFAULT 24
) RETURNS TABLE (
  total_active_tourists INTEGER,
  total_locations_visited INTEGER,
  average_safety_score DECIMAL(5, 2),
  high_risk_zones INTEGER,
  recent_incidents INTEGER,
  most_popular_zone TEXT,
  safest_zone TEXT
) AS $$
DECLARE
  start_time TIMESTAMP WITH TIME ZONE;
BEGIN
  start_time := NOW() - (hours_back || ' hours')::INTERVAL;
  
  RETURN QUERY
  WITH summary_stats AS (
    SELECT 
      COUNT(DISTINCT lt.user_id) as active_tourists,
      COUNT(DISTINCT lt.location_name) as locations_visited,
      AVG(
        CASE 
          WHEN lt.safe_zone_status = 'safe' THEN 95.0
          WHEN lt.safe_zone_status = 'caution' THEN 75.0
          WHEN lt.safe_zone_status = 'restricted' THEN 45.0
          ELSE 70.0
        END
      ) as avg_safety
    FROM public.location_tracking lt
    WHERE lt.recorded_at >= start_time
  ),
  zone_stats AS (
    SELECT 
      COUNT(CASE WHEN sz.status = 'restricted' THEN 1 END) as high_risk_count,
      (SELECT sz.name FROM public.safe_zones sz 
       LEFT JOIN public.location_tracking lt ON lt.safe_zone_id = sz.id::TEXT 
       WHERE lt.recorded_at >= start_time 
       GROUP BY sz.name 
       ORDER BY COUNT(lt.id) DESC 
       LIMIT 1) as popular_zone,
      (SELECT sz.name FROM public.safe_zones sz 
       WHERE sz.status = 'safe' AND sz.is_active = true 
       ORDER BY sz.radius DESC 
       LIMIT 1) as safest_zone
    FROM public.safe_zones sz
    WHERE sz.is_active = true
  ),
  incident_stats AS (
    SELECT COUNT(er.id) as recent_incident_count
    FROM public.efir_reports er
    WHERE er.created_at >= start_time
      AND er.status IN ('submitted', 'under_review')
  )
  SELECT 
    ss.active_tourists::INTEGER,
    ss.locations_visited::INTEGER,
    ss.avg_safety,
    zs.high_risk_count::INTEGER,
    ist.recent_incident_count::INTEGER,
    zs.popular_zone,
    zs.safest_zone
  FROM summary_stats ss
  CROSS JOIN zone_stats zs
  CROSS JOIN incident_stats ist;
END;
$$ LANGUAGE plpgsql;
