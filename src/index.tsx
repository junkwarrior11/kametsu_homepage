import { Hono } from 'hono'
import api from './api'

type Bindings = {
  DB: D1Database
  ASSETS: { fetch: typeof fetch }
}

const app = new Hono<{ Bindings: Bindings }>()

// API routes - these handle all database operations
app.route('/api', api)

// Root path - serve index.html
app.get('/', async (c) => {
  // In Cloudflare Pages, static assets are served by the ASSETS binding
  // Forward the request to /index.html
  const { env } = c
  if (env.ASSETS) {
    return env.ASSETS.fetch(new Request(new URL('/index.html', c.req.url)))
  }
  // Fallback for local development - read the file from dist
  return c.redirect('/index.html')
})

export default app

