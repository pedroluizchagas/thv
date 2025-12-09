ALTER TABLE public.products ADD COLUMN IF NOT EXISTS photo1_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS photo2_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS photo3_url TEXT;

DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "product_images_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "product_images_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "product_images_authenticated_delete" ON storage.objects;
CREATE POLICY "product_images_public_read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'product-images');
CREATE POLICY "product_images_authenticated_upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "product_images_authenticated_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images');
CREATE POLICY "product_images_authenticated_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');
