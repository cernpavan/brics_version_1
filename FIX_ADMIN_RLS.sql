-- ========================================
-- Quick Fix: Ensure RLS Policies Allow Login
-- Run this if login queries are being blocked
-- ========================================

-- Drop and recreate policies to allow SELECT for login
DROP POLICY IF EXISTS "Allow admin login queries" ON public.admin_users;
DROP POLICY IF EXISTS "Allow sub-admin login queries" ON public.sub_admin_users;

-- Create policies that allow SELECT (for login verification)
CREATE POLICY "Allow admin login queries" 
  ON public.admin_users 
  FOR SELECT
  USING (true);

CREATE POLICY "Allow sub-admin login queries" 
  ON public.sub_admin_users 
  FOR SELECT
  USING (true);

-- ========================================
-- Verify policies are created
-- ========================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('admin_users', 'sub_admin_users');

-- Should show 2 policies with cmd = 'SELECT'





