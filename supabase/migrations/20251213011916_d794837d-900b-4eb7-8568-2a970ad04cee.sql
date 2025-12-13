-- Fix the security definer view issue - drop and recreate with proper security
DROP VIEW IF EXISTS public.team_members_public;

-- Create the view with SECURITY INVOKER (default, uses caller's permissions)
CREATE VIEW public.team_members_public 
WITH (security_invoker = true) AS
SELECT id, name, email, role, department, designation, status, profile_image, is_core_pillar, serial_number, created_at, hired_at
FROM public.team_members;