-- 学校の歴史と校長挨拶のテキストボックスを1つに統合

-- 1. 既存のtext1とtext2を統合した新しいフィールドを作成
-- 学校の歴史
INSERT INTO site_settings (setting_key, setting_value, setting_group, updated_at)
VALUES (
    'about_history_text',
    '亀津小学校は、徳之島町の中心部、亀津地区に位置する歴史ある小学校です。徳之島は奈良時代からの歴史を持ち、豊かな自然と独自の文化が息づく島です。本校は、そのような地域の特性を活かしながら、長きにわたり地域の教育の中心として歩み続けてきました。

島の伝統と文化を大切にしながら、時代の変化に対応した教育を実践し、地域と共に成長する学校づくりを進めています。',
    'about',
    NOW()
)
ON CONFLICT (setting_key) 
DO UPDATE SET 
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

-- 校長挨拶
INSERT INTO site_settings (setting_key, setting_value, setting_group, updated_at)
VALUES (
    'about_principal_text',
    '亀津小学校は、徳之島の豊かな自然と温かい地域の中で、子どもたちの成長を支えています。本校では「心豊かに、たくましく」を教育目標に、子どもたち一人ひとりが自分らしく成長できるよう支援しています。

保護者の皆様、地域の皆様との連携を大切にしながら、島の未来を担う子どもたちを育てていきたいと思います。',
    'about',
    NOW()
)
ON CONFLICT (setting_key) 
DO UPDATE SET 
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

-- 2. 古いフィールド（text1, text2）を削除（オプション）
-- 注意: Visual Editorや他の機能で使用されていないことを確認してから実行してください
-- DELETE FROM site_settings WHERE setting_key IN (
--     'about_history_text1',
--     'about_history_text2',
--     'about_principal_text1',
--     'about_principal_text2'
-- );

-- 3. 確認用クエリ
SELECT setting_key, 
       LEFT(setting_value, 50) as value_preview,
       setting_group,
       updated_at
FROM site_settings
WHERE setting_key IN (
    'about_history_text',
    'about_history_text1',
    'about_history_text2',
    'about_principal_text',
    'about_principal_text1',
    'about_principal_text2'
)
ORDER BY setting_key;
