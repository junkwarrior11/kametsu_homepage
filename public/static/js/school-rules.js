// ========================================
// 亀津小のやくそくページ
// ========================================

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // PDFを読み込む
        await loadAllRulesPDF();
        
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

// 全てのPDFを読み込む（学校だより形式）
async function loadAllRulesPDF() {
    const rulesGrid = document.getElementById('rulesGrid');
    
    try {
        // uploaded_pdfs から全てのPDFを検索
        const response = await fetch('/api/tables/uploaded_pdfs?limit=50');
        const result = await response.json();
        const pdfs = result.data || [];
        
        // よいこの約束、学習の約束を検索
        const goodChildPDF = pdfs.find(pdf => 
            pdf.description && pdf.description.includes('よいこの約束')
        );
        const studyRulesPDF = pdfs.find(pdf => 
            pdf.description && pdf.description.includes('学習の約束')
        );
        
        const rulePDFs = [];
        if (goodChildPDF) rulePDFs.push(goodChildPDF);
        if (studyRulesPDF) rulePDFs.push(studyRulesPDF);
        
        if (rulePDFs.length === 0) {
            rulesGrid.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <i class="fas fa-info-circle" style="font-size: 48px; color: #2196F3; margin-bottom: 20px; display: block;"></i>
                    <p style="color: #666;">現在、亀津小のやくそくPDFは準備中です。</p>
                </div>
            `;
            return;
        }
        
        // カード形式で表示（学校だより形式）
        rulesGrid.innerHTML = rulePDFs.map(pdf => {
            let pdfUrl = pdf.pdf_data;
            if (!pdfUrl.startsWith('data:application/pdf')) {
                pdfUrl = `data:application/pdf;base64,${pdfUrl}`;
            }
            
            return `
                <div class="newsletter-card">
                    <div class="newsletter-icon">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <h3>${escapeHtml(pdf.description || '亀津小のやくそく')}</h3>
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
        }).join('');
        
    } catch (error) {
        console.error('Error loading rules PDF:', error);
        rulesGrid.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #f44336; margin-bottom: 20px; display: block;"></i>
                <p style="color: #666;">データの読み込みに失敗しました。</p>
            </div>
        `;
    }
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

// HTMLエスケープ
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
