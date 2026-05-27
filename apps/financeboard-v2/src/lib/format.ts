const euroFmt = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formatiert Betrag MIT " €" — niemals danach noch "€" ergänzen */
export function fm(value: number, showSign = false): string {
  const formatted = euroFmt.format(Math.abs(value));
  if (showSign && value > 0) return `+${formatted} €`;
  if (value < 0) return `-${formatted} €`;
  return `${formatted} €`;
}

/** Formatiert Betrag OHNE " €" */
export function fmShort(value: number): string {
  return euroFmt.format(value);
}

/** Prozentzahl mit 1 Nachkommastelle */
export function pp(value: number): string {
  return `${value.toFixed(1)} %`;
}

/** Datum "2025-01-15" → "15.01.2025" */
export function fmDate(iso: string): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

/** Datum "2025-01-15" → "Jan 2025" */
export function fmMonth(iso: string): string {
  if (!iso) return '—';
  const date = new Date(iso + 'T00:00:00');
  return date.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' });
}

/** HTML-sicheres Escaping */
export function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Generiert eine ID mit Prefix — "acc_a1b2c3" */
export function genId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Durchschnittlicher Monatsbetrag je nach Intervall */
export function avgMonthly(amount: number, interval: string): number {
  switch (interval) {
    case 'monatl.':    return amount;
    case 'viertelj.':  return amount / 3;
    case 'halbjährl.': return amount / 6;
    case 'jährl.':     return amount / 12;
    case 'einmalig':   return amount / 12;
    default:           return amount;
  }
}

/** IBAN letzte 4 Zeichen */
export function ibanLast4(iban: string): string {
  return iban ? `•• ${iban.slice(-4)}` : '—';
}

/** Kürzt langen Text mit Ellipsis */
export function truncate(text: string, max = 40): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
