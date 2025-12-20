-- ========================================
-- Fix: Profile Update RLS Policy
-- Date: December 21, 2025
-- ========================================
-- 
-- This migration fixes the RLS policy for profile updates
-- to ensure users can update their own profiles after Google signup.
--
-- ========================================

-- ========================================
-- STEP 1: Fix Users can update own profile policy
-- ========================================

-- Drop existing policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create policy with both USING and WITH CHECK
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ========================================
-- STEP 2: Ensure profile exists (upsert function)
-- ========================================

-- Create or update profile function
CREATE OR REPLACE FUNCTION public.upsert_user_profile(
  p_user_id UUID,
  p_full_name TEXT,
  p_company_name TEXT,
  p_phone TEXT,
  p_country TEXT,
  p_user_type TEXT DEFAULT 'buyer',
  p_is_admin BOOLEAN DEFAULT false,
  p_approval_status TEXT DEFAULT 'pending'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    full_name,
    company_name,
    phone,
    country,
    user_type,
    is_admin,
    approval_status,
    email
  )
  VALUES (
    p_user_id,
    p_full_name,
    p_company_name,
    p_phone,
    p_country,
    p_user_type,
    p_is_admin,
    p_approval_status,
    (SELECT email FROM auth.users WHERE id = p_user_id LIMIT 1)
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    phone = EXCLUDED.phone,
    country = EXCLUDED.country,
    user_type = EXCLUDED.user_type,
    is_admin = EXCLUDED.is_admin,
    approval_status = EXCLUDED.approval_status,
    updated_at = now();
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.upsert_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT) TO authenticated;

-- ========================================
-- ✅ Migration Complete!
-- ========================================
-- 
-- What was fixed:
-- 1. ✅ Added WITH CHECK clause to UPDATE policy
-- 2. ✅ Created upsert function for profile creation/update
--
-- Next Steps:
-- 1. Update AuthModal.tsx to use upsert function or handle insert/update
--
-- ========================================

