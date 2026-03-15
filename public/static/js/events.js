// ========================================
// 行事予定ページ - データ読み込み
// ========================================

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // データを読み込む
        await loadEventsPDF();
        
        // データ読み込み完了後にローディング画面を非表示
        setTimeout(() => {
            hideLoadingScreen();
        }, 300);
        
    } catch (error) {
        console.error('初期読み込みエラー:', error);
        // エラーが発生してもローディング画面は非表示にする
        setTimeout(() => {
            hideLoadingScreen();
        }, 300);
    }
});

// ========================================
// PDF表示機能
// ========================================

/**
 * 行事予定PDFを読み込んで表示
 */
async function loadEventsPDF() {
    const pdfSection = document.getElementById('pdfDisplaySection');
    const noPDFMessage = document.getElementById('noPDFMessage');
    
    try {
        // eventsテーブルから最新の行事予定を取得
        const response = await fetch('/api/tables/events?limit=1&sort=-created_at');
        const result = await response.json();
        const events = result.data || [];
        
        if (events.length > 0 && events[0].pdf_id) {
            const event = events[0];
            // PDFデータを取得
            const pdfResponse = await fetch(`/api/tables/uploaded_pdfs/${event.pdf_id}`);
            const pdfData = await pdfResponse.json();
            
            // イベント情報とPDFデータを結合
            const pdfInfo = {
                ...event,
                pdf_data: pdfData.pdf_data,
                file_name: pdfData.file_name
            };
            
            displayEventsPDF(pdfInfo);
            if (noPDFMessage) noPDFMessage.style.display = 'none';
        } else {
            // PDFがない場合はメッセージを表示
            pdfSection.style.display = 'none';
            if (noPDFMessage) noPDFMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading PDF:', error);
        pdfSection.style.display = 'none';
        if (noPDFMessage) noPDFMessage.style.display = 'block';
    }
}

/**
 * PDFをページに表示
 */
function displayEventsPDF(pdfInfo) {
    const pdfSection = document.getElementById('pdfDisplaySection');
    
    // Base64データからBlobを作成してObject URLを生成
    let pdfUrl;
    try {
        let base64Data;
        if (pdfInfo.pdf_data.startsWith('data:application/pdf;base64,')) {
            base64Data = pdfInfo.pdf_data.split(',')[1];
        } else if (pdfInfo.pdf_data.startsWith('data:')) {
            base64Data = pdfInfo.pdf_data.split(',')[1];
        } else {
            base64Data = pdfInfo.pdf_data;
        }
        
        // Base64からバイナリに変換
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        // BlobからObject URLを作成
        pdfUrl = URL.createObjectURL(blob);
        
        console.log('✅ PDF Blob created successfully');
        console.log('   Blob size:', blob.size, 'bytes');
        console.log('   Object URL:', pdfUrl);
    } catch (error) {
        console.error('❌ Error creating PDF Blob:', error);
        pdfUrl = pdfInfo.pdf_data; // フォールバック
    }
    
    pdfSection.innerHTML = `
        <div class="pdf-viewer-container">
            <div class="pdf-viewer-header">
                <div class="pdf-viewer-title">
                    <i class="fas fa-file-pdf"></i>
                    <span>${pdfInfo.title ? escapeHtml(pdfInfo.title) : '行事予定'}</span>
                    ${pdfInfo.event_date ? `<small style="color: #999; margin-left: 8px;">(${pdfInfo.event_date})</small>` : ''}
                </div>
                <div class="pdf-viewer-actions">
                    <button onclick="downloadEventsPDF('${pdfInfo.pdf_id}', '${pdfInfo.file_name ? escapeHtml(pdfInfo.file_name) : 'events.pdf'}')" class="btn-download">
                        <i class="fas fa-download"></i> ダウンロード
                    </button>
                </div>
            </div>
            <iframe class="pdf-viewer-iframe" src="${pdfUrl}" type="application/pdf"></iframe>
        </div>
    `;
    pdfSection.style.display = 'block';
}

/**
 * PDFをダウンロード
 */
async function downloadEventsPDF(pdfId, fileName) {
    try {
        const response = await fetch(`/api/tables/uploaded_pdfs/${pdfId}`);
        const pdfData = await response.json();
        
        // Base64データからBlobを作成
        const base64Data = pdfData.pdf_data.startsWith('data:') 
            ? pdfData.pdf_data.split(',')[1] 
            : pdfData.pdf_data;
            
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        // ダウンロード
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || 'events.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading PDF:', error);
        alert('ダウンロードに失敗しました');
    }
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

// ローディング画面を非表示にする
function hideLoadingScreen() {
    const contentWrapper = document.getElementById('contentWrapper');
    if (contentWrapper) {
        contentWrapper.classList.add('loaded');
    }
    
    const pageLoading = document.getElementById('pageLoading');
    if (pageLoading) {
        pageLoading.style.opacity = '0';
        setTimeout(() => {
            pageLoading.style.display = 'none';
        }, 300);
    }
    
    document.body.classList.remove('loading');
}

// グローバル関数として公開
window.downloadEventsPDF = downloadEventsPDF;