// ========================================
// いじめ防止基本方針管理（学校だより形式）
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    loadBullyingPreventionPDFs();
    setupUploadForm();
});

// PDFをBase64に変換
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// アップロードフォームの設定
function setupUploadForm() {
    const form = document.getElementById('uploadForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const title = document.getElementById('title').value;
        const year = document.getElementById('year').value;
        const fileInput = document.getElementById('pdf_file');
        const file = fileInput.files[0];
        
        if (!file) {
            showMessage('PDFファイルを選択してください。', 'error');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
            showMessage('ファイルサイズが10MBを超えています。', 'error');
            return;
        }
        
        try {
            showMessage('アップロード中...', 'success');
            
            // PDFをBase64に変換
            const base64Data = await fileToBase64(file);
            
            // データベースに保存
            const response = await fetch('/api/tables/uploaded_pdfs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    description: title,
                    year: parseInt(year),
                    month: null,
                    file_name: file.name,
                    file_size: file.size,
                    pdf_data: base64Data
                })
            });
            
            if (response.ok) {
                showMessage('いじめ防止基本方針をアップロードしました。', 'success');
                form.reset();
                document.getElementById('year').value = new Date().getFullYear();
                loadBullyingPreventionPDFs();
            } else {
                const error = await response.json();
                showMessage(`アップロードに失敗しました: ${error.error || 'エラー'}`, 'error');
            }
        } catch (error) {
            console.error('Error uploading PDF:', error);
            showMessage('アップロードに失敗しました。', 'error');
        }
    });
}

// PDFリストを読み込む
async function loadBullyingPreventionPDFs() {
    try {
        const response = await fetch('/api/tables/uploaded_pdfs?limit=50&sort=-created_at');
        const data = await response.json();
        
        // いじめ防止PDFのみフィルター
        const pdfs = (data.data || []).filter(pdf => 
            pdf.description && pdf.description.includes('いじめ防止')
        );
        
        const listEl = document.getElementById('pdfList');
        
        if (pdfs.length === 0) {
            listEl.innerHTML = '<p>まだいじめ防止基本方針が掲載されていません。</p>';
            return;
        }
        
        listEl.innerHTML = pdfs.map(item => `
            <div class="pdf-item">
                <div class="pdf-info">
                    <h3>${escapeHtml(item.description)}</h3>
                    <p><i class="fas fa-calendar"></i> ${item.year}年度</p>
                    <p><i class="fas fa-file-pdf"></i> ${escapeHtml(item.file_name || 'ファイル')}</p>
                    <p><i class="fas fa-hdd"></i> ${formatFileSize(item.file_size)}</p>
                    <p><i class="fas fa-clock"></i> ${formatDate(item.created_at)}</p>
                </div>
                <div class="pdf-actions">
                    <button class="btn btn-view" onclick="viewPDF('${item.id}')">
                        <i class="fas fa-eye"></i> 表示
                    </button>
                    <button class="btn btn-delete" onclick="deletePDF('${item.id}')">
                        <i class="fas fa-trash"></i> 削除
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading PDFs:', error);
        document.getElementById('pdfList').innerHTML = '<p style="color: #f56565;">読み込みに失敗しました。</p>';
    }
}

// PDFを表示
async function viewPDF(pdfId) {
    try {
        const response = await fetch(`/api/tables/uploaded_pdfs/${pdfId}`);
        const pdf = await response.json();
        
        // 新しいウィンドウでPDFを開く
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${escapeHtml(pdf.description)}</title>
                <style>
                    body { margin: 0; }
                    iframe { width: 100%; height: 100vh; border: none; }
                </style>
            </head>
            <body>
                <iframe src="${pdf.pdf_data}"></iframe>
            </body>
            </html>
        `);
        newWindow.document.close();
    } catch (error) {
        console.error('Error viewing PDF:', error);
        showMessage('PDFの表示に失敗しました。', 'error');
    }
}

// PDFを削除
async function deletePDF(pdfId) {
    if (!confirm('本当にこのPDFを削除しますか？')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/tables/uploaded_pdfs/${pdfId}`, {
            method: 'DELETE'
        });
        
        if (response.ok || response.status === 204) {
            showMessage('PDFを削除しました。', 'success');
            loadBullyingPreventionPDFs();
        } else {
            throw new Error('削除に失敗しました');
        }
    } catch (error) {
        console.error('Error deleting PDF:', error);
        showMessage('削除に失敗しました。', 'error');
    }
}

// メッセージを表示
function showMessage(message, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
    
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 3000);
}

// HTMLエスケープ
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ファイルサイズをフォーマット
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// 日付をフォーマット
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP');
}
