-- Add phone_number column to signup_otps table for phone OTP verification
ALTER TABLE public.signup_otps ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.signup_otps ADD COLUMN IF NOT EXISTS otp_method TEXT DEFAULT 'email';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_signup_otps_phone ON public.signup_otps(phone_number) WHERE phone_number IS NOT NULL;