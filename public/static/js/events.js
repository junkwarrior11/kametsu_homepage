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
        const response = await fetch('/api/tables/events?limit=1');
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
 * PDFをページに表示（学校だより形式）
 */
function displayEventsPDF(pdfInfo) {
    const pdfSection = document.getElementById('pdfDisplaySection');
    const noPDFMessage = document.getElementById('noPDFMessage');
    
    // PDFデータを適切な形式に変換
    let pdfUrl = pdfInfo.pdf_data;
    if (!pdfUrl.startsWith('data:application/pdf')) {
        pdfUrl = `data:application/pdf;base64,${pdfUrl}`;
    }
    
    pdfSection.innerHTML = `
        <div class="newsletter-card">
            <div class="newsletter-icon">
                <i class="fas fa-file-pdf"></i>
            </div>
            <h3>${pdfInfo.title ? escapeHtml(pdfInfo.title) : '年間行事予定'}</h3>
            <p class="issue-info">
                ${pdfInfo.event_date ? formatDate(pdfInfo.event_date) : ''}
            </p>
            <p>${pdfInfo.description ? escapeHtml(pdfInfo.description) : ''}</p>
            <a href="${pdfUrl}" 
               class="btn btn-primary" 
               download="${pdfInfo.file_name ? escapeHtml(pdfInfo.file_name) : 'events.pdf'}"
               target="_blank">
                <i class="fas fa-download"></i> PDFをダウンロード
            </a>
        </div>
    `;
    pdfSection.style.display = 'block';
    if (noPDFMessage) noPDFMessage.style.display = 'none';
}

// 日付フォーマット
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
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