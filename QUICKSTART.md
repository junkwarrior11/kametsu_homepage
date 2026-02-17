# ⚡ クイックスタート

5分で亀津小学校ウェブサイトを起動する方法

## 🚀 ローカル開発環境 (最速)

```bash
# 1. 依存関係のインストール
npm install

# 2. データベースのセットアップ
npm run db:migrate:local

# 3. ビルド
npm run build

# 4. 開発サーバー起動
npm run dev:sandbox
```

**アクセス**: http://localhost:3000

## 📊 動作確認

### フロントエンド
- トップページ: http://localhost:3000
- 学校概要: http://localhost:3000/about.html
- ブログ: http://localhost:3000/blog.html

### 管理画面
- ログイン: http://localhost:3000/admin-login.html
  - ユーザー名: `admin`
  - パスワード: `admin123`

### API
```bash
# サイト設定を取得
curl http://localhost:3000/api/tables/site_settings

# ブログ記事を取得
curl http://localhost:3000/api/tables/blog_posts
```

## 🌐 本番デプロイ (3ステップ)

```bash
# 1. D1データベースを作成
npx wrangler d1 create webapp-production
# → database_id を wrangler.jsonc にコピー

# 2. マイグレーションを適用
npx wrangler d1 migrations apply webapp-production

# 3. デプロイ
npm run build
npx wrangler pages deploy dist --project-name webapp
```

詳細は [DEPLOYMENT.md](DEPLOYMENT.md) を参照。

## 📝 主要コマンド

```bash
# 開発
npm run dev                  # Vite開発サーバー
npm run dev:sandbox          # Wrangler開発サーバー (D1対応)

# ビルド
npm run build                # プロダクションビルド

# データベース
npm run db:migrate:local     # ローカルマイグレーション
npm run db:migrate:prod      # 本番マイグレーション

# デプロイ
npm run deploy               # Cloudflare Pagesにデプロイ
```

## 🎯 よくある質問

**Q: データベースが空っぽ?**
```bash
npm run db:migrate:local
```

**Q: ポート3000が使えない?**
```bash
npm run clean-port
```

**Q: 変更が反映されない?**
```bash
npm run build
pm2 restart webapp
```

## 📖 詳細ドキュメント

- [README.md](README.md) - 完全ガイド
- [DEPLOYMENT.md](DEPLOYMENT.md) - デプロイ手順

---

それでは、開発を始めましょう! 🎉
