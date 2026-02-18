# 徳之島町立亀津小学校ウェブサイト

鹿児島県大島郡徳之島町にある亀津小学校のための、完全統合ウェブサイトシステムです。

## 🎯 プロジェクト概要

このプロジェクトは、Cloudflare Pages + Hono + D1 Databaseを使用した、最新のエッジコンピューティング技術で構築された小学校の公式ウェブサイトです。

### 主な特徴

- ✅ **最新技術スタック** - Hono + Cloudflare Pages + D1 Database
- ✅ **エッジコンピューティング** - 世界中で高速アクセス
- ✅ **完全統合システム** - フロントとバックエンドが完全連動
- ✅ **RESTful API** - データベース操作をAPI経由で実行
- ✅ **レスポンシブデザイン** - スマートフォン完全対応
- ✅ **リアルタイム連動** - 管理画面での変更が即座に反映

## 📁 プロジェクト構造

```
webapp/
├── src/
│   ├── index.tsx           # メインアプリケーション (Hono)
│   └── api.ts              # RESTful Table API
├── public/                 # 静的ファイル (dist/ にコピーされる)
│   ├── *.html              # HTMLファイル (フロントエンド + 管理画面)
│   └── static/
│       ├── css/            # スタイルシート
│       └── js/             # JavaScript
├── migrations/             # D1データベースマイグレーション
│   ├── 0001_initial_schema.sql
│   └── 0002_initial_data.sql
├── ecosystem.config.cjs    # PM2設定 (開発用)
├── package.json            # 依存関係とスクリプト
├── vite.config.ts          # Viteビルド設定
└── wrangler.jsonc          # Cloudflare設定
```

## 💾 データベース構造

### Cloudflare D1 Database (9テーブル)

1. **blog_posts** - ブログ記事
2. **newsletters** - 学校だより
3. **events** - 行事予定
4. **page_contents** - ページコンテンツ
5. **media** - メディアファイル
6. **site_settings** - サイト設定 (34フィールド - トップページの全テキスト)
7. **access_logs** - アクセスログ
8. **access_stats** - アクセス統計
9. **uploaded_pdfs** - PDFライブラリ

## 🚀 使い方

### ローカル開発

```bash
# 依存関係のインストール
npm install

# データベースマイグレーション (初回のみ)
npm run db:migrate:local

# ビルド
npm run build

# 開発サーバー起動
npm run dev:sandbox

# または PM2 で起動
pm2 start ecosystem.config.cjs
```

開発サーバー: http://localhost:3000

### 本番デプロイ (Cloudflare Pages)

#### 🚀 推奨: GitHub連携デプロイ（最も簡単）

**Cloudflare DashboardでGitHubリポジトリを接続して自動デプロイ**

1. **Cloudflare Dashboard** にアクセス
   - https://dash.cloudflare.com/ にログイン
   - 左メニューから **Workers & Pages** を選択
   - **Create Application** → **Pages** → **Connect to Git** を選択

2. **GitHubリポジトリを接続**
   - GitHub認証を許可
   - リポジトリ `junkwarrior11/kametsu_homepage` を選択
   - **Begin setup** をクリック

3. **ビルド設定を入力**
   ```
   Project name: kametsu-homepage
   Production branch: main
   Build command: npm run build
   Build output directory: dist
   Root directory: / (デフォルト)
   ```

4. **環境変数を設定（オプション）**
   - 必要に応じて環境変数を追加
   - 現時点では不要（D1バインディングは後で設定）

5. **Save and Deploy** をクリック
   - 初回ビルドが自動実行されます（約2-3分）
   - デプロイ完了後、URLが発行されます: `https://kametsu-homepage.pages.dev`

6. **D1データベースのバインディング（初回のみ）**
   - デプロイ完了後、**Settings** → **Functions** → **D1 database bindings** に移動
   - **Add binding** をクリック:
     - Variable name: `DB`
     - D1 database: `webapp-production` (事前に作成)
   - **Save** → 自動再デプロイが実行されます

**メリット**:
- ✅ `git push` するだけで自動デプロイ
- ✅ ブランチプレビュー自動生成
- ✅ ロールバックが簡単
- ✅ ビルドログを確認可能

---

#### 🔧 代替: Wrangler CLIデプロイ

**APIトークンを使用した手動デプロイ**

##### 1. D1データベースの作成

```bash
# 本番用データベースを作成
npx wrangler d1 create webapp-production
```

作成されたdatabase_idを `wrangler.jsonc` に設定してください。

##### 2. マイグレーションの適用

```bash
# 本番データベースにマイグレーションを適用
npm run db:migrate:prod
```

##### 3. Cloudflare Pagesプロジェクトの作成

```bash
# プロジェクトを作成
npx wrangler pages project create kametsu-homepage \
  --production-branch main
```

##### 4. デプロイ

```bash
# ビルドとデプロイ
npm run deploy:prod
```

**注意**: APIトークンには以下の権限が必要です：
- Account Settings: Read
- Cloudflare Pages: Edit

## 📊 APIエンドポイント

### RESTful Table API

```javascript
// 一覧取得
GET /api/tables/{table_name}?page=1&limit=100&sort=-created_at&status=公開

// 単一レコード取得
GET /api/tables/{table_name}/{record_id}

// 新規作成
POST /api/tables/{table_name}
Body: JSON object

// 完全更新
PUT /api/tables/{table_name}/{record_id}
Body: Complete JSON object

// 部分更新
PATCH /api/tables/{table_name}/{record_id}
Body: Partial JSON object

// 削除
DELETE /api/tables/{table_name}/{record_id}
```

## 🎨 主要ページ

### フロントエンド (一般公開)
- `/` - トップページ
- `/about.html` - 学校概要
- `/events.html` - 行事予定
- `/newsletter.html` - 学校だより
- `/blog.html` - ブログ一覧
- `/school-rules.html` - 亀津小のやくそく
- `/bullying-prevention.html` - いじめ防止基本方針
- `/access.html` - アクセス情報

### 管理画面
- `/admin-login.html` - 管理者ログイン (admin / admin123)
- `/admin-dashboard.html` - ダッシュボード
- `/admin-blog.html` - ブログ管理
- `/admin-newsletter.html` - 学校だより管理
- `/admin-events.html` - 行事予定管理
- `/admin-pages-visual.html` - ビジュアルページ編集
- `/admin-school-rules.html` - やくそく管理
- `/admin-bullying-prevention.html` - いじめ防止方針管理

## 🔧 開発用スクリプト

```bash
# ビルド
npm run build

# 開発サーバー (Vite)
npm run dev

# 開発サーバー (Wrangler + D1)
npm run dev:sandbox

# デプロイ
npm run deploy
npm run deploy:prod

# データベース操作
npm run db:migrate:local      # ローカルマイグレーション
npm run db:migrate:prod       # 本番マイグレーション
npm run db:console:local      # ローカルDBコンソール
npm run db:console:prod       # 本番DBコンソール

# その他
npm run clean-port            # ポート3000をクリア
npm run test                  # サーバーテスト (curl)
npm run git:status            # Git状態確認
```

## 🌐 デプロイ済みURL

- **GitHub**: https://github.com/junkwarrior11/kametsu_homepage
- **本番環境**: https://kametsu-homepage.pages.dev (GitHub連携デプロイ後に自動生成)

## 📝 サンプルデータ

プロジェクトには以下のサンプルデータが含まれています:
- ブログ記事: 4件
- 学校だより: 3件
- 行事予定: 6件
- サイト設定: 34件 (トップページの全テキストコンテンツ)

## 🛡️ セキュリティについて

### 現在の実装 (デモ用)
- 認証: クライアントサイドの簡易認証
- パスワード: admin / admin123
- セッション: localStorage (8時間有効)

### 本番運用時の推奨事項
1. サーバーサイド認証の実装 (JWT等)
2. パスワードの暗号化
3. HTTPS の使用 (Cloudflare Pagesは自動対応)
4. 環境変数でシークレット管理

## 🔄 技術スタック

- **フレームワーク**: Hono v4.11.9
- **ランタイム**: Cloudflare Workers
- **データベース**: Cloudflare D1 (SQLite)
- **ビルドツール**: Vite v6.3.5
- **デプロイ**: Cloudflare Pages
- **プロセス管理**: PM2 (開発環境)
- **言語**: TypeScript

## 📖 ドキュメント

元プロジェクトには詳細なドキュメントが含まれています:
- `QUICKSTART.md` - クイックスタートガイド
- `COMPLETE_GUIDE.md` - 完全ガイド
- `DEBUGGING_GUIDE.md` - デバッグガイド
- その他多数のガイドドキュメント

## 🎉 完成度

✅ フロントエンド (8ページ) - 完全動作
✅ 管理画面 (8ページ) - 完全動作
✅ RESTful API - 完全実装
✅ D1データベース - マイグレーション済み
✅ レスポンシブデザイン - 対応済み
✅ ローカル開発環境 - 動作確認済み

## 📞 開発情報

- **作成日**: 2024年11月
- **移行日**: 2026年2月17日
- **バージョン**: 2.0.0 (Cloudflare Pages版)
- **元バージョン**: 1.3.2

## 🚧 プロジェクト状況

1. ✅ プロジェクト構築完了
2. ✅ ローカル動作確認完了
3. ✅ GitHubリポジトリへプッシュ完了
4. ✅ Phase 2機能統合完了（データテーブル、Undo/Redo、キーボードショートカット、ダークモード）
5. ⏳ Cloudflare Pages GitHub連携デプロイ（手順書あり - 上記参照）
6. ⏳ D1データベースバインディング設定
7. ⏳ カスタムドメイン設定 (オプション)

---

**即座に使用可能な、完全に機能する統合システムです!** 🚀

制作: 徳之島町立亀津小学校ウェブサイトプロジェクト
