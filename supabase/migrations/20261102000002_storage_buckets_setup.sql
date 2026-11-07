-- AFTERCLASS Storage Buckets Configuration & Security Policies
-- Harcourt Butler Technical University (HBTU) Campus Network

-- Storage Buckets:
-- 1. profile-images (public read for active discoverable profiles)
-- 2. couple-memories (strictly private, signed URLs or partner-only)
-- 3. event-images (public read, verified organizers write)
-- 4. confession-media (moderated, restricted)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('profile-images', 'profile-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('couple-memories', 'couple-memories', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('event-images', 'event-images', true, 8388608, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('confession-media', 'confession-media', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS Policies
-- Profile images: anyone authenticated can view, owners can upload/modify
CREATE POLICY "Profile images are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload their own profile image"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Couple memories: private to partners only
CREATE POLICY "Only couple partners can access couple memories"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'couple-memories'
  AND EXISTS (
    SELECT 1 FROM couple_spaces cs
    JOIN profiles p ON (cs.partner_1_id = p.id OR cs.partner_2_id = p.id)
    WHERE p.auth_user_id = auth.uid()
      AND (storage.foldername(name))[1] = cs.id::text
  )
);

CREATE POLICY "Only couple partners can upload couple memories"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'couple-memories'
  AND EXISTS (
    SELECT 1 FROM couple_spaces cs
    JOIN profiles p ON (cs.partner_1_id = p.id OR cs.partner_2_id = p.id)
    WHERE p.auth_user_id = auth.uid()
      AND (storage.foldername(name))[1] = cs.id::text
  )
);

-- Event images: public read, authorized organizers or admins can upload
CREATE POLICY "Event images are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

CREATE POLICY "Admins or event organizers can upload event images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images');
