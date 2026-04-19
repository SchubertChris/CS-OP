# Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** candlescope.de von Portfolio-Seite zu produktzentrierter Marketing-Site umbauen — Pill-Nav mit CS-Logo, neue FinancePage mit 8 Sektionen, kostenloser Download + Ko-fi, DSGVO-konform.

**Architecture:** Bestehende React 19 / Vite / Tailwind-Struktur bleibt unverändert. Neue Feature-Komponenten kommen in `src/components/finance/`. Soziale Links werden in `src/data/socials.ts` zentralisiert. FinancePage wird komplett neu strukturiert. Keine neuen Routen, keine Store-Änderungen.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Framer Motion v12, Lucide React (bereits installiert), React Router v7

---

## File Map

### Neu erstellen
| Datei | Zweck |
|-------|-------|
| `src/data/socials.ts` | Zentrale Social-Links — single source of truth |
| `src/components/finance/UspStrip.tsx` | 4 USP-Kacheln (Offline, Einmalig, Windows, Daten) |
| `src/components/finance/FeatureGrid.tsx` | 10-Modul-Grid mit Lucide Icons |
| `src/components/finance/DownloadCard.tsx` | Split-Card: Inhalte + Download + Ko-fi |
| `src/components/finance/FaqAccordion.tsx` | Accordion mit AnimatePresence |
| `src/components/finance/ScreenshotSlider.tsx` | Drag-Slider für App-Screenshots |

### Modifizieren
| Datei | Was ändert sich |
|-------|----------------|
| `src/components/layout/Header.tsx` | Pill-Nav + Logo tauschen + Download-CTA |
| `src/components/layout/Footer.tsx` | Community-Link + Discord via SOCIALS |
| `src/pages/FinancePage.tsx` | Komplett neu strukturiert (8 Sektionen) |
| `src/pages/DevPage.tsx` | FinanceBoard Tech-Tags korrigieren |
| `src/data/pages.ts` | Community Badge "Coming soon" → "Jetzt live" |
| `src/assets/images/CandleScopeLogo.png` | Neues Logo-Asset (FinanceBoard icon.png) |
| `public/favicon.png` | Gleiches Logo als Favicon |
| `index.html` | favicon href aktualisieren |

### Unverändert
- Alle anderen Seiten (About, Dev, Community, Contact — Inhalt bleibt)
- Admin Panel komplett
- Store / Page Builder
- Vercel-Konfiguration, DNS, Routing

---

## Task 1: `src/data/socials.ts` erstellen

**Files:**
- Create: `src/data/socials.ts`

- [ ] **Schritt 1: Datei anlegen**

```typescript
// src/data/socials.ts
export const SOCIALS = {
  discord:   'https://discord.gg/HRxbTW4ujT',
  github:    'https://github.com/SchubertChris',
  instagram: 'https://www.instagram.com/candlescope',
  kofi:      'https://ko-fi.com/candlescope',
  email:     'info@candlescope.de',
  calendly:  '',
} as const
```

> **Hinweis:** `discord` und `kofi` sind Platzhalter — vor Go-Live durch korrekte Werte ersetzen (Offene Fragen A + B aus dem Spec). `calendly` bleibt leer bis Link vorhanden.

- [ ] **Schritt 2: TypeScript prüfen**

```bash
cd "apps/frontend" && npx tsc --noEmit
```

Erwartung: keine Fehler.

- [ ] **Schritt 3: Commit**

```bash
git add src/data/socials.ts
git commit -m "feat: add central socials.ts — single source of truth for all links"
```

---

## Task 2: Footer — Community-Link + Discord fix

**Files:**
- Modify: `src/components/layout/Footer.tsx`

- [ ] **Schritt 1: Import + footerNav + Discord anpassen**

Ersetze die ersten ~15 Zeilen in `Footer.tsx`:

```typescript
import { Link } from 'react-router-dom'
import { Github, TrendingUp, Code2, User, MessageSquare, Mail, ExternalLink, Users } from 'lucide-react'
import csLogo from '../../assets/images/CandleScope.webp'
import { SOCIALS } from '../../data/socials'

const footerNav = [
  { to: '/finance',   label: 'Finance',           icon: <TrendingUp size={14} strokeWidth={1.5} /> },
  { to: '/dev',       label: 'Dev & Web-Projekte', icon: <Code2      size={14} strokeWidth={1.5} /> },
  { to: '/about',     label: 'About',              icon: <User       size={14} strokeWidth={1.5} /> },
  { to: '/community', label: 'Community',          icon: <Users      size={14} strokeWidth={1.5} /> },
  { to: '/contact',   label: 'Kontakt',            icon: <MessageSquare size={14} strokeWidth={1.5} /> },
]
```

- [ ] **Schritt 2: Discord-Link in den Social-Icons fixen**

Finde die Zeile `<a href="https://discord.gg/"` und ersetze:

```tsx
<a href={SOCIALS.discord} target="_blank" rel="noopener noreferrer"
  className="w-9 h-9 flex items-center justify-center rounded-full border border-[#ffffff]/8 text-[#9A9590] hover:text-[#C9A84C] hover:border-[#C9A84C]/30 transition-all duration-300" aria-label="Discord">
  <DiscordIcon />
</a>
```

- [ ] **Schritt 3: Build-Check**

```bash
npx tsc --noEmit
```

Erwartung: keine Fehler.

- [ ] **Schritt 4: Commit**

```bash
git add src/components/layout/Footer.tsx
git commit -m "fix(footer): add Community link, fix Discord via SOCIALS"
```

---

## Task 3: Logo-Asset austauschen

**Files:**
- Create: `src/assets/images/CandleScopeLogo.png` (aus FinanceBoard icon.png)
- Modify: `public/favicon.png`
- Modify: `index.html`

- [ ] **Schritt 1: Logo in assets kopieren**

```bash
cp "C:/Users/Dezent/Desktop/CANDLESCOPE/CS-FinanceBoard -  03.04.26/assets/icon.png" \
   "src/assets/images/CandleScopeLogo.png"
```

- [ ] **Schritt 2: Favicon aktualisieren**

```bash
cp "src/assets/images/CandleScopeLogo.png" "public/favicon.png"
```

- [ ] **Schritt 3: `index.html` favicon href prüfen**

Öffne `index.html`. Stelle sicher dass `<link rel="icon">` auf `favicon.png` zeigt:

```html
<link rel="icon" type="image/png" href="/favicon.png" />
```

Falls dort `favicon.svg` steht: ersetze durch obige Zeile.

- [ ] **Schritt 4: Commit**

```bash
git add src/assets/images/CandleScopeLogo.png public/favicon.png index.html
git commit -m "feat: replace logo + favicon with CS monogram from FinanceBoard"
```

---

## Task 4: Header — Logo tauschen + Pill-Nav + Download-CTA

**Files:**
- Modify: `src/components/layout/Header.tsx`

- [ ] **Schritt 1: Logo-Import aktualisieren**

Zeile 12 in `Header.tsx`:

```typescript
// Alt:
import csLogo from '../../assets/images/CandleScope.webp'
// Neu:
import csLogo from '../../assets/images/CandleScopeLogo.png'
```

- [ ] **Schritt 2: Desktop-Nav in Pill-Container wrappen**

Ersetze den kompletten `<nav>` Block (aktuell Zeilen 84–101):

```tsx
{/* Pill-Nav */}
<nav className="flex items-center bg-[#111111] border border-[#C9A84C]/12 rounded-full px-5 py-1.5 gap-1">
  {navItems.map(({ to, label, tooltip }) => (
    <div key={to} className="relative group">
      <NavLink to={to} className={({ isActive }) => `
        relative px-4 py-2 text-[11px] tracking-[0.12em] uppercase font-medium
        transition-colors duration-200 rounded-full
        ${isActive
          ? 'text-[#C9A84C] font-semibold'
          : 'text-[#9A9590] hover:text-[#F5F0E8]'
        }
      `}>
        {label}
      </NavLink>
      <DesktopTooltip text={tooltip} />
    </div>
  ))}
</nav>
```

- [ ] **Schritt 3: Rechten Bereich — "Hire me" → Download-CTA ersetzen**

Ersetze den `<div className="flex items-center gap-4 shrink-0">` Block (Zeilen 103–115):

```tsx
<div className="flex items-center gap-3 shrink-0">
  <Link to="/admin" aria-label="Admin Panel"
    className="group flex items-center gap-1.5 text-[11px] tracking-[0.12em] uppercase text-[#9A9590] hover:text-[#C9A84C] transition-colors duration-250">
    <Shield size={13} strokeWidth={1.5} className="group-hover:scale-110 transition-transform shrink-0" />
    Admin
  </Link>
  <div className="w-px h-4 bg-[#C9A84C]/15" />
  <a
    href="/downloads/FinanceBoard-Setup.exe"
    download
    aria-label="FinanceBoard herunterladen"
    className="relative overflow-hidden group text-[11px] tracking-[0.15em] uppercase bg-[#C9A84C] text-[#080808] font-bold px-5 py-2.5 rounded-full transition-opacity duration-200 hover:opacity-90"
  >
    ↓ Gratis laden
  </a>
</div>
```

> **Hinweis:** `/downloads/FinanceBoard-Setup.exe` ist der Pfad der EXE auf dem Server. Solange die Datei noch nicht hochgeladen ist, kann der href auf eine temporäre URL (GitHub Release) gesetzt werden — Offene Frage C aus dem Spec.

- [ ] **Schritt 4: Mobile Sidebar — Logo-Import ist bereits geteilt**

Kein weiterer Schritt nötig — `csLogo` wird auch in der Mobile-Sidebar verwendet, das Update aus Schritt 1 gilt für beide Verwendungen.

- [ ] **Schritt 5: Build-Check**

```bash
npx tsc --noEmit
```

Erwartung: keine Fehler.

- [ ] **Schritt 6: Visuell prüfen**

```bash
npm run dev
```

Öffne http://localhost:5173 und prüfe:
- [ ] CS-Monogramm-Logo erscheint in der Nav (gold, keine weiße Box)
- [ ] Nav-Links sind in einer dunklen Pill-Kapsel
- [ ] Aktiver Link ist gold
- [ ] Rechts steht "↓ Gratis laden" als gold-ausgefüllte Pill
- [ ] Mobile: Sidebar zeigt neues Logo

- [ ] **Schritt 7: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "feat(header): pill-nav + CS logo + download CTA"
```

---

## Task 5: Content-Korrekturen

**Files:**
- Modify: `src/pages/DevPage.tsx`
- Modify: `src/data/pages.ts`

- [ ] **Schritt 1: DevPage — FinanceBoard Tech-Tags korrigieren**

Suche in `DevPage.tsx` nach dem FinanceBoard-Eintrag. Die Zeile mit `tags:` die `['React', 'TypeScript', 'Recharts', 'Zustand']` enthält ersetzen durch:

```typescript
tags: ['Electron', 'Vanilla JS', 'Chart.js', 'CSS'],
```

Zusätzlich die `description` des FinanceBoard-Eintrags prüfen. Falls sie "lokales Haushaltsbuch" oder ähnliches sagt, ersetzen durch:

```typescript
description: 'Vollständige Desktop-App für Windows. Offline-first, kein Framework, kein Cloud-Zwang.',
```

- [ ] **Schritt 2: pages.ts — Community Badge fixen**

Öffne `src/data/pages.ts`. Suche `badge: 'Coming soon'` für die Community-Seite und ersetze:

```typescript
badge: 'Jetzt live',
```

- [ ] **Schritt 3: Build-Check**

```bash
npx tsc --noEmit
```

- [ ] **Schritt 4: Commit**

```bash
git add src/pages/DevPage.tsx src/data/pages.ts
git commit -m "fix(content): FinanceBoard tech tags + Community badge"
```

---

## Task 6: Neue Komponente — `UspStrip`

**Files:**
- Create: `src/components/finance/UspStrip.tsx`

- [ ] **Schritt 1: Komponente erstellen**

```tsx
// src/components/finance/UspStrip.tsx
import { WifiOff, BadgeCheck, Monitor, Lock } from 'lucide-react'

const USPS = [
  {
    icon: <WifiOff size={22} strokeWidth={1.5} className="text-[#C9A84C]" />,
    title: 'Offline-First',
    sub: 'Keine Internetverbindung nötig',
  },
  {
    icon: <BadgeCheck size={22} strokeWidth={1.5} className="text-[#C9A84C]" />,
    title: 'Einmalig kaufen',
    sub: 'Kein Abo, keine versteckten Kosten',
  },
  {
    icon: <Monitor size={22} strokeWidth={1.5} className="text-[#C9A84C]" />,
    title: 'Windows 10 / 11',
    sub: 'Desktop-App · ~150 MB',
  },
  {
    icon: <Lock size={22} strokeWidth={1.5} className="text-[#C9A84C]" />,
    title: 'Deine Daten',
    sub: 'Alles lokal in %APPDATA%',
  },
]

export default function UspStrip() {
  return (
    <section className="border-t border-b border-[#C9A84C]/8 py-10">
      <div className="max-w-5xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
        {USPS.map(({ icon, title, sub }) => (
          <div key={title} className="flex flex-col items-center text-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#C9A84C]/8 border border-[#C9A84C]/15 flex items-center justify-center">
              {icon}
            </div>
            <div>
              <p className="text-[#F5F0E8] font-semibold text-sm">{title}</p>
              <p className="text-[#9A9590] text-xs mt-0.5 leading-relaxed">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Schritt 2: Build-Check**

```bash
npx tsc --noEmit
```

- [ ] **Schritt 3: Commit**

```bash
git add src/components/finance/UspStrip.tsx
git commit -m "feat(finance): UspStrip component — 4 Kernaussagen"
```

---

## Task 7: Neue Komponente — `FeatureGrid`

**Files:**
- Create: `src/components/finance/FeatureGrid.tsx`

- [ ] **Schritt 1: Komponente erstellen**

```tsx
// src/components/finance/FeatureGrid.tsx
import {
  LayoutDashboard, ArrowLeftRight, CandlestickChart,
  FileText, Building2, Target, Layers, Archive,
  Settings, Download,
} from 'lucide-react'

const MODULES = [
  { icon: LayoutDashboard,   title: 'Dashboard',        desc: 'KPIs, Cockpit, Zahlungsübersicht auf einen Blick' },
  { icon: ArrowLeftRight,    title: 'Transaktionen',     desc: 'Buchungen, Kategorien, Filter und Schnellsuche' },
  { icon: CandlestickChart,  title: 'Jahresanalyse',     desc: 'Candlestick-Charts, Prognose und Moving Average' },
  { icon: FileText,          title: 'Verträge',          desc: 'Subscriptions und Verträge im Überblick' },
  { icon: Building2,         title: 'Kreditoren',        desc: 'Payees mit Favicon-Pills und Kontoverknüpfung' },
  { icon: Target,            title: 'Sparziele',         desc: 'Tracker mit Live-Feedback und automatischer Rate' },
  { icon: Layers,            title: 'Vision Board',      desc: 'Freier Canvas für finanzielle Ziele und Ideen' },
  { icon: Archive,           title: 'Archiv',            desc: 'Dokumentenverwaltung mit Kategorien und Suche' },
  { icon: Settings,          title: 'Einstellungen',     desc: '6 Themes, Schriftarten, Privacy Lock' },
  { icon: Download,          title: 'Import / Export',   desc: '.fbs Format, CSV-Export, Auto-Safepoints' },
]

export default function FeatureGrid() {
  return (
    <section className="py-20 px-8 max-w-6xl mx-auto">
      <div className="text-center mb-14">
        <p className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase mb-3">Module</p>
        <h2 className="text-3xl font-bold text-[#F5F0E8]">Alles was du brauchst</h2>
        <p className="text-[#9A9590] mt-3 max-w-md mx-auto text-sm leading-relaxed">
          10 vollständig integrierte Module — kein Plugin-Dschungel, keine Abo-Extras.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {MODULES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="bg-[#111111] border border-[#C9A84C]/8 rounded-xl p-5
                       hover:border-[#C9A84C]/20 transition-colors duration-200 group"
          >
            <Icon size={22} strokeWidth={1.5} className="text-[#C9A84C]" />
            <p className="text-[#F5F0E8] font-semibold text-sm mt-3">{title}</p>
            <p className="text-[#9A9590] text-xs mt-1.5 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Schritt 2: Build-Check**

```bash
npx tsc --noEmit
```

- [ ] **Schritt 3: Commit**

```bash
git add src/components/finance/FeatureGrid.tsx
git commit -m "feat(finance): FeatureGrid — 10 Module mit Lucide Icons"
```

---

## Task 8: Neue Komponente — `DownloadCard`

**Files:**
- Create: `src/components/finance/DownloadCard.tsx`

- [ ] **Schritt 1: Komponente erstellen**

```tsx
// src/components/finance/DownloadCard.tsx
import { Check } from 'lucide-react'
import { SOCIALS } from '../../data/socials'

const INCLUDED = [
  '10 integrierte Module',
  '6 Themes inkl. Hell- und Dunkel-Modi',
  'Lokale Datensicherheit — kein Cloud-Upload',
  'Auto-Safepoints (stündlich)',
  'Import / Export (.fbs + CSV)',
  'Kein Abo — einmalig',
]

interface DownloadCardProps {
  downloadUrl?: string
}

export default function DownloadCard({ downloadUrl = '/downloads/FinanceBoard-Setup.exe' }: DownloadCardProps) {
  return (
    <section className="py-20 px-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase mb-3">Download</p>
        <h2 className="text-3xl font-bold text-[#F5F0E8]">Jetzt herunterladen</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] rounded-2xl overflow-hidden border border-[#C9A84C]/15">

        {/* Links: Was enthalten */}
        <div className="bg-[#111111] p-8 border-b md:border-b-0 md:border-r border-[#C9A84C]/8">
          <p className="text-[#C9A84C] text-xs tracking-[0.14em] uppercase mb-6">Was du bekommst</p>
          <ul className="flex flex-col gap-4">
            {INCLUDED.map(item => (
              <li key={item} className="flex items-start gap-3">
                <Check size={15} strokeWidth={2} className="text-[#C9A84C] mt-0.5 shrink-0" />
                <span className="text-[#9A9590] text-sm leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Rechts: CTA */}
        <div className="bg-[#0e0e0e] p-8 flex flex-col items-center justify-center text-center gap-4">
          <div>
            <p className="text-[#5a5550] line-through text-sm mb-1">39 €</p>
            <p className="text-[#C9A84C] text-5xl font-black leading-none">Gratis</p>
            <p className="text-[#5a5550] text-xs mt-2">Für begrenzte Zeit</p>
          </div>
          <div className="w-full flex flex-col gap-3 mt-2">
            <a
              href={downloadUrl}
              download
              className="w-full bg-[#C9A84C] text-[#080808] font-bold text-sm py-3.5 rounded-lg
                         hover:opacity-90 transition-opacity duration-200 text-center"
            >
              ↓ Windows herunterladen
            </a>
            {SOCIALS.kofi && (
              <a
                href={SOCIALS.kofi}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full border border-[#C9A84C]/20 text-[#9A9590] text-sm py-3 rounded-lg
                           hover:border-[#C9A84C]/35 hover:text-[#F5F0E8] transition-all duration-200
                           flex items-center justify-center gap-2"
              >
                <span>☕</span>
                Projekt unterstützen
              </a>
            )}
          </div>
          <p className="text-[#5a5550] text-[10px]">Freiwillig · via Ko-fi</p>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Schritt 2: Build-Check**

```bash
npx tsc --noEmit
```

- [ ] **Schritt 3: Commit**

```bash
git add src/components/finance/DownloadCard.tsx
git commit -m "feat(finance): DownloadCard — split card, Ko-fi, späterer Preis-Umbau vorbereitet"
```

---

## Task 9: Neue Komponente — `FaqAccordion`

**Files:**
- Create: `src/components/finance/FaqAccordion.tsx`

- [ ] **Schritt 1: Komponente erstellen**

```tsx
// src/components/finance/FaqAccordion.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const FAQ = [
  {
    q: 'Läuft die App auf Mac oder Linux?',
    a: 'Nein — aktuell ausschließlich Windows 10 und Windows 11 (64-Bit). Mac- und Linux-Versionen sind für eine spätere Version geplant.',
  },
  {
    q: 'Wo werden meine Daten gespeichert?',
    a: 'Alles lokal auf deinem PC unter %APPDATA%/candlescope-financeboard/. Keine Cloud, keine Server, keine Weitergabe an Dritte.',
  },
  {
    q: 'Was passiert wenn ich die App deinstalliere?',
    a: 'Die Daten bleiben im AppData-Ordner erhalten und gehen nicht verloren. Du kannst sie dort manuell löschen oder vor der Deinstallation per Export sichern.',
  },
  {
    q: 'Gibt es automatische Updates?',
    a: 'Noch nicht — neue Versionen werden auf candlescope.de bekannt gegeben. Der Auto-Updater ist für eine der nächsten Versionen geplant.',
  },
  {
    q: 'Was bedeutet "für begrenzte Zeit kostenlos"?',
    a: 'Sobald das Produkt offiziell verkauft wird, gilt der reguläre Preis (39 €) für neue Downloads. Wer jetzt lädt, behält die App dauerhaft und kostenlos.',
  },
]

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-20 px-8 max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase mb-3">FAQ</p>
        <h2 className="text-3xl font-bold text-[#F5F0E8]">Häufige Fragen</h2>
      </div>
      <div className="flex flex-col gap-2">
        {FAQ.map(({ q, a }, i) => (
          <div
            key={i}
            className="bg-[#111111] border border-[#C9A84C]/8 rounded-xl overflow-hidden
                       hover:border-[#C9A84C]/15 transition-colors duration-200"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
            >
              <span className="text-[#F5F0E8] text-sm font-medium">{q}</span>
              {open === i
                ? <Minus size={16} strokeWidth={1.5} className="text-[#C9A84C] shrink-0" />
                : <Plus  size={16} strokeWidth={1.5} className="text-[#9A9590] shrink-0" />
              }
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-5 text-[#9A9590] text-sm leading-relaxed">{a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Schritt 2: Build-Check**

```bash
npx tsc --noEmit
```

- [ ] **Schritt 3: Commit**

```bash
git add src/components/finance/FaqAccordion.tsx
git commit -m "feat(finance): FaqAccordion — 5 Fragen mit AnimatePresence"
```

---

## Task 10: Neue Komponente — `ScreenshotSlider`

**Files:**
- Create: `src/components/finance/ScreenshotSlider.tsx`

> **Voraussetzung:** Die vorhandenen App-Screenshots befinden sich bereits in `src/assets/images/`. Neue Screenshots (WebP, 1440×900, Candlescope-Theme) können später ergänzt werden.

- [ ] **Schritt 1: Vorhandene Assets prüfen**

```bash
ls src/assets/images/
```

Erwartete vorhandene Dateien: `Übersicht.webp`, `Jahresüberblick.webp`, `Modalbeispiel.webp`, `Dokumentenarchiv.webp`, `CostumDesign.webp`

- [ ] **Schritt 2: Komponente erstellen**

```tsx
// src/components/finance/ScreenshotSlider.tsx
import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

import imgDashboard    from '../../assets/images/Übersicht.webp'
import imgJahr         from '../../assets/images/Jahresüberblick.webp'
import imgModal        from '../../assets/images/Modalbeispiel.webp'
import imgArchiv       from '../../assets/images/Dokumentenarchiv.webp'
import imgDesign       from '../../assets/images/CostumDesign.webp'

const SCREENSHOTS = [
  { label: 'Dashboard',      src: imgDashboard },
  { label: 'Jahresanalyse',  src: imgJahr      },
  { label: 'Transaktionen',  src: imgModal     },
  { label: 'Archiv',         src: imgArchiv    },
  { label: 'Custom Design',  src: imgDesign    },
]

export default function ScreenshotSlider() {
  const [active, setActive] = useState(0)
  const constraintsRef = useRef<HTMLDivElement>(null)

  return (
    <section className="py-20">
      <div className="text-center mb-10 px-8">
        <p className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase mb-3">App in Aktion</p>
        <h2 className="text-3xl font-bold text-[#F5F0E8]">Sieh selbst</h2>
      </div>

      {/* Tab-Leiste */}
      <div className="flex items-center justify-center gap-2 px-8 mb-8 flex-wrap">
        {SCREENSHOTS.map(({ label }, i) => (
          <button
            key={label}
            onClick={() => setActive(i)}
            className={`px-4 py-1.5 rounded-full text-xs tracking-[0.1em] uppercase transition-all duration-200 cursor-pointer
              ${active === i
                ? 'bg-[#C9A84C]/15 border border-[#C9A84C]/30 text-[#C9A84C]'
                : 'border border-transparent text-[#9A9590] hover:text-[#F5F0E8]'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Bild */}
      <div className="px-8 max-w-5xl mx-auto">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="rounded-2xl overflow-hidden border border-[#C9A84C]/12
                     shadow-[0_0_80px_rgba(201,168,76,0.06)]"
        >
          {/* Fake Titlebar */}
          <div className="bg-[#161616] px-4 py-2.5 flex items-center gap-2 border-b border-[#C9A84C]/8">
            <div className="w-3 h-3 rounded-full bg-[#ef4444]/70" />
            <div className="w-3 h-3 rounded-full bg-[#eab308]/70" />
            <div className="w-3 h-3 rounded-full bg-[#22c55e]/70" />
            <span className="text-[#5a5550] text-[10px] ml-2 font-mono">
              Candlescope FinanceBoard v10.6 — {SCREENSHOTS[active].label}
            </span>
          </div>
          <img
            src={SCREENSHOTS[active].src}
            alt={`FinanceBoard ${SCREENSHOTS[active].label}`}
            className="w-full object-cover"
            loading="lazy"
          />
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Schritt 3: Build-Check**

```bash
npx tsc --noEmit
```

- [ ] **Schritt 4: Commit**

```bash
git add src/components/finance/ScreenshotSlider.tsx
git commit -m "feat(finance): ScreenshotSlider — Tab-basierter Screenshot-Viewer"
```

---

## Task 11: FinancePage — Komplette Neustruktur

**Files:**
- Modify: `src/pages/FinancePage.tsx` (Datei wird komplett ersetzt)

- [ ] **Schritt 1: Aktuelle Datei sichern (optional)**

```bash
cp src/pages/FinancePage.tsx src/pages/FinancePage.tsx.bak
```

- [ ] **Schritt 2: Datei komplett ersetzen**

```tsx
// src/pages/FinancePage.tsx
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import UspStrip from '../components/finance/UspStrip'
import ScreenshotSlider from '../components/finance/ScreenshotSlider'
import FeatureGrid from '../components/finance/FeatureGrid'
import DownloadCard from '../components/finance/DownloadCard'
import FaqAccordion from '../components/finance/FaqAccordion'

// Inline — lokal in dieser Datei, kein shared Export vorhanden
function StaggerContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
    >
      {children}
    </motion.div>
  )
}
function StaggerItem({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden:  { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
      }}
    >
      {children}
    </motion.div>
  )
}

// AnimatedCounter — inline (wie bisher)
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  return (
    <span className="font-bold text-4xl text-[#F5F0E8] tabular-nums">
      {value}{suffix}
    </span>
  )
}

const STATS = [
  { value: 10,   suffix: '',  label: 'Module'    },
  { value: 6,    suffix: '',  label: 'Themes'    },
  { value: 100,  suffix: '%', label: 'Offline'   },
  { value: 0,    suffix: '',  label: 'Abos'      },
]

const BENEFITS = [
  'Daten bleiben lokal auf deinem PC',
  '10 vollständige Module — kein Plugin-Chaos',
  'Einmalig — kein Abo, keine Cloud',
]

export default function FinancePage() {
  return (
    <div className="min-h-screen bg-[#080808] pt-20">

      {/* ① HERO — Split Layout */}
      <section className="relative overflow-hidden">
        {/* Hintergrund-Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]
                          bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,168,76,0.08)_0%,transparent_70%)]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-8 py-20 md:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Text-Block */}
          <StaggerContainer className="flex flex-col gap-6">
            <StaggerItem>
              <span className="inline-flex items-center gap-2 bg-[#C9A84C]/8 border border-[#C9A84C]/20
                               rounded-full px-4 py-1.5 text-[#C9A84C] text-xs tracking-[0.1em] uppercase">
                v10.6 · Jetzt verfügbar
              </span>
            </StaggerItem>

            <StaggerItem>
              <h1 className="text-5xl md:text-6xl font-black leading-[1.05] text-[#F5F0E8]">
                Finance<span className="text-[#C9A84C]">Board.</span>
                <br />Offline.
                <br />Unter Kontrolle.
              </h1>
            </StaggerItem>

            <StaggerItem>
              <p className="text-[#9A9590] text-base leading-relaxed max-w-sm">
                Kein Cloud-Zwang. Keine Abo-Falle. Deine Finanzen bleiben auf deinem Gerät — für immer.
              </p>
            </StaggerItem>

            <StaggerItem>
              <ul className="flex flex-col gap-2.5">
                {BENEFITS.map(b => (
                  <li key={b} className="flex items-center gap-3">
                    <Check size={15} strokeWidth={2} className="text-[#C9A84C] shrink-0" />
                    <span className="text-[#9A9590] text-sm">{b}</span>
                  </li>
                ))}
              </ul>
            </StaggerItem>

            <StaggerItem>
              <div className="flex items-center gap-3 flex-wrap">
                <a
                  href="/downloads/FinanceBoard-Setup.exe"
                  download
                  className="bg-[#C9A84C] text-[#080808] font-bold px-6 py-3.5 rounded-lg
                             hover:opacity-90 transition-opacity duration-200 text-sm"
                >
                  ↓ Gratis herunterladen
                </a>
                <button
                  onClick={() => document.getElementById('screenshots')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border border-[#C9A84C]/25 text-[#9A9590] px-5 py-3.5 rounded-lg
                             hover:border-[#C9A84C]/40 hover:text-[#F5F0E8] transition-all duration-200 text-sm"
                >
                  Demo ansehen →
                </button>
              </div>
            </StaggerItem>
          </StaggerContainer>

          {/* App-Fenster-Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="relative hidden lg:block"
          >
            {/* Glow hinter dem Fenster */}
            <div className="absolute -inset-4 rounded-2xl bg-[#C9A84C]/3 blur-3xl pointer-events-none" />
            <div className="relative rounded-xl overflow-hidden border border-[#C9A84C]/15
                            shadow-[0_0_60px_rgba(201,168,76,0.08)]">
              {/* Titlebar */}
              <div className="bg-[#161616] px-4 py-2.5 flex items-center gap-2 border-b border-[#C9A84C]/8">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]/70" />
                <div className="w-3 h-3 rounded-full bg-[#eab308]/70" />
                <div className="w-3 h-3 rounded-full bg-[#22c55e]/70" />
                <span className="text-[#5a5550] text-[10px] ml-2 font-mono">Candlescope FinanceBoard v10.6</span>
              </div>
              {/* App-Vorschau (Platzhalter bis Screenshot vorliegt) */}
              <div className="bg-[#0e0e0e] h-[340px] flex">
                {/* Sidebar */}
                <div className="w-14 bg-[#090909] border-r border-[#C9A84C]/6 flex flex-col items-center gap-3 pt-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={`w-6 h-1 rounded-full ${i === 1 ? 'bg-[#C9A84C]' : 'bg-[#C9A84C]/15'}`} />
                  ))}
                </div>
                {/* Main Content */}
                <div className="flex-1 p-5 flex flex-col gap-4">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {['+ 2.840 €', '− 1.240 €', '+ 1.600 €'].map((v, i) => (
                      <div key={i} className="bg-[#141414] border border-[#C9A84C]/8 rounded-lg p-3">
                        <div className={`text-xs font-bold ${i === 2 ? 'text-[#22c55e]' : i === 0 ? 'text-[#C9A84C]' : 'text-[#9A9590]'}`}>
                          {v}
                        </div>
                        <div className="text-[#5a5550] text-[9px] mt-1">
                          {['Einnahmen', 'Ausgaben', 'Netto'][i]}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Chart Placeholder */}
                  <div className="flex-1 bg-[#141414] border border-[#C9A84C]/8 rounded-lg p-4 flex items-end gap-2">
                    {[35, 60, 42, 78, 55, 88, 40, 70, 62, 95, 50, 75].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{
                          height: `${h}%`,
                          background: i % 3 === 1 ? '#C9A84C' : `rgba(201,168,76,${0.2 + (i % 3) * 0.15})`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Trennlinie */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/10 to-transparent" />
      </section>

      {/* ② USP-STRIP */}
      <UspStrip />

      {/* ③ SCREENSHOTS */}
      <div id="screenshots">
        <ScreenshotSlider />
      </div>

      {/* ④ FEATURES */}
      <FeatureGrid />

      {/* ⑤ STATS */}
      <section className="border-t border-b border-[#C9A84C]/8 py-16">
        <div className="max-w-3xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(({ value, suffix, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <AnimatedCounter value={value} suffix={suffix} />
              <p className="text-[#9A9590] text-xs tracking-[0.1em] uppercase">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ⑥ DOWNLOAD */}
      <DownloadCard />

      {/* ⑦ FAQ */}
      <FaqAccordion />

      {/* ⑧ FOOTER-CTA */}
      <section className="py-24 text-center px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/10 to-transparent mb-20" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#F5F0E8] mb-4">
            Deine Finanzen. Dein Gerät.
          </h2>
          <p className="text-[#9A9590] mb-8 text-sm">
            Kostenlos starten — kein Konto, kein Abo, keine Cloud.
          </p>
          <a
            href="/downloads/FinanceBoard-Setup.exe"
            download
            className="inline-flex items-center gap-2 bg-[#C9A84C] text-[#080808] font-bold
                       px-8 py-4 rounded-lg hover:opacity-90 transition-opacity duration-200"
          >
            ↓ Gratis herunterladen
          </a>
        </motion.div>
      </section>
    </div>
  )
}
```

- [ ] **Schritt 3: `.bak`-Datei entfernen**

```bash
rm src/pages/FinancePage.tsx.bak
```

- [ ] **Schritt 4: Build-Check**

```bash
npx tsc --noEmit
```

Erwartung: keine Fehler. Falls TypeScript über fehlende Typen für Animations-Komponenten meckert: prüfe ob `StaggerContainer` / `StaggerItem` in `src/components/ui/Animations.tsx` exportiert sind.

- [ ] **Schritt 5: Visuell prüfen**

```bash
npm run dev
```

Navigiere zu http://localhost:5173/finance und prüfe:
- [ ] Hero: Headline links, App-Fenster-Mockup rechts
- [ ] USP-Strip: 4 Kacheln mit Icons
- [ ] Screenshot-Tabs wechseln korrekt
- [ ] Feature-Grid: 10 Kacheln, 5 Spalten auf Desktop
- [ ] Stats: Zahlen korrekt (10, 6, 100%, 0)
- [ ] Download-Card: Split, "39 €" durchgestrichen, Gratis
- [ ] FAQ: Accordion öffnet/schließt smooth
- [ ] Footer-CTA: korrekte Headline

- [ ] **Schritt 6: Commit**

```bash
git add src/pages/FinancePage.tsx
git commit -m "feat(finance): complete page restructure — 8 sections, conversion funnel"
```

---

## Task 12: Datenschutz + Impressum aktualisieren

**Files:**
- Modify: `src/pages/DatenschutzPage.tsx` oder entsprechende Datei (Pfad prüfen)

> Beide Seiten existieren bereits als Routen (`/datenschutz`, `/impressum`). Die Texte müssen auf den aktuellen Stand gebracht werden.

- [ ] **Schritt 1: Datenpfade prüfen**

```bash
find src -name "*atenschutz*" -o -name "*mpressum*" | grep -v node_modules
```

Notiere die genauen Dateipfade.

- [ ] **Schritt 2: Datenschutz-Pflichtangaben ergänzen**

Die Datenschutzerklärung muss mindestens enthalten (nach DSGVO / TDDDG Stand 2026):

```
1. Verantwortlicher
   Name: [Vollständiger Name]
   Adresse: [Anschrift]
   E-Mail: info@candlescope.de

2. Hosting
   Vercel Inc., 340 Pine Street, Suite 603, San Francisco, CA 94104, USA
   Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)
   Vercel hat Standardvertragsklauseln (SCCs) abgeschlossen.

3. Kontaktformular
   Dienstleister: Formspree Inc. (Auftragsverarbeiter)
   Daten: Name, E-Mail, Nachricht
   Zweck: Bearbeitung deiner Anfrage
   Speicherdauer: Bis zur Erledigung, max. 6 Monate

4. Externe APIs (keine personenb. Daten)
   - GitHub API: öffentliche Repository-Daten, keine Speicherung
   - Discord API: öffentliche Serverstatistiken, keine Speicherung

5. localStorage
   Zweck: Admin-Panel Session, Cookie-Consent, Page-Builder-Daten
   Rechtsgrundlage: Technisch notwendig (kein Consent erforderlich)
   Keine Weitergabe an Dritte.

6. Keine Tracking-Dienste
   Diese Website verwendet keine Analytics-, Werbe- oder Tracking-Skripte.

7. Betroffenenrechte
   Auskunft (Art. 15), Löschung (Art. 17), Widerspruch (Art. 21)
   Kontakt: info@candlescope.de
   Beschwerderecht: Zuständige Datenschutzbehörde deines Bundeslandes
```

Füge diese Angaben in die bestehende Datenschutz-Seitenkomponente ein.

- [ ] **Schritt 3: Impressum-Pflichtangaben prüfen**

Mindestinhalt nach §5 TMG:

```
Name: [Vorname Nachname]
Anschrift: [Straße, PLZ Stadt]
E-Mail: info@candlescope.de
Verantwortlich für den Inhalt nach §18 Abs. 2 MStV: [Name]
```

> **Hinweis:** Als Privatperson kein Gewerbeeintrag nötig. Adresse ist Pflicht — kann Postfach sein wenn vorhanden, sonst Wohnadresse.

- [ ] **Schritt 4: Build-Check + Commit**

```bash
npx tsc --noEmit
git add src/pages/
git commit -m "legal: Datenschutz + Impressum auf DSGVO-Stand 2026 gebracht"
```

---

## Task 13: Finaler Build-Check + Deployment

- [ ] **Schritt 1: Produktions-Build**

```bash
npm run build
```

Erwartung: Build läuft ohne Fehler durch. Warnungen sind ok, Errors nicht.

- [ ] **Schritt 2: Preview lokal**

```bash
npm run preview
```

Kompletten Flow prüfen:
- [ ] Homepage lädt
- [ ] FinancePage: alle 8 Sektionen vorhanden
- [ ] Download-Button antwortet (404 ist ok bis EXE hochgeladen)
- [ ] FAQ-Accordion funktioniert
- [ ] Screenshot-Tabs wechseln
- [ ] Nav: Pill-Container, richtiges Logo, aktiver Link gold
- [ ] Footer: Community-Link vorhanden, Discord-Link gesetzt
- [ ] Datenschutz + Impressum: Pflichtangaben vorhanden
- [ ] CookieBanner erscheint beim ersten Besuch

- [ ] **Schritt 3: Deploy zu Vercel**

```bash
git push origin main
```

Vercel deployed automatisch. Nach ~1 Minute auf https://candlescope.de prüfen.

- [ ] **Schritt 4: Post-Deploy Checks**

- [ ] Logo erscheint als Favicon im Browser-Tab
- [ ] Keine Console-Errors in den DevTools
- [ ] Download-Button: falls noch keine EXE hochgeladen → href temporär auf GitHub Release setzen

---

## Offene Fragen die vor Step 13 beantwortet sein müssen

| # | Frage | Betrifft |
|---|-------|---------|
| A | Korrekter Discord Invite-Code | `socials.ts` Zeile 2 |
| B | Ko-fi Username | `socials.ts` Zeile 5 |
| C | Download-URL für EXE | `Header.tsx`, `FinancePage.tsx`, `DownloadCard.tsx` — 3 Stellen mit `href="/downloads/FinanceBoard-Setup.exe"` |
| D | Echter Name + Adresse | Impressum (Pflicht vor Go-Live) |
| E | Ist Instagram aktiv? | `socials.ts` — falls nicht aktiv: aus ContactPage entfernen |

---

*Spec: `docs/superpowers/specs/2026-04-19-website-redesign-design.md`*
