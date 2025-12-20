-- ========================================
-- QUICK FIX: Update RLS Policies for Admin Login
-- Run this AFTER the main migration
-- ========================================

-- Allow reads for authentication (temporary for Phase 1)
-- In production, use Edge Function instead

DROP POLICY IF EXISTS "Allow admin login queries" ON public.admin_users;
DROP POLICY IF EXISTS "Allow sub-admin login queries" ON public.sub_admin_users;

-- Allow service role to read admin_users for authentication
CREATE POLICY "Allow admin login queries" 
  ON public.admin_users 
  FOR SELECT
  USING (true);

-- Allow service role to read sub_admin_users for authentication  
CREATE POLICY "Allow sub-admin login queries" 
  ON public.sub_admin_users 
  FOR SELECT
  USING (true);

-- ========================================
-- Note: This allows reads but passwords are still hashed
-- Password verification should happen server-side via Edge Function
-- ========================================


