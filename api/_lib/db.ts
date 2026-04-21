import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL env var ist nicht gesetzt')
}

export const sql = neon(process.env.DATABASE_URL)
