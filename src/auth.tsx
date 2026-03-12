import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
  ADMIN_USERNAME?: string
  ADMIN_PASSWORD?: string
}

const auth = new Hono<{ Bindings: Bindings }>()

/**
 * ログイン認証API
 * POST /api/auth/login
 */
auth.post('/login', async (c) => {
  try {
    const { username, password } = await c.req.json()
    
    // 環境変数から認証情報を取得
    const validUsername = c.env.ADMIN_USERNAME || 'admin'
    const validPassword = c.env.ADMIN_PASSWORD || 'admin123'
    
    // 認証チェック
    if (username === validUsername && password === validPassword) {
      return c.json({
        success: true,
        message: 'ログインに成功しました',
        username: username
      })
    } else {
      return c.json({
        success: false,
        message: 'ユーザー名またはパスワードが正しくありません'
      }, 401)
    }
  } catch (error) {
    console.error('Login error:', error)
    return c.json({
      success: false,
      message: 'サーバーエラーが発生しました'
    }, 500)
  }
})

/**
 * 認証状態確認API
 * GET /api/auth/verify
 */
auth.get('/verify', async (c) => {
  // クライアント側でセッション管理しているため、
  // このエンドポイントは将来的な拡張用
  return c.json({
    success: true,
    message: '認証APIは正常に動作しています'
  })
})

export default auth
