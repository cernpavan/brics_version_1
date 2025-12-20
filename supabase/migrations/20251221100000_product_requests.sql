-- ========================================
-- Product Requests (Buying Requirements) Feature
-- Date: December 21, 2025
-- ========================================
-- 
-- This migration adds support for users to post buying requirements
-- Users can now both:
-- 1. Sell products (existing feature)
-- 2. Request products (new feature - post buying requirements)
--
-- ========================================

-- ========================================
-- STEP 1: Create product_requests table
-- ========================================
-- Allows users to post their buying requirements
-- Other users can browse and respond to these requests

CREATE TABLE IF NOT EXISTS public.product_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  quantity INTEGER,
  unit TEXT DEFAULT 'units',
  budget_min DECIMAL(12,2),
  budget_max DECIMAL(12,2),
  currency TEXT DEFAULT 'USD',
  target_country TEXT,
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'fulfilled', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Add helpful comments
COMMENT ON TABLE public.product_requests IS 'Buying requirements posted by users looking to purchase products';
COMMENT ON COLUMN public.product_requests.requester_id IS 'User who posted the buying requirement';
COMMENT ON COLUMN public.product_requests.urgency IS 'How urgent is this requirement: low, normal, high, urgent';
COMMENT ON COLUMN public.product_requests.status IS 'Request status: open (active), fulfilled (completed), closed (cancelled)';

-- ========================================
-- STEP 2: Enable RLS for product_requests
-- ========================================

ALTER TABLE public.product_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view open requests" ON public.product_requests;
DROP POLICY IF EXISTS "Approved users can create requests" ON public.product_requests;
DROP POLICY IF EXISTS "Users can update own requests" ON public.product_requests;
DROP POLICY IF EXISTS "Users can delete own requests" ON public.product_requests;

-- RLS Policy 1: Anyone can view open requests (public browsing)
CREATE POLICY "Anyone can view open requests" 
  ON public.product_requests FOR SELECT 
  USING (status = 'open');

-- RLS Policy 2: Approved users can create requests
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

-- RLS Policy 3: Users can update their own requests
CREATE POLICY "Users can update own requests" 
  ON public.product_requests FOR UPDATE 
  USING (auth.uid() = requester_id);

-- RLS Policy 4: Users can delete their own requests
CREATE POLICY "Users can delete own requests" 
  ON public.product_requests FOR DELETE 
  USING (auth.uid() = requester_id);

-- ========================================
-- STEP 3: Create automatic timestamp trigger
-- ========================================

-- Drop existing trigger if it exists (for re-running migration)
DROP TRIGGER IF EXISTS update_product_requests_updated_at ON public.product_requests;

-- Create the trigger
CREATE TRIGGER update_product_requests_updated_at
  BEFORE UPDATE ON public.product_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- STEP 4: Create indexes for performance
-- ========================================

CREATE INDEX IF NOT EXISTS idx_product_requests_requester_id 
  ON public.product_requests(requester_id);

CREATE INDEX IF NOT EXISTS idx_product_requests_status 
  ON public.product_requests(status) 
  WHERE status = 'open';

CREATE INDEX IF NOT EXISTS idx_product_requests_category 
  ON public.product_requests(category);

CREATE INDEX IF NOT EXISTS idx_product_requests_created_at 
  ON public.product_requests(created_at DESC);

-- ========================================
-- STEP 5: Create request_responses table (optional - for MVP Phase 2)
-- ========================================
-- This table stores responses to requests from sellers
-- Uncomment if you want sellers to respond directly in the platform

/*
CREATE TABLE IF NOT EXISTS public.request_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.product_requests(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  offered_price DECIMAL(12,2),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.request_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Request owner can view responses" 
  ON public.request_responses FOR SELECT 
  USING (
    request_id IN (
      SELECT id FROM public.product_requests WHERE requester_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create responses" 
  ON public.request_responses FOR INSERT 
  WITH CHECK (auth.uid() = responder_id);
*/

-- ========================================
-- ✅ Migration Complete!
-- ========================================
-- 
-- What was added:
-- 1. ✅ product_requests table for buying requirements
-- 2. ✅ RLS policies for requests (view, create, update, delete)
-- 3. ✅ Automatic timestamp updates
-- 4. ✅ Performance indexes
-- 5. ✅ Comments for documentation
--
-- Next Steps:
-- 1. Update Supabase types in frontend
-- 2. Create PostRequest page (for posting buying requirements)
-- 3. Create Requests listing page (browse all requests)
-- 4. Add choice screen in PostProduct flow
-- 5. Update navigation to include "Requests" link
--
-- Test Queries:
-- 
-- View all open requests:
-- SELECT * FROM product_requests WHERE status = 'open' ORDER BY created_at DESC;
--
-- Count requests by status:
-- SELECT status, COUNT(*) FROM product_requests GROUP BY status;
--
-- Find urgent requests:
-- SELECT * FROM product_requests WHERE urgency = 'urgent' AND status = 'open';
--
-- ========================================
-- Version: 1.0.0
-- Feature: Two-Way Marketplace (Sell & Request)
-- ========================================



