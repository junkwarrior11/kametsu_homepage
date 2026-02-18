-- アクセス統計テーブルの作成
CREATE TABLE IF NOT EXISTS access_stats (
  id SERIAL PRIMARY KEY,
  stat_type VARCHAR(50) NOT NULL,  -- 'total' または 'monthly'
  year_month VARCHAR(20) NOT NULL,  -- 'total' または '2026-02'
  page_name VARCHAR(255) NOT NULL,  -- 'all' または 'index', 'about' など
  count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックスを作成（検索高速化）
CREATE INDEX IF NOT EXISTS idx_access_stats_lookup 
ON access_stats(stat_type, year_month, page_name);

-- 初期データを挿入
INSERT INTO access_stats (stat_type, year_month, page_name, count) VALUES
('total', 'total', 'all', 0),
('monthly', '2026-02', 'all', 0)
ON CONFLICT DO NOTHING;
