# 管理者認証情報の設定方法

## 🔒 セキュリティ強化：環境変数による認証情報管理

管理者のユーザー名とパスワードは、環境変数（Environment Variables）で管理されます。
ソースコードには含まれないため、GitHubに公開されても安全です。

---

## 📝 設定手順

### 1️⃣ **ローカル開発環境**

`.env` ファイルに認証情報を設定（このファイルはGitにコミットされません）：

```bash
# .env
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_secure_password
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

**注意**: `.env` ファイルは `.gitignore` に含まれているため、Gitにコミットされません。

---

### 2️⃣ **本番環境（Netlify）**

#### Netlifyダッシュボードで設定：

1. **Netlifyダッシュボードにアクセス**
   - https://app.netlify.com/ にログイン
   - サイト一覧から「kametsu-homepage」を選択

2. **環境変数を設定**
   - 「Site settings」をクリック
   - 左メニューから「Environment variables」を選択
   - 「Add a variable」ボタンをクリック

3. **変数を追加**
   
   **変数1: ADMIN_USERNAME**
   - Key: `ADMIN_USERNAME`
   - Value: `your_admin_username`（任意のユーザー名）
   - Scopes: 「Same value for all deploy contexts」を選択
   - 「Create variable」をクリック

   **変数2: ADMIN_PASSWORD**
   - Key: `ADMIN_PASSWORD`
   - Value: `your_secure_password`（強力なパスワード）
   - Scopes: 「Same value for all deploy contexts」を選択
   - 「Create variable」をクリック

4. **デプロイをトリガー**
   - 左メニューから「Deploys」をクリック
   - 「Trigger deploy」→「Clear cache and deploy site」を選択
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
1. `.env` ファイルに認証情報を記載
2. `npm run dev` または `netlify dev`
3. http://localhost:8888/admin-login.html でログインテスト

### 本番環境：
1. Netlifyで環境変数を設定
2. 「Clear cache and deploy site」で再デプロイ
3. https://kametsu-homepage.netlify.app/admin-login.html でログインテスト

---

## 🔧 トラブルシューティング

### ログインできない場合：
1. 環境変数のスペルミスを確認（`ADMIN_USERNAME`, `ADMIN_PASSWORD`）
2. Netlifyで環境変数が保存されているか確認
3. 再デプロイが完了しているか確認
4. ブラウザのコンソール（F12）でエラーを確認

### 環境変数が反映されない場合：
- Netlifyで「Clear cache and deploy site」を実行
- キャッシュをクリアしてページを再読み込み（Ctrl+Shift+R）
- Netlify Functionsのログを確認（Site settings → Functions）

---

## 📚 参考資料

- [Netlify - Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Netlify Functions - Environment Variables](https://docs.netlify.com/functions/configure-and-deploy/#environment-variables)
