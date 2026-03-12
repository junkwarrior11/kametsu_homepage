# アクティビティログ機能

## データベース設定

管理ダッシュボードに変更履歴を表示するには、Supabaseに以下のテーブルを作成してください。

### activity_logs テーブル

```sql
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete'
    category VARCHAR(100) NOT NULL, -- 'ブログ', '学校だより', '行事予定', 'ページ編集', '設定'
    title TEXT NOT NULL,
    description TEXT,
    user_name VARCHAR(100),
    user_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_category ON activity_logs(category);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
```

## 機能説明

### 自動記録される変更

1. **ブログ設定**
   - 外部ブログURLの変更

2. **学校だより**
   - 作成・更新・削除

3. **行事予定**
   - 作成・更新・削除

4. **ページ編集**
   - Visual Editorでの編集内容

5. **設定変更**
   - サイト設定の変更

### 表示内容

- **アクション**: 作成（緑）、更新（黄）、削除（赤）
- **カテゴリ**: 変更内容のカテゴリ
- **タイトル**: 変更の概要
- **説明**: 詳細情報（オプション）
- **実行者**: 変更を行ったユーザー
- **日時**: 相対時間表示（例: 5分前、2時間前）

## 使用方法

### JavaScript での記録

```javascript
// 方法1: 直接記録
await logActivity('update', 'ブログ設定', 'ブログURLを更新', 'https://blog.example.com');

// 方法2: ActivityLogger を使用（推奨）
await ActivityLogger.blog.configUpdate('https://blog.example.com');
await ActivityLogger.newsletter.create('2024年度 1月号');
await ActivityLogger.event.update('運動会');
await ActivityLogger.page.update('トップページ', 'ヒーローセクション');
```

### カスタムログ

```javascript
await ActivityLogger.update('カスタムカテゴリ', 'タイトル', '説明');
```

## トラブルシューティング

### テーブルが存在しない場合

ダッシュボードに以下のメッセージが表示されます：

> 変更履歴機能を有効にするには、データベースに activity_logs テーブルを作成してください。

「テーブル作成SQL」をクリックすると、SQLが表示されます。

### Row Level Security (RLS)

Supabaseで RLS を有効にしている場合、以下のポリシーを追加してください：

```sql
-- 読み取り許可（全ユーザー）
CREATE POLICY "Enable read access for all users" ON activity_logs
FOR SELECT USING (true);

-- 書き込み許可（認証済みユーザーのみ）
CREATE POLICY "Enable insert for authenticated users only" ON activity_logs
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

## 今後の拡張

- フィルタリング機能（カテゴリ別、日付範囲）
- エクスポート機能（CSV、PDF）
- ユーザー別の変更履歴
- 変更の詳細ビュー
- 変更の取り消し機能
