-- Remove the policy that allows users to view their own activity logs
-- This prevents users from analyzing security monitoring patterns
-- Only admins should have access to activity logs containing IP addresses and user agents
DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.activity_logs;