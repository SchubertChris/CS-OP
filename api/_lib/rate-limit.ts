import { sql } from './db'

export async function isRateLimited(
  key: string,
  max: number,
  windowMs: number
): Promise<boolean> {
  const resetAt = new Date(Date.now() + windowMs)

  const rows = await sql`
    INSERT INTO rate_limits (key, count, reset_at)
    VALUES (${key}, 1, ${resetAt.toISOString()})
    ON CONFLICT (key) DO UPDATE
      SET count    = CASE WHEN rate_limits.reset_at < NOW()
                          THEN 1
                          ELSE rate_limits.count + 1 END,
          reset_at = CASE WHEN rate_limits.reset_at < NOW()
                          THEN ${resetAt.toISOString()}::timestamptz
                          ELSE rate_limits.reset_at END
    RETURNING count, reset_at
  `

  const { count } = rows[0] as { count: number; reset_at: string }
  return count > max
}
