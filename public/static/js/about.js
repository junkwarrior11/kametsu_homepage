// ========================================
// 学校概要ページ - データ読み込み
// ========================================

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // データを読み込む（完了を待つ）
        await loadDynamicContent();
        
        // すべてのデータ読み込み完了後にローディング画面を非表示
        setTimeout(() => {
            hideLoadingScreen();
        }, 300);
        
    } catch (error) {
        console.error('初期読み込みエラー:', error);
        // エラーが発生してもローディング画面は非表示にする
        setTimeout(() => {
            hideLoadingScreen();
        }, 300);
    }
});

// 動的コンテンツを読み込む（ページヘッダー + 共通ヘッダー・フッター）
async function loadDynamicContent() {
    try {
        const cacheTime = Math.floor(Date.now() / (1000 * 60 * 5));
        const response = await fetch('/api/tables/site_settings?limit=100&_=' + cacheTime);
        const result = await response.json();
        
        if (result.data) {
            const settings = {};
            result.data.forEach(item => {
                settings[item.setting_key] = item.setting_value;
            });
            
            // 共通ヘッダー
            updateTextContent('header-school-name', settings.header_school_name);
            updateTextContent('header-motto', settings.header_motto);
            updateTextContent('header-top-phone', settings.header_top_phone);
            updateTextContent('header-top-email', settings.header_top_email);
            
            // ページヘッダー
            updateTextContent('about-page-title', settings.about_page_title);
            updateTextContent('about-page-subtitle', settings.about_page_subtitle);
            
            // 学校の歴史セクション
            updateTextContent('about-history-title', settings.about_history_title);
            updateTextContent('about-history-text1', settings.about_history_text1);
            updateTextContent('about-history-text2', settings.about_history_text2);
            
            // 校長挨拶セクション
            updateTextContent('about-principal-title', settings.about_principal_title);
            updateImageSrc('about-principal-photo', settings.about_principal_photo);
            updateTextContent('about-principal-text1', settings.about_principal_text1);
            updateTextContent('about-principal-text2', settings.about_principal_text2);
            updateTextContent('about-principal-signature', settings.about_principal_signature);
            
            // 教育理念セクション
            updateTextContent('about-philosophy-title', settings.about_philosophy_title);
            updateTextContent('about-philosophy-motto', settings.about_philosophy_motto);
            updateTextContent('about-philosophy-text', settings.about_philosophy_text);
            
            // 教育目標カード
            updateIconClass('about-goal1-icon', settings.about_goal1_icon);
            updateTextContent('about-goal1-title', settings.about_goal1_title);
            updateTextContent('about-goal1-text', settings.about_goal1_text);
            updateIconClass('about-goal2-icon', settings.about_goal2_icon);
            updateTextContent('about-goal2-title', settings.about_goal2_title);
            updateTextContent('about-goal2-text', settings.about_goal2_text);
            updateIconClass('about-goal3-icon', settings.about_goal3_icon);
            updateTextContent('about-goal3-title', settings.about_goal3_title);
            updateTextContent('about-goal3-text', settings.about_goal3_text);
            updateIconClass('about-goal4-icon', settings.about_goal4_icon);
            updateTextContent('about-goal4-title', settings.about_goal4_title);
            updateTextContent('about-goal4-text', settings.about_goal4_text);
            
            // 教育目標カード5（オプション）
            if (settings.about_goal5_title && settings.about_goal5_title.trim() !== '') {
                updateIconClass('about-goal5-icon', settings.about_goal5_icon);
                updateTextContent('about-goal5-title', settings.about_goal5_title);
                updateTextContent('about-goal5-text', settings.about_goal5_text);
                document.getElementById('about-goal5-card').style.display = 'flex';
            }
            
            // 教育目標カード6（オプション）
            if (settings.about_goal6_title && settings.about_goal6_title.trim() !== '') {
                updateIconClass('about-goal6-icon', settings.about_goal6_icon);
                updateTextContent('about-goal6-title', settings.about_goal6_title);
                updateTextContent('about-goal6-text', settings.about_goal6_text);
                document.getElementById('about-goal6-card').style.display = 'flex';
            }
            
            // 学校情報セクション
            updateTextContent('about-info-title', settings.about_info_title);
            updateTextContent('about-info-name', settings.about_info_name);
            updateTextContent('about-info-address', settings.about_info_address);
            updateTextContent('about-info-phone', settings.about_info_phone);
            updateTextContent('about-info-fax', settings.about_info_fax);
            updateTextContent('about-info-founded', settings.about_info_founded);
            updateTextContent('about-info-students', settings.about_info_students);
            updateTextContent('about-info-classes', settings.about_info_classes);
            
            // 共通フッター
            updateTextContent('footer-school-name', settings.footer_school_name);
            updateHTML('footer-address', settings.footer_address);
            updateTextContent('footer-phone', settings.footer_phone);
            updateTextContent('footer-email', settings.footer_email);
            updateTextContent('footer-access-title', settings.footer_access_title);
            updateTextContent('footer-access1', settings.footer_access1);
            updateTextContent('footer-access2', settings.footer_access2);
            updateTextContent('footer-copyright', settings.footer_copyright);
        }
    } catch (error) {
        console.error('Failed to load dynamic content:', error);
    }
}

// テキストコンテンツを更新するヘルパー関数
function updateTextContent(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element) return;
    if (value !== undefined && value !== null) {
        element.textContent = value;
    }
}

// HTMLコンテンツを更新するヘルパー関数
function updateHTML(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element) return;
    if (value !== undefined && value !== null) {
        element.innerHTML = value;
    }
}

// 画像のsrcを更新するヘルパー関数
function updateImageSrc(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element) return;
    if (value !== undefined && value !== null && value !== '') {
        element.src = value;
    }
}

// アイコンのクラスを更新するヘルパー関数
function updateIconClass(elementId, iconClass) {
    const element = document.getElementById(elementId);
    if (!element) return;
    if (iconClass !== undefined && iconClass !== null && iconClass !== '') {
        // 既存のfaクラスを削除
        element.className = '';
        // 新しいクラスを追加
        element.className = 'fas ' + iconClass;
    }
}

// ローディング画面を非表示にする
function hideLoadingScreen() {
    const contentWrapper = document.getElementById('contentWrapper');
    if (contentWrapper) {
        contentWrapper.classList.add('loaded');
    }
    
    const pageLoading = document.getElementById('pageLoading');
    if (pageLoading) {
        pageLoading.style.opacity = '0';
        setTimeout(() => {
            pageLoading.style.display = 'none';
        }, 300);
    }
    
    document.body.classList.remove('loading');
}
