-- Drop the view and recreate with SECURITY INVOKER (the safe default)
DROP VIEW IF EXISTS public.event_registration_counts;

-- Create view with explicit SECURITY INVOKER
CREATE VIEW public.event_registration_counts 
WITH (security_invoker = on) AS
SELECT 
  event_id,
  COUNT(*) as registration_count
FROM public.event_registrations
GROUP BY event_id;

-- Grant SELECT on the counts view to everyone (safe - no user data exposed)
GRANT SELECT ON public.event_registration_counts TO anon, authenticated;