// ========================================
// いじめ防止基本方針ページ
// ========================================

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // PDFのみ読み込む（サイト設定はcontent-loader.jsが処理）
        await loadBullyingPreventionPDF();
    } catch (error) {
        console.error('初期読み込みエラー:', error);
    }
});

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

// PDFセクションを表示（学校だより形式）
function displayPDFSection(pdf) {
    const pdfSection = document.getElementById('pdfSection');
    
    // PDFデータを適切な形式に変換
    let pdfUrl = pdf.pdf_data;
    if (!pdfUrl.startsWith('data:application/pdf')) {
        pdfUrl = `data:application/pdf;base64,${pdfUrl}`;
    }
    
    pdfSection.innerHTML = `
        <div class="newsletter-card">
            <div class="newsletter-icon">
                <i class="fas fa-file-pdf"></i>
            </div>
            <h3>${escapeHtml(pdf.description || 'いじめ防止基本方針')}</h3>
            <p class="issue-info">
                ${pdf.year}年度${pdf.month ? ' ' + pdf.month + '月' : ''}
            </p>
            <p>${escapeHtml(pdf.file_name)}</p>
            <a href="${pdfUrl}" 
               class="btn btn-primary" 
               download="${escapeHtml(pdf.file_name)}"
               target="_blank">
                <i class="fas fa-download"></i> PDFをダウンロード
            </a>
        </div>
    `;
}

// HTMLエスケープ
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
