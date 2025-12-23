-- Phone verification table
CREATE TABLE public.phone_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_sent_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Verified phones linked to users
CREATE TABLE public.user_phones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  phone_number TEXT NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Product reviews
CREATE TABLE public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  order_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  videos JSONB DEFAULT '[]'::jsonb,
  is_verified_purchase BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(order_id, product_id)
);

-- Post-delivery actions tracking
CREATE TABLE public.order_post_delivery_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'review', 'not_received', 'damaged', 'return', 'replacement', 'warranty'
  action_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Damage/issue reports
CREATE TABLE public.order_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  issue_type TEXT NOT NULL, -- 'not_received', 'damaged', 'wrong_item', 'quality_issue'
  damage_type TEXT, -- 'internal', 'manufacturing', 'transit', 'water'
  description TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  videos JSONB DEFAULT '[]'::jsonb,
  address_confirmed BOOLEAN DEFAULT false,
  terms_accepted BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'submitted', -- 'submitted', 'under_review', 'approved', 'rejected', 'resolved'
  admin_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Return/Replacement requests
CREATE TABLE public.return_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id),
  request_type TEXT NOT NULL, -- 'return', 'replacement'
  reason TEXT NOT NULL,
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  pickup_scheduled_at TIMESTAMP WITH TIME ZONE,
  pickup_completed_at TIMESTAMP WITH TIME ZONE,
  replacement_order_id UUID,
  refund_id UUID,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'pickup_scheduled', 'picked_up', 'processing', 'completed', 'rejected'
  admin_notes TEXT,
  terms_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Warranty claims
CREATE TABLE public.warranty_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  warranty_start_date DATE NOT NULL, -- delivery date
  warranty_end_date DATE NOT NULL,
  issue_description TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  videos JSONB DEFAULT '[]'::jsonb,
  invoice_url TEXT,
  terms_accepted BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'submitted', -- 'submitted', 'under_review', 'approved', 'rejected', 'repair_in_progress', 'replacement_in_progress', 'completed'
  resolution_type TEXT, -- 'repair', 'replacement', 'refund'
  admin_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Refund requests
CREATE TABLE public.refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL, -- original payment method
  refund_method TEXT NOT NULL, -- 'bank', 'upi', 'gift_card', 'manual'
  bank_account_holder TEXT,
  bank_account_number_encrypted TEXT,
  bank_ifsc_encrypted TEXT,
  upi_id TEXT,
  gift_card_id UUID,
  reason TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  admin_notes TEXT,
  processed_by UUID,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Gift cards
CREATE TABLE public.gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL,
  balance NUMERIC NOT NULL,
  source TEXT DEFAULT 'refund', -- 'refund', 'promotion', 'purchase'
  refund_id UUID,
  is_redeemed BOOLEAN DEFAULT false,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  redeemed_order_id UUID,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Order cancellations with OTP verification
CREATE TABLE public.order_cancellations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  phone_otp_verified BOOLEAN DEFAULT false,
  email_otp_verified BOOLEAN DEFAULT false,
  otp_hash TEXT,
  otp_expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'cancelled', 'refund_initiated'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Abuse/fraud tracking
CREATE TABLE public.user_claim_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  claim_type TEXT NOT NULL, -- 'not_received', 'damaged', 'return', 'warranty', 'refund'
  claim_id UUID NOT NULL,
  is_valid BOOLEAN,
  flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add warranty_months to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS warranty_months INTEGER DEFAULT 12;

-- Enable RLS on all new tables
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_phones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_post_delivery_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranty_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_cancellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_claim_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for phone_verifications
CREATE POLICY "Users can manage own phone verifications" ON public.phone_verifications
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_phones
CREATE POLICY "Users can view own verified phones" ON public.user_phones
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own phone" ON public.user_phones
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all phones" ON public.user_phones
  FOR ALL USING (is_admin_type(auth.uid()));

-- RLS Policies for product_reviews
CREATE POLICY "Anyone can view published reviews" ON public.product_reviews
  FOR SELECT USING (status = 'published');
CREATE POLICY "Users can create own reviews" ON public.product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.product_reviews
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all reviews" ON public.product_reviews
  FOR ALL USING (is_admin_type(auth.uid()));

-- RLS Policies for order_post_delivery_actions
CREATE POLICY "Users can manage own post-delivery actions" ON public.order_post_delivery_actions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all post-delivery actions" ON public.order_post_delivery_actions
  FOR SELECT USING (is_admin_type(auth.uid()));

-- RLS Policies for order_issues
CREATE POLICY "Users can manage own issues" ON public.order_issues
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all issues" ON public.order_issues
  FOR ALL USING (is_admin_type(auth.uid()));

-- RLS Policies for return_requests
CREATE POLICY "Users can manage own returns" ON public.return_requests
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all returns" ON public.return_requests
  FOR ALL USING (is_admin_type(auth.uid()));

-- RLS Policies for warranty_claims
CREATE POLICY "Users can manage own warranty claims" ON public.warranty_claims
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all warranty claims" ON public.warranty_claims
  FOR ALL USING (is_admin_type(auth.uid()));

-- RLS Policies for refund_requests
CREATE POLICY "Users can view own refunds" ON public.refund_requests
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own refunds" ON public.refund_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all refunds" ON public.refund_requests
  FOR ALL USING (is_admin_type(auth.uid()));

-- RLS Policies for gift_cards
CREATE POLICY "Users can view own gift cards" ON public.gift_cards
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all gift cards" ON public.gift_cards
  FOR ALL USING (is_admin_type(auth.uid()));

-- RLS Policies for order_cancellations
CREATE POLICY "Users can manage own cancellations" ON public.order_cancellations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all cancellations" ON public.order_cancellations
  FOR ALL USING (is_admin_type(auth.uid()));

-- RLS Policies for user_claim_history
CREATE POLICY "Users can view own claim history" ON public.user_claim_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage claim history" ON public.user_claim_history
  FOR ALL USING (is_admin_type(auth.uid()));

-- Function to generate gift card code
CREATE OR REPLACE FUNCTION public.generate_gift_card_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Function to auto-create gift card for refund
CREATE OR REPLACE FUNCTION public.create_gift_card_refund(
  p_user_id UUID,
  p_amount NUMERIC,
  p_refund_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_gift_card_id UUID;
BEGIN
  -- Generate unique code
  LOOP
    v_code := generate_gift_card_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM gift_cards WHERE code = v_code);
  END LOOP;
  
  -- Create gift card
  INSERT INTO gift_cards (user_id, code, amount, balance, source, refund_id, expires_at)
  VALUES (p_user_id, v_code, p_amount, p_amount, 'refund', p_refund_id, now() + interval '1 year')
  RETURNING id INTO v_gift_card_id;
  
  -- Update refund request
  UPDATE refund_requests SET gift_card_id = v_gift_card_id, status = 'completed', processed_at = now()
  WHERE id = p_refund_id;
  
  RETURN v_gift_card_id;
END;
$$;

-- Trigger to update product ratings
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  avg_rating NUMERIC;
BEGIN
  SELECT COALESCE(AVG(rating), 0) INTO avg_rating
  FROM product_reviews
  WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
  AND status = 'published';
  
  UPDATE products SET rating = avg_rating
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_product_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.product_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

-- Add delivered_at to orders for warranty calculation
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;