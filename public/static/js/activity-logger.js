// ========================================
// アクティビティログ記録
// ========================================

/**
 * アクティビティログを記録
 * @param {string} action - 'create', 'update', 'delete'
 * @param {string} category - 'blog', 'newsletter', 'event', 'page', 'settings', etc.
 * @param {string} title - ログのタイトル
 * @param {string} description - ログの説明（オプション）
 * @param {string} userName - ユーザー名（オプション）
 */
async function logActivity(action, category, title, description = '', userName = '管理者') {
    try {
        const response = await fetch('/api/tables/activity_logs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: action,
                category: category,
                title: title,
                description: description,
                user_name: userName,
                created_at: new Date().toISOString()
            })
        });

        if (!response.ok) {
            throw new Error('Failed to log activity');
        }

        console.log('✅ Activity logged:', { action, category, title });
        return true;
    } catch (error) {
        console.warn('⚠️ Failed to log activity (table may not exist):', error);
        return false;
    }
}

/**
 * 便利なラッパー関数
 */
const ActivityLogger = {
    // 作成ログ
    create: (category, title, description) => logActivity('create', category, title, description),
    
    // 更新ログ
    update: (category, title, description) => logActivity('update', category, title, description),
    
    // 削除ログ
    delete: (category, title, description) => logActivity('delete', category, title, description),
    
    // カテゴリ別のヘルパー
    blog: {
        create: (title) => logActivity('create', 'ブログ', `ブログ記事を作成: ${title}`),
        update: (title) => logActivity('update', 'ブログ', `ブログ記事を更新: ${title}`),
        delete: (title) => logActivity('delete', 'ブログ', `ブログ記事を削除: ${title}`),
        configUpdate: (url) => logActivity('update', 'ブログ設定', 'ブログURLを更新', `新しいURL: ${url}`)
    },
    
    newsletter: {
        create: (title) => logActivity('create', '学校だより', `学校だよりを作成: ${title}`),
        update: (title) => logActivity('update', '学校だより', `学校だよりを更新: ${title}`),
        delete: (title) => logActivity('delete', '学校だより', `学校だよりを削除: ${title}`)
    },
    
    event: {
        create: (title) => logActivity('create', '行事予定', `行事を作成: ${title}`),
        update: (title) => logActivity('update', '行事予定', `行事を更新: ${title}`),
        delete: (title) => logActivity('delete', '行事予定', `行事を削除: ${title}`)
    },
    
    page: {
        update: (pageName, field) => logActivity('update', 'ページ編集', `${pageName}を編集`, `編集内容: ${field}`)
    },
    
    settings: {
        update: (settingName, value) => logActivity('update', '設定', `${settingName}を変更`, `新しい値: ${value}`)
    }
};

// グローバルに公開
window.logActivity = logActivity;
window.ActivityLogger = ActivityLogger;
