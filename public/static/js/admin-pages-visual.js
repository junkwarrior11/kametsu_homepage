// Visual Editor JavaScript - 完全版

// State Management
let currentPage = 'index.html';
let currentDevice = 'desktop';
let currentEditSection = null;
let contentData = {};

// 利用可能なアイコンリスト（Font Awesome）
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

// フォーム定義
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
}

// ページごとのフォーム定義マッピング
const pageFormMappings = {
    'index.html': ['header', 'hero', 'news', 'about', 'features', 'events', 'footer'],
    'about.html': ['about-page'],
    'events.html': ['events-page'],
    'newsletter.html': ['newsletter-page'],
    'blog.html': ['blog-page'],
    'access.html': ['access-page'],
    'contact.html': ['contact-page']
};

// 他ページ用のフォーム定義
const otherPageForms = {
    'about-page': {
        title: '学校概要ページ',
        fields: [
            {key: 'about_page_title', label: 'ページタイトル', type: 'text', placeholder: 'タイトルを入力'},
            {key: 'about_page_subtitle', label: 'サブタイトル', type: 'text', placeholder: 'サブタイトルを入力'},
            
            // 学校の歴史セクション
            {key: 'about_history_title', label: '歴史セクションタイトル', type: 'text', placeholder: 'タイトルを入力'},
            {key: 'about_history_text1', label: '歴史テキスト（第1段落）', type: 'textarea', placeholder: '説明文を入力', rows: 4},
            {key: 'about_history_text2', label: '歴史テキスト（第2段落）', type: 'textarea', placeholder: '説明文を入力', rows: 3},
            
            // 校長挨拶セクション
            {key: 'about_principal_title', label: '校長挨拶タイトル', type: 'text', placeholder: 'タイトルを入力'},
            {key: 'about_principal_photo', label: '校長写真URL', type: 'text', placeholder: '画像URLを入力'},
            {key: 'about_principal_text1', label: '校長挨拶（第1段落）', type: 'textarea', placeholder: '挨拶文を入力', rows: 4},
            {key: 'about_principal_text2', label: '校長挨拶（第2段落）', type: 'textarea', placeholder: '挨拶文を入力', rows: 3},
            {key: 'about_principal_signature', label: '校長署名', type: 'text', placeholder: '署名を入力（例：校長）'},
            
            // 教育理念セクション
            {key: 'about_philosophy_title', label: '教育理念タイトル', type: 'text', placeholder: 'タイトルを入力'},
            {key: 'about_philosophy_motto', label: '教育モットー', type: 'text', placeholder: 'モットーを入力'},
            {key: 'about_philosophy_text', label: '教育理念説明', type: 'textarea', placeholder: '説明文を入力', rows: 4},
            
            // 教育目標カード
            {key: 'about_goal1_icon', label: '目標1 - アイコン', type: 'icon', placeholder: 'アイコンを選択'},
            {key: 'about_goal1_title', label: '目標1 - タイトル', type: 'text', placeholder: 'タイトルを入力'},
            {key: 'about_goal1_text', label: '目標1 - 説明', type: 'textarea', placeholder: '説明文を入力', rows: 2},
            {key: 'about_goal2_icon', label: '目標2 - アイコン', type: 'icon', placeholder: 'アイコンを選択'},
            {key: 'about_goal2_title', label: '目標2 - タイトル', type: 'text', placeholder: 'タイトルを入力'},
            {key: 'about_goal2_text', label: '目標2 - 説明', type: 'textarea', placeholder: '説明文を入力', rows: 2},
            {key: 'about_goal3_icon', label: '目標3 - アイコン', type: 'icon', placeholder: 'アイコンを選択'},
            {key: 'about_goal3_title', label: '目標3 - タイトル', type: 'text', placeholder: 'タイトルを入力'},
            {key: 'about_goal3_text', label: '目標3 - 説明', type: 'textarea', placeholder: '説明文を入力', rows: 2},
            {key: 'about_goal4_icon', label: '目標4 - アイコン', type: 'icon', placeholder: 'アイコンを選択'},
            {key: 'about_goal4_title', label: '目標4 - タイトル', type: 'text', placeholder: 'タイトルを入力'},
            {key: 'about_goal4_text', label: '目標4 - 説明', type: 'textarea', placeholder: '説明文を入力', rows: 2},
            {key: 'about_goal5_icon', label: '目標5 - アイコン（オプション）', type: 'icon', placeholder: 'アイコンを選択'},
            {key: 'about_goal5_title', label: '目標5 - タイトル（オプション）', type: 'text', placeholder: 'タイトルを入力（空欄で非表示）'},
            {key: 'about_goal5_text', label: '目標5 - 説明（オプション）', type: 'textarea', placeholder: '説明文を入力', rows: 2},
            {key: 'about_goal6_icon', label: '目標6 - アイコン（オプション）', type: 'icon', placeholder: 'アイコンを選択'},
            {key: 'about_goal6_title', label: '目標6 - タイトル（オプション）', type: 'text', placeholder: 'タイトルを入力（空欄で非表示）'},
            {key: 'about_goal6_text', label: '目標6 - 説明（オプション）', type: 'textarea', placeholder: '説明文を入力', rows: 2},
            
            // 学校情報セクション
            {key: 'about_info_title', label: '学校情報タイトル', type: 'text', placeholder: 'タイトルを入力'},
            {key: 'about_info_name', label: '学校名', type: 'text', placeholder: '学校名を入力'},
            {key: 'about_info_address', label: '所在地', type: 'text', placeholder: '住所を入力'},
            {key: 'about_info_phone', label: '電話番号', type: 'text', placeholder: '電話番号を入力'},
            {key: 'about_info_fax', label: 'FAX番号', type: 'text', placeholder: 'FAX番号を入力'},
            {key: 'about_info_founded', label: '創立年', type: 'text', placeholder: '創立年を入力'},
            {key: 'about_info_students', label: '児童数', type: 'text', placeholder: '児童数を入力'},
            {key: 'about_info_classes', label: '学級数', type: 'text', placeholder: '学級数を入力'}
        ]
    },
    'events-page': {
        title: '行事予定ページ',
        fields: [
            {key: 'events_page_title', label: 'ページタイトル', type: 'text', placeholder: 'タイトルを入力'},
            {key: 'events_page_subtitle', label: 'サブタイトル', type: 'text', placeholder: 'サブタイトルを入力'}
        ]
    },
    'newsletter-page': {
        title: '学校だよりページ',
        fields: [
            {key: 'newsletter_page_title', label: 'ページタイトル', type: 'text', placeholder: 'タイトルを入力'},
            {key: 'newsletter_page_subtitle', label: 'サブタイトル', type: 'text', placeholder: 'サブタイトルを入力'}
        ]
    },
    'blog-page': {
        title: 'ブログページ',
        fields: [
            {key: 'blog_page_title', label: 'ページタイトル', type: 'text', placeholder: 'タイトルを入力'},
            {key: 'blog_page_subtitle', label: 'サブタイトル', type: 'text', placeholder: 'サブタイトルを入力'}
        ]
    },
    'access-page': {
        title: 'アクセスページ',
        fields: [
            {key: 'access_page_title', label: 'ページタイトル', type: 'text', placeholder: 'タイトルを入力'},
            {key: 'access_page_subtitle', label: 'サブタイトル', type: 'text', placeholder: 'サブタイトルを入力'},
            {key: 'access_school_name', label: '学校名', type: 'text', placeholder: '学校名を入力'},
            {key: 'access_address', label: '住所', type: 'textarea', placeholder: '住所を入力（改行可）', rows: 2},
            {key: 'access_phone', label: '電話番号', type: 'text', placeholder: '電話番号を入力'},
            {key: 'access_fax', label: 'FAX番号', type: 'text', placeholder: 'FAX番号を入力'},
            {key: 'access_email', label: 'メールアドレス', type: 'text', placeholder: 'メールアドレスを入力'},
            {key: 'access_map_text', label: '地図テキスト', type: 'text', placeholder: '地図に表示するテキストを入力'},
            {key: 'access_map_note', label: '地図の注釈', type: 'text', placeholder: '地図の注釈を入力'}
        ]
    },
    'contact-page': {
        title: 'お問い合わせページ',
        fields: [
            {key: 'contact_page_title', label: 'ページタイトル', type: 'text', placeholder: 'タイトルを入力'},
            {key: 'contact_page_subtitle', label: 'サブタイトル', type: 'text', placeholder: 'サブタイトルを入力'}
        ]
    }
};

// フォーム定義をマージ
Object.assign(formDefinitions, otherPageForms);

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    setupEventListeners();
    await loadAllContent();
    updateEditableSections(currentPage); // 初期ページのセクションを表示
    loadPreview();
});

// Setup Event Listeners
function setupEventListeners() {
    // Page Selector
    document.getElementById('page-select').addEventListener('change', (e) => {
        currentPage = e.target.value;
        updateEditableSections(currentPage);
        loadPreview();
    });

    // Device Toggle
    document.querySelectorAll('.device-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentDevice = e.currentTarget.dataset.device;
            updatePreviewDevice();
        });
    });

    // Refresh Preview
    document.getElementById('refresh-btn').addEventListener('click', (e) => {
        const btn = e.currentTarget;
        const icon = btn.querySelector('i');
        
        // 視覚的フィードバック
        icon.classList.add('fa-spin');
        btn.disabled = true;
        
        loadPreview(true); // ソフトリフレッシュ使用
        
        setTimeout(() => {
            icon.classList.remove('fa-spin');
            btn.disabled = false;
        }, 500);
    });

    // Element Selection
    document.querySelectorAll('[data-edit-element]').forEach(element => {
        element.addEventListener('click', () => {
            const sectionId = element.dataset.editElement;
            selectSection(sectionId);
        });
    });

    // Form Actions
    document.getElementById('save-btn').addEventListener('click', saveChanges);
    document.getElementById('cancel-btn').addEventListener('click', cancelEdit);
}

// Update Editable Sections based on selected page
function updateEditableSections(pageName) {
    const elementList = document.querySelector('.element-list');
    const sections = pageFormMappings[pageName] || [];
    
    // セクションアイコンマッピング
    const sectionIcons = {
        'header': 'fa-heading',
        'hero': 'fa-star',
        'news': 'fa-newspaper',
        'about': 'fa-info-circle',
        'features': 'fa-lightbulb',
        'events': 'fa-calendar',
        'footer': 'fa-shoe-prints',
        'about-page': 'fa-file-alt',
        'events-page': 'fa-file-alt',
        'newsletter-page': 'fa-file-alt',
        'blog-page': 'fa-file-alt',
        'access-page': 'fa-file-alt',
        'contact-page': 'fa-file-alt'
    };
    
    // 編集可能セクションリストを再生成
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

// Select Section for Editing
function selectSection(sectionId) {
    // Remove active class from all elements
    document.querySelectorAll('.element-item').forEach(el => el.classList.remove('active'));
    
    // Add active class to selected element
    const selectedElement = document.querySelector(`[data-edit-element="${sectionId}"]`);
    if (selectedElement) {
        selectedElement.classList.add('active');
    }

    // Hide placeholder
    document.getElementById('edit-placeholder').style.display = 'none';

    // Show form
    currentEditSection = sectionId;
    renderForm(sectionId);
}

// Render Form
function renderForm(sectionId) {
    const formContainer = document.getElementById('dynamic-forms');
    const formDef = formDefinitions[sectionId];
    
    if (!formDef) {
        console.error('Unknown section:', sectionId);
        return;
    }

    // Generate form HTML
    let formHTML = `
        <form class="edit-form active" id="form-${sectionId}">
            <div class="form-section">
                <div class="form-section-title">${formDef.title}</div>
    `;

    formDef.fields.forEach((field, index) => {
        const value = contentData[field.key] || '';
        console.log(`Field ${index}: ${field.label} (${field.key}) = "${value}"`);
        formHTML += `
            <div class="form-group">
                <label>${field.label}</label>
        `;

        if (field.type === 'textarea') {
            formHTML += `
                <textarea 
                    name="${field.key}" 
                    id="field-${field.key}"
                    data-key="${field.key}"
                    rows="${field.rows || 4}" 
                    placeholder="${field.placeholder}"
                >${escapeHtml(value)}</textarea>
            `;
        } else if (field.type === 'icon') {
            // アイコン選択フィールド
            formHTML += `
                <div class="icon-selector">
                    <select 
                        name="${field.key}" 
                        id="field-${field.key}"
                        data-key="${field.key}"
                        class="icon-select"
                        onchange="updateIconPreview('${field.key}')"
                    >
                        <option value="">アイコンを選択...</option>
            `;
            
            // カテゴリごとにグループ化
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
            // 画像URLフィールドの場合、アップロードボタンを追加
            const isImageField = field.key.includes('_image') || field.key.includes('_photo');
            
            formHTML += `
                <input 
                    type="text" 
                    name="${field.key}" 
                    id="field-${field.key}"
                    data-key="${field.key}"
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
        
        // デバッグ情報を追加
        formHTML += `
            <small style="color: #999; font-size: 11px;">データベースキー: ${field.key}</small>
        `;

        formHTML += `
            </div>
        `;
    });

    formHTML += `
            </div>
        </form>
    `;

    formContainer.innerHTML = formHTML;
    
    // デバッグ: 生成されたフォームを確認
    console.log(`Form rendered for section: ${sectionId}`);
    console.log('Fields:', formDef.fields.map(f => f.key).join(', '));
}

// Load All Content from Database
async function loadAllContent() {
    try {
        const response = await fetch('/api/tables/site_settings?limit=100');
        const data = await response.json();
        
        if (data.data) {
            contentData = {};
            data.data.forEach(item => {
                contentData[item.setting_key] = item.setting_value;
            });
            
            // 🚀 キャッシュも初期化
            settingsCache = data.data;
            cacheTime = Date.now();
        }

    } catch (error) {
        console.error('Failed to load content:', error);
        showError('コンテンツの読み込みに失敗しました');
    }
}

// Load Preview - 高速化版
function loadPreview(softRefresh = false) {
    const iframe = document.getElementById('preview-iframe');
    
    if (softRefresh && iframe.contentWindow) {
        // 🚀 ソフトリフレッシュ: iframe内のJavaScriptを再実行（高速）
        try {
            const iframeDoc = iframe.contentWindow.document;
            const homeScript = iframe.contentWindow.loadDynamicContent;
            
            if (homeScript && typeof homeScript === 'function') {
                console.log('Soft refresh: Reloading dynamic content...');
                homeScript();
                return;
            }
        } catch (e) {
            console.log('Soft refresh failed, falling back to full reload:', e);
        }
    }
    
    // フルリロード
    iframe.src = currentPage + '?_=' + Date.now(); // Cache busting

    // Wait for iframe to load
    iframe.onload = () => {
        console.log('Preview loaded successfully');
    };

    iframe.onerror = () => {
        showError('ページの読み込みに失敗しました');
    };
}

// Update Preview Device
function updatePreviewDevice() {
    const wrapper = document.querySelector('.preview-wrapper');
    wrapper.className = 'preview-wrapper ' + currentDevice;
}

// Save Changes - 高速化版
async function saveChanges() {
    if (!currentEditSection) {
        showError('編集する要素を選択してください');
        return;
    }

    const form = document.getElementById(`form-${currentEditSection}`);
    if (!form) return;

    // Get form data
    const formData = new FormData(form);
    const updates = {};
    
    formData.forEach((value, key) => {
        updates[key] = value;
    });

    console.log('Form data collected:', updates);
    console.log('Number of fields:', Object.keys(updates).length);

    // Show loading with progress
    const saveBtn = document.getElementById('save-btn');
    const originalText = saveBtn.textContent;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 保存中...';

    const startTime = Date.now();

    try {
        console.log('Saving updates (parallel):', updates);
        
        // 🚀 並列処理で全フィールドを同時に更新（高速化）
        const updatePromises = Object.entries(updates).map(([key, value]) => {
            console.log(`Queuing update: ${key}`);
            return updatePageContent(key, value);
        });
        
        await Promise.all(updatePromises);
        
        const saveTime = Date.now() - startTime;
        console.log(`Save completed in ${saveTime}ms`);

        // Update local content data
        Object.assign(contentData, updates);

        // 🚀 プレビュー更新を非同期で実行（ソフトリフレッシュ使用）
        console.log('Reloading preview...');
        setTimeout(() => loadPreview(true), 100); // 少し遅延させて確実にDB更新完了後に実行

        // Show success message
        showSuccess(`変更を保存しました（${saveTime}ms）`);

    } catch (error) {
        console.error('Failed to save changes:', error);
        showError('保存に失敗しました: ' + error.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
    }
}

// Update Page Content in Database - 高速化版
let settingsCache = null; // キャッシュを追加
let cacheTime = null;
const CACHE_DURATION = 5000; // 5秒間キャッシュ

async function updatePageContent(settingKey, settingValue) {
    try {
        // 🚀 キャッシュを使用して全データ取得を削減
        const now = Date.now();
        if (!settingsCache || !cacheTime || (now - cacheTime) > CACHE_DURATION) {
            const response = await fetch(`tables/site_settings?limit=100`);
            const data = await response.json();
            settingsCache = data.data || [];
            cacheTime = now;
        }

        // Find the record with matching setting_key
        const existingRecord = settingsCache.find(item => item.setting_key === settingKey);

        if (existingRecord) {
            // Update existing record
            const updateResponse = await fetch(`tables/site_settings/${existingRecord.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    setting_value: settingValue
                })
            });

            if (!updateResponse.ok) {
                const errorText = await updateResponse.text();
                throw new Error(`Failed to update content: ${errorText}`);
            }
            
            // キャッシュも更新
            existingRecord.setting_value = settingValue;
        } else {
            // Create new record
            const settingGroup = settingKey.split('_')[0];
            const createResponse = await fetch('/api/tables/site_settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    setting_key: settingKey,
                    setting_value: settingValue,
                    setting_group: settingGroup,
                    description: `${settingKey} の設定値`
                })
            });

            if (!createResponse.ok) {
                throw new Error('Failed to create content');
            }
            
            // キャッシュに追加
            const newRecord = await createResponse.json();
            settingsCache.push(newRecord);
        }
    } catch (error) {
        console.error('Error updating page content:', error);
        throw error;
    }
}

// Update Icon Preview
function updateIconPreview(fieldKey) {
    const select = document.getElementById(`field-${fieldKey}`);
    const preview = document.getElementById(`preview-${fieldKey}`);
    
    if (select && preview) {
        const iconClass = select.value || 'fa-question';
        preview.innerHTML = `<i class="fas ${iconClass}" style="font-size: 2rem; color: #3b82f6;"></i>`;
    }
}

// グローバルスコープに公開
window.updateIconPreview = updateIconPreview;

// Cancel Edit
function cancelEdit() {
    // Clear selection
    document.querySelectorAll('.element-item').forEach(el => el.classList.remove('active'));
    document.getElementById('edit-placeholder').style.display = 'block';
    document.getElementById('dynamic-forms').innerHTML = '';
    currentEditSection = null;
}

// Show Success Message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(successDiv);

    setTimeout(() => {
        successDiv.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => successDiv.remove(), 300);
    }, 2000); // 3秒→2秒に短縮
}

// Show Error Message
function showError(message) {
    alert(`エラー: ${message}`);
}

// Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// 画像アップロード関連関数
// ========================================

/**
 * 画像ピッカーモーダルを開く
 * @param {string} fieldKey - フィールドキー
 */
function openImagePicker(fieldKey) {
    showImagePickerModal(function(imageUrl) {
        // 選択された画像URLをフィールドに設定
        const inputField = document.getElementById(`field-${fieldKey}`);
        const previewContainer = document.getElementById(`preview-container-${fieldKey}`);
        const previewImg = document.getElementById(`preview-img-${fieldKey}`);
        
        if (inputField) {
            inputField.value = imageUrl;
        }
        
        if (previewContainer && previewImg) {
            previewImg.src = imageUrl;
            previewContainer.classList.add('show');
        }
    });
}

/**
 * 画像を削除
 * @param {string} fieldKey - フィールドキー
 */
function removeImage(fieldKey) {
    const inputField = document.getElementById(`field-${fieldKey}`);
    const previewContainer = document.getElementById(`preview-container-${fieldKey}`);
    
    if (inputField) {
        inputField.value = '';
    }
    
    if (previewContainer) {
        previewContainer.classList.remove('show');
    }
}

// グローバルスコープに公開
window.openImagePicker = openImagePicker;
window.removeImage = removeImage;
