-- Add birthdate to profiles for age calculation
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birthdate date;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin_type(auth.uid()));

-- Allow admins to update any profile
CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (is_admin_type(auth.uid()));