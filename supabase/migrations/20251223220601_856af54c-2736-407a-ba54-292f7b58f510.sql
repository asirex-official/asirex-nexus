-- Add columns to track return pickup attempts and late refund coupons
ALTER TABLE public.order_complaints 
ADD COLUMN IF NOT EXISTS pickup_attempt_number integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_pickup_attempts integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS pickup_failed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS return_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS eligible_for_coupon boolean DEFAULT false;

-- Add column to track refund completion time for late coupon logic
ALTER TABLE public.refund_requests
ADD COLUMN IF NOT EXISTS late_refund_coupon_code text,
ADD COLUMN IF NOT EXISTS late_refund_coupon_sent boolean DEFAULT false;

-- Create return_pickup_attempts table to track individual attempts
CREATE TABLE IF NOT EXISTS public.return_pickup_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id uuid NOT NULL REFERENCES public.order_complaints(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  attempt_number integer NOT NULL,
  scheduled_date date NOT NULL,
  attempted_at timestamp with time zone,
  status text NOT NULL DEFAULT 'scheduled',
  failure_reason text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.return_pickup_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage all return pickup attempts" ON public.return_pickup_attempts
  FOR ALL USING (is_admin_type(auth.uid()));

CREATE POLICY "Users can view own return pickup attempts" ON public.return_pickup_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM order_complaints oc
      WHERE oc.id = return_pickup_attempts.complaint_id
      AND oc.user_id = auth.uid()
    )
  );

-- Enable realtime for return_pickup_attempts
ALTER PUBLICATION supabase_realtime ADD TABLE public.return_pickup_attempts;

-- Update trigger for updated_at
CREATE TRIGGER update_return_pickup_attempts_updated_at
  BEFORE UPDATE ON public.return_pickup_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();