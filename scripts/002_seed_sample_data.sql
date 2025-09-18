-- Insert sample alerts for demonstration
INSERT INTO public.alerts (title, message, type, location, latitude, longitude, severity) VALUES
('Weather Alert', 'Heavy rainfall expected in the area. Please take necessary precautions.', 'warning', 'Mumbai, Maharashtra', 19.0760, 72.8777, 'medium'),
('Safety Advisory', 'Increased security measures in tourist areas. Stay vigilant.', 'info', 'Delhi, India', 28.6139, 77.2090, 'low'),
('Emergency Notice', 'Road closure due to construction work. Use alternate routes.', 'danger', 'Goa, India', 15.2993, 74.1240, 'high'),
('Health Alert', 'Vaccination drive ongoing at local health centers.', 'success', 'Bangalore, Karnataka', 12.9716, 77.5946, 'low'),
('Tourist Advisory', 'Festival celebrations may cause traffic delays in city center.', 'info', 'Jaipur, Rajasthan', 26.9124, 75.7873, 'medium');

-- Insert sample safety scores for demonstration
INSERT INTO public.safety_scores (user_id, score, location, factors) VALUES
('00000000-0000-0000-0000-000000000000', 85, 'Mumbai Central', '{"crime_rate": "low", "weather": "moderate", "crowd_density": "high"}'),
('00000000-0000-0000-0000-000000000000', 92, 'Goa Beach Area', '{"crime_rate": "very_low", "weather": "good", "crowd_density": "moderate"}'),
('00000000-0000-0000-0000-000000000000', 78, 'Delhi Metro Station', '{"crime_rate": "moderate", "weather": "poor", "crowd_density": "very_high"}');
