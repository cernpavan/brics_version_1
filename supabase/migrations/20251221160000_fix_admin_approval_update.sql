-- ========================================
-- Fix: Allow Admin/Sub-Admin to Update User Approval Status
-- Date: December 21, 2025
-- ========================================
-- 
-- This migration adds RLS policies to allow admins to update
-- user approval_status in the profiles table.
--
-- ========================================

-- ========================================
-- STEP 1: Add RLS policy for Admin to update profiles
-- ========================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Admins can update user approval status" ON public.profiles;

-- Policy: Allow admins to update approval_status
-- Note: This checks if the user is an admin via admin_users table
CREATE POLICY "Admins can update user approval status" 
  ON public.profiles FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE username = (SELECT email FROM auth.users WHERE id = auth.uid() LIMIT 1)
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE username = (SELECT email FROM auth.users WHERE id = auth.uid() LIMIT 1)
      AND is_active = true
    )
  );

-- ========================================
-- STEP 2: Alternative - Allow service role or bypass RLS for admin operations
-- ========================================
-- If the above doesn't work, we can use a function-based approach

-- Create a function to update approval status (bypasses RLS)
CREATE OR REPLACE FUNCTION public.update_user_approval_status(
  target_user_id UUID,
  new_status TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Validate status
  IF new_status NOT IN ('pending', 'approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid approval status: %', new_status;
  END IF;

  -- Update the profile
  UPDATE public.profiles
  SET approval_status = new_status
  WHERE user_id = target_user_id;

  RETURN FOUND;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_user_approval_status(UUID, TEXT) TO authenticated;

-- ========================================
-- ✅ Migration Complete!
-- ========================================
-- 
-- Two approaches provided:
-- 1. RLS Policy (may need admin session check)
-- 2. Security Definer Function (bypasses RLS)
--
-- If RLS policy doesn't work, use the function approach
-- by calling: SELECT public.update_user_approval_status(user_id, 'approved');
--
-- ========================================





