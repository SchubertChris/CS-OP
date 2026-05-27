# CANDLESCOPE WEBSITE — CODE AUDIT

**Stand:** 2026-05-17
**Reviewer:** code-review-agent
**Scope:** `apps/frontend/` (React 19 + Vite + Tailwind CSS 4), inkl. Admin-Panel, Stores, Hooks, Layout

---

## Executive Summary

Die Candlescope-Website ist technisch solide aufgebaut: saubere Komponentenstruktur, vollständiges Dark/Light-Theme, durchdachte Framer-Motion-Animationen, kein auskommentierter Code, keine `console.log`-Statements. Das Admin-Panel hat jedoch ein fundamentales Architektur-Problem: alle Content-Daten (Pages, Reviews) werden ausschliesslich in `localStorage` gespeichert — es gibt keinen API-Endpunkt dahinter. Der `saveActive()`-Aufruf macht nichts ausser `isDirty` auf `false` zu setzen. Das Admin-Panel ist damit eine reine Frontend-Illusion ohne Persistenz auf dem Server. Darüber hinaus gibt es eine nennenswerte Häufung von Inline-Styles in Kontexten, wo CSS-Variablen oder Tailwind-Klassen ausreichen würden. SEO-Meta-Tags sind nicht implementiert (kein `<title>`, kein `og:*` pro Seite). Der Gesamteindruck ist visuell hochwertig, aber die Backend-Anbindung des Content-Managements fehlt vollständig.

---

## Bewertungsübersicht

| Bereich | Bewertung | Status |
|---|---|---|
| Code-Qualität / TypeScript | 7/10 | Gut, wenige schwache Stellen |
| Inline-Styles | 5/10 | Systematisch vorhanden, obwohl Klassen möglich |
| Performance / Bundle | 7/10 | Lazy Loading korrekt, aber Backend-Deps im Frontend |
| SEO & Meta-Tags | 3/10 | Komplett fehlend (kein Helmet, kein OG) |
| Accessibility / ARIA | 5/10 | Grundlegendes vorhanden, Gaps bei interaktiven Elementen |
| Sicherheit | 6/10 | Admin-Slug-Fallback `'admin'`, `.env`-Schutz teilweise unvollständig |
| UX & Design-Konsistenz | 9/10 | Sehr stark, kohärentes Designsystem |
| Theme-Support (Dark/Light) | 9/10 | Vollständig, CSS-Variablen konsequent |
| Admin-Panel | 4/10 | UI komplett, Datenpersistenz fehlt (nur localStorage) |
| Dokumentation | 5/10 | Keine PROJECT_DOCUMENTS.md, PROJECT_STRUCTURE.md gefunden |

---

## Befunde

### Kritisch

#### 1. Admin Content-Persistenz existiert nicht — `saveActive()` ist ein No-Op

**Datei:** `apps/frontend/src/store/usePagesStore.ts`, Zeile 312–315

```typescript
saveActive: () => {
  set({ isDirty: false, isSaving: false }, false, 'saveActive')
  /* Phase 2: hier API-Call → POST /api/pages/:id */
},
```

`saveActive()` setzt nur Flags zurück. Es gibt keinen HTTP-Call. Das bedeutet: Pages werden ausschliesslich in `localStorage` via Zustand-Persist gespeichert (`name: 'candlescope-pages-v2'`). Publizierte Seiten existieren nur im Browser des Admins. Ein anderer Browser, ein anderer Nutzer, ein Browser-Cache-Clear — alles weg. `DynamicPage.tsx` rendert aus dem gleichen Store, was bedeutet, dass dynamisch erstellte Seiten für andere Nutzer schlicht nicht existieren.

**Fix:** API-Endpunkt `POST /api/pages/:id` implementieren und in `saveActive()` einbinden. Alternativ: Admin-Panel als "Work in Progress" klar kennzeichnen und öffentlich unzugängliche Routen nicht auf `DynamicPage.tsx` rendern.

---

#### 2. Reviews-Store ebenfalls rein localStorage — ohne API-Backup

**Datei:** `apps/frontend/src/store/useReviewStore.ts`, Zeile 47–95

Der `useReviewStore` persistiert Reviews per `zustand/middleware/persist` in localStorage (`name: 'cs-reviews-v1'`). Neue Reviews von Besuchern (`submit()`) landen nur im Admin-Browser. `approve()`, `reject()` und `remove()` haben keine Backend-Calls. Die Seed-Daten (`SEED`) sind hardcodiert im Store selbst — sie werden bei jedem frischen Browser-Tab erzeugt, bis localStorage befüllt ist.

**Fix:** API-Endpunkte nötig, oder klare Trennung zwischen echten Live-Reviews (hardcoded im Frontend) und dem Admin-Mockup.

---

#### 3. `VITE_ADMIN_SLUG` fällt auf `'admin'` zurück — öffentlich bekanntes Default

**Datei:** `apps/frontend/src/admin/config.ts`, Zeile 4

```typescript
export const ADMIN = import.meta.env.VITE_ADMIN_SLUG ?? 'admin'
```

Wenn `VITE_ADMIN_SLUG` nicht in Vercel gesetzt ist, ist der Admin-Pfad `candlescope.de/admin` — der Standard-Pfad den jeder Bot zuerst probiert. Der `AdminGuard` schützt zwar via `/api/auth/me`, aber der Login-Redirect landet trotzdem auf einer vorhersehbaren URL.

**Fix:**
```typescript
export const ADMIN = import.meta.env.VITE_ADMIN_SLUG
if (!ADMIN) throw new Error('VITE_ADMIN_SLUG ist nicht konfiguriert')
```

---

#### 4. `apps/frontend/.gitignore` schützt `.env` nicht explizit

Das Root-`.gitignore` schützt `.env` und `.env.local`. Das `.gitignore` direkt in `apps/frontend/` enthält nur `*.local` aber nicht explizit `.env` als eigene Zeile. Potentielles Gap bei Sub-tree-Checkouts.

**Fix:** `.env` explizit in `apps/frontend/.gitignore` ergänzen.

---

### Wichtig

#### 5. Keine SEO-Meta-Tags auf irgendeiner Seite

`react-helmet-async` ist in `package.json` gelistet, wird aber nirgendwo importiert oder verwendet. Kein `<title>`, kein `<meta name="description">`, keine OG-Tags auf keiner Seite.

**Betroffen:** Alle Seiten — `HomePage.tsx`, `FinancePage.tsx`, `DevPage.tsx`, `AboutPage.tsx`, `CommunityPage.tsx`, `ContactPage.tsx`, `ShopRayPage.tsx`, `ImpressumPage.tsx`, `DatenschutzPage.tsx`

**Fix:** `HelmetProvider` in `main.tsx` wrappen, dann pro Seite:
```tsx
import { Helmet } from 'react-helmet-async'
<Helmet>
  <title>CandleScope — Haushaltsbuch für Windows</title>
  <meta name="description" content="..." />
  <meta property="og:title" content="..." />
</Helmet>
```

---

#### 6. Systematische Inline-Styles wo CSS-Variablen/Tailwind ausreichen würden

- `apps/frontend/src/pages/HomePage.tsx` — Zeile 135: `style={{ overflowX: 'hidden' }}` → `overflow-x-hidden`
- `apps/frontend/src/admin/AdminLogin.tsx` — Zeile 13–25: Kompletter Loading-Screen als Inline-Styles-Block statt Tailwind-Klassen
- `apps/frontend/src/components/ui/CookieBanner.tsx` — `minHeight: '52px'` → `min-h-[52px]`

---

#### 7. `StaggerContainer` / `StaggerItem` / `Reveal` — 3× dupliziert

**Dateien:** `HomePage.tsx` (Zeile 23–68), `AboutPage.tsx` (Zeile 21–41), `FinancePage.tsx` (Zeile 14–38)

Drei lokale Kopien mit marginal unterschiedlichen Werten. Sollten in `components/ui/Motion.tsx` zentralisiert werden.

---

#### 8. `Card`-Komponente mit `onClick` hat kein `tabIndex` + fehlendes Keyboard-Handling

**Datei:** `apps/frontend/src/components/ui/index.tsx`, Zeile 252–256

```tsx
<div onClick={onClick} className={classes} role="button">
```

`role="button"` ohne `tabIndex={0}` und `onKeyDown`. Keyboard-User können das Element nicht aktivieren.

**Fix:**
```tsx
<div
  onClick={onClick}
  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
  role="button"
  tabIndex={0}
  className={classes}
>
```

---

#### 9. `ContactPage.tsx` — Calendly-Link ist Placeholder

**Datei:** `apps/frontend/src/pages/ContactPage.tsx`, Zeile 283

```tsx
<a href="https://calendly.com/" ...>
```

Zeigt auf Root-Domain statt echten Slot. Für Besucher nutzlos.

---

#### 10. `useDownloadCount.ts` — GitHub-API ohne Rate-Limit-Behandlung

60 Requests/Stunde für unauthentifizierte Calls. Jeder Seitenbesuch verbraucht eines. Bei Traffic-Peaks → 403, stille Degradation.

---

#### 11. `useGitHubContributions.ts` — Abhängigkeit auf privaten Drittanbieter

**Datei:** `apps/frontend/src/hooks/useGitHubContributions.ts`, Zeile 31

```typescript
fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`)
```

Privat betriebener Dienst ohne SLA. Wenn offline → GitHub-Activity-Section bricht lautlos.

---

### Nice-to-have

#### 12. `App.css` und `src/index.css` — Dead Code (Vite-Scaffold-Reste)

Beide Dateien werden nirgendwo importiert. Enthalten CSS-Variablen und Selektoren (`#center`, `.counter`, `.hero`) die im Projekt nicht existieren.

#### 13. `AnimatedCounter` animiert nicht

**Datei:** `apps/frontend/src/pages/FinancePage.tsx`, Zeile 41–46

Zeigt nur statischen Wert. Name ist irreführend. Umbenennen zu `StatValue`.

#### 14. Doppelte `vercel.json`

Root-`vercel.json` und `apps/frontend/vercel.json` haben unterschiedliche Rewrite-Patterns. Inkonsistenz kann bei Konfigurationsänderungen zu Verwirrung führen.

---

## Priorisierte Empfehlungen

### Kritisch — sofort

| # | Massnahme | Datei |
|---|---|---|
| 1 | Admin Content-API implementieren — `saveActive()` braucht echten API-Call | `store/usePagesStore.ts:312` |
| 2 | SEO Meta-Tags ergänzen — `react-helmet-async` nutzen | Alle Pages |
| 3 | `VITE_ADMIN_SLUG`-Fallback `'admin'` entfernen | `admin/config.ts:4` |

### Mittel — nächste Iteration

| # | Massnahme | Datei |
|---|---|---|
| 4 | Inline-Styles in `AdminLogin.tsx` → Tailwind-Klassen | `admin/AdminLogin.tsx:13` |
| 5 | `Card` onClick: `tabIndex` + `onKeyDown` ergänzen | `components/ui/index.tsx:252` |
| 6 | `StaggerContainer`/`StaggerItem` zentralisieren | 3× Pages |
| 7 | Calendly-Placeholder ersetzen oder entfernen | `pages/ContactPage.tsx:283` |

### Nice-to-have

| # | Massnahme |
|---|---|
| 8 | `App.css` + `src/index.css` löschen (Dead Code) |
| 9 | `AnimatedCounter` → `StatValue` umbenennen |
| 10 | GitHub-API-Calls cachen (Vercel Edge Function, 5-Min-TTL) |
| 11 | `.env` explizit in `apps/frontend/.gitignore` ergänzen |

---

## Positiv-Highlights

**Designsystem:** `--cs-*`-Variablen vollständig durchgezogen. Dark/Light funktioniert in allen Komponenten zuverlässig. Kein einziger hardcodierter Hex-Wert in CSS (Ausnahme: Gold `#C9A84C` konsistent als Literal überall).

**ThemeContext:** Korrekt implementiert — `data-theme` auf `document.documentElement`, `meta[name="theme-color"]` dynamisch gesetzt, `localStorage`-Persistenz.

**Lazy Loading:** Alle Pages und Admin-Module per `React.lazy()`. `Suspense`-Wrapper mit eigenem `PageLoader` korrekt gesetzt. Bundle-Splitting automatisch aktiv.

**Framer-Motion-Qualität:** Hero-Char-Animation, PageHero-SVG-Backgrounds, Marquee, Stagger-Reveals sind durchdacht und zweckdienlich. Radar-Animation (`ContactBg`) und Git-Graph-Animation (`DevBg`) sind echte Qualitätsarbeit.

**Analytics-Hook:** `useAnalytics.ts` sauber — Pageview-Tracking, Heartbeat-Interval, sauberes Cleanup via `clearInterval`. Kein `console.log`.

**Kein Debug-Code:** Keine `console.log`-Statements, keine `TODO`-Kommentare (ausser funktional markiertem "Phase 2" in `usePagesStore.ts`), kein auskommentierter Code.

**Cookie-Banner:** DSGVO-konform, mit Details-Expansion, korrekte `localStorage`-Persistenz.

**TypeScript-Typen:** `page.types.ts` vollständig — discriminated union über `BlockPropsMap`, `AnyBlock` als distributive Union korrekt definiert.
