// ========================================
// トップページ - データ読み込み
// ========================================

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // データを並行で読み込む（完了を待つ）
        await Promise.all([
            loadDynamicContent(),
            loadRecentNews(),
            loadUpcomingEvents(),
            loadAccessCounter()
        ]);
        
        // すべてのデータ読み込み完了後にローディング画面を非表示
        // 最低0.3秒はローディング画面を表示（ちらつき防止）
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

// 動的コンテンツを読み込む (すべてのセクション)
async function loadDynamicContent() {
    try {
        // キャッシュを活用（5分間有効）
        const cacheTime = Math.floor(Date.now() / (1000 * 60 * 5)); // 5分ごとに更新
        const response = await fetch('/api/tables/site_settings?limit=100&_=' + cacheTime);
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

// 最新のお知らせ・ブログを読み込む
async function loadRecentNews() {
    const newsGrid = document.getElementById('newsGrid');
    
    if (!newsGrid) return;
    
    showLoading(newsGrid);
    
    try {
        const response = await fetch('/api/tables/blog_posts?limit=3&sort=-publish_date&status=公開');
        
        if (!response.ok) {
            throw new Error('データの取得に失敗しました');
        }
        
        const result = await response.json();
        const posts = result.data || [];
        
        if (posts.length === 0) {
            showEmpty(newsGrid, 'まだ記事がありません');
            return;
        }
        
        newsGrid.innerHTML = posts.map(post => `
            <div class="news-card">
                <div class="news-card-image">
                    <img src="${escapeHtml(post.featured_image || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800')}" 
                         alt="${escapeHtml(post.title)}">
                </div>
                <div class="news-card-content">
                    <div class="news-card-meta">
                        <span class="news-card-category">${escapeHtml(post.category || 'その他')}</span>
                        <span>${formatDate(post.publish_date)}</span>
                    </div>
                    <h3 class="news-card-title">${escapeHtml(post.title)}</h3>
                    <p class="news-card-excerpt">${truncateText(escapeHtml(post.content), 100)}</p>
                    <a href="blog-detail.html?id=${post.id}" class="btn btn-outline" style="margin-top: 15px;">続きを読む</a>
                </div>
            </div>
        `).join('');
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

// アクセスカウンターを読み込む
async function loadAccessCounter() {
    try {
        if (typeof window.getAccessStats === 'function') {
            const stats = await window.getAccessStats();
            
            const totalElement = document.getElementById('total-access');
            const monthlyElement = document.getElementById('monthly-access');
            
            if (totalElement) {
                totalElement.textContent = stats.total.toLocaleString();
            }
            if (monthlyElement) {
                monthlyElement.textContent = stats.monthly.toLocaleString();
            }
        }
    } catch (error) {
        console.error('Error loading access counter:', error);
    }
}