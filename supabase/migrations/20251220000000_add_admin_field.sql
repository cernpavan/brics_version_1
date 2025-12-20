-- Add organization_name field and is_admin field to profiles table
-- Note: company_name already exists in the schema, so we'll use that as organization_name

-- Add is_admin field for organization admins
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

-- Update RLS policies to allow admins to manage their organization
-- (This can be extended based on your specific admin requirements)

