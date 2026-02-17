import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database
}

const api = new Hono<{ Bindings: Bindings }>()

// Enable CORS for all API routes
api.use('/*', cors())

// Helper function to generate UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Helper function to validate table name
function isValidTable(tableName: string): boolean {
  const validTables = [
    'blog_posts',
    'newsletters',
    'events',
    'page_contents',
    'media',
    'site_settings',
    'access_logs',
    'access_stats',
    'uploaded_pdfs'
  ]
  return validTables.includes(tableName)
}

// GET /api/tables/:table - リスト取得
api.get('/tables/:table', async (c) => {
  const { env } = c
  const tableName = c.req.param('table')

  if (!isValidTable(tableName)) {
    return c.json({ error: 'Invalid table name' }, 400)
  }

  try {
    // クエリパラメータの取得
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '100')
    const sort = c.req.query('sort') || '-created_at'
    const status = c.req.query('status')
    const category = c.req.query('category')

    // ソート処理
    let orderBy = 'created_at DESC'
    if (sort) {
      const desc = sort.startsWith('-')
      const field = desc ? sort.substring(1) : sort
      orderBy = `${field} ${desc ? 'DESC' : 'ASC'}`
    }

    // WHERE句の構築
    let whereClause = '1=1'
    const params: any[] = []
    
    if (status) {
      whereClause += ' AND status = ?'
      params.push(status)
    }
    
    if (category) {
      whereClause += ' AND category = ?'
      params.push(category)
    }

    // OFFSET計算
    const offset = (page - 1) * limit

    // データ取得
    const query = `SELECT * FROM ${tableName} WHERE ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const result = await env.DB.prepare(query).bind(...params).all()

    // 総数取得
    const countQuery = `SELECT COUNT(*) as total FROM ${tableName} WHERE ${whereClause}`
    const countParams = params.slice(0, -2) // limit と offset を除く
    const countResult = await env.DB.prepare(countQuery).bind(...countParams).first()

    return c.json({
      data: result.results,
      pagination: {
        page,
        limit,
        total: countResult?.total || 0,
        totalPages: Math.ceil((countResult?.total || 0) / limit)
      }
    })
  } catch (error: any) {
    console.error('Error fetching data:', error)
    return c.json({ error: error.message }, 500)
  }
})

// GET /api/tables/:table/:id - 単一レコード取得
api.get('/tables/:table/:id', async (c) => {
  const { env } = c
  const tableName = c.req.param('table')
  const id = c.req.param('id')

  if (!isValidTable(tableName)) {
    return c.json({ error: 'Invalid table name' }, 400)
  }

  try {
    const result = await env.DB.prepare(
      `SELECT * FROM ${tableName} WHERE id = ?`
    ).bind(id).first()

    if (!result) {
      return c.json({ error: 'Record not found' }, 404)
    }

    return c.json(result)
  } catch (error: any) {
    console.error('Error fetching record:', error)
    return c.json({ error: error.message }, 500)
  }
})

// POST /api/tables/:table - 新規作成
api.post('/tables/:table', async (c) => {
  const { env } = c
  const tableName = c.req.param('table')

  if (!isValidTable(tableName)) {
    return c.json({ error: 'Invalid table name' }, 400)
  }

  try {
    const body = await c.req.json()
    
    // IDの生成
    const id = body.id || generateUUID()
    const now = new Date().toISOString()

    // フィールドと値の配列を作成
    const fields = ['id', ...Object.keys(body).filter(k => k !== 'id')]
    const values = [id, ...Object.keys(body).filter(k => k !== 'id').map(k => body[k])]

    // created_at と updated_at の追加
    if (!fields.includes('created_at')) {
      fields.push('created_at')
      values.push(now)
    }
    if (!fields.includes('updated_at')) {
      fields.push('updated_at')
      values.push(now)
    }

    const placeholders = fields.map(() => '?').join(', ')
    const query = `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders})`

    await env.DB.prepare(query).bind(...values).run()

    // 作成されたレコードを取得
    const result = await env.DB.prepare(
      `SELECT * FROM ${tableName} WHERE id = ?`
    ).bind(id).first()

    return c.json(result, 201)
  } catch (error: any) {
    console.error('Error creating record:', error)
    return c.json({ error: error.message }, 500)
  }
})

// PUT /api/tables/:table/:id - 完全更新
api.put('/tables/:table/:id', async (c) => {
  const { env } = c
  const tableName = c.req.param('table')
  const id = c.req.param('id')

  if (!isValidTable(tableName)) {
    return c.json({ error: 'Invalid table name' }, 400)
  }

  try {
    const body = await c.req.json()
    const now = new Date().toISOString()

    // updated_at の追加
    body.updated_at = now

    const fields = Object.keys(body).filter(k => k !== 'id')
    const values = fields.map(k => body[k])
    const setClause = fields.map(f => `${f} = ?`).join(', ')

    const query = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`
    await env.DB.prepare(query).bind(...values, id).run()

    // 更新されたレコードを取得
    const result = await env.DB.prepare(
      `SELECT * FROM ${tableName} WHERE id = ?`
    ).bind(id).first()

    if (!result) {
      return c.json({ error: 'Record not found' }, 404)
    }

    return c.json(result)
  } catch (error: any) {
    console.error('Error updating record:', error)
    return c.json({ error: error.message }, 500)
  }
})

// PATCH /api/tables/:table/:id - 部分更新
api.patch('/tables/:table/:id', async (c) => {
  const { env } = c
  const tableName = c.req.param('table')
  const id = c.req.param('id')

  if (!isValidTable(tableName)) {
    return c.json({ error: 'Invalid table name' }, 400)
  }

  try {
    const body = await c.req.json()
    const now = new Date().toISOString()

    // updated_at の追加
    body.updated_at = now

    const fields = Object.keys(body).filter(k => k !== 'id')
    const values = fields.map(k => body[k])
    const setClause = fields.map(f => `${f} = ?`).join(', ')

    const query = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`
    await env.DB.prepare(query).bind(...values, id).run()

    // 更新されたレコードを取得
    const result = await env.DB.prepare(
      `SELECT * FROM ${tableName} WHERE id = ?`
    ).bind(id).first()

    if (!result) {
      return c.json({ error: 'Record not found' }, 404)
    }

    return c.json(result)
  } catch (error: any) {
    console.error('Error patching record:', error)
    return c.json({ error: error.message }, 500)
  }
})

// DELETE /api/tables/:table/:id - 削除
api.delete('/tables/:table/:id', async (c) => {
  const { env } = c
  const tableName = c.req.param('table')
  const id = c.req.param('id')

  if (!isValidTable(tableName)) {
    return c.json({ error: 'Invalid table name' }, 400)
  }

  try {
    const query = `DELETE FROM ${tableName} WHERE id = ?`
    await env.DB.prepare(query).bind(id).run()

    return c.json({ message: 'Record deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting record:', error)
    return c.json({ error: error.message }, 500)
  }
})

export default api
