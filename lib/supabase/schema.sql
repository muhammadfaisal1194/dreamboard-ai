-- DreamBoard AI Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'team')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  dream_count INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_dream_date DATE,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Dreams table
CREATE TABLE IF NOT EXISTS public.dreams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Dream Entry',
  content TEXT NOT NULL,
  audio_url TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  emotions TEXT[] NOT NULL DEFAULT '{}',
  symbols TEXT[] NOT NULL DEFAULT '{}',
  themes TEXT[] NOT NULL DEFAULT '{}',
  stress_level INTEGER NOT NULL DEFAULT 5 CHECK (stress_level BETWEEN 0 AND 10),
  mood_score INTEGER NOT NULL DEFAULT 5 CHECK (mood_score BETWEEN 0 AND 10),
  is_analyzed BOOLEAN NOT NULL DEFAULT false,
  is_favorite BOOLEAN NOT NULL DEFAULT false
);

-- Dream analyses table
CREATE TABLE IF NOT EXISTS public.dream_analyses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  dream_id UUID REFERENCES public.dreams(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  emotions JSONB NOT NULL DEFAULT '[]',
  symbols JSONB NOT NULL DEFAULT '[]',
  themes JSONB NOT NULL DEFAULT '[]',
  stress_signals JSONB NOT NULL DEFAULT '[]',
  summary TEXT NOT NULL,
  insight TEXT NOT NULL,
  archetype TEXT,
  raw_analysis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subconscious profiles table (aggregated over time)
CREATE TABLE IF NOT EXISTS public.subconscious_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  dominant_emotions JSONB NOT NULL DEFAULT '[]',
  recurring_symbols JSONB NOT NULL DEFAULT '[]',
  recurring_themes JSONB NOT NULL DEFAULT '[]',
  stress_patterns JSONB NOT NULL DEFAULT '[]',
  insight_cards JSONB NOT NULL DEFAULT '[]',
  personality_archetype TEXT,
  dream_coherence_score FLOAT NOT NULL DEFAULT 0,
  emotional_balance FLOAT NOT NULL DEFAULT 0,
  creativity_index FLOAT NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subconscious_profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Dreams policies
CREATE POLICY "Users can view own dreams" ON public.dreams
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dreams" ON public.dreams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dreams" ON public.dreams
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dreams" ON public.dreams
  FOR DELETE USING (auth.uid() = user_id);

-- Dream analyses policies
CREATE POLICY "Users can view own analyses" ON public.dream_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON public.dream_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subconscious profiles policies
CREATE POLICY "Users can view own subconscious profile" ON public.subconscious_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own subconscious profile" ON public.subconscious_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: update profile updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER update_dreams_updated_at
  BEFORE UPDATE ON public.dreams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dreams_user_id ON public.dreams(user_id);
CREATE INDEX IF NOT EXISTS idx_dreams_recorded_at ON public.dreams(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_dream_analyses_dream_id ON public.dream_analyses(dream_id);
CREATE INDEX IF NOT EXISTS idx_dream_analyses_user_id ON public.dream_analyses(user_id);
