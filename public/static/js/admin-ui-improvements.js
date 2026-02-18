/**
 * 管理画面UI改善ユーティリティ
 * - トースト通知
 * - サイドパネル管理
 * - インライン編集
 * - ローディング状態
 * - フォームバリデーション
 */

// ========================================
// トースト通知システム
// ========================================
class ToastManager {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // トーストコンテナを作成
        if (!document.querySelector('.toast-container')) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.toast-container');
        }
    }

    /**
     * トースト通知を表示
     * @param {string} type - success, error, warning, info
     * @param {string} title - タイトル
     * @param {string} message - メッセージ
     * @param {number} duration - 表示時間（ミリ秒）
     */
    show(type, title, message, duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icon = this.getIcon(type);
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${icon}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.closest('.toast').remove()">
                <i class="fas fa-times"></i>
            </button>
            <div class="toast-progress"></div>
        `;

        this.container.appendChild(toast);

        // 自動削除
        if (duration > 0) {
            setTimeout(() => {
                toast.classList.add('toast-hide');
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }

        return toast;
    }

    getIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    success(title, message, duration) {
        return this.show('success', title, message, duration);
    }

    error(title, message, duration) {
        return this.show('error', title, message, duration);
    }

    warning(title, message, duration) {
        return this.show('warning', title, message, duration);
    }

    info(title, message, duration) {
        return this.show('info', title, message, duration);
    }

    // すべてのトーストを削除
    clearAll() {
        this.container.innerHTML = '';
    }
}

// グローバルインスタンス
window.toast = new ToastManager();

// ========================================
// サイドパネル管理
// ========================================
class SidePanel {
    constructor(options = {}) {
        this.panel = null;
        this.overlay = null;
        this.options = {
            width: '600px',
            title: '編集',
            onSave: null,
            onCancel: null,
            ...options
        };
        this.init();
    }

    init() {
        // サイドパネルHTML生成
        this.panel = document.createElement('div');
        this.panel.className = 'form-sidepanel';
        this.panel.style.width = this.options.width;

        this.overlay = document.createElement('div');
        this.overlay.className = 'form-sidepanel-overlay';
        this.overlay.onclick = () => this.close();

        document.body.appendChild(this.overlay);
        document.body.appendChild(this.panel);

        // Escキーで閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.panel.classList.contains('active')) {
                this.close();
            }
        });
    }

    /**
     * サイドパネルを開く
     * @param {string} title - タイトル
     * @param {string|HTMLElement} content - コンテンツ
     * @param {Object} actions - アクションボタン設定
     */
    open(title, content, actions = {}) {
        this.panel.innerHTML = `
            <div class="sidepanel-header">
                <h2><i class="fas fa-edit"></i> ${title}</h2>
                <button class="btn-close" onclick="window.sidePanel.close()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="sidepanel-body">
                ${typeof content === 'string' ? content : ''}
            </div>
            <div class="sidepanel-footer">
                ${actions.cancelText ? `<button class="btn-secondary" onclick="window.sidePanel.close()">${actions.cancelText}</button>` : ''}
                ${actions.saveText ? `<button class="btn-primary" id="sidepanel-save-btn">${actions.saveText}</button>` : ''}
            </div>
        `;

        if (typeof content !== 'string') {
            this.panel.querySelector('.sidepanel-body').appendChild(content);
        }

        // 保存ボタンのイベント
        if (actions.onSave) {
            const saveBtn = this.panel.querySelector('#sidepanel-save-btn');
            if (saveBtn) {
                saveBtn.onclick = actions.onSave;
            }
        }

        // アクティブ化
        setTimeout(() => {
            this.panel.classList.add('active');
            this.overlay.classList.add('active');
        }, 10);
    }

    close() {
        this.panel.classList.remove('active');
        this.overlay.classList.remove('active');

        if (this.options.onCancel) {
            this.options.onCancel();
        }
    }

    setLoading(loading) {
        const saveBtn = this.panel.querySelector('#sidepanel-save-btn');
        if (saveBtn) {
            if (loading) {
                saveBtn.classList.add('btn-loading');
                saveBtn.disabled = true;
            } else {
                saveBtn.classList.remove('btn-loading');
                saveBtn.disabled = false;
            }
        }
    }
}

// グローバルインスタンス
window.sidePanel = new SidePanel();

// ========================================
// インライン編集
// ========================================
class InlineEditor {
    constructor(cell, options = {}) {
        this.cell = cell;
        this.originalValue = cell.textContent.trim();
        this.options = {
            type: 'text', // text, select
            selectOptions: [],
            onSave: null,
            onCancel: null,
            ...options
        };
        this.init();
    }

    init() {
        this.cell.classList.add('editing');
        
        let inputHtml;
        if (this.options.type === 'select') {
            inputHtml = `
                <select class="inline-edit-input">
                    ${this.options.selectOptions.map(opt => 
                        `<option value="${opt.value}" ${opt.value === this.originalValue ? 'selected' : ''}>${opt.label}</option>`
                    ).join('')}
                </select>
            `;
        } else {
            inputHtml = `<input type="text" class="inline-edit-input" value="${this.escapeHtml(this.originalValue)}">`;
        }

        this.cell.innerHTML = `
            ${inputHtml}
            <div class="inline-edit-actions">
                <button class="inline-edit-save"><i class="fas fa-check"></i> 保存</button>
                <button class="inline-edit-cancel"><i class="fas fa-times"></i></button>
            </div>
        `;

        this.input = this.cell.querySelector('.inline-edit-input');
        this.input.focus();

        // イベントリスナー
        this.cell.querySelector('.inline-edit-save').onclick = () => this.save();
        this.cell.querySelector('.inline-edit-cancel').onclick = () => this.cancel();
        
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.save();
            } else if (e.key === 'Escape') {
                this.cancel();
            }
        });
    }

    async save() {
        const newValue = this.input.value.trim();
        
        if (newValue === this.originalValue) {
            this.cancel();
            return;
        }

        if (this.options.onSave) {
            const saveBtn = this.cell.querySelector('.inline-edit-save');
            saveBtn.classList.add('btn-loading');

            try {
                await this.options.onSave(newValue);
                this.cell.textContent = newValue;
                this.cell.classList.remove('editing');
                toast.success('保存完了', '変更を保存しました');
            } catch (error) {
                toast.error('保存失敗', error.message || '変更の保存に失敗しました');
                this.cancel();
            }
        } else {
            this.cell.textContent = newValue;
            this.cell.classList.remove('editing');
        }
    }

    cancel() {
        this.cell.textContent = this.originalValue;
        this.cell.classList.remove('editing');
        
        if (this.options.onCancel) {
            this.options.onCancel();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/**
 * セルをインライン編集可能にする
 * @param {string} selector - セレクタ
 * @param {Object} options - オプション
 */
window.makeInlineEditable = function(selector, options) {
    document.querySelectorAll(selector).forEach(cell => {
        cell.classList.add('editable-cell');
        cell.onclick = function() {
            if (!this.classList.contains('editing')) {
                new InlineEditor(this, options);
            }
        };
    });
};

// ========================================
// ローディング状態管理
// ========================================
class LoadingManager {
    constructor() {
        this.overlay = null;
        this.init();
    }

    init() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'loading-overlay';
        this.overlay.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">読み込み中...</div>
        `;
        document.body.appendChild(this.overlay);
    }

    show(text = '読み込み中...') {
        this.overlay.querySelector('.loading-text').textContent = text;
        this.overlay.classList.add('active');
    }

    hide() {
        this.overlay.classList.remove('active');
    }
}

window.loading = new LoadingManager();

// ========================================
// フォームバリデーション
// ========================================
class FormValidator {
    constructor(form) {
        this.form = form;
        this.fields = new Map();
        this.init();
    }

    init() {
        // フォーム送信をインターセプト
        this.form.addEventListener('submit', (e) => {
            if (!this.validateAll()) {
                e.preventDefault();
            }
        });

        // リアルタイムバリデーション
        this.form.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => {
                if (field.closest('.form-field').classList.contains('error')) {
                    this.validateField(field);
                }
            });
        });
    }

    addRule(fieldName, rules) {
        this.fields.set(fieldName, rules);
    }

    validateField(field) {
        const fieldName = field.name || field.id;
        const rules = this.fields.get(fieldName);
        
        if (!rules) return true;

        const value = field.value.trim();
        const formField = field.closest('.form-field');
        const errorDiv = formField.querySelector('.field-error');

        // 必須チェック
        if (rules.required && !value) {
            this.showError(formField, errorDiv, rules.requiredMessage || 'この項目は必須です');
            return false;
        }

        // 最小文字数
        if (rules.minLength && value.length < rules.minLength) {
            this.showError(formField, errorDiv, `${rules.minLength}文字以上で入力してください`);
            return false;
        }

        // 最大文字数
        if (rules.maxLength && value.length > rules.maxLength) {
            this.showError(formField, errorDiv, `${rules.maxLength}文字以内で入力してください`);
            return false;
        }

        // カスタムバリデーション
        if (rules.custom) {
            const result = rules.custom(value);
            if (result !== true) {
                this.showError(formField, errorDiv, result);
                return false;
            }
        }

        // エラーなし
        this.clearError(formField);
        return true;
    }

    validateAll() {
        let isValid = true;
        
        this.form.querySelectorAll('input, select, textarea').forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    showError(formField, errorDiv, message) {
        formField.classList.add('error');
        formField.classList.remove('success');
        if (errorDiv) {
            errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        }
    }

    clearError(formField) {
        formField.classList.remove('error');
        const errorDiv = formField.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.innerHTML = '';
        }
    }
}

/**
 * フォームバリデーターを作成
 * @param {string|HTMLElement} form - フォーム要素またはセレクタ
 * @returns {FormValidator}
 */
window.createFormValidator = function(form) {
    if (typeof form === 'string') {
        form = document.querySelector(form);
    }
    return new FormValidator(form);
};

// ========================================
// ユーティリティ関数
// ========================================

/**
 * HTML エスケープ
 */
window.escapeHtml = function(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

/**
 * 日付フォーマット
 */
window.formatDate = function(dateString, format = 'YYYY/MM/DD') {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes);
};

/**
 * 確認ダイアログ（美しいバージョン）
 */
window.confirmDialog = function(title, message, confirmText = '確認', cancelText = 'キャンセル') {
    return new Promise((resolve) => {
        // カスタム確認ダイアログを実装する場合はここに
        // 今は標準confirmを使用
        resolve(confirm(`${title}\n\n${message}`));
    });
};

console.log('✅ 管理画面UI改善ユーティリティが読み込まれました');
