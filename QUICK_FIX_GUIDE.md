# 🔧 クイック修正ガイド

最も重要な修正を即座に適用する手順

---

## ✅ 完了済み

### 1. APIエンドポイントパスの修正 ✅

**修正内容**: すべてのJavaScriptファイル内の API呼び出しパスを修正

**変更前**:
```javascript
fetch('tables/blog_posts')
```

**変更後**:
```javascript
fetch('/api/tables/blog_posts')
```

**影響ファイル**: 20ファイル
**ステータス**: ✅ 完了・コミット済み

---

## ⏳ 残りの必須修正 (本番デプロイ前に実行)

### 2. 管理者パスワードの環境変数化

#### ステップ 1: .dev.vars ファイル作成 (ローカル開発用)

```bash
cd /home/user/webapp
cat > .dev.vars << 'EOF'
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password-here
EOF
```

#### ステップ 2: admin-auth.js の修正

**修正箇所**: `public/static/js/admin-auth.js` 40行目付近

**変更前**:
```javascript
if (username === 'admin' && password === 'admin0034') {
```

**変更後**:
```javascript
// Note: クライアント側では環境変数に直接アクセスできない
// サーバーサイドの認証APIを呼び出す必要がある
const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
});

if (response.ok) {
    // 認証成功
```

#### ステップ 3: Worker側に認証APIを追加

**新規ファイル**: `src/auth.ts`

```typescript
import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'
import { sign, verify } from 'hono/jwt'

type Bindings = {
  ADMIN_USERNAME: string
  ADMIN_PASSWORD: string
  JWT_SECRET: string
}

const auth = new Hono<{ Bindings: Bindings }>()

// ログインAPI
auth.post('/login', async (c) => {
  const { username, password } = await c.req.json()
  const { env } = c

  // 環境変数と照合
  if (username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD) {
    // JWTトークンを生成
    const token = await sign(
      {
        username,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8, // 8時間
      },
      env.JWT_SECRET
    )

    return c.json({ success: true, token })
  }

  return c.json({ success: false, error: 'Invalid credentials' }, 401)
})

// 認証ミドルウェア
export const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.substring(7)
  
  try {
    const payload = await verify(token, c.env.JWT_SECRET)
    c.set('user', payload)
    await next()
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401)
  }
}

export default auth
```

#### ステップ 4: wrangler.jsonc に環境変数を追加

```jsonc
{
  // ... 既存設定 ...
  "vars": {
    "ADMIN_USERNAME": "admin"
  }
  // ADMIN_PASSWORD と JWT_SECRET は secret で設定
}
```

#### ステップ 5: 本番環境のシークレット設定

```bash
# 本番用パスワード設定
npx wrangler pages secret put ADMIN_PASSWORD --project-name webapp
# プロンプトでパスワードを入力

# JWT秘密鍵設定
npx wrangler pages secret put JWT_SECRET --project-name webapp
# プロンプトでランダム文字列を入力 (32文字以上推奨)
```

---

## 📋 簡易修正 (推奨)

上記の完全な実装が複雑な場合、以下の簡易対応を実施:

### 簡易対応: パスワードを変更するだけ

**ファイル**: `public/static/js/admin-auth.js`

```javascript
// 40行目を変更
if (username === 'admin' && password === 'your-new-strong-password-123!@#') {
```

**注意**: これでもソースコードにパスワードが残るため、セキュリティ上は不十分です。

---

## 🔍 検証手順

### 1. ローカルテスト

```bash
# ビルド
npm run build

# 再起動
pm2 restart webapp

# テスト
curl http://localhost:3000/api/tables/blog_posts
```

### 2. 管理画面テスト

1. http://localhost:3000/admin-login.html を開く
2. 新しいパスワードでログイン
3. ダッシュボードが表示されることを確認

---

## 📝 チェックリスト

### デプロイ前の必須確認

- [x] APIパス修正 (`/api/tables/`)
- [ ] 管理者パスワード変更
- [ ] 環境変数設定 (.dev.vars)
- [ ] 本番シークレット設定
- [ ] 認証API実装 (推奨)
- [ ] ローカルでの動作確認
- [ ] 本番デプロイテスト

### デプロイ後の確認

- [ ] ウェブサイトアクセス確認
- [ ] API動作確認
- [ ] 管理画面ログイン確認
- [ ] データ表示確認

---

## 🚨 緊急時の対応

### 問題: APIが404エラー

**原因**: パス修正が反映されていない

**対応**:
```bash
cd /home/user/webapp/public/static/js
grep "tables/" *.js  # 修正漏れがないか確認
```

### 問題: 管理画面にログインできない

**原因**: パスワードが不一致

**対応**:
1. `admin-auth.js` のパスワードを確認
2. ブラウザのキャッシュをクリア
3. localStorage をクリア

### 問題: データが表示されない

**原因**: データベースが空

**対応**:
```bash
npm run db:migrate:local
```

---

**最終更新**: 2026年2月17日  
**ステータス**: APIパス修正完了、認証強化待ち
