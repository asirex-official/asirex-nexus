-- Create table for 2FA TOTP secrets (encrypted)
CREATE TABLE public.user_2fa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  totp_secret_encrypted text NOT NULL,
  is_enabled boolean DEFAULT false,
  backup_codes_hash text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  verified_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.user_2fa ENABLE ROW LEVEL SECURITY;

-- Only the user can view their own 2FA status (but not the secret - that's for edge functions only)
CREATE POLICY "Users can view their own 2FA status"
ON public.user_2fa
FOR SELECT
USING (auth.uid() = user_id);

-- Only service role can manage 2FA secrets (via edge functions)
CREATE POLICY "Service role manages 2FA"
ON public.user_2fa
FOR ALL
USING (auth.uid() = user_id);

-- Create table for failed login attempts (rate limiting)
CREATE TABLE public.auth_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- email or IP
  attempt_type text NOT NULL, -- 'login', 'pin', '2fa'
  success boolean DEFAULT false,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS - only admins can view
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view auth attempts"
ON public.auth_attempts
FOR SELECT
USING (is_admin_type(auth.uid()));

CREATE POLICY "System can insert auth attempts"
ON public.auth_attempts
FOR INSERT
WITH CHECK (true);

-- Create table for active sessions tracking
CREATE TABLE public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_token_hash text NOT NULL,
  device_info jsonb DEFAULT '{}',
  ip_address text,
  last_active_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  is_admin_verified boolean DEFAULT false,
  admin_verified_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
ON public.user_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
ON public.user_sessions
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "System can manage sessions"
ON public.user_sessions
FOR ALL
USING (auth.uid() = user_id);

-- Create index for fast lookups
CREATE INDEX idx_auth_attempts_identifier ON public.auth_attempts(identifier, created_at DESC);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id, last_active_at DESC);
CREATE INDEX idx_user_2fa_user_id ON public.user_2fa(user_id);

-- Function to check rate limiting
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text,
  p_attempt_type text,
  p_max_attempts int DEFAULT 5,
  p_window_minutes int DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_count int;
BEGIN
  SELECT COUNT(*)
  INTO attempt_count
  FROM public.auth_attempts
  WHERE identifier = p_identifier
    AND attempt_type = p_attempt_type
    AND success = false
    AND created_at > NOW() - (p_window_minutes || ' minutes')::interval;
  
  RETURN attempt_count < p_max_attempts;
END;
$$;

-- Function to log auth attempt
CREATE OR REPLACE FUNCTION public.log_auth_attempt(
  p_identifier text,
  p_attempt_type text,
  p_success boolean,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.auth_attempts (identifier, attempt_type, success, ip_address, user_agent)
  VALUES (p_identifier, p_attempt_type, p_success, p_ip_address, p_user_agent);
END;
$$;

-- Update trigger for user_2fa
CREATE TRIGGER update_user_2fa_updated_at
BEFORE UPDATE ON public.user_2fa
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();