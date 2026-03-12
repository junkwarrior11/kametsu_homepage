-- 電話番号の更新
UPDATE site_settings SET setting_value = '0997-82-0034' WHERE setting_key = 'header_top_phone';
UPDATE site_settings SET setting_value = '0997-82-0034' WHERE setting_key = 'footer_phone';

-- 住所の更新
UPDATE site_settings SET setting_value = '〒891-7101 鹿児島県大島郡徳之島町亀津1039' WHERE setting_key = 'footer_address';

-- アクセス方法1の更新
UPDATE site_settings SET setting_value = '徳之島空港より車で約25分' WHERE setting_key = 'footer_access1';

-- コピーライトの更新
UPDATE site_settings SET setting_value = '© 2026 徳之島町立亀津小学校. All rights reserved.' WHERE setting_key = 'footer_copyright';
