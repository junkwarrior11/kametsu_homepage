-- 学校概要ページの設定を追加
-- ページヘッダー
INSERT INTO site_settings (setting_key, setting_value, setting_group, description) VALUES
('about_page_title', '学校概要', 'about_page', '学校概要ページのタイトル'),
('about_page_subtitle', 'About Us', 'about_page', '学校概要ページのサブタイトル')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

-- 学校の歴史
INSERT INTO site_settings (setting_key, setting_value, setting_group, description) VALUES
('about_history_title', '学校の歴史', 'about_history', '学校の歴史セクションのタイトル'),
('about_history_text1', '亀津小学校は、徳之島町の中心部、亀津地区に位置する歴史ある小学校です。徳之島は奈良時代からの歴史を持ち、豊かな自然と独自の文化が息づく島です。本校は、そのような地域の特性を活かしながら、長きにわたり地域の教育の中心として歩み続けてきました。', 'about_history', '学校の歴史（第1段落）'),
('about_history_text2', '島の伝統と文化を大切にしながら、時代の変化に対応した教育を実践し、地域と共に成長する学校づくりを進めています。', 'about_history', '学校の歴史（第2段落）')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

-- 校長挨拶
INSERT INTO site_settings (setting_key, setting_value, setting_group, description) VALUES
('about_principal_title', '校長挨拶', 'about_principal', '校長挨拶セクションのタイトル'),
('about_principal_photo', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300', 'about_principal', '校長先生の写真URL'),
('about_principal_text1', '亀津小学校は、徳之島の豊かな自然と温かい地域の中で、子どもたちの成長を支えています。本校では「心豊かに、たくましく」を教育目標に、子どもたち一人ひとりが自分らしく成長できるよう支援しています。', 'about_principal', '校長挨拶（第1段落）'),
('about_principal_text2', '保護者の皆様、地域の皆様との連携を大切にしながら、島の未来を担う子どもたちを育てていきたいと思います。', 'about_principal', '校長挨拶（第2段落）'),
('about_principal_signature', '校長', 'about_principal', '校長の署名')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

-- 教育理念
INSERT INTO site_settings (setting_key, setting_value, setting_group, description) VALUES
('about_philosophy_title', '教育理念', 'about_philosophy', '教育理念セクションのタイトル'),
('about_philosophy_motto', '「心豊かに、たくましく」', 'about_philosophy', '教育理念のモットー'),
('about_philosophy_text', '知育・徳育・体育の調和のとれた教育を実践しています。基礎学力の定着はもちろん、徳之島の豊かな自然や文化を活かした体験学習を通じて、思いやりや協調性、郷土愛を育むことを大切にしています。', 'about_philosophy', '教育理念の説明文')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

-- 教育目標
INSERT INTO site_settings (setting_key, setting_value, setting_group, description) VALUES
('about_goal1_title', '知育', 'about_goals', '教育目標1のタイトル'),
('about_goal1_text', '基礎学力の定着と、自ら学ぶ力を育てます', 'about_goals', '教育目標1の説明'),
('about_goal1_icon', 'fa-book', 'about_goals', '教育目標1のアイコン'),
('about_goal2_title', '徳育', 'about_goals', '教育目標2のタイトル'),
('about_goal2_text', '思いやりの心と、豊かな人間性を育てます', 'about_goals', '教育目標2の説明'),
('about_goal2_icon', 'fa-heart', 'about_goals', '教育目標2のアイコン'),
('about_goal3_title', '体育', 'about_goals', '教育目標3のタイトル'),
('about_goal3_text', '健やかな体と、たくましく生きる力を育てます', 'about_goals', '教育目標3の説明'),
('about_goal3_icon', 'fa-running', 'about_goals', '教育目標3のアイコン')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

-- 学校情報
INSERT INTO site_settings (setting_key, setting_value, setting_group, description) VALUES
('about_info_students', '約200名', 'about_info', '児童数'),
('about_info_teachers', '約25名', 'about_info', '教職員数'),
('about_info_classes', '12クラス', 'about_info', 'クラス数'),
('about_info_established', '明治時代', 'about_info', '創立年')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;
