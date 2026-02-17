// ========================================
// 共通ページ機能 - 動的コンテンツ読み込み
// ========================================

// 共通ヘッダー・フッターを読み込む（全ページ共通）
async function loadCommonHeaderFooter() {
    try {
        const response = await fetch('tables/site_settings?limit=100&_=' + Date.now());
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
        console.error('Failed to load common header/footer:', error);
    }
}

// 動的コンテンツを読み込む（ページヘッダー用）
async function loadPageDynamicContent(pagePrefix) {
    try {
        const response = await fetch('tables/site_settings?limit=100&_=' + Date.now());
        const result = await response.json();
        
        if (result.data) {
            const settings = {};
            result.data.forEach(item => {
                settings[item.setting_key] = item.setting_value;
            });
            
            // ページヘッダー
            updateTextContent(`${pagePrefix}-page-title`, settings[`${pagePrefix}_page_title`]);
            updateTextContent(`${pagePrefix}-page-subtitle`, settings[`${pagePrefix}_page_subtitle`]);
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
