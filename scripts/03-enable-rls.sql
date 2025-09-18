-- Enable Row Level Security (RLS) for all tables
-- This ensures users can only access their own data

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can view all safety incidents (for heatmap) but only create their own
CREATE POLICY "Anyone can view safety incidents" ON safety_incidents
  FOR SELECT USING (true);

CREATE POLICY "Users can create safety incidents" ON safety_incidents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own safety incidents" ON safety_incidents
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only access their own location data
CREATE POLICY "Users can view own locations" ON user_locations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own locations" ON user_locations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only access their own emergency check-ins
CREATE POLICY "Users can view own checkins" ON emergency_checkins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own checkins" ON emergency_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkins" ON emergency_checkins
  FOR UPDATE USING (auth.uid() = user_id);

-- Safe zones are viewable by all (public safety information)
CREATE POLICY "Anyone can view safe zones" ON safe_zones
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create safe zones" ON safe_zones
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can only access their own travel plans
CREATE POLICY "Users can view own travel plans" ON travel_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own travel plans" ON travel_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own travel plans" ON travel_plans
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only manage their own push subscriptions
CREATE POLICY "Users can view own push subscriptions" ON push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own push subscriptions" ON push_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscriptions" ON push_subscriptions
  FOR DELETE USING (auth.uid() = user_id);
