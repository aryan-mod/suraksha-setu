-- Tourist Safety System Database Schema
-- This script creates all necessary tables for the safety system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Users table for authentication and profiles
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Safety incidents table for tracking reported incidents
CREATE TABLE IF NOT EXISTS safety_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  incident_type VARCHAR(50) NOT NULL CHECK (incident_type IN ('theft', 'assault', 'harassment', 'scam', 'medical', 'natural_disaster', 'other')),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location_name VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_point GEOGRAPHY(POINT, 4326),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'investigating')),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Location tracking for users (for emergency purposes)
CREATE TABLE IF NOT EXISTS user_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location_point GEOGRAPHY(POINT, 4326),
  accuracy DECIMAL(8, 2),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_emergency BOOLEAN DEFAULT FALSE
);

-- Emergency contacts and check-ins
CREATE TABLE IF NOT EXISTS emergency_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_checkin_time TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'missed', 'emergency')),
  location_name VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_point GEOGRAPHY(POINT, 4326),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Safe zones and recommended areas
CREATE TABLE IF NOT EXISTS safe_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  zone_type VARCHAR(50) NOT NULL CHECK (zone_type IN ('safe', 'caution', 'avoid')),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  radius_meters INTEGER DEFAULT 500,
  location_point GEOGRAPHY(POINT, 4326),
  created_by UUID REFERENCES users(id),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Travel plans for users
CREATE TABLE IF NOT EXISTS travel_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  destination VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  accommodation_name VARCHAR(255),
  accommodation_address TEXT,
  emergency_contact_notified BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Push notification subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_safety_incidents_location ON safety_incidents USING GIST (location_point);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_type ON safety_incidents (incident_type);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_severity ON safety_incidents (severity);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_created_at ON safety_incidents (created_at);

CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations (user_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_timestamp ON user_locations (timestamp);
CREATE INDEX IF NOT EXISTS idx_user_locations_location ON user_locations USING GIST (location_point);

CREATE INDEX IF NOT EXISTS idx_safe_zones_location ON safe_zones USING GIST (location_point);
CREATE INDEX IF NOT EXISTS idx_safe_zones_type ON safe_zones (zone_type);

CREATE INDEX IF NOT EXISTS idx_emergency_checkins_user_id ON emergency_checkins (user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_checkins_status ON emergency_checkins (status);
CREATE INDEX IF NOT EXISTS idx_emergency_checkins_scheduled_time ON emergency_checkins (scheduled_time);

-- Create functions to automatically update location_point from lat/lng
CREATE OR REPLACE FUNCTION update_location_point()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location_point = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update location_point
CREATE TRIGGER trigger_safety_incidents_location_point
  BEFORE INSERT OR UPDATE ON safety_incidents
  FOR EACH ROW EXECUTE FUNCTION update_location_point();

CREATE TRIGGER trigger_user_locations_location_point
  BEFORE INSERT OR UPDATE ON user_locations
  FOR EACH ROW EXECUTE FUNCTION update_location_point();

CREATE TRIGGER trigger_emergency_checkins_location_point
  BEFORE INSERT OR UPDATE ON emergency_checkins
  FOR EACH ROW EXECUTE FUNCTION update_location_point();

CREATE TRIGGER trigger_safe_zones_location_point
  BEFORE INSERT OR UPDATE ON safe_zones
  FOR EACH ROW EXECUTE FUNCTION update_location_point();
