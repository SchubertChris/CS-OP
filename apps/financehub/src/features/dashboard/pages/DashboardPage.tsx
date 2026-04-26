// Placeholder Dashboard — wächst in Phase 2 zu vollständiger Seite
// Zeigt jetzt: Shell-Test mit realistischen Mock-Daten

import { Card }        from '../../../shared/components/Card/Card'
import { Stat }        from '../../../shared/components/Stat/Stat'
import { Badge }       from '../../../shared/components/Badge/Badge'
import { ProgressBar } from '../../../shared/components/ProgressBar/ProgressBar'
import { Divider }     from '../../../shared/components/Divider/Divider'
import { Skeleton }    from '../../../shared/components/Skeleton/Skeleton'
import { Button }      from '../../../shared/components/Button/Button'
import { Alert }       from '../../../shared/components/Alert/Alert'
import { Plus, ArrowRight } from '@phosphor-icons/react'

const TRANSACTIONS = [
  { name: 'REWE Markt',          date: 'Heute, 14:22',    amount: '-€89,40',    pos: false },
  { name: 'Gehalt Mai 2026',     date: 'Gestern, 00:01',  amount: '+€4.200,00', pos: true  },
  { name: 'Netflix',             date: '24. Mai',          amount: '-€17,99',    pos: false },
  { name: 'Tankstelle Shell',    date: '23. Mai',          amount: '-€62,10',    pos: false },
  { name: 'Miete Mai',           date: '01. Mai',          amount: '-€1.150,00', pos: false },
]

const GOALS = [
  { label: 'Notfallreserve',    value: 68, variant: 'default'  as const, target: '€10.000' },
  { label: 'Urlaub Japan 2026', value: 42, variant: 'info'     as const, target: '€3.500'  },
  { label: 'Neues Fahrrad',     value: 85, variant: 'positive' as const, target: '€800'    },
]

export default function DashboardPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

      {/* Info-Banner */}
      <Alert variant="info" title="Dashboard in Entwicklung">
        Phase 2 baut hier die echten Karten auf. Aktuell: Shell + Layout-Test mit Mock-Daten.
      </Alert>

      {/* Hero KPIs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))',
        gap: 'var(--space-4)',
      }}>
        <Card variant="titled" title="Nettovermögen">
          <Stat label="Gesamt" value="€24.890" trend={3.2} trendLabel="gg. Vormonat" size="md" />
        </Card>
        <Card variant="default">
          <Stat label="Einnahmen Mai" value="€4.200" trend={5.1} size="md" />
        </Card>
        <Card variant="default">
          <Stat label="Ausgaben Mai" value="€3.180" trend={-2.3} size="md" />
        </Card>
        <Card variant="default">
          <Stat label="Sparquote" value="24.3%" trend={0} trendLabel="stabil" size="md" />
        </Card>
      </div>

      {/* Hauptbereich */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
        gap: 'var(--space-4)',
        alignItems: 'start',
      }}>

        {/* Letzte Transaktionen */}
        <Card
          variant="titled"
          title="Letzte Transaktionen"
          action={
            <Button variant="ghost" size="sm" iconRight={<ArrowRight size={12} />}>
              Alle
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {TRANSACTIONS.map((tx, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-2) 0',
                borderBottom: i < TRANSACTIONS.length - 1
                  ? '1px solid var(--cs-border-subtle)'
                  : undefined,
                gap: 'var(--space-3)',
              }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    margin: 0,
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--fw-medium)',
                    color: 'var(--cs-text)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {tx.name}
                  </p>
                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--cs-text-3)' }}>
                    {tx.date}
                  </p>
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-sm)',
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 'var(--fw-semibold)',
                  color: tx.pos ? 'var(--cs-positive)' : 'var(--cs-negative)',
                  flexShrink: 0,
                }}>
                  {tx.amount}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Sparziele */}
        <Card
          variant="titled"
          title="Sparziele"
          action={<Badge variant="gold">3 aktiv</Badge>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {GOALS.map(goal => (
              <div key={goal.label} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--cs-text-2)', fontWeight: 'var(--fw-medium)' }}>
                    {goal.label}
                  </span>
                  <span style={{
                    fontSize: 'var(--text-xs)',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--cs-text-3)',
                  }}>
                    {goal.value}% · {goal.target}
                  </span>
                </div>
                <ProgressBar value={goal.value} max={100} variant={goal.variant} size="sm" />
              </div>
            ))}
            <Divider variant="subtle" />
            <Button variant="secondary" size="sm" iconLeft={<Plus size={12} weight="bold" />}>
              Neues Sparziel
            </Button>
          </div>
        </Card>

      </div>

      {/* Skeleton — "noch in Entwicklung" Karte */}
      <Card variant="titled" title="Auswertung (kommt in Phase 2)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <Skeleton variant="rect" height={120} />
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Skeleton variant="rect" height={60} />
            <Skeleton variant="rect" height={60} />
            <Skeleton variant="rect" height={60} />
          </div>
        </div>
      </Card>

    </div>
  )
}
