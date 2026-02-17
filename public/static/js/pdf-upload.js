// ========================================
// PDFアップロード機能
// ========================================

/**
 * PDFをアップロードしてBase64形式でデータベースに保存
 * @param {File} file - アップロードするPDFファイル
 * @param {Object} metadata - メタデータ（説明、年度、月など）
 * @returns {Promise<Object>} - アップロードされたPDFレコード
 */
async function uploadPDF(file, metadata = {}) {
    // ファイルサイズチェック（10MB制限）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        throw new Error('ファイルサイズが大きすぎます。10MB以下のPDFを選択してください。');
    }
    
    // PDFタイプチェック
    if (file.type !== 'application/pdf') {
        throw new Error('PDFファイルを選択してください。');
    }
    
    try {
        // PDFを読み込んでBase64に変換
        const pdfData = await fileToBase64(file);
        
        // データベースに保存
        const pdfRecord = {
            file_name: file.name,
            file_size: file.size,
            pdf_data: pdfData,
            uploaded_by: metadata.uploaded_by || 'admin',
            description: metadata.description || file.name,
            year: metadata.year || new Date().getFullYear().toString(),
            month: metadata.month || (new Date().getMonth() + 1).toString()
        };
        
        const response = await fetch('tables/uploaded_pdfs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pdfRecord)
        });
        
        if (!response.ok) {
            throw new Error('PDFのアップロードに失敗しました');
        }
        
        const result = await response.json();
        return result;
        
    } catch (error) {
        console.error('PDF upload error:', error);
        throw error;
    }
}

/**
 * ファイルをBase64に変換
 * @param {File} file - ファイル
 * @returns {Promise<string>} - Base64エンコードされたデータ
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            resolve(e.target.result);
        };
        
        reader.onerror = function() {
            reject(new Error('ファイルの読み込みに失敗しました'));
        };
        
        reader.readAsDataURL(file);
    });
}

/**
 * アップロード済みPDFの一覧を取得
 * @param {number} limit - 取得件数
 * @returns {Promise<Array>} - PDFレコードの配列
 */
async function getUploadedPDFs(limit = 50) {
    try {
        const response = await fetch(`tables/uploaded_pdfs?limit=${limit}&sort=-created_at`);
        
        if (!response.ok) {
            throw new Error('PDF一覧の取得に失敗しました');
        }
        
        const result = await response.json();
        return result.data || [];
        
    } catch (error) {
        console.error('Get PDFs error:', error);
        return [];
    }
}

/**
 * PDFを削除
 * @param {string} pdfId - PDF ID
 */
async function deletePDF(pdfId) {
    try {
        const response = await fetch(`tables/uploaded_pdfs/${pdfId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('PDFの削除に失敗しました');
        }
        
        return true;
        
    } catch (error) {
        console.error('Delete PDF error:', error);
        throw error;
    }
}

/**
 * PDF選択モーダルを表示
 * @param {Function} callback - PDFが選択されたときのコールバック関数
 */
async function showPDFPickerModal(callback) {
    const modal = document.createElement('div');
    modal.className = 'pdf-picker-modal';
    modal.innerHTML = `
        <div class="pdf-picker-overlay"></div>
        <div class="pdf-picker-content">
            <div class="pdf-picker-header">
                <h3>PDFを選択</h3>
                <button class="close-modal" onclick="this.closest('.pdf-picker-modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="pdf-picker-tabs">
                <button class="tab-btn active" data-tab="upload">新規アップロード</button>
                <button class="tab-btn" data-tab="library">ライブラリから選択</button>
            </div>
            <div class="pdf-picker-body">
                <div class="tab-content active" data-tab="upload">
                    <div class="upload-area">
                        <input type="file" id="pdfUploadInput" accept="application/pdf" style="display: none;">
                        <div class="upload-dropzone" onclick="document.getElementById('pdfUploadInput').click()">
                            <i class="fas fa-file-pdf"></i>
                            <p>クリックしてPDFを選択</p>
                            <small>または、ここにPDFをドラッグ&ドロップ</small>
                            <small class="text-muted">（最大10MB）</small>
                        </div>
                        <div class="upload-preview" style="display: none;">
                            <div class="pdf-info">
                                <i class="fas fa-file-pdf" style="font-size: 48px; color: #f44336;"></i>
                                <div class="pdf-details">
                                    <p class="pdf-name" id="pdfFileName"></p>
                                    <p class="pdf-size" id="pdfFileSize"></p>
                                </div>
                            </div>
                            <div class="pdf-metadata">
                                <div class="form-group">
                                    <label>説明</label>
                                    <input type="text" id="pdfDescription" placeholder="例：令和6年度年間行事予定">
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>年度</label>
                                        <input type="text" id="pdfYear" placeholder="2024" value="${new Date().getFullYear()}">
                                    </div>
                                    <div class="form-group">
                                        <label>月</label>
                                        <select id="pdfMonth">
                                            <option value="">全体</option>
                                            <option value="4">4月</option>
                                            <option value="5">5月</option>
                                            <option value="6">6月</option>
                                            <option value="7">7月</option>
                                            <option value="8">8月</option>
                                            <option value="9">9月</option>
                                            <option value="10">10月</option>
                                            <option value="11">11月</option>
                                            <option value="12">12月</option>
                                            <option value="1">1月</option>
                                            <option value="2">2月</option>
                                            <option value="3">3月</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="upload-actions">
                                <button class="btn btn-primary" id="confirmPDFUploadBtn">このPDFを使用</button>
                                <button class="btn btn-secondary" onclick="document.getElementById('pdfUploadInput').click()">別のPDFを選択</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="tab-content" data-tab="library">
                    <div class="pdf-library-list" id="pdfLibraryList">
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
            
            // ライブラリタブを開いたときにPDFを読み込む
            if (tab === 'library') {
                loadPDFLibrary();
            }
        });
    });
    
    // ファイル選択
    const fileInput = modal.querySelector('#pdfUploadInput');
    const dropzone = modal.querySelector('.upload-dropzone');
    const previewArea = modal.querySelector('.upload-preview');
    
    let selectedFile = null;
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            selectedFile = file;
            showPDFPreview(file);
        } else {
            showNotification('PDFファイルを選択してください', 'error');
        }
    });
    
    function showPDFPreview(file) {
        document.getElementById('pdfFileName').textContent = file.name;
        document.getElementById('pdfFileSize').textContent = formatFileSize(file.size);
        document.getElementById('pdfDescription').value = file.name.replace('.pdf', '');
        
        dropzone.style.display = 'none';
        previewArea.style.display = 'block';
    }
    
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
        if (file && file.type === 'application/pdf') {
            selectedFile = file;
            showPDFPreview(file);
        } else {
            showNotification('PDFファイルを選択してください', 'error');
        }
    });
    
    // アップロード確定
    modal.querySelector('#confirmPDFUploadBtn').addEventListener('click', async function() {
        if (!selectedFile) return;
        
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> アップロード中...';
        
        try {
            const metadata = {
                description: document.getElementById('pdfDescription').value,
                year: document.getElementById('pdfYear').value,
                month: document.getElementById('pdfMonth').value
            };
            
            const result = await uploadPDF(selectedFile, metadata);
            callback(result);
            modal.remove();
            showNotification('PDFをアップロードしました', 'success');
        } catch (error) {
            showNotification(error.message, 'error');
            this.disabled = false;
            this.innerHTML = 'このPDFを使用';
        }
    });
    
    // PDFライブラリを読み込む関数
    async function loadPDFLibrary() {
        const list = modal.querySelector('#pdfLibraryList');
        list.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> 読み込み中...</div>';
        
        try {
            const pdfs = await getUploadedPDFs(50);
            
            if (pdfs.length === 0) {
                list.innerHTML = '<div class="no-pdfs"><i class="fas fa-file-pdf"></i><p>アップロード済みのPDFがありません</p></div>';
                return;
            }
            
            list.innerHTML = '';
            pdfs.forEach(pdf => {
                const pdfCard = document.createElement('div');
                pdfCard.className = 'library-pdf-card';
                pdfCard.innerHTML = `
                    <div class="pdf-icon">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <div class="pdf-info">
                        <h4>${escapeHtml(pdf.description)}</h4>
                        <p class="pdf-meta">
                            <span>${pdf.year}年度</span>
                            ${pdf.month ? `<span>${pdf.month}月</span>` : ''}
                            <span>${formatFileSize(pdf.file_size)}</span>
                        </p>
                        <p class="pdf-filename">${escapeHtml(pdf.file_name)}</p>
                    </div>
                    <div class="pdf-actions">
                        <button class="btn-select-pdf" data-id="${pdf.id}">選択</button>
                    </div>
                `;
                
                pdfCard.querySelector('.btn-select-pdf').addEventListener('click', function() {
                    callback(pdf);
                    modal.remove();
                });
                
                list.appendChild(pdfCard);
            });
        } catch (error) {
            list.innerHTML = '<div class="error">PDFの読み込みに失敗しました</div>';
        }
    }
    
    // モーダル外クリックで閉じる
    modal.querySelector('.pdf-picker-overlay').addEventListener('click', function() {
        modal.remove();
    });
}

/**
 * ファイルサイズをフォーマット
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * HTMLエスケープ
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 通知を表示
 */
function showNotification(message, type = 'success') {
    // 既存の通知があれば削除
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) {
        existingNotif.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // アニメーション
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 3秒後に非表示
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
