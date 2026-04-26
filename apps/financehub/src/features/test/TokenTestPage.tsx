// Nur für lokale Entwicklung — zeigt alle Design-Tokens + Komponenten
// Route: /test/tokens

import { useState } from 'react'
import {
  Palette, TextAa, Rows, SquaresFour, Sun, Moon,
  ArrowRight, Trash, Plus, CircleNotch,
  ChartLine, CreditCard, ArrowsLeftRight, DotsThree,
  Spinner, CheckCircle, MagnifyingGlass, Bell,
  Wallet, ChartBar, Gear,
  Info, SlidersHorizontal,
  Tag, FolderOpen, PencilSimple, Download,
  House, Flag,
} from '@phosphor-icons/react'

import { applyTheme }  from '../../utils/theme'
import { Button }      from '../../shared/components/Button/Button'
import { Card }        from '../../shared/components/Card/Card'
import { Skeleton }    from '../../shared/components/Skeleton/Skeleton'
import { ProgressBar } from '../../shared/components/ProgressBar/ProgressBar'
import { Divider }     from '../../shared/components/Divider/Divider'
import { Badge }       from '../../shared/components/Badge/Badge'
import { Avatar }      from '../../shared/components/Avatar/Avatar'
import { Input }       from '../../shared/components/Input/Input'
import { Toggle }      from '../../shared/components/Toggle/Toggle'
import { Alert }       from '../../shared/components/Alert/Alert'
import { Toolbar }     from '../../shared/components/Toolbar/Toolbar'
import { TabBar }      from '../../shared/components/TabBar/TabBar'
import { Aside }       from '../../shared/components/Aside/Aside'
import { Stat }        from '../../shared/components/Stat/Stat'
import { Checkbox }    from '../../shared/components/Checkbox/Checkbox'
import { RadioGroup }  from '../../shared/components/RadioGroup/RadioGroup'
import { Chip }        from '../../shared/components/Chip/Chip'
import { EmptyState }  from '../../shared/components/EmptyState/EmptyState'
import { Select }      from '../../shared/components/Select/Select'
import { Dropdown }    from '../../shared/components/Dropdown/Dropdown'
import { Textarea }    from '../../shared/components/Textarea/Textarea'
import { Modal }       from '../../shared/components/Modal/Modal'
import { useToast }    from '../../shared/components/Toast/ToastContext'
import { BottomNav }   from '../../shared/components/BottomNav/BottomNav'

// ---------------------------------------------------------------------------
// Hilfselement: Abschnitts-Label
// ---------------------------------------------------------------------------
function SL({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
      {icon}
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--cs-text-3)' }}>
        {label}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Theme-Klassen (nutzt applyTheme aus utils/theme.ts — mit View Transition!)
// ---------------------------------------------------------------------------
const THEMES = [
  { id: 'light',     label: 'Gold Light' },
  { id: 'dark',      label: 'Dark' },
  { id: 'ocean',     label: 'Ocean' },
  { id: 'forest',    label: 'Forest' },
  { id: 'rose',      label: 'Rose' },
  { id: 'midnight',  label: 'Midnight' },
]

// ---------------------------------------------------------------------------
// Inner component: needs ToastProvider in tree
// ---------------------------------------------------------------------------
function ToastDemo() {
  const { toast } = useToast()
  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      <Button variant="secondary" size="sm" iconLeft={<Info size={13} weight="fill" />}
        onClick={() => toast({ variant: 'info', title: 'Sync gestartet', description: 'Konten werden synchronisiert...' })}>
        Info
      </Button>
      <Button variant="secondary" size="sm" iconLeft={<CheckCircle size={13} weight="fill" />}
        onClick={() => toast({ variant: 'success', title: 'Gespeichert', description: 'Änderungen wurden erfolgreich gespeichert.' })}>
        Success
      </Button>
      <Button variant="secondary" size="sm" iconLeft={<Flag size={13} weight="fill" />}
        onClick={() => toast({ variant: 'warning', title: 'Budget-Warnung', description: '87% des Monatsbudgets aufgebraucht.' })}>
        Warning
      </Button>
      <Button variant="danger" size="sm"
        onClick={() => toast({ variant: 'error', title: 'Verbindung getrennt', description: 'Sparkasse konnte nicht erreicht werden.' })}>
        Error
      </Button>
      <Button variant="ghost" size="sm"
        onClick={() => toast({ variant: 'info', title: 'Dauerhaft', duration: 0, description: 'Kein Auto-Close. Manuell schließen.' })}>
        Kein Auto-Close
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------
export default function TokenTestPage() {
  const [tab, setTab]             = useState('overview')
  const [toggle1, setToggle1]     = useState(true)
  const [toggle2, setToggle2]     = useState(false)
  const [toggle3, setToggle3]     = useState(true)
  const [searchVal, setSearchVal] = useState('')
  const [asideOpen, setAsideOpen] = useState(false)

  // New state
  const [check1, setCheck1]       = useState(true)
  const [check2, setCheck2]       = useState(false)
  const [check3, setCheck3]       = useState(false)
  const [radioVal, setRadioVal]   = useState('email')
  const [selectVal, setSelectVal] = useState('monthly')
  const [textareaVal, setTextareaVal] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [bottomActive, setBottomActive] = useState('dashboard')
  const [chips, setChips]         = useState(['Einnahmen', 'Ausgaben', 'Sparziele'])
  const [asideOpen2, setAsideOpen2] = useState(false)

  return (
    <div style={{ background: 'var(--cs-bg)', minHeight: '100vh', fontFamily: 'var(--font-body)', paddingBottom: '120px' }}>

      {/* ================================================================
          TOOLBAR — sticky page header
      ================================================================ */}
      <Toolbar
        title="Design System"
        subtitle="Tokens · Komponenten · Themes"
        sticky
        actions={
          <>
            <Button variant="ghost" size="sm" iconOnly iconLeft={<SlidersHorizontal size={14} weight="bold" />}
              onClick={() => setAsideOpen(true)} />
            <Button variant="secondary" size="sm" iconLeft={<Bell size={13} weight="fill" />} onClick={() => setAsideOpen2(true)}>Meldungen</Button>
          </>
        }
        tabs={
          <TabBar
            tabs={[
              { id: 'overview', label: 'Übersicht', icon: <Palette size={13} weight="fill" /> },
              { id: 'forms',    label: 'Formulare', icon: <TextAa size={13} weight="fill" /> },
              { id: 'nav',      label: 'Navigation', icon: <Rows size={13} weight="fill" />, badge: 3 },
              { id: 'feedback', label: 'Feedback', icon: <Info size={13} weight="fill" /> },
            ]}
            active={tab}
            onChange={setTab}
            variant="underline"
          />
        }
      />

      {/* ================================================================
          ASIDE — side panel demo
      ================================================================ */}
      <Aside open={asideOpen} onClose={() => setAsideOpen(false)} title="Theme-Switcher">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--cs-text-3)', margin: 0 }}>
            Jeder Wechsel löst eine <strong style={{ color: 'var(--cs-gold)' }}>diagonale Wipe-Animation</strong> aus (View Transitions API). Probiere Hell↔Dunkel!
          </p>
          {THEMES.map(t => (
            <Button key={t.id} variant="secondary" size="sm" onClick={() => applyTheme(t.id as Parameters<typeof applyTheme>[0])}>
              {t.label}
            </Button>
          ))}
        </div>
      </Aside>

      {/* Zweites Aside: Notifications-Demo (rechts) */}
      <Aside open={asideOpen2} onClose={() => setAsideOpen2(false)} title="Benachrichtigungen" side="right">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { title: 'Neue Transaktion', desc: '€-89,40 — REWE Markt', time: 'Jetzt', dot: 'positive' },
            { title: 'Budget-Warnung', desc: 'Restaurants: 87% aufgebraucht', time: '2 Min.', dot: 'warning' },
            { title: 'Sync abgeschlossen', desc: '4 Konten aktualisiert', time: '5 Min.', dot: 'info' },
            { title: 'Sparkasse verbunden', desc: 'finAPI: Verbindung erfolgreich', time: 'Heute', dot: 'positive' },
          ].map((n, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px', background: 'var(--cs-surface-2)', borderRadius: 'var(--radius-md)' }}>
              <Badge dot variant={n.dot as 'positive' | 'warning' | 'info'} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 'var(--fw-semibold)', fontSize: 'var(--text-sm)', color: 'var(--cs-text)', margin: '0 0 2px' }}>{n.title}</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--cs-text-3)', margin: 0 }}>{n.desc}</p>
              </div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--cs-text-3)', flexShrink: 0 }}>{n.time}</span>
            </div>
          ))}
        </div>
      </Aside>

      {/* ================================================================
          HAUPT-INHALT
      ================================================================ */}
      <div style={{ padding: '32px' }}>

        {/* ============================================================
            FARBEN + TYPOGRAFIE + SPACING (immer sichtbar)
        ============================================================ */}
        <section style={{ marginBottom: '48px' }}>
          <SL icon={<Palette size={14} weight="fill" color="var(--cs-text-3)" />} label="Farben" />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {([
              ['cs-bg', 'BG'], ['cs-surface', 'Surface'], ['cs-surface-2', 'Surface 2'],
              ['cs-surface-3', 'Surface 3'], ['cs-neutral', 'Neutral'], ['cs-anthracite', 'Anthrazit'],
              ['cs-gold', 'Accent'], ['cs-positive', 'Positiv'], ['cs-negative', 'Negativ'],
              ['cs-warning', 'Warning'], ['cs-info', 'Info'],
            ] as [string, string][]).map(([token, label]) => (
              <div key={token} style={{ textAlign: 'center' }}>
                <div style={{ width: 72, height: 56, background: `var(--${token})`, border: '1px solid var(--cs-border)', borderRadius: '8px', marginBottom: '6px' }} />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--cs-text-3)', fontFamily: 'var(--font-mono)' }}>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <Divider variant="gold" spacing="lg" />

        {/* ============================================================
            BADGES + AVATARE
        ============================================================ */}
        <section style={{ marginBottom: '48px' }}>
          <SL icon={<SquaresFour size={14} weight="fill" color="var(--cs-text-3)" />} label="Badge · Avatar" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--cs-text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', margin: '0 0 10px' }}>Badge-Varianten</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <Badge variant="default">Default</Badge>
                <Badge variant="gold">Gold</Badge>
                <Badge variant="positive">+3.2%</Badge>
                <Badge variant="negative">-1.8%</Badge>
                <Badge variant="warning">Bald fällig</Badge>
                <Badge variant="info">Sync</Badge>
                <Badge variant="neutral">Archiv</Badge>
              </div>
            </div>

            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--cs-text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', margin: '0 0 10px' }}>Status-Dots</p>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-sm)', color: 'var(--cs-text-2)' }}>
                  <Badge dot variant="positive" />Online
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-sm)', color: 'var(--cs-text-2)' }}>
                  <Badge dot variant="negative" />Fehler
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-sm)', color: 'var(--cs-text-2)' }}>
                  <Badge dot variant="warning" />Wartung
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-sm)', color: 'var(--cs-text-2)' }}>
                  <Badge dot variant="neutral" />Inaktiv
                </span>
              </div>
            </div>

            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--cs-text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', margin: '0 0 10px' }}>Avatar — Größen + Status</p>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <Avatar name="Chris Schubert" size="xs" status="online" />
                <Avatar name="Anna Müller" size="sm" status="away" />
                <Avatar name="Lars Bergmann" size="md" status="offline" />
                <Avatar name="Sophie Wagner" size="lg" />
                <Avatar name="Max Koch" size="xl" />
                <Avatar src="https://i.pravatar.cc/64" name="Foto" size="md" status="online" />
                <Avatar name="?" size="md" shape="rounded" />
              </div>
            </div>

          </div>
        </section>

        <Divider variant="neutral" spacing="lg" />

        {/* ============================================================
            STAT — Kennzahlen / Metriken
        ============================================================ */}
        <section style={{ marginBottom: '48px' }}>
          <SL icon={<ChartBar size={14} weight="fill" color="var(--cs-text-3)" />} label="Stat · Kennzahlen" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))', gap: '16px' }}>

            <Card variant="titled" title="Kontostand">
              <Stat label="Gesamt" value="€24.890" trend={3.2} trendLabel="gg. Vormonat" size="lg" />
            </Card>

            <Card variant="default">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Stat label="Einnahmen" value="€4.200" trend={5.1} size="md" />
                <Divider variant="subtle" />
                <Stat label="Ausgaben" value="€3.180" trend={-2.3} size="md" />
              </div>
            </Card>

            <Card variant="default">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Stat label="Sparquote" value="24.3%" trend={0} trendLabel="stabil" size="md" />
                <Divider variant="subtle" />
                <Stat label="Offene Posten" value="3" size="sm" />
              </div>
            </Card>

          </div>
        </section>

        <Divider variant="neutral" spacing="lg" />

        {/* ============================================================
            CHIP — Filter-Tags
        ============================================================ */}
        <section style={{ marginBottom: '48px' }}>
          <SL icon={<Tag size={14} weight="fill" color="var(--cs-text-3)" />} label="Chip · Filter-Tags" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--cs-text-3)', fontFamily: 'var(--font-mono)', margin: '0 0 10px' }}>Varianten</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Chip label="Default" />
                <Chip label="Gold" variant="gold" icon={<Wallet size={11} weight="fill" />} />
                <Chip label="Positiv" variant="positive" />
                <Chip label="Negativ" variant="negative" />
                <Chip label="Warnung" variant="warning" />
                <Chip label="Info" variant="info" />
              </div>
            </div>

            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--cs-text-3)', fontFamily: 'var(--font-mono)', margin: '0 0 10px' }}>Dynamisch entfernbar</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {chips.map(c => (
                  <Chip key={c} label={c} variant="default"
                    onRemove={() => setChips(prev => prev.filter(x => x !== c))} />
                ))}
                {chips.length === 0 && (
                  <Button variant="ghost" size="sm" iconLeft={<Plus size={12} weight="bold" />}
                    onClick={() => setChips(['Einnahmen', 'Ausgaben', 'Sparziele'])}>
                    Zurücksetzen
                  </Button>
                )}
              </div>
            </div>

            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--cs-text-3)', fontFamily: 'var(--font-mono)', margin: '0 0 10px' }}>Klickbar (toggle selected)</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Chip label="Monat" variant="gold" selected onClick={() => {}} />
                <Chip label="Quartal" onClick={() => {}} />
                <Chip label="Jahr" onClick={() => {}} />
                <Chip label="Deaktiviert" disabled />
              </div>
            </div>
          </div>
        </section>

        <Divider variant="neutral" spacing="lg" />

        {/* ============================================================
            INPUTS + TOGGLES (Formulare)
        ============================================================ */}
        <section style={{ marginBottom: '48px' }}>
          <SL icon={<TextAa size={14} weight="fill" color="var(--cs-text-3)" />} label="Formulare · Input · Toggle" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '24px' }}>

            <Card variant="titled" title="Input-Varianten">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Input label="E-Mail" placeholder="deine@email.de" type="email" />
                <Input label="Passwort" placeholder="••••••••" type="password" />
                <Input
                  label="Suche"
                  placeholder="Transaktionen suchen..."
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  leading={<MagnifyingGlass size={14} />}
                  clearable
                  onClear={() => setSearchVal('')}
                />
                <Input label="Mit Fehler" placeholder="IBAN" error="Ungültige IBAN-Nummer" />
                <Input label="Deaktiviert" placeholder="Nicht änderbar" disabled />
              </div>
            </Card>

            <Card variant="titled" title="Toggle / Switch">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Toggle
                  checked={toggle1}
                  onChange={setToggle1}
                  label="Benachrichtigungen"
                  description="Push-Nachrichten bei neuen Transaktionen"
                />
                <Toggle
                  checked={toggle2}
                  onChange={setToggle2}
                  label="2FA aktiviert"
                  description="TOTP für jeden Login erforderlich"
                  variant="positive"
                />
                <Toggle
                  checked={toggle3}
                  onChange={setToggle3}
                  label="Dark Mode"
                  size="sm"
                />
                <Toggle
                  checked={false}
                  onChange={() => {}}
                  label="Deaktiviert"
                  disabled
                />
              </div>
            </Card>

            <Card variant="titled" title="Checkbox">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Checkbox
                  checked={check1}
                  onChange={setCheck1}
                  label="E-Mail-Benachrichtigungen"
                  description="Täglich um 08:00 Uhr"
                />
                <Checkbox
                  checked={check2}
                  onChange={setCheck2}
                  label="Push-Nachrichten"
                  description="Sofort bei Transaktionen"
                />
                <Checkbox
                  checked={check3}
                  onChange={setCheck3}
                  label="Marketing-E-Mails"
                  indeterminate
                />
                <Checkbox
                  checked={false}
                  onChange={() => {}}
                  label="Deaktiviert"
                  disabled
                />
              </div>
            </Card>

            <Card variant="titled" title="RadioGroup">
              <RadioGroup
                name="notification-channel"
                label="Benachrichtigungskanal"
                value={radioVal}
                onChange={setRadioVal}
                options={[
                  { value: 'email', label: 'E-Mail', description: 'An schubertchris8@gmail.com' },
                  { value: 'push',  label: 'Push-Nachricht', description: 'Browser oder App' },
                  { value: 'none',  label: 'Keine', description: 'Nur in der App anzeigen' },
                  { value: 'sms',   label: 'SMS', disabled: true },
                ]}
              />
            </Card>

            <Card variant="titled" title="Select">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Select
                  label="Berichtsintervall"
                  value={selectVal}
                  onChange={setSelectVal}
                  options={[
                    { value: 'daily',   label: 'Täglich' },
                    { value: 'weekly',  label: 'Wöchentlich' },
                    { value: 'monthly', label: 'Monatlich' },
                    { value: 'yearly',  label: 'Jährlich' },
                  ]}
                />
                <Select
                  label="Kategorie"
                  placeholder="Bitte wählen..."
                  value=""
                  onChange={() => {}}
                  options={[
                    { value: 'food', label: 'Lebensmittel' },
                    { value: 'transport', label: 'Transport' },
                    { value: 'entertainment', label: 'Unterhaltung' },
                  ]}
                  size="sm"
                />
                <Select
                  label="Mit Fehler"
                  value=""
                  onChange={() => {}}
                  options={[{ value: 'a', label: 'Option A' }]}
                  error="Pflichtfeld"
                />
              </div>
            </Card>

            <Card variant="titled" title="Textarea">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Textarea
                  label="Notiz"
                  placeholder="Transaktionsnotiz eingeben..."
                  value={textareaVal}
                  onChange={e => setTextareaVal(e.target.value)}
                  helper="Max. 500 Zeichen"
                />
                <Textarea
                  label="Fehlerzustand"
                  placeholder="Pflichtfeld..."
                  error="Dieses Feld ist erforderlich."
                  resize="none"
                />
                <Textarea
                  label="Deaktiviert"
                  defaultValue="Inhalt nicht änderbar"
                  disabled
                  resize="none"
                />
              </div>
            </Card>

          </div>
        </section>

        <Divider variant="neutral" spacing="lg" />

        {/* ============================================================
            DROPDOWN + TOOLTIP
        ============================================================ */}
        <section style={{ marginBottom: '48px' }}>
          <SL icon={<DotsThree size={14} weight="fill" color="var(--cs-text-3)" />} label="Dropdown · Tooltip" />
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

            {/* Dropdown */}
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--cs-text-3)', fontFamily: 'var(--font-mono)', margin: '0 0 10px' }}>Dropdown-Menü</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Dropdown
                  trigger={<Button variant="secondary" size="sm" iconRight={<DotsThree size={14} weight="bold" />}>Aktionen</Button>}
                  onSelect={(id) => console.log('selected:', id)}
                  items={[
                    { id: 'edit',     label: 'Bearbeiten',  icon: <PencilSimple size={13} /> },
                    { id: 'download', label: 'Exportieren', icon: <Download size={13} /> },
                    { id: 'dup',      label: 'Duplizieren', icon: <ArrowsLeftRight size={13} /> },
                    { id: 'sep',      label: '',             separator: true },
                    { id: 'delete',   label: 'Löschen',     icon: <Trash size={13} />, variant: 'danger' },
                  ]}
                />
                <Dropdown
                  trigger={<Button variant="ghost" size="sm" iconOnly iconLeft={<DotsThree size={16} weight="bold" />} />}
                  onSelect={() => {}}
                  placement="bottom-start"
                  items={[
                    { id: 'mark',    label: 'Als gelesen markieren', icon: <CheckCircle size={13} /> },
                    { id: 'archive', label: 'Archivieren',           icon: <FolderOpen size={13} /> },
                    { id: 'disable', label: 'Deaktiviert',           icon: <Info size={13} />, disabled: true },
                  ]}
                />
              </div>
            </div>

            {/* Tooltip */}
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--cs-text-3)', fontFamily: 'var(--font-mono)', margin: '0 0 10px' }}>CSS-Tooltip (data-tooltip)</p>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingTop: '8px', paddingBottom: '8px' }}>
                <span
                  data-tooltip="Konto hinzufügen"
                  style={{ position: 'relative', display: 'inline-flex' }}
                >
                  <Button variant="ghost" size="sm" iconOnly iconLeft={<Plus size={14} weight="bold" />} />
                </span>
                <span
                  data-tooltip="Einstellungen öffnen"
                  data-tooltip-pos="right"
                  style={{ position: 'relative', display: 'inline-flex' }}
                >
                  <Button variant="ghost" size="sm" iconOnly iconLeft={<Gear size={14} weight="bold" />} />
                </span>
                <span
                  data-tooltip="Löschen nicht möglich"
                  data-tooltip-pos="bottom"
                  style={{ position: 'relative', display: 'inline-flex' }}
                >
                  <Button variant="ghost" size="sm" iconOnly iconLeft={<Trash size={14} weight="bold" />} disabled />
                </span>
                <Badge variant="gold" data-tooltip="Beta-Feature">Beta</Badge>
              </div>
            </div>

          </div>
        </section>

        <Divider variant="neutral" spacing="lg" />

        {/* ============================================================
            ALERTS / FEEDBACK
        ============================================================ */}
        <section style={{ marginBottom: '48px' }}>
          <SL icon={<Info size={14} weight="fill" color="var(--cs-text-3)" />} label="Alert · Feedback" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '640px' }}>
            <Alert variant="info" title="Sync läuft">
              Deine Konten werden gerade synchronisiert. Neue Transaktionen erscheinen in wenigen Sekunden.
            </Alert>
            <Alert variant="success" title="Zahlung erfolgreich">
              €2.400,00 wurden auf dein Tagesgeldkonto überwiesen.
            </Alert>
            <Alert variant="warning" title="Budget fast erreicht" dismissible onDismiss={() => {}}>
              Du hast 87% deines Monatsbudgets für Restaurants aufgebraucht.
            </Alert>
            <Alert variant="error" title="Verbindung unterbrochen" dismissible onDismiss={() => {}}>
              Die Verbindung zur Sparkasse konnte nicht hergestellt werden. Bitte erneut versuchen.
            </Alert>
          </div>
        </section>

        <Divider variant="neutral" spacing="lg" />

        {/* ============================================================
            TOAST
        ============================================================ */}
        <section style={{ marginBottom: '48px' }}>
          <SL icon={<Bell size={14} weight="fill" color="var(--cs-text-3)" />} label="Toast · Notifications" />
          <Card variant="titled" title="Toast-Varianten auslösen">
            <ToastDemo />
          </Card>
        </section>

        <Divider variant="neutral" spacing="lg" />

        {/* ============================================================
            EMPTY STATE
        ============================================================ */}
        <section style={{ marginBottom: '48px' }}>
          <SL icon={<FolderOpen size={14} weight="fill" color="var(--cs-text-3)" />} label="EmptyState · Kein-Daten-Screen" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '16px' }}>

            <Card variant="titled" title="Standard">
              <EmptyState
                icon={<Wallet size={28} weight="thin" />}
                title="Keine Konten verknüpft"
                description="Verbinde dein erstes Konto über finAPI und sieh deine Finanzen in Echtzeit."
                action={<Button variant="primary" size="sm" iconLeft={<Plus size={13} weight="bold" />}>Konto hinzufügen</Button>}
              />
            </Card>

            <Card variant="titled" title="Compact">
              <EmptyState
                compact
                icon={<ChartLine size={22} weight="thin" />}
                title="Keine Transaktionen"
                description="Für den gewählten Zeitraum wurden keine Buchungen gefunden."
                action={<Button variant="ghost" size="sm">Filter zurücksetzen</Button>}
              />
            </Card>

          </div>
        </section>

        <Divider variant="neutral" spacing="lg" />

        {/* ============================================================
            MODAL
        ============================================================ */}
        <section style={{ marginBottom: '48px' }}>
          <SL icon={<SquaresFour size={14} weight="fill" color="var(--cs-text-3)" />} label="Modal · Dialog" />
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button variant="primary" iconLeft={<Plus size={13} weight="bold" />}
              onClick={() => setModalOpen(true)}>
              Modal öffnen
            </Button>
          </div>

          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Transaktion hinzufügen"
            size="md"
            footer={
              <>
                <Button variant="ghost" onClick={() => setModalOpen(false)}>Abbrechen</Button>
                <Button variant="primary" iconRight={<ArrowRight size={13} weight="bold" />}
                  onClick={() => setModalOpen(false)}>
                  Speichern
                </Button>
              </>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input label="Bezeichnung" placeholder="z.B. Miete Juli" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Input label="Betrag" placeholder="0,00" type="number" />
                <Select
                  label="Typ"
                  value="expense"
                  onChange={() => {}}
                  options={[
                    { value: 'expense', label: 'Ausgabe' },
                    { value: 'income',  label: 'Einnahme' },
                  ]}
                />
              </div>
              <Textarea label="Notiz" placeholder="Optional..." resize="none" />
            </div>
          </Modal>
        </section>

        <Divider variant="neutral" spacing="lg" />

        {/* ============================================================
            CARDS (5 Varianten)
        ============================================================ */}
        <section style={{ marginBottom: '48px' }}>
          <SL icon={<SquaresFour size={14} weight="fill" color="var(--cs-text-3)" />} label="Cards · 5 Varianten" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))', gap: '16px' }}>

            <Card variant="default">
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--cs-text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px' }}>Default</p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--cs-text)', margin: 0 }}>Einfache Karte mit Surface-Hintergrund.</p>
            </Card>

            <Card variant="titled" title="Konto-Übersicht" icon={<CreditCard size={14} weight="fill" />}
              action={<DotsThree size={16} weight="bold" />}
              footer={<span style={{ fontSize: 'var(--text-xs)', color: 'var(--cs-text-3)', fontFamily: 'var(--font-mono)' }}>Zuletzt sync: jetzt</span>}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xl)', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--cs-text)', margin: '0 0 4px' }}>€12.450,00</p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--cs-text-3)', margin: 0 }}>Girokonto · Sparkasse</p>
            </Card>

            <Card variant="elevated">
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--cs-text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px' }}>Elevated</p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--cs-text)', margin: 0 }}>Dunkleres Surface-2, tieferer Schatten.</p>
            </Card>

            <Card variant="glass" title="Glass Card" icon={<ChartLine size={14} weight="fill" />}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--cs-text)', margin: 0 }}>Backdrop-Blur + Vibrancy. Funktioniert auf farbigen Hintergründen.</p>
            </Card>

            <Card variant="gold" title="Featured" icon={<CheckCircle size={14} weight="fill" />}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--cs-text)', margin: 0 }}>Gold-Glow-Rahmen. Subtiler Licht-Effekt darunter (::after).</p>
            </Card>

            <Card variant="titled" title="Klickbar" icon={<ArrowsLeftRight size={14} weight="fill" />} onClick={() => {}}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--cs-text-2)', margin: 0 }}>Hover: leichtes Anheben + tieferer Schatten.</p>
            </Card>

          </div>
        </section>

        <Divider variant="neutral" spacing="lg" />

        {/* ============================================================
            SKELETON + PROGRESS
        ============================================================ */}
        <section style={{ marginBottom: '48px' }}>
          <SL icon={<Spinner size={14} weight="fill" color="var(--cs-text-3)" />} label="Skeleton · ProgressBar" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>

            <Card variant="titled" title="Lade-Zustand">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Skeleton variant="circle" width={40} height={40} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Skeleton variant="text" width="70%" />
                    <Skeleton variant="text" width="40%" />
                  </div>
                </div>
                <Skeleton variant="rect" height={64} />
                <Skeleton variant="text" lines={3} />
              </div>
            </Card>

            <Card variant="titled" title="Fortschritt · Sparziele">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <ProgressBar value={72}   max={100} variant="default"  size="md" label="Notfallfonds" showValue />
                <ProgressBar value={58}   max={100} variant="positive" size="md" label="Urlaub 2026" showValue />
                <ProgressBar value={89}   max={100} variant="warning"  size="sm" label="Budget" showValue />
                <ProgressBar value={0}    max={100} variant="info"     size="md" label="Synchronisiere..." indeterminate />
              </div>
            </Card>

          </div>
        </section>

        <Divider variant="neutral" spacing="lg" />

        {/* ============================================================
            DIVIDERS
        ============================================================ */}
        <section style={{ marginBottom: '48px' }}>
          <SL icon={<Rows size={14} weight="fill" color="var(--cs-text-3)" />} label="Divider · Before/After-Effekte" />
          <Card variant="titled" title="Alle Varianten">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--cs-text-3)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>subtle</span>
              <Divider variant="subtle" />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--cs-text-3)', fontFamily: 'var(--font-mono)', margin: '12px 0 6px' }}>neutral</span>
              <Divider variant="neutral" />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--cs-text-3)', fontFamily: 'var(--font-mono)', margin: '12px 0 6px' }}>gold (Gradient-Fade)</span>
              <Divider variant="gold" />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--cs-text-3)', fontFamily: 'var(--font-mono)', margin: '12px 0 6px' }}>labeled neutral (::before + ::after)</span>
              <Divider variant="neutral" label="Abschnitt" />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--cs-text-3)', fontFamily: 'var(--font-mono)', margin: '12px 0 6px' }}>labeled gold</span>
              <Divider variant="gold" label="Highlights" />
            </div>
          </Card>
        </section>

        <Divider variant="neutral" spacing="lg" />

        {/* ============================================================
            TABS
        ============================================================ */}
        <section style={{ marginBottom: '48px' }}>
          <SL icon={<Rows size={14} weight="fill" color="var(--cs-text-3)" />} label="TabBar · Navigation" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--cs-text-3)', fontFamily: 'var(--font-mono)', margin: '0 0 8px' }}>Underline-Stil (Standard)</p>
              <TabBar
                tabs={[
                  { id: 'dashboard',    label: 'Dashboard',   icon: <Wallet size={13} weight="fill" /> },
                  { id: 'transactions', label: 'Transaktionen', badge: 12 },
                  { id: 'analytics',   label: 'Analyse',      icon: <ChartBar size={13} weight="fill" /> },
                  { id: 'settings',    label: 'Einstellungen', icon: <Gear size={13} weight="fill" />, disabled: true },
                ]}
                active="dashboard"
                onChange={() => {}}
                variant="underline"
              />
            </div>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--cs-text-3)', fontFamily: 'var(--font-mono)', margin: '0 0 8px' }}>Pill-Stil</p>
              <TabBar
                tabs={[
                  { id: 'month',   label: 'Monat' },
                  { id: 'quarter', label: 'Quartal' },
                  { id: 'year',    label: 'Jahr' },
                ]}
                active="month"
                onChange={() => {}}
                variant="pill"
              />
            </div>
          </div>
        </section>

        <Divider variant="neutral" spacing="lg" />

        {/* ============================================================
            ASIDE — Side-Panel Demo
        ============================================================ */}
        <section style={{ marginBottom: '48px' }}>
          <SL icon={<SlidersHorizontal size={14} weight="fill" color="var(--cs-text-3)" />} label="Aside · Side-Panel" />
          <Card variant="titled" title="Side-Panel Varianten">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--cs-text-3)', margin: 0 }}>
                Das Aside gleitet von rechts oder links rein. Klick außerhalb schließt es (useClickOutside). Overlay + backdrop-blur. Probiere die beiden Trigger-Buttons oben in der Toolbar!
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Button variant="secondary" size="sm" iconLeft={<SlidersHorizontal size={13} weight="fill" />}
                  onClick={() => setAsideOpen(true)}>
                  Theme-Switcher (rechts)
                </Button>
                <Button variant="secondary" size="sm" iconLeft={<Bell size={13} weight="fill" />}
                  onClick={() => setAsideOpen2(true)}>
                  Benachrichtigungen (rechts)
                </Button>
              </div>
              <Alert variant="info" title="View Transition">
                Der Theme-Switcher nutzt <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85em' }}>document.startViewTransition()</code> — beobachte die diagonale Wipe-Animation beim Theme-Wechsel!
              </Alert>
            </div>
          </Card>
        </section>

        <Divider variant="neutral" spacing="lg" />

        {/* ============================================================
            BOTTOM NAV — Mobile Navigation
        ============================================================ */}
        <section style={{ marginBottom: '48px' }}>
          <SL icon={<House size={14} weight="fill" color="var(--cs-text-3)" />} label="BottomNav · Mobile Navigation" />
          <Card variant="titled" title="Preview (fixiert unten beim Scrollen)">
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--cs-text-3)', margin: '0 0 12px' }}>
              Die BottomNav ist unten auf der Seite fixiert (position: fixed). Ideal für mobile Ansichten.
              Aktiv: <strong style={{ color: 'var(--cs-gold)' }}>{bottomActive}</strong>
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {(['dashboard', 'transactions', 'analytics', 'settings'] as const).map(id => (
                <Button key={id} variant={bottomActive === id ? 'primary' : 'ghost'} size="sm"
                  onClick={() => setBottomActive(id)}>
                  {id}
                </Button>
              ))}
            </div>
            <Alert variant="info" title="Hinweis">
              Die BottomNav erscheint fixiert unten auf der Seite. Scrolle nach unten, um sie zu sehen.
            </Alert>
          </Card>
        </section>

        <Divider variant="neutral" spacing="lg" />

        {/* ============================================================
            BUTTONS
        ============================================================ */}
        <section style={{ marginBottom: '48px' }}>
          <SL icon={<CircleNotch size={14} weight="fill" color="var(--cs-text-3)" />} label="Buttons" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Button variant="primary">Primär</Button>
              <Button variant="secondary">Sekundär</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Gefahr</Button>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Button variant="primary" size="sm">Klein</Button>
              <Button variant="primary" size="md">Mittel</Button>
              <Button variant="primary" size="lg">Groß</Button>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Button variant="primary" iconRight={<ArrowRight size={13} weight="bold" />}>Weiter</Button>
              <Button variant="secondary" iconLeft={<Plus size={13} weight="bold" />}>Hinzufügen</Button>
              <Button variant="danger" iconLeft={<Trash size={13} weight="bold" />}>Löschen</Button>
              <Button variant="primary" loading>Laden</Button>
              <Button variant="primary" disabled>Deaktiviert</Button>
            </div>
          </div>
        </section>

        <Divider variant="neutral" spacing="lg" />

        {/* ============================================================
            THEME-TOGGLE (Footer)
        ============================================================ */}
        <section style={{ paddingBottom: '16px' }}>
          <SL icon={<Palette size={14} weight="fill" color="var(--cs-text-3)" />} label="Theme-System · 4 Accent-Themes + Light/Dark · Mit diagonalem Wipe!" />
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--cs-text-3)', fontFamily: 'var(--font-mono)', margin: '0 0 16px' }}>
            Jeder Klick löst <strong>document.startViewTransition()</strong> aus → diagonaler Pinsel-Wipe. Hell→Dunkel von oben-links, Dunkel→Hell von rechts-unten.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button variant="primary" iconLeft={<Sun size={13} weight="fill" />}
              onClick={() => applyTheme('light')}>Gold Light</Button>
            <Button variant="secondary" iconLeft={<Moon size={13} weight="fill" />}
              onClick={() => applyTheme('dark')}>Dark</Button>
            <Button variant="secondary"
              onClick={() => applyTheme('ocean')}>Ocean</Button>
            <Button variant="secondary"
              onClick={() => applyTheme('forest')}>Forest</Button>
            <Button variant="secondary"
              onClick={() => applyTheme('rose')}>Rose</Button>
            <Button variant="secondary" onClick={() => applyTheme('midnight')}>Midnight</Button>
            <Button variant="ghost" iconLeft={<SlidersHorizontal size={13} weight="fill" />}
              onClick={() => setAsideOpen(true)}>Panel</Button>
          </div>
        </section>

      </div>

      {/* ================================================================
          BOTTOM NAV — fixiert unten
      ================================================================ */}
      <BottomNav
        active={bottomActive}
        onChange={setBottomActive}
        items={[
          { id: 'dashboard',    label: 'Dashboard',    icon: <House size={20} weight="fill" />, },
          { id: 'transactions', label: 'Buchungen',    icon: <ArrowsLeftRight size={20} />, badge: 5 },
          { id: 'analytics',   label: 'Analyse',      icon: <ChartBar size={20} /> },
          { id: 'settings',    label: 'Einstellungen', icon: <Gear size={20} /> },
        ]}
      />

    </div>
  )
}
