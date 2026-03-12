-- アクセスログテーブル（個別訪問記録）
CREATE TABLE IF NOT EXISTS access_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_name TEXT NOT NULL,
  visit_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_agent TEXT,
  ip_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- アクセス統計テーブル（集計データ）
CREATE TABLE IF NOT EXISTS access_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stat_key TEXT UNIQUE NOT NULL,
  stat_value INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_access_logs_page ON access_logs(page_name);
CREATE INDEX IF NOT EXISTS idx_access_logs_date ON access_logs(visit_date);
CREATE INDEX IF NOT EXISTS idx_access_stats_key ON access_stats(stat_key);

-- 初期統計レコード作成
INSERT OR IGNORE INTO access_stats (stat_key, stat_value) VALUES ('total_access', 0);
