/**
 * アクセスページの地図読み込み
 * データベースから地図のURLを取得してiframeで表示
 */

(function() {
    'use strict';
    
    console.log('🗺️ Map Loader: Initializing...');
    
    // ページ読み込み時に実行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadMap);
    } else {
        loadMap();
    }
    
    async function loadMap() {
        const mapContainer = document.getElementById('map-container');
        
        if (!mapContainer) {
            console.warn('⚠️ Map container not found');
            return;
        }
        
        try {
            console.log('📡 Loading map settings from database...');
            
            // データベースから地図設定を取得
            const response = await fetch('/api/tables/site_settings?setting_key=access_map_url&limit=1');
            
            if (!response.ok) {
                console.warn('⚠️ Failed to load map settings:', response.status);
                showDefaultMap(mapContainer);
                return;
            }
            
            const data = await response.json();
            
            if (!data.data || data.data.length === 0) {
                console.log('ℹ️ No map URL in database, using default');
                showDefaultMap(mapContainer);
                return;
            }
            
            const mapUrl = data.data[0].setting_value;
            
            if (!mapUrl || mapUrl.trim() === '') {
                console.log('ℹ️ Empty map URL, using default');
                showDefaultMap(mapContainer);
                return;
            }
            
            // Google Map iframeを作成
            const iframe = document.createElement('iframe');
            iframe.src = mapUrl;
            iframe.width = '100%';
            iframe.height = '450';
            iframe.style.border = '0';
            iframe.allowFullscreen = true;
            iframe.loading = 'lazy';
            iframe.referrerpolicy = 'no-referrer-when-downgrade';
            
            mapContainer.innerHTML = '';
            mapContainer.appendChild(iframe);
            
            console.log('✅ Map loaded successfully');
            
            // ローディング画面を非表示
            hideLoadingScreen();
            
        } catch (error) {
            console.error('❌ Map loading error:', error);
            showDefaultMap(mapContainer);
            hideLoadingScreen();
        }
    }
    
    function showDefaultMap(container) {
        // デフォルトの地図（徳之島町立亀津小学校）
        const defaultMapUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3417.234!2d128.9234!3d27.7456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDQ0JzQ0LjIiTiAxMjjCsDU1JzI0LjIiRQ!5e0!3m2!1sja!2sjp!4v1234567890';
        
        const iframe = document.createElement('iframe');
        iframe.src = defaultMapUrl;
        iframe.width = '100%';
        iframe.height = '450';
        iframe.style.border = '0';
        iframe.allowFullscreen = true;
        iframe.loading = 'lazy';
        iframe.referrerpolicy = 'no-referrer-when-downgrade';
        
        container.innerHTML = '';
        container.appendChild(iframe);
        
        console.log('✅ Default map loaded');
        
        // ローディング画面を非表示
        hideLoadingScreen();
    }
    
    // ローディング画面を非表示にする関数
    function hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('pageLoading');
            const contentWrapper = document.getElementById('contentWrapper');
            
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
            
            if (contentWrapper) {
                contentWrapper.style.display = 'block';
            }
            
            document.body.classList.remove('loading');
            
            console.log('✅ Loading screen hidden');
        }, 300);
    }
    
    // Visual Editor との連携のため、グローバルに公開
    window.reloadMap = loadMap;
    
})();
