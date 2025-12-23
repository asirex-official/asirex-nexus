-- Add login lockout protection column to user_security_settings
ALTER TABLE public.user_security_settings 
ADD COLUMN IF NOT EXISTS login_lockout_enabled BOOLEAN DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN public.user_security_settings.login_lockout_enabled IS 'When enabled, account will be temporarily locked after 5 failed login attempts';