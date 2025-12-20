-- ========================================
-- User Approval Flow - Database Updates
-- Date: December 21, 2025
-- ========================================
-- 
-- This migration:
-- 1. Sets default approval_status to 'pending' for new users
-- 2. Updates existing users to 'approved' (if not already set)
-- 3. Adds 'rejected' status option
-- 4. Updates RLS policies to prevent unapproved users from posting
--
-- ========================================

-- ========================================
-- STEP 1: Update profiles table approval_status
-- ========================================

-- Drop existing constraint if it exists
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_approval_status_check;

-- Add new constraint with 'pending' and 'rejected' options
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_approval_status_check 
CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Set default to 'pending' for new users
ALTER TABLE public.profiles 
ALTER COLUMN approval_status SET DEFAULT 'pending';

-- Update existing users without approval_status to 'approved' (grandfather clause)
UPDATE public.profiles 
SET approval_status = 'approved' 
WHERE approval_status IS NULL;

-- ========================================
-- STEP 2: Update RLS policies for products
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Approved users can create products" ON public.products;
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;

-- Policy: Only approved users can create products
CREATE POLICY "Approved users can create products" 
  ON public.products FOR INSERT 
  WITH CHECK (
    auth.uid() = exporter_id 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND approval_status = 'approved'
    )
  );

-- Policy: Public can view active products
CREATE POLICY "Anyone can view active products" 
  ON public.products FOR SELECT
  USING (status = 'active' OR status IS NULL);

-- ========================================
-- STEP 3: Update RLS policies for product_requests
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Approved users can create requests" ON public.product_requests;
DROP POLICY IF EXISTS "Anyone can view active requests" ON public.product_requests;

-- Policy: Only approved users can create requests
CREATE POLICY "Approved users can create requests" 
  ON public.product_requests FOR INSERT 
  WITH CHECK (
    auth.uid() = requester_id 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND approval_status = 'approved'
    )
  );

-- Policy: Public can view active requests
CREATE POLICY "Anyone can view active requests" 
  ON public.product_requests FOR SELECT
  USING (status = 'active' OR status IS NULL OR status = 'open');

-- ========================================
-- STEP 4: Create indexes for approval queries
-- ========================================

CREATE INDEX IF NOT EXISTS idx_profiles_approval_status 
  ON public.profiles(approval_status) 
  WHERE approval_status = 'pending';

CREATE INDEX IF NOT EXISTS idx_profiles_country 
  ON public.profiles(country);

-- ========================================
-- STEP 5: Update profile creation trigger
-- ========================================

-- Update the trigger function to set approval_status = 'pending'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, approval_status)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name', 'pending');
  RETURN NEW;
END;
$$;

-- ========================================
-- ✅ Migration Complete!
-- ========================================
-- 
-- What was updated:
-- 1. ✅ approval_status default set to 'pending'
-- 2. ✅ Added 'rejected' status option
-- 3. ✅ Updated RLS policies to prevent unapproved users from posting
-- 4. ✅ Added indexes for performance
--
-- Next Steps:
-- 1. Create Admin User Approvals page
-- 2. Create Sub-Admin User Approvals page
-- 3. Update Users list pages
-- 4. Add approval check in PostProduct page
--
-- ========================================

