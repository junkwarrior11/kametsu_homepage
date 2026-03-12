// ========================================
// 管理ダッシュボード
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    loadDashboardStats();
    loadBlogConfig();
});

// 統計データを読み込む
async function loadDashboardStats() {
    try {
        // 現在の年月を取得
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        // ブログは外部サイトなので統計から除外
        const [newsletterRes, eventsRes] = await Promise.all([
            fetch('/api/tables/newsletters'),
            fetch('/api/tables/events')
        ]);
        
        const newsletterData = await newsletterRes.json();
        const eventsData = await eventsRes.json();
        
        // ブログステータスを表示
        loadBlogStatus();
        
        document.getElementById('newsletterCount').textContent = newsletterData.total || 0;
        document.getElementById('eventCount').textContent = eventsData.total || 0;
        
        // アクセス統計は一時的に0を表示
        document.getElementById('totalAccessCount').textContent = '0';
        document.getElementById('monthlyAccessCount').textContent = '0';
        
        console.log('⚠️ Access stats temporarily disabled. Create access_stats table in Supabase to enable.');
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// ブログステータスを読み込む
async function loadBlogStatus() {
    try {
        const response = await fetch('/api/tables/site_settings?setting_key=blog_external_url');
        const data = await response.json();
        
        if (data.data && data.data.length > 0 && data.data[0].setting_value) {
            document.getElementById('blogStatus').textContent = '設定済み';
        } else {
            document.getElementById('blogStatus').textContent = '未設定';
        }
    } catch (error) {
        console.error('Error loading blog status:', error);
        document.getElementById('blogStatus').textContent = '-';
    }
}

// ブログ設定を読み込む
async function loadBlogConfig() {
    const displayEl = document.getElementById('blogUrlDisplay');
    
    try {
        const response = await fetch('/api/tables/site_settings?setting_key=blog_external_url');
        const result = await response.json();
        
        if (result.data && result.data.length > 0 && result.data[0].setting_value) {
            const url = result.data[0].setting_value;
            displayEl.innerHTML = `<a href="${escapeHtml(url)}" target="_blank" style="color: #667eea; text-decoration: none;">${escapeHtml(url)}</a>`;
        } else {
            displayEl.textContent = 'URL未設定';
            displayEl.style.color = '#9ca3af';
        }
    } catch (error) {
        console.error('Error loading blog config:', error);
        displayEl.textContent = '読み込みに失敗しました';
        displayEl.style.color = '#ef4444';
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