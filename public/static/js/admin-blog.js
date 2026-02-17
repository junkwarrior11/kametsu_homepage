// ========================================
// ブログ記事管理
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
        const response = await fetch('/api/tables/blog_posts?sort=-created_at');
        const result = await response.json();
        const posts = result.data || [];
        
        if (posts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #9ca3af;">まだ記事がありません</td></tr>';
            return;
        }
        
        tbody.innerHTML = posts.map(post => `
            <tr>
                <td>${escapeHtml(post.title)}</td>
                <td><span class="status-badge ${post.category === '行事' ? 'published' : 'draft'}">${escapeHtml(post.category)}</span></td>
                <td>${escapeHtml(post.author)}</td>
                <td>${formatDate(post.publish_date)}</td>
                <td><span class="status-badge ${post.status === '公開' ? 'published' : 'draft'}">${escapeHtml(post.status)}</span></td>
                <td class="table-actions">
                    <button class="btn-edit" onclick="editPost('${post.id}')"><i class="fas fa-edit"></i> 編集</button>
                    <button class="btn-delete" onclick="deletePost('${post.id}')"><i class="fas fa-trash"></i> 削除</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading posts:', error);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #ef4444;">読み込みに失敗しました</td></tr>';
    }
}

// フォームのセットアップ
function setupForm() {
    const form = document.getElementById('blogForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('title').value,
            category: document.getElementById('category').value,
            status: document.getElementById('status').value,
            author: document.getElementById('author').value,
            publish_date: new Date(document.getElementById('publish_date').value).toISOString(),
            featured_image: document.getElementById('featured_image').value,
            content: document.getElementById('content').value
        };
        
        try {
            let response;
            
            if (currentEditId) {
                // 更新
                response = await fetch(`tables/blog_posts/${currentEditId}`, {
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
                alert(currentEditId ? '記事を更新しました' : '記事を作成しました');
                hidePostForm();
                loadPosts();
            } else {
                throw new Error('保存に失敗しました');
            }
        } catch (error) {
            console.error('Error saving post:', error);
            alert('保存に失敗しました。もう一度お試しください。');
        }
    });
}

// 新規投稿フォームを表示
function showPostForm() {
    currentEditId = null;
    document.getElementById('formTitle').textContent = '新規投稿';
    document.getElementById('blogForm').reset();
    
    // デフォルト値を設定
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('publish_date').value = now.toISOString().slice(0, 16);
    
    // 画像プレビューをリセット
    const previewContainer = document.getElementById('blog-preview-container');
    if (previewContainer) {
        previewContainer.style.display = 'none';
    }
    
    document.getElementById('postForm').style.display = 'flex';
}

// フォームを非表示
function hidePostForm() {
    document.getElementById('postForm').style.display = 'none';
    currentEditId = null;
}

// 記事を編集
async function editPost(id) {
    try {
        const response = await fetch(`tables/blog_posts/${id}`);
        const post = await response.json();
        
        currentEditId = id;
        document.getElementById('formTitle').textContent = '記事を編集';
        
        // フォームに値を設定
        document.getElementById('title').value = post.title;
        document.getElementById('category').value = post.category;
        document.getElementById('status').value = post.status;
        document.getElementById('author').value = post.author;
        
        // 日時を変換
        const date = new Date(post.publish_date);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        document.getElementById('publish_date').value = date.toISOString().slice(0, 16);
        
        document.getElementById('featured_image').value = post.featured_image || '';
        document.getElementById('content').value = post.content;
        
        // 画像プレビューを更新
        updateBlogImagePreview(post.featured_image);
        
        document.getElementById('postForm').style.display = 'flex';
    } catch (error) {
        console.error('Error loading post:', error);
        alert('記事の読み込みに失敗しました');
    }
}

// 記事を削除
async function deletePost(id) {
    if (!confirm('本当にこの記事を削除しますか?')) {
        return;
    }
    
    try {
        const response = await fetch(`tables/blog_posts/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('記事を削除しました');
            loadPosts();
        } else {
            throw new Error('削除に失敗しました');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('削除に失敗しました');
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

/**
 * 画像プレビューを更新（編集時）
 */
function updateBlogImagePreview(imageUrl) {
    const previewContainer = document.getElementById('blog-preview-container');
    const previewImg = document.getElementById('blog-preview-img');
    
    if (imageUrl && previewContainer && previewImg) {
        previewImg.src = imageUrl;
        previewContainer.style.display = 'block';
    } else if (previewContainer) {
        previewContainer.style.display = 'none';
    }
}

// グローバル関数
window.showPostForm = showPostForm;
window.hidePostForm = hidePostForm;
window.editPost = editPost;
window.deletePost = deletePost;
window.openBlogImagePicker = openBlogImagePicker;
window.removeBlogImage = removeBlogImage;

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}