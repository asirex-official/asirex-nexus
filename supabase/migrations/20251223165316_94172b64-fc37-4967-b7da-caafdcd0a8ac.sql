-- Fix security vulnerability: signup_otps should not be publicly readable
DROP POLICY IF EXISTS "Service role can manage OTPs" ON public.signup_otps;
CREATE POLICY "Service role only access" ON public.signup_otps
  FOR ALL USING (false) WITH CHECK (false);

-- Add delivered_at column to orders if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivered_at') THEN
    ALTER TABLE public.orders ADD COLUMN delivered_at TIMESTAMPTZ;
  END IF;
END $$;

-- Enable realtime for order_issues and order_cancellations if not already
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'order_issues') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.order_issues;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'order_cancellations') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.order_cancellations;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;