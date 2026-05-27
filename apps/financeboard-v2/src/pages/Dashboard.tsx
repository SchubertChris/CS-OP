import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, ArrowLeftRight, Calendar } from 'lucide-react';
import { useAccountsStore, selectTotalBalance } from '../stores/accounts.store';
import { useTransactionsStore } from '../stores/transactions.store';
import { useSettingsStore } from '../stores/settings.store';
import { KpiCard } from '../components/finance/KpiCard';
import { Panel } from '../components/ui/Panel';
import { fm } from '../lib/format';
import { currentMonthKey, fmMonthKey, toIso, makeDate } from '../lib/date';
import { bookingsForMonth, nextZahltag } from '../lib/bookings';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const accounts  = useAccountsStore((s) => s.accounts);
  const bookings = useTransactionsStore((s) => s.bookings);
  const posten   = useTransactionsStore((s) => s.posten);
  const zahltag   = useSettingsStore((s) => s.settings.zahltag);

  const mk        = currentMonthKey();
  const monthLabel = fmMonthKey(`${mk}-01`);

  const totalBalance = useMemo(() => selectTotalBalance(accounts), [accounts]);

  const monthBookings = useMemo(() => bookingsForMonth(bookings, mk), [bookings, mk]);

  const einnahmen = useMemo(
    () => monthBookings.filter((b) => b.type === 'einnahme').reduce((s, b) => s + b.amount, 0),
    [monthBookings],
  );

  const ausgaben = useMemo(
    () => monthBookings.filter((b) => b.type === 'ausgabe').reduce((s, b) => s + b.amount, 0),
    [monthBookings],
  );

  const netto = einnahmen - ausgaben;

  // Cockpit — fällige Buchungen bis zum nächsten Zahltag
  const today = toIso(new Date());
  const zahltagDate = nextZahltag(zahltag);
  const dueItems = useMemo(
    () =>
      bookings
        .filter((b) => {
          if (b.status === 'ausgesetzt' || b.status === 'beglichen' || b.status === 'gebucht') return false;
          if (b.type !== 'ausgabe') return false;
          return b.date >= today && b.date <= zahltagDate;
        })
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 8),
    [bookings, today, zahltagDate],
  );

  return (
    <div className={styles.page}>
      {/* KPI Strip */}
      <div className={styles.kpiRow}>
        <KpiCard
          label="Gesamtvermögen"
          value={totalBalance}
          icon={<Wallet size={16} />}
          size="lg"
        />
        <KpiCard
          label={`Einnahmen ${monthLabel}`}
          value={einnahmen}
          icon={<TrendingUp size={16} />}
          colored
        />
        <KpiCard
          label={`Ausgaben ${monthLabel}`}
          value={ausgaben}
          icon={<TrendingDown size={16} />}
          colored
        />
        <KpiCard
          label="Nettosaldo"
          value={netto}
          icon={<ArrowLeftRight size={16} />}
          colored
          showSign
        />
      </div>

      <div className={styles.grid}>
        {/* Konten */}
        <Panel className={styles.accountsPanel}>
          <h2 className={styles.panelTitle}>Konten</h2>
          {accounts.length === 0 ? (
            <p className={styles.empty}>Noch keine Konten angelegt.</p>
          ) : (
            <div className={styles.accountList}>
              {accounts.filter((a) => a.include).map((acc) => (
                <div key={acc.id} className={styles.accRow}>
                  <div
                    className={styles.accDot}
                    style={{ background: acc.color }}
                  />
                  <span className={styles.accLabel}>{acc.label}</span>
                  <span className={styles.accBalance}>{fm(acc.balance)}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Cockpit — Zahlungsübersicht */}
        <Panel className={styles.cockpit}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Zahlungsübersicht</h2>
            <span className={styles.panelSub}>
              <Calendar size={13} /> bis Zahltag {makeDate(
                new Date().getFullYear(),
                new Date().getMonth() + 1,
                zahltag,
              ).split('-').reverse().join('.')}
            </span>
          </div>
          {dueItems.length === 0 ? (
            <p className={styles.empty}>Keine fälligen Zahlungen.</p>
          ) : (
            <div className={styles.dueList}>
              {dueItems.map((b) => {
                const [, , day] = b.date.split('-');
                const isToday   = b.date === today;
                return (
                  <div key={b.id} className={[styles.dueRow, isToday ? styles.dueToday : ''].join(' ')}>
                    <span className={styles.dueDay}>{isToday ? 'Heute' : day}</span>
                    <span className={styles.dueName}>{b.name}</span>
                    <span className={styles.dueAmount}>- {fm(b.amount)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        {/* Aktive Posten Zusammenfassung */}
        <Panel className={styles.postenPanel}>
          <h2 className={styles.panelTitle}>Festposten</h2>
          {posten.length === 0 ? (
            <p className={styles.empty}>Noch keine Posten angelegt.</p>
          ) : (
            <div className={styles.postenList}>
              {posten.slice(0, 6).map((p) => (
                <div key={p.id} className={styles.postenRow}>
                  <span className={[styles.postenType, p.type === 'einnahme' ? styles.income : styles.expense].join(' ')}>
                    {p.type === 'einnahme' ? '+' : '−'}
                  </span>
                  <span className={styles.postenName}>{p.name}</span>
                  <span className={styles.postenAmount}>{fm(p.amount)}</span>
                </div>
              ))}
              {posten.length > 6 && (
                <p className={styles.moreHint}>+{posten.length - 6} weitere</p>
              )}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
