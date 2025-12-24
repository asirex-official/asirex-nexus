-- Add festival theme column to sales_campaigns table
ALTER TABLE public.sales_campaigns 
ADD COLUMN IF NOT EXISTS festival_theme TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS notify_users BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notify_email BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS theme_effects JSONB DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.sales_campaigns.festival_theme IS 'Festival theme: diwali, christmas, holi, new_year, independence_day, etc.';
COMMENT ON COLUMN public.sales_campaigns.notify_users IS 'Whether to send in-app notifications';
COMMENT ON COLUMN public.sales_campaigns.notify_email IS 'Whether to send email notifications';
COMMENT ON COLUMN public.sales_campaigns.theme_effects IS 'Custom theme effects configuration';