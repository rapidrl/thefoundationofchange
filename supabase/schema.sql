-- ============================================
-- The Foundation of Change — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- Extends Supabase auth.users with app-specific fields
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  probation_officer TEXT,
  court_id TEXT,
  role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('participant', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies: users can read/update their own profile, admins can read all
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- ENROLLMENTS TABLE
-- Tracks program purchases/enrollments
-- ============================================
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hours_required INTEGER NOT NULL,
  hours_completed NUMERIC(6,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'suspended')),
  amount_paid NUMERIC(8,2),
  stripe_payment_id TEXT,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own enrollments"
  ON public.enrollments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all enrollments"
  ON public.enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- HOUR LOGS TABLE
-- Daily time tracking entries
-- ============================================
CREATE TABLE IF NOT EXISTS public.hour_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  hours NUMERIC(4,2) NOT NULL DEFAULT 0 CHECK (hours >= 0 AND hours <= 8),
  minutes INTEGER NOT NULL DEFAULT 0 CHECK (minutes >= 0 AND minutes < 60),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Enforce max 8 hours per day per enrollment
  UNIQUE(enrollment_id, log_date)
);

ALTER TABLE public.hour_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own hour logs"
  ON public.hour_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hour logs"
  ON public.hour_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hour logs"
  ON public.hour_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- CERTIFICATES TABLE
-- Issued upon completion
-- ============================================
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  verification_code TEXT NOT NULL UNIQUE,
  certificate_url TEXT,
  hour_log_url TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certificates"
  ON public.certificates FOR SELECT
  USING (auth.uid() = user_id);

-- Public verification lookup (no auth required)
CREATE POLICY "Anyone can verify certificates"
  ON public.certificates FOR SELECT
  USING (true);

-- ============================================
-- FUNCTION: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: run on every new signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNCTION: Update timestamp on row change
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER enrollments_updated_at
  BEFORE UPDATE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
