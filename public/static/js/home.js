// ========================================
// トップページ - データ読み込み
// ========================================

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // コンテンツ固有のデータのみ読み込む（サイト設定はcontent-loader.jsが処理）
        await Promise.all([
            loadRecentNews(),
            loadUpcomingEvents()
        ]);
    } catch (error) {
        console.error('初期読み込みエラー:', error);
    }
});

// 動的コンテンツを読み込む (すべてのセクション)
// ※この関数は削除 - content-loader.jsが処理します
async function loadDynamicContent() {
    try {
        // キャッシュバスター: 常に最新データを取得
        const cacheBuster = Date.now();
        const response = await fetch('/api/tables/site_settings?limit=100_=' + cacheBuster);
        const result = await response.json();
        
        if (result.data) {
            const settings = {};
            result.data.forEach(item => {
                settings[item.setting_key] = item.setting_value;
            });
            
            // デバッグ用: 読み込んだ設定を確認
            console.log('Loaded settings:', Object.keys(settings).length, 'items');
            
            // ページタイトルを動的に設定
            if (settings.header_school_name) {
                document.title = settings.header_school_name;
            }
            
            // ヘッダーロゴ
            updateTextContent('header-school-name', settings.header_school_name);
            updateTextContent('header-motto', settings.header_motto);
            
            // ヘッダー連絡先（上部）
            updateTextContent('header-top-phone', settings.header_top_phone);
            updateTextContent('header-top-email', settings.header_top_email);
            
            // ヒーローセクション
            updateTextContent('hero-title', settings.hero_title);
            updateTextContent('hero-subtitle', settings.hero_subtitle);
            updateTextContent('hero-btn1', settings.hero_btn1);
            updateTextContent('hero-btn2', settings.hero_btn2);
            updateHeroBackground('hero-section', settings.hero_background_image);
            
            // ニュースセクション
            updateTextContent('news-title', settings.news_title);
            updateTextContent('news-link', settings.news_link);
            
            // 学校紹介セクション
            updateTextContent('about-title', settings.about_title);
            updateTextContent('about-lead', settings.about_lead);
            updateTextContent('about-description', settings.about_description);
            updateTextContent('about-description2', settings.about_description2);
            updateTextContent('about-btn', settings.about_btn);
            updateImageSrc('about-image', settings.about_section_image);
            
            // 教育の特色セクション
            updateTextContent('features-title', settings.features_title);
            
            // 動的リスト形式の特色項目を処理
            if (settings.features_items) {
                try {
                    const featuresItems = JSON.parse(settings.features_items);
                    updateFeaturesGrid(featuresItems);
                } catch (e) {
                    console.warn('Failed to parse features_items, falling back to individual fields');
                    // フォールバック: 個別フィールド形式
                    updateIcon('feature1-icon', settings['feature1_icon']);
                    updateTextContent('feature1-title', settings['feature1_title']);
                    updateTextContent('feature1-description', settings['feature1_description']);
                    updateIcon('feature2-icon', settings['feature2_icon']);
                    updateTextContent('feature2-title', settings['feature2_title']);
                    updateTextContent('feature2-description', settings['feature2_description']);
                    updateIcon('feature3-icon', settings['feature3_icon']);
                    updateTextContent('feature3-title', settings['feature3_title']);
                    updateTextContent('feature3-description', settings['feature3_description']);
                    updateIcon('feature4-icon', settings['feature4_icon']);
                    updateTextContent('feature4-title', settings['feature4_title']);
                    updateTextContent('feature4-description', settings['feature4_description']);
                }
            } else {
                // フォールバック: 個別フィールド形式
                updateIcon('feature1-icon', settings['feature1_icon']);
                updateTextContent('feature1-title', settings['feature1_title']);
                updateTextContent('feature1-description', settings['feature1_description']);
                updateIcon('feature2-icon', settings['feature2_icon']);
                updateTextContent('feature2-title', settings['feature2_title']);
                updateTextContent('feature2-description', settings['feature2_description']);
                updateIcon('feature3-icon', settings['feature3_icon']);
                updateTextContent('feature3-title', settings['feature3_title']);
                updateTextContent('feature3-description', settings['feature3_description']);
                updateIcon('feature4-icon', settings['feature4_icon']);
                updateTextContent('feature4-title', settings['feature4_title']);
                updateTextContent('feature4-description', settings['feature4_description']);
            }
            
            // 行事予定セクション
            updateTextContent('events-title', settings.events_title);
            updateTextContent('events-link', settings.events_link);
            
            // フッター
            updateTextContent('footer-school-name', settings.footer_school_name);
            updateHTML('footer-address', settings.footer_address);
            updateTextContent('footer-phone', settings.footer_phone);
            updateTextContent('footer-email', settings.footer_email);
            updateTextContent('footer-access-title', settings.footer_access_title);
            updateTextContent('footer-access1', settings.footer_access1);
            updateTextContent('footer-access2', settings.footer_access2);
            updateHTML('footer-copyright', settings.footer_copyright);
        }
    } catch (error) {
        console.error('Failed to load dynamic content:', error);
        // エラーでもページは表示されるようにする
    }
}

// テキストコンテンツを更新するヘルパー関数
function updateTextContent(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn(`Element not found: ${elementId}`);
        return;
    }
    if (value !== undefined && value !== null) {
        element.textContent = value;
    } else {
        console.warn(`No value for: ${elementId}`);
    }
}

// HTMLコンテンツを更新するヘルパー関数（改行やHTMLタグを含む場合）
function updateHTML(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn(`Element not found: ${elementId}`);
        return;
    }
    if (value !== undefined && value !== null) {
        element.innerHTML = value;
    } else {
        console.warn(`No value for: ${elementId}`);
    }
}

// アイコンを更新するヘルパー関数
function updateIcon(elementId, iconClass) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn(`Element not found: ${elementId}`);
        return;
    }
    if (iconClass !== undefined && iconClass !== null && iconClass !== '') {
        // 既存のクラスをクリアして新しいアイコンクラスを設定
        element.className = `fas ${iconClass}`;
    } else {
        console.warn(`No icon class for: ${elementId}`);
    }
}

// ヒーロー背景画像を更新するヘルパー関数
function updateHeroBackground(elementId, imageUrl) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn(`Element not found: ${elementId}`);
        return;
    }
    if (imageUrl !== undefined && imageUrl !== null && imageUrl !== '') {
        element.style.backgroundImage = `url('${imageUrl}')`;
    }
}

// 画像のsrcを更新するヘルパー関数
function updateImageSrc(elementId, imageUrl) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn(`Element not found: ${elementId}`);
        return;
    }
    if (imageUrl !== undefined && imageUrl !== null && imageUrl !== '') {
        element.src = imageUrl;
    }
}

// 最新のお知らせ（学校だより・行事予定）を読み込む
async function loadRecentNews() {
    const newsGrid = document.getElementById('newsGrid');
    
    if (!newsGrid) return;
    
    showLoading(newsGrid);
    
    try {
        // 学校だよりと行事予定を並行して取得（取得件数を増やす）
        const [newslettersRes, eventsRes] = await Promise.all([
            fetch('/api/tables/newsletters?limit=10&sort=-issue_date'),
            fetch('/api/tables/events?limit=10&sort=-event_date')
        ]);
        
        const newslettersData = await newslettersRes.json();
        const eventsData = await eventsRes.json();
        
        const newsletters = newslettersData.data || [];
        const events = eventsData.data || [];
        
        // PDFデータを取得してData URIとファイル名を返す関数
        async function getPdfDataWithName(fileUrl) {
            if (!fileUrl) return { url: null, fileName: null };
            
            try {
                // file_urlがAPIエンドポイントの場合、PDFデータを取得
                if (fileUrl.startsWith('/api/tables/uploaded_pdfs/')) {
                    const response = await fetch(fileUrl);
                    const pdfData = await response.json();
                    
                    if (pdfData.pdf_data) {
                        // Base64データをData URI形式に変換
                        const base64Data = pdfData.pdf_data;
                        const dataUri = base64Data.startsWith('data:application/pdf') 
                            ? base64Data 
                            : `data:application/pdf;base64,${base64Data}`;
                        
                        return {
                            url: dataUri,
                            fileName: pdfData.file_name || 'document.pdf'
                        };
                    }
                }
                return { url: fileUrl, fileName: null }; // それ以外はそのまま返す
            } catch (error) {
                console.error('Error fetching PDF data:', error);
                return { url: null, fileName: null };
            }
        }
        
        // 学校だよりと行事予定を結合
        const allItems = [
            ...newsletters.map(item => ({
                type: 'newsletter',
                title: item.title,
                date: item.issue_date,
                fileUrl: item.file_url,
                fileName: item.file_name, // 元ファイル名を保持
                icon: 'fa-newspaper',
                category: '学校だより'
            })),
            ...events.map(item => ({
                type: 'event',
                title: item.title,
                date: item.event_date,
                fileUrl: item.file_url,
                fileName: item.file_name, // 元ファイル名を保持
                description: item.description,
                icon: 'fa-calendar',
                category: '行事予定'
            }))
        ];
        
        // 3ヶ月前の日付を計算
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        // 3ヶ月以内の情報のみフィルター
        const recentItems = allItems.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= threeMonthsAgo;
        });
        
        // 日付順にソート（新しい順）
        recentItems.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // 最新5件のみ表示
        const latestItems = recentItems.slice(0, 5);
        
        if (latestItems.length === 0) {
            showEmpty(newsGrid, '最近のお知らせはありません（過去3ヶ月以内）');
            return;
        }
        
        // PDFデータを取得してData URIとファイル名を取得
        const itemsWithPdfData = await Promise.all(
            latestItems.map(async item => {
                const pdfData = await getPdfDataWithName(item.fileUrl);
                return {
                    ...item,
                    pdfUrl: pdfData.url,
                    downloadFileName: pdfData.fileName || item.fileName || 'document.pdf'
                };
            })
        );
        
        newsGrid.innerHTML = itemsWithPdfData.map(item => `
            <div class="news-card">
                <div class="news-card-content" style="padding: 30px;">
                    <div class="news-card-meta">
                        <span class="news-card-category">
                            <i class="fas ${item.icon}"></i> ${escapeHtml(item.category)}
                        </span>
                        <span>${formatDate(item.date)}</span>
                    </div>
                    <h3 class="news-card-title">${escapeHtml(item.title)}</h3>
                    ${item.description ? `<p class="news-card-excerpt">${escapeHtml(item.description)}</p>` : ''}
                    ${item.pdfUrl ? `
                        <a href="${item.pdfUrl}" download="${escapeHtml(item.downloadFileName)}" class="btn btn-outline" style="margin-top: 15px;">
                            <i class="fas fa-download"></i> ダウンロード
                        </a>
                    ` : ''}
                </div>
            </div>
        `).join('');
        
        console.log(`✅ Loaded ${latestItems.length} news items (within 3 months)`);
    } catch (error) {
        console.error('Error loading news:', error);
        showError(newsGrid, 'お知らせの読み込みに失敗しました');
    }
}

// ローディング画面を非表示にする
function hideLoadingScreen() {
    // コンテンツを表示
    const contentWrapper = document.getElementById('contentWrapper');
    if (contentWrapper) {
        contentWrapper.classList.add('loaded');
    }
    
    // ローディング画面を非表示
    const pageLoading = document.getElementById('pageLoading');
    if (pageLoading) {
        pageLoading.style.opacity = '0';
        setTimeout(() => {
            pageLoading.style.display = 'none';
        }, 300); // フェードアウト時間と一致
    }
    
    // bodyのloadingクラスを削除
    document.body.classList.remove('loading');
}

// 今後の行事予定を読み込む
async function loadUpcomingEvents() {
    const eventsContainer = document.getElementById('upcomingEvents');
    
    if (!eventsContainer) return;
    
    showLoading(eventsContainer);
    
    try {
        const response = await fetch('/api/tables/events?limit=5&sort=event_date');
        
        if (!response.ok) {
            throw new Error('データの取得に失敗しました');
        }
        
        const result = await response.json();
        const events = result.data || [];
        
        // 今日以降のイベントのみをフィルター
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcomingEvents = events.filter(event => {
            const eventDate = new Date(event.event_date);
            return eventDate >= today;
        }).slice(0, 5);
        
        if (upcomingEvents.length === 0) {
            showEmpty(eventsContainer, '今後の行事予定はありません');
            return;
        }
        
        eventsContainer.innerHTML = upcomingEvents.map(event => `
            <div class="event-item">
                <div class="event-date">
                    <span class="event-date-day">${formatDay(event.event_date)}</span>
                    <span class="event-date-month">${formatMonth(event.event_date)}</span>
                </div>
                <div class="event-details">
                    <h3>${escapeHtml(event.title)}</h3>
                    <p>${escapeHtml(event.description)}</p>
                    <p style="font-size: 0.875rem; color: #9ca3af; margin-top: 5px;">
                        <i class="fas fa-map-marker-alt"></i> ${escapeHtml(event.location)} | 
                        <i class="fas fa-users"></i> ${escapeHtml(event.target_grade)}
                    </p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading events:', error);
        showError(eventsContainer, '行事予定の読み込みに失敗しました');
    }
}



/**
 * 教育の特色グリッドを動的に更新
 */
function updateFeaturesGrid(items) {
    const grid = document.querySelector('.features-grid');
    if (!grid) return;
    
    // グリッドをクリア
    grid.innerHTML = '';
    
    // 各項目を追加
    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'feature-card';
        card.innerHTML = `
            <div class="feature-icon">
                <i class="fas ${item.icon || 'fa-star'}"></i>
            </div>
            <h3>${escapeHtml(item.title || '')}</h3>
            <p>${escapeHtml(item.description || '')}</p>
        `;
        grid.appendChild(card);
    });
    
    console.log(`✅ Updated features grid: ${items.length} items`);
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