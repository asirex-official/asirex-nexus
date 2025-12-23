-- Add warranty, return/replace availability, and premium grade columns to products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS return_available boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS replace_available boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS is_premium_grade boolean DEFAULT false;