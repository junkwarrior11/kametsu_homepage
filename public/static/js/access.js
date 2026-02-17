// ========================================
// アクセスページ - 動的コンテンツ読み込み
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
        const response = await fetch('tables/site_settings?limit=100&_=' + cacheTime);
        const result = await response.json();
        
        if (result.data) {
            const settings = {};
            result.data.forEach(item => {
                settings[item.setting_key] = item.setting_value;
            });
            
            // 共通ヘッダー（全ページ共通）
            updateTextContent('header-school-name', settings.header_school_name);
            updateTextContent('header-motto', settings.header_motto);
            updateTextContent('header-top-phone', settings.header_top_phone);
            updateTextContent('header-top-email', settings.header_top_email);
            
            // ページヘッダー
            updateTextContent('access-page-title', settings.access_page_title);
            updateTextContent('access-page-subtitle', settings.access_page_subtitle);
            
            // アクセスページ固有コンテンツ
            updateTextContent('access-school-name', settings.access_school_name);
            updateHTML('access-address', settings.access_address);
            updateTextContent('access-phone', settings.access_phone);
            updateTextContent('access-fax', settings.access_fax);
            updateTextContent('access-email', settings.access_email);
            updateTextContent('access-map-text', settings.access_map_text);
            updateTextContent('access-map-note', settings.access_map_note);
            
            // 共通フッター（全ページ共通）
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
