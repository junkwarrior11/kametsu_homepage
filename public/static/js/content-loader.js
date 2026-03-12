/**
 * コンテンツローダー
 * データベースから site_settings を読み込み、data-setting 属性を持つ要素に反映
 */

(function() {
    'use strict';
    
    console.log('📄 Content Loader: Initializing...');
    
    // ページ読み込み時に実行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadContent);
    } else {
        loadContent();
    }
    
    async function loadContent() {
        try {
            console.log('📡 Loading site settings from database...');
            
            // データベースから設定を取得
            const response = await fetch('/api/tables/site_settings?limit=200');
            
            if (!response.ok) {
                console.warn('⚠️ Failed to load site settings:', response.status);
                return;
            }
            
            const data = await response.json();
            
            if (!data.data || !Array.isArray(data.data)) {
                console.warn('⚠️ Invalid site settings data format');
                return;
            }
            
            console.log(`✅ Loaded ${data.data.length} settings from database`);
            
            // 設定キーと値のマップを作成
            const settings = {};
            data.data.forEach(item => {
                settings[item.setting_key] = item.setting_value;
            });
            
            // data-setting 属性を持つ全ての要素を取得
            const elements = document.querySelectorAll('[data-setting]');
            console.log(`🔍 Found ${elements.length} elements with data-setting attribute`);
            
            let updatedCount = 0;
            
            // 各要素に設定値を反映
            elements.forEach(element => {
                const settingKey = element.getAttribute('data-setting');
                const settingValue = settings[settingKey];
                
                if (settingValue !== undefined && settingValue !== null) {
                    // 現在の値と異なる場合のみ更新
                    const currentValue = element.textContent.trim();
                    
                    if (currentValue !== settingValue) {
                        element.textContent = settingValue;
                        updatedCount++;
                        console.log(`✏️ Updated ${settingKey}: "${currentValue}" → "${settingValue}"`);
                    }
                }
            });
            
            console.log(`✅ Content loading complete: ${updatedCount} elements updated`);
            
        } catch (error) {
            console.error('❌ Content loading error:', error);
        }
    }
    
    // Visual Editor との連携のため、グローバルに公開
    window.reloadContent = loadContent;
    
})();
