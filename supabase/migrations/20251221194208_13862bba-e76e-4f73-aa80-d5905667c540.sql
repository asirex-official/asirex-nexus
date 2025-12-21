-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view assigned tasks" ON public.tasks;

-- Create improved policy: users see tasks they're assigned to OR tasks they created
CREATE POLICY "Users can view their tasks"
ON public.tasks FOR SELECT
USING (
  auth.uid() = assigned_to 
  OR auth.uid() = assigned_by 
  OR is_admin_type(auth.uid())
);

-- Add policy for users to update their own assigned tasks (mark complete, etc)
CREATE POLICY "Users can update assigned tasks"
ON public.tasks FOR UPDATE
USING (auth.uid() = assigned_to)
WITH CHECK (auth.uid() = assigned_to);