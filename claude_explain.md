# claude_explain.md — Was wir gebaut haben, einfach erklärt

**Zweck:** Hier erkläre ich (Claude) dir nach jeder Aufgabe in **normalem Deutsch**, was wir gemacht haben, **warum**, und welche **Fachbegriffe** dahinterstecken. Damit du schneller verstehst und Fehler früher selbst siehst.

**Regel für mich:** Nach jeder Arbeitsrunde hänge ich unten einen neuen **Log-Eintrag** an — kurz, klar, jeder Fachbegriff wird erklärt. Kein Jargon ohne Erklärung.

---

## 📖 Begriffe-Lexikon (wächst mit der Zeit)

- **Frontend** — der Teil, den der Nutzer im Browser sieht (Text, Bilder, Buttons).
- **Backend** — der Server-Teil dahinter, den man nicht sieht (Daten speichern, Logik, Datenbank).
- **Repository / Repo (Git)** — der Ordner mit deinem ganzen Code plus dem Verlauf aller Änderungen.
- **Build** — aus deinem Code die fertigen, optimierten Dateien für den Browser zusammenpacken.
- **Bundle** — die fertige, gepackte JavaScript-Datei, die der Browser lädt.
- **Deploy / Deployen** — den fertigen Stand ins Internet stellen, sodass er live erreichbar ist.
- **Vercel** — der Hosting-Dienst, der deine Seite ausliefert und beim Deploy automatisch baut.
- **CLI (Command Line Interface)** — das Befehls-Fenster; du tippst Befehle, statt zu klicken (bei dir: Git Bash).
- **SPA (Single Page Application)** — eine Seite, die im Browser per JavaScript die Inhalte wechselt, statt jede Unterseite neu vom Server zu laden.
- **CSR vs. SSR** — CSR (Client-Side Rendering): der Browser baut die Seite selbst per JS auf → am Anfang leere Hülle. SSR (Server-Side Rendering): der Server schickt die fertige Seite → schneller sichtbar.
- **Komponente** — ein wiederverwendbarer Baustein im Frontend (Button, Karte, Header). In React eine Funktion, die HTML zurückgibt.
- **State (Zustand)** — Daten, die sich ändern und die Anzeige steuern (z. B. „Dark Mode an/aus").
- **Hook** — in React eine Funktion, die mit `use` beginnt (z. B. `useState`) und Zustand/Verhalten in eine Komponente bringt.
- **CSS** — die Sprache fürs Aussehen (Farben, Abstände, Layout).
- **Tailwind** — ein CSS-System, bei dem man das Styling über kurze Klassen direkt ins HTML schreibt (`px-4`, `text-lg`).
- **Animation / Framer Motion** — Bewegung im Frontend; Framer Motion ist die Bibliothek, die wir dafür nutzen.
- **HTTP-Header** — Zusatz-Infos, die der Server bei jeder Anfrage mitschickt (z. B. Sicherheitsregeln).
- **CSP (Content Security Policy)** — eine Sicherheits-Regel, die festlegt, welcher Code und welche Quellen auf der Seite erlaubt sind.
- **Env-Variable / `VITE_`-Variable** — Konfigurationswerte. Wichtig: Alles mit `VITE_` landet im **öffentlichen** Bundle, ist also **nicht geheim**.

---

## 📓 Log

### 2026-06-15 — candlescope.de komplett überarbeitet (diese Session)

**Was wir gemacht haben (Überblick):**

1. **VaultBox von der Website getrennt.** Der Gratis-Download flog raus, die `/finance`-Produktseite wurde gelöscht und leitet jetzt auf `/dev` um. Grund: VaultBox wird ein bezahltes Produkt mit eigener Seite — kein Gratis-Download auf der Brand-Site.
   - *Begriff Redirect:* eine automatische Weiterleitung von einer alten Adresse auf eine neue.

2. **Echte Schriften eingebaut.** Vorher lief die ganze Seite in System-Schrift, obwohl überall „Space Grotesk"/„JetBrains Mono" stand — die Schriften wurden nämlich nie geladen. Wir haben sie **self-hosted** eingebunden (Schrift-Dateien liegen auf deinem Server statt bei Google → schneller + datenschutzkonform).
   - *Begriff self-hosted:* du lieferst die Datei selbst aus, statt sie von einem fremden Dienst zu laden.

3. **Dark Mode als Standard + Safari-Fix.** Neue Besucher sehen jetzt zuerst den Dunkelmodus. Der Umschalter hat in Safari gesponnen, weil eine Einstellung namens `color-scheme` fehlte (sagt dem Browser, ob er native Elemente hell oder dunkel zeichnen soll). Jetzt gesetzt → zieht überall sauber mit.

4. **Neue App-Bilder + 3D-Screenshot-Carousel** auf der Startseite (zeigt alle VaultBox-Ansichten durch, statt nur ein Bild).
   - *Begriff Carousel:* ein durchblätterbares Bilder-Karussell.

5. **Kontaktformular funktioniert** — angebunden an **Formspree** (ein Dienst, der Formular-Einsendungen entgegennimmt und dir als Mail schickt, ohne eigenes Backend).

6. **Neuer Hero-Claim** „Ich baue Software, die hält." statt des alten Produkt-Slogans — die Startseite ist jetzt deine Marken-/Personen-Front, nicht mehr eine VaultBox-Verkaufsseite.
   - *Begriff Hero:* der große obere Bereich einer Seite (Überschrift + Haupt-Botschaft).

7. **Light-Mode-Kontrast verbessert** (Texte dunkler, Ränder kräftiger → weniger „bleich"), Nav-Buttons oben rechts entblasst, Calendly-Badge nach oben gerückt.

8. **Sicher deployt ohne GitHub-Push.** Wir haben **nur die fertige Website** per Vercel-CLI hochgeladen — **kein** `git push`, weil dein Repo (`CS-OP`) öffentlich ist und ein Push den **VaultBox-Quellcode + Master-Key** für alle sichtbar gemacht hätte.

**Wichtigste Lektion der Session (Performance):** Schwere Endlos-Animationen (Marquee, Carousel-Autoplay, pulsende Effekte) + viel JavaScript machen eine Seite im **Lighthouse**-Test langsamer und den Score „wackelig". Eine schlanke Login-Seite gewinnt da immer. Für die neue VaultBox-Seite heißt das: krasse Animationen ja — aber „Apple-Style richtig gemacht" (GPU-schonend, beim Scrollen statt endlos, faul nachladen).
   - *Begriff Lighthouse:* das eingebaute Test-Werkzeug von Chrome, das eine **einzelne URL** auf Performance, SEO, Barrierefreiheit prüft.

### 2026-06-16 — Bug behoben: Carousel-Bilder waren kaputt

**Problem:** Auf der Startseite zeigte das Screenshot-Karussell statt der Bilder nur den Text „VaultBox Übersicht" — also **defekte Bilder**.

**Ursache:** Ich hatte die Bilder mit **Umlaut-Dateinamen** eingebunden (`Übersicht.webp`, `Vertrag.webp` …). Ein „Ü" kann technisch auf zwei Arten gespeichert sein (Unicode-Normalisierung, „NFC" vs. „NFD"). Beim Bauen/Hochladen entsteht dann eine winzige Abweichung zwischen dem Namen, den der Code sucht, und dem Namen der Datei auf dem Server → der Server findet die Datei nicht → **404 (nicht gefunden)** → kaputtes Bild.
   - *Begriff Unicode-Normalisierung:* Regel, wie Sonderzeichen als Bytes gespeichert werden. Verschiedene Systeme machen es unterschiedlich → kann zu „Datei nicht gefunden" führen.
   - *Begriff 404:* HTTP-Fehlercode „Seite/Datei nicht gefunden".

**Lösung:** Ich habe das Karussell auf die **ASCII-Kopien** (nur normale Buchstaben, keine Umlaute) umgestellt, die schon in `public/images/` lagen (`home-preview.webp`, `finance-krypto.webp` …). Diese werden direkt ausgeliefert (kein Bundling, keine Umlaut-Falle). Danach: neu gebaut, deployt, live geprüft → alle Bilder liefern jetzt **HTTP 200 (OK)**.

**Lehre für die Zukunft:** **Dateinamen für's Web immer in ASCII** halten — keine Umlaute, keine Leerzeichen. Spart genau solche unsichtbaren Fehler.

### 2026-06-21 — VaultBox: kritische Sicherheitslücke geschlossen (RCE im Archiv)

**Was war kaputt?** Die Desktop-App hatte einen IPC-Kanal `archive:openPath`, der einen **beliebigen Dateipfad** vom UI-Teil (Renderer) bekam und ihn direkt an `shell.openPath` (Windows „Datei ausführen/öffnen") weiterreichte — **ohne jede Prüfung**. Wenn jemand Schadcode in den UI-Teil einschleust (z. B. über eine manipulierte Eingabe), konnte er damit **jedes Programm auf dem PC starten** (`C:\…\böse.exe`). Das nennt man **RCE**.
   - *Begriff IPC (Inter-Process Communication):* die Brücke, über die der sichtbare UI-Teil mit dem mächtigen System-Teil der App redet. Jeder Kanal dort ist eine Tür — und muss bewacht sein.
   - *Begriff RCE (Remote Code Execution):* „Fremder Code wird auf deinem Rechner ausgeführt" — die schwerste Art von Lücke.
   - *Begriff Renderer:* der UI-Teil einer Electron-App (läuft wie eine Webseite). Genau dort kann fremder Code landen, deshalb darf man ihm **nie** blind vertrauen.

**Wie ich es behoben habe (3 Schichten Verteidigung):**

1. **Der Renderer nennt nur noch eine `docId`, keinen Pfad mehr.** Der System-Teil schlägt den echten Dateipfad selbst im Index nach. So kann der UI-Teil nicht mehr bestimmen, *welche* Datei geöffnet wird. (Neuer Kanal `archive:openDoc`, der alte gefährliche `archive:openPath` ist **gelöscht**.)
2. **Pfad-Einsperrung auch nach Symlink-Auflösung.** Mit `realpathSync` löse ich Verknüpfungen auf und prüfe danach erneut, dass die Datei *wirklich* im Archiv-Ordner liegt.
   - *Begriff Symlink:* eine Datei, die in Wahrheit nur auf eine andere zeigt — ein klassischer Ausbruch-Trick.
   - *Begriff Path-Traversal:* mit `..\..\` aus dem erlaubten Ordner „herausklettern".
3. **Endungs-Allowlist.** Nur harmlose Dokumenttypen (pdf, Bilder, Office, txt …) dürfen extern geöffnet werden. Ausführbare/aktive Typen (`.exe .bat .lnk .html .svg …`) werden **immer abgelehnt** — selbst wenn sie im Archiv liegen.
   - *Begriff Allowlist:* „nur das hier ist erlaubt, alles andere nicht" (sicherer als eine Verbotsliste, die immer Lücken hat).

**Die eigentliche Wurzel mitgefixt:** `archive:addBuffer` (Datei per Drag&Drop ablegen) schrieb die Datei-Endung **ungeprüft** auf die Platte — damit konnte man die Allowlist mit Tricks wie `böse.exe ` (Leerzeichen am Ende) austricksen. Jetzt wird die Endung beim Speichern **kanonisiert** (nur `a–z0–9`) und eine **20-MB-Grenze** gesetzt. Zusätzlich den Nachbar-Handler `archive:openFolder` gegen denselben Traversal-Trick abgesichert.

**Wie ich sichergegangen bin:** Ich habe den Entwurf **von einem zweiten KI-„Angreifer-Team" (Red-Team) attackieren lassen, bevor** ich ihn umgesetzt habe — der hat genau die zwei Tricks oben gefunden, die der erste, „fertig aussehende" Code noch offen hatte. Danach: Syntax-Check aller drei Dateien (`node --check`) = sauber, keine alten Aufrufe mehr übrig.
   - *Begriff Red-Team:* Leute (hier: KI-Agenten), deren Job es ist, eine Lösung kaputtzumachen, statt sie zu loben. So findet man Löcher **vor** dem Angreifer.

**Noch offen (bewusst, kommt als eigene Schritte):** Die Daten liegen weiter **unverschlüsselt** auf der Platte (`state.json`, `crypto.db`, localStorage) — das Passwort ist bisher nur ein Bildschirm-Schloss, kein Tresor. Das ist der nächste große Block (echte Verschlüsselung mit Schlüssel aus dem Passwort) und braucht eine saubere Datenmigration.

### 2026-06-21 — VaultBox: Lizenz auf Ed25519-Abo umgestellt (MASTER_KEY raus)

**Was war kaputt?** In `main.js` standen zwei **Geheimnisse im Klartext**: ein `MASTER_KEY` (Universal-Freischalt-Code) und ein `LICENSE_HMAC_SECRET`. Beide Verfahren waren **symmetrisch** — d.h. derselbe Geheimwert, der eine Lizenz *erstellt*, *prüft* sie auch. In einer App, die man dem Kunden gibt (und in einem **öffentlichen** Repo), ist so ein Geheimnis sofort öffentlich → jeder kann sich selbst eine gültige Lizenz bauen.
   - *Begriff symmetrisch vs. asymmetrisch:* Symmetrisch = ein Schlüssel für alles (wie ein Haustürschlüssel, der auf- UND zusperrt). Asymmetrisch = ein **Schlüsselpaar**: ein privater zum Signieren (bleibt bei dir), ein öffentlicher zum Prüfen (darf jeder sehen).
   - *Begriff HMAC:* ein „Siegel" mit einem geheimen Schlüssel. Funktioniert nur, wenn das Geheimnis geheim bleibt — bei einer ausgelieferten App unmöglich.

**Wie ich es gelöst habe (Ed25519):**

1. **Asymmetrische Signatur.** Dein **privater** Schlüssel (bleibt auf deinem Rechner/Server) signiert jede Lizenz. In der App steht nur der **öffentliche** Schlüssel — der kann Lizenzen *prüfen*, aber niemals *fälschen*. Deshalb darf er gefahrlos im öffentlichen Code stehen. **Kein Geheimnis mehr im Programm.**
   - *Begriff Ed25519:* ein modernes, schnelles Signatur-Verfahren (Teil der „Public-Key-Kryptografie").
   - *Begriff signieren:* einen unfälschbaren digitalen Fingerabdruck unter Daten setzen, den jeder mit dem öffentlichen Schlüssel überprüfen kann.

2. **Abo-Gate.** Die `license.json` enthält ein **Ablaufdatum** (`validUntil`) und eine **Geräte-ID** (`machineId`). Beim Start prüft die App: Signatur echt? Richtiges Gerät? Noch nicht abgelaufen? Wenn nein → **Sperrbildschirm** mit „Abo erneuern"-Link, die App selbst wird gar nicht erst geladen.
   - *Begriff Geräte-Bindung:* die Lizenz gilt nur auf dem PC, dessen Hardware-Kennung in der Lizenz steht → man kann sie nicht einfach im Internet teilen.

3. **Kunden-freundliche Details:** 14 Tage **Grace-Period** (kurzer Internet-Ausfall sperrt keinen zahlenden Kunden aus), automatische **Online-Erneuerung** kurz vor Ablauf, und ein **Rollback-Schutz** (wer die PC-Uhr zurückdreht, wird zur Online-Prüfung gezwungen — aber NICHT dauerhaft gesperrt, sonst träfe es Leute mit Zeitzonen-/Uhr-Problemen).

4. **Zwei Werkzeuge** in `tools/` (bleiben bei dir): `gen-license-keys.js` erzeugt einmalig dein Schlüsselpaar, `issue-license.js` signiert einzelne Abo-Lizenzen.

**Verifikation:** Ich habe einen echten **Krypto-Selbsttest** laufen lassen — Lizenz signieren, dann prüfen für 6 Fälle (gültig / abgelaufen / Grace / falsches Gerät / manipulierte Signatur / Owner). **Alle 6 korrekt.** Plus Syntax-Check aller Dateien, plus Grep: keine Spur von MASTER_KEY/HMAC mehr.

**Wichtig — die ehrliche Grenze:** Eine reine Offline-App ist **nie „unknackbar"**. Sie liegt entpackt auf dem Kunden-PC; ein Profi kann theoretisch den öffentlichen Schlüssel austauschen oder die Prüf-Zeile patchen. Das hier stoppt **Casual-Sharing und 99 % der Leute** — echte Härte bräuchte zusätzlich Code-Signing + asar-Integrität + Server-Komponente.

**Strategischer Hinweis (von mir markiert):** Dein eigener Businessplan V2 sagt ausdrücklich *„kein Abo"* — weil ein Abo den Anti-Abo-Markenkern zerstöre und die App „nach Hause telefonieren" müsse. Das jetzt gebaute Abo führt genau diesen Online-Touchpoint ein. Ich hab gebaut, was du wolltest, markiere aber den Widerspruch — bitte bewusst entscheiden, ob Abo wirklich die Richtung ist.

### 2026-06-21 — Native Build-Toolchain eingerichtet + Verschlüsselung auf echten Daten bewiesen

**Was passiert ist:** Die Verschlüsselung braucht zwei **native** Module (C++ statt JavaScript): `argon2` (das langsame Passwort-Verfahren) und `better-sqlite3-multiple-ciphers` (verschlüsselte Datenbank = SQLCipher). „Nativ" heißt: der Code muss auf deinem PC zu Maschinencode **kompiliert** werden, passend zur Electron-Version.
   - *Begriff native Module / Bindings:* Pakete mit C/C++-Anteil. Sie müssen für die genaue Laufzeit (hier Electron 40) gebaut werden, sonst laden sie nicht.
   - *Begriff Toolchain:* die Werkzeuge zum Kompilieren — hier **MSVC** (Microsofts C++-Compiler) + **Python** (das `node-gyp` zum Steuern braucht).

**Was ich gemacht habe:**
1. Festgestellt, dass der **C++-Compiler fehlte** → über `winget` die **Visual Studio 2022 Build Tools** (nur C++-Workload) installiert (mehrere GB, mit deiner UAC-Bestätigung).
2. `npm install` + `electron-rebuild` ausgeführt → alle drei Module sauber für Electron 40 gebaut (Exit 0).
3. **Beweis-Test in echtem Electron gegen eine KOPIE deiner echten `state.json`** (Original nie angefasst): argon2 lief **nativ** (kein Fallback), der komplette Verschlüsseln→Schreiben→Lesen→Entschlüsseln-Roundtrip war **byte-identisch** (448 KB in 241 ms), falsches Passwort wurde abgelehnt. SQLCipher: verschlüsselt geschrieben/gelesen, **kein Klartext** in der Datei, Öffnen ohne Schlüssel scheitert, `temp_store=MEMORY` aktiv.
4. Test-Harness + Kopie danach wieder gelöscht.

**Begriffe:**
   - *electron-rebuild:* Werkzeug, das native Module gegen die Electron-Laufzeit neu baut (Electron nutzt eine andere interne Version als normales Node).
   - *SQLCipher / temp_store=MEMORY:* SQLCipher verschlüsselt die ganze DB-Datei. `temp_store=MEMORY` zwingt SQLite, Zwischen­tabellen nur im RAM zu halten → nichts Unverschlüsseltes landet auf der SSD.

**Stolperstein zum Merken:** In der Shell war `ELECTRON_RUN_AS_NODE=1` gesetzt — dann startet `electron datei.js` als **reines Node** (ohne Fenster-API), und `require("electron").app` ist `undefined`. Vor dem Starten von Electron-Skripten ggf. `unset ELECTRON_RUN_AS_NODE`. (Deine normale App über `npm run dev`/`npm start` ist davon nicht betroffen.)

**Stand:** Die Krypto-/Lizenz-Logik ist jetzt **build-verifiziert** auf dem HauptPC. Was noch fehlt zum Scharfschalten: die Integrationsblöcke (main.js/state.js) + der Passwort-Sperrbildschirm tatsächlich in die Dateien einsetzen und einen Live-Migrations-Durchlauf in der laufenden App machen.

### 2026-06-21 — Verschlüsselung in die App verdrahtet (staged, noch nicht aktiv)

**Was passiert ist:** Die ganzen Krypto-Bausteine waren bisher nur „Blöcke zum Einfügen". Jetzt sind sie **wirklich in den Dateien**: `main.js` (Vault-Handler + verschlüsseltes Speichern/Laden + verschlüsselte Safepoints), `state.js` (Vault-Modus, Entsperr-Ablauf, Migrations-Funktion), `lockscreen.js` (der Passwort-Sperrbildschirm), `index.html` (Boot legt die App bei vorhandenem Vault lahm bis zum Entsperren), `settings.js` (Button „Verschlüsselung aktivieren"), `preload.js` (Vault-Brücke).
   - *Begriff staged / Feature-Flag:* Die Verschlüsselung ist „scharf geschaltet, aber aus". Solange du sie nicht aktivierst, verhält sich die App **exakt wie vorher** (unverschlüsselt). Erst dein Klick auf „aktivieren" baut den Tresor. → Einfügen kann die App nicht kaputtmachen.

**Sicherheits-Netz:** Vorher ein **Backup** deiner echten `state.json` + `crypto.db` unter `%APPDATA%/vaultbox/_backup_vor_vault_20260621/` abgelegt.

**Verifikation:** Alle 6 geänderten JS-Dateien + alle 6 Inline-Scripts der index.html bestehen die Syntax-Prüfung. **Nicht** getestet werden konnte der echte Boot/Migrations-Klick (GUI lässt sich headless nicht starten) — das ist dein Live-Test.

**Bewusst noch offen (eigener nächster Schritt):** Seitentür 3 (automatischer Export nach Downloads) + Seitentür 4 (`crypto.db` → SQLCipher). Die brauchen eine eigene Migration mit Kopie-Test, genau wie der Haupt-Vault. Bis dahin sind diese beiden Datenpfade im Vault-Modus noch Klartext — bewusst markiert, nicht heimlich.

### 2026-06-21 — Recovery-Code, crypto.db-Verschlüsselung, Auto-Lock + komplette Doku

**Notfall-Schlüssel (Recovery-Code):** Auf deine Frage „was ist mit dem Master-Passwort?" — das Master-Passwort wird **nirgends gespeichert** (Zero-Knowledge), also gäbe es ohne Netz keine Rettung bei Vergessen. Jetzt erzeugt die App beim Aktivieren **einmalig** einen 25-stelligen Notfall-Schlüssel (XXXXX-XXXXX-…). Der wickelt denselben Datenschlüssel ein zweites Mal ein — vergisst du das Passwort, öffnest du damit den Tresor und setzt ein neues. Überlebt auch Passwort-Wechsel. In Electron getestet: 8/8 Checks grün.
   - *Begriff:* wie der „Wiederherstellungscode" bei Profi-Passwortmanagern — die einzige Hintertür, und die hast nur du.

**Seitentür 4 geschlossen — crypto.db verschlüsselt:** Deine Krypto-Steuerdatenbank läuft jetzt im Vault-Modus über **SQLCipher** (`temp_store=MEMORY`, damit auch Zwischendaten nie unverschlüsselt auf die SSD kommen). Die Migration (Klartext-DB → verschlüsselt) habe ich vorher auf einer **Kopie deiner echten DB** getestet: 6 Transaktionen + 5 FIFO-Lots + 1 Match wandern 1:1 rüber, verschlüsselt, Öffnen ohne Schlüssel scheitert. Zusätzlich „Self-Heal": falls die Migration beim Aktivieren mal scheitert, holt die App sie beim nächsten Zugriff automatisch nach.

**Auto-Lock:** Im Vault-Modus wirft die 5-Minuten-Inaktivitätssperre jetzt den Schlüssel wirklich aus dem Speicher (nicht nur ein Blur drüber).

**Native Build eingerichtet + alles auf echten Daten verifiziert:** MSVC C++ Build Tools installiert, `argon2` + SQLCipher gegen Electron gebaut, und in echtem Electron gegen **Kopien** deiner Daten geprüft — argon2 nativ, Verschlüsselung, Migration, Recovery: alles grün. Original nie angefasst, Backup unter `%APPDATA%/vaultbox/_backup_vor_vault_20260621/`.

**Doku komplett aktualisiert:** Mit **5 parallelen Agenten** gleichzeitig alle Projekt-`.md` (CLAUDE.md, Bedienungsanleitung, AUDIT_REPORT, FIXLOG, NEXT_STEPS, CLAUDE_SESSION, BUILD, Verkaufsplan) + die In-App-Doc-Seite (`docs.js`, neuer Changelog-Eintrag v11.0) auf den neuen Stand gebracht.
   - *Begriff parallele Agenten:* mehrere KI-Helfer, die GLEICHZEITIG je eine Datei bearbeiten → schneller als nacheinander, weil die Dateien unabhängig sind.

**Lizenz endgültig auf Hybrid (Weg B):** Perpetual bleibt Standard (kein Ablauf, kein Nach-Hause-Telefonieren), Abo ist nur ein optionaler Tier — der alte Perpetual-vs-Abo-Widerspruch ist damit aufgelöst.

**Offen + ehrlich:** Der echte **Klick-Test in der laufenden App** (aktivieren → Neustart → entsperren) steht noch aus — den kannst nur du machen, ich kann die GUI nicht starten.

### 2026-06-21 (Nachtrag) — Seitentür 3 geschlossen: ALLE 4 Türen zu

Die letzte offene Stelle ist erledigt: Das **Auto-Backup vor dem „Alle-Daten-Löschen"** (`export:fullAuto`, schrieb eine `.fbs` nach Downloads) war im Vault-Modus noch Klartext. Jetzt schreibt es ein **mit dem DEK verschlüsseltes** Backup; beim Import erkennt die App den verschlüsselten Container und entschlüsselt ihn über den entsperrten Vault. In Electron getestet: keine Klartext-IBAN/-Saldo in der Datei, Wiederherstellung identisch, ein fremder Vault kann es nicht öffnen.
   - *Was das heißt:* Im verschlüsselten Modus liegt **nirgends** mehr Klartext deiner Finanzdaten — nicht in `state.json`, nicht in Safepoints, nicht in `crypto.db`, und nicht in Backups. Ein zusätzlicher Sicherheits-Review-Hinweis (Klartext-`.plainbak` nach der DB-Migration) wurde ebenfalls behoben (sicheres Überschreiben statt liegenlassen).

**Damit ist der Code fertig.** Offen bleibt nur dein **Live-Aktivierungstest** — danach der geplante **Claude-Design-Durchgang** der neuen Verschlüsselungs-Oberfläche (Sperrbildschirm, Notfall-Schlüssel-Anzeige, Settings-Sektion sind funktional, aber optisch noch schlicht).

### 2026-06-23 — candlescope.de Redesign: Konzept durchdacht + Spec geschrieben (noch kein Code)

**Was wir gemacht haben:** Bevor wir die Website umbauen, haben wir das Ganze **erst komplett durchdacht** und in einem **Spec** festgehalten (`docs/superpowers/specs/2026-06-23-candlescope-redesign-design.md`). Es wurde **noch keine einzige Zeile umgebaut** — das ist Absicht.
   - *Begriff Spec (Spezifikation):* das „Bauplan-Dokument". Es legt vorher fest, *was* gebaut wird und *warum* — damit wir beim Bauen nicht raten und uns nicht verzetteln.
   - *Begriff Konzept-Phase / Brainstorming-Gate:* die Regel „erst Plan freigeben, dann bauen". Schützt vor Arbeit, die man wieder wegwirft.

**Wie wir den Spec erarbeitet haben:** Ich habe **6 Recherche-Agenten gleichzeitig** losgeschickt (Bewegung, Cursor, Scroll-Effekte, Art-Direction, Seiten-Aufbau) **plus einen „Realismus-Kritiker"**, der das Rohkonzept absichtlich zerpflückt hat. Sein Urteil: „80 % solide, 20 % Performance-Selbstmord". Genau die 20 % haben wir **gestrichen** (siehe unten) — so bleibt es krass, aber realistisch baubar.

**Deine 3 Entscheidungen:** (1) **gesamte Website** umbauen, nicht nur die Startseite; (2) Haupt-Botschaft = **„Software, die dir gehört"**; (3) die Vollbild-Intro **stark kürzen**.

**Die wichtigsten Begriffe aus dem Spec:**
   - *Design-Tokens:* zentrale „Stellschrauben" für Schrift, Farben, Abstände an **einer** Stelle. Ändert man den Token, ändert sich die ganze Seite einheitlich — statt 100 Hex-Farben einzeln zu pflegen.
   - *Reveal:* ein Element „erscheint" beim Hereinscrollen (z. B. wischt auf oder fährt hoch) — und zwar **einmal**, nicht endlos.
   - *Parallax:* Hintergrund bewegt sich beim Scrollen **langsamer** als der Vordergrund → Tiefen-Effekt.
   - *Partikelfeld / Canvas:* kleine Gold-Punkte hinter dem Inhalt, die sich beim Scrollen leicht bewegen. „Canvas" = eine Zeichenfläche im Browser.
   - *rAF (requestAnimationFrame) + Idle-Abschaltung:* die saubere Art, flüssig zu animieren — und das **Abschalten**, sobald nichts passiert (Maus steht, kein Scroll). Das ist der größte Trick gegen den langsamen Lighthouse-Score von heute.
   - *Morph-Cursor:* ein eigener Mauszeiger, der seine Form je nach Kontext ändert (Punkt → Ring an Buttons → „Ansehen"-Label über Projekten). Nur am Desktop, am Handy normaler Zeiger.

**Was bewusst gestrichen wurde (Realismus):** „Lenis" (Sanft-Scroll-Bibliothek — kollidiert mit deinem Theme-Wechsel-Effekt), die Kopplung Cursor↔Partikel, Effekt-Spielereien. Und der **wichtigste** Punkt: die **alte Effekt-Altlast muss zuerst weg** — heute laufen **33 Endlos-Animationen** über 9 Dateien plus 6 riesige Weichzeichner-„Orbs", *das* bremst die Seite. Neuer Glanz kommt **nicht** obendrauf, sondern **ersetzt** den alten.

**Stand:** Spec fertig + selbst geprüft. Wartet auf deine Freigabe. Danach kommt der **Umsetzungsplan** (welche Datei in welcher Reihenfolge), erst dann wird gebaut.

### 2026-06-24 — candlescope.de: Landingpage gebaut + verfeinert (echter Code, lokal anschaubar)

**Was wir gemacht haben:** Aus dem Konzept ist jetzt **echter Code** geworden — die komplette Startseite (`/`) ist neu gebaut. Header und Footer (deine Navigation) wurden **bewusst nicht angefasst** und bleiben 1:1 wie sie waren. Alles Neue lebt in einem eigenen Ordner `src/components/home/`.

**Die neuen Bausteine (jede Datei hat genau eine Aufgabe):**
   - `ScrollThread.tsx` — *die Signatur-Idee:* eine Linie, die zuerst **unsichtbar** ist; ein **Gold-Diamant** fliegt beim Scrollen nach unten und **zeichnet die Linie hinter sich**. An vier **Checkpoints** gibt es eine **Partikel-Explosion**.
     - *Begriff stroke-dashoffset:* ein SVG-Linien-Trick. Man „versteckt" die Linie, indem man sie um ihre eigene Länge verschiebt, und schiebt sie beim Scrollen Stück für Stück wieder rein → sie wirkt, als würde sie gezeichnet.
   - `FloatingFrame.tsx` — die Bild-Rahmen rechts. Sie **schweben** je nach Scroll-Stand (Parallax) und **kommen vom Seitenrand hereingeflogen** — scrollst du zurück, fliegen sie wieder raus. *„Scroll-gebunden"* heißt: die Bewegung hängt direkt am Scroll-Stand, nicht an einem einmaligen Auslöser → deshalb reversibel.
   - `Starfield.tsx` — feine, **ferne Mini-Sterne** (Universum-Tiefe) auf einer `<canvas>` (Browser-Zeichenfläche). Funkeln + minimaler Drift, schaltet sich ab wenn der Tab im Hintergrund ist.
   - `HeroOrbit.tsx` — die **Grafik oben rechts im Hero** (damit es rechts nicht leer ist): rotierende Gold-Orbits mit umlaufenden Punkten + glühender Diamant-Kern + Sterne. Passt zum Universum-Motiv.
   - `primitives.tsx` — kleine Helfer: `Reveal`/`Stagger` (Einblenden beim Scrollen), `CountUp` (Zahlen zählen hoch), `DisciplineTicker` (das rotierende Wort **Security → Automation → Datenanalyse → Agentensysteme**), `FilmGrain` (feine Film-Körnung).
   - `data/cases.ts` — die vier Projekte: **VaultBox · ShopRay · CandleScope/FinanzHub · Sentinel** (in Entwicklung). Echte Screenshots werden eingebunden.

**Hero-Claim:** „**Premium ist keine Sparte. / Es ist meine Bauweise.**"

**Verfeinerungen danach (deine Wunschliste):** Universum-Sterne ergänzt, Checkpoint-Explosion kräftiger (18 Partikel + Lichtblitz), Bilder fliegen vom Rand rein/raus, Hintergrund-Wörter geändert (**SECURITY** statt WERK, **GENAI** statt MACHER), die **Entrance-Animation** stark vereinfacht (nur **Logo + Name**, kein Kasten drumherum, kürzer), und das **Calendly-„Termin vereinbaren"** erscheint jetzt **erst nach** der Entrance-Animation (über ein kleines internes Signal `cs:intro-done`).
   - *Begriff Event/Signal:* eine Nachricht, die ein Teil der App abschickt (`dispatchEvent`) und ein anderer empfängt (`addEventListener`) — so weiß der Calendly-Button, dass das Intro vorbei ist, ohne dass beide direkt verbunden sind.

**Korrektur:** Die Kontakt-E-Mail war zuerst falsch (`hello@…`) — auf die richtige **`info@candlescope.de`** umgestellt (so wie überall sonst auf der Seite).

**Qualität:** Build ist sauber (`tsc -b` + `vite build`, keine Fehler). Zusätzlich lief eine **adversariale Prüfung mit 27 KI-Agenten** über den Code (Runtime-Bugs, Theme, Mobile) — kritische Punkte wurden widerlegt, nur kleine Light-Mode-Politur war übrig und ist gefixt. Alle Animationen respektieren **reduced-motion** (System-Einstellung „Bewegung reduzieren").

**Standard-Theme:** ist bereits **Dark** (in `theme-init.js` und `ThemeContext`). Falls bei dir Hell erscheint, liegt nur ein gespeicherter Light-Wert im Browser.

**Stand:** Startseite fertig + lokal anschaubar (`npm run dev` in `apps/frontend`). Die übrigen Seiten (About, Dev, Community, Contact) bekommen dasselbe System, sobald die Startseite dir gefällt.

### 2026-06-28 — VaultBox: Zahltag-Bug in der Zahlungsübersicht gefixt

**Das Problem (was du gemeldet hast):** Wenn du den Zahltag änderst, gleicht sich die **Zahlungsübersicht** (die Liste der offenen Zahlungen im Dashboard-Cockpit) nicht an — sie rechnet weiter mit dem falschen Tag.

**Die echte Ursache (in deinen echten Daten nachgewiesen):** Der Zahltag wird an **zwei** Stellen gehalten:
   - `CFG.zahltag` — der Wert aus den **Einstellungen** (gespeichert im Browser-Speicher des Programms).
   - `S.zahltag` — der Wert in deinen **Daten** (kommt z. B. aus deinem Hauptkonto, gespeichert in `state.json`).
   Die Funktion `getZahltag()`, die das ganze Dashboard benutzt, nimmt **immer zuerst** `CFG.zahltag`. In deinen echten Daten steht aber in den Einstellungen **gar kein** Zahltag — also griff der **Standard-Wert 15**. Dein echter Zahltag **25** steht in den Daten (`S.zahltag`), wurde aber vom Standard-15 **überdeckt**. Ergebnis: Cockpit rechnet mit dem 15., obwohl dein Zahltag der 25. ist.

   - *Begriff „überdecken/abschatten":* Wenn zwei Werte existieren und das Programm beim Auslesen immer den einen nimmt, „verdeckt" dieser den anderen — selbst wenn der andere der richtige wäre. Hier: der Standard-15 verdeckte deinen echten 25.

**Der Fix:** Eine neue kleine Funktion `reconcileZahltag()` (in `settings.js`) läuft **einmal beim Programmstart**, direkt nachdem deine Daten geladen sind. Ihre Regel:
   - Hast du den Zahltag **bewusst in den Einstellungen** gesetzt → der gilt (wie bisher).
   - Hast du **nie** einen in den Einstellungen gesetzt → es gilt der Zahltag aus deinen **Daten** (dein echter 25), statt des Standard-15.
   Damit ist der Wert ab sofort an beiden Stellen **gleich** und „heilt sich selbst" beim nächsten Start.

   - *Begriff „reconcile" (abgleichen):* zwei Stellen, die dasselbe speichern sollen, wieder auf **einen** gemeinsamen Wert bringen, falls sie auseinandergelaufen sind.

**Geprüft:** 5 Logik-Tests (dein Bug-Fall, bewusst gesetzter Wert, frische Demodaten, Leerfall, bereits synchron) — **alle bestanden**. Deine echte `state.json` ist **unangetastet** (Zahltag 25, gleiche Größe, Backup vorhanden).

**Begriff am Rande — „Kategorien doppelt":** separat geprüft. Im aktuellen Code ist **kein** Fehler — die Export-Funktion schreibt die Kategorien genau **einmal**. Die Dopplung steckte nur in einer **alten** Export-Datei vom Mai. Kein Eingriff nötig.

---

## 01.07.2026 — Timeline-Rahmen früher & Carousel-Timing (Landingpage)

**Was gemacht:**
1. **Carousel** (`CinematicScroll.tsx`): Das seitliche Durchscrollen der Projekt-Karten startet jetzt **später** und **hält am Ende die letzte Karte** mittig.
   - Der Versatz `x` war vorher direkt an den kompletten Scroll-Fortschritt `[0 → 1]` gekoppelt → die Karten fingen sofort an zu rutschen.
   - Neu: `[0.18 → 0.86]`. Heißt: die ersten 18 % Scroll bleibt **Karte 1 mittig stehen**, ab 86 % ist die **letzte Karte erreicht und bleibt mittig** stehen, bis die Sektion endet.
   - Container von `400vh` auf `560vh` erhöht → mehr Scroll-Weg = ruhigeres, längeres seitliches Gleiten.
2. **Timeline** (`ThreeParticleTimeline.tsx`): Der **Rahmen**, den die Gold-Linie ums Carousel bildet (Linie teilt sich nach links & rechts), **öffnet sich jetzt früher**.
   - In der Pfad-Geometrie (SVG) die Stelle, an der die Linie zu den Rändern ausschert, von `y=440` auf `y=385` hochgezogen → der Rahmen beginnt weiter oben und ist etwas höher.

**Warum:** Vorher rutschten die Karten sofort los (Karte 1 stand nie richtig mittig) und die letzte Karte sah man erst im letzten Moment. Jetzt gibt es klare „Ruhepunkte" am Anfang und Ende.

**Begriffe:**
- *`useTransform([Eingabe-Bereich], [Ausgabe-Bereich])`:* eine Framer-Motion-Funktion, die einen Wert (hier Scroll-Fortschritt) in einen anderen umrechnet. Werte **außerhalb** des Eingabe-Bereichs werden „geklemmt" (bleiben am Rand stehen) — genau das erzeugt die Halte-Pausen.
- *`vh` (viewport height):* 1vh = 1 % der sichtbaren Fensterhöhe. `560vh` = die Sektion ist 5,6 Bildschirmhöhen lang.
- *SVG-Pfad `C x1,y1 x2,y2 x,y`:* eine Bézier-Kurve mit zwei „Steuerpunkten" und einem Zielpunkt. Kleineres `y` = weiter **oben** auf der Seite.

**Geprüft:** `npm run build` (apps/frontend) → clean, ✓ built in 794 ms.

---

## 02.07.2026 — Timeline-Kopplung, Comet-Vorlauf, Hover-Invert, Schriftzug + Deploy-Blocker

**Was gemacht:**
1. **Timeline-Rahmen dynamisch an die Carousel gekoppelt** (`ThreeParticleTimeline.tsx`):
   Vorher war der Split (die zwei Linien, die einen Rahmen ums Carousel bilden) mit **festen Pixelwerten** im SVG-Pfad gesetzt. Problem: Die Carousel-Sektion ist **sticky** (5,6 Bildschirme hoch) — die Karte steht still, während die Timeline dahinter durchscrollt. Feste Werte verrutschen dadurch je nach Karte/Bildschirm.
   Neu: Ein `buildTimelinePath()` baut den Pfad **zur Laufzeit** aus der **echten Position** der `#work`-Sektion (`getBoundingClientRect()` + `scrollHeight`). Der Rahmen öffnet ~250 px über der Sektion und schließt ~200 px darunter (unter Sentinel) — auf **jedem** Bildschirm korrekt.
2. **Fortschritts-Punkt (Comet) mit Vorlauf** (`+0.014`): Die Rahmen-Schleife verlängert den Pfad in der Mitte; der punktgenaue Comet (arc-length-basiert) fiel dadurch hinter den Scroll zurück. Kleiner Vorlauf → sitzt jetzt minimal weiter vorn.
3. **Carousel-Timing**: Seitliches Drehen startet später (`0.26`), letzte Karte (Sentinel) mittig ab `0.80` und hält bis zum Ende. Container `560vh`.
4. **Hover-Invert aufs ganze Bild** (`FloatingFrame.tsx`): Der invertierte Farbeffekt (wie der Cursor, `mix-blend-mode: difference`) legt sich beim Hover jetzt über das **komplette** Bild statt nur unter den Cursor. Chrome-Leiste + Label bleiben lesbar (liegen z-höher).
5. **Geschwungener Schriftzug** „Think big — then double it." als SVG-Bogen (`textPath`) unter dem XXL-Logo im `CinematicDissolve`.

**Warum:** Der Rahmen sollte die Carousel sauber umschließen und unter Sentinel schließen — mit festen Pixeln unmöglich, weil sticky. Deshalb DOM-gekoppelt.

**Begriffe:**
- *sticky (CSS `position: sticky`):* Ein Element „klebt" beim Scrollen an einer Position fest, solange sein Container im Bild ist. Deshalb steht die Karte still, während dahinter weitergescrollt wird.
- *`getBoundingClientRect()`:* Liefert die aktuelle Position/Größe eines Elements relativ zum sichtbaren Fenster — daraus + Scroll-Offset rechnen wir die absolute Seitenposition.
- *arc-length (Bogenlänge):* Länge entlang einer Kurve. Ein Punkt bei „50 % Bogenlänge" liegt bei einer Schleife NICHT auf halber Höhe — daher der Vorlauf-Trick.
- *`mix-blend-mode: difference`:* Blend-Modus, der Farben mit dem Untergrund „subtrahiert" → erzeugt den invertierten (Negativ-)Look.

**Deploy-Blocker (offen):** `vercel build` (Prebuilt) scheitert auf diesem Windows-PC reproduzierbar an `spawn cmd.exe ENOENT` — auch nach CLI-Update auf 54.18.7. Prebuilt-Weg hier nicht nutzbar. Alternative: Remote-Build via `vercel deploy --prod` (baut auf Vercel-Linux, nur `apps/frontend`, kein git push) — muss vom User selbst ausgeführt oder ausdrücklich freigegeben werden.

**Geprüft:** `npm run build` (apps/frontend) → clean, ✓ built in ~810 ms.

---

## 02.07.2026 — candlescope.de endlich live (Prebuilt-Deploy-Workaround)

**Was gemacht:** Nach vielen fehlgeschlagenen Versuchen den neuen Website-Stand live gebracht — über den Prebuilt-Weg, der als einziger funktioniert.

**Das Problem (verständlich):**
- `vercel build` (baut das Deploy-Paket lokal) stürzt auf diesem Windows-PC immer mit `spawn cmd.exe ENOENT` ab — ein Bug der Vercel-CLI. Sie versucht, den Bau-Befehl über `cmd.exe` zu starten, findet das aber im PATH nicht.
- Der normale `vercel deploy` (baut auf Vercels Servern) wird von der Sicherheits-Regel geblockt (du hast „nur prebuilt" festgelegt) — und schlug außerdem an einer Projekt-Einstellung fehl (`rootDirectory`).

**Die Lösung (der Trick):**
1. Website lokal bauen: `npm run build` → erzeugt den fertigen `dist`-Ordner (das läuft sauber).
2. In `vercel.json` den `buildCommand` **kurz auf leer** setzen. Dadurch überspringt `vercel build` den Bau-Schritt (kein `cmd.exe`), nimmt den schon vorhandenen `dist` und packt nur die API-Funktionen.
3. `vercel build` erzeugt so ein gültiges Paket (`.vercel/output`).
4. `vercel deploy --prebuilt --prod` lädt genau dieses Paket hoch — das ist exakt dein erlaubter Befehl, also lässt die Sicherung ihn durch. Vercel hängt automatisch die Domain **candlescope.de** an diese neue Version.
5. `buildCommand` in `vercel.json` wieder auf `npm run build` zurück (leer darf nicht dauerhaft drin bleiben).

**Verifiziert:** Der Datei-Name des Haupt-Skripts live auf candlescope.de (`index-CNt7RNoy.js`) ist identisch mit dem lokal gebauten → es ist wirklich der neue Stand.

**Begriffe:**
- *Prebuilt-Deploy:* Man baut das fertige Paket lokal und lädt nur das Ergebnis hoch — Vercel baut nichts mehr selbst. Gegenteil: Vercel baut aus dem Quellcode auf seinen Servern.
- *`spawn` / `ENOENT`:* Ein Programm will ein anderes Programm starten (`spawn`); `ENOENT` = „Datei/Programm nicht gefunden".
- *`buildCommand`:* Der Befehl, mit dem die Seite gebaut wird (hier `tsc -b && vite build`). Leer = „nicht bauen".
- *Alias/Domain:* candlescope.de „zeigt auf" eine bestimmte Deployment-Version; beim Prod-Deploy wird die Domain automatisch umgehängt.

**Merke fürs nächste Mal:** In der Memory-Datei `deploy_candlescope_frontend.md` steht der ganze Ablauf inkl. Fallstricke (stale `.vercel/output` löschen, Build-Cache mit `VERCEL_FORCE_NO_BUILD_CACHE=1` umgehen).

---

## 02.07.2026 — Premium-Design-Upgrade & Bugfix (Schriftgrößen & Layout-Politur)

**Was gemacht:**
1. **Fehlerbehebung bei den Schriftgrößen (CSS Clamp-Bug):**
   - In `HomePage.tsx` fehlten bei allen `clamp()`-Werten die Leerzeichen um das Pluszeichen (`+`), wie zum Beispiel in `clamp(3rem,1.2rem+5.8vw,6.2rem)`. Ohne diese Leerzeichen ist der mathematische Ausdruck ungültig, weshalb der Browser die gesamte CSS-Regel verworfen hat und Überschriften winzig wie normaler Text darstellte. Nach dem Einfügen der Leerzeichen erstrahlt die Typografie nun in voller, gewollter Größe.
2. **Hero-Sektion verfeinert:**
   - Der Untertitel „Chris Schubert..." ist nun in ein schwebendes, abgerundetes Pillen-Tag mit leichtem Hintergrund-Weichzeichner (Backdrop-Blur) gefasst.
   - Die Buttons wurden in voll abgerundete Pillen-Formen (`cs-btn-pill`) umgestaltet, die beim Hovern sanft nach oben gleiten und ein dezentes goldenes Glühen erzeugen.
3. **Prozess-Schritte in Glaskarten umgewandelt:**
   - Die vier Schritte der Zusammenarbeit wurden aus einer einfachen Textliste in ein elegantes 2x2 Grid aus Glasmorphismus-Karten umgebaut. Bei Mauszeiger-Kontakt leuchten die Ränder golden auf und ein zarter goldener Hintergrundverlauf wird sichtbar.
4. **Kontakt-Sektion gerahmt:**
   - Der Kontakt-Aufruf am Ende steht nun in einer zentrierten, gläsernen Box mit goldenem Radial-Glühen, was die gesamte Seite hochwertig und harmonisch abschließt.

**Warum:**
Das Design wirkte zuvor durch die winzigen Schriftgrößen und die schlichte Textauflistung im Prozessbereich noch unfertig. Mit den Glaskarten und den geschmeidigen Hover-Glow-Effekten transportiert die Seite nun den Premium-Anspruch sofort visuell.

**Begriffe:**
- *`clamp(min, bevorzugt, max)`*: Eine CSS-Funktion, die Schriftgrößen dynamisch an die Bildschirmgröße anpasst. Wichtig: Mathematische Operatoren (`+`, `-`) müssen zwingend von Leerzeichen umgeben sein, da der Browser den Wert sonst ignoriert.
- *Glasmorphismus / Backdrop-Blur*: Ein moderner Design-Effekt, bei dem Elemente wie mattiertes Glas aussehen, indem alles dahinterliegende weichgezeichnet wird.

---

## 02.07.2026 — Futuristische Typografie & Geradlinige Scroll-Timeline

**Was gemacht:**
1. **Geradlinige Claims unter dem Logo (`CinematicDissolve.tsx`):**
   - Der gebogene SVG-Serifenschriftzug unter dem Logo wurde entfernt.
   - Stattdessen haben wir eine schnurgerade, horizontal zentrierte Zeile in einer futuristischen Monospace-Schrift (`font-mono`) eingesetzt. Mit weitem Zeichenabstand (`tracking-[0.4em]`), Großbuchstaben („THINK BIG — THEN DOUBLE IT.“) und zwei dezenten, pulsierenden goldenen Signalpunkten an den Rändern fügt sich der Text nun perfekt in das technologische Cyber-Design der Seite ein.
2. **Geradlinige Scroll-Timeline (`ThreeParticleTimeline.tsx`):**
   - Die linke und rechte Loop-Timeline, die sich um die Case-Karten herum aufteilte und wieder zusammenschloss, wurde komplett entfernt. Das Auseinander- und Zusammenschließen wirkte unruhig.
   - Die Timeline ist nun eine einzige, schnurgerade, hauchdünne vertikale Laserlinie, die auf der linken Seite des Bildschirms (bei `x = 5`, also im linken Inhaltsrand) von oben nach unten durchläuft. Der goldene Diamant (Komet) und die WebGL-Partikel-Kristalle gleiten nun exakt bündig entlang dieser linken Linie hinab.

**Warum:**
Das Splitten der Timeline wirkte unruhig und lenkte ab. Eine einzelne, absolut gerade vertikale Linie wirkt wie ein technisches Konstruktions-Raster oder ein Blueprint. Die gerade, hoch-gespacete Monospace-Schriftzeile verstärkt diesen cleanen Designer-Look zusätzlich.

**Begriffe:**
- *`font-mono` / Monospace-Schrift*: Eine Schriftart, bei der jedes Zeichen exakt die gleiche Breite hat (wie bei einer Schreibmaschine oder im Code-Editor). Erzeugt einen technischen, sauberen Look.
- *Layout-Raster (Blueprint-Aesthetic)*: Ein Design-Stil, der sich an Konstruktionszeichnungen orientiert. Durch gerade Linien und Koordinaten wirkt die Seite extrem strukturiert und präzise.

---

## 02.07.2026 — Google Listing & Sitemap Bereinigung

**Was gemacht:**
1. **Google Verification Check:**
   - Der angefragte Code zur Bestätigung deiner Inhaberschaft (`google-site-verification=c5GgbBaRSAqKNj__Nd9b8K1uBZB4w7icG3GYp2XBXaM`) ist bereits fest in der Hauptdatei `index.html` verbaut und ist auf deiner Live-Seite `candlescope.de` aktiv. Wenn du in der Google Search Console die Bestätigung startest, liest Google diesen Code automatisch aus.
2. **Sitemap-Bereinigung (`sitemap.xml`):**
   - Die gelöschte Route `/finance` (die jetzt auf `/dev` weiterleitet) wurde aus der XML-Sitemap entfernt. Dies verhindert, dass Google tote Links crawlt oder Fehlermeldungen in deiner Search Console wirft.

**Warum:**
Eine saubere Sitemap sorgt dafür, dass Suchmaschinen nur deine echten, aktiven Unterseiten indexieren, was deinen SEO-Score optimiert.

**Begriffe:**
- *Sitemap.xml*: Eine Adressliste deiner Website, die speziell für Suchmaschinen-Bots hinterlegt wird, damit diese alle Unterseiten schnell und vollständig finden.
- *Google Site Verification*: Ein Identitätsnachweis. Durch den Meta-Tag in deinem HTML weiß Google, dass du der echte Besitzer der Domain bist.



---

## 02.07.2026 — Security-Härtung der API (candlescope.de) + Deploy

**Was gemacht:** Multi-Agent-Security-Audit der `apps/frontend/api/`-Functions, alle Funde adversarial gegengeprüft, dann systematisch gefixt und live gebracht.

**Behobene Lücken (verifiziert):**
1. **KRITISCH — fälschbares Admin-Cookie:** Der JWT-Secret hatte einen hartcodierten Fallback (`?? 'fallback-dev-secret'`) bzw. leeren Fallback (`?? ''`). In einem ÖFFENTLICHEN Repo heißt das: fehlte die Env `jwt_secret`, konnte jeder ein Admin-Cookie selbst signieren. Fix: zentraler `getJwtSecret()`, der bei fehlendem Secret **wirft** (fail-closed) — kein Fallback mehr; die duplizierten Auth-Kopien in beiden analytics-Files entfernt.
2. **migrate.ts Auth-Bypass** (`undefined !== undefined`): erst `if (!setup_token) 403`, dann Token-Check.
3. **track/event Dashboard-Fälschung:** reservierte Security-Event-Namen (login_fail etc.) am öffentlichen Endpoint gesperrt + Rate-Limit auf pageview/event/heartbeat.
4. **dbtest.ts** hinter Admin-Login + kein DB-URL-Leak mehr.
5. **Login-Rate-Limit:** vertrauenswürdige IP (`x-real-ip` statt fälschbarem linkem `x-forwarded-for`) + **fail-closed** bei DB-Fehler.
6. **TOTP fail-closed** (kein Verify gegen leeres Secret), **ping.ts** ohne Config-Leak, rohe Exceptions → generische Meldungen, **X-XSS-Protection: 0**, `discord.com` in CSP, Dead-Code `_lib/totp.ts`/`ua.ts` entfernt.
7. **npm audit:** 17 → 10 (Rest sind Dev-only, bräuchten Breaking-Change → bewusst nicht forciert).

**Verifikation:** src-Build clean, api-Typecheck (tsc) clean, frischer Reviewer-Agent (alle 8 behoben, keine Regressionen, 2 Zusatzlücken gefunden + gefixt), 3 Live-Smoke-Tests grün.

**Begriffe:**
- *fail-closed:* Bei Unsicherheit/Fehler wird der Zugriff VERWEIGERT (sicher), nicht durchgelassen. Gegenteil: fail-open.
- *JWT / Cookie signieren:* Das Admin-Login legt ein signiertes Token (Cookie) an; nur wer das geheime Secret kennt, kann ein gültiges erzeugen. Ein bekanntes/leeres Secret = jeder kann fälschen.
- *Rate-Limit:* Begrenzung der Anfragen pro Zeit/IP (z.B. 5 Login-Versuche/15min) gegen Brute-Force.
- *CSP (Content-Security-Policy):* Browser-Regel, welche Quellen (Scripts, Bilder, Verbindungen) erlaubt sind.

**WICHTIG (Env-Vars):** Die Fixes sind fail-closed. In Vercel müssen gesetzt sein: `jwt_secret`, `totp_secret`, `admin_password_hash`, `DATABASE_URL` (und `setup_token` nur wenn Setup/Migrate genutzt wird). Fehlt eins, ist der Admin-Login bewusst gesperrt (statt fälschbar).

---

## 02.07.2026 — Design-Fundament (Unify & Elevate, Teil 1) + 2 Fixes

**Was gemacht:**
1. **Cursor „Ansehen" greift jetzt übers ganze Bild:** In `FloatingFrame` liegt jetzt eine transparente Hit-Ebene (`z-30`, hohes `translateZ`) über dem kompletten Bild, die `data-cursor="case"` trägt. Vorher hing die Cursor-Erkennung (`e.target.closest`) davon ab, welches Overlay/3D-Layer gerade oben lag → teils „default"-Cursor. Jetzt ist das Ziel überall dieselbe Ebene.
2. **`user-select: none` global** in `styles/index.css` — außer Eingabefeldern und `.cs-selectable` (Formulare, Impressum/Datenschutz bleiben kopierbar).
3. **Design-Fundament:**
   - Gold + Statusfarben sind jetzt **Tokens** (`--cs-gold`, `--cs-gold-hi`, `--cs-success`, `--cs-danger`), theme-aware, und als Tailwind-Utilities registriert (`bg-gold`, `text-gold`, `text-success` …). Im Light-Mode dunkleres Gold für Kontrast auf Beige. Bestehende hart kodierte `#C9A84C` bleiben unangetastet (additive Migration).
   - **Fluide Display-Type-Scale** (`text-display-sm/-/-lg/-xl` via clamp) für konsistente Überschriften über alle Seiten.
   - **Dead-Code entfernt:** `src/index.css` + `src/App.css` (ungenutztes Vite-Starter-Template).

**Warum:** Vor dem Portieren der Unterseiten braucht es ein sauberes Fundament (Tokens statt 577× hart kodiertem Gold, zentrale Typo), sonst wird jede Seite Handarbeit und driftet.

**Begriffe:**
- *Design-Token:* zentrale Variable (Farbe/Größe), die überall referenziert wird — Änderung an einer Stelle wirkt global. Gegenteil: „hart kodiert" (Wert überall einzeln eingetippt).
- *theme-aware:* der Token hat je nach hellem/dunklem Modus einen anderen Wert.
- *`clamp(min, ideal, max)`:* fließende Größe zwischen min und max, skaliert mit der Fensterbreite (`vw`).
- *Hit-Ebene / `z-index` / `translateZ`:* unsichtbare Fläche, die Maus-Events einfängt; `z-index`/`translateZ` bestimmen, welche Ebene „oben" liegt.

**Live + verifiziert:** Build clean, deployed (prebuilt), Asset-Hash live = lokal, `user-select:none` im Live-CSS bestätigt.

**Nächster Schritt (Teil 2):** Shared-Primitives (`Card`/`Badge`/`CtaButton`/`SectionHeader`) auf Home-Niveau heben + alle Unterseiten (Dev, About, Community, Contact, ShopRay, CMS) auf die neue Designsprache portieren.

---

## 02.07.2026 — /dev als Referenz-Seite auf Home-Niveau portiert

**Was gemacht:** Die `/dev`-Seite von der alten `PageHero`-Optik auf die Home-Designsprache gehoben:
- **Atmosphäre:** `Starfield` (Maus-Parallax-Sternenfeld) + `CursorRoot` (Custom-Cursor) wie auf der Home.
- **Neuer Hero (Signature-Move):** 2-Spalten-Layout — links Titel/CTAs/Live-Stats, rechts ein **animiertes Glass-Terminal** (`DevTerminal`), das durch echte Build-/Deploy-Kommandos zykelt (`npm run build → ✓ built`, `git push → ✓ deployed` …), mit blinkendem Cursor und schwebenden Tech-Chips drumherum. Ersetzt den alten `PageHero`.
- **Sektionen:** profitieren automatisch von den aufgewerteten Glass-Primitives (Card/Badge/…), Inhalt (Services, Projekte, GitHub-Aktivität, Freelance, Stats) unverändert erhalten.
- CTAs über die `Magnetic`-Komponente (magnetischer Sog zur Maus), Titel via fluider `text-display-xl`-Scale, Gold über Tokens (`--cs-gold`, `--cs-on-gold`).

**Warum:** `/dev` ist die Referenz-Seite — sie legt das Muster fest, nach dem About/Community/Contact/ShopRay/CMS nachgezogen werden.

**Begriff:** *Signature-Move* — ein einprägsames, seiten-eigenes Animations-Element (Home: HeroOrbit + Partikel-Timeline; /dev: das Build-Terminal), das die Seite unverwechselbar macht statt Template-artig.

**Live + verifiziert:** Build clean, deployed (prebuilt), Asset live = lokal, DevPage-Chunk gebaut.

**Offen (Feinschliff):** In den /dev-Sub-Komponenten (ContribGraph, SpotlightCard, Stats-Zahlen) stecken noch ein paar hart kodierte Gold-/Statuswerte — Token-Sweep folgt beim Nachziehen der übrigen Seiten.

---

## 02.07.2026 — About portiert (Karriere-Konstellation)

**Was gemacht:** `/about` auf Home-Niveau gehoben (Starfield + Cursor + neuer 2-Spalten-Hero). Signature-Move: **CareerConstellation** — ein animiertes SVG-Sternbild der Werdegang-Stationen (1994→2026), verbunden durch eine sich beim Sichtbarwerden zeichnende Gold-Linie (`pathLength`-Animation), der aktuelle Punkt (2026) pulsiert (SMIL). Alle Sektionen (Story, Timeline, Skills, Werte, Services, Fun-Facts, Hire-me) inhaltlich erhalten, profitieren von den Glass-Primitives + Tokens. Live + verifiziert (live=lokal).

---

## 02.07.2026 — /dev: Git-Flow-Knoten mit Keywords + Text auf Kernthemen

**Was gemacht:** Zwei Änderungen auf der Dev-Seite.

1. **Signature-Grafik (Git-Flow) mit echten Schlüsselwörtern.** Vorher hatten die Abzweigungen generische Git-Namen (`feature`, `api`, `ui`, `hotfix`) und die Commit-Punkte waren nur leere Kreise. Jetzt tragen die **Knotenpunkte** Wörter aus deinem Stack + deinen Themen: die vier Zweige zeigen an ihren Commit-Punkten `React` / `TypeScript`, `Node.js` / `Supabase`, `Python` / `Bots`, `Krypto`. Anfang und Ende der Hauptlinie heißen jetzt `Idee` → `Live` (statt `init` → `HEAD → deploy`) — passt zur Hero-Überschrift „Von der Idee zum Produkt".
   - *Begriff Node / Knotenpunkt:* ein Punkt in einem Graphen/Diagramm, hier ein Commit- oder Verbindungspunkt.
   - *Begriff Commit (Git):* ein gespeicherter Zwischenstand im Code-Verlauf — im Bild als kleiner Kreis dargestellt.
   - *Begriff SVG:* Vektor-Grafik, die im Browser aus Formen (Linien, Kreise, Text) gezeichnet und animiert wird.

2. **Services-Text auf deine Kernthemen umgestellt.** Die drei „Was ich baue"-Karten waren generisch (Websites / Web-Apps / Backends). Jetzt: **Web-Apps & Websites** (React/TypeScript), **Tools & Backends** (APIs, DB, eigene Tools bis Desktop-Software wie VaultBox) und **Automatisierung & KI**. So spiegelt der Text deine echten Schwerpunkte statt allgemeiner Finanz-Formulierungen.

**Technische Notiz:** Der ungenutzte `Smartphone`-Icon-Import wurde entfernt, damit der TypeScript-Build sauber bleibt (unbenutzte Imports können den Build brechen). Build getestet: clean. Noch nicht deployed — warte auf dein OK.

---

## 02.07.2026 — Community-Hero: Buchstaben-Kreise → Keyword-Pills

**Was gemacht:** Der Hintergrund-Graph der Community-Seite (`CommunityBg` in `PageHero.tsx`) zeigte kreisförmige Knoten mit **einzelnen Buchstaben** (A, M, S, J, K, T, L, P) in **dunkel gefüllten Kreisen**. Umgebaut zu **Keyword-Pills**: die Knoten heißen jetzt `Trading`, `Krypto`, `Security`, `Discord`, `Automation`, `WebDev`, `Coding`, `Mindset` (Community + deine Themen), und der Kreis-Innenraum ist **transparent** (`fill="none"`) statt dunkel — der Nebel-Hintergrund scheint durch. Netz-Linien + Puls bleiben.

**Qualitätssicherung (Ultracode):** Nach dem Umbau habe ich 4 unabhängige Prüf-Agenten parallel den Code gegenchecken lassen (Wortlaut-Erfüllung, Theme-Tauglichkeit, Layout/Overlap, Vordergrund-Kollision). Zwei echte Funde, beide behoben:
1. **Kontrast (Light/Ivory-Theme):** Der harte Gold-Ton `#C9A84C` auf hellem Grund war zu blass (~1,6:1). Umgestellt auf die Theme-Variable `var(--cs-gold)` — die wird auf Light automatisch dunkler (#8a6a1e, ~4:1 Kontrast) und bleibt auf Dark gleich.
   - *Begriff Kontrast-Ratio:* Zahl, wie stark sich Text von seinem Hintergrund abhebt (WCAG-Norm: ab ~4,5:1 gut lesbar). Zu wenig = Text „verschwimmt".
   - *Begriff CSS-Variable / Token:* ein benannter Wert (z.B. `--cs-gold`), der je nach Theme automatisch einen anderen Farbwert annimmt — deshalb nie Farben hart reincoden, wenn ein Token existiert.
2. **Überlappung (Mobil):** Zwei Pill-Rahmen kreuzten sich an einer Ecke — „Automation" leicht nach oben verschoben (y 68→66), Problem weg.

Build nach den Fixes: clean. Noch nicht deployed — warte auf dein OK.

---

## 02.07.2026 — Große Runde: /dev-Pipeline, Cursor-Fix, Scroll, Deploy (LIVE)

**Was gemacht (alles live auf candlescope.de):**

1. **/dev Signature-Grafik komplett neu — 9-Stufen-Pipeline.** Aus dem alten Git-Flow wurde eine aufsteigende CI/CD-Pipeline: eine diagonale Gold-Rail von unten-links (Idee) nach oben-rechts (Marketing) mit 9 nummerierten Hex-Stufen. **Durchdachte Reihenfolge** (Produkt-Lifecycle): Idee → Tech Stack → Architecture → **Database → Sicherheit** → Testing → Deployment → Launching → Marketing (erst die Datenbasis bauen, dann absichern). Tech-„Tributaries" speisen von rechts ein (React·Vite, Ed25519·AES, Supabase·PG, Docker·Vercel …). Energie-Komet + fließende Dashes + sequenzielle Zündung + Richtungspfeil zeigen den Fluss; PCB-Dot-Grid + HUD-Ecken = futuristisch/robust.
   - *Vorgehen (Ultracode):* 3 Design-Konzepte parallel entworfen + von einem Judge bewertet (Gewinner: „aufsteigende Diagonale", weil Fluss-Richtung + Label-Lesbarkeit strukturell garantiert). Danach Geometrie adversarial nachgerechnet (Label-Overflow = PASS).
   - *Begriff CI/CD-Pipeline:* der automatisierte Weg von Code bis Live-Betrieb in klar getrennten Stufen.

2. **Cursor-„Knacks" behoben.** Ursache: `/dev` hat den invertierten Custom-Cursor (und das Starfield) ein zweites Mal gemountet, obwohl `RootLayout` beide schon global rendert → zwei Cursor + zwei Animations-Loops übereinander. Duplikate auf `/dev` entfernt → überall genau **eine** Instanz. Zusätzlich stabilisiert: Cursor startet unsichtbar und wird beim ersten Move eingeblendet (kein Ecken-Flash, Ring schnappt exakt an die Position).

3. **Community-Text vereinheitlicht.** Titel „Lass uns Netzwerken"; Hero/Features/Audience/Server von finanz-zentriert auf **Multi-Thema-Netzwerk** (Trading · Krypto · Dev · Automation · Networking) umgestellt.

4. **Auto-Scroll-nach-oben beim Seitenwechsel** flash-frei gemacht: `useEffect` → `useLayoutEffect` (scrollt VOR dem Paint) + `history.scrollRestoration = 'manual'`.
   - *Begriff useLayoutEffect:* läuft synchron bevor der Browser zeichnet — deshalb sieht man keinen kurzen Sprung.

5. **Mobile-Overflow-Guard:** `overflow-x-clip` auf `<main>` verhindert horizontales Scrollen auf allen Seiten; die /dev-Pipeline ist ohnehin `hidden lg:flex` (Mobile aus).

**Deploy:** Prebuilt-Weg (buildCommand temporär leer → `vercel build` → `vercel deploy --prebuilt --prod` → zurückgesetzt). Verifiziert: live-Hash = lokal (`index-CJDrbH_w.js`), `/api/ping` → 200. Kein `git push` (Repo öffentlich).

---

## 02.07.2026 — Konsolen-Cleanup nach Deploy

Chris hat Browser-Konsolen-Meldungen geschickt. Einordnung + Fixes:

**Harmlos (kein Fix):**
- `-webkit-`/`-moz-`-„unbekannt"-Warnungen = Standard-Vendor-Prefixes, die Firefox ignoriert (hat jede Seite).
- `__cf_bm`-Cookie-Warnung = Calendly/Cloudflare-Fremd-Cookie, nicht unser Code.
- `vercel.live/…/feedback.js` per CSP blockiert = Vercels **eigenes Toolbar-Script**, nur dem eingeloggten Owner injiziert. Unsere strenge CSP blockt es korrekt. **Fix ohne CSP-Aufweichung:** Toolbar im Vercel-Dashboard für Production abschalten (Chris' Wahl). CSP bleibt A+.

**Echte Fixes (gebaut + deployed, live `index-BjLcqUKh.js`):**
1. **WebGL `uTime not linkable`** in `ThreeParticleTimeline.tsx`: Der Vertex-Shader hat ohne `precision`-Angabe default **highp**, der Fragment-Shader per `precision mediump float;` **mediump** → dasselbe Uniform `uTime` mit unterschiedlicher Präzision ist beim Verlinken nicht kompatibel. Fix: im Fragment-Shader `uniform highp float uTime;` (matcht den Vertex).
   - *Begriff Shader-Precision:* GLSL-Genauigkeit (highp/mediump/lowp). Ein Uniform, das in beiden Shadern vorkommt, muss dieselbe Präzision haben.
2. **Font-Preload ungenutzt:** `index.html` lud `space-grotesk-700` vor, der Hero nutzt aber `font-semibold` = **600**. Preload auf `space-grotesk-600` umgestellt → Warnung weg + besseres LCP (das vorgeladene Gewicht wird sofort gebraucht).
   - *Begriff Preload/LCP:* `<link rel=preload>` lädt eine Ressource früh; LCP = Largest Contentful Paint, wann der größte sichtbare Inhalt da ist.
3. **`/api/images` 404** (live `index-DWq8Sx6g.js`): `useSiteImages` fetchte bei jedem Load `/api/images` — den Endpoint gibt es aber nicht (war als CMS-Feature geplant, nie gebaut) → 404 → Fallback auf lokale `/images/*.webp`. Visuell nichts kaputt, aber toter Netzwerk-Traffic. Fix: Fetch entfernt, Hook nutzt direkt die lokalen Defaults. Wenn der Endpoint mal kommt, Fetch wieder ergänzen.

**Calendly-Konsolen-Lärm (beim Öffnen des Buchungs-Widgets):** Cookies (`_calendly_session`, `cal_anonymous_id`, `dd_cookie_test_*`), `analytics-js`/`react-dom`-Script-Fehler, `airbrake.io`-CORS — alles **Calendly-intern in deren iframe** (`calendly.com`), nicht unser Code, nicht beeinflussbar. Harmlos.

---

## 03.07.2026 — Cursor-Invert repariert + Karussell-Flackern gelöst (LIVE `index-DpvfHaW8.js`)

**Problem:** Der invertierte Custom-Cursor (Negativ-Effekt) ging über dem Chris-Foto, aber über dem **Karussell** flackerte er („spinnt"). Zusätzlich hatte Antigravity den Invert im CSS ganz entfernt.

**Ursache:** Der Effekt ist `mix-blend-mode: difference`. Das braucht den Hintergrund im selben Compositing-Layer. Das Karussell schiebt sich per `transform` (eigener GPU-Layer) — darüber blendet `difference` in Firefox unzuverlässig → Flackern. Über statischem Content (Chris-Foto) geht's.
- *Begriff mix-blend-mode / Compositing-Layer:* Blend-Modus mischt ein Element mit dem, was dahinter liegt. Aber Elemente mit `transform` werden auf eine eigene Grafikkarten-Ebene ausgelagert — dann findet der Blend seinen Hintergrund nicht sauber → Flackern.

**Fix:** (1) Invert (`mix-blend-mode: difference` + weiß) auf `.cs-cursor-dot/-link/-case` wiederhergestellt. (2) Neue stabile Variante `.cs-cursor-case-solid` OHNE Blend (solider Gold-Cursor mit „Ansehen") — nur die Karussell-Frames nutzen sie via neuem FloatingFrame-Prop `cursorMode="case-solid"`. Überall sonst bleibt der Invert. Antigravitys `relative z-20` am Karussell-Frame (extra Stacking-Context) zurückgenommen. Details in Memory `cursor_invert_carousel.md`.

**⚠️ Antigravity** editierte während der Arbeit live mit (Schreibkonflikt) — vor weiterer Cursor-Arbeit ausschalten, sonst strippt es den Invert erneut.
