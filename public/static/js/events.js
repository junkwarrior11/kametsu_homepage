// ========================================
// 行事予定ページ - データ読み込み
// ========================================

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // データを並行で読み込む（完了を待つ）
        await Promise.all([
            loadDynamicContent(),
            loadEventsPDF()
        ]);
        
        // すべてのデータ読み込み完了後にローディング画面を非表示
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

// 動的コンテンツを読み込む（ページヘッダー + 共通ヘッダー・フッター）
async function loadDynamicContent() {
    try {
        const cacheTime = Math.floor(Date.now() / (1000 * 60 * 5));
        const response = await fetch('tables/site_settings?limit=100&_=' + cacheTime);
        const result = await response.json();
        
        if (result.data) {
            const settings = {};
            result.data.forEach(item => {
                settings[item.setting_key] = item.setting_value;
            });
            
            // 共通ヘッダー（全ページ共通）
            updateTextContent('header-school-name', settings.header_school_name);
            updateTextContent('header-motto', settings.header_motto);
            updateTextContent('header-top-phone', settings.header_top_phone);
            updateTextContent('header-top-email', settings.header_top_email);
            
            // ページヘッダー
            updateTextContent('events-page-title', settings.events_page_title);
            updateTextContent('events-page-subtitle', settings.events_page_subtitle);
            
            // 共通フッター（全ページ共通）
            updateTextContent('footer-school-name', settings.footer_school_name);
            updateHTML('footer-address', settings.footer_address);
            updateTextContent('footer-phone', settings.footer_phone);
            updateTextContent('footer-email', settings.footer_email);
            updateTextContent('footer-access-title', settings.footer_access_title);
            updateTextContent('footer-access1', settings.footer_access1);
            updateTextContent('footer-access2', settings.footer_access2);
            updateTextContent('footer-copyright', settings.footer_copyright);
        }
    } catch (error) {
        console.error('Failed to load dynamic content:', error);
    }
}

// テキストコンテンツを更新するヘルパー関数
function updateTextContent(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element) return;
    if (value !== undefined && value !== null) {
        element.textContent = value;
    }
}

// HTMLコンテンツを更新するヘルパー関数
function updateHTML(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element) return;
    if (value !== undefined && value !== null) {
        element.innerHTML = value;
    }
}

// 以下の関数は使用しないため削除またはコメントアウト
// （PDF表示のみに変更したため、イベント一覧表示機能は不要）

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
        const response = await fetch('tables/uploaded_pdfs?limit=1&sort=-created_at');
        const result = await response.json();
        const pdfs = result.data || [];
        
        if (pdfs.length > 0) {
            const pdf = pdfs[0];
            displayEventsPDF(pdf);
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
function displayEventsPDF(pdf) {
    const pdfSection = document.getElementById('pdfDisplaySection');
    pdfSection.innerHTML = `
        <div class="pdf-viewer-container">
            <div class="pdf-viewer-header">
                <div class="pdf-viewer-title">
                    <i class="fas fa-file-pdf"></i>
                    <span>${escapeHtml(pdf.description)}</span>
                    ${pdf.year ? `<small style="color: #999; margin-left: 8px;">(${pdf.year}年度${pdf.month ? ' ' + pdf.month + '月' : ''})</small>` : ''}
                </div>
                <div class="pdf-viewer-actions">
                    <button onclick="downloadEventsPDF('${pdf.id}', '${escapeHtml(pdf.file_name)}')" class="btn-download">
                        <i class="fas fa-download"></i> ダウンロード
                    </button>
                </div>
            </div>
            <iframe class="pdf-viewer-iframe" src="${pdf.pdf_data}"></iframe>
        </div>
    `;
    pdfSection.style.display = 'block';
}

/**
 * PDFをダウンロード
 */
async function downloadEventsPDF(pdfId, fileName) {
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