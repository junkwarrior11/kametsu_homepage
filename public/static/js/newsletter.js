// ========================================
// 学校だよりページ - データ読み込み
// ========================================

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // データを並行で読み込む（完了を待つ）
        await Promise.all([
            loadDynamicContent(),
            loadNewsletters()
        ]);
        
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
            
            // 共通ヘッダー（全ページ共通）
            updateTextContent('header-school-name', settings.header_school_name);
            updateTextContent('header-motto', settings.header_motto);
            updateTextContent('header-top-phone', settings.header_top_phone);
            updateTextContent('header-top-email', settings.header_top_email);
            
            // ページヘッダー
            updateTextContent('newsletter-page-title', settings.newsletter_page_title);
            updateTextContent('newsletter-page-subtitle', settings.newsletter_page_subtitle);
            
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

// 学校だよりを読み込む
async function loadNewsletters() {
    const newsletterGrid = document.getElementById('newsletterGrid');
    
    if (!newsletterGrid) return;
    
    showLoading(newsletterGrid);
    
    try {
        const response = await fetch('/api/tables/newsletters?sort=-issue_date');
        
        if (!response.ok) {
            throw new Error('データの取得に失敗しました');
        }
        
        const result = await response.json();
        const newsletters = result.data || [];
        
        if (newsletters.length === 0) {
            showEmpty(newsletterGrid, 'まだ学校だよりがありません');
            return;
        }
        
        newsletterGrid.innerHTML = newsletters.map(newsletter => {
            const fileUrl = newsletter.file_url || '';
            const fileName = newsletter.file_name || 'newsletter.pdf';
            
            // Base64データの場合とURLの場合で処理を分ける
            const isBase64 = fileUrl.startsWith('data:application/pdf');
            
            return `
                <div class="newsletter-card">
                    <div class="newsletter-icon">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <h3>${escapeHtml(newsletter.title)}</h3>
                    <p class="issue-info">
                        第${newsletter.issue_number}号 | ${formatDate(newsletter.issue_date)}
                    </p>
                    <p>${escapeHtml(newsletter.description)}</p>
                    <a href="${escapeHtml(fileUrl)}" 
                       class="btn btn-primary" 
                       download="${escapeHtml(fileName)}"
                       target="_blank">
                        <i class="fas fa-download"></i> PDFをダウンロード
                    </a>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading newsletters:', error);
        showError(newsletterGrid, '学校だよりの読み込みに失敗しました');
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