-- Fix 1: Remove public SELECT from contact_messages (admin-only access)
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;

CREATE POLICY "Anyone can submit contact messages" 
ON public.contact_messages 
FOR INSERT 
WITH CHECK (true);

-- Fix 2: Remove public readability from job_applications
-- Already has admin-only SELECT, but let's ensure it's correct
DROP POLICY IF EXISTS "Admins can view job applications" ON public.job_applications;

CREATE POLICY "Admins can view job applications" 
ON public.job_applications 
FOR SELECT 
USING (is_admin_type(auth.uid()));

-- Fix 3: Remove public readability from newsletter_subscribers
-- Already restricted, but ensure no public access
DROP POLICY IF EXISTS "Admins can view newsletter subscribers" ON public.newsletter_subscribers;

CREATE POLICY "Admins can view newsletter subscribers" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (is_admin_type(auth.uid()));

-- Fix 4: Add SELECT policy for orders so users can view their own orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING ((auth.uid() = user_id) OR is_admin_type(auth.uid()));

-- Fix 5: Restrict activity_logs INSERT to prevent fake log injection
DROP POLICY IF EXISTS "Authenticated users can create activity logs" ON public.activity_logs;

CREATE POLICY "Staff can create activity logs" 
ON public.activity_logs 
FOR INSERT 
WITH CHECK (is_staff(auth.uid()));