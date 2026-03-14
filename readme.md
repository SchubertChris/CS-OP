# 🕯️ CandleScope.de — Projekt Roadmap

> **Chris Schubert** · Personal Brand · WebDev · Finance · Gaming · Merch · Kurse  
> Domain: `candlescope.de` · Stack: React + Vite + TS · NestJS · PostgreSQL · IONOS VPS

---

## 🧭 Überblick

| # | Phase | Zeitraum | Status |
|---|-------|----------|--------|
| 1 | Fundament & Marken-Präsenz | Monat 1–2 | 🔛 In Arbeit |
| 2 | Dynamik & Community | Monat 3–5 | 🔜 Offen |
| 3 | Monetarisierung & Scale | Monat 6–12 | 🔜 Offen |

---

## 🏛️ Marken-Säulen

| Säule | Inhalt | Zielgruppe |
|-------|--------|------------|
| 💻 **WebDev** | Projekte, Code, Open Source, Portfolio | B2B, Kooperationen |
| 📈 **Finance** | Aktien, Krypto, DeFi, Haushaltsbuch-Software, Anlageberatung | B2C, Investoren |
| 🎮 **Gaming & Tech** | Reviews, Tech-News, Community | Fans, Community |
| 🛍️ **Merch** | Eigene Produkte, Brand-Artikel | B2C, Fans |
| 🎓 **Kurse & Coaching** | WebDev-Kurse, Finance-Coaching, auf Anfrage | B2C, B2B |

---

## 🛠️ Tech-Stack

### Frontend
| Technologie | Zweck |
|-------------|-------|
| React + Vite + TypeScript | Core Framework |
| Tailwind CSS v4 | Styling & Design System |
| React Router v7 | Routing & Code Splitting |
| Framer Motion | Animationen & Transitions |
| react-helmet-async | SEO Meta-Tags, OG, JSON-LD |
| Zustand | Globales State Management (inkl. Page Builder Store) |
| Lucide React | Icons (tree-shakeable) |
| ESLint + Prettier | Code-Qualität |

### Backend (Phase 2)
| Technologie | Zweck |
|-------------|-------|
| Node.js + NestJS | API Framework (modular, skalierbar) |
| PostgreSQL + Prisma ORM | Datenbank (relational, typsicher) |
| JWT + Passport.js | Authentifizierung & Sessions |
| Nodemailer / Resend | Kontaktformular & Newsletter |
| class-validator | Input Validation |

### Infrastruktur
| Technologie | Zweck |
|-------------|-------|
| IONOS VPS (Ubuntu 22.04) | Server (bereits vorhanden) |
| Nginx | Reverse Proxy & Static Files |
| Docker + Docker Compose | Container & Umgebungen |
| PM2 | Node Process Manager |
| Certbot (Let's Encrypt) | SSL / HTTPS |
| GitHub Actions | CI/CD Pipeline |

---

## 📁 Projektstruktur (Monorepo)

```
candlescope/
├── apps/
│   ├── frontend/
│   │   └── src/
│   │       ├── admin/                  # Admin Panel & Page Builder
│   │       │   ├── AdminLayout.tsx     # Layout mit Sidebar
│   │       │   ├── AdminDashboard.tsx  # Übersicht / Startseite
│   │       │   ├── PageList.tsx        # Alle Seiten verwalten
│   │       │   ├── PageEditor.tsx      # Baukasten öffnen
│   │       │   ├── BlockEditor.tsx     # Block konfigurieren
│   │       │   └── AdminLogin.tsx      # PIN-Schutz
│   │       ├── blocks/                 # Page Builder Blöcke
│   │       │   ├── HeroBlock.tsx       # Default — bereits implementiert
│   │       │   ├── TextBlock.tsx
│   │       │   ├── CardGridBlock.tsx
│   │       │   ├── ListBlock.tsx
│   │       │   ├── ImageBlock.tsx
│   │       │   ├── StatsBlock.tsx
│   │       │   ├── CtaBannerBlock.tsx
│   │       │   ├── TimelineBlock.tsx
│   │       │   ├── DividerBlock.tsx
│   │       │   └── EmbedBlock.tsx
│   │       ├── components/
│   │       │   ├── layout/
│   │       │   │   ├── Header.tsx      # ✅ Fertig
│   │       │   │   ├── Footer.tsx      # ✅ Fertig
│   │       │   │   ├── RootLayout.tsx  # ✅ Fertig
│   │       │   │   └── ScrollToTop.tsx # ✅ Fertig
│   │       │   └── ui/
│   │       │       └── PageHero.tsx    # ✅ Fertig — Default Hero Block
│   │       ├── data/
│   │       │   └── pages.ts            # Mockdaten Phase 1
│   │       ├── pages/                  # ✅ Alle angelegt
│   │       │   ├── HomePage.tsx
│   │       │   ├── FinancePage.tsx
│   │       │   ├── DevPage.tsx
│   │       │   ├── AboutPage.tsx
│   │       │   ├── CommunityPage.tsx
│   │       │   ├── ContactPage.tsx
│   │       │   ├── AdminPage.tsx
│   │       │   ├── ImpressumPage.tsx
│   │       │   ├── DatenschutzPage.tsx
│   │       │   └── NotFoundPage.tsx
│   │       ├── store/
│   │       │   ├── usePagesStore.ts    # Seiten & Blöcke State
│   │       │   └── useAdminStore.ts    # Admin Auth State
│   │       ├── types/
│   │       │   └── page.types.ts       # Block & Page TypeScript Typen
│   │       ├── App.tsx                 # ✅ Router komplett
│   │       ├── main.tsx
│   │       └── styles/index.css
│   │
│   └── backend/                        # Phase 2
│       └── src/
│           ├── modules/
│           │   ├── auth/
│           │   ├── users/
│           │   ├── pages/              # Page Builder API
│           │   ├── blog/
│           │   ├── newsletter/
│           │   ├── contact/
│           │   ├── shop/
│           │   └── courses/
│           └── prisma/
│
├── packages/shared/                    # Geteilte Types
├── .github/workflows/
├── docker-compose.yml
├── .env.example
├── pnpm-workspace.yaml
└── package.json
```

---

## 🗺️ Sitemap (aktuell)

```
candlescope.de/
├── /                    # Home — Candlestick-Animation + Hero
├── /finance             # Finance — ETF-Trendlinie + Hero
├── /dev                 # Dev & Web — Terminal-Fenster + Hero
├── /about               # About — Netzwerk-Graph + Hero
├── /community           # Community — Signal-Wellen + Hero
├── /contact             # Kontakt — Morse-Code + Hero
├── /admin               # Admin Panel (versteckter Zugang)
│   ├── /admin/pages     # Seiten verwalten
│   ├── /admin/pages/:id # Page Editor / Baukasten
│   └── /admin/settings  # Einstellungen
├── /impressum           # ⚠️ Pflicht
├── /datenschutz         # ⚠️ Pflicht
└── /404                 # Not Found
```

---

## 🎨 Design System

### Farbpalette — Dark & Premium

| Rolle | Hex |
|-------|-----|
| Background Primary | `#080808` |
| Background Secondary | `#0d0d0d` |
| Background Elevated | `#1a1a1a` |
| Accent Gold | `#C9A84C` |
| Accent Gold Light | `#E8C56D` |
| Text Primary | `#F5F0E8` |
| Text Secondary | `#9A9590` |
| Text Muted | `#5a5550` |
| Text Ghost | `#3a3530` |
| Success | `#00C896` |
| Error | `#FF4444` |

### Typography

| Einsatz | Font | Gewicht |
|---------|------|---------|
| Display / Headlines | Cinzel | 400 / 600 / 700 |
| Body / UI | DM Sans | 300 / 400 / 500 |
| Code / Mono | JetBrains Mono | 400 / 500 |

### Komponenten-Muster
- Buttons: `rounded-full`, Gold-Border, Fill-Animation von unten
- Cards: `bg-[#0d0d0d]`, `border border-[#C9A84C]/15`, `rounded-2xl`
- Nav-Links: Uppercase, `tracking-[0.1em]`, goldene Underline bei aktiv
- Tooltips: `bg-[#0f0f0f]`, `border-[#C9A84C]/20`, `rounded-xl`

---

## 🏗️ Admin Panel & Page Builder

### Konzept
Eingebettetes CMS direkt in der Website. Zugang über versteckte URL + PIN-Schutz. Kein separates System — alles in React.

### Zugang
```
/admin?key=GEHEIMER_KEY  →  PIN eingeben  →  Admin Dashboard
```

### Page Builder Datenstruktur
```typescript
type BlockType =
  | 'hero'        // ✅ Default — PageHero bereits implementiert
  | 'text'
  | 'card-grid'
  | 'list'
  | 'image'
  | 'stats'
  | 'cta-banner'
  | 'timeline'
  | 'divider'
  | 'embed'

interface Block {
  id: string
  type: BlockType
  props: Record<string, unknown>
  order: number
}

interface Page {
  id: string
  slug: string
  title: string
  navLabel?: string          // Anzeigename in Navigation
  navIcon?: string           // Lucide Icon Name
  navPosition?: number       // Reihenfolge in der Nav
  showInNav: boolean
  theme?: HeroTheme          // Für Hero-Block
  blocks: Block[]
  createdAt: string
  updatedAt: string
}
```

### Datenfluss
- **Phase 1:** `src/data/pages.ts` → Zustand Store → `DynamicPage` rendert Blöcke
- **Phase 2:** NestJS API `/api/pages` → gleiche Store-Struktur → kein Frontend-Umbau nötig

---

## 🚀 Phase 1 — Fundament & Marken-Präsenz
### Monat 1–2

### ✅ Bereits erledigt
- Monorepo initialisiert (pnpm workspaces)
- Git Repository + GitHub Remote
- Vite + React + TypeScript
- Tailwind CSS v4
- ESLint + Prettier
- React Router v7 (alle Routes)
- Header (Desktop Nav + Mobile Icon-Sidebar)
- Footer (4-Spalten)
- RootLayout + ScrollToTop
- PageHero Komponente mit 6 thematischen SVG-Animationen
- Alle Pages scaffolded (Home, Finance, Dev, About, Community, Contact, Admin, Impressum, Datenschutz, 404)

### 🔛 In Arbeit
- [ ] Admin Panel Grundstruktur (PIN-Schutz, Layout, Dashboard)
- [ ] TypeScript Typen für Page Builder
- [ ] Zustand Stores (usePagesStore, useAdminStore)
- [ ] Mockdaten pages.ts

### 🔜 Offen
- [ ] Block-Komponenten (alle 10 Typen)
- [ ] Page Editor / Baukasten UI
- [ ] DynamicPage Renderer
- [ ] SEO Setup (react-helmet-async, sitemap, robots.txt)
- [ ] Performance Optimierung (Lighthouse > 90)
- [ ] Google Search Console
- [ ] Impressum + Datenschutz Inhalte vervollständigen
- [ ] Erster Commit auf GitHub Actions CI/CD
- [ ] VPS Setup (Ubuntu, Nginx, SSL)
- [ ] Domain candlescope.de live schalten

---

## ⚡ Phase 2 — Dynamik & Community
### Monat 3–5

- [ ] NestJS Backend live
- [ ] PostgreSQL + Prisma
- [ ] Page Builder API (CRUD für Pages & Blöcke)
- [ ] Auth: JWT Login für Admin
- [ ] Kontaktformular mit API
- [ ] Newsletter-Anmeldung
- [ ] Cookie-Banner (DSGVO)
- [ ] Plausible Analytics

---

## 💰 Phase 3 — Monetarisierung & Scale
### Monat 6–12

- [ ] Merch Shop (Stripe + Printful)
- [ ] Kursplattform (Video + Text, Members-only)
- [ ] Beratungs-Booking (Calendly oder custom)
- [ ] Revenue Tracking Dashboard
- [ ] Sentry Error Tracking

---

## ⚠️ Rechtliches — Pflicht ab Tag 1

| Pflicht | Basis | Priorität |
|---------|-------|-----------|
| Impressum | § 5 TMG | 🔴 Sofort |
| Datenschutzerklärung | DSGVO | 🔴 Sofort |
| Haftungsausschluss Finance | Keine BaFin-Lizenz | 🔴 Sofort |
| Cookie-Banner | DSGVO | 🟡 Phase 2 |
| AGB + Widerrufsrecht | Shop / Kurse | 🟡 Phase 3 |

---

## 🔑 Tools & Services

| Kategorie | Tool |
|-----------|------|
| Package Manager | pnpm |
| DB Client | TablePlus |
| API Testing | Thunder Client (VS Code) |
| Mail | Resend |
| Merch | Printful |
| Payment | Stripe |
| Analytics | Plausible (DSGVO-konform) |
| Error Tracking | Sentry |
| Design | Figma |
| Booking | Calendly |

---

*CandleScope.de · Chris Schubert · Stand: März 2026*