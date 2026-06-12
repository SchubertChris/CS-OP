// ══════════════════════════════════════
//  TOOLTIPS — Kontexthilfen v2
//  Automatisch via MutationObserver
//  Ein-/ausschaltbar: CFG.tooltips
// ══════════════════════════════════════

const TOOLTIPS = {
  // ── KPI Dashboard ──
  "tt-gesamtvermoegen":
    "Summe aller einbezogenen Konten. Depots & VL kannst du in den Konten ein-/ausschließen.",
  "tt-fixkosten":
    "Durchschnittliche monatliche Fixkosten aller aktiven Ausgabe-Posten. Abgelaufene werden nicht gewertet.",
  "tt-sparquote":
    "Anteil des Einkommens der nicht für Fixkosten verbraucht wird. Empfehlung: mind. 20 %.",
  "tt-cockpit-verfuegbar":
    "Hauptkonto-Stand minus alle noch ausstehenden Abbuchungen bis zum nächsten Zahltag.",
  "tt-cockpit-verbleibend":
    "Was nach allen geplanten Zahlungen bis zum Zahltag noch übrig bleibt.",

  // ── Konten ──
  "tt-konto-include":
    "Einbezogen = wird im Gesamtvermögen und der Cockpit-Berechnung berücksichtigt.",
  "tt-konto-main":
    "Das Hauptkonto bestimmt den Zahlungsplan im Cockpit und den Verfügbar-Wert.",
  "tt-konto-groupref":
    "Referenzkonto der Gruppe — steht immer oben und ist nicht verschiebbar.",
  "tt-bankgruppe":
    "Konten mit gleicher Gruppe werden im Dashboard zusammengefasst und gemeinsam angezeigt.",

  // ── Posten / Umsätze ──
  "tt-posten-interval":
    "Monatl. = jeden Monat · Viertelj. = Jan/Apr/Jul/Okt · Halbjährl. = Jan/Jul · Jährl. = einmal im Jahr.",
  "tt-posten-faellig":
    "Tag des Monats an dem der Betrag abgebucht wird. Bestimmt die Reihenfolge im Cockpit.",
  "tt-posten-account":
    "Welches Konto belastet wird. Wichtig für den korrekten Zahlungsplan im Cockpit.",
  "tt-avg-monthly":
    "Auf den Monat gerechneter Durchschnitt — z.B. Jahresbetrag ÷ 12 bei jährlichem Intervall.",

  // ── Verträge ──
  "tt-vertrag-end":
    "Laufzeitende. 60 Tage vorher erscheint ein Badge in der Sidebar als Warnung.",
  "tt-vertrag-status":
    "Aktueller Status: Aktiv · Läuft ab (≤ 60d) · Zukünftig · Abgelaufen.",

  // ── Sparziele ──
  "tt-ziel-rate":
    "Monatlicher Sparbetrag für dieses Ziel. Wird als Fixkosten-Posten in den Zahlungsplan eingerechnet.",
  "tt-ziel-deadline":
    "Zieldatum. Daraus berechnet die App ob du bei aktueller Rate auf Kurs bist.",
  "tt-ziel-needed":
    "(Zielbetrag − Gespart) ÷ verbleibende Monate = notwendige monatliche Rate zum Erreichen des Ziels.",

  // ── Jahresübersicht ──
  "tt-jahres-spar":
    "Sparquote = (Einnahmen − Ausgaben) ÷ Einnahmen × 100. Grün = gut, Rot = Ausgaben > Einnahmen.",
  "tt-jahres-override":
    "Tatsächlicher Betrag weicht vom geplanten ab? Direkt überschreiben — gilt nur für diesen Monat.",

  // ── Settings ──
  "tt-zahltag":
    "Dein monatlicher Gehaltseingang. Alle Zahlungspläne rechnen bis zu diesem Tag voraus.",
  "tt-autosave":
    "Speichert jede Änderung sofort in localStorage. Deaktivieren nur wenn du Änderungen manuell bestätigen willst (Strg+S).",
  "tt-privacy-autolock":
    "Sperrt automatisch alle Zahlenwerte nach 5 Min. Inaktivität. Erfordert Passwort zum Entsperren.",
  "tt-tooltips-toggle":
    "Blendet die ⓘ Hilfe-Icons neben Feldern, KPIs und Listeneinträgen ein oder aus.",
  "tt-safepoint":
    "Automatischer lokaler Sicherungspunkt. Wird stündlich erstellt — max. 10 Einträge. Beim Import oder Reset wiederherstellbar.",
  "tt-bg-image":
    "Eigenes Hintergrundbild hochladen. Wird lokal gespeichert, kein Upload an Server.",

  // ── Allgemein ──
  "tt-transfer":
    "Umbuchung zwischen eigenen Konten — kein Ausgabe-Posten, beeinflusst nur die Kontosalden.",
};

// ── TOOLTIP ELEMENT ──
let _ttEl = null;
let _ttTimeout = null;

function _ensureTtEl() {
  if (_ttEl) return;
  _ttEl = document.createElement("div");
  _ttEl.id = "appTooltip";
  document.body.appendChild(_ttEl);
}

function _showTooltip(text, anchorEl) {
  if (!text || !anchorEl) return;
  _ensureTtEl();
  clearTimeout(_ttTimeout);
  _ttEl.textContent = text;
  _ttEl.style.opacity = "0";

  const r = anchorEl.getBoundingClientRect();
  const tw = 240;
  let left = r.left + r.width / 2 - tw / 2;
  let top = r.top - 8 - 52; // above anchor
  if (top < 8) top = r.bottom + 8; // flip below if no space
  left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));

  _ttEl.style.left = left + "px";
  _ttEl.style.top = top + "px";
  _ttEl.style.maxWidth = tw + "px";

  _ttTimeout = setTimeout(() => {
    _ttEl.style.opacity = "1";
  }, 40);
}

function _hideTooltip() {
  clearTimeout(_ttTimeout);
  if (!_ttEl) return;
  _ttEl.style.opacity = "0";
}

// ── PUBLIC: Tooltip-Icon ──
function ttIcon(key, style) {
  if (!key || !TOOLTIPS[key]) return "";
  const txt = TOOLTIPS[key].replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  return `<span class="tt-icon" data-tt="${key}"
    onmouseenter="if(typeof CFG!=='undefined'&&CFG.tooltips!==false)_showTooltip(TOOLTIPS['${key}'],this)"
    onmouseleave="_hideTooltip()"
    ${style ? `style="${style}"` : ""}>ⓘ</span>`;
}

// ── BIND: alle data-tt Elemente verknüpfen ──
// Nutzt WeakSet statt Flag — sicher bei DOM-Neuaufbau (neue Elemente werden korrekt gebunden)
const _ttBound = new WeakSet();

function bindTooltips(root) {
  if (typeof CFG === "undefined" || CFG.tooltips === false) return;
  (root || document).querySelectorAll("[data-tt]").forEach((el) => {
    if (_ttBound.has(el)) return;
    _ttBound.add(el);
    const key = el.dataset.tt;
    if (!TOOLTIPS[key]) return;
    el.addEventListener("mouseenter", () => {
      if (typeof CFG !== "undefined" && CFG.tooltips !== false)
        _showTooltip(TOOLTIPS[key], el);
    });
    el.addEventListener("mouseleave", _hideTooltip);
  });
}

// ── AUTO-BIND via MutationObserver ──
// Bindet neue data-tt Elemente automatisch nach jedem DOM-Update
(function () {
  let _bindTimer = null;
  const obs = new MutationObserver(() => {
    clearTimeout(_bindTimer);
    _bindTimer = setTimeout(() => {
      if (typeof bindTooltips === "function") bindTooltips();
    }, 120);
  });
  document.addEventListener("DOMContentLoaded", () => {
    obs.observe(document.body, { childList: true, subtree: true });
    // Initiales Binden nach kurzem Delay (Seite fertig gerendert)
    setTimeout(() => bindTooltips(), 300);
  });
})();
