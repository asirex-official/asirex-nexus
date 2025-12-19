-- Create table for storing WebAuthn passkey credentials
CREATE TABLE public.user_passkeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter INTEGER NOT NULL DEFAULT 0,
  device_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.user_passkeys ENABLE ROW LEVEL SECURITY;

-- Users can view their own passkeys
CREATE POLICY "Users can view their own passkeys"
ON public.user_passkeys
FOR SELECT
USING (auth.uid() = user_id);

-- Users can register passkeys for themselves
CREATE POLICY "Users can register their own passkeys"
ON public.user_passkeys
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own passkeys
CREATE POLICY "Users can delete their own passkeys"
ON public.user_passkeys
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can manage all passkeys
CREATE POLICY "Admins can manage all passkeys"
ON public.user_passkeys
FOR ALL
USING (is_admin_type(auth.uid()));

-- Create index for faster credential lookup
CREATE INDEX idx_user_passkeys_credential_id ON public.user_passkeys(credential_id);
CREATE INDEX idx_user_passkeys_user_id ON public.user_passkeys(user_id);