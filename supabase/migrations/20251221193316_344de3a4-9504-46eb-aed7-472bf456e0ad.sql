-- Add columns for rate limiting to ceo_security table
ALTER TABLE public.ceo_security 
ADD COLUMN IF NOT EXISTS failed_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_failed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;