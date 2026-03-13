INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-images', 'recipe-images', true)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  public = EXCLUDED.public;

DROP POLICY IF EXISTS "Recipe images are publicly accessible" ON storage.objects;
CREATE POLICY "Recipe images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'recipe-images');

DROP POLICY IF EXISTS "Authenticated users can upload their own recipe images" ON storage.objects;
CREATE POLICY "Authenticated users can upload their own recipe images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'recipe-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Authenticated users can update their own recipe images" ON storage.objects;
CREATE POLICY "Authenticated users can update their own recipe images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'recipe-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'recipe-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Authenticated users can delete their own recipe images" ON storage.objects;
CREATE POLICY "Authenticated users can delete their own recipe images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'recipe-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );