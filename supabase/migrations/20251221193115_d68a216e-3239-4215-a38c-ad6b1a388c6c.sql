-- Drop the overly permissive policy that exposes user_id to everyone
DROP POLICY IF EXISTS "Anyone can count event registrations" ON public.event_registrations;

-- Create a view for public event registration counts (without exposing user_ids)
CREATE OR REPLACE VIEW public.event_registration_counts AS
SELECT 
  event_id,
  COUNT(*) as registration_count
FROM public.event_registrations
GROUP BY event_id;

-- Grant SELECT on the counts view to everyone (safe - no user data exposed)
GRANT SELECT ON public.event_registration_counts TO anon, authenticated;