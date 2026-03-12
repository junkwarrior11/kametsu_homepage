-- Visual Editorで正しく保存されない項目を修正
-- これをSupabase SQL Editorで実行してください

-- footer_phone を 0997-82-0034 に更新
UPDATE site_settings 
SET setting_value = '0997-82-0034', updated_at = NOW() 
WHERE setting_key = 'footer_phone';

-- footer_access1 を「徳之島空港より車で約25分」に更新
UPDATE site_settings 
SET setting_value = '徳之島空港より車で約25分', updated_at = NOW() 
WHERE setting_key = 'footer_access1';

-- footer_copyright を正しい形式に更新（ピリオドあり）
UPDATE site_settings 
SET setting_value = '© 2026 徳之島町立亀津小学校. All rights reserved.', updated_at = NOW() 
WHERE setting_key = 'footer_copyright';

-- 確認用クエリ
SELECT setting_key, setting_value, updated_at 
FROM site_settings 
WHERE setting_key IN ('header_top_phone', 'footer_phone', 'footer_address', 'footer_access1', 'footer_copyright')
ORDER BY setting_key;
