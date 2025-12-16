-- Create task_comments table for task discussions
CREATE TABLE public.task_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view comments on their tasks"
ON public.task_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = task_comments.task_id
    AND (tasks.assigned_to = auth.uid() OR tasks.assigned_by = auth.uid())
  )
  OR is_admin_type(auth.uid())
);

CREATE POLICY "Users can add comments to their tasks"
ON public.task_comments
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = task_comments.task_id
    AND (tasks.assigned_to = auth.uid() OR tasks.assigned_by = auth.uid())
  )
);

CREATE POLICY "Admins can manage all comments"
ON public.task_comments
FOR ALL
USING (is_admin_type(auth.uid()));

-- Enable realtime for tasks
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;