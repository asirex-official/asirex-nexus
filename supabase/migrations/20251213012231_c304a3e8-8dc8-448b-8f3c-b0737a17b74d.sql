-- Fix products INSERT policy to properly allow admin inserts
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products
FOR INSERT TO authenticated
WITH CHECK (is_admin_type(auth.uid()));

-- Fix projects INSERT policy
DROP POLICY IF EXISTS "Staff can manage projects" ON public.projects;
CREATE POLICY "Staff can manage projects" ON public.projects
FOR ALL TO authenticated
USING (is_admin_type(auth.uid()))
WITH CHECK (is_admin_type(auth.uid()));

-- Fix team_members INSERT policy
DROP POLICY IF EXISTS "Admins can manage team members" ON public.team_members;
CREATE POLICY "Admins can manage team members" ON public.team_members
FOR ALL TO authenticated
USING (is_admin_type(auth.uid()))
WITH CHECK (is_admin_type(auth.uid()));

-- Fix events INSERT policy  
DROP POLICY IF EXISTS "Staff can manage events" ON public.events;
CREATE POLICY "Staff can manage events" ON public.events
FOR ALL TO authenticated
USING (is_admin_type(auth.uid()))
WITH CHECK (is_admin_type(auth.uid()));