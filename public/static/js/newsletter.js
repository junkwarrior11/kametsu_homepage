// ========================================
// 学校だよりページ - データ読み込み
// ========================================

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // データを読み込む
        await loadNewsletters();
        
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

// 学校だよりを読み込む
async function loadNewsletters() {
    const newsletterGrid = document.getElementById('newsletterGrid');
    
    if (!newsletterGrid) return;
    
    showLoading(newsletterGrid);
    
    try {
        const response = await fetch('/api/tables/newsletters?sort=-issue_date');
        
        if (!response.ok) {
            throw new Error('データの取得に失敗しました');
        }
        
        const result = await response.json();
        const newsletters = result.data || [];
        
        if (newsletters.length === 0) {
            showEmpty(newsletterGrid, 'まだ学校だよりがありません');
            return;
        }
        
        newsletterGrid.innerHTML = newsletters.map(newsletter => {
            const fileUrl = newsletter.file_url || '';
            const fileName = newsletter.file_name || 'newsletter.pdf';
            
            // Base64データの場合とURLの場合で処理を分ける
            const isBase64 = fileUrl.startsWith('data:application/pdf');
            
            return `
                <div class="newsletter-card">
                    <div class="newsletter-icon">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <h3>${newsletter.title ? escapeHtml(newsletter.title) : '学校だより'}</h3>
                    <p class="issue-info">
                        第${newsletter.issue_number}号 | ${formatDate(newsletter.issue_date)}
                    </p>
                    <p>${newsletter.description ? escapeHtml(newsletter.description) : ''}</p>
                    <a href="${fileUrl ? escapeHtml(fileUrl) : '#'}" 
                       class="btn btn-primary" 
                       download="${fileName ? escapeHtml(fileName) : 'newsletter.pdf'}"
                       target="_blank">
                        <i class="fas fa-download"></i> PDFをダウンロード
                    </a>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading newsletters:', error);
        showError(newsletterGrid, '学校だよりの読み込みに失敗しました');
    }
}

// エスケープHTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 日付フォーマット
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ローディング表示
function showLoading(container) {
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: #9ca3af;"><i class="fas fa-spinner fa-spin"></i> 読み込み中...</div>';
}

// 空メッセージ表示
function showEmpty(container, message) {
    container.innerHTML = `<div style="text-align: center; padding: 40px; color: #9ca3af;">${message}</div>`;
}

// エラーメッセージ表示
function showError(container, message) {
    container.innerHTML = `<div style="text-align: center; padding: 40px; color: #ef4444;">${message}</div>`;
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