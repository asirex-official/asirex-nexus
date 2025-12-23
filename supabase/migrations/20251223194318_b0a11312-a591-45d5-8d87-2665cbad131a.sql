-- Add columns to order_issues for tracking investigation status
ALTER TABLE order_issues ADD COLUMN IF NOT EXISTS investigation_status text DEFAULT 'pending';
ALTER TABLE order_issues ADD COLUMN IF NOT EXISTS investigation_result text;
ALTER TABLE order_issues ADD COLUMN IF NOT EXISTS coupon_code text;
ALTER TABLE order_issues ADD COLUMN IF NOT EXISTS refund_method text;
ALTER TABLE order_issues ADD COLUMN IF NOT EXISTS refund_status text;

-- Create order complaint tracking table for "Order Not Received" cases
CREATE TABLE IF NOT EXISTS order_complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  complaint_type text NOT NULL, -- 'not_received', 'damaged', 'return', 'replace', 'warranty'
  description text,
  images jsonb DEFAULT '[]'::jsonb,
  investigation_status text DEFAULT 'investigating', -- 'investigating', 'resolved_true', 'resolved_false'
  investigation_notes text,
  resolution_type text, -- 'coupon', 'refund', 'replacement', 'pickup_refund', 'pickup_replace'
  coupon_code text,
  coupon_discount integer DEFAULT 20,
  refund_method text, -- 'original', 'bank', 'upi', 'gift_card'
  refund_status text DEFAULT 'pending',
  pickup_status text, -- 'scheduled', 'picked_up', 'received'
  pickup_scheduled_at timestamp with time zone,
  pickup_completed_at timestamp with time zone,
  replacement_order_id uuid,
  admin_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE order_complaints ENABLE ROW LEVEL SECURITY;

-- Policies for order_complaints
CREATE POLICY "Users can view own complaints" ON order_complaints
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own complaints" ON order_complaints
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all complaints" ON order_complaints
FOR ALL USING (is_admin_type(auth.uid()));

-- Add complaint_id to orders for quick lookup
ALTER TABLE orders ADD COLUMN IF NOT EXISTS active_complaint_id uuid REFERENCES order_complaints(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type text DEFAULT 'regular'; -- 'regular', 'replacement', 'warranty_replacement'
ALTER TABLE orders ADD COLUMN IF NOT EXISTS parent_order_id uuid REFERENCES orders(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS complaint_status text; -- 'investigating', 'resolved', 'false_report'

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_order_complaints_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_order_complaints_updated_at
BEFORE UPDATE ON order_complaints
FOR EACH ROW
EXECUTE FUNCTION update_order_complaints_updated_at();

-- Enable realtime for order_complaints
ALTER PUBLICATION supabase_realtime ADD TABLE order_complaints;