// ========================================
// 画像アップロード機能
// ========================================

/**
 * 画像をアップロードしてBase64形式でデータベースに保存
 * @param {File} file - アップロードする画像ファイル
 * @param {string} description - 画像の説明（オプション）
 * @returns {Promise<string>} - アップロードされた画像のData URL
 */
async function uploadImage(file, description = '') {
    // ファイルサイズチェック（5MB制限）
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        throw new Error('ファイルサイズが大きすぎます。5MB以下の画像を選択してください。');
    }
    
    // 画像タイプチェック
    if (!file.type.startsWith('image/')) {
        throw new Error('画像ファイルを選択してください。');
    }
    
    try {
        // 画像を読み込んでリサイズ
        const imageData = await resizeImage(file, 1200, 1200); // 最大1200x1200にリサイズ
        const thumbnail = await resizeImage(file, 200, 200); // サムネイル200x200
        
        // 画像サイズを取得
        const dimensions = await getImageDimensions(imageData);
        
        // データベースに保存
        const imageRecord = {
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
            image_data: imageData,
            thumbnail: thumbnail,
            width: dimensions.width,
            height: dimensions.height,
            uploaded_by: 'admin',
            description: description || file.name
        };
        
        const response = await fetch('tables/uploaded_images', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(imageRecord)
        });
        
        if (!response.ok) {
            throw new Error('画像のアップロードに失敗しました');
        }
        
        const result = await response.json();
        
        // Data URLを返す
        return imageData;
        
    } catch (error) {
        console.error('Image upload error:', error);
        throw error;
    }
}

/**
 * 画像をリサイズしてBase64に変換
 * @param {File} file - 画像ファイル
 * @param {number} maxWidth - 最大幅
 * @param {number} maxHeight - 最大高さ
 * @returns {Promise<string>} - Base64エンコードされた画像データ
 */
function resizeImage(file, maxWidth, maxHeight) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const img = new Image();
            
            img.onload = function() {
                // アスペクト比を保持してリサイズ
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth || height > maxHeight) {
                    const aspectRatio = width / height;
                    
                    if (width > height) {
                        width = maxWidth;
                        height = width / aspectRatio;
                    } else {
                        height = maxHeight;
                        width = height * aspectRatio;
                    }
                }
                
                // Canvasでリサイズ
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Base64に変換（JPEG品質80%）
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                resolve(dataUrl);
            };
            
            img.onerror = function() {
                reject(new Error('画像の読み込みに失敗しました'));
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = function() {
            reject(new Error('ファイルの読み込みに失敗しました'));
        };
        
        reader.readAsDataURL(file);
    });
}

/**
 * 画像のサイズを取得
 * @param {string} dataUrl - Data URL
 * @returns {Promise<{width: number, height: number}>}
 */
function getImageDimensions(dataUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = function() {
            resolve({
                width: img.width,
                height: img.height
            });
        };
        
        img.onerror = function() {
            reject(new Error('画像サイズの取得に失敗しました'));
        };
        
        img.src = dataUrl;
    });
}

/**
 * アップロード済み画像の一覧を取得
 * @param {number} limit - 取得件数
 * @returns {Promise<Array>} - 画像レコードの配列
 */
async function getUploadedImages(limit = 50) {
    try {
        const response = await fetch(`tables/uploaded_images?limit=${limit}&sort=-created_at`);
        
        if (!response.ok) {
            throw new Error('画像一覧の取得に失敗しました');
        }
        
        const result = await response.json();
        return result.data || [];
        
    } catch (error) {
        console.error('Get images error:', error);
        return [];
    }
}

/**
 * 画像を削除
 * @param {string} imageId - 画像ID
 */
async function deleteImage(imageId) {
    try {
        const response = await fetch(`tables/uploaded_images/${imageId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('画像の削除に失敗しました');
        }
        
        return true;
        
    } catch (error) {
        console.error('Delete image error:', error);
        throw error;
    }
}

/**
 * 画像選択モーダルを表示
 * @param {Function} callback - 画像が選択されたときのコールバック関数
 */
async function showImagePickerModal(callback) {
    const modal = document.createElement('div');
    modal.className = 'image-picker-modal';
    modal.innerHTML = `
        <div class="image-picker-overlay"></div>
        <div class="image-picker-content">
            <div class="image-picker-header">
                <h3>画像を選択</h3>
                <button class="close-modal" onclick="this.closest('.image-picker-modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="image-picker-tabs">
                <button class="tab-btn active" data-tab="upload">新規アップロード</button>
                <button class="tab-btn" data-tab="library">ライブラリから選択</button>
            </div>
            <div class="image-picker-body">
                <div class="tab-content active" data-tab="upload">
                    <div class="upload-area">
                        <input type="file" id="imageUploadInput" accept="image/*" style="display: none;">
                        <div class="upload-dropzone" onclick="document.getElementById('imageUploadInput').click()">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>クリックして画像を選択</p>
                            <small>または、ここに画像をドラッグ&ドロップ</small>
                            <small class="text-muted">（最大5MB、JPEG/PNG形式）</small>
                        </div>
                        <div class="upload-preview" style="display: none;">
                            <img id="previewImage" src="" alt="プレビュー">
                            <div class="upload-actions">
                                <button class="btn btn-primary" id="confirmUploadBtn">この画像を使用</button>
                                <button class="btn btn-secondary" onclick="document.getElementById('imageUploadInput').click()">別の画像を選択</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="tab-content" data-tab="library">
                    <div class="image-library-grid" id="imageLibraryGrid">
                        <div class="loading">読み込み中...</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // タブ切り替え
    modal.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            modal.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            modal.querySelector(`.tab-content[data-tab="${tab}"]`).classList.add('active');
            
            // ライブラリタブを開いたときに画像を読み込む
            if (tab === 'library') {
                loadImageLibrary();
            }
        });
    });
    
    // ファイル選択
    const fileInput = modal.querySelector('#imageUploadInput');
    const dropzone = modal.querySelector('.upload-dropzone');
    const previewArea = modal.querySelector('.upload-preview');
    const previewImage = modal.querySelector('#previewImage');
    
    let selectedFile = null;
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            selectedFile = file;
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                dropzone.style.display = 'none';
                previewArea.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // ドラッグ&ドロップ
    dropzone.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });
    
    dropzone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
    });
    
    dropzone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            selectedFile = file;
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                dropzone.style.display = 'none';
                previewArea.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // アップロード確定
    modal.querySelector('#confirmUploadBtn').addEventListener('click', async function() {
        if (!selectedFile) return;
        
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> アップロード中...';
        
        try {
            const imageUrl = await uploadImage(selectedFile);
            callback(imageUrl);
            modal.remove();
            showNotification('画像をアップロードしました', 'success');
        } catch (error) {
            showNotification(error.message, 'error');
            this.disabled = false;
            this.innerHTML = 'この画像を使用';
        }
    });
    
    // 画像ライブラリを読み込む関数
    async function loadImageLibrary() {
        const grid = modal.querySelector('#imageLibraryGrid');
        grid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> 読み込み中...</div>';
        
        try {
            const images = await getUploadedImages(50);
            
            if (images.length === 0) {
                grid.innerHTML = '<div class="no-images"><i class="fas fa-images"></i><p>アップロード済みの画像がありません</p></div>';
                return;
            }
            
            grid.innerHTML = '';
            images.forEach(img => {
                const imgCard = document.createElement('div');
                imgCard.className = 'library-image-card';
                imgCard.innerHTML = `
                    <img src="${img.thumbnail || img.image_data}" alt="${img.description}">
                    <div class="image-info">
                        <span class="image-name">${img.file_name}</span>
                        <button class="btn-select-image" data-url="${img.image_data}">選択</button>
                    </div>
                `;
                
                imgCard.querySelector('.btn-select-image').addEventListener('click', function() {
                    callback(this.dataset.url);
                    modal.remove();
                });
                
                grid.appendChild(imgCard);
            });
        } catch (error) {
            grid.innerHTML = '<div class="error">画像の読み込みに失敗しました</div>';
        }
    }
    
    // モーダル外クリックで閉じる
    modal.querySelector('.image-picker-overlay').addEventListener('click', function() {
        modal.remove();
    });
}

/**
 * 通知を表示
 * @param {string} message - メッセージ
 * @param {string} type - タイプ (success, error, info)
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
