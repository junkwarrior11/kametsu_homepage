// ========================================
// いじめ防止基本方針管理ページ
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    loadBullyingPreventionPDFs();
    setupUploadForm();
});

// PDFリストを読み込む
async function loadBullyingPreventionPDFs() {
    try {
        const response = await fetch('/api/tables/uploaded_pdfs?limit=50&sort=-created_at');
        const result = await response.json();
        const pdfs = result.data || [];
        
        // いじめ防止関連のPDFをフィルター
        const bullyingPDFs = pdfs.filter(pdf => 
            pdf.description && pdf.description.includes('いじめ防止')
        );
        
        displayPDFList(bullyingPDFs);
    } catch (error) {
        console.error('Error loading PDFs:', error);
        showMessage('PDFの読み込みに失敗しました。', 'error');
    }
}

// PDFリストを表示
function displayPDFList(pdfs) {
    const pdfList = document.getElementById('pdfList');
    
    if (pdfs.length === 0) {
        pdfList.innerHTML = '<p style="color: #666;">登録されているPDFはありません。</p>';
        return;
    }
    
    pdfList.innerHTML = pdfs.map(pdf => `
        <div class="pdf-item">
            <div class="pdf-info">
                <h3><i class="fas fa-file-pdf"></i> ${escapeHtml(pdf.description || 'いじめ防止基本方針')}</h3>
                <p><strong>年度:</strong> ${pdf.year}年度</p>
                <p><strong>ファイル名:</strong> ${escapeHtml(pdf.file_name)}</p>
                <p><strong>ファイルサイズ:</strong> ${formatFileSize(pdf.file_size)}</p>
                <p><strong>登録日:</strong> ${formatDate(pdf.created_at)}</p>
            </div>
            <div class="pdf-actions">
                <button class="btn btn-view" onclick="viewPDF('${pdf.id}')">
                    <i class="fas fa-eye"></i> 表示
                </button>
                <button class="btn btn-delete" onclick="deletePDF('${pdf.id}', '${escapeHtml(pdf.description)}')">
                    <i class="fas fa-trash"></i> 削除
                </button>
            </div>
        </div>
    `).join('');
}

// アップロードフォームのセットアップ
function setupUploadForm() {
    const form = document.getElementById('uploadForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const description = document.getElementById('description').value;
        const year = document.getElementById('year').value;
        const fileInput = document.getElementById('pdfFile');
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
            
            // 既存のいじめ防止基本方針PDFを削除（一時的にコメントアウト）
            // await deleteExistingBullyingPreventionPDFs();
            
            // PDFをBase64に変換
            const base64Data = await fileToBase64(file);
            
            // データベースに保存
            const response = await fetch('/api/tables/uploaded_pdfs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    description: description,
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

// 既存のいじめ防止基本方針PDFを削除
async function deleteExistingBullyingPreventionPDFs() {
    try {
        const response = await fetch('/api/tables/uploaded_pdfs?limit=50&sort=-created_at');
        const result = await response.json();
        const pdfs = result.data || [];
        
        // いじめ防止関連のPDFをフィルター
        const bullyingPDFs = pdfs.filter(pdf => 
            pdf.description && pdf.description.includes('いじめ防止')
        );
        
        // 全て削除
        for (const pdf of bullyingPDFs) {
            await fetch(`/api/tables/uploaded_pdfs/${pdf.id}`, {
                method: 'DELETE'
            });
        }
    } catch (error) {
        console.error('Error deleting existing PDFs:', error);
    }
}

// PDFを表示
async function viewPDF(pdfId) {
    try {
        const response = await fetch(`/api/tables/uploaded_pdfs/${pdfId}`);
        const pdf = await response.json();
        
        // 新しいタブでPDFを開く
        const newWindow = window.open();
        if (newWindow) {
            newWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${escapeHtml(pdf.description || 'いじめ防止基本方針')}</title>
                    <style>
                        body { margin: 0; padding: 0; }
                        iframe { width: 100vw; height: 100vh; border: none; }
                    </style>
                </head>
                <body>
                    <iframe src="${pdf.pdf_data}"></iframe>
                </body>
                </html>
            `);
        }
    } catch (error) {
        console.error('Error viewing PDF:', error);
        showMessage('PDFの表示に失敗しました。', 'error');
    }
}

// PDFを削除
async function deletePDF(pdfId, description) {
    if (!confirm(`「${description}」を削除してもよろしいですか？\n\nこの操作は取り消せません。`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/tables/uploaded_pdfs/${pdfId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showMessage('PDFを削除しました。', 'success');
            loadBullyingPreventionPDFs();
        } else {
            showMessage('削除に失敗しました。', 'error');
        }
    } catch (error) {
        console.error('Error deleting PDF:', error);
        showMessage('削除に失敗しました。', 'error');
    }
}

// ファイルをBase64に変換
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// ファイルサイズをフォーマット
function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// 日付をフォーマット
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// HTMLエスケープ
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// メッセージを表示
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}
