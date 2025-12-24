-- Add RLS policies to deny anonymous access to sensitive tables

-- Profiles table - deny anonymous SELECT
CREATE POLICY "Deny anonymous access to profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- User phones table - deny anonymous SELECT
CREATE POLICY "Deny anonymous access to user_phones" 
ON public.user_phones 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- User addresses table - deny anonymous SELECT
CREATE POLICY "Deny anonymous access to user_addresses" 
ON public.user_addresses 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Orders table - deny anonymous SELECT
CREATE POLICY "Deny anonymous access to orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Refund requests table - deny anonymous SELECT
CREATE POLICY "Deny anonymous access to refund_requests" 
ON public.refund_requests 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Team members table - deny anonymous SELECT
CREATE POLICY "Deny anonymous access to team_members" 
ON public.team_members 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- CEO security table - deny anonymous SELECT
CREATE POLICY "Deny anonymous access to ceo_security" 
ON public.ceo_security 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- User 2FA table - deny anonymous SELECT
CREATE POLICY "Deny anonymous access to user_2fa" 
ON public.user_2fa 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Job applications table - deny anonymous SELECT
CREATE POLICY "Deny anonymous access to job_applications" 
ON public.job_applications 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Salary requests table - deny anonymous SELECT
CREATE POLICY "Deny anonymous access to salary_requests" 
ON public.salary_requests 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Security audit logs - deny anonymous SELECT
CREATE POLICY "Deny anonymous access to security_audit_logs" 
ON public.security_audit_logs 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Active sessions - deny anonymous SELECT
CREATE POLICY "Deny anonymous access to active_sessions" 
ON public.active_sessions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- User sessions - deny anonymous SELECT (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_sessions') THEN
    EXECUTE 'CREATE POLICY "Deny anonymous access to user_sessions" ON public.user_sessions FOR SELECT USING (auth.uid() IS NOT NULL)';
  END IF;
END $$;

-- Contact messages - deny anonymous SELECT
CREATE POLICY "Deny anonymous access to contact_messages" 
ON public.contact_messages 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Expenses - deny anonymous SELECT
CREATE POLICY "Deny anonymous access to expenses" 
ON public.expenses 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Attendance - deny anonymous SELECT
CREATE POLICY "Deny anonymous access to attendance" 
ON public.attendance 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Production tracking - deny anonymous SELECT
CREATE POLICY "Deny anonymous access to production_tracking" 
ON public.production_tracking 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Order complaints - deny anonymous SELECT
CREATE POLICY "Deny anonymous access to order_complaints" 
ON public.order_complaints 
FOR SELECT 
USING (auth.uid() IS NOT NULL);