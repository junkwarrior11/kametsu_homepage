# 管理者認証情報の設定方法

## 🔒 セキュリティ強化：環境変数による認証情報管理

管理者のユーザー名とパスワードは、環境変数（Environment Variables）で管理されます。
ソースコードには含まれないため、GitHubに公開されても安全です。

---

## 📝 設定手順

### 1️⃣ **ローカル開発環境**

`.dev.vars` ファイルに認証情報を設定（このファイルはGitにコミットされません）：

```bash
# .dev.vars
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_secure_password
```

**注意**: `.dev.vars` ファイルは `.gitignore` に含まれているため、Gitにコミットされません。

---

### 2️⃣ **本番環境（Cloudflare Pages）**

#### Cloudflare Pagesダッシュボードで設定：

1. **Cloudflare Pagesダッシュボードにアクセス**
   - https://dash.cloudflare.com/ にログイン
   - 「Pages」→ プロジェクト（webapp）を選択

2. **環境変数を設定**
   - 「Settings」タブをクリック
   - 「Environment variables」セクションを探す
   - 「Add variable」をクリック

3. **変数を追加**
   
   **変数1: ADMIN_USERNAME**
   - Variable name: `ADMIN_USERNAME`
   - Value: `your_admin_username`（任意のユーザー名）
   - Environment: `Production` と `Preview` の両方にチェック
   - 「Save」をクリック

   **変数2: ADMIN_PASSWORD**
   - Variable name: `ADMIN_PASSWORD`
   - Value: `your_secure_password`（強力なパスワード）
   - Environment: `Production` と `Preview` の両方にチェック
   - 「Save」をクリック

4. **再デプロイ**
   - 環境変数を設定後、最新のデプロイを「Retry deployment」で再実行
   - または、新しいコミットをプッシュして自動デプロイ

---

## 🔐 推奨パスワード設定

強力なパスワードの条件：
- 最低12文字以上
- 大文字・小文字・数字・記号を含む
- 辞書にない単語
- 他のサービスで使っていないもの

**パスワード例**（実際には使わないでください）:
```
Km2026!Secure#Admin
TkN$chool2026*Pass
```

---

## 🚨 デフォルト認証情報

環境変数が設定されていない場合のフォールバック：
- ユーザー名: `admin`
- パスワード: `admin123`

**⚠️ 本番環境では必ず環境変数を設定してください！**

---

## ✅ 設定確認方法

### ローカル環境：
1. `.dev.vars` ファイルに認証情報を記載
2. `npm run build && pm2 restart webapp`
3. http://localhost:3000/admin-login.html でログインテスト

### 本番環境：
1. Cloudflare Pagesで環境変数を設定
2. 再デプロイ
3. https://kametsu-homepage.netlify.app/admin-login.html でログインテスト

---

## 🔧 トラブルシューティング

### ログインできない場合：
1. 環境変数のスペルミスを確認
2. Cloudflare Pagesで環境変数が保存されているか確認
3. 再デプロイが完了しているか確認
4. ブラウザのコンソール（F12）でエラーを確認

### 環境変数が反映されない場合：
- Cloudflare Pagesで「Retry deployment」を実行
- キャッシュをクリアしてページを再読み込み（Ctrl+Shift+R）

---

## 📚 参考資料

- [Cloudflare Pages - Environment Variables](https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables)
- [Wrangler - Environment Variables](https://developers.cloudflare.com/workers/wrangler/configuration/#environment-variables)
