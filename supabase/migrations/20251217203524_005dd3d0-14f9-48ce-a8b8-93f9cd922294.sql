-- Add last_seen column for online/offline tracking
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add index for efficient last_seen queries
CREATE INDEX IF NOT EXISTS idx_team_members_last_seen ON public.team_members(last_seen);