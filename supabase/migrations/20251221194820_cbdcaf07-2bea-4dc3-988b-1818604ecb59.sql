-- Fix 1: Restrict team_members (with salary/bonus data) to super_admin only
DROP POLICY IF EXISTS "Admins can manage team members" ON public.team_members;

CREATE POLICY "Super admins can manage team members"
ON public.team_members FOR ALL
USING (has_role(auth.uid(), 'super_admin'))
WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Fix 2: Restrict job_applications (applicant PII) to super_admin only
DROP POLICY IF EXISTS "Admins can manage job applications" ON public.job_applications;
DROP POLICY IF EXISTS "Admins can view job applications" ON public.job_applications;

CREATE POLICY "Super admins can manage job applications"
ON public.job_applications FOR ALL
USING (has_role(auth.uid(), 'super_admin'))
WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Fix 3: Restrict contact_messages to super_admin only
DROP POLICY IF EXISTS "Staff can manage contact messages" ON public.contact_messages;

CREATE POLICY "Super admins can manage contact messages"
ON public.contact_messages FOR ALL
USING (has_role(auth.uid(), 'super_admin'))
WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Fix 4: Restrict salary_requests to super_admin only
DROP POLICY IF EXISTS "Admins can manage salary requests" ON public.salary_requests;

CREATE POLICY "Super admins can manage salary requests"
ON public.salary_requests FOR ALL
USING (has_role(auth.uid(), 'super_admin'))
WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Fix 5: Restrict expenses viewing to super_admin only (staff can still view own)
DROP POLICY IF EXISTS "Admins can manage expenses" ON public.expenses;
DROP POLICY IF EXISTS "Staff can view expenses" ON public.expenses;

CREATE POLICY "Super admins can manage expenses"
ON public.expenses FOR ALL
USING (has_role(auth.uid(), 'super_admin'))
WITH CHECK (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view their own expenses"
ON public.expenses FOR SELECT
USING (paid_by = auth.uid());

-- Fix 6: Restrict attendance management to super_admin, but keep user self-access
DROP POLICY IF EXISTS "Admins can manage all attendance" ON public.attendance;

CREATE POLICY "Super admins can manage all attendance"
ON public.attendance FOR ALL
USING (has_role(auth.uid(), 'super_admin'))
WITH CHECK (has_role(auth.uid(), 'super_admin'));