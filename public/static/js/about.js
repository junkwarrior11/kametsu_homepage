// ========================================
// 学校概要ページ - データ読み込み
// ========================================

document.addEventListener('DOMContentLoaded', async function() {
    await loadAboutPageContent();
});

/**
 * 学校概要ページのコンテンツを読み込む
 */
async function loadAboutPageContent() {
    try {
        // キャッシュバスター付きでAPI呼び出し
        const cacheBuster = Date.now();
        const response = await fetch(`/api/tables/site_settings?limit=100&_=${cacheBuster}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch settings');
        }
        
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            console.warn('No settings data found');
            return;
        }
        
        // 設定データをオブジェクトに変換
        const settings = {};
        data.data.forEach(item => {
            settings[item.setting_key] = item.setting_value;
        });
        
        // ページヘッダー
        updateTextContent('about-page-title', settings.about_page_title);
        updateTextContent('about-page-subtitle', settings.about_page_subtitle);
        
        // 学校の歴史
        updateTextContent('about-history-title', settings.about_history_title);
        updateTextContent('about-history-text1', settings.about_history_text1);
        updateTextContent('about-history-text2', settings.about_history_text2);
        
        // 校長挨拶
        updateTextContent('about-principal-title', settings.about_principal_title);
        updateImageSrc('about-principal-photo', settings.about_principal_photo);
        updateTextContent('about-principal-text1', settings.about_principal_text1);
        updateTextContent('about-principal-text2', settings.about_principal_text2);
        updateTextContent('about-principal-signature', settings.about_principal_signature);
        
        // 教育理念
        updateTextContent('about-philosophy-title', settings.about_philosophy_title);
        updateTextContent('about-philosophy-motto', settings.about_philosophy_motto);
        updateTextContent('about-philosophy-text', settings.about_philosophy_text);
        
        // 教育目標
        updateTextContent('about-goal1-title', settings.about_goal1_title);
        updateTextContent('about-goal1-text', settings.about_goal1_text);
        updateIconClass('about-goal1-icon', settings.about_goal1_icon);
        
        updateTextContent('about-goal2-title', settings.about_goal2_title);
        updateTextContent('about-goal2-text', settings.about_goal2_text);
        updateIconClass('about-goal2-icon', settings.about_goal2_icon);
        
        updateTextContent('about-goal3-title', settings.about_goal3_title);
        updateTextContent('about-goal3-text', settings.about_goal3_text);
        updateIconClass('about-goal3-icon', settings.about_goal3_icon);
        
        // 学校情報
        updateTextContent('about-info-students', settings.about_info_students);
        updateTextContent('about-info-teachers', settings.about_info_teachers);
        updateTextContent('about-info-classes', settings.about_info_classes);
        updateTextContent('about-info-established', settings.about_info_established);
        
        console.log('✅ About page content loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading about page content:', error);
    }
}

/**
 * テキストコンテンツを更新
 */
function updateTextContent(elementId, value) {
    const element = document.getElementById(elementId);
    if (element && value) {
        element.textContent = value;
    }
}

/**
 * 画像のsrc属性を更新
 */
function updateImageSrc(elementId, value) {
    const element = document.getElementById(elementId);
    if (element && value) {
        element.src = value;
    }
}

/**
 * アイコンクラスを更新
 */
function updateIconClass(elementId, iconClass) {
    const element = document.getElementById(elementId);
    if (element && iconClass) {
        element.className = `fas ${iconClass}`;
    }
}
