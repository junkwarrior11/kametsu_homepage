-- アクセス統計テーブルの作成（D1/SQLite用）
CREATE TABLE IF NOT EXISTS access_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stat_type TEXT NOT NULL,  -- 'total' または 'monthly'
  year_month TEXT NOT NULL,  -- 'total' または '2026-02'
  page_name TEXT NOT NULL,  -- 'all' または 'index', 'about' など
  count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- インデックスを作成（検索高速化）
CREATE INDEX IF NOT EXISTS idx_access_stats_lookup 
ON access_stats(stat_type, year_month, page_name);

-- 初期データを挿入
INSERT OR IGNORE INTO access_stats (stat_type, year_month, page_name, count) VALUES
('total', 'total', 'all', 0),
('monthly', '2026-02', 'all', 0);
