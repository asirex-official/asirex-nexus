-- Create storage bucket for team member profile images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('team-profiles', 'team-profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for team-profiles bucket
CREATE POLICY "Team profile images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'team-profiles');

CREATE POLICY "Admins can upload team profile images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'team-profiles' AND is_admin_type(auth.uid()));

CREATE POLICY "Admins can update team profile images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'team-profiles' AND is_admin_type(auth.uid()));

CREATE POLICY "Admins can delete team profile images"
ON storage.objects FOR DELETE
USING (bucket_id = 'team-profiles' AND is_admin_type(auth.uid()));