import { neon } from '@neondatabase/serverless'

const dbUrl = process.env.DATABASE_URL ?? process.env.database_url ?? ''

export const sql = neon(dbUrl || 'postgresql://no-db-url-set:x@localhost/x')
