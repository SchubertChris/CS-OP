# Website Redesign — Design Spec
Erstellt: 19. April 2026  
Scope: Subsystem 1 von 4 — Website Redesign (Navigation + FinancePage + DSGVO-Layer + Download-Modell)

---

## Ziel

candlescope.de von einer generischen Portfolio-Seite zu einer **produktzentrierten Marketing-Site** umbauen. Der Besucher soll in unter 5 Sekunden verstehen: Was ist das, für wen ist es, was kostet es, wie bekomme ich es.

Die Seite ist live — keine Änderungen an Vercel-Konfiguration, DNS oder Routing. Alles passiert durch Code-Änderungen die Vercel automatisch deployed.

---

## Was sich ändert (Scope)

| Bereich | Änderung |
|---------|---------|
| Navigation / Header | Komplett neu — Pill-Nav mit echtem Logo |
| FinancePage | Komplett neu strukturiert — 8 Sektionen |
| Footer | Community-Link ergänzt, Discord-Link gesetzt |
| Favicon + Logo | FinanceBoard-Logo (`icon.png`) ersetzt Vite-Platzhalter |
| DSGVO-Layer | CookieBanner aktivieren, Datenschutz-Seite aktualisieren |
| Soziale Links | Zentralisiert in `src/data/socials.ts` |
| Content-Korrekturen | Tech-Tags, Theme-Namen, Modulzahl, E-Mail |

## Was NICHT geändert wird (Out of Scope)

- Vercel / DNS / Domain-Konfiguration — **kein Anfassen**
- Admin Panel — eigene Session
- Dev-Page, About-Page, Community-Page, Contact-Page — Inhalte bleiben vorerst
- Datenbankstruktur / Store / Page Builder — unverändert
- React Router, Vite-Config, Tailwind-Config — unverändert

---

## 1. Logo & Favicon

### Entscheidung
Das Candlescope CS-Monogramm (goldenes Fadenkreuz mit Candlestick, 1024×1024 PNG) aus dem FinanceBoard-Projekt wird als primäres Logo und Favicon verwendet.

### Änderungen
- `public/logo.png` — bereits kopiert (FinanceBoard `assets/icon.png`)
- `public/favicon.png` — durch `logo.png` ersetzen
- `public/favicon.svg` — bestehende Vite-SVG entfernen, neues SVG als 1:1-Trace des Logos (oder PNG-Favicon reicht)
- `index.html` — `<link rel="icon">` auf `favicon.png` zeigen

### Verwendung im Code
```tsx
// Header.tsx
<img src="/logo.png" alt="Candlescope" className="w-8 h-8 object-contain" />
<span className="font-bold text-[#F5F0E8] tracking-wide">CANDLESCOPE</span>
```

---

## 2. Navigation — Pill-Nav

### Design
Fixierte Header-Bar, transparent beim Start → `backdrop-blur` + `bg-[#080808]/80` ab 40px Scroll (bestehendes Verhalten bleibt).

```
[Logo + "CANDLESCOPE"]   [Finance · Dev & Web · About · Community · Kontakt]   [↓ Gratis laden]
```

- **Logo links:** `img` 32×32px + Schriftzug "CANDLESCOPE" in `#F5F0E8`, `font-bold`, `tracking-[0.04em]`
- **Pill-Container Mitte:** `bg-[#111]`, `border border-[#C9A84C]/12`, `rounded-full`, `px-5 py-1.5`
  - Aktiver Link: `text-[#C9A84C] font-semibold`
  - Inaktive Links: `text-[#9A9590]`, Hover: `text-[#F5F0E8]`, Transition 150ms
- **CTA rechts:** `bg-[#C9A84C]`, `text-[#080808]`, `font-bold`, `rounded-full`, `px-5 py-2`, Text: "↓ Gratis laden"
  - Beim Scroll sichtbar ab 40px (gleiche Logik wie aktuell)
- **Mobile:** Bestehende Icon-Sidebar rechts bleibt — nur Logo-Icon tauschen

### Datei: `src/components/layout/Header.tsx`
Bestehende Struktur beibehalten, nur folgende Teile tauschen:
1. Logo-Bereich: Vite-SVG → `<img src="/logo.png">` + Schriftzug
2. Desktop-Nav: Normaler flex → Pill-Wrapper um die Links
3. CTA-Button: `rounded-md` → `rounded-full`

---

## 3. FinancePage — Neue Seitenstruktur

Reihenfolge der Sektionen (Conversion-Funnel "Vertrauen zuerst"):

```
① HERO          Split-Layout
② USP-STRIP     4 Kernaussagen horizontal
③ SCREENSHOTS   Großer App-Slider (alle 10 Ansichten)
④ FEATURES      10 Module als Icon-Grid
⑤ STATS         Zahlen-Leiste
⑥ DOWNLOAD      Split-Card (Inhalte + CTA)
⑦ FAQ           5 häufige Fragen
⑧ FOOTER-CTA    Letzter Kaufimpuls
```

### 3.1 Hero — Split-Layout

**Links (Text-Block):**
- Badge-Pill: `bg-[#C9A84C]/8 border border-[#C9A84C]/20 rounded-full` → Text: "v10.6 · Jetzt verfügbar"
- Headline: `font-black text-5xl leading-[1.05]` → "FinanceBoard.\nOffline.\nUnter Kontrolle."
  - "Board." in `text-[#C9A84C]`
- Subtext: `text-[#9A9590] text-base leading-relaxed max-w-sm` → "Kein Cloud-Zwang. Keine Abo-Falle. Deine Finanzen bleiben auf deinem Gerät — für immer."
- 3 Benefit-Zeilen mit `✓` in Gold: "Daten bleiben lokal", "10 integrierte Module", "Einmalig — kein Abo"
- CTAs: Primary `bg-[#C9A84C] text-[#080808] font-bold rounded-md px-6 py-3` → "↓ Gratis herunterladen"
         Secondary `border border-[#C9A84C]/25 text-[#9A9590] rounded-md px-5 py-3` → "Demo ansehen →"

**Rechts (App-Fenster):**
- Simulates echtes Electron-Fenster: Titlebar mit 3 Dots + "Candlescope FinanceBoard v10.6"
- Inhalt: Echter App-Screenshot (Dashboard-Ansicht, Candlescope-Theme)
- Format: `rounded-xl overflow-hidden border border-[#C9A84C]/15 shadow-[0_0_60px_rgba(201,168,76,0.08)]`
- Bild: `src/assets/screenshots/dashboard.webp` — neu zu erstellen (1440×900, WebP)
- Subtiler Glow-Ring hinter dem Fenster: `absolute inset-0 rounded-xl bg-[#C9A84C]/3 blur-3xl -z-10`

**Hintergrund Hero:**
- Radial-Gradient von oben: `radial-gradient(ellipse at 50% -20%, rgba(201,168,76,0.08) 0%, transparent 60%)`
- Feine horizontale Linie unter dem Hero als Sektion-Trennlinie

### 3.2 USP-Strip

4 Kacheln horizontal, `border-t border-b border-[#C9A84C]/8`, `py-8`:

| Lucide Icon | Headline | Subtext |
|------------|---------|---------|
| `WifiOff` | Offline-First | Keine Internetverbindung nötig |
| `BadgeCheck` | Einmalig kaufen | Kein Abo, keine versteckten Kosten |
| `Monitor` | Windows 10 / 11 | Desktop-App, ~150 MB |
| `Lock` | Deine Daten | Alles lokal in `%APPDATA%` |

Alle Icons: `strokeWidth={1.5}`, `className="w-6 h-6 text-[#C9A84C]"` — Installation: `npm install lucide-react`

### 3.3 Screenshots — App-Slider

- Horizontaler Scroll-Slider, alle 10 App-Ansichten
- Framer Motion `drag="x"` für Swipe
- Jedes Bild: `aspect-[16/10] rounded-xl border border-[#C9A84C]/10 overflow-hidden`
- Tab-Leiste über dem Slider: "Dashboard · Transaktionen · Jahresanalyse · Verträge · ..." — aktiver Tab gold underline
- Screenshots neu erstellen: **WebP, 1440×900px, immer Candlescope-Theme (Gold/Dunkel)**

Benötigte Dateien in `src/assets/screenshots/`:
```
dashboard.webp, transaktionen.webp, jahresuebersicht.webp,
vertraege.webp, kreditoren.webp, sparziele.webp,
visionboard.webp, archiv.webp, einstellungen.webp, docs.webp
```

### 3.4 Features — 10 Module

Grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4`

Jede Kachel: `bg-[#111] border border-[#C9A84C]/8 rounded-xl p-5 hover:border-[#C9A84C]/20 transition-colors`
- Lucide-Icon oben (`text-[#C9A84C] w-6 h-6 stroke-[1.5]`)
- Titel `text-[#F5F0E8] font-semibold text-sm mt-3`
- Beschreibung `text-[#9A9590] text-xs mt-1 leading-relaxed`

Module (korrigiert gegenüber aktuellem Stand):

| Modul | Icon | Beschreibung |
|-------|------|-------------|
| Dashboard | `LayoutDashboard` | KPIs, Cockpit, Zahlungsübersicht |
| Transaktionen | `ArrowLeftRight` | Buchungen, Kategorien, Filter |
| Jahresanalyse | `CandlestickChart` | Candlestick + Prognose-Charts |
| Verträge | `FileText` | Subscriptions, Vertragsverwaltung |
| Kreditoren | `Building2` | Payees mit Favicon-Pills |
| Sparziele | `Target` | Tracker mit Live-Feedback |
| Vision Board | `Layers` | Canvas für finanzielle Ziele |
| Archiv | `Archive` | Dokumentenverwaltung |
| Einstellungen | `Settings` | 6 Themes, Fonts, Privacy Lock |
| Import / Export | `Download` | .fbs Format, CSV, Safepoints |

### 3.5 Stats

Horizontale Leiste, `border-t border-b border-[#C9A84C]/8 py-10`:

| Zahl | Label |
|------|-------|
| 10 | Module |
| 6 | Themes |
| 100% | Offline |
| 0 | Abos |

`AnimatedCounter` Komponente (bereits vorhanden) — `font-bold text-4xl text-[#F5F0E8]`

### 3.6 Download-Sektion

Split-Card: `grid grid-cols-[1.4fr_1fr] gap-0 bg-[#111] border border-[#C9A84C]/15 rounded-2xl overflow-hidden`

**Links — Was ist enthalten:**
- `bg-[#111] p-8 border-r border-[#C9A84C]/8`
- Titel: "Was du bekommst"
- Liste mit `✓` Checks (Lucide `Check`-Icon in `#C9A84C`):
  - 10 integrierte Module
  - 6 Themes inkl. Hell- und Dunkel-Modi
  - Lokale Datensicherheit (kein Cloud-Upload)
  - Automatische Safepoints (stündlich)
  - Import / Export (.fbs + CSV)
  - Kein Abo — einmalig

**Rechts — CTA:**
- `bg-[#0e0e0e] p-8 flex flex-col items-center justify-center text-center`
- Durchgestrichener Preis: `text-[#5a5550] line-through text-sm` → "39 €"
- Hauptpreis: `text-[#C9A84C] text-5xl font-black` → "Gratis"
- Subtext: `text-[#5a5550] text-xs` → "Für begrenzte Zeit"
- Download-Button: `bg-[#C9A84C] text-[#080808] font-bold w-full rounded-md py-3` → "↓ Windows herunterladen"
- Ko-fi-Button: `border border-[#C9A84C]/20 w-full rounded-md py-2.5 flex items-center justify-center gap-2` → ☕ "Projekt unterstützen"
- Hinweis: `text-[#5a5550] text-[10px] mt-2` → "Freiwillig · via Ko-fi"

**Download-Link:** Direkt auf GitHub Releases oder Vercel-hosted Binary (`/downloads/FinanceBoard-Setup.exe`). Kein Zahlungs-Gateway nötig.

**Ko-fi-Integration:** Einfacher Link auf `https://ko-fi.com/[username]` — kein Embed, kein SDK. Öffnet neuen Tab.

**Umbau auf Bezahlung später:** Nur 3 Änderungen nötig:
1. "Gratis" → Preis-Zahl
2. Download-Button → Link zu Lemon Squeezy / Gumroad
3. Ko-fi-Button entfernen oder als "Donation" beibehalten

### 3.7 FAQ

`max-w-2xl mx-auto` — Accordion-Komponente (Framer AnimatePresence für smooth open/close)

5 Fragen:
1. "Läuft die App auf Mac oder Linux?" → Nein, aktuell nur Windows 10 / 11 (64-Bit)
2. "Wo werden meine Daten gespeichert?" → Lokal auf deinem PC unter `%APPDATA%/candlescope-financeboard/`
3. "Was passiert wenn ich die App lösche?" → Daten bleiben in AppData erhalten. Manuell löschbar.
4. "Gibt es automatische Updates?" → Noch nicht. Neue Versionen werden hier bekannt gegeben.
5. "Was bedeutet 'für begrenzte Zeit kostenlos'?" → Sobald das Produkt offiziell verkauft wird, gilt der Preis für neue Downloads. Wer jetzt lädt, behält die App dauerhaft.

### 3.8 Footer-CTA

Letzte Sektion vor Footer: `py-20 text-center`
- Headline: `text-3xl font-bold text-[#F5F0E8]` → "Deine Finanzen. Dein Gerät."
- Sub: `text-[#9A9590]` → "Kostenlos starten — kein Konto, kein Abo, keine Cloud."
- Button: identisch mit Hero-Primary-CTA

---

## 4. Footer — Korrekturen

**Datei:** `src/components/layout/Footer.tsx`

1. Community-Link in `footerNav` ergänzen: `{ label: 'Community', href: '/community' }`
2. Discord-Link: `href={SOCIALS.discord}` (via `socials.ts`)
3. E-Mail: `hello@candlescope.de` (einheitlich)

---

## 5. Soziale Links — Zentralisierung

**Neue Datei:** `src/data/socials.ts`

```typescript
export const SOCIALS = {
  discord:   'https://discord.gg/HRxbTW4ujT',  // korrekten Code einsetzen
  github:    'https://github.com/SchubertChris',
  instagram: 'https://www.instagram.com/candlescope',
  kofi:      'https://ko-fi.com/candlescope',   // nach Account-Erstellung setzen
  email:     'hello@candlescope.de',
  calendly:  '',  // leer bis Link vorhanden, dann Card einblenden
} as const
```

Alle Dateien die aktuell Links hardcoden auf `SOCIALS.*` umstellen:
- `Footer.tsx`, `ContactPage.tsx`, `CommunityPage.tsx`, `AboutPage.tsx`, `DevPage.tsx`

---

## 6. DSGVO-Layer

### Rechtliche Ausgangslage
- Keine Tracking-Skripte (kein Google Analytics, kein Facebook Pixel)
- Externe APIs: GitHub (keine personenbez. Daten), Discord (keine personenbez. Daten)
- Formspree: verarbeitet E-Mail-Adressen → Auftragsverarbeitung, in Datenschutz erwähnen
- Ko-fi: externer Dienst, kein Embed → Hinweis in Datenschutz reicht
- localStorage: technisch notwendig (Page Builder, Admin-State) → kein Consent nötig

### Maßnahmen

**CookieBanner aktivieren:**
- `src/components/ui/CookieBanner.tsx` existiert — in `RootLayout.tsx` einbinden falls noch nicht geschehen
- Nur "technisch notwendige Cookies" Banner (kein Consent-Dialog nötig da kein Tracking)
- Text: "Diese Seite nutzt ausschließlich technisch notwendige Cookies. Keine Tracking-Dienste."
- Einmalig wegklicken, dann `localStorage.setItem('csf_cookie_consent', '1')` setzen

**Datenschutzerklärung (`/datenschutz`) aktualisieren:**
Mindestinhalt nach DSGVO (TDDDG / DSGVO Stand 2026):
1. Verantwortlicher: Name + Anschrift + E-Mail
2. Hosting: Vercel Inc. — Standardvertragsklauseln (SCCs) vorhanden
3. Kontaktformular: Formspree (Auftragsverarbeiter), Daten nur zur Anfragebeantwortung
4. GitHub API: öffentliche Daten, keine Speicherung
5. Discord API: öffentliche Serverdaten, keine Speicherung
6. localStorage: technisch notwendig, keine Weitergabe
7. Betroffenenrechte: Auskunft, Löschung, Widerspruch
8. Keine Analyse-Dienste, kein Tracking

**Impressum (`/impressum`) — Pflichtangaben:**
- Name + Adresse (Privatperson reicht, kein Gewerbe erforderlich)
- E-Mail-Adresse
- Hinweis: "Verantwortlich für den Inhalt: [Name]"
- Kein Gewerbe → kein Handelsregistereintrag nötig

---

## 7. Content-Korrekturen (aus AUSBAU.md übernommen)

Diese Fixes laufen parallel zur Neustrukturierung:

| Datei | Problem | Fix |
|-------|---------|-----|
| `DevPage.tsx:418` | FinanceBoard-Tags: React/TypeScript | → `['Electron', 'Vanilla JS', 'Chart.js', 'CSS']` |
| `FinancePage.tsx:362` | Theme-Name "Nacht-Blau" | → `['Gold', 'Mono', 'Dunkel', 'Crimson', 'Hell', 'Ivory']` |
| `FinancePage.tsx:243` | Stats: "8+ Module" | → `10` |
| `data/pages.ts:97` | Community Badge "Coming soon" | → `'Jetzt live'` |
| `docs.js` (FinanceBoard) | `info@candlescope.de` | → `hello@candlescope.de` |

---

## 8. Screenshots — Anforderungen

Vor der Implementierung müssen 10 App-Screenshots erstellt werden:

- **Format:** WebP
- **Auflösung:** 1440 × 900 px
- **Theme:** Candlescope (Gold/Dunkel) — immer
- **Fenster:** App-Fenster ohne OS-Chrome (nur App-Inhalt)
- **Realdaten:** Beispieldaten (kein leerer State)
- **Benennung:** `dashboard.webp`, `transaktionen.webp`, `jahresuebersicht.webp`, `vertraege.webp`, `kreditoren.webp`, `sparziele.webp`, `visionboard.webp`, `archiv.webp`, `einstellungen.webp`, `docs.webp`
- **Ablage:** `src/assets/screenshots/`

Screenshots werden manuell erstellt (Electron-App starten → Fenster auf 1440×900 → Snipping Tool / Greenshot).

---

## 9. Neue Komponenten

| Komponente | Datei | Zweck |
|-----------|-------|-------|
| `ScreenshotSlider` | `src/components/finance/ScreenshotSlider.tsx` | Drag-Slider für 10 App-Screenshots |
| `FaqAccordion` | `src/components/finance/FaqAccordion.tsx` | Accordion mit AnimatePresence |
| `DownloadCard` | `src/components/finance/DownloadCard.tsx` | Split-Card mit Ko-fi |
| `UspStrip` | `src/components/finance/UspStrip.tsx` | 4-Kachel-Leiste |
| `FeatureGrid` | `src/components/finance/FeatureGrid.tsx` | 10-Modul-Grid mit Lucide-Icons |

Alle neuen Komponenten: rein presentational, keine Store-Abhängigkeiten.

---

## 10. Stabilität — Was nicht kaputt gehen darf

| Was | Warum sicher |
|-----|-------------|
| Vercel Deploy | Nur Code-Änderungen, kein `vercel.json`-Anfassen |
| DNS / Domain | Kein Anfassen |
| Bestehendes Routing | Alle Routen bleiben, keine neue Route ohne Eintrag in Router |
| Page Builder | Store + Persistenz unverändert |
| Admin Panel | Unverändert bis eigene Session |
| `index.html` | Nur `<link rel="icon">` ändert sich |

---

## 11. Implementierungs-Reihenfolge

1. `src/data/socials.ts` erstellen — Fundament für alle anderen Änderungen
2. Logo + Favicon tauschen
3. `Header.tsx` — Pill-Nav
4. Content-Korrekturen (DevPage, FinancePage Tags, Stats, pages.ts)
5. DSGVO: CookieBanner einbinden, Datenschutz + Impressum Texte aktualisieren
6. Lucide React installieren
7. Screenshots erstellen (manuell)
8. FinancePage Neustruktur (Komponenten + Sektionen in Reihenfolge)
9. Footer-Fixes
10. Ko-fi-Link eintragen sobald Account erstellt

---

## Offene Entscheidungen (Chris)

| # | Frage | Auswirkung |
|---|-------|-----------|
| A | Welcher Discord Invite-Code ist korrekt? | `socials.ts` |
| B | Ko-fi Username? | Download-Section CTA |
| C | Download-URL für EXE? | GitHub Releases oder `/downloads/` |
| D | Echter Name + Adresse für Impressum? | Rechtspflicht |
| E | Ist Instagram-Account aktiv? | ContactPage |

---

*Nächster Schritt: Implementierungsplan erstellen (writing-plans).*  
*Danach separate Sessions für: Admin Panel Neubau · Zahlungsdienstleister (nach Gewerbe).*
