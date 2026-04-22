# Admin Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Coming-Soon-Modal für den Download-Button, echtes Logo im Admin-Header, Login-Event-Tracking im Backend, und eine Security-Karte im Admin-Dashboard.

**Architecture:** Vier unabhängige Änderungen — Frontend-UI (Modal + Logo), Backend-API (auth tracking + neuer security endpoint), Frontend-Dashboard (neue Karte). Kein neues DB-Schema nötig; die bestehende `events`-Tabelle wird für Security-Logs wiederverwendet.

**Tech Stack:** React 19, TypeScript, Framer Motion, Vercel Serverless Functions (`@vercel/node`), Neon Postgres (`@neondatabase/serverless`), Tailwind CSS 4

---

## File Structure

```
src/components/ui/ComingSoonModal.tsx   ← NEU: extrahiertes Modal
src/components/layout/Header.tsx        ← MODIFY: <a download> → <button> + Modal
src/pages/FinancePage.tsx               ← MODIFY: inline Modal entfernen, shared import
src/admin/AdminLayout.tsx               ← MODIFY: Diamant-Icon → csLogo
src/admin/AdminDashboard.tsx            ← MODIFY: Security-Karte + fetch
api/auth/[action].ts                    ← MODIFY: logEvent helper + 6 Tracking-Calls
api/analytics/security.ts              ← NEU: Security-Endpoint
```

---

## Task 1: ComingSoonModal extrahieren

**Files:**
- Create: `src/components/ui/ComingSoonModal.tsx`

- [ ] **Step 1: Datei erstellen**

Inhalt von `src/components/ui/ComingSoonModal.tsx`:

```tsx
import { motion } from 'framer-motion'
import { X, Clock } from 'lucide-react'

export default function ComingSoonModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(6px)', backgroundColor: 'rgba(8,8,8,0.75)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full max-w-sm bg-[var(--cs-s2)] border border-[#C9A84C]/20 rounded-2xl p-8
                   flex flex-col items-center text-center gap-5 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--cs-text-3)] hover:text-[var(--cs-text)] transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
        <div className="w-14 h-14 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20
                        flex items-center justify-center">
          <Clock size={24} className="text-[#C9A84C]" />
        </div>
        <div>
          <p className="text-[#C9A84C] text-xs tracking-[0.15em] uppercase mb-2">Bald verfügbar</p>
          <h3 className="text-[var(--cs-text)] font-bold text-xl mb-2">Download startet am</h3>
          <p className="text-[#C9A84C] text-3xl font-black">8. Juni 2026</p>
        </div>
        <p className="text-[var(--cs-text-2)] text-sm leading-relaxed">
          Das FinanceBoard ist fertig — der offizielle Release folgt am 8.6.2026.
          Bis dahin kannst du dich schon mal auf Discord melden.
        </p>
        <button
          onClick={onClose}
          className="bg-[#C9A84C] text-[#080808] font-bold text-sm px-8 py-3 rounded-lg
                     hover:opacity-90 transition-opacity duration-200 cursor-pointer"
        >
          Verstanden
        </button>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript-Build prüfen**

```bash
cd apps/frontend && npm run build 2>&1 | tail -20
```

Erwartet: Kein Fehler (neue Datei hat keine Imports aus dem Projekt — nur externe Pakete).

- [ ] **Step 3: Commit**

```bash
cd apps/frontend && git add src/components/ui/ComingSoonModal.tsx
git commit -m "feat(ui): extract ComingSoonModal to shared component"
```

---

## Task 2: FinancePage auf shared Modal umstellen

**Files:**
- Modify: `src/pages/FinancePage.tsx`

- [ ] **Step 1: Inline-`ComingSoonModal`-Funktion entfernen und shared import ergänzen**

In `src/pages/FinancePage.tsx`:

1. Zeile 1 — neuen Import ergänzen (nach den bestehenden Imports):
```tsx
import ComingSoonModal from '../components/ui/ComingSoonModal'
```

2. Die Funktion `function ComingSoonModal(...)` komplett löschen (Zeilen 61–105 laut aktuellem Stand). Das sind alle Zeilen von `function ComingSoonModal` bis zur schließenden `}` inklusive der leeren Zeile danach.

Die Nutzung `{dlOpen && <ComingSoonModal onClose={() => setDlOpen(false)} />}` auf Zeile 265 bleibt unverändert.

- [ ] **Step 2: Build prüfen**

```bash
cd apps/frontend && npm run build 2>&1 | tail -20
```

Erwartet: Kein TypeScript-Fehler.

- [ ] **Step 3: Manuell testen**

Dev-Server starten: `npm run dev`
→ `/finance` aufrufen → "Gratis laden"-Button auf der Seite klicken → Modal muss erscheinen → "Verstanden" schließt es.

- [ ] **Step 4: Commit**

```bash
cd apps/frontend && git add src/pages/FinancePage.tsx
git commit -m "refactor(finance): use shared ComingSoonModal"
```

---

## Task 3: Header-Button fixen

**Files:**
- Modify: `src/components/layout/Header.tsx`

- [ ] **Step 1: Import ergänzen**

Am Anfang von `src/components/layout/Header.tsx`, nach dem letzten bestehenden Import:

```tsx
import ComingSoonModal from '../ui/ComingSoonModal'
```

- [ ] **Step 2: State in `Header()` ergänzen**

In der `Header`-Funktion direkt nach den bestehenden `useState`-Zeilen:

```tsx
const [dlOpen, setDlOpen] = useState(false)
```

- [ ] **Step 3: `<a download>` ersetzen**

Die Zeilen:
```tsx
<a
  href="/downloads/FinanceBoard-Setup.exe"
  download
  aria-label="FinanceBoard herunterladen"
  className="relative overflow-hidden group text-[11px] tracking-[0.15em] uppercase bg-[#C9A84C] text-[#080808] font-bold px-5 py-2.5 rounded-full transition-opacity duration-200 hover:opacity-90"
>
  ↓ Gratis laden
</a>
```

Ersetzen mit:
```tsx
<button
  onClick={() => setDlOpen(true)}
  aria-label="FinanceBoard herunterladen"
  className="relative overflow-hidden group text-[11px] tracking-[0.15em] uppercase bg-[#C9A84C] text-[#080808] font-bold px-5 py-2.5 rounded-full transition-opacity duration-200 hover:opacity-90 cursor-pointer"
>
  ↓ Gratis laden
</button>
```

- [ ] **Step 4: Modal am Ende des JSX ergänzen**

Direkt vor dem letzten `</>` im `return`-Block (nach dem mobile sidebar `</div>`):

```tsx
{dlOpen && <ComingSoonModal onClose={() => setDlOpen(false)} />}
```

- [ ] **Step 5: Build + manuell testen**

```bash
cd apps/frontend && npm run build 2>&1 | tail -20
```

Dev-Server: `npm run dev`
→ Startseite aufrufen → "Gratis laden" im Header klicken → Modal erscheint → schließt sich → kein Download-Dialog vom Browser.

- [ ] **Step 6: Commit**

```bash
cd apps/frontend && git add src/components/layout/Header.tsx
git commit -m "fix(header): replace broken download link with coming-soon modal"
```

---

## Task 4: Logo in AdminLayout

**Files:**
- Modify: `src/admin/AdminLayout.tsx`

- [ ] **Step 1: Import ergänzen**

In `src/admin/AdminLayout.tsx`, nach den bestehenden Imports:

```tsx
import csLogo from '../assets/images/CandleScopeLogo.png'
```

- [ ] **Step 2: Diamant-Icon ersetzen**

Den gesamten Block:
```tsx
<div className="relative w-5 h-5 shrink-0">
  <div className="absolute inset-0 border border-[#C9A84C]/60 rotate-45 rounded-sm" />
  <div className="absolute inset-[3px] bg-[#C9A84C] rotate-45 rounded-sm" />
</div>
```

Ersetzen mit:
```tsx
<img src={csLogo} alt="CandleScope" className="w-5 h-5 object-contain shrink-0" />
```

- [ ] **Step 3: Build + manuell testen**

```bash
cd apps/frontend && npm run build 2>&1 | tail -20
```

Dev-Server: `npm run dev`
→ `/admin` aufrufen (einloggen) → im Header links oben muss das echte CandleScope-Logo erscheinen statt des Diamant-Icons.

- [ ] **Step 4: Commit**

```bash
cd apps/frontend && git add src/admin/AdminLayout.tsx
git commit -m "fix(admin): replace placeholder icon with real CandleScope logo"
```

---

## Task 5: Login-Event-Tracking in auth/[action].ts

**Files:**
- Modify: `api/auth/[action].ts`

- [ ] **Step 1: `logEvent`-Helper direkt in die Datei einfügen**

In `api/auth/[action].ts`, nach der `isRateLimited`-Funktion (ca. Zeile 65), folgende Funktion ergänzen:

```typescript
async function logEvent(name: string, meta: Record<string, string>) {
  try {
    const sql = neon(process.env.DATABASE_URL ?? '')
    await sql`INSERT INTO events (name, meta) VALUES (${name}, ${JSON.stringify(meta)})`
  } catch { /* nie von Logging werfen lassen */ }
}
```

- [ ] **Step 2: Rate-Limit-Block im `login`-Handler tracken**

Im `login`-Block, die Rate-Limit-Prüfung von:
```typescript
if (await isRateLimited(`login:${ip}`, 5, 15 * 60 * 1000))
  return res.status(429).json({ error: 'Zu viele Versuche.' })
```

Zu:
```typescript
if (await isRateLimited(`login:${ip}`, 5, 15 * 60 * 1000)) {
  await logEvent('rate_limited', { ip, action: 'login' })
  return res.status(429).json({ error: 'Zu viele Versuche.' })
}
```

- [ ] **Step 3: Login-Fehlschlag tracken**

Die bcrypt-Prüfung von:
```typescript
if (!await bcrypt.compare(password, process.env.admin_password_hash ?? ''))
  return res.status(401).json({ error: 'Ungültige Anmeldedaten' })
return res.status(200).json({ tempToken: await issueTempToken() })
```

Zu:
```typescript
if (!await bcrypt.compare(password, process.env.admin_password_hash ?? '')) {
  await logEvent('login_fail', { ip })
  return res.status(401).json({ error: 'Ungültige Anmeldedaten' })
}
await logEvent('login_success', { ip })
return res.status(200).json({ tempToken: await issueTempToken() })
```

- [ ] **Step 4: TOTP Rate-Limit + Fehlschlag + Erfolg tracken**

Im `totp-verify`-Block:

Rate-Limit von:
```typescript
if (await isRateLimited(`totp:${ip}`, 10, 5 * 60 * 1000))
  return res.status(429).json({ error: 'Zu viele Versuche.' })
```

Zu:
```typescript
if (await isRateLimited(`totp:${ip}`, 10, 5 * 60 * 1000)) {
  await logEvent('rate_limited', { ip, action: 'totp' })
  return res.status(429).json({ error: 'Zu viele Versuche.' })
}
```

TOTP-Prüfung von:
```typescript
if (!authenticator.verify({ token: String(code), secret: process.env.totp_secret ?? '' }))
  return res.status(401).json({ error: 'Ungültige Anmeldedaten' })
setAdminCookie(res, await issueAdminToken())
return res.status(200).json({ ok: true })
```

Zu:
```typescript
if (!authenticator.verify({ token: String(code), secret: process.env.totp_secret ?? '' })) {
  await logEvent('totp_fail', { ip })
  return res.status(401).json({ error: 'Ungültige Anmeldedaten' })
}
await logEvent('totp_success', { ip })
setAdminCookie(res, await issueAdminToken())
return res.status(200).json({ ok: true })
```

- [ ] **Step 5: Build prüfen**

```bash
cd apps/frontend && npm run build 2>&1 | tail -20
```

Erwartet: Kein TypeScript-Fehler.

- [ ] **Step 6: Commit**

```bash
cd apps/frontend && git add api/auth/[action].ts
git commit -m "feat(auth): track login/totp events in events table"
```

---

## Task 6: Security-Endpoint erstellen

**Files:**
- Create: `api/analytics/security.ts`

- [ ] **Step 1: Datei erstellen**

Inhalt von `api/analytics/security.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from '../_lib/auth'
import { getDb } from '../_lib/db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (!await requireAdmin(req, res)) return

  const sql = getDb()

  try {
    const [counts, topIps, recent] = await Promise.all([
      sql`
        SELECT name, COUNT(*)::int AS n
        FROM events
        WHERE name IN ('login_fail', 'totp_fail', 'rate_limited', 'login_success', 'totp_success')
          AND created_at > NOW() - INTERVAL '24 hours'
        GROUP BY name
      `,
      sql`
        SELECT meta->>'ip' AS ip, COUNT(*)::int AS count
        FROM events
        WHERE name IN ('login_fail', 'totp_fail', 'rate_limited')
          AND created_at > NOW() - INTERVAL '24 hours'
          AND meta->>'ip' IS NOT NULL
        GROUP BY meta->>'ip'
        ORDER BY count DESC
        LIMIT 5
      `,
      sql`
        SELECT name, meta, created_at
        FROM events
        WHERE name IN ('login_fail', 'totp_fail', 'rate_limited', 'login_success', 'totp_success')
        ORDER BY created_at DESC
        LIMIT 20
      `,
    ])

    const last24h: Record<string, number> = {}
    for (const row of counts as { name: string; n: number }[]) {
      last24h[row.name] = row.n
    }

    return res.status(200).json({
      last24h,
      topIps,
      recentEvents: recent,
    })
  } catch (e) {
    return res.status(500).json({ error: String(e) })
  }
}
```

- [ ] **Step 2: Build prüfen**

```bash
cd apps/frontend && npm run build 2>&1 | tail -20
```

Erwartet: Kein TypeScript-Fehler.

- [ ] **Step 3: Commit**

```bash
cd apps/frontend && git add api/analytics/security.ts
git commit -m "feat(api): add /api/analytics/security endpoint"
```

---

## Task 7: Security-Karte im AdminDashboard

**Files:**
- Modify: `src/admin/AdminDashboard.tsx`

- [ ] **Step 1: `ShieldAlert`-Icon zu Importen ergänzen**

Zeile 2 von `AdminDashboard.tsx` von:
```tsx
import { Users, TrendingUp, Download, Globe, Monitor, Smartphone, Tablet, Activity } from 'lucide-react'
```

Zu:
```tsx
import { Users, TrendingUp, Download, Globe, Monitor, Smartphone, Tablet, Activity, ShieldAlert, ShieldCheck } from 'lucide-react'
```

- [ ] **Step 2: `SecurityData`-Interface ergänzen**

Nach den bestehenden Interfaces (nach `EventRow`), einfügen:

```tsx
interface SecurityData {
  last24h: Record<string, number>
  topIps: { ip: string; count: number }[]
  recentEvents: { name: string; meta: { ip?: string; action?: string }; created_at: string }[]
}
```

- [ ] **Step 3: State und Fetch ergänzen**

In der `AdminDashboard`-Komponente, nach `const [loading, setLoading] = useState(true)`:

```tsx
const [security, setSecurity] = useState<SecurityData | null>(null)
```

In `fetchAll`, den `Promise.all`-Array um den Security-Fetch erweitern — von:
```tsx
const [ov, lv, pg, ge, dv, ev] = await Promise.all([
  fetch('/api/analytics/overview', { credentials: 'include' }).then(r => r.json()),
  fetch('/api/analytics/live',     { credentials: 'include' }).then(r => r.json()),
  fetch('/api/analytics/pages',    { credentials: 'include' }).then(r => r.json()),
  fetch('/api/analytics/geo',      { credentials: 'include' }).then(r => r.json()),
  fetch('/api/analytics/devices',  { credentials: 'include' }).then(r => r.json()),
  fetch('/api/analytics/events',   { credentials: 'include' }).then(r => r.json()),
])
setOverview(ov)
setLive(lv.live ?? 0)
setPages(pg.pages ?? [])
setGeo(ge.geo ?? [])
setDevices(dv.devices ?? [])
setBrowsers(dv.browsers ?? [])
setEvents(ev.events ?? [])
```

Zu:
```tsx
const [ov, lv, pg, ge, dv, ev, sec] = await Promise.all([
  fetch('/api/analytics/overview',  { credentials: 'include' }).then(r => r.json()),
  fetch('/api/analytics/live',      { credentials: 'include' }).then(r => r.json()),
  fetch('/api/analytics/pages',     { credentials: 'include' }).then(r => r.json()),
  fetch('/api/analytics/geo',       { credentials: 'include' }).then(r => r.json()),
  fetch('/api/analytics/devices',   { credentials: 'include' }).then(r => r.json()),
  fetch('/api/analytics/events',    { credentials: 'include' }).then(r => r.json()),
  fetch('/api/analytics/security',  { credentials: 'include' }).then(r => r.json()),
])
setOverview(ov)
setLive(lv.live ?? 0)
setPages(pg.pages ?? [])
setGeo(ge.geo ?? [])
setDevices(dv.devices ?? [])
setBrowsers(dv.browsers ?? [])
setEvents(ev.events ?? [])
setSecurity(sec)
```

- [ ] **Step 4: Security-Karte ans Ende des JSX hängen**

Direkt vor dem schließenden `</div>` des Haupt-`return`-Blocks (nach dem Events-Log-Block), einfügen:

```tsx
{/* ── Security ── */}
<div className="bg-[#0a0a0a] border border-[#C9A84C]/12 rounded-2xl p-6">
  <div className="flex items-center gap-2 mb-4">
    <ShieldAlert size={14} strokeWidth={1.5} className="text-[#C9A84C]/50" />
    <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#9A9590]">
      Security — letzte 24h
    </p>
  </div>

  {/* KPI-Zeile */}
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
    {[
      { label: 'Logins OK',   key: 'login_success',  icon: ShieldCheck, color: '#00C896' },
      { label: 'Login-Fails', key: 'login_fail',      icon: ShieldAlert, color: '#FF4444' },
      { label: 'TOTP-Fails',  key: 'totp_fail',       icon: ShieldAlert, color: '#FF4444' },
      { label: 'Geblockt',    key: 'rate_limited',    icon: ShieldAlert, color: '#C9A84C' },
    ].map(({ label, key, icon: Icon, color }) => (
      <div key={key} className="bg-[#111] border border-[#C9A84C]/8 rounded-xl p-3 flex flex-col gap-1">
        <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#9A9590]">{label}</span>
        <div className="flex items-center gap-1.5">
          <Icon size={12} strokeWidth={1.5} style={{ color }} />
          <span className="font-display text-xl" style={{ color }}>
            {security?.last24h[key] ?? 0}
          </span>
        </div>
      </div>
    ))}
  </div>

  {/* Top IPs */}
  {(security?.topIps?.length ?? 0) > 0 && (
    <div className="mb-5">
      <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#5a5550] mb-2">Top IPs (Fehlschläge)</p>
      <div className="flex flex-col gap-2">
        {security!.topIps.map((row, i) => {
          const maxCount = security!.topIps[0].count
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-[#9A9590] w-28 shrink-0 truncate">{row.ip}</span>
              <div className="flex-1 h-1 bg-[#C9A84C]/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#FF4444]/50 rounded-full"
                  style={{ width: `${(row.count / maxCount) * 100}%` }} />
              </div>
              <span className="font-mono text-[10px] text-[#9A9590] w-4 text-right shrink-0">{row.count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )}

  {/* Letzte Ereignisse */}
  <div>
    <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#5a5550] mb-2">Letzte Ereignisse</p>
    <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
      {(security?.recentEvents ?? []).map((e, i) => {
        const isOk = e.name === 'login_success' || e.name === 'totp_success'
        return (
          <div key={i} className="flex items-center gap-3 py-1 border-b border-[#C9A84C]/6 last:border-0">
            <span className={`font-mono text-[10px] px-2 py-0.5 rounded shrink-0 ${
              isOk ? 'text-[#00C896] bg-[#00C896]/8' : 'text-[#FF4444] bg-[#FF4444]/8'
            }`}>
              {e.name}
            </span>
            <span className="text-[10px] text-[#9A9590] flex-1 truncate font-mono">
              {e.meta?.ip ?? '—'}
            </span>
            <span className="text-[10px] text-[#5a5550] shrink-0">
              {new Date(e.created_at).toLocaleString('de-DE', {
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
              })}
            </span>
          </div>
        )
      })}
      {(security?.recentEvents?.length ?? 0) === 0 && (
        <p className="text-[#5a5550] text-xs">Noch keine Security-Events</p>
      )}
    </div>
  </div>
</div>
```

- [ ] **Step 5: Build prüfen**

```bash
cd apps/frontend && npm run build 2>&1 | tail -20
```

Erwartet: Kein TypeScript-Fehler.

- [ ] **Step 6: Manuell testen**

Dev-Server: `npm run dev`
→ `/admin` aufrufen → Dashboard muss laden ohne Fehler → Security-Karte erscheint am Ende → zeigt "0" für alle Werte (noch keine echten Events).

Zum Testen mit echten Daten: einmal mit falschem Passwort einloggen → ausloggen → wieder einloggen → im Dashboard sollte `login_fail: 1` und `login_success: 1` erscheinen (nach Seite neu laden oder Refresh-Button).

- [ ] **Step 7: Commit**

```bash
cd apps/frontend && git add src/admin/AdminDashboard.tsx
git commit -m "feat(admin): add security monitoring card to dashboard"
```

---

## Abschluss-Deploy

- [ ] **Änderungen nach Vercel pushen**

```bash
cd "C:/Users/Dezent/Desktop/CANDLESCOPE/Candlescope Web 01.04.2026" && git push
```

Vercel deployed automatisch aus dem `main`-Branch.

- [ ] **Endpoints auf Produktion prüfen**

Nach Deployment (ca. 1–2 Min):
- `https://candlescope.de/api/analytics/security` → muss `401 Nicht eingeloggt` zurückgeben (korrekt, da kein Cookie)
- Admin einloggen → Dashboard → Security-Karte erscheint
