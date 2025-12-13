-- Drop the staff-only SELECT policy
DROP POLICY IF EXISTS "Projects are viewable by staff only" ON public.projects;

-- Create public SELECT policy
CREATE POLICY "Projects are viewable by everyone" 
ON public.projects 
FOR SELECT 
USING (true);