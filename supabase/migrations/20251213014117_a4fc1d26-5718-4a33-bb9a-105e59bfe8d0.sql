-- Drop the public viewing policy for projects
DROP POLICY IF EXISTS "Projects are viewable by everyone" ON public.projects;

-- Create new policy - only staff can view projects
CREATE POLICY "Projects are viewable by staff only" 
ON public.projects 
FOR SELECT 
USING (is_staff(auth.uid()));

-- Create CEO 2FA PIN table
CREATE TABLE public.ceo_security (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  pin_hash text NOT NULL,
  is_verified boolean DEFAULT false,
  last_verified_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ceo_security ENABLE ROW LEVEL SECURITY;

-- Only super_admin can access their own security settings
CREATE POLICY "Super admins can manage their security"
ON public.ceo_security
FOR ALL
USING (has_role(auth.uid(), 'super_admin') AND user_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_ceo_security_updated_at
BEFORE UPDATE ON public.ceo_security
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();