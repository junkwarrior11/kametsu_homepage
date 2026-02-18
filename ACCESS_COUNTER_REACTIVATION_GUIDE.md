以下の手順でアクセスカウンター機能を再有効化してください：

## 📝 **アクセスカウンター機能の再有効化手順**

### **前提条件**
✅ Supabase で `access_stats` テーブルと `access_logs` テーブルを作成済み

---

### **手順**

#### **1. access-counter.js を元に戻す**

`public/static/js/access-counter.js` の先頭部分を以下に変更：

**現在（無効化中）**:
```javascript
// TODO: access_stats テーブルを作成後に有効化する
console.log('⚠️ Access counter is temporarily disabled. Please create access_stats table in Supabase.');

// ページ読み込み時にアクセスを記録
(function() {
    // 一時的に無効化
    return;
    
    // 管理画面は除外
    if (window.location.pathname.includes('admin-')) {
        return;
    }
    
    // アクセスを記録
    recordAccess();
})();
```

**修正後（有効化）**:
```javascript
// ========================================
// アクセスカウンター
// ========================================

// ページ読み込み時にアクセスを記録
(function() {
    // 管理画面は除外
    if (window.location.pathname.includes('admin-')) {
        return;
    }
    
    // アクセスを記録
    recordAccess();
})();
```

---

#### **2. admin-dashboard.js を元に戻す**

`public/static/js/admin-dashboard.js` の `loadDashboardStats()` 関数を修正：

**現在（無効化中）**:
```javascript
// アクセス統計は一時的にスキップ（access_statsテーブル未作成のため）
const [blogRes, newsletterRes, eventsRes] = await Promise.all([
    fetch('/api/tables/blog_posts'),
    fetch('/api/tables/newsletters'),
    fetch('/api/tables/events')
]);

// ...

// アクセス統計は一時的に0を表示
document.getElementById('totalAccessCount').textContent = '0';
document.getElementById('monthlyAccessCount').textContent = '0';
```

**修正後（有効化）**:
```javascript
const [blogRes, newsletterRes, eventsRes, totalAccessRes, monthlyAccessRes] = await Promise.all([
    fetch('/api/tables/blog_posts'),
    fetch('/api/tables/newsletters'),
    fetch('/api/tables/events'),
    fetch('/api/tables/access_stats?stat_type=total&year_month=total&page_name=all&limit=1'),
    fetch(`/api/tables/access_stats?stat_type=monthly&year_month=${currentMonth}&page_name=all&limit=1`)
]);

const blogData = await blogRes.json();
const newsletterData = await newsletterRes.json();
const eventsData = await eventsRes.json();
const totalAccessData = await totalAccessRes.json();
const monthlyAccessData = await monthlyAccessRes.json();

// ...

// アクセス統計の表示
const totalAccessCount = (totalAccessData.data && totalAccessData.data.length > 0) 
    ? totalAccessData.data[0].count 
    : 0;
const monthlyAccessCount = (monthlyAccessData.data && monthlyAccessData.data.length > 0) 
    ? monthlyAccessData.data[0].count 
    : 0;

document.getElementById('totalAccessCount').textContent = totalAccessCount.toLocaleString();
document.getElementById('monthlyAccessCount').textContent = monthlyAccessCount.toLocaleString();
```

---

#### **3. ビルド & デプロイ**

```bash
cd /home/user/webapp
npm run build
pm2 restart webapp

# Git commit & push
git add -A
git commit -m "feat(admin): アクセスカウンター機能を再有効化 - access_statsテーブル作成完了"
git push origin main
```

---

### **動作確認**

1. **ページにアクセス**:
   - トップページ: https://kametsu-homepage.netlify.app/
   - イベントページ: https://kametsu-homepage.netlify.app/events.html

2. **ダッシュボードで確認**:
   - URL: https://kametsu-homepage.netlify.app/admin-dashboard.html
   - 「総アクセス数」と「今月のアクセス」が表示されることを確認

3. **Supabaseで確認**:
   - Supabase → Table Editor → `access_stats`
   - `count` カラムが増加していることを確認

---

### **トラブルシューティング**

#### **エラーが再発する場合**

1. **ブラウザキャッシュをクリア**: `Ctrl + Shift + R`
2. **Supabaseテーブルを確認**: `access_stats` と `access_logs` が存在するか
3. **コンソールエラーを確認**: F12 → Console タブ
4. **Netlifyログを確認**: Netlify ダッシュボード → Deploys → ログ

---

### **注意事項**

- アクセスカウンター機能は **フロントエンド側で記録** しています
- より正確な統計には **サーバー側のログ解析** を推奨します
- Netlify Analytics や Google Analytics の導入も検討してください

---

以上の手順で、アクセスカウンター機能が正常に動作するようになります！
