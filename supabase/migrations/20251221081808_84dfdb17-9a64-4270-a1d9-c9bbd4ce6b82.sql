-- Create sales campaigns table for festival/promotional sales
CREATE TABLE public.sales_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  max_discount_amount NUMERIC,
  min_order_amount NUMERIC DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  max_orders INTEGER,
  current_orders INTEGER DEFAULT 0,
  banner_message TEXT,
  banner_color TEXT DEFAULT '#6366f1',
  is_active BOOLEAN DEFAULT true,
  applies_to TEXT DEFAULT 'all' CHECK (applies_to IN ('all', 'category', 'products')),
  target_categories JSONB DEFAULT '[]'::jsonb,
  target_product_ids JSONB DEFAULT '[]'::jsonb,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sales_campaigns ENABLE ROW LEVEL SECURITY;

-- Anyone can view active sales campaigns
CREATE POLICY "Anyone can view active sales campaigns"
  ON public.sales_campaigns
  FOR SELECT
  USING (is_active = true AND (end_date IS NULL OR end_date > now()));

-- Super admins can manage all sales campaigns
CREATE POLICY "Super admins can manage sales campaigns"
  ON public.sales_campaigns
  FOR ALL
  USING (has_role(auth.uid(), 'super_admin'))
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Update trigger
CREATE TRIGGER update_sales_campaigns_updated_at
  BEFORE UPDATE ON public.sales_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();