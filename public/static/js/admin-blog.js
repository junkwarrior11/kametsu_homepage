// ========================================
// ブログ記事管理（UI改善版）
// ========================================

let currentEditId = null;

document.addEventListener('DOMContentLoaded', function() {
    loadPosts();
    setupForm();
});

// 記事一覧を読み込む
async function loadPosts() {
    const tbody = document.getElementById('postsTableBody');
    
    try {
        loading.show('記事を読み込み中...');
        const response = await fetch('/api/tables/blog_posts?sort=-created_at');
        const result = await response.json();
        const posts = result.data || [];
        
        loading.hide();
        
        if (posts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #9ca3af;">まだ記事がありません</td></tr>';
            return;
        }
        
        tbody.innerHTML = posts.map(post => `
            <tr>
                <td class="editable-title" data-id="${post.id}">${escapeHtml(post.title)}</td>
                <td><span class="status-badge ${post.category === '行事' ? 'published' : 'draft'}">${escapeHtml(post.category)}</span></td>
                <td>${escapeHtml(post.author)}</td>
                <td>${formatDate(post.publish_date)}</td>
                <td class="editable-status" data-id="${post.id}">
                    <span class="status-badge ${post.status === '公開' ? 'published' : 'draft'}">${escapeHtml(post.status)}</span>
                </td>
                <td class="table-actions-improved">
                    <button class="action-btn action-btn-edit" onclick="editPost('${post.id}')">
                        <i class="fas fa-edit"></i> 編集
                    </button>
                    <button class="action-btn action-btn-delete" onclick="deletePost('${post.id}')">
                        <i class="fas fa-trash"></i> 削除
                    </button>
                </td>
            </tr>
        `).join('');
        
        // インライン編集を有効化
        enableInlineEditing();
        
    } catch (error) {
        console.error('Error loading posts:', error);
        loading.hide();
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #ef4444;">読み込みに失敗しました</td></tr>';
        toast.error('読み込みエラー', '記事の読み込みに失敗しました');
    }
}

// インライン編集を有効化
function enableInlineEditing() {
    // タイトルのインライン編集
    makeInlineEditable('.editable-title', {
        type: 'text',
        onSave: async (newValue, cell) => {
            const id = cell.dataset.id;
            const response = await fetch(`/api/tables/blog_posts/${id}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ title: newValue })
            });
            
            if (!response.ok) {
                throw new Error('保存に失敗しました');
            }
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
                    selectOptions: [
                        { value: '公開', label: '公開' },
                        { value: '下書き', label: '下書き' }
                    ],
                    onSave: async (newValue) => {
                        const response = await fetch(`/api/tables/blog_posts/${id}`, {
                            method: 'PATCH',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ status: newValue })
                        });
                        
                        if (!response.ok) {
                            throw new Error('保存に失敗しました');
                        }
                        
                        // バッジを更新
                        this.innerHTML = `<span class="status-badge ${newValue === '公開' ? 'published' : 'draft'}">${newValue}</span>`;
                        this.classList.remove('editing');
                    }
                });
            }
        };
    });
}

// フォームのセットアップ
function setupForm() {
    // 従来のモーダルは非表示にして使わない
    const oldModal = document.getElementById('postForm');
    if (oldModal) {
        oldModal.style.display = 'none';
    }
}

// 新規投稿フォームを表示（サイドパネル使用）
function showPostForm() {
    currentEditId = null;
    
    const formContent = createBlogForm();
    
    sidePanel.open('新規投稿', formContent, {
        cancelText: 'キャンセル',
        saveText: '保存',
        onSave: async () => {
            await saveBlogPost();
        }
    });
    
    // フォームバリデーションを設定
    setupFormValidation();
}

// ブログフォームHTMLを生成
function createBlogForm(post = null) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const defaultDate = now.toISOString().slice(0, 16);
    
    const formHtml = `
        <form id="blogFormSidepanel">
            <input type="hidden" id="postId" value="${post ? post.id : ''}">
            
            <div class="form-field">
                <label for="title">
                    タイトル <span class="required">*</span>
                </label>
                <input type="text" id="title" name="title" value="${post ? escapeHtml(post.title) : ''}" required>
                <div class="field-error"></div>
            </div>
            
            <div class="form-row">
                <div class="form-field">
                    <label for="category">
                        カテゴリー <span class="required">*</span>
                    </label>
                    <select id="category" name="category" required>
                        <option value="行事" ${post && post.category === '行事' ? 'selected' : ''}>行事</option>
                        <option value="お知らせ" ${post && post.category === 'お知らせ' ? 'selected' : ''}>お知らせ</option>
                        <option value="活動報告" ${post && post.category === '活動報告' ? 'selected' : ''}>活動報告</option>
                        <option value="その他" ${post && post.category === 'その他' ? 'selected' : ''}>その他</option>
                    </select>
                    <div class="field-error"></div>
                </div>
                
                <div class="form-field">
                    <label for="status">
                        公開状態 <span class="required">*</span>
                    </label>
                    <select id="status" name="status" required>
                        <option value="公開" ${post && post.status === '公開' ? 'selected' : ''}>公開</option>
                        <option value="下書き" ${post && post.status === '下書き' ? 'selected' : ''}>下書き</option>
                    </select>
                    <div class="field-error"></div>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-field">
                    <label for="author">
                        投稿者 <span class="required">*</span>
                    </label>
                    <input type="text" id="author" name="author" value="${post ? escapeHtml(post.author) : ''}" required>
                    <div class="field-error"></div>
                </div>
                
                <div class="form-field">
                    <label for="publish_date">
                        公開日時 <span class="required">*</span>
                    </label>
                    <input type="datetime-local" id="publish_date" name="publish_date" 
                           value="${post ? formatDateTimeLocal(post.publish_date) : defaultDate}" required>
                    <div class="field-error"></div>
                </div>
            </div>
            
            <div class="form-field">
                <label for="featured_image">
                    アイキャッチ画像
                    <span class="field-hint">（オプション）</span>
                </label>
                <input type="text" id="featured_image" name="featured_image" 
                       placeholder="画像URLまたはアップロードしてください" 
                       value="${post && post.featured_image ? escapeHtml(post.featured_image) : ''}">
                <button type="button" class="image-upload-btn" onclick="openBlogImagePicker()">
                    <i class="fas fa-upload"></i> 画像をアップロード
                </button>
                <div class="image-preview-container" id="blog-preview-container" style="${post && post.featured_image ? 'display: block;' : 'display: none;'}">
                    <img src="${post && post.featured_image ? escapeHtml(post.featured_image) : ''}" alt="プレビュー" id="blog-preview-img">
                    <div class="image-preview-actions">
                        <button type="button" class="btn-change-image" onclick="openBlogImagePicker()">
                            <i class="fas fa-exchange-alt"></i> 変更
                        </button>
                        <button type="button" class="btn-remove-image" onclick="removeBlogImage()">
                            <i class="fas fa-trash"></i> 削除
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="form-field">
                <label for="content">
                    本文 <span class="required">*</span>
                </label>
                <textarea id="content" name="content" rows="15" required>${post ? escapeHtml(post.content) : ''}</textarea>
                <div class="character-count">
                    <span id="content-count">0</span> / 5000文字
                </div>
                <div class="field-error"></div>
            </div>
        </form>
    `;
    
    return formHtml;
}

// フォームバリデーションを設定
function setupFormValidation() {
    const form = document.getElementById('blogFormSidepanel');
    if (!form) return;
    
    const validator = createFormValidator(form);
    
    validator.addRule('title', {
        required: true,
        minLength: 3,
        maxLength: 200,
        requiredMessage: 'タイトルを入力してください'
    });
    
    validator.addRule('content', {
        required: true,
        minLength: 10,
        maxLength: 5000,
        requiredMessage: '本文を入力してください'
    });
    
    validator.addRule('author', {
        required: true,
        requiredMessage: '投稿者を入力してください'
    });
    
    // 文字数カウント
    const contentField = document.getElementById('content');
    const countSpan = document.getElementById('content-count');
    
    contentField.addEventListener('input', () => {
        const length = contentField.value.length;
        countSpan.textContent = length;
        
        if (length > 5000) {
            countSpan.parentElement.classList.add('error');
        } else if (length > 4500) {
            countSpan.parentElement.classList.add('warning');
            countSpan.parentElement.classList.remove('error');
        } else {
            countSpan.parentElement.classList.remove('warning', 'error');
        }
    });
    
    // 初期カウント
    contentField.dispatchEvent(new Event('input'));
}

// ブログ記事を保存
async function saveBlogPost() {
    const form = document.getElementById('blogFormSidepanel');
    
    // バリデーションチェック
    const validator = createFormValidator(form);
    if (!validator.validateAll()) {
        toast.warning('入力エラー', 'フォームに入力エラーがあります');
        return;
    }
    
    const formData = {
        title: document.getElementById('title').value.trim(),
        category: document.getElementById('category').value,
        status: document.getElementById('status').value,
        author: document.getElementById('author').value.trim(),
        publish_date: new Date(document.getElementById('publish_date').value).toISOString(),
        featured_image: document.getElementById('featured_image').value.trim(),
        content: document.getElementById('content').value.trim()
    };
    
    try {
        sidePanel.setLoading(true);
        
        let response;
        
        if (currentEditId) {
            // 更新
            response = await fetch(`/api/tables/blog_posts/${currentEditId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });
        } else {
            // 新規作成
            response = await fetch('/api/tables/blog_posts', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });
        }
        
        if (response.ok) {
            toast.success(
                '保存完了',
                currentEditId ? '記事を更新しました' : '記事を作成しました'
            );
            sidePanel.close();
            loadPosts();
        } else {
            throw new Error('保存に失敗しました');
        }
    } catch (error) {
        console.error('Error saving post:', error);
        toast.error('保存失敗', error.message || '記事の保存に失敗しました。もう一度お試しください。');
    } finally {
        sidePanel.setLoading(false);
    }
}

// 記事を編集
async function editPost(id) {
    try {
        loading.show('記事を読み込み中...');
        const response = await fetch(`/api/tables/blog_posts/${id}`);
        const post = await response.json();
        loading.hide();
        
        currentEditId = id;
        
        const formContent = createBlogForm(post);
        
        sidePanel.open('記事を編集', formContent, {
            cancelText: 'キャンセル',
            saveText: '更新',
            onSave: async () => {
                await saveBlogPost();
            }
        });
        
        // フォームバリデーションを設定
        setupFormValidation();
        
    } catch (error) {
        console.error('Error loading post:', error);
        loading.hide();
        toast.error('読み込みエラー', '記事の読み込みに失敗しました');
    }
}

// 記事を削除
async function deletePost(id) {
    const confirmed = await confirmDialog(
        '記事を削除',
        '本当にこの記事を削除しますか？\nこの操作は元に戻せません。'
    );
    
    if (!confirmed) {
        return;
    }
    
    try {
        loading.show('削除中...');
        const response = await fetch(`/api/tables/blog_posts/${id}`, {
            method: 'DELETE'
        });
        
        loading.hide();
        
        if (response.ok) {
            toast.success('削除完了', '記事を削除しました');
            loadPosts();
        } else {
            throw new Error('削除に失敗しました');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        loading.hide();
        toast.error('削除エラー', '記事の削除に失敗しました');
    }
}

// ========================================
// 画像アップロード関連関数
// ========================================

/**
 * ブログ用の画像ピッカーを開く
 */
function openBlogImagePicker() {
    showImagePickerModal(function(imageUrl) {
        // 選択された画像URLをフィールドに設定
        const inputField = document.getElementById('featured_image');
        const previewContainer = document.getElementById('blog-preview-container');
        const previewImg = document.getElementById('blog-preview-img');
        
        if (inputField) {
            inputField.value = imageUrl;
        }
        
        if (previewContainer && previewImg) {
            previewImg.src = imageUrl;
            previewContainer.style.display = 'block';
        }
    });
}

/**
 * ブログ画像を削除
 */
function removeBlogImage() {
    const inputField = document.getElementById('featured_image');
    const previewContainer = document.getElementById('blog-preview-container');
    
    if (inputField) {
        inputField.value = '';
    }
    
    if (previewContainer) {
        previewContainer.style.display = 'none';
    }
}

// ========================================
// ユーティリティ関数
// ========================================

function formatDateTimeLocal(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
}

// グローバル関数
window.showPostForm = showPostForm;
window.editPost = editPost;
window.deletePost = deletePost;
window.openBlogImagePicker = openBlogImagePicker;
window.removeBlogImage = removeBlogImage;
