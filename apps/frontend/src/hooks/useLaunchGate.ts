// ── Launch-Gate für CandleScope FinanceBoard ──────────────────────────────
// Schaltet den Download-Button automatisch am Launch-Datum frei.
// Kein Redeploy nötig — rein clientseitig via Date-Check.

const LAUNCH_DATE = new Date('2026-06-08T00:00:00+02:00') // 8. Juni 2026, 00:00 MEZ

export const DOWNLOAD_URL =
  'https://github.com/SchubertChris/CS-OP/releases/latest/download/CandleScope-FinanceBoard-Setup.exe'

/** true = Download ist live, false = noch nicht freigeschaltet */
export function isLaunched(): boolean {
  return new Date() >= LAUNCH_DATE
}

/** Formatierter Countdown-String, z.B. "3 Tage, 4 Std." */
export function getLaunchCountdown(): string {
  const diff = LAUNCH_DATE.getTime() - Date.now()
  if (diff <= 0) return 'Live'

  const days  = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0)  return `${days} Tag${days !== 1 ? 'e' : ''}, ${hours} Std.`
  if (hours > 0) return `${hours} Std. ${mins} Min.`
  return `${mins} Min.`
}

/** Download-Click tracken (fire & forget) */
export function trackDownload(sessionId: string): void {
  fetch('/api/track/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'download_click',
      path: '/finance',
      sessionId,
      meta: { file: 'CandleScope-FinanceBoard-Setup.exe' },
    }),
  }).catch(() => { /* silent */ })
}
