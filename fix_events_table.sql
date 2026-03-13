-- eventsテーブルに必要な列を追加するSQL

-- file_url列を追加（PDFのURL）
ALTER TABLE events ADD COLUMN IF NOT EXISTS file_url TEXT;

-- pdf_id列を追加（uploaded_pdfsテーブルへの参照）
ALTER TABLE events ADD COLUMN IF NOT EXISTS pdf_id TEXT;

-- 確認用クエリ
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'events'
ORDER BY ordinal_position;

-- テストデータを挿入して確認
-- INSERT INTO events (title, event_date, category, description, file_url, pdf_id)
-- VALUES ('テスト行事', '2026-03', 'テスト', 'test.pdf', '/api/test', 'test-id');
