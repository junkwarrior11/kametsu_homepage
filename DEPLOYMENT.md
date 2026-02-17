# Cloudflare Pages デプロイメントガイド

このガイドでは、亀津小学校ウェブサイトをCloudflare Pagesにデプロイする手順を説明します。

## 前提条件

- Cloudflareアカウント (無料プランでOK)
- Cloudflare API Token (Pages:Edit権限)
- Wrangler CLI (プロジェクトに含まれています)

## 📋 デプロイ手順

### ステップ1: Cloudflare API Token の設定

#### オプションA: サンドボックス環境の場合

1. **Deployタブ** を開く
2. **Cloudflare API Token** を入力
3. 保存後、`setup_cloudflare_api_key` を実行

#### オプションB: ローカル環境の場合

```bash
# API Tokenを環境変数として設定
export CLOUDFLARE_API_TOKEN="your-api-token-here"

# または .bashrc に追加
echo 'export CLOUDFLARE_API_TOKEN="your-token"' >> ~/.bashrc
source ~/.bashrc
```

### ステップ2: 認証の確認

```bash
# Cloudflareアカウントの確認
npx wrangler whoami
```

正常に表示されれば認証成功です。

### ステップ3: D1データベースの作成

```bash
# 本番用D1データベースを作成
npx wrangler d1 create webapp-production
```

**重要**: 出力された `database_id` をコピーしてください。

**出力例:**
```
✅ Successfully created DB 'webapp-production'

[[d1_databases]]
binding = "DB"
database_name = "webapp-production"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### ステップ4: wrangler.jsonc の更新

`wrangler.jsonc` ファイルを編集し、D1データベースの設定を有効化します:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "webapp",
  "compatibility_date": "2026-02-17",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": [
    "nodejs_compat"
  ],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "webapp-production",
      "database_id": "ここに取得したdatabase_idを貼り付け"
    }
  ]
}
```

### ステップ5: データベースマイグレーションの適用

```bash
# 本番データベースにマイグレーションを適用
npx wrangler d1 migrations apply webapp-production

# 確認プロンプトで 'yes' を選択
```

**実行結果例:**
```
✅ 0001_initial_schema.sql
✅ 0002_initial_data.sql
```

### ステップ6: Cloudflare Pagesプロジェクトの作成

```bash
# Pagesプロジェクトを作成
npx wrangler pages project create webapp \
  --production-branch main \
  --compatibility-date 2026-02-17
```

**オプション**: プロジェクト名が重複する場合は、`webapp-2`, `webapp-kametu` などに変更してください。

### ステップ7: プロジェクトのビルドとデプロイ

```bash
# ビルド
npm run build

# デプロイ
npx wrangler pages deploy dist --project-name webapp
```

**初回デプロイの場合:**
- D1データベースのバインディングが自動的に設定されます
- デプロイURLが表示されます

**出力例:**
```
✨ Deployment complete! Take a peek over at
   https://xxxxxxxx.webapp.pages.dev
```

### ステップ8: デプロイの確認

```bash
# ブラウザでアクセス
# https://webapp.pages.dev (本番URL)
# https://main.webapp.pages.dev (ブランチURL)

# APIの確認
curl https://webapp.pages.dev/api/tables/site_settings
```

## 🔄 更新とデプロイ

### コードを更新してデプロイ

```bash
# 1. コードを編集

# 2. ビルド
npm run build

# 3. デプロイ
npx wrangler pages deploy dist --project-name webapp
```

### データベースの更新

新しいマイグレーションファイルを追加した場合:

```bash
# 新しいマイグレーションを作成
# migrations/0003_new_feature.sql

# 本番に適用
npx wrangler d1 migrations apply webapp-production
```

## 📊 D1データベース管理

### データの確認

```bash
# 本番データベースのクエリ実行
npx wrangler d1 execute webapp-production \
  --command="SELECT COUNT(*) FROM blog_posts"

# または対話モード
npx wrangler d1 execute webapp-production
```

### データのバックアップ

```bash
# エクスポート
npx wrangler d1 execute webapp-production \
  --command="SELECT * FROM site_settings" > backup.json
```

## 🌐 カスタムドメインの設定 (オプション)

### Cloudflare Dashboardから設定

1. Cloudflare Dashboard にログイン
2. **Pages** → 該当プロジェクトを選択
3. **Custom domains** タブ
4. **Set up a custom domain** をクリック
5. ドメイン名を入力 (例: kametu-es.example.com)
6. DNS設定を確認して完了

### Wrangler CLIから設定

```bash
# カスタムドメインを追加
npx wrangler pages domain add kametu-es.example.com \
  --project-name webapp
```

## 🔒 環境変数とシークレット

### シークレットの設定

本番環境で使用するシークレット（APIキー等）:

```bash
# Pagesシークレットを設定
npx wrangler pages secret put API_KEY \
  --project-name webapp

# 入力プロンプトでシークレット値を入力
```

### シークレットの一覧表示

```bash
npx wrangler pages secret list --project-name webapp
```

## 📈 モニタリングとログ

### デプロイメント履歴

Cloudflare Dashboard で確認:
- **Pages** → プロジェクト → **Deployments** タブ

### ログの確認

```bash
# Wrangler経由でログを確認
npx wrangler pages deployment tail --project-name webapp
```

## 🚨 トラブルシューティング

### デプロイエラー: "Project not found"

```bash
# プロジェクト一覧を確認
npx wrangler pages project list

# 正しいプロジェクト名を使用
npx wrangler pages deploy dist --project-name 正しい名前
```

### データベース接続エラー

```bash
# バインディングを確認
npx wrangler pages deployment list --project-name webapp

# D1データベースが正しく設定されているか確認
npx wrangler d1 list
```

### ビルドエラー

```bash
# node_modules を削除して再インストール
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📝 デプロイチェックリスト

- [ ] Cloudflare API Token設定済み
- [ ] `wrangler whoami` で認証確認
- [ ] D1データベース作成済み
- [ ] `wrangler.jsonc` に database_id 設定済み
- [ ] マイグレーション適用済み
- [ ] Pagesプロジェクト作成済み
- [ ] ビルド成功
- [ ] デプロイ成功
- [ ] Webサイトアクセス確認
- [ ] API動作確認
- [ ] 管理画面ログイン確認

## 🎉 デプロイ完了後

1. **README.md** の「デプロイ済みURL」を更新
2. デプロイURLをチームに共有
3. カスタムドメインの設定 (オプション)
4. モニタリングとログの確認設定

---

**デプロイが完了しました!** 🚀

問題が発生した場合は、Cloudflare Dashboard または Wrangler CLI のログを確認してください。
