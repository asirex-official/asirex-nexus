-- Add login notification setting to user_security_settings
ALTER TABLE public.user_security_settings 
ADD COLUMN IF NOT EXISTS notify_new_login BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.user_security_settings.notify_new_login IS 'When enabled, sends email notification when user logs in from a new device or location';