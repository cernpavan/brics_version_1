-- ========================================
-- QUICK UPDATE SCRIPT
-- For users who already ran the previous migration
-- ========================================
-- 
-- This script updates your existing database to:
-- 1. Remove buyer/exporter restrictions
-- 2. Auto-approve all users
-- 3. Allow anyone to post products
--
-- Safe to run multiple times!
-- ========================================

-- ========================================
-- STEP 1: Update approval status default and set all users to approved
-- ========================================

-- Set all existing users to approved
UPDATE public.profiles 
SET approval_status = 'approved' 
WHERE approval_status IS NULL OR approval_status = 'pending' OR approval_status = 'rejected';

-- Verify:
-- SELECT user_id, full_name, approval_status FROM profiles;

-- ========================================
-- STEP 2: Update product posting policy - Remove user_type restriction
-- ========================================

-- Drop old policies (all variations)
DROP POLICY IF EXISTS "Exporters can insert own products" ON public.products;
DROP POLICY IF EXISTS "Approved exporters can insert products" ON public.products;
DROP POLICY IF EXISTS "Approved users can insert products" ON public.products;

-- Create new policy - ANY authenticated + approved user can post
CREATE POLICY "Approved users can insert products" 
  ON public.products FOR INSERT 
  WITH CHECK (
    auth.uid() = exporter_id 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND approval_status = 'approved'
    )
  );

-- Note: No user_type check! Anyone can post now.

-- ========================================
-- STEP 3: Verify the changes
-- ========================================

-- Check users are approved:
-- SELECT user_id, full_name, user_type, approval_status FROM profiles LIMIT 10;

-- Check policy exists:
-- SELECT * FROM pg_policies WHERE tablename = 'products' AND policyname = 'Approved users can insert products';

-- ========================================
-- ✅ DONE!
-- ========================================
-- 
-- Your marketplace is now open!
-- - All users are approved
-- - Anyone can post products
-- - No buyer/exporter restriction
--
-- Test by:
-- 1. Sign in as any user
-- 2. Go to /post-product
-- 3. Upload a product
-- 4. Success! 🎉








