-- Create attendance tracking table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  clock_in TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  clock_out TIMESTAMP WITH TIME ZONE,
  break_start TIMESTAMP WITH TIME ZONE,
  break_end TIMESTAMP WITH TIME ZONE,
  total_hours NUMERIC(5, 2),
  status TEXT DEFAULT 'clocked_in' CHECK (status IN ('clocked_in', 'on_break', 'clocked_out')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create salary_requests table for salary tracking
CREATE TABLE public.salary_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE NOT NULL,
  requested_by UUID NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  approved_by UUID,
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table for bills and operational costs
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  paid_by UUID,
  receipt_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  approved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Attendance policies
CREATE POLICY "Staff can view their own attendance" ON public.attendance
FOR SELECT USING (user_id = auth.uid() OR is_admin_type(auth.uid()));

CREATE POLICY "Staff can clock in/out" ON public.attendance
FOR INSERT WITH CHECK (user_id = auth.uid() OR is_admin_type(auth.uid()));

CREATE POLICY "Staff can update their attendance" ON public.attendance
FOR UPDATE USING (user_id = auth.uid() OR is_admin_type(auth.uid()));

CREATE POLICY "Admins can manage all attendance" ON public.attendance
FOR ALL USING (is_admin_type(auth.uid()));

-- Salary request policies
CREATE POLICY "Staff can view their salary requests" ON public.salary_requests
FOR SELECT USING (requested_by = auth.uid() OR is_admin_type(auth.uid()));

CREATE POLICY "Staff can create salary requests" ON public.salary_requests
FOR INSERT WITH CHECK (requested_by = auth.uid());

CREATE POLICY "Admins can manage salary requests" ON public.salary_requests
FOR ALL USING (is_admin_type(auth.uid()));

-- Expense policies
CREATE POLICY "Admins can manage expenses" ON public.expenses
FOR ALL USING (is_admin_type(auth.uid()));

CREATE POLICY "Staff can view expenses" ON public.expenses
FOR SELECT USING (is_staff(auth.uid()));

-- Add updated_at trigger
CREATE TRIGGER update_attendance_updated_at
BEFORE UPDATE ON public.attendance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_salary_requests_updated_at
BEFORE UPDATE ON public.salary_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();