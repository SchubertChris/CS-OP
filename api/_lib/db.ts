import { neon } from '@neondatabase/serverless'

if (!process.env.database_url) {
  throw new Error('database_url env var ist nicht gesetzt')
}

export const sql = neon(process.env.database_url)
