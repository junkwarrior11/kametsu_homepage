-- アクセスページの設定を追加
-- Visual Editorで編集可能にするための初期データ

-- ページヘッダー
INSERT INTO site_settings (setting_key, setting_value, setting_group, description) VALUES
('access_page_title', 'アクセス', 'access_page', 'アクセスページのタイトル'),
('access_page_subtitle', 'Access', 'access_page', 'アクセスページのサブタイトル')
ON CONFLICT (setting_key) DO NOTHING;

-- 学校情報
INSERT INTO site_settings (setting_key, setting_value, setting_group, description) VALUES
('access_school_name', '徳之島町立亀津小学校', 'access_info', '学校名'),
('access_address', '〒891-7101
鹿児島県大島郡徳之島町亀津1039', 'access_info', '所在地'),
('access_phone', '0997-82-0034', 'access_info', '電話番号'),
('access_fax', '0997-82-0143', 'access_info', 'FAX番号'),
('access_email', 'kametu-es@town.tokunoshima.lg.jp', 'access_info', 'メールアドレス')
ON CONFLICT (setting_key) DO NOTHING;

-- Google Map 埋め込みURL
-- 学校の住所でGoogle Mapを開き、「共有」→「地図を埋め込む」でURLを取得してください
INSERT INTO site_settings (setting_key, setting_value, setting_group, description) VALUES
('access_map_url', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3417.234!2d128.9234!3d27.7456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDQ0JzQ0LjIiTiAxMjjCsDU1JzI0LjIiRQ!5e0!3m2!1sja!2sjp!4v1234567890', 'access_map', 'Google Map埋め込みURL')
ON CONFLICT (setting_key) DO NOTHING;

-- アクセス方法（交通手段）
INSERT INTO site_settings (setting_key, setting_value, setting_group, description) VALUES
('access_method_title', '交通アクセス', 'access_methods', 'アクセス方法のタイトル'),
('access_method1_title', '徳之島空港から', 'access_methods', 'アクセス方法1のタイトル'),
('access_method1_text', '車で約25分', 'access_methods', 'アクセス方法1の内容'),
('access_method1_icon', 'fa-plane', 'access_methods', 'アクセス方法1のアイコン'),
('access_method2_title', '亀徳港から', 'access_methods', 'アクセス方法2のタイトル'),
('access_method2_text', '車で約10分', 'access_methods', 'アクセス方法2の内容'),
('access_method2_icon', 'fa-ship', 'access_methods', 'アクセス方法2のアイコン')
ON CONFLICT (setting_key) DO NOTHING;

-- 確認用クエリ
SELECT setting_key, setting_value, setting_group 
FROM site_settings 
WHERE setting_group LIKE 'access%'
ORDER BY setting_group, setting_key;
