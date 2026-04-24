# CandleScope Website — Status & Continuation Guide

> **Zuletzt aktualisiert:** 24. April 2026  
> **Zweck:** Vollständige Übersicht für den nächsten Session-Start — einfach diese Datei lesen, direkt loslegen.

---

## Projekt-Übersicht

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS 4 · Zustand · Framer Motion  
**Hosting:** Vercel (Frontend + API-Routes)  
**Domain:** candlescope.de (läuft)  
**Repo:** github.com/SchubertChris/CS-OP  
**Dev-Server:** `cd apps/frontend && npm run dev` (Port 5173)

---

## Aktueller Stand (April 2026)

### Was fertig ist

| Bereich | Status | Details |
|---------|--------|---------|
| Alle 10 Public Pages | ✅ Live | Home, Finance, Dev, About, Community, Contact, Impressum, Datenschutz, 404, Dynamic |
| Light/Dark Theme | ✅ Komplett | `ThemeContext.tsx`, CSS-Vars `--cs-*`, localStorage-Persistenz |
| Intro-Animation | ✅ Fertig | `IntroAnimation.tsx` — adaptiert dark/light korrekt |
| Review-System | ✅ Fertig | `useReviewStore.ts` + `TestimonialsSection.tsx` + `ReviewQueue.tsx` im Admin |
| Admin-Panel | ✅ Grundstruktur | Login (TOTP+JWT), Dashboard, ReviewQueue, Settings, PageEditor |
| Light-Mode Kontrast | ✅ Bereinigt | Alle `text-[#C9A84C]/70+` opacity-Texte auf `var(--cs-text-2)` umgestellt |
| Download-Modal | ✅ | Text: "Die erste Version geht am 8.6.2026 online — kostenlos für alle." |
| Tote Dateien | ✅ Bereinigt | `pages/AdminPage.tsx` gelöscht (war nie in `App.tsx` eingebunden) |
| AdminSettings | ✅ Korrigiert | Zeigt jetzt korrekten Auth-Stand (JWT+TOTP, nicht URL-Key) |

---

## Offene Aufgaben (priorisiert)

### Kritisch — vor nächstem Release

#### 1. Contact-Formular: Formspree ersetzen
**Datei:** `apps/frontend/src/pages/ContactPage.tsx` (Zeilen 22, 68–81)  
**Problem:** Verwendet Formspree (`VITE_FORMSPREE_ID`). Konto wurde suspendiert (keine Credits).  
**Fix-Optionen:**
- **Option A (empfohlen):** Resend.com API direkt als Vercel API-Route  
  → `apps/frontend/api/contact.ts` erstellen → `fetch('/api/contact', {...})`
- **Option B:** EmailJS (kein Backend nötig, aber Client-Key sichtbar)  
- **Option C:** Discord Webhook als Benachrichtigung (einfachste Lösung)

```typescript
// Zielzustand ContactPage.tsx handleSubmit:
const res = await fetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email, topic, message }),
})
```

#### 2. Calendly-Link vervollständigen
**Datei:** `apps/frontend/src/pages/ContactPage.tsx` (ca. Zeile 283)  
**Problem:** `href="https://calendly.com/"` — nur Domain, kein echtes Profil  
**Fix:** Echte Calendly-URL eintragen ODER Button ausblenden bis Profil erstellt

---

### Hoch — nächste Session

#### 3. Admin-Datenpersistenz (Phase 2)
**Datei:** `apps/frontend/src/store/usePagesStore.ts` (Zeile 314)  
**Problem:** Pages-Daten nur in localStorage — bei Browser-Reset weg, kein Sharing  
**Zielzustand:** Pages lesen/schreiben via `/api/pages` → PostgreSQL (Neon)  
**Kommentar im Code:** `/* Phase 2: hier API-Call → POST /api/pages/:id */`

#### 4. Review-Persistenz auf Backend
**Datei:** `apps/frontend/src/store/useReviewStore.ts`  
**Problem:** Bewertungen nur in localStorage des Admins — Besucher-Bewertungen kommen nie beim Admin an  
**Aktueller Workaround:** Admin trägt manuell ein über "Manuell hinzufügen" in ReviewQueue  
**Zielzustand:** `submit()` → POST `/api/reviews` → DB → Admin sieht alle in Queue

#### 5. Discord Invite Code zentralisieren
**Problem:** `const INVITE_CODE = 'HRxbTW4ujT'` hardcoded in `CommunityPage.tsx`  
**Fix:** In `data/socials.ts` als `discord_invite: 'HRxbTW4ujT'` auslagern

---

### Niedrig — Nice to have

#### 6. Download-Modal nach 8.6.2026 deaktivieren
**Datei:** `apps/frontend/src/components/ui/ComingSoonModal.tsx`  
**Problem:** Modal soll nach Release-Datum automatisch nicht mehr erscheinen  
**Fix:** `const RELEASE = new Date('2026-06-08')` — zeige echten Download-Link wenn `Date.now() >= RELEASE`

#### 7. Download-Count Hook verifizieren
**Datei:** `apps/frontend/src/hooks/useDownloadCount.ts`  
**Repo:** `SchubertChris/CS-OP` — GitHub Releases API  
**Check:** Gibt es bereits ein Release auf dem Repo? Wenn nicht, zählt der Hook immer 0.

#### 8. GitHub Activity Component
**Datei:** `apps/frontend/src/components/sections/GitHubActivity.tsx`  
**Status:** Nutzt 3rd-Party-API `github-contributions-api.jogruber.de` — kann ausfallen  
**Check:** Fehlerfall visuell prüfen (fällt die Komponente graceful back?)

---

## Architektur-Übersicht

```
apps/frontend/src/
├── admin/                    ← Komplettes Admin-Panel
│   ├── AdminGuard.tsx        ← Schützt /admin/* via /api/auth/me
│   ├── AdminLogin.tsx        ← Passwort + TOTP (2-Step)
│   ├── AdminDashboard.tsx    ← Übersicht + ReviewQueue eingebunden
│   ├── ReviewQueue.tsx       ← Bewertungen prüfen/ablehnen/manuell hinzufügen
│   ├── AdminSettings.tsx     ← System-Infos (korrigiert Apr 2026)
│   ├── PageList.tsx          ← Dynamische Seiten verwalten
│   └── PageEditor.tsx        ← Block-basierter Editor
├── pages/                    ← 10 Public Pages (alle in App.tsx eingebunden)
├── components/
│   ├── layout/               ← Header, Footer, RootLayout
│   ├── ui/                   ← Shared UI-Komponenten (inkl. IntroAnimation)
│   └── finance/              ← FinancePage-spezifische Sections
├── store/
│   ├── useReviewStore.ts     ← Bewertungen (localStorage + Zustand)
│   ├── usePagesStore.ts      ← Dynamische Seiten (localStorage + Zustand)
│   └── useAdminStore.ts      ← Minimaler UI-State für Admin-Sidebar
├── hooks/
│   ├── useAnalytics.ts       ← PageView + Heartbeat zu /api/track/*
│   ├── useDownloadCount.ts   ← GitHub Releases API
│   ├── useGitHubContributions.ts
│   └── useScrollReveal.ts
├── contexts/ThemeContext.tsx  ← theme: 'dark' | 'light', toggle()
├── data/
│   ├── socials.ts            ← Alle externen Links (GitHub, Discord, Ko-fi, Instagram)
│   └── pages.ts              ← Mockdaten für dynamische Seiten
└── App.tsx                   ← Router (lazy-loaded, Suspense)
```

---

## Design-System

```
CSS-Variable    Dark-Wert       Light-Wert
--cs-bg         #080808         #F2EDE2  (Beige)
--cs-text       #F0ECE8         #1A1410
--cs-text-2     #BDB5AB         #4A3F35
--cs-text-3     #6B6059         #8A7568
--cs-s2         #111111         #EDE8DE
--cs-s3         #181818         #E6E0D4

Gold: #C9A84C  (NIEMALS mit /70 opacity auf hellem Bg verwenden — Kontrast ~1.9:1)
Gold auf hellem Bg: nur für Borders, Hover-States, dekorative Elemente
Lesbarer Text auf hellem Bg: immer var(--cs-text-2) oder dunkler
```

---

## Admin-Zugang

```
URL:      /admin/login
Schritt 1: Passwort (bcrypt-Hash in Vercel Env Vars)
Schritt 2: TOTP-Code (Authenticator-App, Secret in Vercel Env Vars)
Session:   JWT-Cookie, wird von AdminGuard bei jedem /admin/*-Aufruf geprüft
Setup:     /admin/setup (einmalig, deaktiviert sich selbst nach Setup)
```

**Env Vars (Vercel Dashboard, NIE committen):**
- `admin_password_hash` — bcrypt-Hash
- `totp_secret` — TOTP-Secret
- `jwt_secret` — JWT-Signatur
- `setup_token` — einmaliges Setup-Token

---

## Bekannte Schwächen / Technische Schulden

| # | Problem | Ort | Priorität |
|---|---------|-----|-----------|
| 1 | Formspree-Account suspendiert → Kontaktformular kaputt | ContactPage.tsx | 🔴 Kritisch |
| 2 | Calendly-Link nicht vollständig | ContactPage.tsx:283 | 🟡 Hoch |
| 3 | Pages + Reviews nur localStorage, keine DB | usePagesStore + useReviewStore | 🟡 Hoch |
| 4 | Discord Invite-Code hardcoded in CommunityPage | CommunityPage.tsx | 🟢 Niedrig |
| 5 | ComingSoonModal nach 8.6 nicht automatisch deaktiviert | ComingSoonModal.tsx | 🟢 Niedrig |
| 6 | GitHub Download-Count ohne Release immer 0 | useDownloadCount.ts | 🟢 Niedrig |

---

## Git-Workflow

```bash
# Dev-Server starten
cd "Candlescope Web 01.04.2026/apps/frontend"
npm run dev

# Committen + Pushen (Vercel deployed automatisch bei Push auf main)
git add -p
git commit -m "feat/fix/chore: ..."
git push
```

**Branch:** `main` — direkt, kein Feature-Branch-Workflow (Indie-Projekt)  
**Deploy:** Automatisch via Vercel bei Push auf `main`

---

## Nächste Session — Vorschlag Einstieg

1. **Kontaktformular reparieren** (Formspree → Resend oder Discord-Webhook) — ~1h
2. **Review-System Backend-Anbindung** (POST `/api/reviews`) — ~2h  
3. **Calendly oder alternativen Buchungslink** einpflegen — ~15min
