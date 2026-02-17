// ========================================
// 共通ユーティリティ関数
// ========================================

// モバイルメニューの制御
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // メニュー外をクリックしたら閉じる
    document.addEventListener('click', function(e) {
        if (navMenu && navMenu.classList.contains('active')) {
            if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                navMenu.classList.toggle('active');
            }
        }
    });
});

// 日付フォーマット関数
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
}

// 日付フォーマット（月日のみ）
function formatDateShort(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
}

// 日付フォーマット（月）
function formatMonth(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    return `${month}月`;
}

// 日付フォーマット（日）
function formatDay(dateString) {
    const date = new Date(dateString);
    return date.getDate();
}

// テキストを切り詰める
function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text;
}

// カテゴリーの色を取得
function getCategoryColor(category) {
    const colors = {
        '行事': '#3b82f6',
        'お知らせ': '#10b981',
        '活動報告': '#f59e0b',
        'その他': '#6b7280'
    };
    return colors[category] || '#6b7280';
}

// HTMLエスケープ
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ローディング表示
function showLoading(element) {
    element.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #3b82f6;"></i>
            <p style="margin-top: 15px; color: #6b7280;">読み込み中...</p>
        </div>
    `;
}

// エラー表示
function showError(element, message) {
    element.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <i class="fas fa-exclamation-circle" style="font-size: 2rem; color: #ef4444;"></i>
            <p style="margin-top: 15px; color: #6b7280;">${escapeHtml(message)}</p>
        </div>
    `;
}

// データなし表示
function showEmpty(element, message) {
    element.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <i class="fas fa-inbox" style="font-size: 2rem; color: #9ca3af;"></i>
            <p style="margin-top: 15px; color: #6b7280;">${escapeHtml(message)}</p>
        </div>
    `;
}

// アクセスカウンターを初期化（全ページ共通）
document.addEventListener('DOMContentLoaded', async function() {
    // アクセスカウンター表示を初期化
    setTimeout(async () => {
        try {
            if (typeof window.getAccessStats === 'function') {
                const stats = await window.getAccessStats();
                
                const totalElement = document.getElementById('total-access');
                const monthlyElement = document.getElementById('monthly-access');
                
                if (totalElement) {
                    totalElement.textContent = stats.total.toLocaleString();
                }
                if (monthlyElement) {
                    monthlyElement.textContent = stats.monthly.toLocaleString();
                }
            }
        } catch (error) {
            console.error('Error loading access counter:', error);
        }
    }, 500); // アクセスカウンタースクリプト読み込み後
});