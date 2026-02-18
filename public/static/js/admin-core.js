/**
 * 管理画面統合コアライブラリ
 * すべての管理画面で共通して使用するユーティリティとヘルパー関数を集約
 * 
 * 【統合された機能】
 * - HTMLエスケープ
 * - 日時フォーマット
 * - データ変換
 * - エラーハンドリング
 * - 共通定数
 */

// ========================================
// 共通ユーティリティ関数
// ========================================

/**
 * HTMLエスケープ（XSS対策）
 * 12ファイルで重複していた関数を統合
 * @param {string} text - エスケープする文字列
 * @returns {string} エスケープされた文字列
 */
window.escapeHtml = function(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

/**
 * 日付フォーマット（YYYY/MM/DD形式）
 * 8ファイルで重複していた関数を統合
 * @param {string|Date} dateString - 日付文字列またはDateオブジェクト
 * @param {string} format - フォーマット形式（デフォルト: 'YYYY/MM/DD'）
 * @returns {string} フォーマットされた日付文字列
 */
window.formatDate = function(dateString, format = 'YYYY/MM/DD') {
    if (!dateString) return '';
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
};

/**
 * 日時フォーマット（YYYY/MM/DD HH:mm形式）
 * @param {string|Date} dateString - 日時文字列
 * @returns {string} フォーマットされた日時文字列
 */
window.formatDateTime = function(dateString) {
    return formatDate(dateString, 'YYYY/MM/DD HH:mm');
};

/**
 * datetime-local input用の日時フォーマット
 * @param {string|Date} dateString - 日時文字列
 * @returns {string} YYYY-MM-DDTHH:mm形式の文字列
 */
window.formatDateTimeLocal = function(dateString) {
    if (!dateString) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    }
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
};

/**
 * 相対時間表示（例: "3分前", "2時間前"）
 * @param {string|Date} dateString - 日時文字列
 * @returns {string} 相対時間文字列
 */
window.formatRelativeTime = function(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return 'たった今';
    if (diffMin < 60) return `${diffMin}分前`;
    if (diffHour < 24) return `${diffHour}時間前`;
    if (diffDay < 7) return `${diffDay}日前`;
    
    return formatDate(dateString);
};

// ========================================
// データ変換ユーティリティ
// ========================================

/**
 * ステータスバッジのクラス名を取得
 * @param {string} status - ステータス（公開、下書き等）
 * @returns {string} CSSクラス名
 */
window.getStatusClass = function(status) {
    const statusMap = {
        '公開': 'published',
        '下書き': 'draft',
        '予約': 'pending',
        '完了': 'completed',
        '進行中': 'in-progress'
    };
    return statusMap[status] || 'draft';
};

/**
 * ファイルサイズを人間が読みやすい形式に変換
 * @param {number} bytes - バイト数
 * @returns {string} フォーマットされたサイズ（例: "1.5 MB"）
 */
window.formatFileSize = function(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 数値をカンマ区切りでフォーマット
 * @param {number} num - 数値
 * @returns {string} カンマ区切りの文字列
 */
window.formatNumber = function(num) {
    if (num === null || num === undefined) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// ========================================
// バリデーションユーティリティ
// ========================================

/**
 * メールアドレスの検証
 * @param {string} email - メールアドレス
 * @returns {boolean} 有効なメールアドレスならtrue
 */
window.isValidEmail = function(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

/**
 * URLの検証
 * @param {string} url - URL
 * @returns {boolean} 有効なURLならtrue
 */
window.isValidUrl = function(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * 空文字列・null・undefinedチェック
 * @param {any} value - チェックする値
 * @returns {boolean} 空ならtrue
 */
window.isEmpty = function(value) {
    return value === null || value === undefined || 
           (typeof value === 'string' && value.trim() === '') ||
           (Array.isArray(value) && value.length === 0);
};

// ========================================
// DOM操作ユーティリティ
// ========================================

/**
 * 要素を安全に取得（存在しない場合はエラーログ）
 * @param {string} selector - CSSセレクタ
 * @returns {HTMLElement|null} 要素またはnull
 */
window.safeQuerySelector = function(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        console.warn(`Element not found: ${selector}`);
    }
    return element;
};

/**
 * 要素の表示/非表示を切り替え
 * @param {string|HTMLElement} element - 要素またはセレクタ
 * @param {boolean} show - 表示するかどうか
 */
window.toggleElement = function(element, show) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) {
        el.style.display = show ? 'block' : 'none';
    }
};

/**
 * クラスの追加/削除を切り替え
 * @param {string|HTMLElement} element - 要素またはセレクタ
 * @param {string} className - クラス名
 * @param {boolean} add - 追加するかどうか
 */
window.toggleClass = function(element, className, add) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) {
        if (add) {
            el.classList.add(className);
        } else {
            el.classList.remove(className);
        }
    }
};

// ========================================
// エラーハンドリングユーティリティ
// ========================================

/**
 * エラーメッセージを標準化
 * @param {Error|string} error - エラーオブジェクトまたはメッセージ
 * @returns {string} 標準化されたエラーメッセージ
 */
window.getErrorMessage = function(error) {
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    return '予期しないエラーが発生しました';
};

/**
 * 開発環境かどうかを判定
 * @returns {boolean} 開発環境ならtrue
 */
window.isDevelopment = function() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('sandbox');
};

/**
 * デバッグログ（開発環境のみ）
 * @param {...any} args - ログ出力する引数
 */
window.debugLog = function(...args) {
    if (isDevelopment()) {
        console.log('[DEBUG]', ...args);
    }
};

// ========================================
// ローカルストレージユーティリティ
// ========================================

/**
 * ローカルストレージに保存（エラーハンドリング付き）
 * @param {string} key - キー
 * @param {any} value - 値（自動的にJSON化）
 * @returns {boolean} 成功したらtrue
 */
window.saveToStorage = function(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
        return false;
    }
};

/**
 * ローカルストレージから取得（エラーハンドリング付き）
 * @param {string} key - キー
 * @param {any} defaultValue - デフォルト値
 * @returns {any} 取得した値またはデフォルト値
 */
window.getFromStorage = function(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Failed to get from localStorage:', error);
        return defaultValue;
    }
};

/**
 * ローカルストレージから削除
 * @param {string} key - キー
 */
window.removeFromStorage = function(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Failed to remove from localStorage:', error);
    }
};

// ========================================
// URLユーティリティ
// ========================================

/**
 * URLクエリパラメータを取得
 * @param {string} param - パラメータ名
 * @returns {string|null} パラメータ値
 */
window.getUrlParam = function(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
};

/**
 * URLクエリパラメータを設定
 * @param {string} param - パラメータ名
 * @param {string} value - パラメータ値
 */
window.setUrlParam = function(param, value) {
    const url = new URL(window.location);
    url.searchParams.set(param, value);
    window.history.pushState({}, '', url);
};

// ========================================
// 配列ユーティリティ
// ========================================

/**
 * 配列から重複を除去
 * @param {Array} array - 配列
 * @returns {Array} 重複を除去した配列
 */
window.uniqueArray = function(array) {
    return [...new Set(array)];
};

/**
 * 配列をチャンクに分割
 * @param {Array} array - 配列
 * @param {number} size - チャンクサイズ
 * @returns {Array} チャンクの配列
 */
window.chunkArray = function(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

// ========================================
// 遅延実行ユーティリティ
// ========================================

/**
 * デバウンス（連続呼び出しを制限）
 * @param {Function} func - 実行する関数
 * @param {number} wait - 待機時間（ミリ秒）
 * @returns {Function} デバウンスされた関数
 */
window.debounce = function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * スロットル（実行頻度を制限）
 * @param {Function} func - 実行する関数
 * @param {number} limit - 実行間隔（ミリ秒）
 * @returns {Function} スロットルされた関数
 */
window.throttle = function(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// ========================================
// 確認ダイアログ（Promise版）
// ========================================

/**
 * 確認ダイアログ（Promise版）
 * @param {string} message - メッセージ
 * @returns {Promise<boolean>} ユーザーの選択
 */
window.confirmAsync = function(message) {
    return new Promise((resolve) => {
        resolve(confirm(message));
    });
};

// ========================================
// コピー機能
// ========================================

/**
 * テキストをクリップボードにコピー
 * @param {string} text - コピーするテキスト
 * @returns {Promise<boolean>} 成功したらtrue
 */
window.copyToClipboard = async function(text) {
    try {
        await navigator.clipboard.writeText(text);
        toast.success('コピー完了', 'クリップボードにコピーしました');
        return true;
    } catch (error) {
        console.error('Failed to copy:', error);
        toast.error('コピー失敗', 'クリップボードへのコピーに失敗しました');
        return false;
    }
};

// ========================================
// 初期化
// ========================================

console.log('✅ 統合コアライブラリ（admin-core.js）が読み込まれました');
console.log('📦 利用可能な関数:', {
    'HTML': 'escapeHtml()',
    '日時': 'formatDate(), formatDateTime(), formatDateTimeLocal(), formatRelativeTime()',
    'データ変換': 'getStatusClass(), formatFileSize(), formatNumber()',
    'バリデーション': 'isValidEmail(), isValidUrl(), isEmpty()',
    'DOM操作': 'safeQuerySelector(), toggleElement(), toggleClass()',
    'エラー': 'getErrorMessage(), debugLog()',
    'ストレージ': 'saveToStorage(), getFromStorage(), removeFromStorage()',
    'URL': 'getUrlParam(), setUrlParam()',
    '配列': 'uniqueArray(), chunkArray()',
    '遅延実行': 'debounce(), throttle()',
    'その他': 'confirmAsync(), copyToClipboard()'
});
