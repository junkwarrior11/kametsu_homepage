// ========================================
// アクセスカウンター（一時的に無効化中）
// ========================================

// TODO: access_stats テーブルを作成後に有効化する
console.log('⚠️ Access counter is temporarily disabled. Please create access_stats table in Supabase.');

// ページ読み込み時にアクセスを記録
(function() {
    // 一時的に無効化
    return;
    
    // 管理画面は除外
    if (window.location.pathname.includes('admin-')) {
        return;
    }
    
    // アクセスを記録
    recordAccess();
})();

/**
 * アクセスを記録する
 */
async function recordAccess() {
    try {
        const pageName = getPageName();
        const now = new Date();
        const yearMonth = formatYearMonth(now);
        
        // アクセスログを記録
        const logData = {
            page_url: window.location.pathname,
            page_name: pageName,
            access_date: now.toISOString(),
            year_month: yearMonth,
            user_agent: navigator.userAgent,
            ip_hash: await getIpHash()
        };
        
        await fetch('/api/tables/access_logs', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(logData)
        });
        
        // 統計を更新
        await updateStats(pageName, yearMonth);
        
    } catch (error) {
        console.error('Access recording error:', error);
    }
}

/**
 * 統計情報を更新する
 */
async function updateStats(pageName, yearMonth) {
    try {
        // 総アクセス数を更新
        await incrementStat('total', 'total', 'all');
        await incrementStat('total', 'total', pageName);
        
        // 月間アクセス数を更新
        await incrementStat('monthly', yearMonth, 'all');
        await incrementStat('monthly', yearMonth, pageName);
        
    } catch (error) {
        console.error('Stats update error:', error);
    }
}

/**
 * 統計カウントをインクリメント
 */
async function incrementStat(statType, yearMonth, pageName) {
    try {
        // 既存の統計を取得
        const query = `stat_type=${statType}&year_month=${yearMonth}&page_name=${pageName}`;
        const response = await fetch(`/api/tables/access_stats?${query}&limit=1`);
        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
            // 既存レコードを更新
            const stat = result.data[0];
            await fetch(`/api/tables/access_stats/${stat.id}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ count: stat.count + 1 })
            });
        } else {
            // 新規レコードを作成
            await fetch('/api/tables/access_stats', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    stat_type: statType,
                    year_month: yearMonth,
                    page_name: pageName,
                    count: 1
                })
            });
        }
    } catch (error) {
        console.error('Increment stat error:', error);
    }
}

/**
 * ページ名を取得
 */
function getPageName() {
    const path = window.location.pathname;
    const pageMap = {
        '/index.html': 'ホーム',
        '/': 'ホーム',
        '/about.html': '学校概要',
        '/events.html': '行事予定',
        '/newsletter.html': '学校だより',
        '/blog.html': 'ブログ',
        '/blog-detail.html': 'ブログ詳細',
        '/access.html': 'アクセス',
        '/contact.html': 'お問い合わせ'
    };
    
    return pageMap[path] || 'その他';
}

/**
 * 年月をフォーマット (YYYY-MM)
 */
function formatYearMonth(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

/**
 * IPアドレスのハッシュを生成（プライバシー保護）
 */
async function getIpHash() {
    try {
        // ブラウザのフィンガープリントを使用（簡易版）
        const fingerprint = navigator.userAgent + navigator.language + screen.width + screen.height;
        
        // 簡易ハッシュ生成
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        return 'hash_' + Math.abs(hash).toString(36);
    } catch (error) {
        return 'unknown';
    }
}

/**
 * アクセス統計を取得（グローバル関数）
 */
async function getAccessStats() {
    try {
        // 総アクセス数を取得
        const totalResponse = await fetch('/api/tables/access_stats?stat_type=total&year_month=total&page_name=all&limit=1');
        const totalResult = await totalResponse.json();
        const totalCount = (totalResult.data && totalResult.data.length > 0) ? totalResult.data[0].count : 0;
        
        // 今月のアクセス数を取得
        const now = new Date();
        const currentMonth = formatYearMonth(now);
        const monthlyResponse = await fetch(`tables/access_stats?stat_type=monthly&year_month=${currentMonth}&page_name=all&limit=1`);
        const monthlyResult = await monthlyResponse.json();
        const monthlyCount = (monthlyResult.data && monthlyResult.data.length > 0) ? monthlyResult.data[0].count : 0;
        
        return {
            total: totalCount,
            monthly: monthlyCount,
            month: currentMonth
        };
    } catch (error) {
        console.error('Get stats error:', error);
        return { total: 0, monthly: 0, month: '' };
    }
}

// グローバルに公開
window.getAccessStats = getAccessStats;
