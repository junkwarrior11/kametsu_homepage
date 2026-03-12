// ========================================
// 管理ダッシュボード
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    loadDashboardStats();
    loadBlogConfig();
    loadActivityLog();
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

// アクティビティログを読み込む
async function loadActivityLog() {
    const container = document.getElementById('activityLog');
    
    try {
        // activity_logs テーブルから最新10件を取得
        const response = await fetch('/api/tables/activity_logs?limit=10&sort=-created_at');
        const result = await response.json();
        
        if (!result.data || result.data.length === 0) {
            container.innerHTML = '<p style="color: #9ca3af; padding: 20px; text-align: center;">まだ変更履歴がありません</p>';
            return;
        }
        
        container.innerHTML = result.data.map(log => {
            const actionIcon = getActionIcon(log.action);
            const actionClass = log.action.toLowerCase();
            const timeAgo = getTimeAgo(log.created_at);
            
            return `
                <div class="activity-item ${actionClass}">
                    <div class="activity-icon ${actionClass}">
                        <i class="fas ${actionIcon}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">${escapeHtml(log.title)}</div>
                        <div class="activity-description">${escapeHtml(log.description || '')}</div>
                        <div class="activity-meta">
                            <span>
                                <i class="fas fa-user"></i>
                                ${escapeHtml(log.user_name || '管理者')}
                            </span>
                            <span>
                                <i class="fas fa-clock"></i>
                                ${timeAgo}
                            </span>
                            <span>
                                <i class="fas fa-tag"></i>
                                ${escapeHtml(log.category || '一般')}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading activity log:', error);
        // テーブルが存在しない場合のフォールバック
        container.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #6b7280;">
                <i class="fas fa-info-circle" style="font-size: 2rem; color: #9ca3af; margin-bottom: 10px;"></i>
                <p>変更履歴機能を有効にするには、データベースに activity_logs テーブルを作成してください。</p>
                <details style="margin-top: 15px; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto;">
                    <summary style="cursor: pointer; color: #667eea; font-weight: 600;">テーブル作成SQL</summary>
                    <pre style="background: #f3f4f6; padding: 15px; border-radius: 6px; overflow-x: auto; margin-top: 10px; font-size: 0.85rem;">
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete'
    category VARCHAR(100) NOT NULL, -- 'blog', 'newsletter', 'event', 'page', 'settings'
    title TEXT NOT NULL,
    description TEXT,
    user_name VARCHAR(100),
    user_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_category ON activity_logs(category);
                    </pre>
                </details>
            </div>
        `;
    }
}

// アクションに対応するアイコンを取得
function getActionIcon(action) {
    const icons = {
        'create': 'fa-plus-circle',
        'update': 'fa-edit',
        'delete': 'fa-trash-alt'
    };
    return icons[action.toLowerCase()] || 'fa-circle';
}

// 相対時間を取得
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'たった今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    
    return formatDate(dateString);
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