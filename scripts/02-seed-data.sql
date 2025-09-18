-- Seed data for Tourist Safety System
-- This script adds initial data for testing and demonstration

-- Insert sample safe zones (popular tourist areas)
INSERT INTO safe_zones (name, description, zone_type, latitude, longitude, radius_meters, verified) VALUES
('Times Square Tourist Area', 'Well-patrolled tourist area with high police presence', 'safe', 40.7580, -73.9855, 300, true),
('Central Park South', 'Safe area near Central Park with good lighting and foot traffic', 'safe', 40.7676, -73.9796, 400, true),
('Brooklyn Bridge Walkway', 'Popular tourist walkway with regular security patrols', 'safe', 40.7061, -73.9969, 200, true),
('High Line Park', 'Elevated park with controlled access and security', 'safe', 40.7480, -74.0048, 150, true),
('9/11 Memorial Area', 'Secure memorial area with enhanced security measures', 'safe', 40.7115, -74.0134, 250, true);

-- Insert caution zones
INSERT INTO safe_zones (name, description, zone_type, latitude, longitude, radius_meters, verified) VALUES
('Port Authority Area', 'Busy transit hub - stay alert for pickpockets', 'caution', 40.7589, -73.9896, 200, true),
('Certain Subway Stations Late Night', 'Exercise caution in subway stations after 10 PM', 'caution', 40.7505, -73.9934, 100, true),
('Crowded Street Markets', 'Watch for pickpockets in crowded market areas', 'caution', 40.7186, -73.9956, 150, true);

-- Insert sample incident types for reference
INSERT INTO safety_incidents (incident_type, severity, title, description, location_name, latitude, longitude, status, verified) VALUES
('theft', 'medium', 'Pickpocket Incident', 'Tourist reported wallet stolen in crowded subway car', 'Union Square Station', 40.7359, -73.9911, 'resolved', true),
('scam', 'low', 'Street Vendor Overcharge', 'Tourist charged excessive amount for street food', 'Near Central Park', 40.7829, -73.9654, 'resolved', true),
('harassment', 'medium', 'Aggressive Panhandling', 'Tourist felt threatened by aggressive panhandler', 'Times Square', 40.7580, -73.9855, 'investigating', true);

-- Insert sample emergency contact information
-- Note: In a real system, this would be populated by user registration
