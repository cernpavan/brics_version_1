-- ========================================
-- Product & Request Status Management
-- Date: December 21, 2025
-- ========================================
-- 
-- This migration adds:
-- 1. Status field to products table (active, done, deleted)
-- 2. Status field to product_requests table (active, done, deleted)
-- 3. Country field to products (if not exists)
-- 4. Updates existing records to have 'active' status
--
-- ========================================

-- ========================================
-- STEP 1: Add status to products table
-- ========================================

-- Add status column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.products 
    ADD COLUMN status TEXT DEFAULT 'active' 
    CHECK (status IN ('active', 'done', 'deleted'));
    
    -- Update existing products to active
    UPDATE public.products SET status = 'active' WHERE status IS NULL;
  END IF;
END $$;

-- Add country_origin if it doesn't exist (for filtering)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'country_origin'
  ) THEN
    ALTER TABLE public.products 
    ADD COLUMN country_origin TEXT;
  END IF;
END $$;

-- ========================================
-- STEP 2: Add status to product_requests table
-- ========================================

-- Update status column to include 'done' if it doesn't
DO $$ 
BEGIN
  -- Check if status column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'product_requests' AND column_name = 'status'
  ) THEN
    -- Drop existing constraint if it exists
    ALTER TABLE public.product_requests 
    DROP CONSTRAINT IF EXISTS product_requests_status_check;
    
    -- Add new constraint with 'done'
    ALTER TABLE public.product_requests 
    ADD CONSTRAINT product_requests_status_check 
    CHECK (status IN ('open', 'fulfilled', 'closed', 'active', 'done', 'deleted'));
    
    -- Map existing statuses to new ones
    UPDATE public.product_requests 
    SET status = CASE 
      WHEN status = 'open' THEN 'active'
      WHEN status = 'fulfilled' THEN 'done'
      WHEN status = 'closed' THEN 'deleted'
      ELSE 'active'
    END;
  ELSE
    -- Add status column if it doesn't exist
    ALTER TABLE public.product_requests 
    ADD COLUMN status TEXT DEFAULT 'active' 
    CHECK (status IN ('active', 'done', 'deleted'));
    
    -- Update existing requests to active
    UPDATE public.product_requests SET status = 'active' WHERE status IS NULL;
  END IF;
END $$;

-- ========================================
-- STEP 3: Create indexes for performance
-- ========================================

CREATE INDEX IF NOT EXISTS idx_products_status 
  ON public.products(status) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_products_country_origin 
  ON public.products(country_origin);

CREATE INDEX IF NOT EXISTS idx_product_requests_status 
  ON public.product_requests(status) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_product_requests_target_country 
  ON public.product_requests(target_country);

-- ========================================
-- STEP 4: Update RLS policies for status-based visibility
-- ========================================

-- Drop existing product policies
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Users can view their own products" ON public.products;

-- Policy: Public can view active products
CREATE POLICY "Anyone can view active products" 
  ON public.products 
  FOR SELECT
  USING (status = 'active');

-- Policy: Users can view their own products (any status)
CREATE POLICY "Users can view their own products" 
  ON public.products 
  FOR SELECT
  USING (auth.uid() = exporter_id);

-- Policy: Users can update their own products
DROP POLICY IF EXISTS "Users can update own products" ON public.products;
CREATE POLICY "Users can update own products" 
  ON public.products 
  FOR UPDATE
  USING (auth.uid() = exporter_id);

-- Policy: Users can delete their own products (soft delete)
DROP POLICY IF EXISTS "Users can delete own products" ON public.products;
CREATE POLICY "Users can delete own products" 
  ON public.products 
  FOR UPDATE
  USING (auth.uid() = exporter_id)
  WITH CHECK (auth.uid() = exporter_id);

-- Drop existing product_requests policies
DROP POLICY IF EXISTS "Anyone can view open requests" ON public.product_requests;
DROP POLICY IF EXISTS "Users can view their own requests" ON public.product_requests;

-- Policy: Public can view active requests
CREATE POLICY "Anyone can view active requests" 
  ON public.product_requests 
  FOR SELECT
  USING (status = 'active');

-- Policy: Users can view their own requests (any status)
CREATE POLICY "Users can view their own requests" 
  ON public.product_requests 
  FOR SELECT
  USING (auth.uid() = requester_id);

-- Policy: Users can update their own requests
DROP POLICY IF EXISTS "Users can update own requests" ON public.product_requests;
CREATE POLICY "Users can update own requests" 
  ON public.product_requests 
  FOR UPDATE
  USING (auth.uid() = requester_id);

-- ========================================
-- ✅ Migration Complete!
-- ========================================
-- 
-- What was added:
-- 1. ✅ status field to products (active, done, deleted)
-- 2. ✅ status field to product_requests (active, done, deleted)
-- 3. ✅ country_origin field to products (if not exists)
-- 4. ✅ Indexes for performance
-- 5. ✅ Updated RLS policies for status-based visibility
--
-- Next Steps:
-- 1. Create admin pages with filters
-- 2. Create Sub-Admin pages with country restrictions
-- 3. Update User Dashboard with My Listings
-- 4. Add Delete and Mark as Done Deal actions
--
-- ========================================





