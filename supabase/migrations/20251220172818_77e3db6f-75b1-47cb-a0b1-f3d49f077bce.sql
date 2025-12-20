-- Drop and recreate team_members_public view without sensitive PII
DROP VIEW IF EXISTS public.team_members_public;

CREATE VIEW public.team_members_public AS
SELECT 
  id,
  name,
  role,
  department,
  designation,
  status,
  profile_image,
  serial_number,
  hired_at,
  created_at,
  is_core_pillar
FROM public.team_members
WHERE status = 'active';

-- Grant select to public (anon and authenticated)
GRANT SELECT ON public.team_members_public TO anon, authenticated;