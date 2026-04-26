# CandleScope — SEO & GEO Strategie

> Stand: 26. April 2026

---

## Was ist GEO?

**Generative Engine Optimization** = SEO für KI-Antwortmaschinen.
Während klassisches SEO auf Ranking in Linklisten abzielt, geht es bei GEO darum,
von Google AI Overviews, ChatGPT, Perplexity und Co. **zitiert und zusammengefasst** zu werden.

---

## Implementierter Stand

### 1. `llms.txt` — KI-Kontext-Datei
**Datei:** `public/llms.txt` → `https://candlescope.de/llms.txt`

Das Äquivalent zu `robots.txt`, aber für KI-Crawler.
Erklärt in strukturiertem Markdown: Wer ist CandleScope, wer ist Chris, welche Produkte gibt es, wie ist Kontakt.

**Format:** Markdown mit `#` (Titel), `>` (Kurzbeschreibung), `##` (Abschnitte)
**Standard:** Definiert von Jeremy Howard / Answer.AI (2024)

---

### 2. Schema.org JSON-LD — Strukturierte Daten
**Datei:** `index.html` → `<script type="application/ld+json">`

Vier Entitäten im `@graph`:

| Typ | ID | Inhalt |
|-----|----|--------|
| `Organization` | `#organization` | CandleScope, Logo, E-Mail, Gründer |
| `Person` | `#chris-schubert` | Chris Schubert, Rolle, knowsAbout, GitHub |
| `SoftwareApplication` | `#financeboard` | FinanceBoard, Features, Offer, OS |
| `WebSite` | `#website` | Domain, Sprache, Publisher |

**Warum `@graph`?** Verknüpft die Entitäten miteinander — Google und KIs verstehen die Beziehung: Chris Schubert → gründet → CandleScope → veröffentlicht → FinanceBoard.

---

### 3. `robots.txt` — KI-Crawler explizit erlaubt
**Datei:** `public/robots.txt`

Explizite `Allow` Regeln für:
- `GPTBot` (ChatGPT)
- `ChatGPT-User`
- `PerplexityBot`
- `ClaudeBot` + `anthropic-ai`

Referenz auf `llms.txt` als Kommentar.

---

### 4. Bestehende SEO-Basis
- `sitemap.xml` — alle öffentlichen Seiten mit Prioritäten
- `robots.txt` — Admin + API gesperrt
- OG-Tags (og:title, og:description, og:url)
- `google-site-verification` im Head
- `meta description` und `author`

---

## Was noch aussteht (nächste Schritte)

### Kurzfristig
| Aufgabe | Warum | Aufwand |
|---------|-------|---------|
| Preis auf `/finance` eintragen | Schema.org Offer-Preis ist Pflichtfeld für Rich Results | 5 min |
| OG-Image hinzufügen | Social Sharing + KI-Vorschau | 30 min |
| `og:image` in index.html | Aktuell kein Bild für Link-Previews | 10 min |

### Mittelfristig
| Aufgabe | Warum | Aufwand |
|---------|-------|---------|
| Seiten-spezifische Meta-Tags | Jede Route hat eigene Title/Description | 2h (React Helmet) |
| FAQ-Schema auf `/finance` | Trigger für Google FAQ Rich Results | 1h |
| BreadcrumbList Schema | Navigation für KIs verständlicher | 30 min |
| `HowTo` Schema | Onboarding-Content für FinanceBoard | 1h |

### Langfristig (FinanzHub)
| Aufgabe | Warum |
|---------|-------|
| `llms.txt` für `app.candlescope.de` | Separater KI-Kontext für die App |
| Service-Schema für Webentwicklung | Chris als Freelancer besser auffindbar |
| Bewertungs-Schema (Review) | Social Proof für KI-Antworten |

---

## Wie KI-Suchmaschinen priorisieren

1. **Klare Entitäten** — Wer? Was? Wo? → Schema.org löst das
2. **Faktbasierter Content** — Konkrete Aussagen werden zitiert, vage nicht
3. **Autorität** — Backlinks von vertrauenswürdigen Seiten
4. **llms.txt** — Direkter Kontext für LLM-Crawler
5. **Aktualität** — `lastmod` in sitemap.xml regelmäßig aktualisieren

---

## Test-Tools

- **Schema Validator:** https://validator.schema.org
- **Rich Results Test:** https://search.google.com/test/rich-results
- **llms.txt Preview:** https://llmstxt.cloud (Drittanbieter)
- **Perplexity:** Einfach nach "CandleScope" suchen und schauen ob die Seite auftaucht
