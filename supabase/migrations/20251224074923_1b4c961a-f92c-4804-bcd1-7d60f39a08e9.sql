-- Create social_links table for admin-editable social media links
CREATE TABLE public.social_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  handle TEXT NOT NULL,
  link TEXT NOT NULL,
  icon TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Social links are viewable by everyone" 
ON public.social_links 
FOR SELECT 
USING (is_active = true);

-- Admin write access
CREATE POLICY "Admins can manage social links" 
ON public.social_links 
FOR ALL 
USING (public.is_admin_type(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_social_links_updated_at
BEFORE UPDATE ON public.social_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default social links (WhatsApp, Instagram, YouTube)
INSERT INTO public.social_links (platform, name, handle, link, icon, display_order) VALUES
('instagram', 'Instagram', '@Asirex.official', 'https://instagram.com/asirex.official', 'Instagram', 1),
('whatsapp', 'WhatsApp Channel', 'Asirex.official', 'https://whatsapp.com/channel/asirex', 'MessageCircle', 2),
('youtube', 'YouTube', 'ASIREX Tech', 'https://youtube.com/@asirextech', 'Youtube', 3);