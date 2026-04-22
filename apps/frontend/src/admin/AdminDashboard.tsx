import { useEffect, useState, useCallback } from 'react'
import { Users, TrendingUp, Download, Globe, Monitor, Smartphone, Tablet, Activity, ShieldAlert, ShieldCheck } from 'lucide-react'

/* ── Types ── */
interface Overview {
  today: number; week: number; month: number; total: number; downloads: number
  sparkline: { date: string; views: number }[]
}
interface PageRow    { path: string; views: number; visitors: number }
interface GeoRow     { country: string; views: number }
interface DeviceRow  { device: string; n: number }
interface BrowserRow { browser: string; n: number }
interface EventRow    { name: string; path: string; meta: unknown; created_at: string }
interface SecurityData {
  last24h: Record<string, number>
  topIps: { ip: string; count: number }[]
  recentEvents: { name: string; meta: { ip?: string; action?: string }; created_at: string }[]
}

/* ── Country flag emoji ── */
function flag(code: string) {
  if (!code || code === 'XX') return '🌐'
  return code.toUpperCase().replace(/./g, c =>
    String.fromCodePoint(c.charCodeAt(0) + 127397)
  )
}

/* ── Sparkline SVG ── */
function Sparkline({ data }: { data: { date: string; views: number }[] }) {
  if (!data.length) return <div className="h-16 flex items-center justify-center text-[#5a5550] text-xs">Noch keine Daten</div>
  const max = Math.max(...data.map(d => d.views), 1)
  const W = 300, H = 60
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * W
    const y = H - (d.views / max) * H
    return `${x},${y}`
  }).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-16" preserveAspectRatio="none">
      <defs>
        <linearGradient id="spGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,${H} ${pts} ${W},${H}`} fill="url(#spGrad)" opacity="0.15" />
      <polyline points={pts} fill="none" stroke="#C9A84C" strokeWidth="1.5"
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

/* ── Horizontal Bar ── */
function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#9A9590] w-24 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-[#C9A84C]/10 rounded-full overflow-hidden">
        <div className="h-full bg-[#C9A84C]/60 rounded-full transition-all duration-700"
          style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} />
      </div>
      <span className="text-xs text-[#9A9590] w-8 text-right shrink-0">{value}</span>
    </div>
  )
}

/* ── KPI Card ── */
function KpiCard({ label, value, icon: Icon }: {
  label: string; value: number
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
}) {
  return (
    <div className="bg-[#0a0a0a] border border-[#C9A84C]/12 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#9A9590]">{label}</span>
        <Icon size={15} strokeWidth={1.5} className="text-[#C9A84C]/50" />
      </div>
      <span className="font-display text-3xl text-[#F5F0E8]">{value.toLocaleString('de-DE')}</span>
    </div>
  )
}

function DeviceIcon({ device }: { device: string }) {
  if (device === 'mobile') return <Smartphone size={14} strokeWidth={1.5} className="text-[#C9A84C]/60" />
  if (device === 'tablet') return <Tablet     size={14} strokeWidth={1.5} className="text-[#C9A84C]/60" />
  return <Monitor size={14} strokeWidth={1.5} className="text-[#C9A84C]/60" />
}

/* ════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [live, setLive]         = useState(0)
  const [pages, setPages]       = useState<PageRow[]>([])
  const [geo, setGeo]           = useState<GeoRow[]>([])
  const [devices, setDevices]   = useState<DeviceRow[]>([])
  const [browsers, setBrowsers] = useState<BrowserRow[]>([])
  const [events, setEvents]     = useState<EventRow[]>([])
  const [security, setSecurity] = useState<SecurityData | null>(null)
  const [loading, setLoading]   = useState(true)

  const fetchAll = useCallback(async () => {
    try {
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
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const id = setInterval(() => {
      fetch('/api/analytics/live', { credentials: 'include' })
        .then(r => r.json()).then(d => setLive(d.live ?? 0)).catch(() => {})
    }, 30_000)
    return () => clearInterval(id)
  }, [fetchAll])

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#C9A84C]/20 border-t-[#C9A84C] animate-spin" />
      </div>
    )
  }

  const maxDevice  = Math.max(...devices.map(d => d.n), 1)
  const maxBrowser = Math.max(...browsers.map(b => b.n), 1)

  return (
    <div className="min-h-full p-6 md:p-10 flex flex-col gap-6">

      {/* ── Live Strip ── */}
      <div className="flex items-center gap-3 bg-[#0a0a0a] border border-[#C9A84C]/12 rounded-2xl px-6 py-4">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9A84C] opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#C9A84C]" />
        </span>
        <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#9A9590]">Live</span>
        <span className="font-display text-2xl text-[#F5F0E8] ml-1">{live}</span>
        <span className="text-[#9A9590] text-sm">Besucher gerade online</span>
        <button onClick={fetchAll} className="ml-auto text-[#9A9590] hover:text-[#C9A84C] transition-colors">
          <Activity size={15} strokeWidth={1.5} />
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Heute"     value={overview?.today     ?? 0} icon={TrendingUp} />
        <KpiCard label="7 Tage"    value={overview?.week      ?? 0} icon={TrendingUp} />
        <KpiCard label="30 Tage"   value={overview?.month     ?? 0} icon={TrendingUp} />
        <KpiCard label="Gesamt"    value={overview?.total     ?? 0} icon={Users}      />
        <KpiCard label="Downloads" value={overview?.downloads ?? 0} icon={Download}   />
      </div>

      {/* ── Sparkline ── */}
      <div className="bg-[#0a0a0a] border border-[#C9A84C]/12 rounded-2xl p-6">
        <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#9A9590] mb-4">
          Aufrufe — letzte 30 Tage
        </p>
        <Sparkline data={overview?.sparkline ?? []} />
      </div>

      {/* ── Top Pages + Geo ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0a0a0a] border border-[#C9A84C]/12 rounded-2xl p-6">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#9A9590] mb-4">Top Seiten</p>
          <div className="flex flex-col gap-2">
            {pages.map((p, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 border-b border-[#C9A84C]/6 last:border-0">
                <span className="font-mono text-[10px] text-[#9A9590] w-4 shrink-0">{i + 1}</span>
                <span className="text-sm text-[#F5F0E8] flex-1 truncate">{p.path || '/'}</span>
                <span className="text-xs text-[#9A9590] shrink-0">{p.views.toLocaleString('de-DE')}</span>
              </div>
            ))}
            {pages.length === 0 && <p className="text-[#5a5550] text-xs">Noch keine Daten</p>}
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#C9A84C]/12 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={14} strokeWidth={1.5} className="text-[#C9A84C]/50" />
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#9A9590]">Länder</p>
          </div>
          <div className="flex flex-col gap-2">
            {geo.map((g, i) => (
              <div key={i} className="flex items-center gap-3 py-1 border-b border-[#C9A84C]/6 last:border-0">
                <span className="text-base w-6 shrink-0">{flag(g.country)}</span>
                <span className="text-sm text-[#F5F0E8] flex-1">{g.country || 'Unbekannt'}</span>
                <span className="text-xs text-[#9A9590] shrink-0">{g.views}</span>
              </div>
            ))}
            {geo.length === 0 && <p className="text-[#5a5550] text-xs">Noch keine Daten</p>}
          </div>
        </div>
      </div>

      {/* ── Devices + Browsers ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0a0a0a] border border-[#C9A84C]/12 rounded-2xl p-6">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#9A9590] mb-4">Geräte</p>
          <div className="flex flex-col gap-3">
            {devices.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <DeviceIcon device={d.device} />
                <Bar label={d.device} value={d.n} max={maxDevice} />
              </div>
            ))}
            {devices.length === 0 && <p className="text-[#5a5550] text-xs">Noch keine Daten</p>}
          </div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#C9A84C]/12 rounded-2xl p-6">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#9A9590] mb-4">Browser</p>
          <div className="flex flex-col gap-3">
            {browsers.map((b, i) => (
              <Bar key={i} label={b.browser} value={b.n} max={maxBrowser} />
            ))}
            {browsers.length === 0 && <p className="text-[#5a5550] text-xs">Noch keine Daten</p>}
          </div>
        </div>
      </div>

      {/* ── Events Log ── */}
      <div className="bg-[#0a0a0a] border border-[#C9A84C]/12 rounded-2xl p-6">
        <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#9A9590] mb-4">
          Events — letzte 50
        </p>
        <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
          {events.map((e, i) => (
            <div key={i} className="flex items-center gap-4 py-1.5 border-b border-[#C9A84C]/6 last:border-0">
              <span className="font-mono text-[10px] text-[#C9A84C] bg-[#C9A84C]/8 px-2 py-0.5 rounded shrink-0">
                {e.name}
              </span>
              <span className="text-xs text-[#9A9590] flex-1 truncate">{e.path ?? '—'}</span>
              <span className="text-[10px] text-[#5a5550] shrink-0">
                {new Date(e.created_at).toLocaleString('de-DE', {
                  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
          ))}
          {events.length === 0 && <p className="text-[#5a5550] text-xs">Noch keine Events</p>}
        </div>
      </div>

      {/* ── Security ── */}
      <div className="bg-[#0a0a0a] border border-[#C9A84C]/12 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert size={14} strokeWidth={1.5} className="text-[#C9A84C]/50" />
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#9A9590]">
            Security — letzte 24h
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {([
            { label: 'Logins OK',   key: 'login_success', Icon: ShieldCheck, color: '#00C896' },
            { label: 'Login-Fails', key: 'login_fail',     Icon: ShieldAlert, color: '#FF4444' },
            { label: 'TOTP-Fails',  key: 'totp_fail',      Icon: ShieldAlert, color: '#FF4444' },
            { label: 'Geblockt',    key: 'rate_limited',   Icon: ShieldAlert, color: '#C9A84C' },
          ] as const).map(({ label, key, Icon, color }) => (
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

        {(security?.topIps?.length ?? 0) > 0 && (
          <div className="mb-5">
            <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#5a5550] mb-2">Top IPs (Fehlschläge)</p>
            <div className="flex flex-col gap-2">
              {security!.topIps.map((row, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-[#9A9590] w-28 shrink-0 truncate">{row.ip}</span>
                  <div className="flex-1 h-1 bg-[#C9A84C]/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FF4444]/50 rounded-full"
                      style={{ width: `${(row.count / security!.topIps[0].count) * 100}%` }} />
                  </div>
                  <span className="font-mono text-[10px] text-[#9A9590] w-4 text-right shrink-0">{row.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

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

    </div>
  )
}
