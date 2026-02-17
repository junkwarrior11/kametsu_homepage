// ========================================
// ブログページ - データ読み込み
// ========================================

let allPosts = [];
let filteredPosts = [];
let currentPage = 1;
const postsPerPage = 9;

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // データを並行で読み込む（完了を待つ）
        await Promise.all([
            loadDynamicContent(),
            loadBlogPosts()
        ]);
        setupBlogFilters();
        
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
            updateTextContent('blog-page-title', settings.blog_page_title);
            updateTextContent('blog-page-subtitle', settings.blog_page_subtitle);
            
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

// ブログ記事を読み込む
async function loadBlogPosts() {
    const blogGrid = document.getElementById('blogGrid');
    
    if (!blogGrid) return;
    
    showLoading(blogGrid);
    
    try {
        const response = await fetch('/api/tables/blog_posts?sort=-publish_date&status=公開');
        
        if (!response.ok) {
            throw new Error('データの取得に失敗しました');
        }
        
        const result = await response.json();
        allPosts = result.data || [];
        filteredPosts = [...allPosts];
        
        if (allPosts.length === 0) {
            showEmpty(blogGrid, 'まだブログ記事がありません');
            return;
        }
        
        displayBlogPosts();
    } catch (error) {
        console.error('Error loading blog posts:', error);
        showError(blogGrid, 'ブログ記事の読み込みに失敗しました');
    }
}

// ブログ記事を表示
function displayBlogPosts() {
    const blogGrid = document.getElementById('blogGrid');
    const pagination = document.getElementById('pagination');
    
    // ページネーション計算
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const postsToDisplay = filteredPosts.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    
    // 記事を表示
    blogGrid.innerHTML = postsToDisplay.map(post => `
        <div class="news-card">
            <div class="news-card-image">
                <img src="${escapeHtml(post.featured_image || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800')}" 
                     alt="${escapeHtml(post.title)}">
            </div>
            <div class="news-card-content">
                <div class="news-card-meta">
                    <span class="news-card-category">${escapeHtml(post.category || 'その他')}</span>
                    <span>${formatDate(post.publish_date)}</span>
                </div>
                <h3 class="news-card-title">${escapeHtml(post.title)}</h3>
                <p class="news-card-excerpt">${truncateText(escapeHtml(post.content), 120)}</p>
                <a href="blog-detail.html?id=${post.id}" class="btn btn-outline" style="margin-top: 15px;">続きを読む</a>
            </div>
        </div>
    `).join('');
    
    // ページネーションを表示
    if (totalPages > 1) {
        let paginationHTML = '';
        
        // 前へボタン
        paginationHTML += `
            <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i> 前へ
            </button>
        `;
        
        // ページ番号
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <button onclick="changePage(${i})" class="${i === currentPage ? 'active' : ''}">
                    ${i}
                </button>
            `;
        }
        
        // 次へボタン
        paginationHTML += `
            <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
                次へ <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        pagination.innerHTML = paginationHTML;
    } else {
        pagination.innerHTML = '';
    }
}

// ページ変更
function changePage(page) {
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    displayBlogPosts();
    
    // ページトップにスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// フィルター機能のセットアップ
function setupBlogFilters() {
    const filterButtons = document.querySelectorAll('.blog-filter .filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // アクティブ状態を切り替え
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            filterBlogByCategory(category);
        });
    });
}

// カテゴリーでフィルター
function filterBlogByCategory(category) {
    if (category === 'all') {
        filteredPosts = [...allPosts];
    } else {
        filteredPosts = allPosts.filter(post => post.category === category);
    }
    
    currentPage = 1;
    displayBlogPosts();
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

// グローバルスコープに関数を公開
window.changePage = changePage;