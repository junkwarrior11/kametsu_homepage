/**
 * 管理画面 コアライブラリ (admin-core.js)
 * 共通ユーティリティ関数と基本機能を提供
 * Version: 1.0.0
 * Created: 2026-02-18
 */

// ==============================================
// 1. ユーティリティ関数
// ==============================================

/**
 * HTMLエスケープ処理
 * @param {string} text - エスケープするテキスト
 * @returns {string} エスケープされたテキスト
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 日付フォーマット
 * @param {string} dateString - 日付文字列
 * @param {string} format - フォーマット ('date' | 'datetime' | 'time')
 * @returns {string} フォーマットされた日付
 */
export function formatDate(dateString, format = 'date') {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  
  const options = {
    'date': { year: 'numeric', month: '2-digit', day: '2-digit' },
    'datetime': { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' },
    'time': { hour: '2-digit', minute: '2-digit' }
  };
  
  return date.toLocaleString('ja-JP', options[format] || options['date']);
}

/**
 * 文字数カウントと表示
 * @param {string} text - カウントするテキスト
 * @param {number} limit - 文字数制限
 * @returns {Object} { count, isWarning, isError }
 */
export function countCharacters(text, limit) {
  const count = text.length;
  return {
    count,
    isWarning: count > limit * 0.8,
    isError: count > limit,
    remaining: limit - count
  };
}

/**
 * ファイルサイズを人間が読みやすい形式に変換
 * @param {number} bytes - バイト数
 * @returns {string} フォーマットされたサイズ
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * ランダムIDを生成
 * @param {number} length - ID長さ
 * @returns {string} ランダムID
 */
export function generateId(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}

// ==============================================
// 2. ローディング表示管理
// ==============================================

class LoadingManager {
  constructor() {
    this.overlay = null;
    this.init();
  }

  init() {
    // ローディングオーバーレイを作成
    if (!document.getElementById('loading-overlay')) {
      this.overlay = document.createElement('div');
      this.overlay.id = 'loading-overlay';
      this.overlay.className = 'loading-overlay';
      this.overlay.innerHTML = `
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p class="loading-text">読み込み中...</p>
        </div>
      `;
      document.body.appendChild(this.overlay);
    } else {
      this.overlay = document.getElementById('loading-overlay');
    }
  }

  show(message = '読み込み中...') {
    if (this.overlay) {
      const textElement = this.overlay.querySelector('.loading-text');
      if (textElement) textElement.textContent = message;
      this.overlay.classList.add('active');
    }
  }

  hide() {
    if (this.overlay) {
      this.overlay.classList.remove('active');
    }
  }
}

// シングルトンインスタンス
export const loading = new LoadingManager();

// ==============================================
// 3. トースト通知管理
// ==============================================

class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    if (!document.getElementById('toast-container')) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById('toast-container');
    }
  }

  show(type, title, message, duration = 4000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    
    toast.innerHTML = `
      <div class="toast-icon">
        <i class="${icons[type]}"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <button class="toast-close">
        <i class="fas fa-times"></i>
      </button>
    `;

    this.container.appendChild(toast);

    // アニメーション
    setTimeout(() => toast.classList.add('show'), 10);

    // 閉じるボタン
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.remove(toast));

    // 自動削除
    if (duration > 0) {
      setTimeout(() => this.remove(toast), duration);
    }

    return toast;
  }

  remove(toast) {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }

  success(title, message = '', duration = 4000) {
    return this.show('success', title, message, duration);
  }

  error(title, message = '', duration = 5000) {
    return this.show('error', title, message, duration);
  }

  warning(title, message = '', duration = 4000) {
    return this.show('warning', title, message, duration);
  }

  info(title, message = '', duration = 4000) {
    return this.show('info', title, message, duration);
  }
}

// シングルトンインスタンス
export const toast = new ToastManager();

// ==============================================
// 4. エラーハンドリング
// ==============================================

/**
 * APIエラーをユーザーフレンドリーなメッセージに変換
 * @param {Error} error - エラーオブジェクト
 * @returns {string} エラーメッセージ
 */
export function getErrorMessage(error) {
  if (!error) return '不明なエラーが発生しました';
  
  if (error.response) {
    // サーバーエラー
    const status = error.response.status;
    const messages = {
      400: '入力内容に誤りがあります',
      401: '認証が必要です',
      403: 'アクセス権限がありません',
      404: '対象が見つかりません',
      409: 'データが競合しています',
      500: 'サーバーエラーが発生しました'
    };
    return messages[status] || `エラーが発生しました (${status})`;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return '不明なエラーが発生しました';
}

/**
 * グローバルエラーハンドラー
 * @param {Error} error - エラーオブジェクト
 * @param {string} context - エラーが発生したコンテキスト
 */
export function handleError(error, context = '') {
  console.error(`Error in ${context}:`, error);
  const message = getErrorMessage(error);
  toast.error('エラー', `${context ? context + ': ' : ''}${message}`);
}

// ==============================================
// 5. バリデーション
// ==============================================

export const validators = {
  required: (value, message = 'この項目は必須です') => {
    return value && value.trim() !== '' ? null : message;
  },
  
  minLength: (min, message) => (value) => {
    return value && value.length >= min ? null : message || `${min}文字以上で入力してください`;
  },
  
  maxLength: (max, message) => (value) => {
    return value && value.length <= max ? null : message || `${max}文字以内で入力してください`;
  },
  
  email: (value, message = '正しいメールアドレスを入力してください') => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !value || emailRegex.test(value) ? null : message;
  },
  
  url: (value, message = '正しいURLを入力してください') => {
    try {
      new URL(value);
      return null;
    } catch {
      return message;
    }
  },
  
  date: (value, message = '正しい日付を入力してください') => {
    const date = new Date(value);
    return !isNaN(date.getTime()) ? null : message;
  },
  
  pattern: (regex, message = '入力形式が正しくありません') => (value) => {
    return !value || regex.test(value) ? null : message;
  }
};

/**
 * フィールドをバリデーション
 * @param {*} value - 検証する値
 * @param {Array} rules - バリデーションルール配列
 * @returns {string|null} エラーメッセージまたはnull
 */
export function validateField(value, rules) {
  for (const rule of rules) {
    const error = typeof rule === 'function' ? rule(value) : rule;
    if (error) return error;
  }
  return null;
}

// ==============================================
// 6. ローカルストレージ管理
// ==============================================

export const storage = {
  /**
   * データを保存
   * @param {string} key - キー
   * @param {*} value - 値
   * @param {number} expireMs - 有効期限（ミリ秒）
   */
  set(key, value, expireMs = null) {
    const data = {
      value,
      timestamp: Date.now(),
      expireMs
    };
    localStorage.setItem(key, JSON.stringify(data));
  },

  /**
   * データを取得
   * @param {string} key - キー
   * @returns {*} 値またはnull
   */
  get(key) {
    const item = localStorage.getItem(key);
    if (!item) return null;

    try {
      const data = JSON.parse(item);
      
      // 有効期限チェック
      if (data.expireMs && Date.now() - data.timestamp > data.expireMs) {
        this.remove(key);
        return null;
      }
      
      return data.value;
    } catch {
      return null;
    }
  },

  /**
   * データを削除
   * @param {string} key - キー
   */
  remove(key) {
    localStorage.removeItem(key);
  },

  /**
   * すべてクリア
   */
  clear() {
    localStorage.clear();
  }
};

// ==============================================
// 7. デバウンス・スロットル
// ==============================================

/**
 * デバウンス関数
 * @param {Function} func - 実行する関数
 * @param {number} wait - 待機時間（ミリ秒）
 * @returns {Function} デバウンスされた関数
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * スロットル関数
 * @param {Function} func - 実行する関数
 * @param {number} limit - 制限時間（ミリ秒）
 * @returns {Function} スロットルされた関数
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ==============================================
// 8. DOM操作ヘルパー
// ==============================================

export const dom = {
  /**
   * 要素を作成
   * @param {string} tag - タグ名
   * @param {Object} attrs - 属性
   * @param {string|Array} children - 子要素
   * @returns {HTMLElement} 作成された要素
   */
  createElement(tag, attrs = {}, children = []) {
    const element = document.createElement(tag);
    
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else if (key.startsWith('on')) {
        const event = key.substring(2).toLowerCase();
        element.addEventListener(event, value);
      } else {
        element.setAttribute(key, value);
      }
    });
    
    const childArray = Array.isArray(children) ? children : [children];
    childArray.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        element.appendChild(child);
      }
    });
    
    return element;
  },

  /**
   * 要素を選択
   * @param {string} selector - セレクター
   * @param {HTMLElement} parent - 親要素
   * @returns {HTMLElement|null} 要素
   */
  select(selector, parent = document) {
    return parent.querySelector(selector);
  },

  /**
   * 複数要素を選択
   * @param {string} selector - セレクター
   * @param {HTMLElement} parent - 親要素
   * @returns {NodeList} 要素のリスト
   */
  selectAll(selector, parent = document) {
    return parent.querySelectorAll(selector);
  }
};

// ==============================================
// 9. 初期化
// ==============================================

// ページ読み込み時に自動初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loading.init();
    toast.init();
  });
} else {
  loading.init();
  toast.init();
}

// グローバルに公開（レガシーコード互換性）
window.AdminCore = {
  escapeHtml,
  formatDate,
  countCharacters,
  formatFileSize,
  generateId,
  loading,
  toast,
  getErrorMessage,
  handleError,
  validators,
  validateField,
  storage,
  debounce,
  throttle,
  dom
};

console.log('✅ Admin Core Library loaded');
