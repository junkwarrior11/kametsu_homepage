// ========================================
// いじめ防止基本方針管理
// ========================================

let currentPDFId = null;

document.addEventListener('DOMContentLoaded', function() {
    loadCurrentPDF();
});

// ========================================
// PDF管理機能
// ========================================

/**
 * 現在のPDFを読み込んで表示
 */
async function loadCurrentPDF() {
    const display = document.getElementById('currentPDFDisplay');
    
    if (!display) return; // 要素がない場合は何もしない
    
    try {
        // description に "いじめ防止" を含むPDFを検索
        const response = await fetch('/api/tables/uploaded_pdfs?limit=50&sort=-created_at');
        const result = await response.json();
        const pdfs = result.data || [];
        
        // いじめ防止関連のPDFをフィルター
        const bullyingPDF = pdfs.find(pdf => 
            pdf.description && pdf.description.includes('いじめ防止')
        );
        
        if (bullyingPDF) {
            currentPDFId = bullyingPDF.id;
            displayPDF(bullyingPDF);
        } else {
            display.innerHTML = '<p style="color: #999; margin: 0;">PDFがアップロードされていません</p>';
        }
    } catch (error) {
        console.error('Error loading PDF:', error);
        display.innerHTML = '<p style="color: #f44336;">PDFの読み込みに失敗しました</p>';
    }
}

/**
 * PDFを表示
 */
function displayPDF(pdf) {
    const display = document.getElementById('currentPDFDisplay');
    display.innerHTML = `
        <div class="pdf-viewer-container">
            <div class="pdf-viewer-header">
                <div class="pdf-viewer-title">
                    <i class="fas fa-file-pdf"></i>
                    <span>${escapeHtml(pdf.description)}</span>
                    <small style="color: #999; margin-left: 8px;">(${pdf.year}年度${pdf.month ? ' ' + pdf.month + '月' : ''})</small>
                </div>
                <div class="pdf-viewer-actions">
                    <button onclick="downloadPDF('${pdf.id}')" class="btn-download">
                        <i class="fas fa-download"></i> ダウンロード
                    </button>
                    <button onclick="changePDF()" style="background: #FF9800; border-color: #FF9800; color: white;">
                        <i class="fas fa-exchange-alt"></i> 変更
                    </button>
                    <button onclick="removePDF('${pdf.id}')" class="btn-remove">
                        <i class="fas fa-trash"></i> 削除
                    </button>
                </div>
            </div>
            <iframe class="pdf-viewer-iframe" src="${pdf.pdf_data}"></iframe>
        </div>
    `;
}

/**
 * PDFピッカーを開く
 */
function openBullyingPreventionPDFPicker() {
    showPDFPickerModal(function(pdf) {
        currentPDFId = pdf.id;
        displayPDF(pdf);
        showNotification('PDFをアップロードしました', 'success');
    });
}

// グローバルスコープに公開
window.openBullyingPreventionPDFPicker = openBullyingPreventionPDFPicker;

/**
 * PDFを変更
 */
function changePDF() {
    openBullyingPreventionPDFPicker();
}

/**
 * PDFをダウンロード
 */
async function downloadPDF(pdfId) {
    try {
        const response = await fetch(`tables/uploaded_pdfs/${pdfId}`);
        const pdf = await response.json();
        
        // Base64データからBlobを作成
        const byteCharacters = atob(pdf.pdf_data.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        // ダウンロード
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = pdf.file_name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showNotification('PDFをダウンロードしました', 'success');
    } catch (error) {
        console.error('Error downloading PDF:', error);
        showNotification('ダウンロードに失敗しました', 'error');
    }
}

/**
 * PDFを削除
 */
async function removePDF(pdfId) {
    if (!confirm('本当にこのPDFを削除しますか？')) return;
    
    try {
        const response = await fetch(`tables/uploaded_pdfs/${pdfId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            currentPDFId = null;
            document.getElementById('currentPDFDisplay').innerHTML = '<p style="color: #999; margin: 0;">PDFがアップロードされていません</p>';
            showNotification('PDFを削除しました', 'success');
        } else {
            throw new Error('削除に失敗しました');
        }
    } catch (error) {
        console.error('Error removing PDF:', error);
        showNotification('削除に失敗しました', 'error');
    }
}

// ========================================
// ユーティリティ関数
// ========================================

function showNotification(message, type = 'success') {
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) existingNotif.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
