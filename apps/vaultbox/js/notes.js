// ══════════════════════════════════════
//  NOTIZEN — Centered Modal · 3 Tabs
//  Notizen · FAQ · Rechner
// ══════════════════════════════════════

const NOTES_KEY = "csf_notes";

let _nmOpen = false;
let _nmView = "notes";
let _nmActiveNote = null;
let _nmFaqOpen = null;
let _nmEmojiOpen = false;
let _nmCalcVal = "0";
let _nmCalcPrev = "";
let _nmCalcOp = "";
let _nmCalcFresh = false;
let _nmMousedownOnBg = false;

// ── STORAGE ─────────────────────────────
function notesLoad() {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map(n => {
      if (n.threads !== undefined) {
        return { id: n.id, title: n.title || "", content: (n.threads || []).map(t => t.text).join("\n"), createdAt: n.createdAt };
      }
      return n;
    });
  } catch { return []; }
}

function notesSave(arr) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(arr));
  _notesUpdateBadge(arr.length);
}

function _notesUpdateBadge(count) {
  const btn = document.getElementById("btnNotes");
  if (btn) btn.classList.toggle("notes-btn-active", count > 0);
}

// ── OPEN / CLOSE ─────────────────────────
function openNotesPanel() {
  if (_nmOpen) { closeNotesPanel(); return; }
  _nmOpen = true;
  _nmView = "notes";
  _nmActiveNote = null;
  _ensureNmModal();
  const ov = document.getElementById("nmOverlay");
  if (!ov) return;
  ov.style.display = "flex";
  requestAnimationFrame(() => ov.classList.add("nm-visible"));
  _nmRender();
}

function closeNotesPanel() {
  _nmOpen = false;
  const ov = document.getElementById("nmOverlay");
  if (!ov) return;
  ov.classList.remove("nm-visible");
  setTimeout(() => { if (ov) ov.style.display = "none"; }, 200);
}

function _ensureNmModal() {
  if (document.getElementById("nmOverlay")) return;

  const ov = document.createElement("div");
  ov.id = "nmOverlay";
  ov.className = "nm-overlay";
  ov.addEventListener("mousedown", e => { _nmMousedownOnBg = e.target === ov; });
  ov.addEventListener("click",     e => { if (_nmMousedownOnBg && e.target === ov) closeNotesPanel(); });

  const modal = document.createElement("div");
  modal.id = "nmModal";
  modal.className = "nm-modal";

  // Head
  const head = document.createElement("div");
  head.className = "nm-head";

  const tabs = document.createElement("div");
  tabs.className = "nm-tabs";
  [["notes","Notizen"],["faq","FAQ"],["calc","Rechner"]].forEach(([v, label]) => {
    const btn = document.createElement("button");
    btn.className = "nm-tab";
    btn.id = "nmTab" + v.charAt(0).toUpperCase() + v.slice(1);
    btn.textContent = label;
    btn.onclick = () => _nmSetView(v);
    tabs.appendChild(btn);
  });

  const closeSvg = document.createElementNS("http://www.w3.org/2000/svg","svg");
  closeSvg.setAttribute("viewBox","0 0 24 24");
  closeSvg.setAttribute("fill","none");
  closeSvg.setAttribute("stroke","currentColor");
  closeSvg.setAttribute("stroke-width","2");
  closeSvg.setAttribute("width","14");
  closeSvg.setAttribute("height","14");
  const l1 = document.createElementNS("http://www.w3.org/2000/svg","line");
  l1.setAttribute("x1","18"); l1.setAttribute("y1","6"); l1.setAttribute("x2","6");  l1.setAttribute("y2","18");
  const l2 = document.createElementNS("http://www.w3.org/2000/svg","line");
  l2.setAttribute("x1","6");  l2.setAttribute("y1","6"); l2.setAttribute("x2","18"); l2.setAttribute("y2","18");
  closeSvg.appendChild(l1); closeSvg.appendChild(l2);

  const closeBtn = document.createElement("button");
  closeBtn.className = "nm-close";
  closeBtn.appendChild(closeSvg);
  closeBtn.onclick = closeNotesPanel;
  closeBtn.onmouseenter = () => _showTooltip("Schließen", closeBtn);
  closeBtn.onmouseleave = _hideTooltip;

  head.appendChild(tabs);
  head.appendChild(closeBtn);

  // Body
  const body = document.createElement("div");
  body.className = "nm-body";
  body.id = "nmBody";

  modal.appendChild(head);
  modal.appendChild(body);
  ov.appendChild(modal);
  document.body.appendChild(ov);
}

function _nmSetView(view) {
  if (_nmView === "notes" && _nmActiveNote) _nmSaveContent();
  _nmView = view;
  if (view !== "notes") _nmActiveNote = null;
  _nmRender();
}

// ── RENDER ───────────────────────────────
function _nmRender() {
  ["notes","faq","calc"].forEach(v => {
    const key = v.charAt(0).toUpperCase() + v.slice(1);
    const el = document.getElementById("nmTab" + key);
    if (el) el.classList.toggle("nm-tab-active", _nmView === v);
  });
  const body = document.getElementById("nmBody");
  if (!body) return;
  if (_nmView === "faq")  { _nmRenderFaq(body);  return; }
  if (_nmView === "calc") { _nmRenderCalc(body); return; }
  if (_nmActiveNote)      _nmRenderDetail(body);
  else                    _nmRenderList(body);
}

// ── LIST ─────────────────────────────────
function _nmRenderList(body) {
  body.className = "nm-body nm-body-list";
  const notes = notesLoad();
  let h =
    '<div class="nm-list-head">' +
      '<span class="nm-list-title">Meine Notizen</span>' +
      '<button class="nm-add-btn" onclick="_nmCreateNote()" onmouseenter="_showTooltip(\'Neue Notiz\',this)" onmouseleave="_hideTooltip()">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
      '</button>' +
    '</div>';

  if (notes.length === 0) {
    h +=
      '<div class="nm-empty">' +
        '<div style="font-size:2em;margin-bottom:8px">📝</div>' +
        '<div>Noch keine Notizen</div>' +
        '<button class="nm-new-btn-big" onclick="_nmCreateNote()">Erste Notiz erstellen</button>' +
      '</div>';
  } else {
    h += '<div class="nm-items">';
    notes.forEach(n => {
      const preview = esc((n.content || "").replace(/<[^>]+>/g, "").slice(0, 60) || "Leer…");
      h +=
        '<div class="nm-item" onclick="_nmOpenNote(\'' + n.id + '\')">' +
          '<div class="nm-item-title">' + esc(n.title || "Unbenannt") + '</div>' +
          '<div class="nm-item-preview">' + preview + '</div>' +
          '<button class="nm-item-del" onclick="event.stopPropagation();_nmDeleteNote(\'' + n.id + '\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>' +
          '</button>' +
        '</div>';
    });
    h += '</div>';
  }
  body.innerHTML = h;
}

// ── DETAIL ───────────────────────────────
function _nmRenderDetail(body) {
  const notes = notesLoad();
  const note  = notes.find(n => n.id === _nmActiveNote);
  if (!note) { _nmActiveNote = null; _nmRenderList(body); return; }

  body.className = "nm-body nm-body-detail";
  const emojis = ["😊","😂","❤️","👍","🔥","✅","⚠️","💡","📌","🎯","💰","📊","🏦","💳","📅","🔑","🗂️","📁","✏️","🗑️"];
  const emojiHtml = emojis.map(e => '<span class="nm-emoji-btn" onclick="_nmInsertEmoji(\'' + e + '\')">' + e + '</span>').join("");

  body.innerHTML =
    '<div class="nm-detail-head">' +
      '<button class="nm-back" onclick="_nmBack()">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><polyline points="15 18 9 12 15 6"/></svg>' +
        'Zurück' +
      '</button>' +
      '<input class="nm-title-inp" id="nmTitleInp" value="' + esc(note.title || "") + '" placeholder="Titel…" oninput="_nmSaveTitle(this.value)">' +
      '<button class="nm-save-btn" id="nmSaveBtn" onclick="_nmSaveAll()">Speichern</button>' +
    '</div>' +
    '<div class="nm-bar">' +
      '<button class="nm-bar-btn" onclick="_nmFmt(\'bold\')"><b>B</b></button>' +
      '<button class="nm-bar-btn" onclick="_nmFmt(\'italic\')"><i>I</i></button>' +
      '<button class="nm-bar-btn" onclick="_nmFmt(\'strikeThrough\')"><s>S</s></button>' +
      '<button class="nm-bar-btn nm-bar-code" onclick="_nmWrapCode()">{ }</button>' +
      '<button class="nm-bar-btn" onclick="_nmInsertTask()">☐</button>' +
      '<div class="nm-bar-sep"></div>' +
      '<button class="nm-bar-btn" onclick="_nmToggleEmoji()">😊</button>' +
    '</div>' +
    '<div class="nm-emoji-picker" id="nmEmojiPicker" style="display:none">' + emojiHtml + '</div>' +
    '<div class="nm-editor" id="nmEditor" contenteditable="true" spellcheck="false" onblur="_nmSaveContent()" onkeydown="_nmEditorKeydown(event)">' +
      (note.content || "") +
    '</div>';
}

// ── FAQ ──────────────────────────────────
const _NM_FAQ = [
  { q: "Wie buche ich eine neue Transaktion?",
    a: "Transaktionen öffnen, dann '+ Posten' klicken. Name, Betrag, Konto und Datum eintragen und speichern." },
  { q: "Wie ändere ich meinen Zahltag?",
    a: "Einstellungen öffnen, Abschnitt 'Verhalten & Zahltag'. Den Zahltag eintragen - alle Fälligkeiten im Cockpit passen sich automatisch an." },
  { q: "Wie exportiere ich meine Daten?",
    a: "Einstellungen öffnen, Abschnitt 'Datenspeicher', dann 'Daten exportieren' klicken. Alternativ CSV über Transaktionen via Export-Button." },
  { q: "Wie funktionieren Safepoints?",
    a: "Die App speichert stündlich automatisch einen Safepoint. Unter Einstellungen, Abschnitt Safepoints, kann jeder Stand wiederhergestellt werden." },
  { q: "Wie lege ich ein Sparziel an?",
    a: "Sparziele öffnen, dann '+ Neues Ziel' klicken. Zielbetrag, Startdatum und Deadline eingeben - die App berechnet die monatliche Rate automatisch." }
];

function _nmRenderFaq(body) {
  body.className = "nm-body nm-body-faq";
  let h = '<div class="nm-faq-list">';
  _NM_FAQ.forEach((item, i) => {
    const open = _nmFaqOpen === i;
    h +=
      '<div class="nm-faq-item' + (open ? " nm-faq-open" : "") + '">' +
        '<button class="nm-faq-q" onclick="_nmToggleFaq(' + i + ')">' +
          '<span>' + esc(item.q) + '</span>' +
          '<svg class="nm-faq-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><polyline points="6 9 12 15 18 9"/></svg>' +
        '</button>' +
        '<div class="nm-faq-a">' + esc(item.a) + '</div>' +
      '</div>';
  });
  h += '</div>';
  body.innerHTML = h;
}

function _nmToggleFaq(i) {
  _nmFaqOpen = _nmFaqOpen === i ? null : i;
  const body = document.getElementById("nmBody");
  if (body) _nmRenderFaq(body);
}

// ── RECHNER ──────────────────────────────
const _NM_CALC_BTNS = ["C","±","%","÷","7","8","9","×","4","5","6","−","1","2","3","+","0",".","="];

function _nmRenderCalc(body) {
  body.className = "nm-body nm-body-calc";
  const btns = _NM_CALC_BTNS.map(b => {
    const op   = ["÷","×","−","+"].includes(b);
    const eq   = b === "=";
    const zero = b === "0";
    const cls  = "nm-calc-btn" + (op ? " nm-calc-op" : "") + (eq ? " nm-calc-eq" : "") + (zero ? " nm-calc-zero" : "");
    return '<button class="' + cls + '" onclick="_nmCalcPress(\'' + b + '\')">' + b + '</button>';
  }).join("");

  body.innerHTML =
    '<div class="nm-calc">' +
      '<div class="nm-calc-display" id="nmCalcDisp">' + _nmCalcVal + '</div>' +
      '<div class="nm-calc-grid">' + btns + '</div>' +
    '</div>';
}

function _nmCalcPress(btn) {
  if (btn === "C") {
    _nmCalcVal = "0"; _nmCalcPrev = ""; _nmCalcOp = ""; _nmCalcFresh = false;
  } else if (btn === "±") {
    _nmCalcVal = String(-parseFloat(_nmCalcVal) || 0);
  } else if (btn === "%") {
    _nmCalcVal = String(parseFloat(_nmCalcVal) / 100);
  } else if (["÷","×","−","+"].includes(btn)) {
    _nmCalcPrev = _nmCalcVal; _nmCalcOp = btn; _nmCalcFresh = true;
  } else if (btn === "=") {
    if (_nmCalcOp && _nmCalcPrev !== "") {
      const a = parseFloat(_nmCalcPrev), b = parseFloat(_nmCalcVal);
      let r = a;
      if (_nmCalcOp === "+")  r = a + b;
      if (_nmCalcOp === "−")  r = a - b;
      if (_nmCalcOp === "×")  r = a * b;
      if (_nmCalcOp === "÷")  r = b !== 0 ? a / b : 0;
      _nmCalcVal = String(parseFloat(r.toFixed(10)));
      _nmCalcOp = ""; _nmCalcPrev = ""; _nmCalcFresh = true;
    }
  } else if (btn === ".") {
    if (_nmCalcFresh) { _nmCalcVal = "0."; _nmCalcFresh = false; }
    else if (!_nmCalcVal.includes(".")) _nmCalcVal += ".";
  } else {
    if (_nmCalcVal === "0" || _nmCalcFresh) { _nmCalcVal = btn; _nmCalcFresh = false; }
    else _nmCalcVal += btn;
  }
  const d = document.getElementById("nmCalcDisp");
  if (d) d.textContent = _nmCalcVal;
}

// ── NOTIZ-AKTIONEN ───────────────────────
function _nmCreateNote() {
  const notes = notesLoad();
  const note  = { id: "note_" + Date.now(), title: "", content: "", createdAt: new Date().toISOString() };
  notes.unshift(note);
  notesSave(notes);
  _nmActiveNote = note.id;
  _nmRender();
  setTimeout(() => document.getElementById("nmTitleInp")?.focus(), 50);
}

function _nmOpenNote(id) {
  _nmActiveNote = id;
  _nmRender();
  setTimeout(() => document.getElementById("nmEditor")?.focus(), 50);
}

function _nmBack() {
  _nmSaveContent();
  _nmActiveNote = null;
  _nmRender();
}

function _nmDeleteNote(id) {
  const notes = notesLoad().filter(n => n.id !== id);
  notesSave(notes);
  if (_nmActiveNote === id) _nmActiveNote = null;
  _nmRender();
}

function _nmSaveTitle(val) {
  if (!_nmActiveNote) return;
  const notes = notesLoad();
  const note  = notes.find(n => n.id === _nmActiveNote);
  if (note) { note.title = val; notesSave(notes); }
}

function _nmSaveContent() {
  if (!_nmActiveNote) return;
  const ed = document.getElementById("nmEditor");
  if (!ed) return;
  const notes = notesLoad();
  const note  = notes.find(n => n.id === _nmActiveNote);
  if (note) { note.content = ed.innerHTML; notesSave(notes); }
}

function _nmSaveAll() {
  const titleInp = document.getElementById("nmTitleInp");
  if (titleInp) _nmSaveTitle(titleInp.value);
  _nmSaveContent();
  const btn = document.getElementById("nmSaveBtn");
  if (!btn) return;
  btn.textContent = "✓ Gespeichert";
  btn.classList.add("nm-save-ok");
  setTimeout(() => {
    btn.textContent = "Speichern";
    btn.classList.remove("nm-save-ok");
  }, 1400);
}

// ── FORMATIERUNG ────────────────────────
function _nmFmt(cmd) {
  document.getElementById("nmEditor")?.focus();
  document.execCommand(cmd, false, null);
}

function _nmWrapCode() {
  const ed = document.getElementById("nmEditor");
  if (!ed) return;
  ed.focus();
  const sel = window.getSelection();
  if (sel && sel.rangeCount && !sel.isCollapsed) {
    const range = sel.getRangeAt(0);
    const code  = document.createElement("code");
    code.textContent = range.toString();
    range.deleteContents();
    range.insertNode(code);
  }
}

function _nmInsertTask() {
  document.getElementById("nmEditor")?.focus();
  document.execCommand("insertText", false, "☐ ");
}

function _nmEditorKeydown(e) {
  if (e.key === "Tab") { e.preventDefault(); document.execCommand("insertText", false, "  "); }
}

function _nmToggleEmoji() {
  _nmEmojiOpen = !_nmEmojiOpen;
  const p = document.getElementById("nmEmojiPicker");
  if (p) p.style.display = _nmEmojiOpen ? "flex" : "none";
}

function _nmInsertEmoji(emoji) {
  _nmEmojiOpen = false;
  const p = document.getElementById("nmEmojiPicker");
  if (p) p.style.display = "none";
  const ed = document.getElementById("nmEditor");
  if (!ed) return;
  ed.focus();
  document.execCommand("insertText", false, emoji);
}

// ── INIT ─────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => _notesUpdateBadge(notesLoad().length), 800);
});
