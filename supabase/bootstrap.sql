-- Charly Database Bootstrap SQL
-- Run this entire script in Supabase SQL Editor

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "citext";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Allowed users whitelist (no public read)
CREATE TABLE IF NOT EXISTS public.allowed_users (
  email citext PRIMARY KEY,
  note text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- User profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email citext UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- User activity tracking
CREATE TABLE IF NOT EXISTS public.user_activity (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email citext,
  session_id text NOT NULL UNIQUE,
  login_time timestamptz NOT NULL DEFAULT now(),
  logout_time timestamptz,
  user_agent text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.allowed_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only select/insert/update their own row
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- User activity: users can only select/insert/update their own rows
CREATE POLICY "Users can view own activity"
  ON public.user_activity
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own activity"
  ON public.user_activity
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own activity"
  ON public.user_activity
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allowed users: no policies (unreadable to clients)
-- This table is only accessible via RPC functions

-- ============================================================================
-- FUNCTIONS (Security Definer)
-- ============================================================================

-- Check if email is allowed (case-insensitive)
CREATE OR REPLACE FUNCTION public.is_email_allowed(e text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.allowed_users
    WHERE email = lower(e)
  );
END;
$$;

-- Ensure profile exists for current user
CREATE OR REPLACE FUNCTION public.ensure_profile()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_email text;
BEGIN
  v_user_id := auth.uid();
  SELECT email INTO v_email FROM auth.users WHERE id = v_user_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  INSERT INTO public.profiles (id, email)
  VALUES (v_user_id, v_email)
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- Log user login
CREATE OR REPLACE FUNCTION public.log_login(
  p_session_id text,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_email citext;
BEGIN
  v_user_id := auth.uid();
  SELECT email INTO v_email FROM auth.users WHERE id = v_user_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  INSERT INTO public.user_activity (user_id, email, session_id, user_agent)
  VALUES (v_user_id, v_email, p_session_id, p_user_agent)
  ON CONFLICT (session_id) DO NOTHING;
END;
$$;

-- Log user logout
CREATE OR REPLACE FUNCTION public.log_logout(p_session_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  UPDATE public.user_activity
  SET logout_time = now()
  WHERE session_id = p_session_id
    AND user_id = v_user_id
    AND logout_time IS NULL;
END;
$$;

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_email_allowed(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_login(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_logout(text) TO authenticated;

-- Grant table permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_activity TO authenticated;

-- No grants on allowed_users (only accessible via RPC)

-- ============================================================================
-- INDEXES (for performance)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_session_id ON public.user_activity(session_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ============================================================================
-- SEED DATA (Example - replace with your real emails)
-- ============================================================================

-- Uncomment and replace with your actual email addresses
-- INSERT INTO public.allowed_users (email, note) VALUES
--   ('user1@example.com', 'Primary admin'),
--   ('user2@example.com', 'Team member');

COMMENT ON TABLE public.allowed_users IS 'Whitelist of users allowed to request OTP';
COMMENT ON TABLE public.profiles IS 'User profile information';
COMMENT ON TABLE public.user_activity IS 'Tracks user login/logout sessions';
COMMENT ON FUNCTION public.is_email_allowed IS 'Check if email is in allowed_users whitelist';
COMMENT ON FUNCTION public.ensure_profile IS 'Create profile row if it does not exist';
COMMENT ON FUNCTION public.log_login IS 'Record user login activity';
COMMENT ON FUNCTION public.log_logout IS 'Record user logout timestamp';

