import type { Handler } from '@netlify/functions'

/**
 * 管理者認証API
 * Netlify Functions版
 */
const handler: Handler = async (event) => {
  // CORSヘッダーを設定
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  // OPTIONSリクエスト（プリフライト）に対応
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  // POSTメソッドのみ許可
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    // リクエストボディを解析
    const { username, password } = JSON.parse(event.body || '{}')

    // 環境変数から認証情報を取得
    const validUsername = process.env.ADMIN_USERNAME || 'admin'
    const validPassword = process.env.ADMIN_PASSWORD || 'admin123'

    // 認証チェック
    if (username === validUsername && password === validPassword) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'ログインに成功しました',
          username: username
        })
      }
    } else {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'ユーザー名またはパスワードが正しくありません'
        })
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'サーバーエラーが発生しました'
      })
    }
  }
}

export { handler }
