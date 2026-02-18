-- 初期データの投入 (PostgreSQL版)
-- Netlify + Supabase デプロイ用

-- サイト設定の初期値（トップページの全34フィールド）

-- 1. ヘッダー (4フィールド)
INSERT INTO site_settings (setting_key, setting_value, setting_group, description) VALUES
('header_school_name', '徳之島町立亀津小学校', 'header', 'ヘッダーの学校名'),
('header_motto', '心豊かに、たくましく', 'header', 'ヘッダーのモットー'),
('header_top_phone', '0997-82-0142', 'header', 'ヘッダー上部の電話番号'),
('header_top_email', 'kametu-es@town.tokunoshima.lg.jp', 'header', 'ヘッダー上部のメールアドレス')
ON CONFLICT (setting_key) DO NOTHING;

-- 2. ヒーローセクション (4フィールド)
INSERT INTO site_settings (setting_key, setting_value, setting_group, description) VALUES
('hero_title', '徳之島町立亀津小学校', 'hero', 'ヒーローセクションのメインタイトル'),
('hero_subtitle', '心豊かに、たくましく育つ子どもたちを育てます', 'hero', 'ヒーローセクションのサブタイトル'),
('hero_btn1', '学校概要', 'hero', 'ヒーローセクションのボタン1'),
('hero_btn2', '行事予定', 'hero', 'ヒーローセクションのボタン2')
ON CONFLICT (setting_key) DO NOTHING;

-- 3. ニュースセクション (2フィールド)
INSERT INTO site_settings (setting_key, setting_value, setting_group, description) VALUES
('news_title', '新着情報', 'news', 'ニュースセクションのタイトル'),
('news_link', 'もっと見る', 'news', 'ニュースセクションのリンクテキスト')
ON CONFLICT (setting_key) DO NOTHING;

-- 4. 学校紹介セクション (5フィールド)
INSERT INTO site_settings (setting_key, setting_value, setting_group, description) VALUES
('about_title', '学校紹介', 'about', '学校紹介セクションのタイトル'),
('about_lead', '自然豊かな徳之島で、子どもたちの可能性を最大限に引き出します', 'about', '学校紹介のリード文'),
('about_description', '本校は、鹿児島県大島郡徳之島町に位置し、豊かな自然環境の中で、児童一人ひとりの個性を大切にした教育を行っています。', 'about', '学校紹介の説明文（第1段落）'),
('about_description2', '地域と連携しながら、確かな学力、豊かな心、健やかな体をバランスよく育成し、未来を担う子どもたちの成長を支援しています。', 'about', '学校紹介の説明文（第2段落）'),
('about_btn', '詳しく見る', 'about', '学校紹介のボタンテキスト')
ON CONFLICT (setting_key) DO NOTHING;

-- 5. 教育の特色セクション (9フィールド)
INSERT INTO site_settings (setting_key, setting_value, setting_group, description) VALUES
('features_title', '教育の特色', 'features', '特色セクションのタイトル'),
('feature1_title', '確かな学力', 'features', '特色1のタイトル'),
('feature1_description', '基礎学力の定着と思考力・判断力・表現力の育成に力を入れています。', 'features', '特色1の説明'),
('feature2_title', '豊かな心', 'features', '特色2のタイトル'),
('feature2_description', '道徳教育や体験活動を通じて、思いやりの心と感謝の気持ちを育てます。', 'features', '特色2の説明'),
('feature3_title', '健やかな体', 'features', '特色3のタイトル'),
('feature3_description', '体育活動や外遊びを奨励し、基礎体力の向上を図ります。', 'features', '特色3の説明'),
('feature4_title', '地域との連携', 'features', '特色4のタイトル'),
('feature4_description', '地域の方々と協力しながら、地域に根ざした特色ある教育を推進します。', 'features', '特色4の説明')
ON CONFLICT (setting_key) DO NOTHING;

-- 6. 行事予定セクション (2フィールド)
INSERT INTO site_settings (setting_key, setting_value, setting_group, description) VALUES
('events_title', '年間行事', 'events', '行事予定セクションのタイトル'),
('events_link', 'すべて見る', 'events', '行事予定セクションのリンクテキスト')
ON CONFLICT (setting_key) DO NOTHING;

-- 7. フッター (8フィールド)
INSERT INTO site_settings (setting_key, setting_value, setting_group, description) VALUES
('footer_school_name', '徳之島町立亀津小学校', 'footer', 'フッターの学校名'),
('footer_address', '〒891-7101 鹿児島県大島郡徳之島町亀津7203', 'footer', 'フッターの住所'),
('footer_phone', '0997-82-0142', 'footer', 'フッターの電話番号'),
('footer_email', 'kametu-es@town.tokunoshima.lg.jp', 'footer', 'フッターのメールアドレス'),
('footer_access_title', 'アクセス', 'footer', 'フッターのアクセスタイトル'),
('footer_access1', '亀徳港から車で約10分', 'footer', 'フッターのアクセス方法1'),
('footer_access2', '徳之島空港から車で約15分', 'footer', 'フッターのアクセス方法2'),
('footer_copyright', '© 2024 徳之島町立亀津小学校 All Rights Reserved.', 'footer', 'フッターのコピーライト')
ON CONFLICT (setting_key) DO NOTHING;

-- サンプルブログ記事
INSERT INTO blog_posts (title, content, category, status, publish_date) VALUES
('令和6年度 運動会のご案内', '10月15日（日）に運動会を開催いたします。保護者の皆様のご来場をお待ちしております。', '行事', '公開', '2024-09-20 09:00:00'),
('夏休み明けの学校生活', '長い夏休みが終わり、子どもたちは元気に登校しています。2学期も充実した学校生活を送れるよう、職員一同サポートしてまいります。', 'お知らせ', '公開', '2024-09-01 10:00:00'),
('地域清掃活動を実施しました', '6年生が地域の清掃活動に参加しました。地域の方々と協力して、学校周辺をきれいにすることができました。', '活動報告', '公開', '2024-08-25 14:00:00'),
('水泳学習が始まりました', '今週から水泳学習が始まりました。安全に配慮しながら、楽しく水に親しむ活動を行っています。', '活動報告', '公開', '2024-07-10 11:00:00');

-- サンプル学校だより
INSERT INTO newsletters (title, issue_number, issue_date, description) VALUES
('亀津小だより 9月号', 9, '2024-09-01', '2学期がスタートしました。運動会に向けての取り組みをお知らせします。'),
('亀津小だより 8月号', 8, '2024-08-01', '夏休み中の学校の様子と、2学期に向けた準備についてお知らせします。'),
('亀津小だより 7月号', 7, '2024-07-01', '1学期の振り返りと夏休みの過ごし方についてお知らせします。');

-- サンプル行事予定
INSERT INTO events (title, event_date, category, description, location, target_grade) VALUES
('始業式', '2024-09-02', '秋の行事', '2学期の始業式を行います。', '体育館', '全学年'),
('運動会', '2024-10-15', '秋の行事', '秋の大運動会を開催します。雨天時は翌日に順延します。', '校庭', '全学年'),
('修学旅行', '2024-11-10', '秋の行事', '6年生が鹿児島市内を巡る修学旅行に出発します。', '鹿児島市内', '6年生'),
('学習発表会', '2024-12-05', '冬の行事', '各学年の学習成果を発表します。', '体育館', '全学年'),
('終業式', '2024-12-25', '冬の行事', '2学期の終業式を行います。', '体育館', '全学年'),
('マラソン大会', '2025-02-15', '冬の行事', '校内マラソン大会を開催します。', '学校周辺', '全学年');

-- アクセス統計の初期化
INSERT INTO access_stats (stat_type, year_month, page_name, count) VALUES
('total', 'total', 'all', 0),
('monthly', TO_CHAR(NOW(), 'YYYY-MM'), 'all', 0);
