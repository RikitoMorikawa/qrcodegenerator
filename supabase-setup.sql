-- Supabaseで実行するSQL

-- 1. generated_images テーブルを作成
CREATE TABLE generated_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt TEXT NOT NULL,
  style_type VARCHAR(50) DEFAULT 'normal',
  image_url TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RLS (Row Level Security) を有効化
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

-- 3. 公開画像の読み取りポリシーを作成
CREATE POLICY "Public images are viewable by everyone" ON generated_images
  FOR SELECT USING (is_public = true);

-- 4. 全ての画像の挿入を許可（匿名ユーザーでも）
CREATE POLICY "Anyone can insert images" ON generated_images
  FOR INSERT WITH CHECK (true);

-- 5. ストレージバケットを作成（Supabase UIで実行するか、以下のSQLで）
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

-- 6. ストレージポリシーを設定
CREATE POLICY "Anyone can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images');

CREATE POLICY "Images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');