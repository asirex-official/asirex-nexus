-- Add type column to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS type text DEFAULT 'Event';

-- Update existing events with their types based on names
UPDATE public.events SET type = 'Launch' WHERE name ILIKE '%launch%' OR name ILIKE '%first step%' OR name ILIKE '%deployment%';
UPDATE public.events SET type = 'Workshop' WHERE name ILIKE '%workshop%';
UPDATE public.events SET type = 'Conference' WHERE name ILIKE '%summit%' OR name ILIKE '%conference%';
UPDATE public.events SET type = 'Summit' WHERE name ILIKE '%summit%' AND type != 'Conference';