/**
 * トースト通知システム
 * 作成日: 2026-02-17
 * 
 * 機能:
 * - 成功/エラー/警告/情報の通知表示
 * - 自動消去 (カスタマイズ可能)
 * - スタック表示 (複数通知の同時表示)
 * - アニメーション効果
 * 
 * 使用例:
 * showToast('保存しました', 'success');
 * showToast('エラーが発生しました', 'error');
 */

// トーストコンテナの作成
function createToastContainer() {
    if (document.getElementById('toast-container')) {
        return;
    }
    
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', '通知');
    document.body.appendChild(container);
}

/**
 * トースト通知を表示
 * @param {string} message - メッセージ
 * @param {string} type - 通知の種類 ('success', 'error', 'warning', 'info')
 * @param {number} duration - 表示時間（ミリ秒）、0で自動消去なし
 * @param {string} title - タイトル (オプション)
 */
function showToast(message, type = 'info', duration = 3000, title = null) {
    // コンテナ作成
    createToastContainer();
    
    const container = document.getElementById('toast-container');
    
    // トースト要素の作成
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    
    // アイコンの設定
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    // デフォルトタイトルの設定
    const titles = {
        success: '成功',
        error: 'エラー',
        warning: '警告',
        info: '情報'
    };
    
    const toastTitle = title || titles[type];
    
    // HTML構造
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icons[type]}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${escapeHtml(toastTitle)}</div>
            <div class="toast-message">${escapeHtml(message)}</div>
        </div>
        <button class="toast-close" aria-label="閉じる">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // 閉じるボタンのイベント
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        removeToast(toast);
    });
    
    // コンテナに追加
    container.appendChild(toast);
    
    // 自動消去
    if (duration > 0) {
        setTimeout(() => {
            removeToast(toast);
        }, duration);
    }
    
    return toast;
}

/**
 * トーストを削除
 * @param {HTMLElement} toast - トースト要素
 */
function removeToast(toast) {
    if (!toast || !toast.parentNode) return;
    
    // フェードアウトアニメーション
    toast.style.animation = 'slideOutRight 0.3s ease forwards';
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

/**
 * HTMLエスケープ
 * @param {string} text - エスケープするテキスト
 * @returns {string} エスケープされたテキスト
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 成功通知のショートカット
 * @param {string} message - メッセージ
 * @param {number} duration - 表示時間
 */
function showSuccess(message, duration = 3000) {
    return showToast(message, 'success', duration);
}

/**
 * エラー通知のショートカット
 * @param {string} message - メッセージ
 * @param {number} duration - 表示時間 (エラーは長めに表示)
 */
function showError(message, duration = 5000) {
    return showToast(message, 'error', duration);
}

/**
 * 警告通知のショートカット
 * @param {string} message - メッセージ
 * @param {number} duration - 表示時間
 */
function showWarning(message, duration = 4000) {
    return showToast(message, 'warning', duration);
}

/**
 * 情報通知のショートカット
 * @param {string} message - メッセージ
 * @param {number} duration - 表示時間
 */
function showInfo(message, duration = 3000) {
    return showToast(message, 'info', duration);
}

/**
 * 確認ダイアログ付きアクション
 * @param {string} message - 確認メッセージ
 * @param {Function} onConfirm - 確認時のコールバック
 * @param {Function} onCancel - キャンセル時のコールバック (オプション)
 */
function showConfirm(message, onConfirm, onCancel = null) {
    // シンプルな実装 (将来的にモーダルに変更可能)
    if (confirm(message)) {
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    } else {
        if (typeof onCancel === 'function') {
            onCancel();
        }
    }
}

/**
 * ローディング表示
 * @param {string} message - ローディングメッセージ
 * @returns {HTMLElement} ローディングオーバーレイ要素
 */
function showLoading(message = '読み込み中...') {
    // 既存のローディングを削除
    hideLoading();
    
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'loading-overlay';
    overlay.setAttribute('role', 'alert');
    overlay.setAttribute('aria-busy', 'true');
    overlay.setAttribute('aria-live', 'polite');
    
    overlay.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    return overlay;
}

/**
 * ローディング表示を隠す
 */
function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
    }
}

/**
 * スライドアウトアニメーションの定義 (CSSに追加する場合)
 */
const slideOutRightCSS = `
@keyframes slideOutRight {
    from {
        opacity: 1;
        transform: translateX(0);
    }
    to {
        opacity: 0;
        transform: translateX(100%);
    }
}
`;

// CSSアニメーションを動的に追加
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = slideOutRightCSS;
    document.head.appendChild(style);
}

// グローバルスコープに公開
if (typeof window !== 'undefined') {
    window.showToast = showToast;
    window.showSuccess = showSuccess;
    window.showError = showError;
    window.showWarning = showWarning;
    window.showInfo = showInfo;
    window.showConfirm = showConfirm;
    window.showLoading = showLoading;
    window.hideLoading = hideLoading;
}
