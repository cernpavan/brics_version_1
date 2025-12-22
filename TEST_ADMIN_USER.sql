-- ========================================
-- Test Admin User - Verify Setup
-- Run this to check if admin user exists
-- ========================================

-- Check if admin user exists
SELECT 
  id,
  username,
  email,
  is_active,
  created_at,
  LENGTH(password_hash) as hash_length,
  LEFT(password_hash, 20) as hash_preview
FROM public.admin_users
WHERE username = 'gunupatipavankumar@gmail.com';

-- Expected result:
-- - Should return 1 row
-- - hash_length should be 64 (SHA-256 hex)
-- - is_active should be true

-- ========================================
-- If user doesn't exist, run this:
-- ========================================

INSERT INTO public.admin_users (username, password_hash, email, full_name, is_active)
VALUES (
  'gunupatipavankumar@gmail.com',
  '996be289748c9b578fa21e79ed9366f478b91bb4ffcf1d3791fa5b566515a171',
  'gunupatipavankumar@gmail.com',
  'System Administrator',
  true
)
ON CONFLICT (username) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    is_active = true,
    updated_at = now();

-- ========================================
-- Test password hash generation
-- ========================================

-- Verify the hash is correct (should match)
-- Password: Pavang1234@
-- Expected hash: 996be289748c9b578fa21e79ed9366f478b91bb4ffcf1d3791fa5b566515a171

SELECT 
  CASE 
    WHEN password_hash = '996be289748c9b578fa21e79ed9366f478b91bb4ffcf1d3791fa5b566515a171' 
    THEN 'Hash matches ✅' 
    ELSE 'Hash mismatch ❌' 
  END as hash_check
FROM public.admin_users
WHERE username = 'gunupatipavankumar@gmail.com';





