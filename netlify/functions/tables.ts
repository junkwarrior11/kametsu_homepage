// Netlify Functions用 RESTful Table API
import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Supabaseクライアントの初期化
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// CORSヘッダー
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

// テーブル名のバリデーション
const validTables = [
  'blog_posts',
  'newsletters',
  'events',
  'page_contents',
  'media',
  'site_settings',
  'access_logs',
  'access_stats',
  'uploaded_pdfs',
];

export const handler: Handler = async (event) => {
  // OPTIONSリクエスト（CORS preflight）
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path.replace('/.netlify/functions/tables/', '').replace('/api/tables/', '');
    const segments = path.split('/').filter(Boolean);
    const tableName = segments[0];
    const recordId = segments[1];

    // テーブル名のバリデーション
    if (!validTables.includes(tableName)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid table name' }),
      };
    }

    const method = event.httpMethod;
    const queryParams = event.queryStringParameters || {};

    // GET: 一覧取得または単一レコード取得
    if (method === 'GET') {
      if (recordId) {
        // 単一レコード取得
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', recordId)
          .single();

        if (error) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Record not found' }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data),
        };
      } else {
        // 一覧取得
        let query = supabase.from(tableName).select('*', { count: 'exact' });

        // ページネーション
        const page = parseInt(queryParams.page || '1');
        const limit = parseInt(queryParams.limit || '100');
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        // ソート
        if (queryParams.sort) {
          const sortField = queryParams.sort.replace(/^-/, '');
          const ascending = !queryParams.sort.startsWith('-');
          query = query.order(sortField, { ascending });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        // フィルター
        Object.keys(queryParams).forEach((key) => {
          if (key !== 'page' && key !== 'limit' && key !== 'sort') {
            query = query.eq(key, queryParams[key]);
          }
        });

        const { data, error, count } = await query;

        if (error) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            data,
            pagination: {
              page,
              limit,
              total: count || 0,
              totalPages: Math.ceil((count || 0) / limit),
            },
          }),
        };
      }
    }

    // POST: 新規作成
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');

      const { data, error } = await supabase.from(tableName).insert(body).select().single();

      if (error) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: error.message }),
        };
      }

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(data),
      };
    }

    // PUT: 完全更新
    if (method === 'PUT' && recordId) {
      const body = JSON.parse(event.body || '{}');

      const { data, error } = await supabase
        .from(tableName)
        .update(body)
        .eq('id', recordId)
        .select()
        .single();

      if (error) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: error.message }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data),
      };
    }

    // PATCH: 部分更新
    if (method === 'PATCH' && recordId) {
      const body = JSON.parse(event.body || '{}');

      const { data, error } = await supabase
        .from(tableName)
        .update(body)
        .eq('id', recordId)
        .select()
        .single();

      if (error) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: error.message }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data),
      };
    }

    // DELETE: 削除
    if (method === 'DELETE' && recordId) {
      const { error } = await supabase.from(tableName).delete().eq('id', recordId);

      if (error) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: error.message }),
        };
      }

      return {
        statusCode: 204,
        headers,
        body: '',
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
