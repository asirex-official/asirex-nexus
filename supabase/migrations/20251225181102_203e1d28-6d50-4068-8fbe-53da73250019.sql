-- Add created_by column to track who/what created the coupon (user_id or 'system')
ALTER TABLE public.coupons 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- Add comment for documentation
COMMENT ON COLUMN public.coupons.created_by IS 'User ID who created the coupon, null for system-generated';
COMMENT ON COLUMN public.coupons.source IS 'Source of coupon: manual, apology_complaint, apology_refund_delay, refund_giftcard, system';