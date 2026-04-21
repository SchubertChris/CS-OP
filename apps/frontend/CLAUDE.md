# CandleScope Frontend

Personal Brand Website für Chris Schubert / CandleScope. Öffentliche Marketing-Site mit integriertem CMS/Page-Builder (Admin Panel). Deployed auf Vercel.

**Version:** Phase 1 aktiv · Domain: candlescope.de
**Stack:** React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + Framer Motion v12 + Three.js + Zustand + React Router v7

---

## Commands

```bash
npm run dev      # Dev-Server starten (Vite HMR)
npm run build    # Production Build → dist/
npm run preview  # Build lokal vorschauen
npm run lint     # ESLint
```

---

## Architektur

```text
src/
├── App.tsx                    ← Router-Root, lazy-loaded Routes, Suspense
├── main.tsx                   ← React 19 createRoot
├── index.css                  ← Globale Styles (Tailwind + Fonts)
├── styles/index.css           ← Zusätzliche globale CSS
│
├── pages/                     ← Öffentliche Seiten
│   ├── HomePage.tsx           ← / (Haupt-Landing)
│   ├── FinancePage.tsx        ← /finance
│   ├── DevPage.tsx            ← /dev
│   ├── AboutPage.tsx          ← /about
│   ├── CommunityPage.tsx      ← /community
│   ├── ContactPage.tsx        ← /contact
│   ├── DynamicPage.tsx        ← /:slug (CMS-Pages)
│   ├── ImpressumPage.tsx      ← /impressum
│   ├── DatenschutzPage.tsx    ← /datenschutz
│   ├── NotFoundPage.tsx       ← /404
│   └── AdminPage.tsx          ← /admin Redirect
│
├── admin/                     ← Admin CMS (nur eingeloggt)
│   ├── AdminGuard.tsx         ← Route-Guard, prüft useAdminStore.isAuthenticated
│   ├── AdminLayout.tsx        ← Shell für Admin (Sidebar + Topbar)
│   ├── AdminLogin.tsx         ← 2-Schritt Login (PIN + Passwort)
│   ├── AdminDashboard.tsx     ← /admin — Übersicht + Stats
│   ├── PageList.tsx           ← /admin/pages — Alle Seiten
│   ├── NewPage.tsx            ← /admin/pages/new — Neue Seite erstellen
│   ├── PageEditor.tsx         ← /admin/pages/:id — Block-Editor
│   ├── BlockEditor.tsx        ← Block-Properties bearbeiten
│   └── AdminSettings.tsx      ← /admin/settings
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx         ← Desktop Top-Nav + Mobile Sidebar-Icon-Nav
│   │   ├── Footer.tsx         ← 4-Spalten Footer
│   │   └── RootLayout.tsx     ← Header + Outlet + Footer + ScrollToTop
│   ├── ui/
│   │   ├── index.tsx          ← Alle geteilten UI-Components (Export-Barrel)
│   │   ├── PageHero.tsx       ← Hero-Section mit Theme-SVG-Backgrounds
│   │   ├── BackgroundEffect.tsx
│   │   ├── CookieBanner.tsx
│   │   └── IntroAnimation.tsx
│   └── sections/
│       └── GitHubActivity.tsx
│
├── store/
│   ├── usePagesStore.ts       ← Zustand — Seiten + Block-CRUD + localStorage persist
│   └── useAdminStore.ts       ← Zustand — Admin Auth (PIN + Passwort, SHA-256)
│
├── types/
│   ├── page.types.ts          ← Page, Block, BlockType, alle BlockProps-Interfaces
│   └── block.registry.ts     ← BLOCK_REGISTRY, getBlockConfig(), CONTENT_BLOCKS/LAYOUT_BLOCKS
│
├── data/
│   └── pages.ts               ← INITIAL_PAGES (Seed-Daten), getNavPages(), getPageBySlug()
│
├── hooks/
│   ├── useScrollReveal.ts     ← CSS-basiertes Scroll-Reveal (kein Framer-Konflikt)
│   └── useGitHubContributions.ts
│
└── assets/
    ├── images/               ← CandleScope.webp, ChrisSchubert.webp, App-Screenshots (.webp)
    └── video/                ← CandleScope.mp4, CandleScope.webm
```

---

## Routing (App.tsx)

Alle Routes sind **lazy-loaded** mit React.lazy() + Suspense (Spinner-Fallback).

```text
/                    → HomePage          (in RootLayout)
/finance             → FinancePage
/dev                 → DevPage
/about               → AboutPage
/community           → CommunityPage
/contact             → ContactPage
/impressum           → ImpressumPage
/datenschutz         → DatenschutzPage
/404                 → NotFoundPage
/:slug               → DynamicPage (CMS)
*                    → /404 Redirect

/admin               → AdminLayout + AdminGuard (Schutz)
  /admin/            → AdminDashboard
  /admin/pages       → PageList
  /admin/pages/new   → NewPage
  /admin/pages/:id   → PageEditor
  /admin/settings    → AdminSettings
/admin/login         → AdminLogin (kein Guard)
```

---

## Design System

**Farbpalette (hardcoded HEX — kein Tailwind-Theme):**

| Name | Wert | Verwendung |
|------|------|-----------|
| Background | `#080808` | Page-Hintergrund |
| Surface 1 | `#0d0d0d` | Cards, Modals |
| Surface 2 | `#0f0e0c` | Elevated Cards |
| Gold | `#C9A84C` | Primärakzent, alle CTAs, Border-Akzente |
| Gold Light | `#E8C56D` | Gradient-Endpunkt |
| Text Primary | `#F5F0E8` | Überschriften, wichtige Texte |
| Text Secondary | `#9A9590` | Body-Text, Beschreibungen |
| Text Tertiary | `#5a5550` | Subtexte, Labels |
| Text Muted | `#3a3530` | Sehr gedämpfte Inhalte |
| Green | `#00C896` | Live/Success-Status |
| Red | `#FF4444` | Error/Warning-Status |

**Typografie:**
- `font-display` → Space Grotesk (Headings, Zahlen)
- `font-mono` → JetBrains Mono (Labels, Tags, Code)
- Body → System Sans

**Gold-Gradient:** `from-[#C9A84C] via-[#E8C56D] to-[#C9A84C]` → `<GradientText>`

---

## UI-Komponenten (`src/components/ui/index.tsx`)

| Komponente | Props | Beschreibung |
|-----------|-------|-------------|
| `GradientText` | `variant?: 'gold' \| 'subtle'` | Gold-Gradient Text-Clip |
| `Badge` | `variant?: 'gold' \| 'green' \| 'red' \| 'muted'` | Pill-Label |
| `GoldDivider` | `variant?: 'full' \| 'short' \| 'fade'` | Trennlinie |
| `SectionHeader` | `eyebrow?, title, description?, align?, delay?` | Eyebrow + H2 + Beschreibung mit Scroll-Reveal |
| `SectionWrapper` | `id?, reveal?, stagger?, maxWidth?` | Section mit Padding + max-width + Stagger |
| `Card` | `variant?: 'default' \| 'elevated' \| 'gold', href?, padding?` | Universal Card |
| `CardIcon` | — | Icon-Box für Feature-Cards |
| `StatItem` | `value, label, suffix?` | Zahl + Label |
| `CtaButton` | `href?, variant?: 'primary' \| 'ghost', external?` | Gold Fill-Animation Button |
| `TagList` | `tags: string[]` | Reihe Tags/Skills |
| `HighlightLine` | — | Gold-Akzent-Linie links (Quote-Block) |

**Verwendung:**
```tsx
import { SectionHeader, Card, GradientText, GoldDivider, Badge, CtaButton } from '../components/ui'
```

---

## PageHero (`src/components/ui/PageHero.tsx`)

Vollbreite Hero-Section mit animiertem SVG-Hintergrund je Seite.

```tsx
<PageHero
  eyebrow="Finance"
  titleLine1="Märkte &"
  titleLine2="Tools"
  titleAccent="line2"          // welche Zeile gold ist
  description="..."
  badge="Optional Badge"
  theme="finance"              // steuert SVG-Background
>
  {/* Optionale CTA-Buttons als children */}
</PageHero>
```

**Themes → SVG-Backgrounds:**
| Theme | Background |
|-------|-----------|
| `home` | Animierter Candlestick-Chart (29 Kerzen) |
| `finance` | ETF-Trendlinie mit Gitter + Prozent-Labels |
| `dev` | Terminal-Fenster mit animiertem TypeScript-Code |
| `about` | Network-Graph mit Nodes + Edges |
| `community` | Signal-Wellen (konzentrische Ringe) |
| `contact` | Morse-Code Dots + Dashes |
| `default` | HomeBg (Candlestick) |

Alle Backgrounds: **Mobile** (links/oben) + **Desktop** (rechts, größer) als separate SVG-Instanzen.
Mobile-Optimierung: Pulse-Ringe und blinkende Cursors sind auf Desktop beschränkt (`!isMobile`-Check).

**AnimatedTitle:** Jeder Buchstabe einzeln via Framer Motion (stagger 0.025s).
**Char-Delay:** `chars1.length + i` für zweite Zeile — kontinuierliche Sequenz.

---

## Animations-System

**Zwei parallele Systeme — NICHT mischen auf demselben Element:**

### 1. CSS IntersectionObserver (useScrollReveal)
```tsx
import { useScrollReveal, useReveal } from '../../hooks/useScrollReveal'

// Container: Stagger für direkte Kinder
const ref = useScrollReveal({ stagger: 80 })
<div ref={ref}>...</div>

// Einzelnes Element
const ref = useReveal({ delay: 200 })
<div ref={ref}>...</div>
```
Verwendet von: `SectionHeader`, `SectionWrapper`.
Überspringt Elemente mit `data-framer="true"` oder bereits gesetztem `style.transform`.

### 2. Framer Motion (scroll-triggered)
```tsx
// Reveal mit Richtung
<motion.div ref={ref} variants={variants} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>

// Stagger Container
<StaggerContainer>
  <StaggerItem>...</StaggerItem>
</StaggerContainer>
```
`StaggerItem` Props: `{ opacity: 0, y: 32, filter: 'blur(8px)' }` → `{ opacity: 1, y: 0, filter: 'blur(0px)' }`

**Lokale Komponenten in Seiten:** `Reveal`, `StaggerContainer`, `StaggerItem`, `TiltCard`, `ScreenshotReveal` (alle lokal definiert in FinancePage.tsx und HomePage.tsx — nicht aus ui/ importieren).

**Regel (aus DevPage-Kommentar):**
- `SectionHeader` animiert sich selbst via `useReveal` (CSS)
- `StaggerContainer` animiert Kinder via Framer Motion
- NIEMALS beides gleichzeitig auf demselben Element

---

## Page Builder / CMS

### Datenmodell

```typescript
interface Page {
  id: string
  slug: string
  title: string
  nav?: { label, icon, position, visible }
  isSystem: boolean      // System-Pages können nicht gelöscht/umbenannt werden
  published: boolean     // false = Entwurf
  blocks: AnyBlock[]
  seo?: { title?, description?, ogImage? }
  createdAt: string
  updatedAt: string
}

interface Block<T extends BlockType> {
  id: string
  type: T
  props: BlockPropsMap[T]
  order: number
}
```

### Block-Typen

**Content-Blöcke:** `hero`, `text`, `card-grid`, `list`, `image`, `stats`, `timeline`, `embed`
**Layout-Blöcke:** `cta-banner`, `divider`

Registriert in `src/types/block.registry.ts` → `BLOCK_REGISTRY[]`.
Jeder Block hat: `type`, `label`, `description`, `icon`, `category`, `defaultProps`.

### Store (`usePagesStore`)

Zustand mit `persist` (localStorage `candlescope-pages-v2`). Nur `pages` wird persistiert.

```typescript
// Wichtige Actions:
loadPages()                            // Lädt INITIAL_PAGES falls leer
createPage(data)                       // Erstellt Seite mit Hero-Block als Default
addBlock(pageId, type, afterBlockId?)  // Neuer Block mit defaultProps
updateBlock(pageId, blockId, props)    // Props mergen (nicht ersetzen)
moveBlockUp/Down(pageId, blockId)      // Reihenfolge ändern
duplicateBlock(pageId, blockId)        // Kopie mit neuer nanoid
saveActive()                           // Setzt isDirty = false (Phase 2: API-Call)
```

**Auto-Save:** Jede State-Mutation wird sofort via Zustand-persist in localStorage gespeichert.
**Phase 2:** `saveActive()` hat Kommentar für späteren API-Call (POST /api/pages/:id).

### DynamicPage

Rendert CMS-Seiten via `/:slug`. Liest `usePagesStore.getPageBySlug(slug)`.
Rendert Blöcke via `BLOCK_REGISTRY` — aktuell nur Hero implementiert, andere Typen als TODO.

---

## Admin Authentication

**2-Schritt-Login** (`src/admin/AdminLogin.tsx`):
1. PIN (4-stellig) → `verifyPin()`
2. Passwort → `verifyPassword()`

**Credentials aus Vercel Environment Variables:**
```
VITE_ADMIN_PIN=xxxx
VITE_ADMIN_PASSWORD=xxxx
```

Werden als SHA-256 Hash verglichen (Web Crypto API). Ohne ENV-Variables: direkt durchgelassen (Dev-Mode).

**Auto-Logout:** 60 Minuten Inaktivität → `checkTimeout()`.
**Store:** `candlescope-admin-v3` in localStorage (nur `isAuthenticated` + `lastActivity` persistiert).

**AdminGuard:** Prüft `isAuthenticated`. Wenn nicht eingeloggt → Redirect zu `/admin/login`.

---

## Navigation

### Desktop Header
- Fixed, transparent → backdrop-blur bei `scrollY > 40`
- Logo + Nav-Links + Admin-Link + "Hire me" CTA-Button
- Active NavLink: gold + Unterstrich-Gradient

### Mobile Sidebar
- Position: fixed rechts, `top: 30%`
- Toggle-Pfeil immer sichtbar
- Sidebar-Panel: collapsed (0px) / expanded (56px) mit Transition
- Icons-only + Tooltips bei Hover

### Nav-Items
```typescript
const navItems = [
  { to: '/finance',   label: 'Finance',   tooltip: 'Haushaltsbuch · Trading · Tools' },
  { to: '/dev',       label: 'Dev & Web', tooltip: 'Websites · Coding · Projekte' },
  { to: '/about',     label: 'About',     tooltip: 'Über mich · Angebote · CV' },
  { to: '/community', label: 'Community', tooltip: 'Discord · Community · Events' },
  { to: '/contact',   label: 'Kontakt',   tooltip: 'Anfragen · Kooperationen' },
]
```

---

## Seiten-Übersicht

### HomePage (`/`)
Sections: Hero → Marquee → "Die Marke" (3 Feature-Cards) → Featured Produkt (2-col) → Video (LazyVideoPlayer) → "Der Typ dahinter" (Chris Bio) → CTA

**LazyVideoPlayer:** Video-Element wird erst nach Klick gemountet (kein Autoload).
**Marquee:** Infinite horizontal scroll via CSS-Animation.
**ParallaxScreenshot:** `useScroll + useTransform + useSpring` für Parallax-Effekt.

### FinancePage (`/finance`)
Sections: Hero → Produkt-Intro → Stats → Jahresübersicht → Dokumentenarchiv → Features Grid (8 Cards) → Design → Preis-Card → Trading & DeFi → Final CTA

**TiltCard:** Mouse-Track 3D-Tilt via `rotateX/Y` MotionValues.
**ScreenshotReveal:** Parallax + Tilt + Shimmer-Effect auf App-Screenshots.
**AnimatedCounter:** Zählt von 0 auf Zielwert hoch wenn in View.
**Preis:** Aktuell `XX €` — Placeholder, noch kein echter Preis.

### DevPage (`/dev`)
Sections: Hero → Services → Tech Stack → Projekte (SpotlightCard + 4 ProjectCards) → GitHub Activity → Open Source → Freelance CTA → Stats

**GitHub Activity:** Live-Fetch von `github-contributions-api.jogruber.de/v4/SchubertChris` + `api.github.com/users/SchubertChris`.
**ContribSquare:** Contribution-Grid mit 5 Gold-Intensitätsstufen.

### AboutPage (`/about`)
Sections: Hero → Foto + Story → Timeline (8 Einträge 1994–2026) → Skills → Werte → Services → Fun Facts → "Hire me" CTA

### AdminDashboard (`/admin`)
Stats: Pages/Live/Blocks/Nav-Pages Zähler. Seiten-Grid mit Icon-Links. Candlestick-Deko-SVG im Header.

### PageEditor (`/admin/pages/:id`)
3-Spalten-Layout: Block-Liste (links 288px) + Block-Properties (rechts). Block-Picker Modal. Seiten-Einstellungen Modal. Publish/Save Buttons mit isDirty-State.

---

## Assets

```
src/assets/images/
├── CandleScope.webp        ← Logo (Header, Footer)
├── ChrisSchubert.webp      ← Foto About-Page (grayscale → hover color)
├── Übersicht.webp          ← FinancePage Screenshot Dashboard
├── Jahresüberblick.webp    ← FinancePage Screenshot Jahresübersicht
├── Dokumentenarchiv.webp   ← FinancePage Screenshot Archiv
├── CostumDesign.webp       ← FinancePage Screenshot Einstellungen
└── Modalbeispiel.webp      ← Nicht aktiv genutzt

src/assets/video/
├── CandleScope.mp4
└── CandleScope.webm        ← LazyVideoPlayer auf HomePage
```

---

## Kontakt / Social

- E-Mail: `hello@candlescope.de`
- GitHub: `https://github.com/SchubertChris`
- Discord: `https://discord.gg/` (Placeholder — kein echter Link)
- Domain: `candlescope.de`

---

## Kritische Regeln

- **Keine `title=""`** auf interaktiven Elementen — Tooltips immer als eigene Komponente
- **Framer Motion und useScrollReveal nicht mischen** — führt zu Konflikten (ein Element = ein System)
- **Alle Farben hardcoded HEX** — kein `var()`, kein Tailwind-Custom-Theme. Design-System lebt in den Komponenten.
- **Page Builder Phase 1** — `saveActive()` schreibt nur in localStorage, kein Backend-API. Phase 2: API-Call.
- **VITE_ADMIN_PIN + VITE_ADMIN_PASSWORD** müssen in Vercel gesetzt sein vor Production-Deploy
- **isSystem: true** Pages (`home`, `impressum`, `datenschutz`) können nicht gelöscht oder umbenannt werden
- **Discord-Link** (`https://discord.gg/`) ist Placeholder — vor Launch ersetzen
- **Preis auf FinancePage** `XX €` ist Placeholder — vor Launch setzen
- **GitHub-API** in DevPage: `github-contributions-api.jogruber.de` (Third-party, kein offizielles GitHub-API)

---

## Offene Punkte / TODOs

| Priorität | Aufgabe |
|-----------|---------|
| 🔴 | Discord-Einladungslink setzen |
| 🔴 | Preis auf FinancePage (`XX €`) setzen |
| 🟠 | DynamicPage: Alle Block-Typen rendern (nur Hero aktiv) |
| 🟠 | Page Builder Phase 2: Backend-API für Persistenz (statt nur localStorage) |
| 🟠 | Kontakt-Formular funktional (aktuell: mailto-Link) |
| 🟡 | CommunityPage: Inhalt noch leer (nur Hero) |
| 🟡 | SEO Meta-Tags pro Seite dynamisch setzen |
| 🟡 | IntroAnimation + CookieBanner: tatsächliche Verwendung prüfen |
| 🟢 | Three.js-Import in package.json aber kein sichtbarer Einsatz |
