-- =============================================================
-- SCHEMA COMPLETO PARA SUPABASE
-- Ejecutar en Supabase SQL Editor
-- =============================================================

-- 1. BUCKET DE STORAGE
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload their own CVs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cvs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read their own CVs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'cvs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. USER PROFILES
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own profile"
ON user_profiles FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Auto-crear perfil al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. CV EXTRACTIONS (datos estructurados ATS)
CREATE TABLE IF NOT EXISTS cv_extractions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cv_filename TEXT NOT NULL,
  storage_path TEXT DEFAULT '',
  personal_info JSONB DEFAULT '{}',
  professional_summary TEXT DEFAULT '',
  work_experience JSONB DEFAULT '[]',
  education JSONB DEFAULT '[]',
  skills TEXT[] DEFAULT '{}',
  certifications JSONB DEFAULT '[]',
  languages JSONB DEFAULT '[]',
  ats_score INTEGER DEFAULT 0,
  structure_issues JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cv_extractions_user_id ON cv_extractions(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_extractions_created_at ON cv_extractions(created_at DESC);

ALTER TABLE cv_extractions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own extractions"
ON cv_extractions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own extractions"
ON cv_extractions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all extractions"
ON cv_extractions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. ANALYSES (análisis CV vs vacante)
CREATE TABLE IF NOT EXISTS analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_description TEXT NOT NULL,
  job_title VARCHAR(255) DEFAULT '',
  company_name VARCHAR(255) DEFAULT '',
  cv_filename TEXT NOT NULL,
  cv_text TEXT DEFAULT '',
  match_percentage INTEGER NOT NULL CHECK (match_percentage >= 0 AND match_percentage <= 100),
  missing_skills TEXT[] DEFAULT '{}',
  strengths TEXT[] DEFAULT '{}',
  recommendations TEXT DEFAULT '',
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own analyses"
ON analyses FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own analyses"
ON analyses FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all analyses"
ON analyses FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Migración: agregar columnas nuevas si la tabla ya existe
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS job_title VARCHAR(255) DEFAULT '';
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS company_name VARCHAR(255) DEFAULT '';
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS cv_text TEXT DEFAULT '';
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed';

-- 5. PLANTILLAS ATS
CREATE TABLE IF NOT EXISTS templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  preview_url TEXT DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('professional', 'modern', 'creative', 'executive')),
  ats_optimized BOOLEAN DEFAULT false,
  popular BOOLEAN DEFAULT false,
  color_scheme TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Templates are public read"
ON templates FOR SELECT
TO anon, authenticated
USING (true);

-- 6. PLANES DE SUSCRIPCIÓN
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  interval TEXT NOT NULL CHECK (interval IN ('month', 'year')),
  features TEXT[] DEFAULT '{}',
  highlighted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subscription plans are public read"
ON subscription_plans FOR SELECT
TO anon, authenticated
USING (true);

-- 7. SUSCRIPCIONES DE USUARIOS
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'expired', 'trialing')),
  current_period_start TIMESTAMPTZ DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own subscriptions"
ON user_subscriptions FOR SELECT
TO authenticated
USING (user_id = auth.uid());
