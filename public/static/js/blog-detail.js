// ========================================
// ブログ詳細ページ - データ読み込み
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    loadBlogDetail();
});

// URLパラメータから記事IDを取得
function getPostIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// ブログ記事詳細を読み込む
async function loadBlogDetail() {
    const articleContainer = document.getElementById('blogArticle');
    
    if (!articleContainer) return;
    
    const postId = getPostIdFromUrl();
    
    if (!postId) {
        articleContainer.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: #ef4444;"></i>
                <h2 style="margin-top: 20px; color: #1f2937;">記事が見つかりません</h2>
                <p style="margin-top: 10px; color: #6b7280;">指定された記事は存在しないか、削除された可能性があります。</p>
                <a href="blog.html" class="btn btn-primary" style="margin-top: 30px;">ブログ一覧に戻る</a>
            </div>
        `;
        return;
    }
    
    showLoading(articleContainer);
    
    try {
        const response = await fetch(`tables/blog_posts/${postId}`);
        
        if (!response.ok) {
            throw new Error('記事の取得に失敗しました');
        }
        
        const post = await response.json();
        
        // タイトルを更新
        document.title = `${post.title} - ○○小学校`;
        
        // 記事を表示
        articleContainer.innerHTML = `
            <div class="article-header">
                <div class="article-meta">
                    <span class="article-category">${escapeHtml(post.category || 'その他')}</span>
                    <span>${formatDate(post.publish_date)}</span>
                    <span><i class="fas fa-user"></i> ${escapeHtml(post.author)}</span>
                </div>
                <h1 class="article-title">${escapeHtml(post.title)}</h1>
            </div>
            ${post.featured_image ? `
                <div class="article-image">
                    <img src="${escapeHtml(post.featured_image)}" alt="${escapeHtml(post.title)}">
                </div>
            ` : ''}
            <div class="article-content">
                ${formatContent(post.content)}
            </div>
        `;
    } catch (error) {
        console.error('Error loading blog detail:', error);
        articleContainer.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: #ef4444;"></i>
                <h2 style="margin-top: 20px; color: #1f2937;">記事の読み込みに失敗しました</h2>
                <p style="margin-top: 10px; color: #6b7280;">もう一度お試しください。</p>
                <a href="blog.html" class="btn btn-primary" style="margin-top: 30px;">ブログ一覧に戻る</a>
            </div>
        `;
    }
}

// コンテンツのフォーマット（改行を<br>に変換）
function formatContent(content) {
    return escapeHtml(content).split('\n').map(line => `<p>${line}</p>`).join('');
}