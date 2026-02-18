// Visual Editor JavaScript - 完全再実装版（シンプル・確実）
// 2026-02-18: ローディング無限ループ問題を根本解決

// ========================================
// 1. State Management
// ========================================
let currentPage = 'index.html';
let currentDevice = 'desktop';
let currentEditSection = null;
let contentData = {};
let isInitialized = false;

// ========================================
// 2. Icon Definitions
// ========================================
const availableIcons = [
    {value: 'fa-book-open', label: '本（開いた本）', category: '学習'},
    {value: 'fa-graduation-cap', label: '卒業帽', category: '学習'},
    {value: 'fa-pencil', label: '鉛筆', category: '学習'},
    {value: 'fa-chalkboard-teacher', label: '先生と黒板', category: '学習'},
    {value: 'fa-user-graduate', label: '学生', category: '学習'},
    {value: 'fa-book', label: '本（閉じた本）', category: '学習'},
    {value: 'fa-lightbulb', label: '電球（アイデア）', category: '学習'},
    {value: 'fa-brain', label: '脳', category: '学習'},
    
    {value: 'fa-island-tropical', label: '島', category: '自然'},
    {value: 'fa-water', label: '水', category: '自然'},
    {value: 'fa-tree', label: '木', category: '自然'},
    {value: 'fa-leaf', label: '葉', category: '自然'},
    {value: 'fa-sun', label: '太陽', category: '自然'},
    {value: 'fa-mountain', label: '山', category: '自然'},
    {value: 'fa-seedling', label: '芽', category: '自然'},
    {value: 'fa-cloud', label: '雲', category: '自然'},
    
    {value: 'fa-users', label: '人々（グループ）', category: '人・コミュニティ'},
    {value: 'fa-user-friends', label: '友達', category: '人・コミュニティ'},
    {value: 'fa-handshake', label: '握手', category: '人・コミュニティ'},
    {value: 'fa-hands-helping', label: '助け合う手', category: '人・コミュニティ'},
    {value: 'fa-people-carry', label: '協力', category: '人・コミュニティ'},
    {value: 'fa-user', label: '人', category: '人・コミュニティ'},
    {value: 'fa-child', label: '子供', category: '人・コミュニティ'},
    {value: 'fa-heart', label: 'ハート', category: '人・コミュニティ'},
    
    {value: 'fa-running', label: '走る人', category: 'スポーツ・活動'},
    {value: 'fa-football-ball', label: 'サッカーボール', category: 'スポーツ・活動'},
    {value: 'fa-basketball-ball', label: 'バスケットボール', category: 'スポーツ・活動'},
    {value: 'fa-volleyball-ball', label: 'バレーボール', category: 'スポーツ・活動'},
    {value: 'fa-dumbbell', label: 'ダンベル', category: 'スポーツ・活動'},
    {value: 'fa-medal', label: 'メダル', category: 'スポーツ・活動'},
    {value: 'fa-trophy', label: 'トロフィー', category: 'スポーツ・活動'},
    
    {value: 'fa-music', label: '音楽', category: '芸術'},
    {value: 'fa-palette', label: 'パレット', category: '芸術'},
    {value: 'fa-paint-brush', label: '絵筆', category: '芸術'},
    {value: 'fa-camera', label: 'カメラ', category: '芸術'},
    {value: 'fa-theater-masks', label: '演劇マスク', category: '芸術'},
    
    {value: 'fa-globe', label: '地球', category: 'その他'},
    {value: 'fa-rocket', label: 'ロケット', category: 'その他'},
    {value: 'fa-star', label: '星', category: 'その他'},
    {value: 'fa-flag', label: '旗', category: 'その他'},
    {value: 'fa-compass', label: 'コンパス', category: 'その他'},
    {value: 'fa-bullseye', label: '的', category: 'その他'}
];

// ========================================
// 3. Form Definitions
// ========================================
const formDefinitions = {
    header: {
        title: 'ヘッダー（ロゴ・連絡先）',
        fields: [
            {key: 'header_school_name', label: '学校名', type: 'text', placeholder: '学校名を入力'},
            {key: 'header_motto', label: 'モットー', type: 'text', placeholder: 'モットーを入力'},
            {key: 'header_top_phone', label: '電話番号（ヘッダー上部）', type: 'text', placeholder: '電話番号を入力（例: 0997-82-0142）'},
            {key: 'header_top_email', label: 'メールアドレス（ヘッダー上部）', type: 'text', placeholder: 'メールアドレスを入力'}
        ]
    },
    hero: {
        title: 'ヒーローセクション',
        fields: [
            {key: 'hero_title', label: 'メインタイトル', type: 'text', placeholder: 'メインタイトルを入力'},
            {key: 'hero_subtitle', label: 'サブタイトル', type: 'text', placeholder: 'サブタイトルを入力'},
            {key: 'hero_btn1', label: 'ボタン1テキスト', type: 'text', placeholder: 'ボタンテキストを入力'},
            {key: 'hero_btn2', label: 'ボタン2テキスト', type: 'text', placeholder: 'ボタンテキストを入力'},
            {key: 'hero_background_image', label: '背景画像', type: 'image', placeholder: '背景画像をアップロード'}
        ]
    },
    news: {
        title: 'ニュースセクション',
        fields: [
            {key: 'news_title', label: 'セクションタイトル', type: 'text', placeholder: 'タイトルを入力'},
            {key: 'news_link', label: 'リンクテキスト', type: 'text', placeholder: 'リンクテキストを入力'}
        ]
    },
    about: {
        title: '学校紹介セクション',
        fields: [
            {key: 'about_title', label: 'セクションタイトル', type: 'text', placeholder: 'タイトルを入力'},
            {key: 'about_lead', label: 'リード文', type: 'text', placeholder: 'リード文を入力'},
            {key: 'about_description', label: '説明文（第1段落）', type: 'textarea', placeholder: '説明文を入力', rows: 4},
            {key: 'about_description2', label: '説明文（第2段落）', type: 'textarea', placeholder: '説明文を入力', rows: 4},
            {key: 'about_btn', label: 'ボタンテキスト', type: 'text', placeholder: 'ボタンテキストを入力'},
            {key: 'about_section_image', label: 'セクション画像', type: 'image', placeholder: '画像をアップロード'}
        ]
    },
    features: {
        title: '教育の特色セクション',
        fields: [
            {key: 'features_title', label: 'セクションタイトル', type: 'text', placeholder: 'タイトルを入力'},
            {key: 'feature1_icon', label: '特色1 - アイコン', type: 'icon', placeholder: 'アイコンを選択'},
            {key: 'feature1_title', label: '特色1 - タイトル', type: 'text', placeholder: 'タイトルを入力'},
            {key: 'feature1_description', label: '特色1 - 説明文', type: 'textarea', placeholder: '説明文を入力', rows: 3},
            {key: 'feature2_icon', label: '特色2 - アイコン', type: 'icon', placeholder: 'アイコンを選択'},
            {key: 'feature2_title', label: '特色2 - タイトル', type: 'text', placeholder: 'タイトルを入力'},
            {key: 'feature2_description', label: '特色2 - 説明文', type: 'textarea', placeholder: '説明文を入力', rows: 3},
            {key: 'feature3_icon', label: '特色3 - アイコン', type: 'icon', placeholder: 'アイコンを選択'},
            {key: 'feature3_title', label: '特色3 - タイトル', type: 'text', placeholder: 'タイトルを入力'},
            {key: 'feature3_description', label: '特色3 - 説明文', type: 'textarea', placeholder: '説明文を入力', rows: 3},
            {key: 'feature4_icon', label: '特色4 - アイコン', type: 'icon', placeholder: 'アイコンを選択'},
            {key: 'feature4_title', label: '特色4 - タイトル', type: 'text', placeholder: 'タイトルを入力'},
            {key: 'feature4_description', label: '特色4 - 説明文', type: 'textarea', placeholder: '説明文を入力', rows: 3}
        ]
    },
    events: {
        title: '行事予定セクション',
        fields: [
            {key: 'events_title', label: 'セクションタイトル', type: 'text', placeholder: 'タイトルを入力'},
            {key: 'events_link', label: 'リンクテキスト', type: 'text', placeholder: 'リンクテキストを入力'}
        ]
    },
    footer: {
        title: 'フッター',
        fields: [
            {key: 'footer_school_name', label: '学校名', type: 'text', placeholder: '学校名を入力'},
            {key: 'footer_address', label: '住所', type: 'textarea', placeholder: '住所を入力（改行可）', rows: 2},
            {key: 'footer_phone', label: '電話番号', type: 'text', placeholder: '電話番号を入力'},
            {key: 'footer_email', label: 'メールアドレス', type: 'text', placeholder: 'メールアドレスを入力'},
            {key: 'footer_access_title', label: 'アクセスタイトル', type: 'text', placeholder: 'タイトルを入力'},
            {key: 'footer_access1', label: 'アクセス1', type: 'text', placeholder: 'アクセス方法1を入力'},
            {key: 'footer_access2', label: 'アクセス2', type: 'text', placeholder: 'アクセス方法2を入力'},
            {key: 'footer_copyright', label: 'コピーライト', type: 'text', placeholder: 'コピーライトを入力'}
        ]
    }
};

// ページごとのフォーム定義マッピング
const pageFormMappings = {
    'index.html': ['header', 'hero', 'news', 'about', 'features', 'events', 'footer'],
    'about.html': ['header', 'footer'],
    'events.html': ['header', 'footer'],
    'newsletter.html': ['header', 'footer'],
    'blog.html': ['header', 'footer'],
    'access.html': ['header', 'footer'],
    'contact.html': ['header', 'footer']
};

// ========================================
// 4. Initialization
// ========================================
document.addEventListener('DOMContentLoaded', async () => {
    // 二重初期化を防止
    if (isInitialized) {
        console.warn('⚠️ Visual Editor: Already initialized');
        return;
    }
    isInitialized = true;
    
    console.log('🚀 Visual Editor: Initializing...');
    
    try {
        // イベントリスナーをセットアップ
        setupEventListeners();
        console.log('✅ Event listeners set up');
        
        // コンテンツをロード
        await loadAllContent();
        console.log('✅ Content loaded:', Object.keys(contentData).length, 'settings');
        
        // 編集可能セクションを更新
        updateEditableSections(currentPage);
        console.log('✅ Editable sections updated');
        
        // プレビューをロード
        await loadPreview();
        console.log('✅ Preview loaded');
        
        console.log('🎉 Visual Editor: Initialization complete!');
    } catch (error) {
        console.error('❌ Visual Editor: Initialization failed:', error);
        showError(`初期化に失敗しました: ${error.message}`);
    }
});

// ========================================
// 5. Event Listeners
// ========================================
function setupEventListeners() {
    // ページ選択
    const pageSelect = document.getElementById('page-select');
    if (pageSelect) {
        pageSelect.addEventListener('change', (e) => {
            currentPage = e.target.value;
            console.log('Page changed:', currentPage);
            updateEditableSections(currentPage);
            loadPreview();
        });
    }

    // デバイス切り替え
    document.querySelectorAll('.device-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentDevice = e.currentTarget.dataset.device;
            console.log('Device changed:', currentDevice);
            updatePreviewDevice();
        });
    });

    // プレビュー更新ボタン
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', (e) => {
            const btn = e.currentTarget;
            const icon = btn.querySelector('i');
            
            icon.classList.add('fa-spin');
            btn.disabled = true;
            
            loadPreview().finally(() => {
                setTimeout(() => {
                    icon.classList.remove('fa-spin');
                    btn.disabled = false;
                }, 500);
            });
        });
    }

    // フォームアクション
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    
    if (saveBtn) saveBtn.addEventListener('click', saveChanges);
    if (cancelBtn) cancelBtn.addEventListener('click', cancelEdit);
}

// ========================================
// 6. Content Loading
// ========================================
async function loadAllContent() {
    console.log('📥 Loading site settings from API...');
    
    try {
        // 🔥 API パスを修正 - /api/ プレフィックスを確実に付与
        const response = await fetch('/api/tables/site_settings?limit=100');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ API response:', data);
        
        if (data.data && Array.isArray(data.data)) {
            contentData = {};
            data.data.forEach(item => {
                contentData[item.setting_key] = item.setting_value;
            });
            console.log('✅ Content data loaded:', Object.keys(contentData).length, 'settings');
        } else {
            console.warn('⚠️ No site settings found in response');
            contentData = {};
        }
    } catch (error) {
        console.error('❌ Failed to load content:', error);
        showError(`コンテンツの読み込みに失敗しました: ${error.message}`);
        contentData = {};
    }
}

// ========================================
// 7. Preview Loading (シンプル版)
// ========================================
function loadPreview() {
    return new Promise((resolve, reject) => {
        const iframe = document.getElementById('preview-iframe');
        const loadingOverlay = document.getElementById('preview-loading');
        
        if (!iframe) {
            console.error('❌ Iframe element not found');
            reject(new Error('Iframe element not found'));
            return;
        }
        
        // ローディング表示
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
            console.log('🔄 Loading preview:', currentPage);
        }
        
        // タイムアウト設定（10秒）
        const loadTimeout = setTimeout(() => {
            console.warn('⚠️ Preview load timeout (10s)');
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
            showError('プレビューの読み込みがタイムアウトしました。ページが存在しない可能性があります。');
            reject(new Error('Load timeout'));
        }, 10000);
        
        // onload イベントハンドラ
        iframe.onload = () => {
            clearTimeout(loadTimeout);
            console.log('✅ Preview loaded successfully:', currentPage);
            
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
            
            resolve();
        };
        
        // onerror イベントハンドラ
        iframe.onerror = (error) => {
            clearTimeout(loadTimeout);
            console.error('❌ Preview load failed:', error);
            
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
            
            showError('ページの読み込みに失敗しました');
            reject(error);
        };
        
        // iframe の src を設定（キャッシュバスティング付き）
        const cacheBuster = Date.now();
        iframe.src = `${currentPage}?_=${cacheBuster}`;
        console.log('📄 Loading iframe:', iframe.src);
    });
}

// ========================================
// 8. Editable Sections Management
// ========================================
function updateEditableSections(pageName) {
    const elementList = document.querySelector('.element-list');
    if (!elementList) return;
    
    const sections = pageFormMappings[pageName] || [];
    console.log('Updating editable sections for:', pageName, sections);
    
    const sectionIcons = {
        'header': 'fa-heading',
        'hero': 'fa-star',
        'news': 'fa-newspaper',
        'about': 'fa-info-circle',
        'features': 'fa-lightbulb',
        'events': 'fa-calendar',
        'footer': 'fa-shoe-prints'
    };
    
    let html = '';
    sections.forEach(sectionId => {
        const formDef = formDefinitions[sectionId];
        if (formDef) {
            const icon = sectionIcons[sectionId] || 'fa-edit';
            html += `
                <div class="element-item" data-edit-element="${sectionId}">
                    <i class="fas ${icon}"></i> ${formDef.title}
                </div>
            `;
        }
    });
    
    elementList.innerHTML = html || '<div class="element-item" style="text-align:center; color:#999;">このページには編集可能な要素がありません</div>';
    
    // イベントリスナーを再設定
    elementList.querySelectorAll('[data-edit-element]').forEach(element => {
        element.addEventListener('click', () => {
            const sectionId = element.dataset.editElement;
            selectSection(sectionId);
        });
    });
    
    // 編集フォームをクリア
    cancelEdit();
}

// ========================================
// 9. Section Selection
// ========================================
function selectSection(sectionId) {
    console.log('Selecting section:', sectionId);
    
    // アクティブクラスを更新
    document.querySelectorAll('.element-item').forEach(el => el.classList.remove('active'));
    const selectedElement = document.querySelector(`[data-edit-element="${sectionId}"]`);
    if (selectedElement) {
        selectedElement.classList.add('active');
    }

    // プレースホルダーを非表示
    const placeholder = document.getElementById('edit-placeholder');
    if (placeholder) {
        placeholder.style.display = 'none';
    }

    // フォームを表示
    currentEditSection = sectionId;
    renderForm(sectionId);
}

// ========================================
// 10. Form Rendering
// ========================================
function renderForm(sectionId) {
    const formContainer = document.getElementById('dynamic-forms');
    const formDef = formDefinitions[sectionId];
    
    if (!formDef || !formContainer) {
        console.error('Form definition or container not found:', sectionId);
        return;
    }

    let formHTML = `
        <form class="edit-form active" id="form-${sectionId}">
            <div class="form-section">
                <div class="form-section-title">${formDef.title}</div>
    `;

    formDef.fields.forEach(field => {
        const value = contentData[field.key] || '';
        
        formHTML += `
            <div class="form-group">
                <label>${field.label}</label>
        `;

        if (field.type === 'textarea') {
            formHTML += `
                <textarea 
                    name="${field.key}" 
                    id="field-${field.key}"
                    rows="${field.rows || 4}" 
                    placeholder="${field.placeholder}"
                >${escapeHtml(value)}</textarea>
            `;
        } else if (field.type === 'icon') {
            formHTML += `
                <div class="icon-selector">
                    <select 
                        name="${field.key}" 
                        id="field-${field.key}"
                        class="icon-select"
                        onchange="updateIconPreview('${field.key}')"
                    >
                        <option value="">アイコンを選択...</option>
            `;
            
            const categories = [...new Set(availableIcons.map(icon => icon.category))];
            categories.forEach(category => {
                formHTML += `<optgroup label="${category}">`;
                availableIcons.filter(icon => icon.category === category).forEach(icon => {
                    const selected = value === icon.value ? 'selected' : '';
                    formHTML += `<option value="${icon.value}" ${selected}>${icon.label}</option>`;
                });
                formHTML += `</optgroup>`;
            });
            
            formHTML += `
                    </select>
                    <div class="icon-preview" id="preview-${field.key}">
                        <i class="fas ${value || 'fa-question'}" style="font-size: 2rem; color: #3b82f6;"></i>
                    </div>
                </div>
            `;
        } else {
            const isImageField = field.key.includes('_image') || field.key.includes('_photo');
            
            formHTML += `
                <input 
                    type="text" 
                    name="${field.key}" 
                    id="field-${field.key}"
                    value="${escapeHtml(value)}" 
                    placeholder="${field.placeholder}"
                >
            `;
            
            if (isImageField) {
                formHTML += `
                    <button type="button" class="image-upload-btn" onclick="openImagePicker('${field.key}')">
                        <i class="fas fa-upload"></i> 画像をアップロード
                    </button>
                    <div class="image-preview-container ${value ? 'show' : ''}" id="preview-container-${field.key}">
                        <img src="${value}" alt="プレビュー" id="preview-img-${field.key}">
                        <div class="image-preview-actions">
                            <button type="button" class="btn-change-image" onclick="openImagePicker('${field.key}')">
                                <i class="fas fa-exchange-alt"></i> 変更
                            </button>
                            <button type="button" class="btn-remove-image" onclick="removeImage('${field.key}')">
                                <i class="fas fa-trash"></i> 削除
                            </button>
                        </div>
                    </div>
                `;
            }
        }

        formHTML += `</div>`;
    });

    formHTML += `
            </div>
        </form>
    `;

    formContainer.innerHTML = formHTML;
    console.log('✅ Form rendered:', sectionId);
}

// ========================================
// 11. Save Changes
// ========================================
async function saveChanges() {
    if (!currentEditSection) {
        showError('編集する要素を選択してください');
        return;
    }

    const form = document.getElementById(`form-${currentEditSection}`);
    if (!form) {
        console.error('Form not found:', `form-${currentEditSection}`);
        return;
    }

    const formData = new FormData(form);
    const updates = {};
    
    formData.forEach((value, key) => {
        updates[key] = value;
    });

    console.log('💾 Saving updates:', updates);

    const saveBtn = document.getElementById('save-btn');
    const originalText = saveBtn.textContent;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 保存中...';

    try {
        // 🔥 並列処理で全フィールドを更新
        const updatePromises = Object.entries(updates).map(([key, value]) => 
            updatePageContent(key, value)
        );
        
        await Promise.all(updatePromises);
        console.log('✅ All updates completed');

        // ローカルデータを更新
        Object.assign(contentData, updates);

        // プレビューを更新
        await loadPreview();

        showSuccess('変更を保存しました');

    } catch (error) {
        console.error('❌ Failed to save changes:', error);
        showError('保存に失敗しました: ' + error.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
    }
}

// ========================================
// 12. Update Page Content
// ========================================
async function updatePageContent(settingKey, settingValue) {
    try {
        // 🔥 API パスを修正 - /api/ プレフィックスを確実に付与
        const response = await fetch('/api/tables/site_settings?limit=100');
        const data = await response.json();
        const existingRecord = data.data?.find(item => item.setting_key === settingKey);

        if (existingRecord) {
            // 既存レコードを更新
            const updateResponse = await fetch(`/api/tables/site_settings/${existingRecord.id}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ setting_value: settingValue })
            });

            if (!updateResponse.ok) {
                throw new Error(`Failed to update: ${updateResponse.statusText}`);
            }
            
            console.log(`✅ Updated: ${settingKey}`);
        } else {
            // 新規レコードを作成
            const settingGroup = settingKey.split('_')[0];
            const createResponse = await fetch('/api/tables/site_settings', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    setting_key: settingKey,
                    setting_value: settingValue,
                    setting_group: settingGroup,
                    description: `${settingKey} の設定値`
                })
            });

            if (!createResponse.ok) {
                throw new Error(`Failed to create: ${createResponse.statusText}`);
            }
            
            console.log(`✅ Created: ${settingKey}`);
        }
    } catch (error) {
        console.error(`❌ Error updating ${settingKey}:`, error);
        throw error;
    }
}

// ========================================
// 13. Helper Functions
// ========================================
function updatePreviewDevice() {
    const wrapper = document.querySelector('.preview-wrapper');
    if (wrapper) {
        wrapper.className = 'preview-wrapper ' + currentDevice;
        console.log('Device class updated:', wrapper.className);
    }
}

function cancelEdit() {
    document.querySelectorAll('.element-item').forEach(el => el.classList.remove('active'));
    
    const placeholder = document.getElementById('edit-placeholder');
    const dynamicForms = document.getElementById('dynamic-forms');
    
    if (placeholder) placeholder.style.display = 'block';
    if (dynamicForms) dynamicForms.innerHTML = '';
    
    currentEditSection = null;
    console.log('Edit cancelled');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showSuccess(message) {
    console.log('✅ Success:', message);
    
    // Toast 通知を使用（window.toast が利用可能な場合）
    if (window.toast && typeof window.toast.success === 'function') {
        window.toast.success(message);
    } else {
        // フォールバック: シンプルな成功メッセージ
        alert(`成功: ${message}`);
    }
}

function showError(message) {
    console.error('❌ Error:', message);
    
    // Toast 通知を使用（window.toast が利用可能な場合）
    if (window.toast && typeof window.toast.error === 'function') {
        window.toast.error(message);
    } else {
        // フォールバック: シンプルなエラーメッセージ
        alert(`エラー: ${message}`);
    }
}

// アイコンプレビュー更新
function updateIconPreview(fieldKey) {
    const select = document.getElementById(`field-${fieldKey}`);
    const preview = document.getElementById(`preview-${fieldKey}`);
    
    if (select && preview) {
        const iconClass = select.value || 'fa-question';
        preview.innerHTML = `<i class="fas ${iconClass}" style="font-size: 2rem; color: #3b82f6;"></i>`;
    }
}

// 画像ピッカー
function openImagePicker(fieldKey) {
    if (typeof showImagePickerModal !== 'function') {
        showError('画像アップロード機能が利用できません');
        return;
    }
    
    showImagePickerModal(function(imageUrl) {
        const inputField = document.getElementById(`field-${fieldKey}`);
        const previewContainer = document.getElementById(`preview-container-${fieldKey}`);
        const previewImg = document.getElementById(`preview-img-${fieldKey}`);
        
        if (inputField) inputField.value = imageUrl;
        if (previewContainer && previewImg) {
            previewImg.src = imageUrl;
            previewContainer.classList.add('show');
        }
    });
}

// 画像削除
function removeImage(fieldKey) {
    const inputField = document.getElementById(`field-${fieldKey}`);
    const previewContainer = document.getElementById(`preview-container-${fieldKey}`);
    
    if (inputField) inputField.value = '';
    if (previewContainer) previewContainer.classList.remove('show');
}

// グローバルスコープに公開
window.updateIconPreview = updateIconPreview;
window.openImagePicker = openImagePicker;
window.removeImage = removeImage;

console.log('📦 Visual Editor script loaded');
