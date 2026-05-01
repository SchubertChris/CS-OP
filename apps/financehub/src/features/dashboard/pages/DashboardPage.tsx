import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendUp, Lightbulb } from '@phosphor-icons/react'
import { useAuthStore } from '../../../store/authStore'
import styles from './DashboardPage.module.scss'

// ── Mock Data ─────────────────────────────────────────────────────────────────

const SPENDING = [
  { name: 'Wohnen',       value: 1150, pct: 36, color: '#EF4444' },
  { name: 'Lebensmittel', value:  580, pct: 18, color: '#22C55E' },
  { name: 'Transport',    value:  320, pct: 10, color: '#3B82F6' },
  { name: 'Abonnements',  value:  240, pct:  8, color: '#8B5CF6' },
  { name: 'Gesundheit',   value:  190, pct:  6, color: '#EC4899' },
  { name: 'Sonstiges',    value:  700, pct: 22, color: '#6B7280' },
]

const UPCOMING = [
  { name: 'Miete Juni',       date: 'in 2 Tagen',    amount: '-€1.150', color: '#EF4444' },
  { name: 'Spotify',          date: 'in 4 Tagen',    amount: '-€9,99',  color: '#1DB954' },
  { name: 'KFZ-Versicherung', date: 'in 8 Tagen',    amount: '-€84,60', color: '#3B82F6' },
  { name: 'ADAC Beitrag',     date: 'in 12 Tagen',   amount: '-€11,60', color: '#F59E0B' },
  { name: 'GEZ Rundfunk',     date: 'in 17 Tagen',   amount: '-€18,36', color: '#6B7280' },
]

const INSIGHTS = [
  {
    icon: '💡',
    bg: 'rgba(245, 158, 11, 0.12)',
    title: 'Sparquote gestiegen',
    sub: 'Du sparst diesen Monat 24,3 % — 2,1 Punkte mehr als im April. Weiter so!',
    type: 'positive' as const,
  },
  {
    icon: '⚠️',
    bg: 'rgba(239, 68, 68, 0.10)',
    title: 'Essen-Budget fast voll',
    sub: 'Noch €62 übrig im Lebensmittel-Budget — bis Monatsende sind es noch 18 Tage.',
    type: 'warning' as const,
  },
  {
    icon: '📅',
    bg: 'rgba(59, 130, 246, 0.10)',
    title: 'Miete fällig in 2 Tagen',
    sub: '€1.150 werden am 1. Juni von Girokonto DKB abgebucht.',
    type: 'info' as const,
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Guten Morgen'
  if (h < 18) return 'Guten Tag'
  return 'Guten Abend'
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--cs-surface)',
      border: '1px solid var(--cs-border)',
      borderRadius: 8,
      padding: '6px 10px',
      fontSize: 12,
      color: 'var(--cs-text)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    }}>
      {payload[0].name}: <strong>€{payload[0].value.toLocaleString('de-DE')}</strong>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const user = useAuthStore(s => s.user)
  const firstName = user?.displayName?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'Chris'

  return (
    <div className={styles.page}>

      {/* Greeting */}
      <div className={styles.greeting}>
        <span className={styles.greetingLine}>{getGreeting()}</span>
        <h1 className={styles.greetingName}>{firstName} — Mai 2026</h1>
      </div>

      {/* 1 — Net Worth Hero */}
      <div className={styles.netWorthCard}>
        <div className={styles.netWorthLabel}>Gesamtvermögen</div>
        <div className={styles.netWorthValue}>€42.800</div>
        <div className={styles.netWorthFooter}>
          <span className={styles.netWorthTrend}>
            <TrendUp size={14} weight="bold" />
            +€1.240 · +2,9 %
          </span>
          <span className={styles.netWorthDate}>ggü. April 2026</span>
        </div>
      </div>

      {/* 2 — Cash Flow */}
      <div className={styles.cashRow}>
        <div className={styles.cashCard}>
          <div className={styles.cashLabel}>Einnahmen Mai</div>
          <div className={`${styles.cashValue} ${styles.positive}`}>€4.200</div>
          <div className={styles.cashSub}>+€200 ggü. Vormonat</div>
        </div>
        <div className={styles.cashCard}>
          <div className={styles.cashLabel}>Ausgaben Mai</div>
          <div className={`${styles.cashValue} ${styles.negative}`}>€3.180</div>
          <div className={styles.cashSub}>−€60 ggü. Vormonat</div>
        </div>
      </div>

      {/* 3+4+5 — Bottom Grid */}
      <div className={styles.bottomGrid}>

        {/* 3 — Spending Donut */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Ausgaben nach Kategorie</span>
            <span className={styles.cardBadge}>Mai</span>
          </div>
          <div className={styles.donutWrap}>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={SPENDING}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={64}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {SPENDING.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.donutLegend}>
              {SPENDING.map(s => (
                <div key={s.name} className={styles.donutLegendRow}>
                  <span style={{ background: s.color }} />
                  <span className={styles.donutLegendLabel}>{s.name}</span>
                  <span className={styles.donutLegendPct}>{s.pct} %</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4 — Upcoming Payments */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Fällige Zahlungen</span>
            <span className={styles.cardBadge}>5 offen</span>
          </div>
          <div className={styles.paymentList}>
            {UPCOMING.map(p => (
              <div key={p.name} className={styles.paymentRow}>
                <span className={styles.paymentDot} style={{ background: p.color }} />
                <div className={styles.paymentInfo}>
                  <div className={styles.paymentName}>{p.name}</div>
                  <div className={styles.paymentDate}>{p.date}</div>
                </div>
                <span className={styles.paymentAmount}>{p.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5 — Smart Insights */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Smart Insights</span>
            <Lightbulb size={14} weight="duotone" style={{ color: 'var(--cs-gold)' }} />
          </div>
          <div className={styles.insightList}>
            {INSIGHTS.map(ins => (
              <div key={ins.title} className={styles.insightRow}>
                <div className={styles.insightIcon} style={{ background: ins.bg }}>
                  {ins.icon}
                </div>
                <div className={styles.insightText}>
                  <div className={styles.insightTitle}>{ins.title}</div>
                  <div className={styles.insightSub}>{ins.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
