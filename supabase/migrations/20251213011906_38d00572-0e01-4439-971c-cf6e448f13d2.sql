-- Fix 1: Orders table - prevent impersonation by requiring user_id matches authenticated user
DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;
CREATE POLICY "Users can create their own orders" ON public.orders
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fix 2: Profiles table - remove public access to PII
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Fix 3: Team members table - remove salary exposure to all staff
DROP POLICY IF EXISTS "Team members viewable by staff" ON public.team_members;

-- Create a view for non-sensitive team member data that staff can access
CREATE OR REPLACE VIEW public.team_members_public AS
SELECT id, name, email, role, department, designation, status, profile_image, is_core_pillar, serial_number, created_at, hired_at
FROM public.team_members;

-- Allow staff to view the public view (without salary/bonus)
GRANT SELECT ON public.team_members_public TO authenticated;