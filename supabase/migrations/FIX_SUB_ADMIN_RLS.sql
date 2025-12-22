-- ========================================
-- Fix RLS Policies for Sub-Admin Creation
-- Run this to allow Admins to create Sub-Admins
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow sub-admin login queries" ON public.sub_admin_users;
DROP POLICY IF EXISTS "Admins can insert sub-admins" ON public.sub_admin_users;
DROP POLICY IF EXISTS "Admins can view sub-admins" ON public.sub_admin_users;

-- Policy 1: Allow SELECT for login queries
CREATE POLICY "Allow sub-admin login queries" 
  ON public.sub_admin_users 
  FOR SELECT
  USING (true);

-- Policy 2: Allow Admins to INSERT Sub-Admins
-- Note: This allows any authenticated user to insert, but the application
-- should verify the user is an admin before allowing creation
CREATE POLICY "Admins can insert sub-admins" 
  ON public.sub_admin_users 
  FOR INSERT
  WITH CHECK (true);

-- Policy 3: Allow Admins to VIEW Sub-Admins
CREATE POLICY "Admins can view sub-admins" 
  ON public.sub_admin_users 
  FOR SELECT
  USING (true);

-- ========================================
-- Note: In production, you may want to add more restrictive policies
-- that check if the user is actually an admin. For now, this allows
-- the application to handle the access control.
-- ========================================





