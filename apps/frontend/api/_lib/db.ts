import { neon } from '@neondatabase/serverless'

const dbUrl = process.env.DATABASE_URL ?? process.env.database_url
if (!dbUrl) {
  throw new Error('DATABASE_URL env var ist nicht gesetzt')
}

export const sql = neon(dbUrl)
