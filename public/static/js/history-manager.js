/**
 * Undo/Redo履歴管理システム
 * 作成日: 2026-02-17
 * バージョン: 1.0
 * 
 * 機能:
 * - フォーム入力の履歴管理
 * - Undo/Redo機能
 * - localStorage永続化
 * - キーボードショートカット対応
 * - 最大履歴数の制限
 * 
 * 使用例:
 * const history = new HistoryManager({
 *   maxHistory: 50,
 *   storageKey: 'visual-editor-history'
 * });
 * 
 * // 状態を保存
 * history.push({ fieldKey: 'title', value: 'New Title' });
 * 
 * // 元に戻す
 * const previousState = history.undo();
 * 
 * // やり直す
 * const nextState = history.redo();
 */

class HistoryManager {
    constructor(options = {}) {
        this.options = {
            maxHistory: 50,
            storageKey: 'history-manager',
            autoSave: true,
            debounceDelay: 500,
            ...options
        };
        
        // 履歴スタック
        this.undoStack = [];
        this.redoStack = [];
        
        // 現在の状態
        this.currentState = null;
        
        // デバウンスタイマー
        this.debounceTimer = null;
        
        // ローカルストレージから復元
        if (this.options.autoSave) {
            this.load();
        }
    }
    
    /**
     * 状態を履歴に追加
     * @param {Object} state - 保存する状態
     * @param {boolean} immediate - デバウンスをスキップ
     */
    push(state, immediate = false) {
        if (immediate) {
            this._push(state);
        } else {
            // デバウンス処理（連続した変更をまとめる）
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this._push(state);
            }, this.options.debounceDelay);
        }
    }
    
    /**
     * 内部的な状態追加処理
     * @private
     */
    _push(state) {
        // 現在の状態がある場合は履歴に追加
        if (this.currentState !== null) {
            this.undoStack.push(this.currentState);
            
            // 最大履歴数を超えたら古いものを削除
            if (this.undoStack.length > this.options.maxHistory) {
                this.undoStack.shift();
            }
        }
        
        // 新しい状態を現在の状態として設定
        this.currentState = this._cloneState(state);
        
        // Redo履歴をクリア
        this.redoStack = [];
        
        // 自動保存
        if (this.options.autoSave) {
            this.save();
        }
        
        // イベントを発火
        this._triggerEvent('change', { canUndo: this.canUndo(), canRedo: this.canRedo() });
    }
    
    /**
     * 元に戻す
     * @returns {Object|null} - 前の状態、またはnull
     */
    undo() {
        if (!this.canUndo()) {
            return null;
        }
        
        // 現在の状態をRedo履歴に追加
        this.redoStack.push(this.currentState);
        
        // Undo履歴から状態を取得
        this.currentState = this.undoStack.pop();
        
        // 自動保存
        if (this.options.autoSave) {
            this.save();
        }
        
        // イベントを発火
        this._triggerEvent('undo', this.currentState);
        this._triggerEvent('change', { canUndo: this.canUndo(), canRedo: this.canRedo() });
        
        return this._cloneState(this.currentState);
    }
    
    /**
     * やり直す
     * @returns {Object|null} - 次の状態、またはnull
     */
    redo() {
        if (!this.canRedo()) {
            return null;
        }
        
        // 現在の状態をUndo履歴に追加
        this.undoStack.push(this.currentState);
        
        // Redo履歴から状態を取得
        this.currentState = this.redoStack.pop();
        
        // 自動保存
        if (this.options.autoSave) {
            this.save();
        }
        
        // イベントを発火
        this._triggerEvent('redo', this.currentState);
        this._triggerEvent('change', { canUndo: this.canUndo(), canRedo: this.canRedo() });
        
        return this._cloneState(this.currentState);
    }
    
    /**
     * Undoが可能かチェック
     * @returns {boolean}
     */
    canUndo() {
        return this.undoStack.length > 0;
    }
    
    /**
     * Redoが可能かチェック
     * @returns {boolean}
     */
    canRedo() {
        return this.redoStack.length > 0;
    }
    
    /**
     * 現在の状態を取得
     * @returns {Object|null}
     */
    getCurrentState() {
        return this._cloneState(this.currentState);
    }
    
    /**
     * 履歴をクリア
     */
    clear() {
        this.undoStack = [];
        this.redoStack = [];
        this.currentState = null;
        
        if (this.options.autoSave) {
            this.save();
        }
        
        this._triggerEvent('clear');
        this._triggerEvent('change', { canUndo: false, canRedo: false });
    }
    
    /**
     * localStorageに保存
     */
    save() {
        try {
            const data = {
                undoStack: this.undoStack,
                redoStack: this.redoStack,
                currentState: this.currentState,
                timestamp: Date.now()
            };
            localStorage.setItem(this.options.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('HistoryManager: Failed to save to localStorage', error);
        }
    }
    
    /**
     * localStorageから読み込み
     */
    load() {
        try {
            const data = localStorage.getItem(this.options.storageKey);
            if (data) {
                const parsed = JSON.parse(data);
                this.undoStack = parsed.undoStack || [];
                this.redoStack = parsed.redoStack || [];
                this.currentState = parsed.currentState || null;
                
                this._triggerEvent('load');
                this._triggerEvent('change', { canUndo: this.canUndo(), canRedo: this.canRedo() });
            }
        } catch (error) {
            console.error('HistoryManager: Failed to load from localStorage', error);
        }
    }
    
    /**
     * 状態を複製
     * @private
     */
    _cloneState(state) {
        if (state === null || state === undefined) {
            return null;
        }
        return JSON.parse(JSON.stringify(state));
    }
    
    /**
     * イベントリスナー
     * @private
     */
    _listeners = {};
    
    /**
     * イベントリスナーを登録
     * @param {string} event - イベント名 ('undo', 'redo', 'change', 'clear', 'load')
     * @param {Function} callback - コールバック関数
     */
    on(event, callback) {
        if (!this._listeners[event]) {
            this._listeners[event] = [];
        }
        this._listeners[event].push(callback);
    }
    
    /**
     * イベントリスナーを削除
     * @param {string} event - イベント名
     * @param {Function} callback - コールバック関数
     */
    off(event, callback) {
        if (!this._listeners[event]) return;
        
        const index = this._listeners[event].indexOf(callback);
        if (index > -1) {
            this._listeners[event].splice(index, 1);
        }
    }
    
    /**
     * イベントを発火
     * @private
     */
    _triggerEvent(event, data = null) {
        if (!this._listeners[event]) return;
        
        this._listeners[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`HistoryManager: Error in ${event} listener`, error);
            }
        });
    }
    
    /**
     * 統計情報を取得
     * @returns {Object}
     */
    getStats() {
        return {
            undoStackSize: this.undoStack.length,
            redoStackSize: this.redoStack.length,
            canUndo: this.canUndo(),
            canRedo: this.canRedo(),
            hasCurrentState: this.currentState !== null
        };
    }
}

/**
 * FormHistoryManager - フォーム専用の履歴管理
 * 複数のフォームフィールドをまとめて管理
 */
class FormHistoryManager extends HistoryManager {
    constructor(formElement, options = {}) {
        super({
            storageKey: 'form-history',
            ...options
        });
        
        this.form = formElement;
        this.fields = new Map();
        
        // フォームフィールドを監視
        this.watchForm();
    }
    
    /**
     * フォームフィールドを監視
     */
    watchForm() {
        const inputs = this.form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            const fieldName = input.name || input.id;
            if (!fieldName) return;
            
            // 初期値を保存
            this.fields.set(fieldName, input.value);
            
            // 変更を監視
            input.addEventListener('input', () => {
                this.updateField(fieldName, input.value);
            });
        });
        
        // 初期状態を履歴に追加
        this.push(this.getFormState(), true);
    }
    
    /**
     * フィールドの値を更新
     */
    updateField(fieldName, value) {
        this.fields.set(fieldName, value);
        this.push(this.getFormState());
    }
    
    /**
     * フォームの現在の状態を取得
     */
    getFormState() {
        const state = {};
        this.fields.forEach((value, key) => {
            state[key] = value;
        });
        return state;
    }
    
    /**
     * フォームに状態を適用
     */
    applyState(state) {
        if (!state) return;
        
        Object.keys(state).forEach(fieldName => {
            const input = this.form.querySelector(`[name="${fieldName}"], #${fieldName}`);
            if (input) {
                input.value = state[fieldName];
                this.fields.set(fieldName, state[fieldName]);
            }
        });
    }
    
    /**
     * Undoをオーバーライド
     */
    undo() {
        const state = super.undo();
        if (state) {
            this.applyState(state);
        }
        return state;
    }
    
    /**
     * Redoをオーバーライド
     */
    redo() {
        const state = super.redo();
        if (state) {
            this.applyState(state);
        }
        return state;
    }
}

// グローバルスコープに公開
if (typeof window !== 'undefined') {
    window.HistoryManager = HistoryManager;
    window.FormHistoryManager = FormHistoryManager;
}
