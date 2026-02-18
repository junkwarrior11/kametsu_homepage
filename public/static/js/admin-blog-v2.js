/**
 * ブログ記事管理（統合版）
 * 新しいコアライブラリを使用
 * Version: 2.0.0
 * Created: 2026-02-18
 */

// コアライブラリをインポート
import { toast, loading, escapeHtml, formatDate, storage, debounce } from './core/admin-core.js';
import { api } from './core/api-client.js';

// ==============================================
// 1. 状態管理
// ==============================================

const state = {
  currentEditId: null,
  posts: [],
  managers: {
    bulk: null,
    dragDrop: null,
    autoSave: null
  }
};

// ==============================================
// 2. 記事一覧の読み込み
// ==============================================

async function loadPosts() {
  const tbody = document.getElementById('postsTableBody');
  
  try {
    // APIクライアントを使用して記事を取得
    const response = await api.blogPosts.list({
      sort: '-created_at',
      showLoading: true
    });
    
    state.posts = response.data || [];
    
    if (state.posts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #9ca3af;">まだ記事がありません</td></tr>';
      return;
    }
    
    renderPosts();
    enableInlineEditing();
    reinitializePhase3Features();
    
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #ef4444;">読み込みに失敗しました</td></tr>';
  }
}

/**
 * 記事をレンダリング
 */
function renderPosts() {
  const tbody = document.getElementById('postsTableBody');
  
  tbody.innerHTML = state.posts.map(post => `
    <tr data-id="${post.id}">
      <td class="editable-title" data-id="${post.id}">${escapeHtml(post.title)}</td>
      <td><span class="status-badge ${post.category === '行事' ? 'published' : 'draft'}">${escapeHtml(post.category)}</span></td>
      <td>${escapeHtml(post.author)}</td>
      <td>${formatDate(post.publish_date)}</td>
      <td class="editable-status" data-id="${post.id}">
        <span class="status-badge ${post.status === '公開' ? 'published' : 'draft'}">${escapeHtml(post.status)}</span>
      </td>
      <td class="table-actions-improved">
        <button class="action-btn action-btn-edit" onclick="window.editPost('${post.id}')">
          <i class="fas fa-edit"></i> 編集
        </button>
        <button class="action-btn action-btn-delete" onclick="window.deletePost('${post.id}')">
          <i class="fas fa-trash"></i> 削除
        </button>
      </td>
    </tr>
  `).join('');
}

// ==============================================
// 3. インライン編集
// ==============================================

function enableInlineEditing() {
  // タイトルのインライン編集
  makeInlineEditable('.editable-title', {
    type: 'text',
    onSave: async (newValue, cell) => {
      const id = cell.dataset.id;
      await api.blogPosts.patch(id, { title: newValue }, {
        showToast: true,
        successMessage: 'タイトルを更新しました'
      });
    }
  });
  
  // ステータスのインライン編集
  document.querySelectorAll('.editable-status').forEach(cell => {
    cell.classList.add('editable-cell');
    cell.onclick = function() {
      if (!this.classList.contains('editing')) {
        const id = this.dataset.id;
        const currentStatus = this.querySelector('.status-badge').textContent.trim();
        
        new InlineEditor(this, {
          type: 'select',
          options: ['公開', '下書き'],
          value: currentStatus,
          onSave: async (newValue) => {
            await api.blogPosts.patch(id, { status: newValue }, {
              showToast: true,
              successMessage: 'ステータスを更新しました'
            });
            
            // 表示を更新
            const badge = this.querySelector('.status-badge');
            badge.textContent = newValue;
            badge.className = `status-badge ${newValue === '公開' ? 'published' : 'draft'}`;
          }
        });
      }
    };
  });
}

// ==============================================
// 4. フォーム処理
// ==============================================

function setupForm() {
  const form = document.getElementById('blogForm');
  if (!form) return;
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // フォームデータを取得
    const formData = {
      title: document.getElementById('postTitle').value,
      category: document.getElementById('postCategory').value,
      status: document.getElementById('postStatus').value,
      author: document.getElementById('postAuthor').value,
      publish_date: document.getElementById('publishDate').value,
      featured_image: document.getElementById('featuredImageUrl').value,
      content: document.getElementById('postContent').value
    };
    
    try {
      if (state.currentEditId) {
        // 更新
        await api.blogPosts.update(state.currentEditId, formData, {
          showLoading: true,
          showToast: true,
          successMessage: '記事を更新しました'
        });
      } else {
        // 新規作成
        await api.blogPosts.create(formData, {
          showLoading: true,
          showToast: true,
          successMessage: '記事を作成しました'
        });
      }
      
      // フォームをリセット
      hidePostForm();
      await loadPosts();
      
      // 自動保存データを削除
      storage.remove('blog_autosave');
      
    } catch (error) {
      // エラーは api-client.js で処理済み
    }
  });
}

// ==============================================
// 5. CRUD操作
// ==============================================

async function editPost(id) {
  try {
    state.currentEditId = id;
    
    // APIクライアントを使用してデータを取得
    const post = await api.blogPosts.get(id, { showLoading: true });
    
    // フォームに値を設定
    document.getElementById('postTitle').value = post.title || '';
    document.getElementById('postCategory').value = post.category || 'お知らせ';
    document.getElementById('postStatus').value = post.status || '下書き';
    document.getElementById('postAuthor').value = post.author || '';
    document.getElementById('publishDate').value = post.publish_date ? post.publish_date.split('T')[0] : '';
    document.getElementById('featuredImageUrl').value = post.featured_image || '';
    document.getElementById('postContent').value = post.content || '';
    
    // 画像プレビュー
    if (post.featured_image) {
      updateBlogImagePreview(post.featured_image);
    }
    
    // サイドパネルを開く
    document.getElementById('postFormPanel').classList.add('open');
    
  } catch (error) {
    // エラーは api-client.js で処理済み
  }
}

async function deletePost(id) {
  // APIクライアントを使用して削除
  const result = await api.blogPosts.delete(id, {
    showLoading: true,
    showToast: true,
    confirmMessage: '本当に削除しますか？この操作は元に戻せません。',
    successMessage: '記事を削除しました'
  });
  
  if (result) {
    await loadPosts();
  }
}

function showPostForm() {
  state.currentEditId = null;
  
  // フォームをリセット
  document.getElementById('blogForm').reset();
  
  // デフォルト値を設定
  document.getElementById('postStatus').value = '下書き';
  document.getElementById('postAuthor').value = 'admin';
  document.getElementById('publishDate').value = new Date().toISOString().split('T')[0];
  
  // 画像プレビューをクリア
  document.querySelector('.image-preview-container').style.display = 'none';
  
  // サイドパネルを開く
  document.getElementById('postFormPanel').classList.add('open');
  
  // 最初の入力欄にフォーカス
  setTimeout(() => {
    document.getElementById('postTitle').focus();
  }, 300);
}

function hidePostForm() {
  document.getElementById('postFormPanel').classList.remove('open');
  state.currentEditId = null;
}

// ==============================================
// 6. 画像処理
// ==============================================

function openBlogImagePicker() {
  if (window.imagePickerModal) {
    window.imagePickerModal.open((imageUrl) => {
      document.getElementById('featuredImageUrl').value = imageUrl;
      updateBlogImagePreview(imageUrl);
    });
  }
}

function removeBlogImage() {
  document.getElementById('featuredImageUrl').value = '';
  document.querySelector('.image-preview-container').style.display = 'none';
}

function updateBlogImagePreview(imageUrl) {
  const container = document.querySelector('.image-preview-container');
  const img = container.querySelector('img');
  
  if (imageUrl) {
    img.src = imageUrl;
    container.style.display = 'block';
  } else {
    container.style.display = 'none';
  }
}

// ==============================================
// 7. Phase 3 機能統合
// ==============================================

function setupPhase3Features() {
  const table = document.getElementById('postsTable');
  if (!table) return;
  
  // ドラッグ&ドロップ
  if (window.DragDropManager) {
    state.managers.dragDrop = new window.DragDropManager('#postsTable', {
      onDrop: async (id, newIndex) => {
        try {
          // 順序を更新（実装は環境による）
          await api.blogPosts.patch(id, { display_order: newIndex }, {
            showToast: false
          });
          toast.success('並び替え完了', '記事の順序を更新しました');
        } catch (error) {
          toast.error('エラー', '並び替えに失敗しました');
        }
      }
    });
  }
  
  // 一括操作
  if (window.BulkActionManager) {
    state.managers.bulk = new window.BulkActionManager('#postsTable', {
      onBulkDelete: async (ids) => {
        const result = await api.blogPosts.bulkDelete(ids, {
          showLoading: true,
          showToast: true,
          confirmMessage: `${ids.length}件の記事を削除しますか？`
        });
        
        if (result) {
          await loadPosts();
        }
      },
      onBulkStatusChange: async (ids, status) => {
        const items = ids.map(id => ({
          id,
          data: { status }
        }));
        
        await api.blogPosts.bulkUpdate(items, {
          showLoading: true,
          showToast: true,
          successMessage: `${ids.length}件の記事を「${status}」に変更しました`
        });
        
        await loadPosts();
      }
    });
  }
  
  // 自動保存
  if (window.AutoSaveManager) {
    state.managers.autoSave = new window.AutoSaveManager('#blogForm', {
      key: 'blog_autosave',
      interval: 30000,
      onSave: (data) => {
        console.log('Auto-saved:', data);
      },
      onRestore: (data) => {
        if (confirm('保存されていないデータがあります。復元しますか？')) {
          Object.entries(data).forEach(([key, value]) => {
            const input = document.getElementById(key);
            if (input) input.value = value;
          });
          
          // 画像プレビューも復元
          if (data.featuredImageUrl) {
            updateBlogImagePreview(data.featuredImageUrl);
          }
        } else {
          storage.remove('blog_autosave');
        }
      }
    });
  }
  
  // CSVエクスポート
  const exportBtn = document.getElementById('exportCsvBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      if (window.exportToCSV && state.posts.length > 0) {
        const columns = [
          { key: 'title', label: 'タイトル' },
          { key: 'category', label: 'カテゴリ' },
          { key: 'author', label: '著者' },
          { key: 'publish_date', label: '公開日' },
          { key: 'status', label: 'ステータス' },
          { key: 'content', label: '内容' }
        ];
        
        const filename = `blog_posts_${new Date().toISOString().split('T')[0]}.csv`;
        window.exportToCSV(state.posts, columns, filename);
        
        toast.success('エクスポート完了', `${state.posts.length}件の記事をエクスポートしました`);
      }
    });
  }
}

function reinitializePhase3Features() {
  if (state.managers.bulk) {
    state.managers.bulk.addCheckboxes();
  }
  if (state.managers.dragDrop) {
    state.managers.dragDrop.init();
  }
}

// ==============================================
// 8. 初期化
// ==============================================

document.addEventListener('DOMContentLoaded', function() {
  loadPosts();
  setupForm();
  setupPhase3Features();
});

// ==============================================
// 9. グローバル公開（レガシー互換性）
// ==============================================

window.editPost = editPost;
window.deletePost = deletePost;
window.showPostForm = showPostForm;
window.hidePostForm = hidePostForm;
window.openBlogImagePicker = openBlogImagePicker;
window.removeBlogImage = removeBlogImage;
window.updateBlogImagePreview = updateBlogImagePreview;

console.log('✅ Blog Management (v2.0 - Integrated) loaded');
