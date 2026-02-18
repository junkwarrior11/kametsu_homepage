-- access_logs テーブルに updated_at カラムを追加
ALTER TABLE access_logs ADD COLUMN updated_at TEXT DEFAULT (datetime('now', 'localtime'));
