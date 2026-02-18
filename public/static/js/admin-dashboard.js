// ========================================
// 管理ダッシュボード
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    loadDashboardStats();
    loadRecentPosts();
});

// 統計データを読み込む
async function loadDashboardStats() {
    try {
        // 現在の年月を取得
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        const [blogRes, newsletterRes, eventsRes, totalAccessRes, monthlyAccessRes] = await Promise.all([
            fetch('/api/tables/blog_posts'),
            fetch('/api/tables/newsletters'),
            fetch('/api/tables/events'),
            fetch('/api/tables/access_stats?stat_type=total&year_month=total&page_name=all&limit=1'),
            fetch(`/api/tables/access_stats?stat_type=monthly&year_month=${currentMonth}&page_name=all&limit=1`)
        ]);
        
        const blogData = await blogRes.json();
        const newsletterData = await newsletterRes.json();
        const eventsData = await eventsRes.json();
        const totalAccessData = await totalAccessRes.json();
        const monthlyAccessData = await monthlyAccessRes.json();
        
        document.getElementById('blogCount').textContent = blogData.total || 0;
        document.getElementById('newsletterCount').textContent = newsletterData.total || 0;
        document.getElementById('eventCount').textContent = eventsData.total || 0;
        
        // アクセス統計の表示
        const totalAccessCount = (totalAccessData.data && totalAccessData.data.length > 0) 
            ? totalAccessData.data[0].count 
            : 0;
        const monthlyAccessCount = (monthlyAccessData.data && monthlyAccessData.data.length > 0) 
            ? monthlyAccessData.data[0].count 
            : 0;
        
        document.getElementById('totalAccessCount').textContent = totalAccessCount.toLocaleString();
        document.getElementById('monthlyAccessCount').textContent = monthlyAccessCount.toLocaleString();
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// 最近のブログ記事を読み込む
async function loadRecentPosts() {
    const container = document.getElementById('recentPosts');
    
    try {
        const response = await fetch('/api/tables/blog_posts?limit=5&sort=-created_at');
        const result = await response.json();
        const posts = result.data || [];
        
        if (posts.length === 0) {
            container.innerHTML = '<p style="color: #9ca3af;">まだ記事がありません</p>';
            return;
        }
        
        container.innerHTML = posts.map(post => `
            <div class="dashboard-item">
                <div class="dashboard-item-info">
                    <h4>${escapeHtml(post.title)}</h4>
                    <p>${escapeHtml(post.category)} | ${escapeHtml(post.author)}</p>
                </div>
                <span class="dashboard-item-date">${formatDate(post.publish_date)}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading recent posts:', error);
        container.innerHTML = '<p style="color: #ef4444;">読み込みに失敗しました</p>';
    }
}

// ユーティリティ関数
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}