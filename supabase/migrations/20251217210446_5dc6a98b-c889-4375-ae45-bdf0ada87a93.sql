-- Create project_assignments junction table
CREATE TABLE public.project_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, team_member_id)
);

-- Enable RLS
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage project assignments"
ON public.project_assignments
FOR ALL
USING (is_admin_type(auth.uid()));

CREATE POLICY "Staff can view project assignments"
ON public.project_assignments
FOR SELECT
USING (is_staff(auth.uid()));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_assignments;

-- Add trigger for updated_at
CREATE TRIGGER update_project_assignments_updated_at
BEFORE UPDATE ON public.project_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();