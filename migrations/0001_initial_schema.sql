-- 亀津小学校ウェブサイト - 初期データベーススキーマ
-- 作成日: 2024-11-11

-- 1. blog_posts - ブログ記事
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'お知らせ',
  status TEXT NOT NULL DEFAULT '公開',
  author TEXT DEFAULT '管理者',
  publish_date TEXT DEFAULT (datetime('now', 'localtime')),
  featured_image TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 2. newsletters - 学校だより
CREATE TABLE IF NOT EXISTS newsletters (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  issue_number INTEGER,
  issue_date TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  pdf_id TEXT,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 3. events - 行事予定
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  event_date TEXT NOT NULL,
  category TEXT DEFAULT '春の行事',
  description TEXT,
  location TEXT,
  target_grade TEXT DEFAULT '全学年',
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 4. page_contents - ページコンテンツ
CREATE TABLE IF NOT EXISTS page_contents (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  page_name TEXT NOT NULL,
  section_name TEXT NOT NULL,
  content TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 5. media - メディアファイル
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  alt_text TEXT,
  upload_date TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 6. site_settings - サイト設定（トップページの全テキストコンテンツ）
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  setting_group TEXT,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 7. access_logs - アクセスログ
CREATE TABLE IF NOT EXISTS access_logs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  page_url TEXT NOT NULL,
  page_name TEXT NOT NULL,
  access_date TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  year_month TEXT NOT NULL,
  user_agent TEXT,
  ip_hash TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 8. access_stats - アクセス統計
CREATE TABLE IF NOT EXISTS access_stats (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  stat_type TEXT NOT NULL,
  year_month TEXT NOT NULL,
  page_name TEXT NOT NULL DEFAULT 'all',
  count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime')),
  UNIQUE(stat_type, year_month, page_name)
);

-- 9. uploaded_pdfs - PDFライブラリ
CREATE TABLE IF NOT EXISTS uploaded_pdfs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  file_name TEXT NOT NULL,
  file_size INTEGER,
  pdf_data TEXT NOT NULL,
  uploaded_by TEXT DEFAULT '管理者',
  description TEXT,
  year TEXT,
  month TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_publish_date ON blog_posts(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);

CREATE INDEX IF NOT EXISTS idx_newsletters_issue_date ON newsletters(issue_date DESC);

CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);

CREATE INDEX IF NOT EXISTS idx_page_contents_page_section ON page_contents(page_name, section_name);

CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_site_settings_group ON site_settings(setting_group);

CREATE INDEX IF NOT EXISTS idx_access_logs_year_month ON access_logs(year_month);
CREATE INDEX IF NOT EXISTS idx_access_logs_page_name ON access_logs(page_name);

CREATE INDEX IF NOT EXISTS idx_access_stats_type ON access_stats(stat_type, year_month);
