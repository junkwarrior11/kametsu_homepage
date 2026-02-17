// ========================================
// 亀津小のやくそく管理
// ========================================

let currentGoodChildPDFId = null;
let currentStudyRulesPDFId = null;

document.addEventListener('DOMContentLoaded', function() {
    loadGoodChildPDF();
    loadStudyRulesPDF();
});

// ========================================
// よいこの約束 PDF管理
// ========================================

/**
 * よいこの約束PDFを読み込んで表示
 */
async function loadGoodChildPDF() {
    const display = document.getElementById('goodChildPDFDisplay');
    
    if (!display) return;
    
    try {
        const response = await fetch('/api/tables/uploaded_pdfs?limit=50&sort=-created_at');
        const result = await response.json();
        const pdfs = result.data || [];
        
        // よいこの約束PDFをフィルター
        const goodChildPDF = pdfs.find(pdf => 
            pdf.description && pdf.description.includes('よいこの約束')
        );
        
        if (goodChildPDF) {
            currentGoodChildPDFId = goodChildPDF.id;
            displayPDF(goodChildPDF, 'goodChildPDFDisplay', 'goodChild');
        } else {
            display.innerHTML = '<p style="color: #999; margin: 0;">PDFがアップロードされていません</p>';
        }
    } catch (error) {
        console.error('Error loading Good Child PDF:', error);
        display.innerHTML = '<p style="color: #f44336;">PDFの読み込みに失敗しました</p>';
    }
}

/**
 * よいこの約束PDFピッカーを開く
 */
function openGoodChildRulesPDFPicker() {
    showPDFPickerModal(function(pdf) {
        currentGoodChildPDFId = pdf.id;
        displayPDF(pdf, 'goodChildPDFDisplay', 'goodChild');
        showNotification('よいこの約束PDFをアップロードしました', 'success');
    });
}

// グローバルスコープに公開
window.openGoodChildRulesPDFPicker = openGoodChildRulesPDFPicker;

// ========================================
// 学習の約束 PDF管理
// ========================================

/**
 * 学習の約束PDFを読み込んで表示
 */
async function loadStudyRulesPDF() {
    const display = document.getElementById('studyRulesPDFDisplay');
    
    if (!display) return;
    
    try {
        const response = await fetch('/api/tables/uploaded_pdfs?limit=50&sort=-created_at');
        const result = await response.json();
        const pdfs = result.data || [];
        
        // 学習の約束PDFをフィルター
        const studyRulesPDF = pdfs.find(pdf => 
            pdf.description && pdf.description.includes('学習の約束')
        );
        
        if (studyRulesPDF) {
            currentStudyRulesPDFId = studyRulesPDF.id;
            displayPDF(studyRulesPDF, 'studyRulesPDFDisplay', 'studyRules');
        } else {
            display.innerHTML = '<p style="color: #999; margin: 0;">PDFがアップロードされていません</p>';
        }
    } catch (error) {
        console.error('Error loading Study Rules PDF:', error);
        display.innerHTML = '<p style="color: #f44336;">PDFの読み込みに失敗しました</p>';
    }
}

/**
 * 学習の約束PDFピッカーを開く
 */
function openStudyRulesPDFPicker() {
    showPDFPickerModal(function(pdf) {
        currentStudyRulesPDFId = pdf.id;
        displayPDF(pdf, 'studyRulesPDFDisplay', 'studyRules');
        showNotification('学習の約束PDFをアップロードしました', 'success');
    });
}

// グローバルスコープに公開
window.openStudyRulesPDFPicker = openStudyRulesPDFPicker;

// ========================================
// 共通PDF表示関数
// ========================================

/**
 * PDFを表示
 */
function displayPDF(pdf, displayId, type) {
    const display = document.getElementById(displayId);
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
                    <button onclick="changePDF('${type}')" style="background: #FF9800; border-color: #FF9800; color: white;">
                        <i class="fas fa-exchange-alt"></i> 変更
                    </button>
                    <button onclick="removePDF('${pdf.id}', '${type}')" class="btn-remove">
                        <i class="fas fa-trash"></i> 削除
                    </button>
                </div>
            </div>
            <iframe class="pdf-viewer-iframe" src="${pdf.pdf_data}"></iframe>
        </div>
    `;
}

/**
 * PDFを変更
 */
function changePDF(type) {
    if (type === 'goodChild') {
        openGoodChildRulesPDFPicker();
    } else if (type === 'studyRules') {
        openStudyRulesPDFPicker();
    }
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
async function removePDF(pdfId, type) {
    if (!confirm('本当にこのPDFを削除しますか？')) return;
    
    try {
        const response = await fetch(`tables/uploaded_pdfs/${pdfId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            if (type === 'goodChild') {
                currentGoodChildPDFId = null;
                document.getElementById('goodChildPDFDisplay').innerHTML = '<p style="color: #999; margin: 0;">PDFがアップロードされていません</p>';
            } else if (type === 'studyRules') {
                currentStudyRulesPDFId = null;
                document.getElementById('studyRulesPDFDisplay').innerHTML = '<p style="color: #999; margin: 0;">PDFがアップロードされていません</p>';
            }
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
