# AUSBAU.md — CandleScope Website Ausbauplan
Erstellt: April 2026 · Basis: vollständige Analyse beider Projekte (FinanceBoard v10.6 + Website)

---

## Übersicht

| Kategorie | Punkte | Priorität |
|-----------|--------|-----------|
| 🔴 BLOCKER — vor Launch nicht ignorierbar | 6 | Sofort |
| 🟠 INHALT — Fehler & Lücken vs. FinanceBoard | 8 | Hoch |
| 🟡 FEATURES — sinnvolle Ergänzungen | 7 | Mittel |
| 🔵 DESIGN/UX — Verbesserungen | 5 | Mittel |
| 🎨 DESIGN-HARMONIE — visuelle Kohärenz beider Produkte | 8 | Hoch |
| ⚪ TECHNISCH — Code-Schulden & ENV | 5 | Niedrig–Mittel |

---

## 🔴 BLOCKER — Vor Launch zwingend

### 1. Preis auf FinancePage setzen
**Datei:** `src/pages/FinancePage.tsx:398`
- Preis-Card zeigt `XX €` — pulsiert im Hintergrund, fällt jedem sofort auf
- Einmalpreis festlegen und eintragen (Empfehlung: 29–49 €)
- Zusätzlich: "Jetzt kaufen"-Buttons (`href="/contact"`) auf echten Kauf-Link umstellen (Gumroad, Lemon Squeezy, o.ä.)

### 2. Discord Invite-Code einheitlich setzen
**Problem:** Drei verschiedene Stellen, drei verschiedene Zustände:
- `CommunityPage.tsx:289` → `const INVITE_CODE = 'HRxbTW4ujT'`
- `ContactPage.tsx:22` → `const DISCORD = 'https://discord.gg/ztBFjzuMAG'`
- `Footer.tsx:54` → `href="https://discord.gg/"` ← **noch leer/Placeholder**

Einen einzigen korrekten Invite-Code festlegen und an alle 3 Stellen einpflegen. Am saubersten: in eine gemeinsame Konstante `src/data/socials.ts` auslagern.

### 3. Formspree ID setzen (Kontaktformular)
**Datei:** `src/pages/ContactPage.tsx:19`
- `const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID ?? ''`
- Ohne diese Variable zeigt das Formular einen `alert()` Fehler-Dialog statt zu senden
- Formspree-Konto anlegen → `VITE_FORMSPREE_ID` in Vercel Environment Variables setzen

### 4. Calendly-Link ersetzen oder entfernen
**Datei:** `src/pages/ContactPage.tsx:251`
- `href="https://calendly.com/"` ist Placeholder ohne Nutzer-Handle
- Entweder echten Calendly-Link setzen (`calendly.com/chris-schubert/...`) oder "Termin buchen"-Card entfernen

### 5. Admin-Credentials setzen
**Datei:** `src/store/useAdminStore.ts:25-26`
- `VITE_ADMIN_PIN` und `VITE_ADMIN_PASSWORD` fehlen → Admin-Panel ist ohne Credentials **offen für alle** (Bedingung: beide leer → direkt durchgelassen)
- Vor Deploy in Vercel zwingend setzen

### 6. Instagram-Link prüfen
**Datei:** `src/pages/ContactPage.tsx:21`
- `const INSTAGRAM = 'https://www.instagram.com/candlescope'`
- Prüfen ob Account aktiv ist, sonst Eintrag aus CONTACTS-Array entfernen

---

## 🟠 INHALT — Fehler & Lücken gegenüber FinanceBoard v10.6

### 7. FinancePage: Falsche Tech-Tags auf DevPage
**Datei:** `src/pages/DevPage.tsx:418-425`
- FinanceBoard als `ProjectCard` mit Tags `['React', 'TypeScript', 'Recharts', 'Zustand']`
- **Falsch:** Das FinanceBoard ist **Electron + Vanilla JS + Chart.js + lightweight-charts** — kein React
- Korrektur: `tags: ['Electron', 'Vanilla JS', 'Chart.js', 'CSS']`
- Beschreibung anpassen: "Lokales Haushaltsbuch" → "Vollständige Desktop-App — Electron, offline-first, kein Framework"

### 8. FinancePage: Theme-Namen falsch
**Datei:** `src/pages/FinancePage.tsx:362`
```tsx
<TagList tags={['Candlescope Theme', 'Nacht-Blau', 'Crimson', 'Custom Hintergrundbild', 'Schriftgrößen', 'Privacy Lock']} />
```
- **"Nacht-Blau"** existiert nicht — das Theme heißt `dark` und hat blauen Akzent (#4d8fef)
- Korrekte Theme-Namen: `Gold` (candlescope), `Mono` (grau), `Dunkel` (dark/blau), `Crimson` (rot), `Hell` (light/türkis), `Ivory` (warm)
- Vorschlag: `['Gold-Theme', 'Mono', 'Dunkel', 'Crimson', 'Hell', 'Ivory', 'Custom Hintergrundbild', 'Privacy Lock']`

### 9. FinancePage: Feature-Liste unvollständig
**Datei:** `src/pages/FinancePage.tsx:154-163` (FEATURES Array) und `:165-176` (INCLUDED Array)

FinanceBoard hat 10 Seiten/Module — Website erwähnt nur ~6 davon. **Fehlende Features:**

| FinanceBoard-Modul | Erwähnt auf Website |
|--------------------|---------------------|
| Vision Board (Canvas) | ❌ fehlt komplett |
| Kreditoren/Payees | ❌ fehlt komplett |
| Safepoints (Auto-Backup) | ❌ fehlt komplett |
| Buchungen-Import/Export (.fbs) | ❌ fehlt komplett |
| Umfangreiche Pivot-Tabelle | ❌ fehlt komplett |
| Sparziele mit Tracker | ⚠️ nur in INCLUDED als "unbegrenzte Konten" angedeutet |

**INCLUDED-Liste ergänzen:**
```
Aktuell vorhanden: 10 Punkte
Fehlen:
- Vision Board Canvas
- Kreditoren & Payee-Verwaltung
- Automatische Safepoints (stündlich)
- Import / Export (.fbs Format)
```

### 10. FinancePage: Statistiken ungenau
**Datei:** `src/pages/FinancePage.tsx:243-258`
- `{ value: 8, suffix: '+', label: 'Module' }` → FinanceBoard hat **10 Seiten** (Dashboard, Transaktionen, Jahresanalyse, Verträge, Kreditoren, Sparziele, Vision Board, Archiv, Einstellungen, Docs)
- Korrektur: `value: 10`

### 11. FinancePage: Systemvoraussetzungen fehlen
Das FinanceBoard ist eine **Electron Desktop-App für Windows** — das ist nirgendwo auf der Website erwähnt.
Ein User der die Seite liest weiß nicht:
- Nur Windows (10/11) — kein Mac, kein Linux-Release, kein Browser
- ~150 MB Installationsgröße
- Daten lokal in `%APPDATA%`
- **Kein Browser-Zugriff** — kein Web-App

Empfehlung: Kleine "Systemanforderungen"-Box unterhalb der Preis-Card einfügen.

### 12. E-Mail-Adresse einheitlich festlegen
**Problem:** Zwei verschiedene Adressen im Umlauf:
- Website überall: `hello@candlescope.de`
- FinanceBoard intern (docs.js, settings): `info@candlescope.de`

Eine Adresse festlegen, dann im FinanceBoard `docs.js`, `settings.js` und der Website einheitlich umsetzen.

### 13. CommunityPage: Badge-Widerspruch
**Datei 1:** `src/pages/CommunityPage.tsx:314` → `badge="Jetzt live"`
**Datei 2:** `src/data/pages.ts:97` → `badge: 'Coming soon'`

Die INITIAL_PAGES Seed-Daten sagen "Coming soon" aber die eigentliche Page sagt "Jetzt live". Der Admin-Dashboard-Preview (via DynamicPage) würde "Coming soon" zeigen. In `pages.ts` korrigieren.

### 14. Footer: Community-Link fehlt
**Datei:** `src/components/layout/Footer.tsx` — navItems in Footer
- Navigation-Spalte zeigt: Finance, Dev & Web, About, Kontakt
- **Community fehlt** in der Footer-Navigation

---

## 🟡 FEATURES — Sinnvolle Ergänzungen

### 15. Echte Download-/Kaufsektion auf FinancePage
Aktuell führen alle "Jetzt kaufen"-Buttons zu `/contact`. Das ist ein Conversion-Killer.

**Lösung:** Kaufabwicklung über Gumroad oder Lemon Squeezy:
1. Account anlegen, Produkt anlegen, Link erhalten
2. "Jetzt kaufen"-Buttons auf direkten Kauflink ändern
3. Optional: Nach Kauf → automatisch Download-Link (Gumroad kann das)

Alternativ: Download-Button direkt auf die EXE verlinken (GitHub Releases / eigener CDN) wenn die App kostenlos/Freemium ist.

### 16. FAQ-Sektion auf FinancePage
Häufige Fragen die potenziell jeder Käufer hat:
- "Läuft die App auch auf Mac/Linux?" (Nein, nur Windows)
- "Wo werden meine Daten gespeichert?" (Lokal, `%APPDATA%`)
- "Gibt es eine Web-Version?" (Nein, Desktop-only)
- "Was passiert nach dem Kauf?" (Download-Link)
- "Gibt es Updates?" (Ja, kostenlos — aber manuell, kein Auto-Updater)
- "Was ist das .fbs-Format?" (Export-Format für Backups)

### 17. Screenshot-Galerie / App-Slider
Aktuell zeigt die FinancePage nur 4 Screenshots (Dashboard, Jahresübersicht, Archiv, Custom Design).
**Fehlende Ansichten:** Transaktionen, Verträge, Sparziele, Vision Board, Kreditoren, Einstellungen.

Vorschlag: Kleiner horizontaler Slider/Karussell unter der Features-Grid — alle 10 App-Screenshots scrollbar. Framer Motion `AnimatePresence` + Drag-Scroll reicht aus.

### 18. SEO Meta-Tags per Seite
Aktuell keine dynamischen `<title>` und `<meta description>` Tags. React Router v7 + `react-helmet-async` oder Vite SSG würde reichen.

Die Infos liegen bereits in `Page.seo` (`page.types.ts:124`) — nur noch in `<head>` schreiben.

### 19. Changelog / Release-History
Der FinanceBoard-Changelog (v10.3–v10.6) existiert in `docs.js` — aber auf der Website ist kein Versionsstand sichtbar.

Empfehlung: Kleine "Was ist neu"-Sektion auf FinancePage oder eine eigene `/changelog`-Route (über Page Builder erstellbar).

### 20. Waitlist E-Mails tatsächlich speichern
**Datei:** `src/pages/CommunityPage.tsx:241-283`
- `WaitlistForm` setzt nur lokalen State auf `'success'` — **E-Mails werden nirgendwo gespeichert**
- Lösung: Gleiche Formspree-Integration wie ContactPage, oder separates Formspree-Formular nur für die Waitlist
- Alternativ: Mailchimp / Brevo Embed

### 21. Three.js tatsächlich nutzen oder entfernen
**Datei:** `package.json` → `"three": "^0.175.0"` importiert aber in keiner Datei genutzt.
- Entweder für einen visuellen Effekt nutzen (z.B. 3D-Candlestick auf HomePage Hero)
- Oder aus `package.json` entfernen → spart ~600 KB Build-Größe

---

## 🔵 DESIGN / UX — Verbesserungen

### 22. FinancePage: Systemvoraussetzungen-Box
Kleine kompakte Info-Box direkt unter der Preis-Card:
```
Windows 10 / 11 · 64-Bit
~150 MB · Offline · Einmalig kaufen
```
Mit Windows-Icon und klarer Kennzeichnung dass es eine **Desktop-App** ist.
Verhindert Rückgaben und Fragen wie "Wo ist die Web-Version?".

### 23. Community Badge-Pill aktualisieren
`data/pages.ts:97` → Hero-Badge von "Coming soon" auf "Jetzt live" aktualisieren, damit es mit der CommunityPage.tsx konsistent ist.

### 24. HomePage: Video-Integration sichtbarer
`LazyVideoPlayer` auf der HomePage ist vorhanden (`CandleScope.mp4` + `.webm`) — aber der Abschnitt ist visuell sehr subtil. Das Video ist das stärkste Verkaufsargument — mehr Gewicht geben:
- Größerer Video-Container
- Play-Button prominenter
- Kurze Caption: "60-Sekunden Demo"

### 25. FinancePage: "Jetzt kaufen" → klarer CTA-Flow
Aktuell: 5 verschiedene "Jetzt kaufen"-Buttons auf einer Seite — alle gleich, alle führen zu `/contact`.

Empfehlung: Einen primären CTA definieren (der Preis-Card-Button), alle anderen als sekundäre CTAs oder Ghost-Buttons. Das reduziert die Entscheidungsparalyse.

### 26. Footer: Community fehlt + Discord-Link leer
**Datei:** `src/components/layout/Footer.tsx`
1. Community-Link in `footerNav`-Array ergänzen
2. Discord `href="https://discord.gg/"` → echten Invite-Code einsetzen (gleicher wie in CommunityPage/ContactPage)

---

## 🎨 DESIGN-HARMONIE — Visuelle Kohärenz beider Produkte

Beide Produkte teilen dieselbe Marke — aber aktuell sehen sie aus wie zwei unabhängige Projekte.
Der Besucher der Website bekommt einen anderen visuellen Eindruck als der Nutzer der App.
Das folgende System stellt sicher, dass Website und FinanceBoard als **eine Produktwelt** wirken.

---

### Das gemeinsame visuelle Fundament

Beide Produkte bauen bereits auf denselben Grundprinzipien auf — das muss explizit gemacht und konsequent durchgezogen werden:

| Dimension | FinanceBoard | Website | Status |
|-----------|-------------|---------|--------|
| Primärfarbe (Gold) | `#d4a843` (`--blue` im candlescope-Theme) | `#C9A84C` | ⚠️ leicht abweichend |
| Hintergrund | `#0a0a0a` (ca.) | `#080808` | ✅ nahezu identisch |
| Haupttext | `var(--text)` ≈ `#f0ede5` | `#F5F0E8` | ✅ gleiche Richtung |
| Sekundärtext | `var(--text2)` ≈ `#9a9590` | `#9A9590` | ✅ identisch |
| Schriftart Haupt | Space Grotesk (`--sans`) | Space Grotesk | ✅ gleich |
| Schriftart Mono | DM Mono (`--mono`) | JetBrains Mono | ⚠️ verschieden |
| Border-Radius | `--r2: 12px` | `rounded-2xl` (16px) | ⚠️ verschieden |
| Border-Stil | `var(--border)` gold-halbtransparent | `border-[#C9A84C]/10` | ✅ gleicher Ansatz |
| Panel-Hintergrund | `var(--panel)` ≈ `#161616` | `bg-[#111111]` bis `bg-[#141414]` | ✅ gleiche Dunkel-Schicht |

---

### 32. Gold-Ton angleichen

**Problem:** FinanceBoard Gold `#d4a843` ≠ Website Gold `#C9A84C` — beide sind warm-gold, aber sichtbar unterschiedlich wenn man ein Screenshot der App neben die Website hält.

**Lösung:** Einen gemeinsamen Brand-Gold festlegen. Empfehlung: **`#C9A84C`** (Website ist die nach außen sichtbare Marke → FinanceBoard passt sich an).

**FinanceBoard-Änderung:** In `styles/base.css`:
```css
/* candlescope Theme */
--blue: #C9A84C;   /* war #d4a843 */
```
Alle Alpha-Varianten (`--blue-a08` etc.) passen sich automatisch an da sie via `rgba(var(--blue-rgb), ...)` oder direkt definiert sind — **prüfen und ggf. anpassen**.

**Website:** Kein Handlungsbedarf — ist bereits `#C9A84C`.

> Alternativ: `#d4a843` als gemeinsames Gold setzen und auf der Website alle Hardcode-Werte ersetzen. Richtung egal — Hauptsache einheitlich.

---

### 33. Mono-Font vereinheitlichen

**Problem:** FinanceBoard nutzt **DM Mono** (Google Fonts), Website nutzt **JetBrains Mono** (ebenfalls Google Fonts). Beide erscheinen in Code-Blöcken, Statistik-Zahlen und technischen Elementen — ein Wechsel ist dadurch visuell spürbar.

**Entscheidung notwendig (eine Option wählen):**
- **Option A — DM Mono** (FinanceBoard Standard): Website auf DM Mono umstellen → `font-mono` Tailwind-Klasse mit DM Mono konfigurieren
- **Option B — JetBrains Mono** (Website Standard): FinanceBoard `--mono` auf JetBrains Mono umstellen
- **Option C — Neutral** (kein Mono auf Website): Website-Zahlen in Space Grotesk, Mono nur noch in Code-Snippets → kein Konflikt

Empfehlung: **Option A** — DM Mono ist kompakter und passt besser zur Finanzdaten-Darstellung.

---

### 34. Border-Radius vereinheitlichen

**Problem:** FinanceBoard panels: `8px` (`--r1`) / `12px` (`--r2`). Website Cards: `rounded-2xl` = `16px`. Screenshots der App in Website-Cards wirken dadurch eckiger als die umliegenden Website-Elemente.

**Lösung für die Website:** Cards, die App-Screenshots zeigen, auf `rounded-xl` (12px) absenken — passt zur App. Alle anderen Website-Elemente können bei `rounded-2xl` bleiben. Das schafft visuellen Kontext: "dieses Rechteck = App-Fenster".

```tsx
// FinancePage Screenshot-Cards: rounded-2xl → rounded-xl
<div className="rounded-xl overflow-hidden border border-[#C9A84C]/15 ...">
```

---

### 35. App-Screenshots im richtigen Theme zeigen

**Problem:** Die Screenshots auf der Website sollten denselben Gold-Candlescope-Theme zeigen, den der Besucher als erstes sieht wenn er die App startet. Aktuell ist unklar welches Theme die 4 Screenshots zeigen.

**Regel:** Alle Screenshots auf der Website immer im **Candlescope-Theme (Gold, dunkel)** — das ist das Default-Theme und das was der Visitor nach dem Kauf als erstes sieht. Kein Screenshot im Light- oder Ivory-Theme in der Hauptdarstellung.

**Ausnahme:** Im Theme-Showcase-Bereich (Punkt #8, Theme-Namen) darf jedes Theme gezeigt werden — das ist explizit die Diversity-Aussage.

**Qualität:** Screenshots bei **1440×900px** erstellen, dann auf max. `800px` Breite eingebettet — kein Up-Scaling, kein JPEG-Artefakte. Format: **WebP** (halbe Größe bei gleicher Qualität).

---

### 36. Komponenten-Sprache angleichen — "Panel-Stil" auf die Website bringen

Das FinanceBoard hat eine unverwechselbare Panel-Ästhetik:
- Dunkles Panel `#161616`
- Gold-Subtilborder `rgba(gold, 0.08–0.15)`
- Leichter Box-Shadow nach innen oder feiner Glow
- Kein starker Drop-Shadow — Tiefe kommt durch Farbschichtung

Die Website-Cards haben diese Sprache teilweise, aber nicht konsequent. **Zu harmonisieren:**

```tsx
// Einheitliche Panel-Card auf der Website:
className="bg-[#141414] border border-[#C9A84C]/10 rounded-xl
           shadow-[inset_0_0_0_1px_rgba(201,168,76,0.06)]
           hover:border-[#C9A84C]/20 transition-colors duration-200"
```

Das gibt der Website exakt dieselbe Materialsprache wie der App. Besonders wichtig auf: `FinancePage` Feature-Cards, `DevPage` Project-Cards, `AboutPage` Skill-Cards.

---

### 37. Typografie-Hierarchie angleichen

Beide Produkte nutzen Space Grotesk — aber die Gewichtsverteilung und Größenstufung weicht ab.

**FinanceBoard-Hierarchie:**
- Section-Titel: Space Grotesk 600, ca. 1.1rem
- KPI-Werte: Space Grotesk 700, 1.6–2.4rem
- Body: Space Grotesk 400, 0.88rem
- Captions: Space Grotesk 400, 0.78rem

**Website-Hierarchie:**
- Hero: `text-5xl md:text-7xl font-black` (Space Grotesk 900)
- Section: `text-3xl font-bold` (700)
- Body: `text-base` (400)

**Empfehlung:** Die Website darf dramatischer sein (größere Typo für Marketing) — aber die internen Proportionen (z.B. Labels, Badges, Stat-Werte) sollten dieselben Gewichte wie die App verwenden. Konkret: Stat-Zahlen auf Website (`AnimatedCounter`) immer `font-bold` (700) statt `font-black` (900) — wirkt weniger schreierisch, näher an der App.

---

### 38. Animationsstil angleichen — kein "Website-Overload"

Das FinanceBoard hat **keine** Seitenanimationen — alles rendert direkt. Die Website hat Framer Motion + IntersectionObserver. Das ist richtig für eine Marketing-Site. Aber der Animationsstil muss zur Produktpersönlichkeit passen.

**FinanceBoard-Personality:** Präzise, professionell, keine Spielerei — wie ein gutes Trading-Terminal.

**Regel für Website-Animationen:**
- Einblend-Dauer: max. `0.4s` (aktuell teilweise `0.6–0.8s` — zu langsam, wirkt träge)
- Keine Bounce-Easing (`spring` mit hoher Stiffness) — stattdessen `ease: [0.4, 0, 0.2, 1]` (Material-Curve)
- Keine Scale-Übertreibungen > `1.03` beim Hover — App nutzt `scale(1.02)` maximal
- Parallax-Effekte: ok, aber dezent (max. `y: ±20px`, kein `y: ±60px`)

Konkret: `StaggerContainer` delay zwischen Items auf `0.06s` belassen (aktuell gut), aber `initial={{ opacity: 0, y: 30 }}` → `y: 18` reduzieren. Wirkt seriöser.

---

### 39. Einheitliche Icon-Sprache

**FinanceBoard:** Stroke-SVGs (Lucide-ähnlich), `stroke-width: 1.5`, `stroke="currentColor"`, keine Fill-Icons.

**Website:** Mix aus Emoji (🌟, 💡 etc. in Feature-Cards) und SVG-Icons.

**Problem:** Auf der FinancePage Feature-Liste stehen Emoji-Icons neben SVG-Symbolen — das sieht nicht aus wie ein Premium-Produkt.

**Lösung:** Feature-Icons auf der Website auf **Lucide React** umstellen — exakt dieselbe Library die das FinanceBoard visuell inspiriert. Installation:
```bash
npm install lucide-react
```
Dann in `FinancePage.tsx` FEATURES-Array statt Emoji → `<Icon className="w-5 h-5" strokeWidth={1.5} />`. Das verbindet Website und App auf Icon-Ebene direkt.

---

### Zusammenfassung: Design-System für beide Produkte

Die folgende Tabelle definiert das gemeinsame Design-System das ab sofort für Website UND FinanceBoard gilt:

| Token | Wert | Gilt für |
|-------|------|---------|
| Brand Gold | `#C9A84C` | Primärfarbe, Akzente, Borders |
| Hintergrund | `#080808` / `#0a0a0a` | Body |
| Panel L1 | `#111111` | Haupt-Panel |
| Panel L2 | `#161616` | Nested Panel |
| Panel L3 | `#1d1d1d` | Hover/Active State |
| Text Primär | `#F5F0E8` | Headlines, wichtige Werte |
| Text Sekundär | `#9A9590` | Labels, Captions |
| Text Tertiär | `#5a5550` | Disabled, Timestamps |
| Border subtil | `rgba(#C9A84C, 0.08)` | Panel-Kanten |
| Border hover | `rgba(#C9A84C, 0.20)` | Interaktive Elemente |
| Glow | `rgba(#C9A84C, 0.15)` | Fokus, Glow-Effekte |
| Radius SM | `8px` | Badges, Pills, Tags |
| Radius MD | `12px` | Cards, Panels, Modals |
| Radius LG | `20px` | Full-Width Sections |
| Font Display | Space Grotesk | Headlines |
| Font Mono | DM Mono | Zahlen, Code, IBANs |
| Transition | `200ms ease` | Standard |
| Transition langsam | `400ms ease` | Seiten-Animationen |

---

## ⚪ TECHNISCH — Code-Schulden & ENV-Variablen

### 27. Soziale Links in zentrale Datei auslagern
Aktuell verstreut an ~8 Stellen im Code:
- `Footer.tsx` → Discord leer, GitHub hartcoded, E-Mail
- `CommunityPage.tsx` → Discord Code A
- `ContactPage.tsx` → Discord Code B, Instagram, Calendly
- `AboutPage.tsx` → GitHub hartcoded
- `DevPage.tsx` → GitHub hartcoded

**Lösung:** `src/data/socials.ts` erstellen:
```typescript
export const SOCIALS = {
  discord:   'https://discord.gg/XXXX',
  github:    'https://github.com/SchubertChris',
  instagram: 'https://www.instagram.com/candlescope',
  calendly:  'https://calendly.com/chris-schubert/30min',
  email:     'hello@candlescope.de',
}
```

### 28. ENV-Variablen Checkliste für Vercel
Alle benötigten Variablen auf einen Blick:
```
VITE_ADMIN_PIN=         # 4-stellige PIN für Admin-Panel
VITE_ADMIN_PASSWORD=    # Passwort (zweiter Schritt)
VITE_FORMSPREE_ID=      # Formspree Formular-ID (f/XXXXXX)
```
Ohne diese drei Variablen: Admin offen, Kontaktformular kaputt.

### 29. Three.js entfernen (wenn nicht genutzt)
```bash
npm uninstall three @types/three
```
Reduziert Bundle-Größe um ~600 KB (minified+gzip: ~170 KB).
Nur wenn Three.js nicht für einen geplanten Effekt vorgesehen ist.

### 30. embed-Block in DynamicPage implementieren
**Datei:** `src/pages/DynamicPage.tsx:215`
`case 'embed'` fehlt → `default: return null` — YouTube-Embeds im Page Builder werden unsichtbar.

```tsx
case 'embed': {
  const p = block.props as { url: string; type: string; ratio?: string; caption?: string }
  const ratioClass = { '16/9': 'aspect-video', '4/3': 'aspect-4/3', '1/1': 'aspect-square' }[p.ratio ?? '16/9'] ?? 'aspect-video'
  const embedUrl = p.type === 'youtube'
    ? p.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')
    : p.url
  return (
    <section className="px-8 md:px-16 lg:px-24 py-8">
      <div className={`${ratioClass} rounded-2xl overflow-hidden border border-[#C9A84C]/10`}>
        <iframe src={embedUrl} className="w-full h-full" allowFullScreen />
      </div>
      {p.caption && <p className="text-[11px] text-[#5a5550] mt-3 text-center">{p.caption}</p>}
    </section>
  )
}
```

### 31. IntroAnimation + CookieBanner: Verwendung prüfen
**Dateien:** `src/components/ui/IntroAnimation.tsx`, `src/components/ui/CookieBanner.tsx`
Beide existieren als Dateien — aber es ist unklar ob sie in `RootLayout.tsx` oder `main.tsx` tatsächlich eingebunden sind.

- `IntroAnimation`: Wenn aktiv → stellt sie sich vor den Haupt-Content? Timing prüfen.
- `CookieBanner`: DSGVO-relevant. Wenn die Site Google Analytics oder ähnliches nutzen soll, muss dieser Banner korrekt funktionieren. Wenn keine Tracking-Skripte → Banner kann entfernt werden (technisch compliant, kein Tracking vorhanden).

---

## Umsetzungs-Reihenfolge (Empfehlung)

### Sofort (Blocker vor jedem öffentlichen Link)
1. Discord Invite-Code einheitlich setzen (alle 3 Stellen + Footer)
2. `VITE_ADMIN_PIN` + `VITE_ADMIN_PASSWORD` in Vercel setzen
3. `VITE_FORMSPREE_ID` in Vercel setzen
4. Calendly-Link setzen oder entfernen
5. Preis festlegen und `XX €` ersetzen

### Woche 1 (Inhaltsfehler korrigieren)
6. DevPage: FinanceBoard Tech-Tags korrigieren (Electron, Vanilla JS, Chart.js)
7. FinancePage: Theme-Namen korrigieren ("Nacht-Blau" → korrekte Namen)
8. FinancePage: Feature-Liste + INCLUDED-Liste um fehlende Module ergänzen
9. FinancePage: Statistik "8+" → "10" Module
10. Footer: Community-Link ergänzen, Discord-Link setzen
11. Community/pages.ts: Badge "Coming soon" → "Jetzt live"

### Woche 2 (Design-Harmonie — höchste visuelle Wirkung)
12. **Gold-Ton angleichen** (#32) — einen Wert festlegen, überall einsetzen
13. **Lucide React installieren** (#39) — Emoji durch konsistente Stroke-Icons ersetzen (FinancePage Feature-Grid)
14. **Panel-Stil auf Website-Cards anwenden** (#36) — `bg/border/shadow` Pattern auf Feature-Cards, Project-Cards, Skill-Cards
15. **App-Screenshots neu erstellen** (#35) — WebP, 1440×900px, Candlescope-Theme, korrekte Inhalte (v10.6)
16. **Border-Radius Screenshots-Cards** (#34) — `rounded-xl` statt `rounded-2xl` für Screenshot-Wrapper
17. **Animationsgeschwindigkeit** (#38) — `y: 30 → 18`, Transition-Dauer auf max. 0.4s

### Woche 3 (Features + UX)
18. Systemvoraussetzungen-Box auf FinancePage einfügen
19. Screenshot-Galerie / App-Slider (alle 10 Ansichten)
20. FAQ-Sektion auf FinancePage
21. Waitlist E-Mails tatsächlich speichern (Formspree)
22. Soziale Links in `src/data/socials.ts` zentralisieren
23. Mono-Font-Entscheidung treffen und umsetzen (#33)

### Woche 4 (Launch-Readiness)
24. Kaufabwicklung implementieren (Gumroad/LemonSqueezy)
25. `embed`-Block in DynamicPage implementieren
26. SEO Meta-Tags (react-helmet-async)
27. Three.js entfernen oder nutzen

---

## Offene Fragen die Chris entscheiden muss

| # | Frage | Auswirkung |
|---|-------|-----------|
| A | Was kostet das FinanceBoard? | Preis-Card, alle CTAs |
| B | Über welche Plattform wird verkauft? | "Jetzt kaufen" Button-Ziel |
| C | Ist der Instagram-Account aktiv? | ContactPage CONTACTS-Liste |
| D | Gibt es einen Calendly-Link? | ContactPage "Termin buchen"-Card |
| E | Welcher Discord Invite-Code ist korrekt? | 3 Stellen im Code |
| F | Soll `info@` oder `hello@candlescope.de` die offizielle Adresse sein? | Website + FinanceBoard |
| G | Soll Three.js für einen Effekt genutzt werden? | Bundle-Größe |
| H | Soll es eine Web-Demo des FinanceBoards geben? | Großes Feature, 2–3 Wochen Aufwand |
| I | Welcher Brand-Gold gilt offiziell: `#C9A84C` (Website) oder `#d4a843` (App)? | Alle Farb-Tokens beider Produkte |
| J | DM Mono oder JetBrains Mono als gemeinsame Mono-Schrift? | Zahlendarstellung, Code-Blöcke |
