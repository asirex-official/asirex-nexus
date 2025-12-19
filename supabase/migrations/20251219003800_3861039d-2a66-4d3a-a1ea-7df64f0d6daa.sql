-- Add permissions column to team_members table for storing granular access controls
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '[]'::jsonb;

-- Add login_path column to track which login path was assigned
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS login_path text DEFAULT NULL;

-- Create index for faster permission lookups
CREATE INDEX IF NOT EXISTS idx_team_members_permissions ON public.team_members USING GIN(permissions);

-- Update updated_at trigger if not exists
DROP TRIGGER IF EXISTS update_team_members_updated_at ON public.team_members;
CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();