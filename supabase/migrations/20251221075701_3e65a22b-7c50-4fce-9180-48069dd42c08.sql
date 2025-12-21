-- Add policy to allow anyone to count event registrations (for capacity display)
CREATE POLICY "Anyone can count event registrations"
ON public.event_registrations
FOR SELECT
USING (true);

-- Enable realtime for event_registrations
ALTER TABLE public.event_registrations REPLICA IDENTITY FULL;