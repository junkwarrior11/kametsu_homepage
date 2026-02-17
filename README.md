# 徳之島町立亀津小学校 ウェブサイト

鹿児島県大島郡徳之島町にある亀津小学校のための、モダンなウェブサイトシステムです。Cloudflare Pages + Hono フレームワークで構築され、フロントエンドとバックエンドが完全統合されています。

## 🎯 プロジェクト概要

このプロジェクトは、小学校の公式ウェブサイトと管理システムを一つのシステムとして構築しています。
**管理画面で投稿・編集したコンテンツが、リアルタイムでフロントエンドの公開サイトに反映されます。**

### 主な特徴

- ✅ **Cloudflare Pages** - エッジコンピューティングで世界中で高速
- ✅ **Hono フレームワーク** - 軽量で高速なWebフレームワーク
- ✅ **Cloudflare D1** - SQLiteベースのグローバル分散データベース
- ✅ **完全統合** - フロントとバックエンドが同一データベースを共有
- ✅ **レスポンシブデザイン** - スマートフォン完全対応
- ✅ **モダンなUI/UX** - 徳之島の自然をイメージした洗練されたデザイン
- ✅ **RESTful API** - 柔軟なデータ操作が可能な API
- ✅ **完全なCRUD機能** - すべてのコンテンツを管理画面から操作可能

## 📁 プロジェクト構造

```
webapp/
├── src/
│   ├── index.tsx          # メインHonoアプリケーション
│   ├── api.ts             # RESTful Table API実装
│   └── renderer.tsx       # レンダラー設定
├── public/                # 静的ファイル（HTML, CSS, JS）
│   ├── *.html             # フロントエンド・管理画面HTMLファイル
│   └── static/
│       ├── css/           # スタイルシート
│       └── js/            # JavaScriptファイル
├── migrations/            # データベースマイグレーション
│   ├── 0001_initial_schema.sql  # テーブル定義
│   └── 0002_initial_data.sql    # 初期データ
├── ecosystem.config.cjs   # PM2設定（開発環境用）
├── wrangler.jsonc         # Cloudflare設定
├── package.json           # 依存関係とスクリプト
└── README.md              # このファイル
```

## 💾 データベース構造

### テーブル一覧（9テーブル）

1. **blog_posts** - ブログ記事
2. **newsletters** - 学校だより
3. **events** - 行事予定
4. **page_contents** - ページコンテンツ
5. **media** - メディアファイル
6. **site_settings** - サイト設定（34フィールド）
7. **access_logs** - アクセスログ
8. **access_stats** - アクセス統計
9. **uploaded_pdfs** - PDFライブラリ

詳細はマイグレーションファイルを参照してください。

## 🚀 セットアップ手順

### 1. 依存関係のインストール

```bash
cd /home/user/webapp
npm install
```

### 2. データベースマイグレーション（ローカル開発）

```bash
# ローカルD1データベースにマイグレーションを適用
npm run db:migrate:local
```

### 3. ビルド

```bash
npm run build
```

### 4. ローカル開発サーバー起動

**オプションA: PM2を使用（推奨）**

```bash
# ポート3000をクリーンアップ
npm run clean-port

# PM2でサーバー起動
pm2 start ecosystem.config.cjs

# ログ確認
pm2 logs webapp --nostream

# 停止
pm2 stop webapp

# 削除
pm2 delete webapp
```

**オプションB: 直接実行**

```bash
npm run dev:sandbox
```

### 5. ブラウザで確認

- **フロントエンド**: http://localhost:3000
- **管理画面**: http://localhost:3000/admin-login.html
  - ユーザー名: `admin`
  - パスワード: `admin123`
- **API**: http://localhost:3000/api/tables/site_settings

## 🌐 Cloudflare Pagesへのデプロイ

### 1. Cloudflare D1データベースの作成

```bash
# 本番用データベースを作成
npx wrangler d1 create webapp-production

# 出力されたdatabase_idをwrangler.jsoncに設定
```

### 2. wrangler.jsoncの更新

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "webapp-production",
      "database_id": "YOUR_DATABASE_ID"  // ここを更新
    }
  ]
}
```

### 3. 本番データベースへマイグレーション

```bash
npm run db:migrate:prod
```

### 4. Cloudflare Pagesプロジェクトの作成

```bash
# プロジェクトを作成（main ブランチが本番環境）
npx wrangler pages project create webapp --production-branch main
```

### 5. デプロイ

```bash
npm run deploy:prod
```

デプロイ後、以下のURLでアクセス可能:
- **本番環境**: https://webapp.pages.dev
- **ブランチ**: https://main.webapp.pages.dev

## 🛠️ 開発コマンド

```bash
# ローカル開発（Viteサーバー）
npm run dev

# サンドボックス開発（Wrangler + D1）
npm run dev:sandbox

# ビルド
npm run build

# プレビュー
npm run preview

# デプロイ
npm run deploy:prod

# データベースマイグレーション（ローカル）
npm run db:migrate:local

# データベースマイグレーション（本番）
npm run db:migrate:prod

# データベースコンソール（ローカル）
npm run db:console:local

# データベースコンソール（本番）
npm run db:console:prod

# ポートクリーンアップ
npm run clean-port

# APIテスト
npm run test

# Git初期化
npm run git:init

# Gitコミット
npm run git:commit "commit message"
```

## 📋 フロントエンドページ

- **index.html** - トップページ
- **about.html** - 学校概要
- **events.html** - 年間行事予定
- **newsletter.html** - 学校だより
- **blog.html** - ブログ一覧
- **blog-detail.html** - ブログ記事詳細
- **access.html** - アクセス情報
- **school-rules.html** - 亀津小のやくそく
- **bullying-prevention.html** - いじめ防止基本方針

## 🔧 管理画面ページ

- **admin-login.html** - 管理者ログイン
- **admin-dashboard.html** - ダッシュボード
- **admin-blog.html** - ブログ記事管理
- **admin-newsletter.html** - 学校だより管理
- **admin-events.html** - 行事予定管理
- **admin-pages-visual.html** - ビジュアルページ編集
- **admin-school-rules.html** - やくそく管理
- **admin-bullying-prevention.html** - いじめ防止方針管理

## 🔑 API エンドポイント

### RESTful Table API

すべてのテーブルに対して、統一されたRESTful APIでアクセス可能:

```bash
# 一覧取得（ページネーション、ソート、フィルタ対応）
GET /api/tables/{table_name}?page=1&limit=100&sort=-created_at&status=公開

# 単一レコード取得
GET /api/tables/{table_name}/{id}

# 新規作成
POST /api/tables/{table_name}
Content-Type: application/json
{ "title": "新しい記事", ... }

# 完全更新
PUT /api/tables/{table_name}/{id}
Content-Type: application/json
{ "title": "更新された記事", ... }

# 部分更新
PATCH /api/tables/{table_name}/{id}
Content-Type: application/json
{ "status": "下書き" }

# 削除
DELETE /api/tables/{table_name}/{id}
```

### 利用可能なテーブル

- `blog_posts` - ブログ記事
- `newsletters` - 学校だより
- `events` - 行事予定
- `page_contents` - ページコンテンツ
- `media` - メディアファイル
- `site_settings` - サイト設定
- `access_logs` - アクセスログ
- `access_stats` - アクセス統計
- `uploaded_pdfs` - PDFライブラリ

### 使用例

```bash
# サイト設定を取得
curl http://localhost:3000/api/tables/site_settings

# ブログ記事を作成
curl -X POST http://localhost:3000/api/tables/blog_posts \
  -H "Content-Type: application/json" \
  -d '{"title":"新しい記事","content":"記事の内容","status":"公開"}'

# 記事を更新
curl -X PATCH http://localhost:3000/api/tables/blog_posts/{id} \
  -H "Content-Type: application/json" \
  -d '{"status":"下書き"}'
```

## 🎨 デザイン特徴

### カラーパレット

- **プライマリー**: #2563eb（ブルー）
- **セカンダリー**: #7c3aed（パープル）
- **アクセント**: #f59e0b（アンバー）
- **グラデーション**: 667eea → 764ba2

### レスポンシブブレークポイント

- **デスクトップ**: 1024px以上
- **タブレット**: 768px - 1023px
- **モバイル**: 767px以下

## 🔒 セキュリティについて

### 現在の実装（デモ用）

- **認証**: クライアントサイドの簡易認証
- **セッション**: localStorage を使用（8時間有効）
- **パスワード**: admin / admin123（平文）

### 本番運用時の推奨事項

1. **サーバーサイド認証の実装** - JWT トークンや OAuth 2.0
2. **パスワードの暗号化** - bcrypt または Argon2
3. **HTTPS の使用** - SSL/TLS 証明書
4. **CSRF対策** - トークンベースの保護
5. **XSS対策** - すべての入力のサニタイズ

## 📊 パフォーマンス

- **エッジコンピューティング** - Cloudflare のグローバルネットワークで高速配信
- **D1データベース** - グローバル分散SQLiteで低遅延
- **軽量フレームワーク** - Hono は超軽量（< 30KB）
- **静的アセット最適化** - CSS/JSファイルの効率的な配信

## 🧪 テスト

### テストページ

プロジェクトには機能確認用のテストページが含まれています:

- **test-data.html** - データベース内容の確認
- **demo-visual-editor.html** - ビジュアルエディタのデモ
- **test-pdf-upload.html** - PDFアップロード機能テスト
- **demo-pdf-functional-test.html** - PDF機能詳細テスト

### APIテスト

```bash
# 接続テスト
curl http://localhost:3000

# APIテスト
curl http://localhost:3000/api/tables/site_settings

# ブログ記事取得
curl http://localhost:3000/api/tables/blog_posts?status=公開
```

## 🔧 トラブルシューティング

### ビルドエラー

```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
npm run build
```

### ポートが使用中

```bash
# ポート3000をクリーンアップ
npm run clean-port

# または
fuser -k 3000/tcp
```

### データベースエラー

```bash
# ローカルデータベースをリセット
rm -rf .wrangler/state/v3/d1
npm run db:migrate:local
```

### PM2プロセス管理

```bash
# すべてのプロセスを表示
pm2 list

# ログを確認
pm2 logs webapp --nostream

# プロセスを再起動
pm2 restart webapp

# プロセスを削除
pm2 delete webapp
```

## 🚧 今後の拡張可能性

1. **認証システムの強化** - JWT、OAuth 2.0
2. **画像アップロード** - Cloudflare R2統合
3. **検索機能** - 全文検索の実装
4. **多言語対応** - i18n対応
5. **アクセス解析** - 詳細な統計機能
6. **保護者専用ページ** - ログイン機能付き限定情報
7. **イベントカレンダー** - 月間/年間カレンダー表示
8. **フォトギャラリー** - 行事の写真アルバム

## 📞 サポート

### 技術スタック

- **フレームワーク**: Hono 4.x
- **ランタイム**: Cloudflare Workers/Pages
- **データベース**: Cloudflare D1 (SQLite)
- **ビルドツール**: Vite 6.x
- **言語**: TypeScript

### システム要件

- Node.js 18.x 以上
- npm 8.x 以上
- モダンなWebブラウザ（Chrome, Firefox, Safari, Edge の最新版）

## 📄 ライセンス

このプロジェクトは教育目的で作成されています。

## 🎉 デプロイ状況

- **開発環境**: ✅ 動作確認済み
- **サンドボックス**: ✅ 動作確認済み
  - URL: https://3000-iahmqh7e1gki4abbtnobi-b32ec7bb.sandbox.novita.ai
- **本番環境**: ⏳ デプロイ準備完了

## 📚 関連ドキュメント

- [Hono Documentation](https://hono.dev/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Vite Documentation](https://vitejs.dev/)

---

**制作日**: 2024年11月  
**最終更新**: 2026年2月17日  
**バージョン**: 2.0.0（Cloudflare Pages + Hono版）

🚀 **即座に使用可能な、完全に機能する統合システムです!**
