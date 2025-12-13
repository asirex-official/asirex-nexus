-- Add tracking_number column to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number text;

-- Add tracking_provider column for delivery service info
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_provider text DEFAULT 'Delhivery';

-- Add shipped_at timestamp
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipped_at timestamp with time zone;