# Google Map 埋め込み設定ガイド

## 📍 学校の正確な地図URLを取得する方法

### **手順1: Google Mapで学校を検索**
1. https://www.google.com/maps にアクセス
2. 検索バーに「徳之島町立亀津小学校」または「鹿児島県大島郡徳之島町亀津1039」を入力
3. 学校の位置が正しく表示されることを確認

### **手順2: 埋め込みURLを取得**
1. 地図上で学校の位置をクリック
2. 左側のサイドバーで学校情報が表示される
3. **「共有」**ボタンをクリック
4. **「地図を埋め込む」**タブをクリック
5. サイズを選択（推奨: 「中」または「大」）
6. **HTMLコード**が表示される
7. `src="https://www.google.com/maps/embed?pb=..."` の部分をコピー

### **手順3: データベースに登録**

Supabase SQL Editorで以下を実行：

```sql
-- 既存のレコードを更新する場合
UPDATE site_settings 
SET setting_value = 'ここに取得したURL（src=""の中身）を貼り付け', 
    updated_at = NOW() 
WHERE setting_key = 'access_map_url';

-- 新規にレコードを作成する場合
INSERT INTO site_settings (setting_key, setting_value, setting_group, description) 
VALUES (
    'access_map_url', 
    'ここに取得したURL（src=""の中身）を貼り付け',
    'access_map', 
    'Google Map埋め込みURL'
)
ON CONFLICT (setting_key) 
DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW();
```

### **例: 埋め込みURL**

取得したHTMLコード：
```html
<iframe 
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3417.234!2d128.9234!3d27.7456..." 
  width="600" 
  height="450" 
  style="border:0;" 
  allowfullscreen="" 
  loading="lazy" 
  referrerpolicy="no-referrer-when-downgrade">
</iframe>
```

**登録するURL（`src=""` の中身のみ）:**
```
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3417.234!2d128.9234!3d27.7456...
```

---

## 🔄 地図URLを変更する方法

### **方法1: Supabase SQL Editorで直接変更**
```sql
UPDATE site_settings 
SET setting_value = '新しいGoogle Map URL', 
    updated_at = NOW() 
WHERE setting_key = 'access_map_url';
```

### **方法2: 管理画面から変更（今後の機能）**
- Visual Editorに地図URL編集機能を追加予定
- 管理ダッシュボードから直接変更可能に

---

## ✅ 確認方法

1. SQLを実行後、アクセスページをリロード
2. https://kametsu-homepage.netlify.app/access.html
3. 地図が正しく表示されることを確認

---

## ⚠️ 注意事項

- **URLは完全なURL**（`https://`から始まる）を使用
- **HTMLコード全体ではなく、`src=""`の中身のみ**をコピー
- 地図が表示されない場合は、URLが正しいか確認
- Google Mapsの利用規約を確認してください

---

## 📝 トラブルシューティング

### 地図が表示されない場合
1. データベースの`access_map_url`を確認
2. URLが`https://www.google.com/maps/embed?pb=`で始まっているか確認
3. ブラウザのコンソールでエラーがないか確認

### デフォルトの地図が表示される場合
- データベースに`access_map_url`が登録されていません
- 上記のSQLを実行してURLを登録してください
