/**
 * API クライアント (api-client.js)
 * 統一されたAPI呼び出しインターフェース
 * Version: 1.0.0
 * Created: 2026-02-18
 */

import { loading, toast, handleError } from './admin-core.js';

// ==============================================
// 1. APIクライアント設定
// ==============================================

const API_CONFIG = {
  baseURL: '/api/tables',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
};

// ==============================================
// 2. HTTPリクエストクラス
// ==============================================

class HttpClient {
  constructor(config = {}) {
    this.config = { ...API_CONFIG, ...config };
  }

  /**
   * HTTPリクエストを実行
   * @param {string} method - HTTPメソッド
   * @param {string} url - URL
   * @param {Object} options - オプション
   * @returns {Promise} レスポンス
   */
  async request(method, url, options = {}) {
    const {
      data = null,
      params = {},
      headers = {},
      showLoading = false,
      loadingMessage = '読み込み中...'
    } = options;

    // ローディング表示
    if (showLoading) {
      loading.show(loadingMessage);
    }

    try {
      // URLパラメータを構築
      const queryString = new URLSearchParams(params).toString();
      const fullUrl = queryString ? `${url}?${queryString}` : url;

      // リクエストオプション
      const requestOptions = {
        method,
        headers: {
          ...this.config.headers,
          ...headers
        }
      };

      // ボディデータ
      if (data && method !== 'GET') {
        requestOptions.body = JSON.stringify(data);
      }

      // タイムアウト処理
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
      requestOptions.signal = controller.signal;

      // リクエスト実行
      const response = await fetch(fullUrl, requestOptions);
      clearTimeout(timeoutId);

      // レスポンス処理
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      // エラーハンドリング
      if (error.name === 'AbortError') {
        throw new Error('リクエストがタイムアウトしました');
      }
      throw error;

    } finally {
      // ローディング非表示
      if (showLoading) {
        loading.hide();
      }
    }
  }

  // HTTPメソッド
  get(url, options = {}) {
    return this.request('GET', url, options);
  }

  post(url, data, options = {}) {
    return this.request('POST', url, { ...options, data });
  }

  put(url, data, options = {}) {
    return this.request('PUT', url, { ...options, data });
  }

  patch(url, data, options = {}) {
    return this.request('PATCH', url, { ...options, data });
  }

  delete(url, options = {}) {
    return this.request('DELETE', url, options);
  }
}

// HTTPクライアントインスタンス
const http = new HttpClient();

// ==============================================
// 3. CRUDベースクラス
// ==============================================

class CRUDService {
  constructor(tableName) {
    this.tableName = tableName;
    this.baseURL = `${API_CONFIG.baseURL}/${tableName}`;
  }

  /**
   * リスト取得
   * @param {Object} options - オプション（page, limit, sort, filter）
   * @returns {Promise} データリスト
   */
  async list(options = {}) {
    const {
      page = 1,
      limit = 25,
      sort = '-created_at',
      filter = {},
      showLoading = true
    } = options;

    try {
      const params = {
        page,
        limit,
        sort,
        ...filter
      };

      const response = await http.get(this.baseURL, {
        params,
        showLoading,
        loadingMessage: 'データを読み込んでいます...'
      });

      return response;
    } catch (error) {
      handleError(error, 'データの読み込み');
      throw error;
    }
  }

  /**
   * 単一データ取得
   * @param {number|string} id - データID
   * @returns {Promise} データ
   */
  async get(id, options = {}) {
    const { showLoading = true } = options;

    try {
      const response = await http.get(`${this.baseURL}/${id}`, {
        showLoading,
        loadingMessage: 'データを読み込んでいます...'
      });

      return response.data;
    } catch (error) {
      handleError(error, 'データの取得');
      throw error;
    }
  }

  /**
   * データ作成
   * @param {Object} data - 作成するデータ
   * @returns {Promise} 作成されたデータ
   */
  async create(data, options = {}) {
    const {
      showLoading = true,
      showToast = true,
      successMessage = '作成しました'
    } = options;

    try {
      const response = await http.post(this.baseURL, data, {
        showLoading,
        loadingMessage: '作成中...'
      });

      if (showToast) {
        toast.success('成功', successMessage);
      }

      return response.data;
    } catch (error) {
      handleError(error, 'データの作成');
      throw error;
    }
  }

  /**
   * データ更新
   * @param {number|string} id - データID
   * @param {Object} data - 更新するデータ
   * @returns {Promise} 更新されたデータ
   */
  async update(id, data, options = {}) {
    const {
      showLoading = true,
      showToast = true,
      successMessage = '更新しました'
    } = options;

    try {
      const response = await http.put(`${this.baseURL}/${id}`, data, {
        showLoading,
        loadingMessage: '更新中...'
      });

      if (showToast) {
        toast.success('成功', successMessage);
      }

      return response.data;
    } catch (error) {
      handleError(error, 'データの更新');
      throw error;
    }
  }

  /**
   * 部分更新
   * @param {number|string} id - データID
   * @param {Object} data - 更新するデータ
   * @returns {Promise} 更新されたデータ
   */
  async patch(id, data, options = {}) {
    const {
      showLoading = false,
      showToast = false
    } = options;

    try {
      const response = await http.patch(`${this.baseURL}/${id}`, data, {
        showLoading,
        loadingMessage: '更新中...'
      });

      if (showToast) {
        toast.success('成功', '更新しました');
      }

      return response.data;
    } catch (error) {
      handleError(error, 'データの更新');
      throw error;
    }
  }

  /**
   * データ削除
   * @param {number|string} id - データID
   * @returns {Promise} 削除結果
   */
  async delete(id, options = {}) {
    const {
      showLoading = true,
      showToast = true,
      successMessage = '削除しました',
      confirmMessage = '本当に削除しますか？'
    } = options;

    // 確認ダイアログ
    if (confirmMessage && !confirm(confirmMessage)) {
      return null;
    }

    try {
      await http.delete(`${this.baseURL}/${id}`, {
        showLoading,
        loadingMessage: '削除中...'
      });

      if (showToast) {
        toast.success('成功', successMessage);
      }

      return true;
    } catch (error) {
      handleError(error, 'データの削除');
      throw error;
    }
  }

  /**
   * 一括削除
   * @param {Array} ids - データIDの配列
   * @returns {Promise} 削除結果
   */
  async bulkDelete(ids, options = {}) {
    const {
      showLoading = true,
      showToast = true,
      confirmMessage = `${ids.length}件のデータを削除しますか？`
    } = options;

    // 確認ダイアログ
    if (confirmMessage && !confirm(confirmMessage)) {
      return null;
    }

    try {
      if (showLoading) {
        loading.show('削除中...');
      }

      // 並列削除
      const promises = ids.map(id => http.delete(`${this.baseURL}/${id}`));
      await Promise.all(promises);

      if (showToast) {
        toast.success('成功', `${ids.length}件のデータを削除しました`);
      }

      return true;
    } catch (error) {
      handleError(error, '一括削除');
      throw error;
    } finally {
      if (showLoading) {
        loading.hide();
      }
    }
  }

  /**
   * 一括更新
   * @param {Array} items - 更新するデータの配列 [{id, data}, ...]
   * @returns {Promise} 更新結果
   */
  async bulkUpdate(items, options = {}) {
    const {
      showLoading = true,
      showToast = true,
      successMessage = `${items.length}件のデータを更新しました`
    } = options;

    try {
      if (showLoading) {
        loading.show('更新中...');
      }

      // 並列更新
      const promises = items.map(({ id, data }) => 
        http.put(`${this.baseURL}/${id}`, data)
      );
      const results = await Promise.all(promises);

      if (showToast) {
        toast.success('成功', successMessage);
      }

      return results;
    } catch (error) {
      handleError(error, '一括更新');
      throw error;
    } finally {
      if (showLoading) {
        loading.hide();
      }
    }
  }
}

// ==============================================
// 4. テーブル別サービス
// ==============================================

class BlogPostService extends CRUDService {
  constructor() {
    super('blog_posts');
  }

  // ブログ特有のメソッドを追加可能
  async publish(id) {
    return this.patch(id, { status: 'published' }, {
      showToast: true,
      successMessage: '記事を公開しました'
    });
  }

  async unpublish(id) {
    return this.patch(id, { status: 'draft' }, {
      showToast: true,
      successMessage: '記事を下書きに戻しました'
    });
  }
}

class EventService extends CRUDService {
  constructor() {
    super('events');
  }
}

class NewsletterService extends CRUDService {
  constructor() {
    super('school_newsletters');
  }
}

class SchoolRuleService extends CRUDService {
  constructor() {
    super('school_rules');
  }
}

class BullyingPreventionService extends CRUDService {
  constructor() {
    super('bullying_prevention_policies');
  }
}

// ==============================================
// 5. サービスインスタンス
// ==============================================

export const api = {
  blogPosts: new BlogPostService(),
  events: new EventService(),
  newsletters: new NewsletterService(),
  schoolRules: new SchoolRuleService(),
  bullyingPrevention: new BullyingPreventionService(),
  
  // カスタムサービスを作成
  createService: (tableName) => new CRUDService(tableName)
};

// ==============================================
// 6. レガシー互換性
// ==============================================

// グローバルに公開
window.API = api;
window.HttpClient = http;

console.log('✅ API Client loaded');
