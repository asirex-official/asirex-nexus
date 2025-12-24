-- Create production_tracking table to track manufacturing stats
CREATE TABLE public.production_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  products_in_production INTEGER NOT NULL DEFAULT 0,
  products_completed INTEGER NOT NULL DEFAULT 0,
  products_shipped INTEGER NOT NULL DEFAULT 0,
  unit_price NUMERIC NOT NULL DEFAULT 50,
  total_earnings NUMERIC GENERATED ALWAYS AS (products_completed * unit_price) STORED,
  pending_earnings NUMERIC GENERATED ALWAYS AS (products_in_production * unit_price) STORED,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.production_tracking ENABLE ROW LEVEL SECURITY;

-- Admin can manage all production tracking
CREATE POLICY "Admins can manage production tracking" 
ON public.production_tracking 
FOR ALL 
USING (is_admin_type(auth.uid()));

-- Staff can view production tracking
CREATE POLICY "Staff can view production tracking" 
ON public.production_tracking 
FOR SELECT 
USING (is_staff(auth.uid()));

-- Team members can insert/update their own production records
CREATE POLICY "Team members can manage own production records"
ON public.production_tracking
FOR ALL
USING (
  team_member_id IN (
    SELECT id FROM team_members WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  team_member_id IN (
    SELECT id FROM team_members WHERE user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_production_tracking_updated_at
BEFORE UPDATE ON public.production_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for production tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.production_tracking;