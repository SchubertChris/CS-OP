# 🕯️ CandleScope.de — Projekt Roadmap

> **Chris Schubert** · Personal Brand · WebDev · Finance · Gaming · Merch · Kurse  
> Domain: `candlescope.de` · Stack: React + Vite + TS · NestJS · PostgreSQL · IONOS VPS

---

## 🧭 Überblick

| # | Phase | Zeitraum | Status |
|---|-------|----------|--------|
| 1 | Fundament & Marken-Präsenz | Monat 1–2 | 🔜 Offen |
| 2 | Dynamik & Community | Monat 3–5 | 🔜 Offen |
| 3 | Monetarisierung & Scale | Monat 6–12 | 🔜 Offen |

---

## 🏛️ Marken-Säulen

CandleScope steht auf fünf eigenständigen Säulen — alle unter einer Markensprache vereint.

| Säule | Inhalt | Zielgruppe |
|-------|--------|------------|
| 💻 **WebDev** | Projekte, Code, Open Source, Portfolio | B2B, Kooperationen |
| 📈 **Finance** | Aktien, Krypto, DeFi, Anlageberatung | B2C, Investoren |
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
| Zustand | Globales State Management |
| Lucide React | Icons (tree-shakeable) |

### Backend
| Technologie | Zweck |
|-------------|-------|
| Node.js + NestJS | API Framework (modular, skalierbar) |
| PostgreSQL + Prisma ORM | Datenbank (relational, typsicher) |
| JWT + Passport.js | Authentifizierung & Sessions |
| Nodemailer | Kontaktformular & Newsletter |
| class-validator | Input Validation |

> **DB-Alternative:** MongoDB + Mongoose — wenn Content-Flexibilität Vorrang hat

### Infrastruktur
| Technologie | Zweck |
|-------------|-------|
| IONOS VPS (Ubuntu 22.04) | Server |
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
│   ├── frontend/                  # React + Vite + TS
│   │   ├── public/
│   │   │   ├── favicon.ico
│   │   │   ├── og-image.jpg
│   │   │   ├── robots.txt
│   │   │   └── sitemap.xml
│   │   └── src/
│   │       ├── assets/            # Bilder, Fonts, SVGs
│   │       ├── components/
│   │       │   ├── ui/            # Button, Card, Badge, Input...
│   │       │   └── layout/        # Header, Footer, Section
│   │       ├── features/          # Feature-Module je Seitenbereich
│   │       │   ├── hero/
│   │       │   ├── about/
│   │       │   ├── projects/
│   │       │   ├── blog/
│   │       │   ├── finance/
│   │       │   ├── shop/
│   │       │   └── contact/
│   │       ├── pages/             # Routing-Ebene
│   │       │   ├── HomePage.tsx
│   │       │   ├── AboutPage.tsx
│   │       │   ├── ProjectsPage.tsx
│   │       │   ├── BlogPage.tsx
│   │       │   ├── BlogPostPage.tsx
│   │       │   ├── ServicesPage.tsx
│   │       │   ├── ContactPage.tsx
│   │       │   └── NotFoundPage.tsx
│   │       ├── hooks/             # Custom React Hooks
│   │       ├── lib/               # Hilfsfunktionen, Konstanten
│   │       ├── styles/            # Global CSS, Tailwind Config
│   │       ├── types/             # Globale TypeScript Typen
│   │       ├── App.tsx
│   │       └── main.tsx
│   │
│   └── backend/                   # NestJS + Prisma
│       └── src/
│           ├── modules/
│           │   ├── auth/          # JWT, Login, Register
│           │   ├── users/         # User CRUD
│           │   ├── blog/          # Artikel, Kategorien
│           │   ├── newsletter/    # Subscriptions
│           │   ├── contact/       # Kontaktformular
│           │   ├── shop/          # Produkte, Bestellungen
│           │   └── courses/       # Kurse, Enrollments
│           ├── common/            # Guards, Pipes, Interceptors
│           ├── config/            # Env, Konfiguration
│           ├── prisma/            # Schema, Migrations
│           ├── app.module.ts
│           └── main.ts
│
├── packages/
│   └── shared/                    # Geteilte Types, Utils, Konstanten
│       ├── types/
│       ├── utils/
│       └── constants/
│
├── .github/
│   └── workflows/
│       ├── deploy-frontend.yml
│       └── deploy-backend.yml
│
├── docker-compose.yml
├── .env.example
├── .gitignore
├── pnpm-workspace.yaml
└── package.json
```

---

## 🗺️ Sitemap

```
candlescope.de/
├── /                        # Home — Hero, Skills, CTA
├── /about                   # Story, Stack, Social Links
├── /projects                # Portfolio, GitHub, Live Demos
├── /blog                    # Artikel: Finance, Tech, Dev
│   └── /blog/:slug          # Einzelner Artikel
├── /services                # Kurse, Merch, Beratung (Übersicht)
├── /contact                 # Kontaktformular, Buchung
│
├── /members          ②      # Login, Dashboard (Phase 2)
├── /shop             ③      # Merch-Shop (Phase 3)
├── /courses          ③      # Kursplattform (Phase 3)
│
├── /impressum        ⚠️     # Pflicht ab Tag 1
├── /datenschutz      ⚠️     # Pflicht ab Tag 1
└── /404                     # Not Found
```

---

## 🎨 Design System

### Farbpalette — Dark & Premium

| Rolle | Farbe | Hex |
|-------|-------|-----|
| Background Primary | Fast-Schwarz | `#0D0D0D` |
| Background Secondary | Dunkelgrau | `#1A1A1A` |
| Background Elevated | Anthrazit | `#2A2A2A` |
| Accent Primary | Gold | `#C9A84C` |
| Accent Light | Helles Gold | `#E8C56D` |
| Text Primary | Elfenbein | `#F5F0E8` |
| Text Secondary | Gedämpft | `#9A9590` |
| Success | Grün | `#00C896` |
| Error | Rot | `#FF4444` |

### Typography

| Einsatz | Font | Gewicht |
|---------|------|---------|
| Display / Headlines | Playfair Display oder Cinzel | 700 |
| Body / UI | Inter | 400 / 500 |
| Code | JetBrains Mono | 400 |

### Motion Design
- **Framer Motion** für alle Seitenübergänge und Reveal-Animationen
- Prinzip: dezent, schnell, nie ablenkend
- Staggered Fade-In für Listen und Karten
- Smooth Page Transitions zwischen Routes

---

## 🚀 Phase 1 — Fundament & Marken-Präsenz
### Monat 1–2

### Ziel
Eine schnelle, saubere, SEO-optimierte Marken-Präsenz live bringen. Kein Backend, kein Login — reines Frontend mit statischen Inhalten.

### Aufgaben

**Setup & Infrastruktur**
- [ ] Monorepo initialisieren (pnpm workspaces)
- [ ] Git Repository anlegen (GitHub)
- [ ] IONOS VPS einrichten (Ubuntu 22.04)
- [ ] Nginx konfigurieren
- [ ] SSL mit Certbot einrichten
- [ ] Domain `candlescope.de` auf VPS zeigen lassen
- [ ] GitHub Actions CI/CD Pipeline aufsetzen

**Frontend Core**
- [ ] Vite + React + TypeScript Projekt anlegen
- [ ] Tailwind CSS v4 konfigurieren
- [ ] Design System einrichten (Farben, Fonts, Spacing als CSS-Variablen)
- [ ] Basis-Komponenten bauen: Button, Card, Badge, Section
- [ ] Header + Navigation (mobil-responsive)
- [ ] Footer

**Seiten (Phase 1)**
- [ ] `HomePage` — Hero, Über mich kurz, Skills, CTA
- [ ] `AboutPage` — Story, Tech-Stack, Social Links
- [ ] `ProjectsPage` — Portfolio-Grid, GitHub-Links
- [ ] `BlogPage` — Artikel-Übersicht (statisch)
- [ ] `BlogPostPage` — Einzelartikel
- [ ] `ContactPage` — Kontakt-Info (noch ohne Formular)
- [ ] `ImpressumPage` ⚠️
- [ ] `DatenschutzPage` ⚠️
- [ ] `404Page`

**SEO & Performance**
- [ ] `react-helmet-async` einrichten
- [ ] Meta-Tags, OG-Tags, Twitter-Cards je Seite
- [ ] `JSON-LD` für Organization & WebSite
- [ ] `robots.txt` anlegen
- [ ] `sitemap.xml` generieren (vite-plugin-sitemap)
- [ ] Canonical URLs
- [ ] Bilder optimieren (WebP, lazy loading)
- [ ] Lighthouse Score > 90 erreichen

---

## ⚡ Phase 2 — Dynamik & Community
### Monat 3–5

### Ziel
Backend live bringen, Nutzer können sich registrieren, Newsletter abonnieren und ein eigenes Dashboard nutzen.

### Aufgaben

**Backend Setup**
- [ ] NestJS Projekt initialisieren
- [ ] PostgreSQL auf VPS einrichten
- [ ] Prisma Schema definieren (User, Post, Newsletter, Contact)
- [ ] Prisma Migrations erstellen
- [ ] Erste NestJS Module: `auth`, `users`, `blog`, `newsletter`, `contact`
- [ ] JWT Auth implementieren (Login, Register, Refresh Token)
- [ ] REST API dokumentieren (Swagger)

**Frontend Erweiterungen**
- [ ] Kontaktformular mit API-Anbindung
- [ ] Newsletter-Anmeldung
- [ ] Login / Register Seiten
- [ ] Members Dashboard (geschützter Bereich)
- [ ] Protected Routes mit Auth Guard

**Admin Panel**
- [ ] Eigenes Admin-Dashboard (internes Tool)
- [ ] Blog-Artikel erstellen / bearbeiten / löschen
- [ ] Newsletter-Subscriber verwalten
- [ ] Kontaktanfragen einsehen

---

## 💰 Phase 3 — Monetarisierung & Scale
### Monat 6–12

### Ziel
Einnahmen generieren durch Merch-Shop, Kurse und Beratungsangebote.

### Aufgaben

**Merch Shop**
- [ ] Shop-Seite aufbauen
- [ ] Stripe Payment Integration
- [ ] Print-on-Demand via Printful (oder eigenes Lager)
- [ ] Bestellverwaltung im Backend
- [ ] Bestellbestätigung per E-Mail

**Kursplattform**
- [ ] Kurs-Modul im Backend
- [ ] Video + Text Content Struktur
- [ ] Enrollment System (Kauf → Zugang)
- [ ] Kurs-Dashboard für eingeloggte Nutzer
- [ ] Fortschritts-Tracking

**Beratungs-Buchung**
- [ ] Calendly Integration oder eigenes Booking-System
- [ ] Buchungsbestätigung per Mail
- [ ] Bezahlung vor Termin (Stripe)

**Analytics & Monitoring**
- [ ] Plausible Analytics oder Fathom (DSGVO-konform)
- [ ] Revenue Tracking Dashboard (intern)
- [ ] Server Monitoring (Uptime, Performance)
- [ ] Error Tracking (Sentry)

---

## ⚠️ Rechtliches — Pflicht ab Tag 1

> Als `.de`-Domain und deutsches Angebot gilt deutsches Recht.

| Pflicht | Basis | Priorität |
|---------|-------|-----------|
| **Impressum** | § 5 TMG — Name, Adresse, E-Mail | 🔴 Sofort |
| **Datenschutzerklärung** | DSGVO — Welche Daten, warum, wie lange | 🔴 Sofort |
| **Cookie-Banner** | DSGVO — bei Tracking/Analytics | 🟡 Vor Analytics |
| **Haftungsausschluss Finance** | Keine Anlageberatung ohne BaFin-Zulassung | 🔴 Sofort |
| **AGB** | Bei Kauf (Shop / Kurse) | 🟡 Phase 3 |
| **Widerrufsrecht** | Bei digitalen Käufen | 🟡 Phase 3 |

> 💡 Für den Finance-Bereich: Immer als "keine Finanzberatung, nur Meinung" kennzeichnen. BaFin-Lizenz ist notwendig für echte Anlageberatung gegen Entgelt.

---

## 🔑 Empfohlene Tools & Services

| Kategorie | Tool | Warum |
|-----------|------|-------|
| Package Manager | pnpm | Schnell, Monorepo-Support |
| Code Editor | VS Code + Extensions | Dein Stack |
| API Testing | Thunder Client / Postman | NestJS API testen |
| DB Client | TablePlus | PostgreSQL visualisieren |
| DNS / Domain | IONOS | Bereits vorhanden |
| Mail (transactional) | Resend oder Brevo | Günstiger als SendGrid |
| Merch | Printful | Print-on-Demand |
| Payment | Stripe | Standard, robust |
| Analytics | Plausible | DSGVO-konform, leichtgewichtig |
| Error Tracking | Sentry | Frontend + Backend |
| Design | Figma | UI Mockups |

---

*Roadmap erstellt für CandleScope.de · Chris Schubert*  
*Stack: React + Vite + TS · NestJS · PostgreSQL · IONOS VPS*# CS-OP
