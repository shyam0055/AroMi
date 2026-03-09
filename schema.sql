-- ═══════════════════════════════════════════════════════
--   AroMi — Supabase SQL Schema
--   Run this entire file in:
--   Supabase Dashboard → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════


-- ── 1. PROFILES TABLE ────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  full_name   TEXT,
  age         INTEGER,
  gender      TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  height_cm   NUMERIC,
  weight_kg   NUMERIC,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: users can only read/write their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


-- ── 2. PREDICTIONS TABLE ─────────────────────────────────
CREATE TABLE IF NOT EXISTS predictions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  age                  INTEGER,
  gender               TEXT,
  symptoms             TEXT,
  body_part            TEXT,
  existing_conditions  TEXT,
  lifestyle_info       TEXT,
  result_summary       TEXT,
  risk_level           TEXT CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: users can only see/add their own predictions
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own predictions"
  ON predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own predictions"
  ON predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ── 3. TOPIC VIEWS TABLE ─────────────────────────────────
CREATE TABLE IF NOT EXISTS topic_views (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_key    TEXT NOT NULL,
  topic_name   TEXT,
  view_count   INTEGER DEFAULT 1,
  last_viewed  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: users can only see/add their own views
ALTER TABLE topic_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own topic views"
  ON topic_views FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own topic views"
  ON topic_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own topic views"
  ON topic_views FOR UPDATE
  USING (auth.uid() = user_id);


-- ── DONE ─────────────────────────────────────────────────
-- Tables created: profiles, predictions, topic_views
-- RLS enabled on all tables