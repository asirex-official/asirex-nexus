-- Add attachments column to chat_messages table
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT NULL;

-- Add comment to describe the structure
COMMENT ON COLUMN public.chat_messages.attachments IS 'Array of attachment objects: [{url, name, type, size}]';