-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  nationality TEXT,
  passport_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tourist_ids table for digital ID cards
CREATE TABLE IF NOT EXISTS public.tourist_ids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tourist_id_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  nationality TEXT NOT NULL,
  passport_number TEXT NOT NULL,
  phone TEXT NOT NULL,
  emergency_contact TEXT NOT NULL,
  emergency_phone TEXT NOT NULL,
  photo_url TEXT,
  qr_code_data TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alerts table for safety notifications
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('success', 'warning', 'danger', 'info')),
  location TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create efir_reports table for emergency reports
CREATE TABLE IF NOT EXISTS public.efir_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  incident_type TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
  contact_info TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create safety_scores table for tracking user safety metrics
CREATE TABLE IF NOT EXISTS public.safety_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 100,
  location TEXT,
  factors JSONB,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tourist_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.efir_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_scores ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Create RLS policies for tourist_ids
CREATE POLICY "tourist_ids_select_own" ON public.tourist_ids FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tourist_ids_insert_own" ON public.tourist_ids FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tourist_ids_update_own" ON public.tourist_ids FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tourist_ids_delete_own" ON public.tourist_ids FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for alerts (public read, admin write)
CREATE POLICY "alerts_select_all" ON public.alerts FOR SELECT TO authenticated USING (true);

-- Create RLS policies for efir_reports
CREATE POLICY "efir_reports_select_own" ON public.efir_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "efir_reports_insert_own" ON public.efir_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "efir_reports_update_own" ON public.efir_reports FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for safety_scores
CREATE POLICY "safety_scores_select_own" ON public.safety_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "safety_scores_insert_own" ON public.safety_scores FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tourist_ids_user_id ON public.tourist_ids(user_id);
CREATE INDEX IF NOT EXISTS idx_tourist_ids_tourist_id_number ON public.tourist_ids(tourist_id_number);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON public.alerts(type);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON public.alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_efir_reports_user_id ON public.efir_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_efir_reports_status ON public.efir_reports(status);
CREATE INDEX IF NOT EXISTS idx_safety_scores_user_id ON public.safety_scores(user_id);
