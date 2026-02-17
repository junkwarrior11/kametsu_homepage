/**
 * キーボードショートカットマネージャー
 * 作成日: 2026-02-17
 * バージョン: 1.0
 * 
 * 機能:
 * - グローバルキーボードショートカット
 * - カスタマイズ可能なキーバインディング
 * - ショートカットの有効/無効切り替え
 * - ヘルプモーダル表示
 * - クロスプラットフォーム対応（Mac/Windows）
 * 
 * 使用例:
 * const shortcuts = new KeyboardShortcuts();
 * 
 * // ショートカットを登録
 * shortcuts.register('ctrl+s', (e) => {
 *   e.preventDefault();
 *   saveData();
 * }, '保存');
 * 
 * // ショートカットヘルプを表示
 * shortcuts.showHelp();
 */

class KeyboardShortcuts {
    constructor(options = {}) {
        this.options = {
            enabled: true,
            showNotifications: true,
            ...options
        };
        
        // ショートカット登録
        this.shortcuts = new Map();
        
        // Mac判定
        this.isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        
        // イベントリスナーを設定
        this.attachListeners();
        
        // デフォルトショートカットを登録
        this.registerDefaultShortcuts();
    }
    
    /**
     * イベントリスナーを設定
     */
    attachListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.options.enabled) return;
            
            const key = this.normalizeKey(e);
            const shortcut = this.shortcuts.get(key);
            
            if (shortcut && this.shouldTrigger(e)) {
                shortcut.handler(e);
                
                if (this.options.showNotifications && shortcut.description) {
                    this.showKeyPressNotification(key, shortcut.description);
                }
            }
        });
    }
    
    /**
     * キーを正規化
     */
    normalizeKey(event) {
        const keys = [];
        
        // 修飾キー
        if (event.ctrlKey || (this.isMac && event.metaKey)) keys.push('ctrl');
        if (event.altKey) keys.push('alt');
        if (event.shiftKey) keys.push('shift');
        
        // メインキー
        let mainKey = event.key.toLowerCase();
        
        // 特殊キーの変換
        const specialKeys = {
            'escape': 'esc',
            'arrowup': 'up',
            'arrowdown': 'down',
            'arrowleft': 'left',
            'arrowright': 'right',
            ' ': 'space'
        };
        
        mainKey = specialKeys[mainKey] || mainKey;
        
        keys.push(mainKey);
        
        return keys.join('+');
    }
    
    /**
     * ショートカットをトリガーすべきか判定
     */
    shouldTrigger(event) {
        // 入力フィールド内では特定のショートカットのみ有効
        const activeElement = document.activeElement;
        const isInputField = activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.contentEditable === 'true'
        );
        
        if (isInputField) {
            // Ctrl+S, Ctrl+Z, Ctrl+Y, Esc は入力フィールド内でも有効
            const allowedInInput = ['ctrl+s', 'ctrl+z', 'ctrl+y', 'esc'];
            const key = this.normalizeKey(event);
            return allowedInInput.includes(key);
        }
        
        return true;
    }
    
    /**
     * ショートカットを登録
     * @param {string} keyCombo - キーの組み合わせ (例: 'ctrl+s', 'alt+shift+d')
     * @param {Function} handler - ハンドラー関数
     * @param {string} description - 説明
     * @param {Object} options - オプション
     */
    register(keyCombo, handler, description = '', options = {}) {
        keyCombo = keyCombo.toLowerCase().replace(/\s/g, '');
        
        this.shortcuts.set(keyCombo, {
            handler,
            description,
            category: options.category || '一般',
            enabled: options.enabled !== false
        });
        
        return this;
    }
    
    /**
     * ショートカットを削除
     */
    unregister(keyCombo) {
        keyCombo = keyCombo.toLowerCase().replace(/\s/g, '');
        this.shortcuts.delete(keyCombo);
        return this;
    }
    
    /**
     * デフォルトショートカットを登録
     */
    registerDefaultShortcuts() {
        // 保存 (Ctrl+S)
        this.register('ctrl+s', (e) => {
            e.preventDefault();
            const saveBtn = document.querySelector('#save-btn, .btn-save, [data-action="save"]');
            if (saveBtn && !saveBtn.disabled) {
                saveBtn.click();
                if (typeof showSuccess === 'function') {
                    showSuccess('保存ショートカットを実行しました');
                }
            }
        }, '保存', { category: '編集' });
        
        // 元に戻す (Ctrl+Z)
        this.register('ctrl+z', (e) => {
            e.preventDefault();
            if (window.history && typeof window.history.undo === 'function') {
                window.history.undo();
            }
            // フォーム履歴がある場合
            if (window.formHistory && typeof window.formHistory.undo === 'function') {
                window.formHistory.undo();
                if (typeof showInfo === 'function') {
                    showInfo('元に戻しました');
                }
            }
        }, '元に戻す', { category: '編集' });
        
        // やり直す (Ctrl+Y または Ctrl+Shift+Z)
        this.register('ctrl+y', (e) => {
            e.preventDefault();
            if (window.history && typeof window.history.redo === 'function') {
                window.history.redo();
            }
            if (window.formHistory && typeof window.formHistory.redo === 'function') {
                window.formHistory.redo();
                if (typeof showInfo === 'function') {
                    showInfo('やり直しました');
                }
            }
        }, 'やり直す', { category: '編集' });
        
        this.register('ctrl+shift+z', (e) => {
            e.preventDefault();
            if (window.history && typeof window.history.redo === 'function') {
                window.history.redo();
            }
            if (window.formHistory && typeof window.formHistory.redo === 'function') {
                window.formHistory.redo();
                if (typeof showInfo === 'function') {
                    showInfo('やり直しました');
                }
            }
        }, 'やり直す', { category: '編集' });
        
        // モーダルを閉じる (Esc)
        this.register('esc', (e) => {
            // モーダルを閉じる
            const modal = document.querySelector('.form-modal[style*="display: flex"], .modal.show');
            if (modal) {
                const closeBtn = modal.querySelector('.btn-close, [data-action="close"]');
                if (closeBtn) {
                    closeBtn.click();
                } else {
                    modal.style.display = 'none';
                    modal.classList.remove('show');
                }
            }
        }, 'モーダルを閉じる', { category: 'ナビゲーション' });
        
        // 検索にフォーカス (Ctrl+K または /)
        this.register('ctrl+k', (e) => {
            e.preventDefault();
            const searchInput = document.querySelector('.datatable-search-input, [type="search"], [placeholder*="検索"]');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }, '検索', { category: 'ナビゲーション' });
        
        this.register('/', (e) => {
            // 入力フィールド内では無効
            if (document.activeElement.tagName === 'INPUT' || 
                document.activeElement.tagName === 'TEXTAREA') {
                return;
            }
            e.preventDefault();
            const searchInput = document.querySelector('.datatable-search-input, [type="search"], [placeholder*="検索"]');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }, '検索', { category: 'ナビゲーション' });
        
        // ヘルプを表示 (Ctrl+/ または ?)
        this.register('ctrl+/', (e) => {
            e.preventDefault();
            this.showHelp();
        }, 'ヘルプを表示', { category: 'ヘルプ' });
        
        this.register('shift+/', (e) => {
            // 入力フィールド内では無効
            if (document.activeElement.tagName === 'INPUT' || 
                document.activeElement.tagName === 'TEXTAREA') {
                return;
            }
            e.preventDefault();
            this.showHelp();
        }, 'ヘルプを表示', { category: 'ヘルプ' });
        
        // 新規作成 (Ctrl+N)
        this.register('ctrl+n', (e) => {
            e.preventDefault();
            const newBtn = document.querySelector('.btn-primary[onclick*="show"], [data-action="new"]');
            if (newBtn) {
                newBtn.click();
            }
        }, '新規作成', { category: '編集' });
    }
    
    /**
     * キー押下通知を表示
     */
    showKeyPressNotification(key, description) {
        // 通知要素を作成
        const notification = document.createElement('div');
        notification.className = 'keyboard-shortcut-notification';
        notification.innerHTML = `
            <div class="shortcut-key">${this.formatKey(key)}</div>
            <div class="shortcut-desc">${description}</div>
        `;
        
        document.body.appendChild(notification);
        
        // アニメーション
        setTimeout(() => notification.classList.add('show'), 10);
        
        // 自動削除
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
    
    /**
     * キーを表示用にフォーマット
     */
    formatKey(key) {
        const parts = key.split('+');
        const formatted = parts.map(part => {
            const keyMap = {
                'ctrl': this.isMac ? '⌘' : 'Ctrl',
                'alt': this.isMac ? '⌥' : 'Alt',
                'shift': this.isMac ? '⇧' : 'Shift',
                'esc': 'Esc',
                'space': 'Space',
                'enter': 'Enter',
                'up': '↑',
                'down': '↓',
                'left': '←',
                'right': '→'
            };
            
            return keyMap[part] || part.toUpperCase();
        });
        
        return formatted.join(this.isMac ? '' : '+');
    }
    
    /**
     * ヘルプモーダルを表示
     */
    showHelp() {
        // 既存のヘルプモーダルを削除
        const existing = document.getElementById('keyboard-shortcuts-help');
        if (existing) {
            existing.remove();
            return;
        }
        
        // カテゴリごとにショートカットを分類
        const categories = {};
        this.shortcuts.forEach((shortcut, key) => {
            const category = shortcut.category;
            if (!categories[category]) {
                categories[category] = [];
            }
            if (shortcut.description) {
                categories[category].push({ key, ...shortcut });
            }
        });
        
        // HTMLを生成
        let html = '<div class="shortcuts-grid">';
        
        Object.keys(categories).forEach(category => {
            html += `<div class="shortcuts-category">`;
            html += `<h3 class="shortcuts-category-title">${category}</h3>`;
            html += `<div class="shortcuts-list">`;
            
            categories[category].forEach(shortcut => {
                html += `
                    <div class="shortcut-item">
                        <div class="shortcut-keys">${this.formatKey(shortcut.key)}</div>
                        <div class="shortcut-description">${shortcut.description}</div>
                    </div>
                `;
            });
            
            html += `</div></div>`;
        });
        
        html += '</div>';
        
        // モーダルを作成
        const modal = document.createElement('div');
        modal.id = 'keyboard-shortcuts-help';
        modal.className = 'keyboard-shortcuts-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="document.getElementById('keyboard-shortcuts-help').remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-keyboard"></i> キーボードショートカット</h2>
                    <button class="btn-close" onclick="document.getElementById('keyboard-shortcuts-help').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${html}
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="document.getElementById('keyboard-shortcuts-help').remove()">
                        閉じる
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // アニメーション
        setTimeout(() => modal.classList.add('show'), 10);
    }
    
    /**
     * 有効/無効を切り替え
     */
    toggle(enabled = null) {
        if (enabled === null) {
            this.options.enabled = !this.options.enabled;
        } else {
            this.options.enabled = enabled;
        }
        return this.options.enabled;
    }
}

// CSSをページに追加
const keyboardShortcutStyles = `
<style>
.keyboard-shortcut-notification {
    position: fixed;
    bottom: var(--space-5);
    right: var(--space-5);
    background: var(--gray-900);
    color: var(--white);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    display: flex;
    align-items: center;
    gap: var(--space-3);
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.3s ease;
    z-index: 10000;
}

.keyboard-shortcut-notification.show {
    opacity: 1;
    transform: translateY(0);
}

.shortcut-key {
    padding: var(--space-1) var(--space-2);
    background: var(--gray-700);
    border-radius: var(--radius-sm);
    font-family: monospace;
    font-size: var(--text-sm);
    font-weight: var(--font-bold);
}

.shortcut-desc {
    font-size: var(--text-sm);
}

.keyboard-shortcuts-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.keyboard-shortcuts-modal.show {
    opacity: 1;
}

.keyboard-shortcuts-modal .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
}

.keyboard-shortcuts-modal .modal-content {
    position: relative;
    background: var(--white);
    border-radius: var(--radius-2xl);
    max-width: 800px;
    max-height: 80vh;
    width: 90%;
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-2xl);
}

.keyboard-shortcuts-modal .modal-header {
    padding: var(--space-6);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.keyboard-shortcuts-modal .modal-header h2 {
    margin: 0;
    font-size: var(--text-2xl);
    display: flex;
    align-items: center;
    gap: var(--space-3);
}

.keyboard-shortcuts-modal .modal-body {
    padding: var(--space-6);
    overflow-y: auto;
}

.keyboard-shortcuts-modal .modal-footer {
    padding: var(--space-4) var(--space-6);
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
}

.shortcuts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--space-6);
}

.shortcuts-category-title {
    font-size: var(--text-lg);
    font-weight: var(--font-bold);
    color: var(--text-dark);
    margin-bottom: var(--space-3);
    padding-bottom: var(--space-2);
    border-bottom: 2px solid var(--primary-500);
}

.shortcuts-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.shortcut-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-2);
    border-radius: var(--radius-md);
    transition: background-color var(--transition-base);
}

.shortcut-item:hover {
    background: var(--gray-50);
}

.shortcut-keys {
    font-family: monospace;
    font-size: var(--text-sm);
    font-weight: var(--font-bold);
    color: var(--primary-600);
    padding: var(--space-1) var(--space-2);
    background: var(--primary-50);
    border-radius: var(--radius-sm);
}

.shortcut-description {
    font-size: var(--text-sm);
    color: var(--text-dark);
}
</style>
`;

// スタイルを追加
if (typeof document !== 'undefined') {
    document.head.insertAdjacentHTML('beforeend', keyboardShortcutStyles);
}

// グローバルスコープに公開
if (typeof window !== 'undefined') {
    window.KeyboardShortcuts = KeyboardShortcuts;
    
    // 自動初期化
    window.addEventListener('DOMContentLoaded', () => {
        if (!window.keyboardShortcuts) {
            window.keyboardShortcuts = new KeyboardShortcuts();
        }
    });
}
