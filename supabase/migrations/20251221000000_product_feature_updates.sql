-- ========================================
-- Product Feature Updates Migration
-- Version: 2.0.0
-- Date: December 21, 2025
-- ========================================
-- 
-- WHAT THIS MIGRATION DOES:
-- 1. ✅ Adds user approval system (pending/approved/rejected)
-- 2. ✅ Creates categories table for dynamic category management
-- 3. ✅ Creates product_images table for multiple image support
-- 4. ✅ Updates RLS policies with approval checks
-- 5. ✅ Creates storage bucket policies for image uploads
-- 6. ✅ Adds helper functions for approval checks
--
-- PREREQUISITES:
-- - Supabase project must be set up
-- - Auth and profiles tables must exist
-- - Products table must exist
--
-- MANUAL STEP REQUIRED AFTER RUNNING THIS SQL:
-- 📦 Create Storage Bucket "product-images" (see Step 6 below)
--    Go to Dashboard → Storage → Create Bucket
--    Name: product-images
--    Public: YES
--
-- ========================================
-- ESTIMATED RUN TIME: ~10 seconds
-- ========================================

-- ========================================
-- STEP 1: Add approval_status to profiles table
-- ========================================
-- Adds approval status field with 3 states:
-- - 'pending' = waiting for admin approval (default)
-- - 'approved' = can post products
-- - 'rejected' = cannot post products
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'approved' 
CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- IMPORTANT: Set all users to 'approved' by default
-- In this marketplace, everyone can buy and sell freely
-- Change default to 'pending' if you want manual approval
UPDATE public.profiles 
SET approval_status = 'approved' 
WHERE approval_status IS NULL OR approval_status = 'pending';

-- Verification query (optional - check in separate query):
-- SELECT user_id, full_name, user_type, approval_status FROM profiles;

-- ========================================
-- STEP 2: Create categories table
-- ========================================
-- Dynamic category management:
-- - Users can add new categories via UI
-- - Categories can be approved/rejected by admins
-- - Default categories are auto-inserted
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_approved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Anyone can view approved categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can view all categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can create categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;

-- RLS Policy 1: Anyone can view approved categories
CREATE POLICY "Anyone can view approved categories" 
  ON public.categories FOR SELECT 
  USING (is_approved = true);

-- RLS Policy 2: Authenticated users can view all categories (including pending)
CREATE POLICY "Authenticated users can view all categories" 
  ON public.categories FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- RLS Policy 3: Authenticated users can create new categories
CREATE POLICY "Authenticated users can create categories" 
  ON public.categories FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policy 4: Admins can update categories (approve/reject)
CREATE POLICY "Admins can update categories" 
  ON public.categories FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND is_admin = true
    )
  );

-- Create automatic timestamp trigger for categories
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- STEP 2B: Insert default BRICS categories
-- ========================================
-- Pre-populate with common trade categories
-- These are auto-approved and immediately available

INSERT INTO public.categories (name, is_approved) VALUES
  ('Agriculture', true),
  ('Textiles', true),
  ('Machinery', true),
  ('Electronics', true),
  ('Minerals', true),
  ('Chemicals', true),
  ('Food & Beverages', true),
  ('Construction', true),
  ('Automotive', true),
  ('Energy', true),
  ('Pharmaceuticals', true),
  ('Metal & Steel', true)
ON CONFLICT (name) DO NOTHING;

-- Verification query (optional - check in separate query):
-- SELECT * FROM categories ORDER BY name;

-- ========================================
-- STEP 3: Create product_images table
-- ========================================
-- Multiple images per product:
-- - Each product can have up to 5 images
-- - First image is marked as primary
-- - Images stored in Supabase Storage
-- - This table stores references (URLs)
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for product_images
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Anyone can view product images" ON public.product_images;
DROP POLICY IF EXISTS "Product owners can insert images" ON public.product_images;
DROP POLICY IF EXISTS "Product owners can update images" ON public.product_images;
DROP POLICY IF EXISTS "Product owners can delete images" ON public.product_images;

-- RLS Policy 1: Anyone can view product images (public access)
CREATE POLICY "Anyone can view product images" 
  ON public.product_images FOR SELECT 
  USING (true);

-- RLS Policy 2: Product owners can insert images
CREATE POLICY "Product owners can insert images" 
  ON public.product_images FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products 
      WHERE id = product_id 
      AND exporter_id = auth.uid()
    )
  );

-- RLS Policy 3: Product owners can update their images
CREATE POLICY "Product owners can update images" 
  ON public.product_images FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.products 
      WHERE id = product_id 
      AND exporter_id = auth.uid()
    )
  );

-- RLS Policy 4: Product owners can delete their images
CREATE POLICY "Product owners can delete images" 
  ON public.product_images FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.products 
      WHERE id = product_id 
      AND exporter_id = auth.uid()
    )
  );

-- Create performance indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_product_images_product_id 
  ON public.product_images(product_id);

CREATE INDEX IF NOT EXISTS idx_product_images_primary 
  ON public.product_images(product_id, is_primary) 
  WHERE is_primary = true;

-- Verification query (optional - check in separate query):
-- SELECT p.name, COUNT(pi.id) as image_count 
-- FROM products p 
-- LEFT JOIN product_images pi ON p.id = pi.product_id 
-- GROUP BY p.id, p.name;

-- ========================================
-- STEP 4: Update products table policies
-- ========================================
-- Update INSERT policy to check user approval status
-- Only approved exporters can post products
-- Drop the old insert policy (if exists)
DROP POLICY IF EXISTS "Exporters can insert own products" ON public.products;
DROP POLICY IF EXISTS "Approved exporters can insert products" ON public.products;
DROP POLICY IF EXISTS "Approved users can insert products" ON public.products;

-- Create new policy - ANY AUTHENTICATED USER can post products
-- Users must be:
-- 1. Authenticated (auth.uid() = exporter_id)
-- 2. Approved (approval_status = 'approved')
-- No user_type restriction - anyone can sell!
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

-- Note: Other product policies (SELECT, UPDATE, DELETE) remain unchanged
-- The 'exporter_id' column name is kept for backward compatibility,
-- but now refers to any authenticated user who posts a product

-- ========================================
-- STEP 5: Add metadata to products table
-- ========================================
-- Add comment to explain category field usage
-- Add documentation comment to products.category field
-- Category is stored as TEXT for flexibility
-- Should match a category name in the categories table
-- But not enforced with foreign key to allow legacy data
COMMENT ON COLUMN public.products.category IS 
  'Category name - should match a category in categories table. TEXT type for backward compatibility.';

-- Note: products.image_url is deprecated - use product_images table instead
COMMENT ON COLUMN public.products.image_url IS 
  'DEPRECATED: Use product_images table for multiple image support. This field kept for backward compatibility.';

-- ========================================
-- STEP 6: Helper functions
-- ========================================
-- Utility function to check if user is approved
-- Can be used in application code or other policies
-- Create helper function: is_user_approved
-- Usage: SELECT is_user_approved(auth.uid());
-- Returns: true if user is approved, false otherwise
CREATE OR REPLACE FUNCTION public.is_user_approved(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_status TEXT;
BEGIN
  SELECT approval_status INTO user_status
  FROM public.profiles
  WHERE user_id = user_uuid;
  
  RETURN user_status = 'approved';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_user_approved(UUID) TO authenticated;

-- Usage example (run in separate query):
-- SELECT is_user_approved(auth.uid());

-- ========================================
-- STEP 7: MANUAL STORAGE SETUP REQUIRED
-- ========================================
-- 
-- ⚠️ IMPORTANT: After running this migration, you MUST manually:
-- 
-- 1. Create Storage Bucket:
--    Dashboard → Storage → Create Bucket
--    - Name: "product-images"
--    - Public: YES (check the box)
--
-- 2. Apply Storage Policies:
--    Click on the bucket → Policies tab → New Policy
--
--    Copy and run these 3 policies in the Storage SQL editor:
--
-- ========================================
-- STORAGE POLICY 1: Upload Images (Authenticated Users)
-- ========================================
/*
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] IS NOT NULL
);
*/

-- ========================================
-- STORAGE POLICY 2: View Images (Public)
-- ========================================
/*
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');
*/

-- ========================================
-- STORAGE POLICY 3: Delete Images (Owner)
-- ========================================
/*
CREATE POLICY "Users can delete their uploaded images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
*/

-- NOTE: The storage policies above are commented out because they 
-- must be created AFTER the storage bucket exists. 
-- Create the bucket first, then run these policies.

-- ========================================
-- STEP 8: Migration Complete! 
-- ========================================
-- 
-- ✅ Summary of changes:
-- 1. ✅ Added approval_status field to profiles
-- 2. ✅ Created categories table with 12 default categories
-- 3. ✅ Created product_images table for multiple images
-- 4. ✅ Updated products INSERT policy to check approval
-- 5. ✅ Created RLS policies for categories and images
-- 6. ✅ Added helper function is_user_approved()
-- 7. ✅ Created indexes for performance
-- 8. ✅ Added documentation comments
--
-- 📦 NEXT STEPS:
-- 1. Create "product-images" storage bucket (see STEP 7 above)
-- 2. Apply storage policies (see STEP 7 above)
-- 3. Run: npm install (to install browser-image-compression)
-- 4. Test posting a product as an approved exporter
--
-- 🔍 VERIFICATION QUERIES (run separately):
-- 
-- Check approval statuses:
-- SELECT user_id, full_name, user_type, approval_status FROM profiles;
--
-- Check categories:
-- SELECT * FROM categories ORDER BY name;
--
-- Check if a specific user is approved:
-- SELECT is_user_approved('user-uuid-here');
--
-- Check products with image counts:
-- SELECT p.id, p.name, COUNT(pi.id) as image_count
-- FROM products p
-- LEFT JOIN product_images pi ON p.id = pi.product_id
-- GROUP BY p.id, p.name;
--
-- ========================================
-- Migration version: 2.0.0
-- Last updated: December 21, 2025
-- ========================================

