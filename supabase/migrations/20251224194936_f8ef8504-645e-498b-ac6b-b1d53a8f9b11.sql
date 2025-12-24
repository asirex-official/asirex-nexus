-- Add category column to coupons table for sorting/filtering
ALTER TABLE public.coupons 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Add comment for documentation
COMMENT ON COLUMN public.coupons.category IS 'Coupon category: general, apology, sale, giftcard, refund, festival';

-- Add deduction_per_day column to track salary deductions for missed attendance
ALTER TABLE public.team_members
ADD COLUMN IF NOT EXISTS daily_salary NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS attendance_deduction_rate NUMERIC DEFAULT 200;

-- Create attendance_deductions table to track salary deductions
CREATE TABLE IF NOT EXISTS public.attendance_deductions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  deduction_amount NUMERIC NOT NULL DEFAULT 200,
  reason TEXT NOT NULL DEFAULT 'absent',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(team_member_id, date)
);

-- Enable RLS
ALTER TABLE public.attendance_deductions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage all deductions"
  ON public.attendance_deductions FOR ALL
  USING (is_admin_type(auth.uid()));

CREATE POLICY "Team members can view own deductions"
  ON public.attendance_deductions FOR SELECT
  USING (team_member_id IN (
    SELECT id FROM team_members WHERE user_id = auth.uid()
  ));