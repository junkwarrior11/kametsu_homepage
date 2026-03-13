-- newslettersテーブルに必要な列を追加するSQL

-- pdf_id列を追加（uploaded_pdfsテーブルへの参照）
ALTER TABLE newsletters ADD COLUMN IF NOT EXISTS pdf_id TEXT;

-- 確認用クエリ
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'newsletters'
ORDER BY ordinal_position;

-- 既存のfile_url列を確認
SELECT id, title, file_url, pdf_id
FROM newsletters
LIMIT 5;
