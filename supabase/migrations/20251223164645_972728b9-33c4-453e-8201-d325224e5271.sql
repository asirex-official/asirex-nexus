-- Add delivery attempts tracking to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS delivery_attempts jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS delivery_status text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS returning_to_provider boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS return_reason text DEFAULT NULL;

-- Create delivery_attempts table for detailed tracking
CREATE TABLE public.delivery_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL,
  scheduled_date DATE NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'scheduled',
  failure_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.delivery_attempts ENABLE ROW LEVEL SECURITY;

-- RLS policies for delivery_attempts
CREATE POLICY "Users can view own order delivery attempts" 
ON public.delivery_attempts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = delivery_attempts.order_id 
  AND orders.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all delivery attempts" 
ON public.delivery_attempts 
FOR ALL 
USING (is_admin_type(auth.uid()));

-- Add refund_link_token to refund_requests for secure link access
ALTER TABLE public.refund_requests 
ADD COLUMN IF NOT EXISTS link_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS link_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP WITH TIME ZONE;

-- Create function to generate refund link token
CREATE OR REPLACE FUNCTION public.generate_refund_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..32 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;