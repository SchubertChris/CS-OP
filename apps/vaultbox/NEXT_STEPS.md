# VaultBox — Nächste Schritte

> Stand: 2026-06-21 · Security-Hardening (SEC-1…SEC-5) umgesetzt & in echtem Electron
> verifiziert. Offene Punkte aus dieser Runde stehen ganz oben.
> Ältere Ideen-Liste (Stand 13.06.) darunter, grob nach Priorität.

---

## 🔐 Offen aus Security-Hardening (2026-06-21)

- [ ] **LIVE-TEST durch den Nutzer** (ausstehend, höchste Prio): Verschlüsselung in der
      laufenden App über die Einstellungen aktivieren → **Neustart + Entsperren** auf
      einer **Datenkopie** prüfen. Backup liegt unter
      `%APPDATA%/vaultbox/_backup_vor_vault_20260621/`.
- [x] **Seitentür 3 — `export:fullAuto` verschlüsselt** (erledigt 2026-06-21): Der
      Auto-Backup nach Downloads vor dem Löschen schreibt im Vault-Modus jetzt ein
      **DEK-verschlüsseltes** JSON statt Klartext. `io.js importAll` erkennt den
      DEK-Container (Felder `enc`+`vaultbox`) und entschlüsselt ihn über den entsperrten
      Vault (neuer IPC `vault:decryptExport`). Die main.js-Handler `export:full`/
      `import:full` waren ungenutzter Code. In echtem Electron getestet: keine
      Klartext-IBAN/-Salden in der Backup-Datei, Import stellt identisch wieder her,
      fremder Vault/DEK kann nicht entschlüsseln. **Damit sind alle 4 Seitentüren
      geschlossen** — `state.json`, Safepoints, `crypto.db` und Export sind im
      Vault-Modus verschlüsselt.
- [ ] **Lizenz vor Release scharfschalten**: eigenen Public Key via
      `tools/gen-license-keys.js` setzen + Renew-Endpoint konfigurieren (aktuell nur
      Verify-Key-Gerüst nach Ed25519-Umstellung).
- [ ] **Renderer-Lizenz-UI anpassen**: Aktivierungsfeld nimmt jetzt **signierte
      Lizenz-JSON** entgegen; ergänzen: „Geräte-ID anzeigen" + „Erneuern".
- [ ] **Ehrliche Grenze dokumentieren** (Handbuch/Marketing): client-seitige
      Verschlüsselung = hohe Hürde, **nicht unknackbar** (`asar` patchbar) — nicht als
      absolute Sicherheit verkaufen.

---

## 🔍 Zuerst: Testen & Mergen

- [ ] **Visueller Live-Test** von `design-icons-bg` in der App — alle Icons, der
      Hintergrund-Stärke-Regler und das Logo über **alle Themes**
      (besonders Light/Ivory — dort war Sichtbarkeit immer das Risiko).
      Bisher nur `node --check`, kein visueller Test.
- [ ] **`audit-fixes` + `design-icons-bg` → `main` mergen** (review, dann zusammenführen).

## 🎨 Design-Kohärenz (Track B — offene Hälfte vom Audit)

- [ ] **Geplanter Claude-Design-/Optik-Durchgang der neuen UI** — gezielter Pass über
      die neu gebaute Oberfläche (Icon-System, Hintergrund, Logo-Slots, Pill-Nav) auf
      Optik & Konsistenz, bevor sie als final gilt.
- [ ] Visuelle Vereinheitlichung über die 4+ Themes: Abstände, Schatten, Radien,
      Glas-Effekte konsistent.
- [ ] **Pill-Nav Active-State**: aktives Item hat aktuell *keinen* dauerhaften
      Hintergrund (nur Punkt + blauer Text) — evtl. richtige Active-Pill.
- [ ] **Breakpoint-Chaos** aufräumen (23 verschiedene `max-width`-Werte quer
      durch die CSS — bewusst offenes Tech-Debt).

## ✨ Icon-Feinschliff (Reste)

- [ ] **CandleScope-Logo als themed SVG** statt fixem Gold-WebP → passt sich dem
      Theme-Akzent an (dark/crimson/teal …).
- [ ] **Ziel-Icon-Picker**: Suchfeld ergänzen (wie beim Kategorie-Picker).
- [ ] **Donut-Legende**: Kategorie-Icon neben den Farbpunkt (Legende ist aktuell
      Name-only).
- [ ] Entscheidung: redaktionelle Emojis (Handbuch-Changelog ⚡🎨🚀,
      Status-Badges 🔒 „Abgeschlossen") — lassen oder auch zu Icons?

## 🚀 Feature-Ideen (aus den Verbesserungsvorschlägen)

- [ ] **Undo/Redo (Ctrl+Z)** — versehentlich gelöschter Posten ist sonst weg.
- [x] **Error-Boundary** (`window.onerror` → Toast) — erledigt (toast.js).
- [x] **Debounced `persist()`** — erledigt (state.js, 200ms + sync Flush
      auf beforeunload/pagehide; persistNow() für manuell/Import/Restore).
- [ ] **Inline-Quick-Add** in Transaktionen (ohne volles Modal).

## 🔐 Launch-kritisch (für v1.0)

- [ ] **Auto-Updater** (electron-updater) — sonst manuelles Nachladen pro Version.
- [ ] **Windows Code-Signing** — sonst SmartScreen-Warnung bei Neukunden.
- [x] **Passwort-Hashing gehärtet** — abgelöst durch **Argon2id** (Vault-Modus,
      Modul `crypto-vault.js`, 2026-06-21). Damit ist die Alt-Warnung „SHA-256 ohne
      Salt" gegenstandslos. Hinweis: CLAUDE.md/Memory-Texte noch entsprechend nachziehen.

---

**Empfohlener Start:** erst Live-Test über alle Themes (deckt Fehler aus der
Icon/BG-Session auf) → dann mergen → dann frei wählen: **Design-Kohärenz
(Track B)** für Politur oder **Undo/Redo** als spürbares Feature.

---

## Kontext: Was in der letzten Session gemacht wurde

Branch `design-icons-bg` (auf `audit-fixes`):

1. `1f081a3` — Icon-System (`uiIcon`/`iconHtml`, ~63 Stroke-Icons) + Kategorien
   Emoji→Icon (Daten, Migration, alle Render-Sites, Icon-Picker)
2. `db5ba82` — Pill-Nav Dashboard Active-Background links runden (`:first-child`
   → `:first-of-type`)
3. `a858d91` — Hintergrund-Muster aus Theme-Akzent (`--blue`) + Stärke-Regler
4. `9f17fa3` — CandleScope-Logo in allen Marken-Slots (Splash/Lock/Lizenz/
   Handbuch/Promo) statt 🔐
5. `6261267` — Verträge-Badge: Zähler + Tooltip + Off-Schalter + sichtbar
6. `9065639` — Stufe 2/3: Ziele-Icons + Picker, Dialog-Icons (auto-mapped),
   Privacy-Lock

Davor: Branch `audit-fixes` — 48 Audit-Befunde behoben (siehe `FIXLOG.md`).

**Bewusst nicht geändert:** Toasts (schon SVG), Kreditoren (Logo/Initialen-Avatar
ist passender als generische Icons).
