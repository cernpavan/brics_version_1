-- ========================================
-- Admin & Sub-Admin Authentication System
-- Date: December 21, 2025
-- Phase 1: Authentication Only
-- ========================================
-- 
-- This migration creates:
-- 1. admin_users table - For Admin accounts
-- 2. sub_admin_users table - For Sub-Admin accounts (created by Admins)
-- 3. Password hashing support (SHA-256 - browser-compatible)
-- 4. RLS policies for security
--
-- IMPORTANT:
-- - Sub-Admins can ONLY be created by Admins
-- - No public registration
-- - Separate from customer authentication
-- - Passwords hashed with SHA-256 (works in browser)
--
-- ========================================

-- ========================================
-- STEP 1: Create admin_users table
-- ========================================
-- Admins have full access to the system
-- They can create Sub-Admins and manage everything

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email TEXT,
  full_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add comments
COMMENT ON TABLE public.admin_users IS 'Admin users with full system access';
COMMENT ON COLUMN public.admin_users.password_hash IS 'SHA-256 hashed password - never store plain text. Hash is generated using Web Crypto API in browser.';

-- ========================================
-- STEP 2: Create sub_admin_users table
-- ========================================
-- Sub-Admins are created by Admins only
-- They have limited access based on assigned countries

CREATE TABLE IF NOT EXISTS public.sub_admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email TEXT,
  full_name TEXT,
  created_by UUID NOT NULL REFERENCES public.admin_users(id) ON DELETE RESTRICT,
  assigned_countries TEXT[], -- Array of country codes
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add comments
COMMENT ON TABLE public.sub_admin_users IS 'Sub-Admin users created by Admins with limited access';
COMMENT ON COLUMN public.sub_admin_users.password_hash IS 'SHA-256 hashed password - never store plain text. Hash is generated using Web Crypto API in browser.';
COMMENT ON COLUMN public.sub_admin_users.created_by IS 'Admin who created this Sub-Admin';
COMMENT ON COLUMN public.sub_admin_users.assigned_countries IS 'Array of country codes this Sub-Admin can manage';

-- ========================================
-- STEP 3: Enable RLS
-- ========================================

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Service role can manage sub-admin users" ON public.sub_admin_users;
DROP POLICY IF EXISTS "Allow admin login queries" ON public.admin_users;
DROP POLICY IF EXISTS "Allow sub-admin login queries" ON public.sub_admin_users;

-- RLS Policy: Allow reads for authentication (login queries)
-- This allows the application to query admin_users for login verification
CREATE POLICY "Allow admin login queries" 
  ON public.admin_users 
  FOR SELECT
  USING (true);

CREATE POLICY "Allow sub-admin login queries" 
  ON public.sub_admin_users 
  FOR SELECT
  USING (true);

-- ========================================
-- STEP 4: Create indexes for performance
-- ========================================

CREATE INDEX IF NOT EXISTS idx_admin_users_username 
  ON public.admin_users(username);

CREATE INDEX IF NOT EXISTS idx_admin_users_is_active 
  ON public.admin_users(is_active) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_sub_admin_users_username 
  ON public.sub_admin_users(username);

CREATE INDEX IF NOT EXISTS idx_sub_admin_users_created_by 
  ON public.sub_admin_users(created_by);

CREATE INDEX IF NOT EXISTS idx_sub_admin_users_is_active 
  ON public.sub_admin_users(is_active) 
  WHERE is_active = true;

-- ========================================
-- STEP 5: Create timestamp triggers
-- ========================================

-- Drop existing triggers if they exist (for re-running migration)
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
DROP TRIGGER IF EXISTS update_sub_admin_users_updated_at ON public.sub_admin_users;

-- Create triggers
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sub_admin_users_updated_at
  BEFORE UPDATE ON public.sub_admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- STEP 6: Migration Complete
-- ========================================

-- ========================================
-- ✅ Migration Complete!
-- ========================================
-- 
-- What was created:
-- 1. ✅ admin_users table
-- 2. ✅ sub_admin_users table
-- 3. ✅ Indexes for performance
-- 4. ✅ Timestamp triggers
-- 5. ✅ Foreign key constraints
--
-- Next Steps:
-- 1. Create admin user using SHA-256 hash (see scripts/create-admin.js)
-- 2. Test login at /admin
-- 3. Add route protection (already implemented)
-- 4. Create placeholder dashboards (already implemented)
--
-- Security Notes:
-- - Passwords are hashed using SHA-256 (browser-compatible)
-- - Never store plain text passwords
-- - Hash is generated using Web Crypto API in browser
-- - Password verification happens client-side using SHA-256 comparison
--
-- ========================================
-- Version: 1.0.0
-- Phase: 1 (Authentication Only)
-- ========================================

