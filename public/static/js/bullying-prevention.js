// ========================================
// いじめ防止基本方針ページ
// ========================================

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // データ読み込みを待つ
        await Promise.all([
            loadBullyingPreventionPDF(),
            loadSiteSettings()
        ]);
        
        // データ読み込み完了後にローディング画面を非表示
        setTimeout(() => {
            hideLoadingScreen();
        }, 300);
    } catch (error) {
        console.error('初期読み込みエラー:', error);
        setTimeout(() => {
            hideLoadingScreen();
        }, 300);
    }
});

// サイト設定を読み込む（ヘッダー・フッター）
async function loadSiteSettings() {
    try {
        const response = await fetch('/api/tables/site_settings');
        const result = await response.json();
        const settings = {};
        
        if (result.data) {
            result.data.forEach(item => {
                settings[item.setting_key] = item.setting_value;
            });
            
            // ヘッダー情報を更新
            updateTextContent('header-top-phone', settings.header_top_phone);
            updateTextContent('header-top-email', settings.header_top_email);
            updateTextContent('header-school-name', settings.header_school_name);
            updateTextContent('header-motto', settings.header_motto);
            
            // フッター情報を更新
            updateTextContent('footer-school-name', settings.footer_school_name);
            updateTextContent('footer-address', settings.footer_address);
            updateTextContent('footer-phone', settings.footer_phone);
            updateTextContent('footer-email', settings.footer_email);
            updateTextContent('footer-access-title', settings.footer_access_title);
            updateTextContent('footer-access1', settings.footer_access1);
            updateTextContent('footer-access2', settings.footer_access2);
            updateTextContent('footer-copyright', settings.footer_copyright);
        }
    } catch (error) {
        console.error('Error loading site settings:', error);
    }
}

// テキストコンテンツを更新する
function updateTextContent(elementId, text) {
    const element = document.getElementById(elementId);
    if (element && text) {
        element.textContent = text;
    }
}

// いじめ防止基本方針PDFを読み込む
async function loadBullyingPreventionPDF() {
    try {
        // uploaded_pdfs テーブルから「いじめ防止」を含むPDFを検索
        const response = await fetch('/api/tables/uploaded_pdfs?limit=50&sort=-created_at');
        const result = await response.json();
        const pdfs = result.data || [];
        
        // いじめ防止関連のPDFをフィルター
        const bullyingPDF = pdfs.find(pdf => 
            pdf.description && pdf.description.includes('いじめ防止')
        );
        
        if (bullyingPDF) {
            displayPDFSection(bullyingPDF);
        } else {
            // データがない場合のメッセージ
            document.getElementById('pdfSection').innerHTML = `
                <div class="no-data-message">
                    <i class="fas fa-info-circle"></i>
                    <p>現在、公開されているいじめ防止基本方針はありません。</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading bullying prevention PDF:', error);
        document.getElementById('pdfSection').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>データの読み込みに失敗しました。</p>
            </div>
        `;
    }
}

// PDFセクションを表示
function displayPDFSection(pdf) {
    const pdfSection = document.getElementById('pdfSection');
    
    // イントロテキストを更新
    if (pdf.description) {
        const introElement = document.getElementById('introText');
        if (introElement) {
            introElement.textContent = pdf.description;
        }
    }
    
    pdfSection.innerHTML = `
        <div class="pdf-card">
            <div class="pdf-card-header">
                <i class="fas fa-file-pdf"></i>
                <div>
                    <h3>${escapeHtml(pdf.description || 'いじめ防止基本方針')}</h3>
                    <p>${pdf.year}年度${pdf.month ? ' ' + pdf.month + '月' : ''}</p>
                </div>
            </div>
            <div class="pdf-card-body">
                <p class="pdf-filename">
                    <i class="fas fa-paperclip"></i> 
                    ${escapeHtml(pdf.file_name)}
                </p>
                <p class="pdf-size">
                    <i class="fas fa-hdd"></i> 
                    ファイルサイズ: ${formatFileSize(pdf.file_size)}
                </p>
                <div class="pdf-actions">
                    <button class="btn-pdf btn-download" onclick="downloadPDF('${pdf.id}', '${escapeHtml(pdf.file_name)}')">
                        <i class="fas fa-download"></i> ダウンロード
                    </button>
                    <button class="btn-pdf btn-view" onclick="openPDF('${pdf.pdf_data}')">
                        <i class="fas fa-external-link-alt"></i> 新しいタブで開く
                    </button>
                </div>
            </div>
        </div>
    `;
}

// PDFをダウンロード
async function downloadPDF(pdfId, fileName) {
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
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error downloading PDF:', error);
        alert('PDFのダウンロードに失敗しました。');
    }
}

// PDFを新しいタブで開く
function openPDF(pdfData) {
    const newWindow = window.open();
    if (newWindow) {
        newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>いじめ防止基本方針</title>
                <style>
                    body { margin: 0; padding: 0; }
                    iframe { width: 100vw; height: 100vh; border: none; }
                </style>
            </head>
            <body>
                <iframe src="${pdfData}"></iframe>
            </body>
            </html>
        `);
    }
}

// ファイルサイズをフォーマット
function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// HTMLエスケープ
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ローディング画面を非表示にする
function hideLoadingScreen() {
    const loadingScreen = document.querySelector('.page-loading');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            document.body.classList.remove('loading');
        }, 300);
    }
}

// ハンバーガーメニュー
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        this.classList.toggle('active');
    });
}
