
-- Fix profiles table security: Remove public access, add user self-view
-- First, drop any existing public-facing SELECT policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Add policy for users to view their own profile (currently missing)
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Fix contact_messages table - remove public SELECT access
DROP POLICY IF EXISTS "Contact messages are viewable by everyone" ON public.contact_messages;

-- Ensure only admins can read contact messages (the INSERT for anyone is fine)
-- The existing "Staff can manage contact messages" policy already covers admin access
