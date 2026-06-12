// ══════════════════════════════════════
//  VISIONBOARD — Visuelles Ideenboard
//  Nodes · Verbindungen · Properties
//  Offline-first · LocalStorage
// ══════════════════════════════════════

const VB_KEY = "visionboards";
const VB_COLORS = ["#00c896", "#534AB7", "#BA7517", "#D85A30", "#378ADD"];
const VB_NODE_W = 180;
const VB_NODE_H = 90;
// S/M/L = Card-Größe (nicht Schrift)
const VB_SIZES = { S: { w: 140, h: 60 }, M: { w: 180, h: 90 }, L: { w: 240, h: 130 } };

// ── STATE ─────────────────────────────
let _vbBoards = [];
let _vbCurId = null;
let _vbTool = "select";
let _vbPropsCollapsed = false;
let _vbSelected = null;      // { kind: "node"|"conn", id }
let _vbMultiSel = [];        // [nodeId, ...] für Massenselektion
let _vbConnStart = null;     // nodeId wartend auf zweiten Klick
let _vbDragId = null;
let _vbDragOx = 0, _vbDragOy = 0;
let _vbMx = 0, _vbMy = 0;
let _vbRaf = null;
let _vbMoved = false;
// Rubber-band selection
let _vbRbActive = false;
let _vbRbX0 = 0, _vbRbY0 = 0;
// Pan & Zoom
let _vbPanX = 0, _vbPanY = 0;
let _vbScale = 1;
let _vbPanning = false;
let _vbSpaceDown = false;
let _vbPanSX = 0, _vbPanSY = 0;  // screen pos when pan started
let _vbPanOX = 0, _vbPanOY = 0;  // pan offset when pan started
// Resize
let _vbResizeId = null;
let _vbResizeDir = null;
let _vbResizeSX = 0, _vbResizeSY = 0;
let _vbResizeOW = 0, _vbResizeOH = 0, _vbResizeOX = 0, _vbResizeOY = 0;
// Z-order: drag brings node to front
let _vbZTop = 10;
// Drag-to-create: null when inactive, { x0,y0, tool, preview } while dragging
let _vbCreateDrag = null;

// ── PERSIST ───────────────────────────
function _vbLoad() {
  // 1. Versuche aus Electron IPC (state.json-Verzeichnis)
  // _vbLoadAsync() ist async — synchron als Fallback localStorage
  try {
    const raw = localStorage.getItem(VB_KEY);
    _vbBoards = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(_vbBoards)) _vbBoards = [];
  } catch (e) {
    _vbBoards = [];
  }
}

async function _vbLoadAsync() {
  try {
    if (window.csf?.visionboard?.load) {
      const data = await window.csf.visionboard.load();
      if (Array.isArray(data) && data.length) {
        _vbBoards = data;
        // Sync back to localStorage as fallback cache
        try { localStorage.setItem(VB_KEY, JSON.stringify(_vbBoards)); } catch(e) {}
        return;
      }
    }
  } catch(e) {}
  // Only fall back to localStorage if in-memory has no boards (sync path may have already created one)
  if (!_vbBoards.length) _vbLoad();
}

function _vbSave() {
  const board = _vbGetBoard();
  if (board) board.updatedAt = new Date().toISOString();
  // Dual-write: localStorage (instant) + Electron file (durable)
  try { localStorage.setItem(VB_KEY, JSON.stringify(_vbBoards)); } catch(e) {}
  try {
    if (window.csf?.visionboard?.save) window.csf.visionboard.save(_vbBoards);
  } catch(e) {}
}

function _vbGetBoard() {
  return _vbBoards.find((b) => b.id === _vbCurId) || null;
}

function _vbGenId(p) {
  return p + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

function _vbCreateBoard(name) {
  const board = {
    id: _vbGenId("vb"),
    name: name || "Neues Board",
    nodes: [],
    connections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  _vbBoards.push(board);
  _vbCurId = board.id;
  _vbSave();
  return board;
}

// ── HELPERS ───────────────────────────
function _vbEl(tag, cls) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  return el;
}

// Canvas-Koordinaten aus Screen-Koordinaten
function _vbScreenToCanvas(clientX, clientY) {
  const wrap = document.getElementById("vbCanvasWrap");
  if (!wrap) return { x: 0, y: 0 };
  const r = wrap.getBoundingClientRect();
  return {
    x: (clientX - r.left - _vbPanX) / _vbScale,
    y: (clientY - r.top  - _vbPanY) / _vbScale,
  };
}

function _vbApplyTransform() {
  const stage = document.getElementById("vbStage");
  if (stage) stage.style.transform = `translate(${_vbPanX}px,${_vbPanY}px) scale(${_vbScale})`;
  _vbUpdateZoomDisplay();
}

function _vbUpdateZoomDisplay() {
  const el = document.getElementById("vbZoomPct");
  if (el) el.textContent = Math.round(_vbScale * 100) + "%";
}

function _vbZoomTo(newScale, anchorX, anchorY) {
  const wrap = document.getElementById("vbCanvasWrap");
  if (!wrap) return;
  const r = wrap.getBoundingClientRect();
  const ax = anchorX ?? r.width / 2;
  const ay = anchorY ?? r.height / 2;
  const clamped = Math.max(0.15, Math.min(4, newScale));
  _vbPanX = ax - (ax - _vbPanX) * (clamped / _vbScale);
  _vbPanY = ay - (ay - _vbPanY) * (clamped / _vbScale);
  _vbScale = clamped;
  _vbApplyTransform();
}

function _vbZoomIn()    { _vbZoomTo(_vbScale * 1.2); }
function _vbZoomOut()   { _vbZoomTo(_vbScale * 0.83); }
function _vbZoomReset() {
  _vbScale = 1;
  const b = _vbGetBoard();
  if (b && b.nodes.length) { _vbApplyTransform(); _vbCenterOnNodes(); }
  else { _vbPanX = 80; _vbPanY = 60; _vbApplyTransform(); }
}

function _vbClear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function _vbSvgEl(tag) {
  return document.createElementNS("http://www.w3.org/2000/svg", tag);
}

// ── CENTER ON NODES ──────────────────
function _vbCenterOnNodes() {
  const board = _vbGetBoard();
  if (!board || !board.nodes.length) return;
  const xs = board.nodes.map((n) => n.x);
  const ys = board.nodes.map((n) => n.y);
  const ws = board.nodes.map((n) => n.w || 200);
  const hs = board.nodes.map((n) => n.h || 80);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs.map((x, i) => x + ws[i]));
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys.map((y, i) => y + hs[i]));
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const wrap = document.getElementById("vbCanvasWrap");
  if (!wrap) return;
  const vw = wrap.clientWidth  || 800;
  const vh = wrap.clientHeight || 600;
  _vbPanX = vw / 2 - cx * _vbScale;
  _vbPanY = vh / 2 - cy * _vbScale;
  _vbApplyTransform();
}

// ── SEED DATA ─────────────────────────
function _vbSeedBoard(board) {
  const _id = () => _vbGenId("vbn");
  const nodes = [
    { id: _id(), kind: "text",     x: 130, y:  10, w: 290, h: 44,  title: "Vision Board 2026",           fontSize: 22, textColor: "#d4a843", label: "", note: "", size: "M" },
    { id: _id(), kind: "goal",     x: 290, y:  90, w: 260, h: 130, title: "Finanzielle Unabhängigkeit",  note: "Passives Einkommen > Ausgaben", color: "#00c896", label: "Hauptziel", size: "M" },
    { id: _id(), kind: "standard", x:  60, y: 280, w: 200, h:  90, title: "Monatl. Sparrate",            note: "500 € automatisch sparen",      color: "#4d8fef",  label: "Schritt 1", size: "M" },
    { id: _id(), kind: "goal",     x:  60, y: 410, w: 200, h:  90, title: "Notgroschen 10 000 €",        note: "6 Monatsgehälter als Puffer",   color: "#00c896", label: "",          size: "M" },
    { id: _id(), kind: "standard", x: 540, y: 280, w: 200, h:  90, title: "Depot Aufbau",                note: "ETF + Dividendenaktien",        color: "#534AB7",  label: "Schritt 2", size: "M" },
    { id: _id(), kind: "standard", x: 540, y: 410, w: 200, h:  80, title: "ETF-Sparplan",                note: "MSCI World · monatlich",        color: "#534AB7",  label: "",          size: "M" },
    { id: _id(), kind: "sticky",   x: 800, y:  90, w: 190, h: 120, title: "Keine Konsumschulden!",       note: "Schulden tilgen → dann investieren", color: "#BA7517", label: "",     size: "M" },
  ];
  nodes.forEach((n) => board.nodes.push(n));
  [
    [nodes[1], nodes[2]],
    [nodes[1], nodes[4]],
    [nodes[2], nodes[3]],
    [nodes[4], nodes[5]],
  ].forEach(([f, t]) => board.connections.push({ id: _vbGenId("vc"), fromId: f.id, toId: t.id, kind: "arrow", route: "auto", style: "solid" }));
}

// ── MAIN RENDER ───────────────────────
function renderVisionBoard() {
  const pg = document.getElementById("p-vision");
  if (!pg) return;
  _vbLoad(); // sync fallback while async loads
  _vbLoadAsync().then(() => {
    if (!_vbBoards.length) _vbCreateBoard("Mein Board");
    if (!_vbCurId || !_vbGetBoard()) _vbCurId = _vbBoards[0].id;
    const _cur = _vbGetBoard();
    if (_vbBoards.length === 1 && _cur && _cur.nodes.length === 0) {
      _vbSeedBoard(_cur);
      _vbSave();
    }
    _vbRenderAll();
    _vbRefreshBoardSelect();
    requestAnimationFrame(() => _vbCenterOnNodes());
  });
  if (!_vbBoards.length) _vbCreateBoard("Mein Board");
  if (!_vbCurId || !_vbGetBoard()) _vbCurId = _vbBoards[0].id;

  document.body.classList.add("has-visionboard");
  document.removeEventListener("mousemove", _vbOnMouseMove);
  document.removeEventListener("mouseup",   _vbOnMouseUp);
  document.removeEventListener("keydown",   _vbOnKeyDown);
  document.removeEventListener("keydown",   _vbOnSpaceDown);
  document.removeEventListener("keyup",     _vbOnSpaceUp);

  _vbClear(pg);
  pg.className = "page active vb-page";

  const shell = _vbEl("div", "vb-shell");
  pg.appendChild(shell);

  shell.appendChild(_vbBuildTopbar());

  const main = _vbEl("div", "vb-main");
  shell.appendChild(main);

  main.appendChild(_vbBuildToolbar());

  const wrap = _vbEl("div", "vb-canvas-wrap");
  wrap.id = "vbCanvasWrap";
  wrap.dataset.tool = _vbTool;
  main.appendChild(wrap);

  // Stage: transformierter Container für Nodes + SVG
  const stage = _vbEl("div", "vb-stage");
  stage.id = "vbStage";
  wrap.appendChild(stage);

  // SVG layer for connections (inside stage)
  const svg = _vbEl_svg("svg", "vb-svg");
  svg.id = "vbSvg";
  const defs = _vbEl_svg("defs");
  defs.appendChild(_vbMakeArrowMarker("vb-arr-end", false));
  defs.appendChild(_vbMakeArrowMarker("vb-arr-start", true));
  svg.appendChild(defs);
  stage.appendChild(svg);

  main.appendChild(_vbBuildProps());
  if (_vbPropsCollapsed) shell.classList.add("vb-props-hidden");

  // Wheel Zoom
  wrap.addEventListener("wheel", (e) => {
    e.preventDefault();
    const r = wrap.getBoundingClientRect();
    const ax = e.clientX - r.left;
    const ay = e.clientY - r.top;
    _vbZoomTo(_vbScale * (e.deltaY < 0 ? 1.12 : 0.89), ax, ay);
  }, { passive: false });

  wrap.addEventListener("mousedown", _vbOnCanvasMouseDown);
  wrap.addEventListener("click", _vbOnCanvasClick);
  document.addEventListener("mousemove", _vbOnMouseMove);
  document.addEventListener("mouseup", _vbOnMouseUp);
  document.addEventListener("keydown", _vbOnKeyDown);

  // Pan mit Space-Taste
  document.addEventListener("keydown", _vbOnSpaceDown);
  document.addEventListener("keyup",   _vbOnSpaceUp);

  // Pan-/Zoom-State zurücksetzen (pro Board-Wechsel reset)
  _vbPanX = 80; _vbPanY = 60; _vbScale = 1;
  _vbApplyTransform();

  _vbRenderAll();

  // Dokumentations-Sektion unterhalb des Boards
  pg.appendChild(_vbBuildDocs());
}

function _vbBuildDocs() {
  const wrap = _vbEl("div", "vb-docs");

  // Header
  const hdr = _vbEl("div", "vb-docs-header");
  const hdrIcon = _vbEl("div", "vb-docs-icon");
  hdrIcon.appendChild(_vbSvgIcon("info", 16));
  hdr.appendChild(hdrIcon);
  const hdrText = _vbEl("div");
  const title = _vbEl("div", "vb-docs-title");
  title.textContent = "Vision Board — Dokumentation";
  const sub = _vbEl("div", "vb-docs-sub");
  sub.textContent = "Alle Werkzeuge, Shortcuts und Funktionen auf einen Blick";
  hdrText.appendChild(title);
  hdrText.appendChild(sub);
  hdr.appendChild(hdrText);
  wrap.appendChild(hdr);

  const grid = _vbEl("div", "vb-docs-grid");

  const _card = (iconName, cardTitle, rows) => {
    const card = _vbEl("div", "vb-docs-card");
    const head = _vbEl("div", "vb-docs-card-head");
    const ico = _vbEl("div", "vb-docs-card-icon");
    ico.appendChild(_vbSvgIcon(iconName, 14));
    head.appendChild(ico);
    const ct = _vbEl("div", "vb-docs-card-title");
    ct.textContent = cardTitle;
    head.appendChild(ct);
    card.appendChild(head);
    rows.forEach(([key, label]) => {
      const row = _vbEl("div", "vb-docs-row");
      const k = _vbEl("span", "vb-docs-key");
      k.textContent = key;
      const l = _vbEl("span", "vb-docs-row-label");
      l.textContent = label;
      row.appendChild(k);
      row.appendChild(l);
      card.appendChild(row);
    });
    return card;
  };

  grid.appendChild(_card("mouse-pointer", "Werkzeuge", [
    ["Zeiger",   "Nodes auswählen, verschieben, skalieren"],
    ["Node",     "Neuen Knoten erstellen (Ziehen = Größe)"],
    ["Sticky",   "Haftnotiz einfügen (Ziehen = Größe)"],
    ["Goal",     "Sparziel-Card erstellen (Ziehen = Größe)"],
    ["Text",     "Freitext-Element hinzufügen"],
    ["Bild",     "Bild aus Dateisystem laden"],
    ["Verbind.", "Nodes mit Linie verbinden"],
    ["Pfeil",    "Gerichtete Verbindung (Pfeilspitze)"],
  ]));

  grid.appendChild(_card("keyboard", "Tastatur-Shortcuts", [
    ["Entf / ⌫",    "Ausgewählten Node löschen"],
    ["Esc",         "Auswahl aufheben"],
    ["Strg+A",      "Alle Nodes auswählen"],
    ["Leertaste",   "Halten → Pan-Modus aktivieren"],
    ["Shift+Ziehen","Rubber-Band-Auswahl (Mehrfach)"],
  ]));

  grid.appendChild(_card("navigation", "Navigation", [
    ["Mausrad",     "Zoom in/aus (zentriert am Cursor)"],
    ["Mittelklick", "Canvas ziehen (Pan)"],
    ["Leertaste",   "Linksklick-Drag = Pan"],
    ["Zentrieren",  "Alle Nodes in den Sichtbereich bringen"],
    ["–  /  +",     "Zoom-Buttons in der Toolbar"],
    ["100%",        "Zoom zurücksetzen via Klick auf %"],
  ]));

  grid.appendChild(_card("layers", "Boards & Nodes", [
    ["Board",       "Neues Board über die Topbar anlegen"],
    ["Titel",       "Board-Name direkt in der Topbar editieren"],
    ["Verbind.",    "Erst 1. Node klicken, dann 2. Node"],
    ["Größe",       "Node am Rand-Handle skalieren (SE/E/S)"],
    ["Farbe",       "Im Eigenschaften-Panel rechts ändern"],
    ["Panel",       "Eigenschaften ein-/ausblenden (Toggle)"],
  ]));

  wrap.appendChild(grid);
  return wrap;
}

function _vbEl_svg(tag, cls) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  if (cls) el.setAttribute("class", cls);
  return el;
}

function _vbMakeArrowMarker(id, reverse) {
  const m = _vbEl_svg("marker");
  m.setAttribute("id", id);
  m.setAttribute("markerWidth", "8");
  m.setAttribute("markerHeight", "6");
  m.setAttribute("refX", reverse ? "1" : "7");
  m.setAttribute("refY", "3");
  m.setAttribute("orient", reverse ? "auto-start-reverse" : "auto");
  const poly = _vbEl_svg("polygon");
  poly.setAttribute("points", "0 0, 8 3, 0 6");
  poly.setAttribute("fill", "#6b7280");
  m.appendChild(poly);
  return m;
}

// ── TOPBAR ────────────────────────────
function _vbBuildTopbar() {
  const bar = _vbEl("div", "vb-topbar");
  const board = _vbGetBoard();

  const nameWrap = _vbEl("div", "vb-topbar-name-wrap");
  nameWrap.appendChild(_vbSvgIcon("edit-2", 12));
  const nameEl = _vbEl("span", "vb-board-name");
  nameEl.id = "vbBoardName";
  nameEl.contentEditable = "true";
  nameEl.spellcheck = false;
  nameEl.textContent = board ? board.name : "Board";
  nameEl.addEventListener("blur", () => {
    const b = _vbGetBoard();
    if (b) { b.name = nameEl.textContent.trim() || "Board"; _vbSave(); _vbRefreshBoardSelect(); }
  });
  nameEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); nameEl.blur(); }
  });
  nameWrap.appendChild(nameEl);
  bar.appendChild(nameWrap);

  bar.appendChild(_vbEl("div", "vb-topbar-divider"));

  const sel = document.createElement("select");
  sel.className = "vb-board-sel";
  sel.id = "vbBoardSel";
  _vbPopulateBoardSel(sel);
  sel.addEventListener("change", () => {
    _vbCurId = sel.value;
    _vbSelected = null;
    _vbConnStart = null;
    renderVisionBoard();
  });
  bar.appendChild(sel);

  bar.appendChild(_vbEl("div", "vb-topbar-spacer"));

  // Zoom controls
  const zoomWrap = _vbEl("div", "vb-zoom-ctrl");
  const zoomOut = _vbEl("button", "vb-zoom-btn");
  zoomOut.appendChild(_vbSvgIcon("minus", 12));
  zoomOut.addEventListener("click", _vbZoomOut);
  zoomWrap.appendChild(zoomOut);
  const zoomPct = _vbEl("span", "vb-zoom-pct");
  zoomPct.id = "vbZoomPct";
  zoomPct.textContent = "100%";
  zoomPct.style.cursor = "pointer";
  zoomPct.addEventListener("mouseenter", () => { if (typeof _showTooltip === "function") _showTooltip("Zoom zurücksetzen", zoomPct); });
  zoomPct.addEventListener("mouseleave", () => { if (typeof _hideTooltip === "function") _hideTooltip(); });
  zoomPct.addEventListener("click", _vbZoomReset);
  zoomWrap.appendChild(zoomPct);
  const zoomIn = _vbEl("button", "vb-zoom-btn");
  zoomIn.appendChild(_vbSvgIcon("plus", 12));
  zoomIn.addEventListener("click", _vbZoomIn);
  zoomWrap.appendChild(zoomIn);
  bar.appendChild(zoomWrap);

  // Hint group — hidden at narrow widths via CSS
  const hintGroup = _vbEl("div", "vb-topbar-hint-group");
  hintGroup.appendChild(_vbEl("div", "vb-topbar-divider"));
  const hint = _vbEl("span", "vb-topbar-hint");
  hint.textContent = "Ziehen = Pan · Shift+Ziehen = Auswahl · Doppelklick = Titel bearbeiten";
  hintGroup.appendChild(hint);
  hintGroup.appendChild(_vbEl("div", "vb-topbar-divider"));
  bar.appendChild(hintGroup);

  const expBtn = _vbEl("button", "btn vb-topbar-btn");
  expBtn.appendChild(_vbSvgIcon("download", 13));
  expBtn.addEventListener("mouseenter", () => { if (typeof _showTooltip === "function") _showTooltip("Board exportieren", expBtn); });
  expBtn.addEventListener("mouseleave", () => { if (typeof _hideTooltip === "function") _hideTooltip(); });
  const expLabel = _vbEl("span", "vb-btn-label");
  expLabel.textContent = " Exportieren";
  expBtn.appendChild(expLabel);
  expBtn.addEventListener("click", _vbExport);
  bar.appendChild(expBtn);

  const newBtn = _vbEl("button", "btn primary vb-topbar-btn");
  newBtn.appendChild(_vbSvgIcon("plus", 13));
  newBtn.addEventListener("mouseenter", () => { if (typeof _showTooltip === "function") _showTooltip("Neues Board erstellen", newBtn); });
  newBtn.addEventListener("mouseleave", () => { if (typeof _hideTooltip === "function") _hideTooltip(); });
  const newLabel = _vbEl("span", "vb-btn-label");
  newLabel.textContent = " Neues Board";
  newBtn.appendChild(newLabel);
  newBtn.addEventListener("click", () => {
    appPrompt("Name des neuen Boards:", { placeholder: "Mein Board" }).then((name) => {
      if (name == null) return;
      _vbCreateBoard(name || "Neues Board");
      _vbSelected = null;
      renderVisionBoard();
    });
  });
  bar.appendChild(newBtn);

  bar.appendChild(_vbEl("div", "vb-topbar-divider"));

  // Props panel toggle
  const panelToggleBtn = _vbEl("button", "btn vb-topbar-btn vb-panel-toggle-btn");
  panelToggleBtn.id = "vbPanelToggle";
  panelToggleBtn.appendChild(_vbSvgIcon(_vbPropsCollapsed ? "panel-right-open" : "panel-right-close", 14));
  panelToggleBtn.addEventListener("mouseenter", () => {
    if (typeof _showTooltip === "function") _showTooltip(_vbPropsCollapsed ? "Seitenleiste einblenden" : "Seitenleiste ausblenden", panelToggleBtn);
  });
  panelToggleBtn.addEventListener("mouseleave", () => { if (typeof _hideTooltip === "function") _hideTooltip(); });
  panelToggleBtn.addEventListener("click", () => {
    _vbPropsCollapsed = !_vbPropsCollapsed;
    const propsEl = document.getElementById("vbProps");
    const shell = propsEl && propsEl.closest(".vb-shell");
    if (shell) shell.classList.toggle("vb-props-hidden", _vbPropsCollapsed);
    const icon = _vbSvgIcon(_vbPropsCollapsed ? "panel-right-open" : "panel-right-close", 14);
    while (panelToggleBtn.firstChild) panelToggleBtn.removeChild(panelToggleBtn.firstChild);
    panelToggleBtn.appendChild(icon);
  });
  bar.appendChild(panelToggleBtn);

  return bar;
}

function _vbPopulateBoardSel(sel) {
  _vbClear(sel);
  _vbBoards.forEach((b) => {
    const opt = document.createElement("option");
    opt.value = b.id;
    opt.textContent = b.name;
    if (b.id === _vbCurId) opt.selected = true;
    sel.appendChild(opt);
  });
}

function _vbRefreshBoardSelect() {
  const sel = document.getElementById("vbBoardSel");
  if (sel) _vbPopulateBoardSel(sel);
  const nameEl = document.getElementById("vbBoardName");
  if (nameEl) { const b = _vbGetBoard(); if (b) nameEl.textContent = b.name; }
}

// ── TOOLBAR ───────────────────────────
const VB_TOOLS = [
  { id: "select",  label: "Auswahl",    icon: "mouse-pointer", group: 1 },
  { id: "text",    label: "Text",        icon: "type",          group: 1 },
  { id: "node",    label: "Node",        icon: "square",        group: 1 },
  { id: "image",   label: "Bild-Upload", icon: "image",         group: 1 },
  { id: "connect", label: "Verbinden",   icon: "git-merge",     group: 2 },
  { id: "arrow",   label: "Pfeil",       icon: "arrow-right",   group: 2 },
  { id: "sticky",  label: "Sticky Note", icon: "file-text",     group: 3 },
  { id: "goal",    label: "Ziel-Node",   icon: "target",        group: 3 },
];

function _vbBuildToolbar() {
  const bar = _vbEl("div", "vb-toolbar");
  let lastGroup = 0;

  VB_TOOLS.forEach((t) => {
    if (t.group !== lastGroup && lastGroup !== 0) {
      bar.appendChild(_vbEl("div", "vb-tool-sep"));
    }
    lastGroup = t.group;

    const btn = _vbEl("button", "vb-tool-btn" + (_vbTool === t.id ? " active" : ""));
    btn.dataset.tool = t.id;
    btn.appendChild(_vbSvgIcon(t.icon, 16));
    btn.addEventListener("mouseenter", () => { if (typeof _showTooltip === "function") _showTooltip(t.label, btn); });
    btn.addEventListener("mouseleave", () => { if (typeof _hideTooltip === "function") _hideTooltip(); });
    btn.addEventListener("click", () => {
      _vbTool = t.id;
      _vbConnStart = null;
      document.querySelectorAll(".vb-tool-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const wrap = document.getElementById("vbCanvasWrap");
      if (wrap) wrap.dataset.tool = t.id;
    });
    bar.appendChild(btn);
  });

  bar.appendChild(_vbEl("div", "vb-tool-spacer"));

  const delBtn = _vbEl("button", "vb-tool-btn vb-tool-del");
  delBtn.appendChild(_vbSvgIcon("trash-2", 15));
  delBtn.addEventListener("mouseenter", () => { if (typeof _showTooltip === "function") _showTooltip("Löschen (Entf)", delBtn); });
  delBtn.addEventListener("mouseleave", () => { if (typeof _hideTooltip === "function") _hideTooltip(); });
  delBtn.addEventListener("click", _vbDeleteSelected);
  bar.appendChild(delBtn);

  return bar;
}

// ── PROPERTIES PANEL ──────────────────
function _vbBuildProps() {
  const panel = _vbEl("div", "vb-props");
  panel.id = "vbProps";
  _vbFillProps(panel);
  return panel;
}

function _vbUpdateProps() {
  const panel = document.getElementById("vbProps");
  if (panel) _vbFillProps(panel);
}

function _vbFillProps(panel) {
  _vbClear(panel);
  if (!_vbSelected) {
    panel.classList.remove("vb-props-open");
    // ── Aktionen-Sektion ──
    const actSec = _vbEl("div", "vb-aside-section");
    const actTitle = _vbEl("div", "vb-aside-title");
    actTitle.textContent = "Aktionen";
    actSec.appendChild(actTitle);
    const actBtns = _vbEl("div", "vb-aside-actions");
    const quickTools = [
      { id: "text",   label: "Text",   icon: "type"      },
      { id: "node",   label: "Node",   icon: "square"    },
      { id: "image",  label: "Bild",   icon: "image"     },
      { id: "sticky", label: "Sticky", icon: "file-text" },
    ];
    quickTools.forEach((t) => {
      const btn = _vbEl("button", "vb-aside-btn");
      btn.appendChild(_vbSvgIcon(t.icon, 14));
      const lbl = _vbEl("span");
      lbl.textContent = t.label;
      btn.appendChild(lbl);
      btn.addEventListener("mouseenter", () => { if (typeof _showTooltip === "function") _showTooltip("Werkzeug: " + t.label, btn); });
      btn.addEventListener("mouseleave", () => { if (typeof _hideTooltip === "function") _hideTooltip(); });
      btn.addEventListener("click", () => {
        _vbTool = t.id;
        const wrap = document.getElementById("vbCanvasWrap");
        if (wrap) wrap.dataset.tool = t.id;
        document.querySelectorAll(".vb-tool-btn").forEach((b) => b.classList.remove("active"));
        document.querySelector(`.vb-tool-btn[data-tool="${t.id}"]`)?.classList.add("active");
      });
      actBtns.appendChild(btn);
    });
    actSec.appendChild(actBtns);
    panel.appendChild(actSec);

    // ── Canvas-Sektion ──
    const canvSec = _vbEl("div", "vb-aside-section");
    const canvTitle = _vbEl("div", "vb-aside-title");
    canvTitle.textContent = "Canvas";
    canvSec.appendChild(canvTitle);
    const canvBtns = _vbEl("div", "vb-aside-canvas-btns");
    const centerBtn = _vbEl("button", "vb-aside-canvas-btn");
    centerBtn.textContent = "⊙ Zentrieren";
    centerBtn.addEventListener("click", _vbCenterOnNodes);
    canvBtns.appendChild(centerBtn);
    const selAllBtn = _vbEl("button", "vb-aside-canvas-btn");
    selAllBtn.textContent = "⊞ Alles auswählen";
    selAllBtn.addEventListener("click", () => {
      const board = _vbGetBoard();
      if (!board) return;
      _vbMultiSel = board.nodes.map((n) => n.id);
      _vbRenderAll();
    });
    canvBtns.appendChild(selAllBtn);
    canvSec.appendChild(canvBtns);
    panel.appendChild(canvSec);

    _vbAppendMinimap(panel);
    return;
  }
  panel.classList.add("vb-props-open");
  const board = _vbGetBoard();
  if (!board) return;

  if (_vbSelected.kind === "node") {
    const node = board.nodes.find((n) => n.id === _vbSelected.id);
    if (node) _vbBuildNodeProps(panel, node);
  } else if (_vbSelected.kind === "conn") {
    const conn = board.connections.find((c) => c.id === _vbSelected.id);
    if (conn) _vbBuildConnProps(panel, conn);
  }
}

function _vbPropsHead(panel, label) {
  const head = _vbEl("div", "vb-props-head");
  head.appendChild(document.createTextNode(label));
  const closeBtn = _vbEl("button", "vb-props-close");
  closeBtn.appendChild(_vbSvgIcon("x", 13));
  closeBtn.addEventListener("mouseenter", () => { if (typeof _showTooltip === "function") _showTooltip("Auswahl aufheben", closeBtn); });
  closeBtn.addEventListener("mouseleave", () => { if (typeof _hideTooltip === "function") _hideTooltip(); });
  closeBtn.addEventListener("click", () => { _vbSelected = null; _vbRenderAll(); });
  head.appendChild(closeBtn);
  panel.appendChild(head);
}

function _vbBuildNodeProps(panel, node) {
  _vbPropsHead(panel, "Eigenschaften");

  _vbPropsRow(panel, "Label", (wrap) => {
    const inp = document.createElement("input");
    inp.type = "text";
    inp.className = "vb-props-input";
    inp.value = node.label || "";
    inp.placeholder = "z.B. Kategorie";
    inp.addEventListener("input", () => { node.label = inp.value; _vbSave(); _vbRenderNodes(); });
    wrap.appendChild(inp);
  });

  _vbPropsRow(panel, "Titel", (wrap) => {
    const inp = document.createElement("input");
    inp.type = "text";
    inp.className = "vb-props-input";
    inp.value = node.title || "";
    inp.placeholder = "Titel";
    inp.addEventListener("input", () => { node.title = inp.value; _vbSave(); _vbRenderNodes(); });
    wrap.appendChild(inp);
  });

  _vbPropsRow(panel, "Notiz", (wrap) => {
    const ta = document.createElement("textarea");
    ta.className = "vb-props-input vb-props-ta";
    ta.value = node.note || "";
    ta.placeholder = "Optionale Notiz…";
    ta.rows = 3;
    ta.addEventListener("input", () => { node.note = ta.value; _vbSave(); _vbRenderNodes(); });
    wrap.appendChild(ta);
  });

  _vbPropsRow(panel, "Farbe", (wrap) => {
    const swatches = _vbEl("div", "vb-color-swatches");
    VB_COLORS.forEach((c) => {
      const sw = _vbEl("button", "vb-color-swatch" + (node.color === c ? " active" : ""));
      sw.style.background = c;
      sw.addEventListener("mouseenter", () => { if (typeof _showTooltip === "function") _showTooltip(c, sw); });
      sw.addEventListener("mouseleave", () => { if (typeof _hideTooltip === "function") _hideTooltip(); });
      sw.addEventListener("click", () => {
        node.color = c;
        _vbSave();
        swatches.querySelectorAll(".vb-color-swatch").forEach((s) => s.classList.remove("active"));
        sw.classList.add("active");
        _vbRenderNodes();
        _vbRenderConnections();
      });
      swatches.appendChild(sw);
    });
    wrap.appendChild(swatches);
  });

  _vbPropsRow(panel, "Größe", (wrap) => {
    const grp = _vbEl("div", "vb-fs-grp");
    ["S", "M", "L"].forEach((sz) => {
      const btn = _vbEl("button", "vb-fs-btn" + ((node.size || "M") === sz ? " active" : ""));
      btn.textContent = sz;
      btn.addEventListener("click", () => {
        node.size = sz;
        node.w = VB_SIZES[sz].w;
        node.h = VB_SIZES[sz].h;
        _vbSave();
        grp.querySelectorAll(".vb-fs-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        _vbRenderNodes();
        _vbRenderConnections();
      });
      grp.appendChild(btn);
    });
    wrap.appendChild(grp);
  });

  // Textgröße
  _vbPropsRow(panel, "Textgröße", (wrap) => {
    const grp = _vbEl("div", "vb-fs-grp");
    const sizes = [{ v: 12, label: "S" }, { v: 16, label: "M" }, { v: 20, label: "L" }, { v: 28, label: "XL" }];
    const activeSize = node.fontSize || 0;
    sizes.forEach(({ v, label }) => {
      const isActive = activeSize === v || (!node.fontSize && v === 16);
      const btn = _vbEl("button", "vb-fs-btn" + (isActive ? " active" : ""));
      btn.textContent = label;
      btn.addEventListener("click", () => {
        node.fontSize = v;
        _vbSave();
        grp.querySelectorAll(".vb-fs-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        _vbRenderNodes();
      });
      grp.appendChild(btn);
    });
    wrap.appendChild(grp);
  });

  // Textfarbe
  const TEXT_COLORS = ["#f0ece8", "#9b8f85", "#d4a843", "#00c896", "#4d8fef", "#a78bfa", "#ef4444", "#1a1a1a"];
  _vbPropsRow(panel, "Textfarbe", (wrap) => {
    const swatches = _vbEl("div", "vb-color-swatches");
    TEXT_COLORS.forEach((c) => {
      const sw = _vbEl("button", "vb-color-swatch" + (node.textColor === c ? " active" : ""));
      sw.style.background = c;
      if (c === "#1a1a1a") sw.style.border = "2px solid var(--border2)";
      sw.addEventListener("mouseenter", () => { if (typeof _showTooltip === "function") _showTooltip(c, sw); });
      sw.addEventListener("mouseleave", () => { if (typeof _hideTooltip === "function") _hideTooltip(); });
      sw.addEventListener("click", () => {
        node.textColor = node.textColor === c ? null : c;
        _vbSave();
        swatches.querySelectorAll(".vb-color-swatch").forEach((s) => s.classList.remove("active"));
        if (node.textColor) sw.classList.add("active");
        _vbRenderNodes();
      });
      swatches.appendChild(sw);
    });
    wrap.appendChild(swatches);
  });

  // Delete from props panel
  const delRow = _vbEl("div", "vb-props-row");
  delRow.style.paddingTop = "14px";
  const propDelBtn = _vbEl("button", "btn vb-props-delbtn");
  propDelBtn.appendChild(_vbSvgIcon("trash-2", 13));
  propDelBtn.appendChild(document.createTextNode(" Löschen"));
  propDelBtn.addEventListener("click", _vbDeleteSelected);
  delRow.appendChild(propDelBtn);
  panel.appendChild(delRow);

  const mmWrap = _vbEl("div", "vb-props-minimap-wrap");
  panel.appendChild(mmWrap);
  _vbAppendMinimap(mmWrap);
}

function _vbBuildConnProps(panel, conn) {
  _vbPropsHead(panel, "Verbindung");

  _vbPropsRow(panel, "Pfeil", (wrap) => {
    const grp = _vbEl("div", "vb-fs-grp");
    [{ v: "arrow", label: "\u2192" }, { v: "bidir", label: "\u2194" }, { v: "none", label: "\u2014" }].forEach(({ v, label }) => {
      const btn = _vbEl("button", "vb-fs-btn" + ((conn.kind || "arrow") === v ? " active" : ""));
      btn.textContent = label;
      btn.addEventListener("click", () => {
        conn.kind = v;
        _vbSave();
        grp.querySelectorAll(".vb-fs-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        _vbRenderConnections();
      });
      grp.appendChild(btn);
    });
    wrap.appendChild(grp);
  });

  _vbPropsRow(panel, "Route", (wrap) => {
    const grp = _vbEl("div", "vb-fs-grp");
    [{ v: "auto", label: "Auto" }, { v: "ortho", label: "Eckig" }].forEach(({ v, label }) => {
      const btn = _vbEl("button", "vb-fs-btn" + ((conn.route || "auto") === v ? " active" : ""));
      btn.textContent = label;
      btn.addEventListener("click", () => {
        conn.route = v;
        _vbSave();
        grp.querySelectorAll(".vb-fs-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        _vbRenderConnections();
      });
      grp.appendChild(btn);
    });
    wrap.appendChild(grp);
  });

  _vbPropsRow(panel, "Stil", (wrap) => {
    const grp = _vbEl("div", "vb-fs-grp");
    [{ v: "solid", label: "\u2014\u2014" }, { v: "dotted", label: "\u00b7\u00b7\u00b7\u00b7" }].forEach(({ v, label }) => {
      const btn = _vbEl("button", "vb-fs-btn" + ((conn.style || "solid") === v ? " active" : ""));
      btn.textContent = label;
      btn.addEventListener("click", () => {
        conn.style = v;
        _vbSave();
        grp.querySelectorAll(".vb-fs-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        _vbRenderConnections();
      });
      grp.appendChild(btn);
    });
    wrap.appendChild(grp);
  });

  // Delete from props
  const delRow = _vbEl("div", "vb-props-row");
  delRow.style.paddingTop = "14px";
  const propDelBtn = _vbEl("button", "btn vb-props-delbtn");
  propDelBtn.appendChild(_vbSvgIcon("trash-2", 13));
  propDelBtn.appendChild(document.createTextNode(" Verbindung löschen"));
  propDelBtn.addEventListener("click", _vbDeleteSelected);
  delRow.appendChild(propDelBtn);
  panel.appendChild(delRow);

  const mmWrap = _vbEl("div", "vb-props-minimap-wrap");
  panel.appendChild(mmWrap);
  _vbAppendMinimap(mmWrap);
}

function _vbPropsRow(panel, label, fillFn) {
  const row = _vbEl("div", "vb-props-row");
  const lbl = _vbEl("div", "vb-props-lbl");
  lbl.textContent = label;
  row.appendChild(lbl);
  const val = _vbEl("div", "vb-props-val");
  fillFn(val);
  row.appendChild(val);
  panel.appendChild(row);
}

// ── MINIMAP ───────────────────────────
function _vbAppendMinimap(container) {
  if (!container) return;
  const board = _vbGetBoard();
  if (!board || !board.nodes.length) return;

  const wrap = _vbEl("div", "vb-minimap-wrap");
  const canvas = document.createElement("canvas");
  canvas.className = "vb-minimap";
  canvas.width = 176;
  canvas.height = 100;
  wrap.appendChild(canvas);
  container.appendChild(wrap);

  const ctx = canvas.getContext("2d");
  const mmBg = getComputedStyle(document.documentElement).getPropertyValue("--panel2").trim() || "#111";
  ctx.fillStyle = mmBg;
  ctx.fillRect(0, 0, 176, 100);

  const xs = board.nodes.map((n) => n.x);
  const ys = board.nodes.map((n) => n.y);
  const minX = Math.min(...xs) - 10;
  const minY = Math.min(...ys) - 10;
  const maxX = Math.max(...board.nodes.map((n) => n.x + (n.w || VB_NODE_W))) + 10;
  const maxY = Math.max(...board.nodes.map((n) => n.y + (n.h || VB_NODE_H))) + 10;
  const scaleX = 176 / (maxX - minX || 1);
  const scaleY = 100 / (maxY - minY || 1);
  const scale = Math.min(scaleX, scaleY, 1);

  const mmLine = getComputedStyle(document.documentElement).getPropertyValue("--border2").trim() || "#3a3a3a";
  board.connections.forEach((c) => {
    const f = board.nodes.find((n) => n.id === c.fromId);
    const t = board.nodes.find((n) => n.id === c.toId);
    if (!f || !t) return;
    ctx.strokeStyle = mmLine;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo((f.x + (f.w || VB_NODE_W) / 2 - minX) * scale, (f.y + (f.h || VB_NODE_H) / 2 - minY) * scale);
    ctx.lineTo((t.x + (t.w || VB_NODE_W) / 2 - minX) * scale, (t.y + (t.h || VB_NODE_H) / 2 - minY) * scale);
    ctx.stroke();
  });

  board.nodes.forEach((n) => {
    const nx = (n.x - minX) * scale;
    const ny = (n.y - minY) * scale;
    const nw = (n.w || VB_NODE_W) * scale;
    const nh = (n.h || VB_NODE_H) * scale;
    ctx.fillStyle = (n.color || "#00c896") + "44";
    ctx.strokeStyle = n.color || "#00c896";
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(nx, ny, nw, nh, 2);
    else ctx.rect(nx, ny, nw, nh);
    ctx.fill();
    ctx.stroke();
  });
}

// ── RENDER ALL ────────────────────────
function _vbRenderAll() {
  _vbRenderNodes();
  _vbRenderConnections();
  _vbUpdateProps();
}

// ── RENDER NODES ──────────────────────
function _vbRenderNodes() {
  const wrap = document.getElementById("vbCanvasWrap");
  const stage = document.getElementById("vbStage");
  if (!wrap || !stage) return;

  Array.from(stage.children).forEach((c) => {
    if (c.classList && c.classList.contains("vb-node")) c.remove();
  });

  const board = _vbGetBoard();
  if (!board) return;

  board.nodes.forEach((node) => stage.appendChild(_vbBuildNodeEl(node)));

  wrap.dataset.tool = _vbTool;
  if (_vbConnStart) wrap.classList.add("vb-connecting");
  else wrap.classList.remove("vb-connecting");

  _vbUpdateMultiBar();
}

function _vbUpdateMultiBar() {
  const shell = document.querySelector(".vb-shell");
  if (!shell) return;
  let bar = document.getElementById("vbMultiBar");

  if (_vbMultiSel.length < 2) {
    if (bar) bar.remove();
    return;
  }

  if (!bar) {
    bar = _vbEl("div", "vb-multi-bar");
    bar.id = "vbMultiBar";

    const icon = _vbSvgIcon("check-square", 14);
    bar.appendChild(icon);

    const lbl = _vbEl("span", "vb-multi-bar-lbl");
    lbl.id = "vbMultiBarLbl";
    bar.appendChild(lbl);

    bar.appendChild(_vbEl("div", "vb-multi-bar-sep"));

    const delBtn = _vbEl("button", "vb-multi-bar-btn vb-multi-bar-del");
    delBtn.appendChild(_vbSvgIcon("trash-2", 13));
    const delTxt = document.createTextNode(" Löschen");
    delBtn.appendChild(delTxt);
    delBtn.addEventListener("click", (e) => { e.stopPropagation(); _vbDeleteSelected(); });
    bar.appendChild(delBtn);

    const clrBtn = _vbEl("button", "vb-multi-bar-btn");
    clrBtn.appendChild(_vbSvgIcon("x", 13));
    const clrTxt = document.createTextNode(" Aufheben");
    clrBtn.appendChild(clrTxt);
    clrBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      _vbMultiSel = [];
      _vbRenderNodes();
    });
    bar.appendChild(clrBtn);

    shell.appendChild(bar);
  }

  const lbl = document.getElementById("vbMultiBarLbl");
  if (lbl) lbl.textContent = _vbMultiSel.length + " ausgewählt";
}

function _vbBuildNodeEl(node) {
  const isSel = (_vbSelected && _vbSelected.kind === "node" && _vbSelected.id === node.id)
    || _vbMultiSel.includes(node.id);
  const isConnStart = _vbConnStart === node.id;

  const el = _vbEl("div",
    "vb-node vb-node-" + node.kind +
    (isSel ? " vb-selected" : "") +
    (isConnStart ? " vb-conn-start" : "")
  );
  el.id = "vbn_" + node.id;
  el.style.left = node.x + "px";
  el.style.top = node.y + "px";
  el.style.width = (node.w || VB_NODE_W) + "px";
  if (node.kind !== "text" && node.h) el.style.minHeight = node.h + "px";
  if (node.color) el.style.setProperty("--node-color", node.color);

  if (node.label) {
    const lbl = _vbEl("div", "vb-node-label");
    lbl.textContent = node.label;
    el.appendChild(lbl);
  }

  if (node.kind === "image") {
    if (node.imgSrc) {
      const img = document.createElement("img");
      img.className = "vb-node-img";
      img.src = node.imgSrc;
      img.alt = node.title || "";
      el.appendChild(img);
    } else {
      const ph = _vbEl("div", "vb-node-img-ph");
      ph.appendChild(_vbSvgIcon("image", 24));
      el.appendChild(ph);
    }
    if (node.title) {
      const t = _vbEl("div", "vb-node-title");
      t.textContent = node.title;
      el.appendChild(t);
    }
  } else if (node.kind === "text") {
    const t = _vbEl("div", "vb-node-text-content");
    t.textContent = node.title || "Text";
    if (node.fontSize) t.style.fontSize = node.fontSize + "px";
    if (node.textColor) t.style.color = node.textColor;
    el.appendChild(t);
  } else {
    if (node.kind === "goal") {
      const goalIcon = _vbEl("div", "vb-node-goal-icon");
      goalIcon.appendChild(_vbSvgIcon("target", 20));
      el.appendChild(goalIcon);
    }
    const t = _vbEl("div", "vb-node-title");
    t.textContent = node.title || (node.kind === "goal" ? "Mein Ziel" : node.kind === "sticky" ? "Notiz" : "Node");
    if (node.fontSize) t.style.fontSize = node.fontSize + "px";
    if (node.textColor) t.style.color = node.textColor;
    el.appendChild(t);
    if (node.note) {
      const nt = _vbEl("div", "vb-node-note");
      nt.textContent = node.note;
      el.appendChild(nt);
    }
  }

  // Delete button (visible on hover)
  const delBtn = _vbEl("button", "vb-node-del-btn");
  delBtn.appendChild(_vbSvgIcon("x", 11));
  delBtn.addEventListener("mouseenter", () => { if (typeof _showTooltip === "function") _showTooltip("Node löschen", delBtn); });
  delBtn.addEventListener("mouseleave", () => { if (typeof _hideTooltip === "function") _hideTooltip(); });
  delBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const board = _vbGetBoard();
    if (!board) return;
    board.nodes = board.nodes.filter((n) => n.id !== node.id);
    board.connections = board.connections.filter((c) => c.fromId !== node.id && c.toId !== node.id);
    if (_vbSelected && _vbSelected.id === node.id) _vbSelected = null;
    _vbSave();
    _vbRenderAll();
    showToast("Gelöscht", "info", 1200);
  });
  el.appendChild(delBtn);

  // Resize-Handles (SE, E, S)
  [["se","bottom:−4px;right:−4px;cursor:se-resize"],
   ["e","top:50%;right:−4px;transform:translateY(-50%);cursor:e-resize"],
   ["s","bottom:−4px;left:50%;transform:translateX(-50%);cursor:s-resize"]
  ].forEach(([dir, _]) => {
    const h = _vbEl("div", "vb-rh vb-rh-" + dir);
    h.dataset.dir = dir;
    h.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      e.preventDefault();
      _vbResizeId = node.id;
      _vbResizeDir = dir;
      const cp = _vbScreenToCanvas(e.clientX, e.clientY);
      _vbResizeSX = cp.x;
      _vbResizeSY = cp.y;
      _vbResizeOW = node.w || VB_NODE_W;
      _vbResizeOH = node.h || VB_NODE_H;
    });
    el.appendChild(h);
  });

  el.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    if (e.target.classList.contains("vb-rh")) return;
    // Space+drag → let it bubble to canvas pan handler
    if (_vbSpaceDown) return;
    e.stopPropagation();
    if (_vbTool === "connect" || _vbTool === "arrow") { _vbHandleConnectClick(node.id); return; }
    // Ctrl/Cmd+click → toggle multi-selection
    if (e.ctrlKey || e.metaKey) {
      const idx = _vbMultiSel.indexOf(node.id);
      if (idx >= 0) _vbMultiSel.splice(idx, 1);
      else _vbMultiSel.push(node.id);
      _vbSelected = null;
      _vbRenderNodes();
      return;
    }
    // If node not in multi-sel, clear multi-sel
    if (_vbMultiSel.length && !_vbMultiSel.includes(node.id)) _vbMultiSel = [];
    _vbDragId = node.id;
    _vbMoved = false;
    // Bring to front
    el.style.zIndex = ++_vbZTop;
    // Canvas-relative Drag-Offset
    const cp = _vbScreenToCanvas(e.clientX, e.clientY);
    _vbDragOx = cp.x - node.x;
    _vbDragOy = cp.y - node.y;
    _vbMx = e.clientX;
    _vbMy = e.clientY;
    el.classList.add("vb-dragging");
  });

  el.addEventListener("click", (e) => {
    e.stopPropagation();
    if ((_vbTool === "connect" || _vbTool === "arrow") || _vbMoved) return;
    if (e.ctrlKey || e.metaKey) return;
    _vbMultiSel = [];
    _vbSelectNode(node.id);
  });

  // Double-click → inline title edit
  el.addEventListener("dblclick", (e) => {
    e.stopPropagation();
    if (_vbTool !== "select") return;
    const titleEl = el.querySelector(".vb-node-title, .vb-node-text-content, .vb-node-img-ph");
    if (!titleEl || titleEl.classList.contains("vb-node-img-ph")) return;
    const orig = titleEl.textContent;
    titleEl.contentEditable = "true";
    titleEl.style.outline = "none";
    titleEl.focus();
    // Select all text
    const range = document.createRange();
    range.selectNodeContents(titleEl);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    const finish = (save) => {
      titleEl.contentEditable = "false";
      const val = titleEl.textContent.trim();
      if (save && val) { node.title = val; _vbSave(); _vbUpdateProps(); }
      else titleEl.textContent = orig;
    };
    titleEl.addEventListener("blur", () => finish(true), { once: true });
    titleEl.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") { ev.preventDefault(); finish(true); titleEl.blur(); }
      if (ev.key === "Escape") { finish(false); titleEl.blur(); }
    });
  });

  return el;
}

// ── RENDER CONNECTIONS ────────────────
function _vbRenderConnections() {
  const svg = document.getElementById("vbSvg");
  if (!svg) return;

  Array.from(svg.children).forEach((c) => {
    if (c.tagName !== "defs") c.remove();
  });

  const board = _vbGetBoard();
  if (!board) return;

  board.connections.forEach((conn) => {
    const from = board.nodes.find((n) => n.id === conn.fromId);
    const to = board.nodes.find((n) => n.id === conn.toId);
    if (!from || !to) return;
    svg.appendChild(_vbMakePath(from, to, conn));
  });
}

function _vbMakePath(from, to, conn) {
  const fw = from.w || VB_NODE_W, fh = from.h || VB_NODE_H;
  const tw = to.w || VB_NODE_W, th = to.h || VB_NODE_H;
  const x1 = from.x + fw / 2, y1 = from.y + fh / 2;
  const x2 = to.x + tw / 2,   y2 = to.y + th / 2;
  const dx = x2 - x1, dy = y2 - y1;

  // Route: auto = curved Bezier, ortho = right-angle
  let d;
  if ((conn.route || "auto") === "ortho") {
    const mx = x1 + dx / 2;
    d = "M " + x1 + " " + y1 + " L " + mx + " " + y1 + " L " + mx + " " + y2 + " L " + x2 + " " + y2;
  } else {
    d = "M " + x1 + " " + y1 + " C " + (x1 + dx * 0.4) + " " + (y1 + dy * 0.05) + ", " + (x2 - dx * 0.4) + " " + (y2 - dy * 0.05) + ", " + x2 + " " + y2;
  }

  const isSel = _vbSelected && _vbSelected.kind === "conn" && _vbSelected.id === conn.id;
  const g = _vbEl_svg("g");
  g.setAttribute("class", "vb-conn-g" + (isSel ? " vb-conn-g-sel" : ""));
  g.dataset.connId = conn.id;
  g.style.cursor = "pointer";
  g.addEventListener("click", (e) => { e.stopPropagation(); _vbSelectConn(conn.id); });

  // Wide invisible hit area — 28px makes grabbing easy without thickening the line
  const hit = _vbEl_svg("path");
  hit.setAttribute("d", d);
  hit.setAttribute("stroke", "transparent");
  hit.setAttribute("stroke-width", "28");
  hit.setAttribute("fill", "none");
  g.appendChild(hit);

  // Hover glow — shows when mouse is anywhere near the line
  const glow = _vbEl_svg("path");
  glow.setAttribute("d", d);
  glow.setAttribute("fill", "none");
  glow.setAttribute("stroke-width", "6");
  glow.setAttribute("class", "vb-conn-glow");
  g.appendChild(glow);

  const path = _vbEl_svg("path");
  path.setAttribute("d", d);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke-width", isSel ? "2.5" : "1.5");
  path.setAttribute("class", "vb-conn-path" + (isSel ? " vb-conn-sel" : ""));
  if (conn.kind === "arrow" || conn.kind === "bidir") path.setAttribute("marker-end", "url(#vb-arr-end)");
  if (conn.kind === "bidir") path.setAttribute("marker-start", "url(#vb-arr-start)");
  if ((conn.style || "solid") === "dotted") path.setAttribute("stroke-dasharray", "3 5");
  g.appendChild(path);

  return g;
}

// ── CANVAS EVENTS ─────────────────────
function _vbOnCanvasMouseDown(e) {
  const wrap = document.getElementById("vbCanvasWrap");
  if (!wrap) return;

  // Middle-mouse or Space+left → pan
  if (e.button === 1 || (e.button === 0 && _vbSpaceDown)) {
    e.preventDefault();
    _vbPanning = true;
    _vbPanSX = e.clientX; _vbPanSY = e.clientY;
    _vbPanOX = _vbPanX;   _vbPanOY = _vbPanY;
    wrap.style.cursor = "grabbing";
    return;
  }

  if (e.button !== 0) return;

  // Create-tool: start drag-to-size
  const _VB_CREATE_TOOLS = ["node", "sticky", "goal", "text", "image"];
  if (_VB_CREATE_TOOLS.includes(_vbTool)) {
    e.preventDefault();
    const wrap = document.getElementById("vbCanvasWrap");
    const cp = _vbScreenToCanvas(e.clientX, e.clientY);
    const preview = _vbEl("div", "vb-create-preview");
    preview.style.left   = cp.x + "px";
    preview.style.top    = cp.y + "px";
    preview.style.width  = "0px";
    preview.style.height = "0px";
    const stage = document.getElementById("vbStage");
    if (stage) stage.appendChild(preview);
    _vbCreateDrag = { x0: cp.x, y0: cp.y, tool: _vbTool, preview };
    _vbMoved = false;
    return;
  }

  if (_vbTool !== "select") return;

  // Only act on background (not a node or connection group)
  const tgt = e.target;
  const stage = document.getElementById("vbStage");
  const isBackground = tgt === wrap || tgt === stage
    || tgt === document.getElementById("vbSvg")
    || (tgt.closest && !tgt.closest(".vb-node") && !tgt.closest(".vb-conn-g"));
  if (!isBackground) return;

  e.preventDefault();

  // Shift+drag → rubber-band selection; plain drag → pan
  if (e.shiftKey) {
    const rect = wrap.getBoundingClientRect();
    _vbRbX0 = e.clientX - rect.left;
    _vbRbY0 = e.clientY - rect.top;
    _vbRbActive = true;
    _vbMoved = false;

    let rb = document.getElementById("vbRubberBand");
    if (!rb) {
      rb = _vbEl("div", "vb-rubber-band");
      rb.id = "vbRubberBand";
      wrap.appendChild(rb);
    }
    rb.style.left    = _vbRbX0 + "px";
    rb.style.top     = _vbRbY0 + "px";
    rb.style.width   = "0px";
    rb.style.height  = "0px";
    rb.style.display = "block";
  } else {
    // Background left-drag = pan (map-style)
    _vbPanning = true;
    _vbPanSX = e.clientX; _vbPanSY = e.clientY;
    _vbPanOX = _vbPanX;   _vbPanOY = _vbPanY;
    wrap.style.cursor = "grabbing";
  }
}

function _vbOnCanvasClick(e) {
  const tgt = e.target;
  const wrap = document.getElementById("vbCanvasWrap");
  const stage = document.getElementById("vbStage");
  const isCanvas = tgt === wrap || tgt === stage || tgt === document.getElementById("vbSvg");
  if (!isCanvas) return;

  if (_vbTool === "connect" || _vbTool === "arrow") {
    _vbConnStart = null;
    _vbRenderNodes();
    return;
  }

  if (_vbTool === "node" || _vbTool === "sticky" || _vbTool === "goal" || _vbTool === "text") {
    const cp = _vbScreenToCanvas(e.clientX, e.clientY);
    _vbAddNode(_vbTool, Math.max(0, Math.round(cp.x - VB_NODE_W / 2)), Math.max(0, Math.round(cp.y - VB_NODE_H / 2)));
    return;
  }

  if (_vbTool === "image") {
    const cp = _vbScreenToCanvas(e.clientX, e.clientY);
    _vbPickImage(Math.max(0, Math.round(cp.x - VB_NODE_W / 2)), Math.max(0, Math.round(cp.y - VB_NODE_H / 2)));
    return;
  }

  // select tool: clear selection if no rubber-band drag happened
  if (!_vbMoved) {
    _vbSelected = null;
    _vbMultiSel = [];
    _vbConnStart = null;
    _vbRenderAll();
  }
}

function _vbOnMouseMove(e) {
  // Create-drag preview
  if (_vbCreateDrag) {
    const cp = _vbScreenToCanvas(e.clientX, e.clientY);
    const x = Math.min(cp.x, _vbCreateDrag.x0);
    const y = Math.min(cp.y, _vbCreateDrag.y0);
    const w = Math.abs(cp.x - _vbCreateDrag.x0);
    const h = Math.abs(cp.y - _vbCreateDrag.y0);
    if (w > 4 || h > 4) _vbMoved = true;
    const pr = _vbCreateDrag.preview;
    pr.style.left   = x + "px";
    pr.style.top    = y + "px";
    pr.style.width  = w + "px";
    pr.style.height = h + "px";
    return;
  }

  // Pan
  if (_vbPanning) {
    _vbPanX = _vbPanOX + (e.clientX - _vbPanSX);
    _vbPanY = _vbPanOY + (e.clientY - _vbPanSY);
    _vbApplyTransform();
    return;
  }

  // Resize
  if (_vbResizeId) {
    const cp = _vbScreenToCanvas(e.clientX, e.clientY);
    const board = _vbGetBoard();
    const n = board?.nodes.find((nn) => nn.id === _vbResizeId);
    if (n) {
      const dx = cp.x - _vbResizeSX;
      const dy = cp.y - _vbResizeSY;
      if (_vbResizeDir.includes("e")) n.w = Math.max(80, Math.round(_vbResizeOW + dx));
      if (_vbResizeDir.includes("s")) n.h = Math.max(40, Math.round(_vbResizeOH + dy));
      const el = document.getElementById("vbn_" + n.id);
      if (el) {
        el.style.width = n.w + "px";
        if (n.kind !== "text") el.style.minHeight = n.h + "px";
      }
      _vbRenderConnections();
    }
    return;
  }

  // Rubber-band drag
  if (_vbRbActive) {
    _vbMoved = true;
    const wrap = document.getElementById("vbCanvasWrap");
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const cx = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const cy = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    const x = Math.min(cx, _vbRbX0), y = Math.min(cy, _vbRbY0);
    const w = Math.abs(cx - _vbRbX0), h = Math.abs(cy - _vbRbY0);
    const rb = document.getElementById("vbRubberBand");
    if (rb) {
      rb.style.left   = x + "px";
      rb.style.top    = y + "px";
      rb.style.width  = w + "px";
      rb.style.height = h + "px";
    }
    return;
  }

  if (!_vbDragId) return;
  _vbMoved = true;
  _vbMx = e.clientX;
  _vbMy = e.clientY;
  if (_vbRaf) return;
  _vbRaf = requestAnimationFrame(() => {
    _vbRaf = null;
    if (!_vbDragId) return;
    const board = _vbGetBoard();
    if (!board) return;
    const cp = _vbScreenToCanvas(_vbMx, _vbMy);
    const moveIds = _vbMultiSel.length > 0 ? _vbMultiSel : [_vbDragId];
    const lead = board.nodes.find((n) => n.id === _vbDragId);
    if (!lead) return;
    const newX = Math.max(0, Math.round(cp.x - _vbDragOx));
    const newY = Math.max(0, Math.round(cp.y - _vbDragOy));
    const offX = newX - lead.x;
    const offY = newY - lead.y;
    moveIds.forEach((id) => {
      const n = board.nodes.find((nn) => nn.id === id);
      if (!n) return;
      n.x = Math.max(0, n.x + offX);
      n.y = Math.max(0, n.y + offY);
      const el = document.getElementById("vbn_" + id);
      if (el) { el.style.left = n.x + "px"; el.style.top = n.y + "px"; }
    });
    _vbRenderConnections();
  });
}

function _vbOnMouseUp(e) {
  // Create-drag: finalize node
  if (_vbCreateDrag) {
    const { x0, y0, tool, preview } = _vbCreateDrag;
    _vbCreateDrag = null;
    if (preview && preview.parentNode) preview.parentNode.removeChild(preview);

    const cp = _vbScreenToCanvas(e.clientX, e.clientY);
    const rawW = Math.abs(cp.x - x0);
    const rawH = Math.abs(cp.y - y0);
    const nodeX = Math.max(0, Math.round(Math.min(cp.x, x0)));
    const nodeY = Math.max(0, Math.round(Math.min(cp.y, y0)));

    const _vbSwitchToSelect = () => {
      _vbTool = "select";
      const wrap2 = document.getElementById("vbCanvasWrap");
      if (wrap2) wrap2.dataset.tool = "select";
      document.querySelectorAll(".vb-tool-btn").forEach((b) => b.classList.remove("active"));
      document.querySelector('.vb-tool-btn[data-tool="select"]')?.classList.add("active");
    };

    if (tool === "image") {
      _vbSwitchToSelect();
      _vbMoved = true;
      _vbPickImage(nodeX, nodeY);
      return;
    }

    const forceW = rawW > 20 ? Math.round(rawW) : null;
    const forceH = rawH > 20 ? Math.round(rawH) : null;
    _vbAddNode(tool, nodeX, nodeY, forceW, forceH);
    _vbSwitchToSelect();
    _vbMoved = true;
    return;
  }

  // Pan end
  if (_vbPanning) {
    _vbPanning = false;
    const wrap = document.getElementById("vbCanvasWrap");
    if (wrap) wrap.style.cursor = _vbSpaceDown ? "grab" : "";
    return;
  }

  // Resize end
  if (_vbResizeId) {
    _vbSave();
    _vbResizeId = null;
    _vbResizeDir = null;
    return;
  }

  // Rubber-band: finish selection
  if (_vbRbActive) {
    _vbRbActive = false;
    const rb = document.getElementById("vbRubberBand");
    if (rb) rb.style.display = "none";

    if (_vbMoved) {
      const wrap = document.getElementById("vbCanvasWrap");
      if (wrap && rb) {
        // Rubber-band coords are in screen-space (relative to wrap).
        // Convert to canvas-space for accurate node hit-testing.
        const rbL = parseFloat(rb.style.left);
        const rbT = parseFloat(rb.style.top);
        const rbR = rbL + parseFloat(rb.style.width);
        const rbB = rbT + parseFloat(rb.style.height);

        if ((rbR - rbL) > 4 || (rbB - rbT) > 4) {
          // Convert rubber-band corners to canvas space
          const ca = _vbScreenToCanvas(wrap.getBoundingClientRect().left + rbL, wrap.getBoundingClientRect().top + rbT);
          const cb = _vbScreenToCanvas(wrap.getBoundingClientRect().left + rbR, wrap.getBoundingClientRect().top + rbB);
          const board = _vbGetBoard();
          if (board) {
            _vbMultiSel = board.nodes.filter((n) => {
              const cx = n.x + (n.w || VB_NODE_W) / 2;
              const cy = n.y + (n.h || VB_NODE_H) / 2;
              return cx >= ca.x && cx <= cb.x && cy >= ca.y && cy <= cb.y;
            }).map((n) => n.id);
            if (_vbMultiSel.length) {
              _vbSelected = null;
              _vbRenderNodes();
              showToast(_vbMultiSel.length + " Nodes ausgewählt", "info", 1500);
            }
          }
        }
      }
    }
    return;
  }

  if (!_vbDragId) return;
  cancelAnimationFrame(_vbRaf);
  _vbRaf = null;
  const el = document.getElementById("vbn_" + _vbDragId);
  if (el) el.classList.remove("vb-dragging");
  _vbDragId = null;
  _vbSave();
  const mmWrap = document.querySelector(".vb-props-minimap-wrap") || document.querySelector(".vb-minimap-wrap");
  if (mmWrap) { _vbClear(mmWrap); _vbAppendMinimap(mmWrap); }
}

function _vbOnSpaceDown(e) {
  if (e.key !== " ") return;
  const tag = e.target?.tagName;
  const ce = e.target?.contentEditable;
  if (tag === "INPUT" || tag === "TEXTAREA" || ce === "true") return;
  e.preventDefault();
  if (_vbSpaceDown) return;
  _vbSpaceDown = true;
  const wrap = document.getElementById("vbCanvasWrap");
  if (wrap && !_vbPanning) wrap.style.cursor = "grab";
}

function _vbOnSpaceUp(e) {
  if (e.key !== " ") return;
  _vbSpaceDown = false;
  if (!_vbPanning) {
    const wrap = document.getElementById("vbCanvasWrap");
    if (wrap) {
      // Restore tool-appropriate cursor
      wrap.style.cursor = "";
      wrap.dataset.tool = _vbTool; // triggers CSS cursor rules
    }
  }
}

function _vbOnKeyDown(e) {
  const pg = document.getElementById("p-vision");
  if (!pg?.classList.contains("active")) return;
  const tag = e.target?.tagName;
  const ce = e.target?.contentEditable;
  if (tag === "INPUT" || tag === "TEXTAREA" || ce === "true") return;
  if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); _vbDeleteSelected(); }
  if (e.key === "Escape") {
    _vbSelected = null; _vbMultiSel = []; _vbConnStart = null; _vbRenderAll();
  }
  // Ctrl+A → select all nodes
  if ((e.ctrlKey || e.metaKey) && e.key === "a") {
    const pg = document.getElementById("p-vision");
    if (!pg || !pg.classList.contains("active")) return;
    e.preventDefault();
    const board = _vbGetBoard();
    if (board) { _vbMultiSel = board.nodes.map((n) => n.id); _vbSelected = null; _vbRenderNodes(); }
  }
}

// ── CONNECT ───────────────────────────
function _vbHandleConnectClick(nodeId) {
  if (!_vbConnStart) {
    _vbConnStart = nodeId;
    _vbRenderNodes();
    showToast("Zweiten Node klicken zum Verbinden", "info", 2000);
  } else if (_vbConnStart === nodeId) {
    _vbConnStart = null;
    _vbRenderNodes();
  } else {
    const board = _vbGetBoard();
    if (!board) return;
    board.connections.push({ id: _vbGenId("vc"), fromId: _vbConnStart, toId: nodeId, kind: "arrow" });
    _vbConnStart = null;
    _vbSave();
    _vbRenderAll();
    showToast("Verbindung erstellt", "success", 1500);
  }
}

// ── NODE AKTIONEN ─────────────────────
function _vbSelectNode(id) { _vbSelected = { kind: "node", id }; _vbRenderAll(); }
function _vbSelectConn(id) { _vbSelected = { kind: "conn", id }; _vbRenderAll(); }

function _vbAddNode(kind, x, y, forceW, forceH) {
  const board = _vbGetBoard();
  if (!board) return;
  const kindMap = { text: "text", node: "standard", sticky: "sticky", goal: "goal", image: "image" };
  const nk = kindMap[kind] || "standard";
  const _nkW = nk === "goal" ? 240 : nk === "image" ? 200 : VB_NODE_W;
  const _nkH = nk === "goal" ? 160 : nk === "image" ? 150 : nk === "text" ? 40 : VB_NODE_H;
  const node = {
    id: _vbGenId("vbn"),
    kind: nk,
    x, y,
    w: forceW || _nkW,
    h: forceH || _nkH,
    label: "",
    title: nk === "sticky" ? "Sticky Note" : nk === "goal" ? "Mein Ziel" : nk === "text" ? "Text" : "Node",
    note: "",
    color: VB_COLORS[board.nodes.length % VB_COLORS.length],
    size: "M",
  };
  board.nodes.push(node);
  _vbSelected = { kind: "node", id: node.id };
  _vbSave();
  _vbRenderAll();
}

function _vbPickImage(x, y) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const board = _vbGetBoard();
      if (!board) return;
      board.nodes.push({
        id: _vbGenId("vbn"), kind: "image", x, y,
        w: 200, h: 150, label: "",
        title: file.name.replace(/\.[^.]+$/, ""),
        note: "", color: VB_COLORS[board.nodes.length % VB_COLORS.length],
        size: "M", imgSrc: ev.target.result,
      });
      _vbSave();
      _vbRenderAll();
    };
    reader.readAsDataURL(file);
  });
  input.click();
}

function _vbDeleteSelected() {
  const board = _vbGetBoard();
  if (!board) return;

  // Multi-selection delete
  if (_vbMultiSel.length) {
    const ids = new Set(_vbMultiSel);
    const count = ids.size;
    board.nodes = board.nodes.filter((n) => !ids.has(n.id));
    board.connections = board.connections.filter((c) => !ids.has(c.fromId) && !ids.has(c.toId));
    _vbMultiSel = [];
    _vbSelected = null;
    _vbSave();
    _vbRenderAll();
    showToast(count + " Nodes gelöscht", "info", 1500);
    return;
  }

  if (!_vbSelected) return;
  if (_vbSelected.kind === "node") {
    board.nodes = board.nodes.filter((n) => n.id !== _vbSelected.id);
    board.connections = board.connections.filter(
      (c) => c.fromId !== _vbSelected.id && c.toId !== _vbSelected.id,
    );
  } else {
    board.connections = board.connections.filter((c) => c.id !== _vbSelected.id);
  }
  _vbSelected = null;
  _vbSave();
  _vbRenderAll();
  showToast("Gelöscht", "info", 1200);
}

// ── EXPORT ────────────────────────────
function _vbExport() {
  const board = _vbGetBoard();
  if (!board) return;
  showToast("Export wird vorbereitet\u2026", "info", 2000);

  if (typeof html2canvas === "function") {
    const wrap = document.getElementById("vbCanvasWrap");
    html2canvas(wrap, { backgroundColor: "#0e0e0e", useCORS: true, logging: false })
      .then((canvas) => {
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = (board.name || "board").replace(/[^a-z0-9]/gi, "_") + ".png";
        a.click();
        showToast("Exportiert als PNG", "success");
      })
      .catch(_vbExportSvg);
  } else {
    _vbExportSvg();
  }
}

function _vbExportSvg() {
  const board = _vbGetBoard();
  if (!board) return;
  const maxX = board.nodes.reduce((m, n) => Math.max(m, n.x + (n.w || VB_NODE_W)), 600) + 40;
  const maxY = board.nodes.reduce((m, n) => Math.max(m, n.y + (n.h || VB_NODE_H)), 400) + 40;

  const svg = _vbEl_svg("svg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("width", maxX);
  svg.setAttribute("height", maxY);

  const bg = _vbEl_svg("rect");
  bg.setAttribute("width", maxX);
  bg.setAttribute("height", maxY);
  bg.setAttribute("fill", "#0e0e0e");
  svg.appendChild(bg);

  board.connections.forEach((conn) => {
    const f = board.nodes.find((n) => n.id === conn.fromId);
    const t = board.nodes.find((n) => n.id === conn.toId);
    if (!f || !t) return;
    const x1 = f.x + (f.w || VB_NODE_W) / 2, y1 = f.y + (f.h || VB_NODE_H) / 2;
    const x2 = t.x + (t.w || VB_NODE_W) / 2, y2 = t.y + (t.h || VB_NODE_H) / 2;
    const dx = x2 - x1, dy = y2 - y1;
    const path = _vbEl_svg("path");
    const mx = x1 + dx / 2;
    const svgD = (conn.route || "auto") === "ortho"
      ? "M " + x1 + " " + y1 + " L " + mx + " " + y1 + " L " + mx + " " + y2 + " L " + x2 + " " + y2
      : "M " + x1 + " " + y1 + " C " + (x1+dx*0.4) + " " + (y1+dy*0.05) + ", " + (x2-dx*0.4) + " " + (y2-dy*0.05) + ", " + x2 + " " + y2;
    path.setAttribute("d", svgD);
    if ((conn.style || "solid") === "dotted") path.setAttribute("stroke-dasharray", "3 5");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#6b7280");
    path.setAttribute("stroke-width", "1.5");
    svg.appendChild(path);
  });

  board.nodes.forEach((n) => {
    const rect = _vbEl_svg("rect");
    rect.setAttribute("x", n.x);
    rect.setAttribute("y", n.y);
    rect.setAttribute("width", n.w || VB_NODE_W);
    rect.setAttribute("height", n.h || VB_NODE_H);
    rect.setAttribute("rx", "10");
    rect.setAttribute("fill", (n.color || "#00c896") + "22");
    rect.setAttribute("stroke", n.color || "#00c896");
    rect.setAttribute("stroke-width", "2");
    svg.appendChild(rect);
    if (n.title) {
      const text = _vbEl_svg("text");
      text.setAttribute("x", n.x + (n.w || VB_NODE_W) / 2);
      text.setAttribute("y", n.y + (n.h || VB_NODE_H) / 2 + 4);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", "#e0e0e0");
      text.setAttribute("font-size", "12");
      text.setAttribute("font-family", "system-ui,sans-serif");
      text.textContent = n.title;
      svg.appendChild(text);
    }
  });

  const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = (board.name || "board").replace(/[^a-z0-9]/gi, "_") + ".svg";
  a.click();
  URL.revokeObjectURL(url);
  showToast("Als SVG exportiert", "success");
}

// ── SVG ICONS ─────────────────────────
function _vbSvgIcon(name, size) {
  const pathMap = {
    "mouse-pointer": "M5 3l14 9-7 1-4 7L5 3z",
    "type":          "M4 7V4h16v3M9 20h6M12 4v16",
    "square":        "M3 3h18v18H3z",
    "image":         "M21 19H3V5h18v14zM3 14l5-5 4 4 3-3 6 6",
    "git-merge":     "M18 21a3 3 0 100-6 3 3 0 000 6zM6 3a3 3 0 100 6 3 3 0 000-6zM6 9v3a9 9 0 009 9",
    "arrow-right":   "M5 12h14M12 5l7 7-7 7",
    "file-text":     "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
    "target":        "M12 22a10 10 0 100-20 10 10 0 000 20zM12 18a6 6 0 100-12 6 6 0 000 12zM12 14a2 2 0 100-4 2 2 0 000 4z",
    "trash-2":       "M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6",
    "plus":          "M12 5v14M5 12h14",
    "download":      "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
    "edit-2":        "M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z",
    "x":             "M18 6L6 18M6 6l12 12",
    "check-square":       "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
    "panel-right-close":  "M3 3h18v18H3zM15 3v18M19 9l-3 3 3 3",
    "panel-right-open":   "M3 3h18v18H3zM15 3v18M11 9l3 3-3 3",
    "info":       "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-10v4m0-7v.01",
    "keyboard":   "M20 5H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2zM8 10h2m4 0h2M6 14h12m-9-4h.01m4-.01h.01",
    "navigation": "M12 2L2 22l10-5 10 5L12 2z",
    "layers":     "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  };
  const svg = _vbEl_svg("svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("width", size || 16);
  svg.setAttribute("height", size || 16);
  svg.style.flexShrink = "0";
  const p = _vbEl_svg("path");
  p.setAttribute("d", pathMap[name] || "M12 12h.01");
  svg.appendChild(p);
  return svg;
}

// ── DASHBOARD PREVIEW ─────────────────
function _vbDashPreview(containerEl) {
  if (!containerEl) return;
  _vbLoad();
  if (!_vbBoards.length) return;

  const board = (_vbCurId && _vbBoards.find((b) => b.id === _vbCurId)) || _vbBoards[0];

  const card = _vbEl("div", "vb-dash-card");
  card.style.cursor = "pointer";
  card.addEventListener("mouseenter", () => { if (typeof _showTooltip === "function") _showTooltip("VisionBoard öffnen", card); });
  card.addEventListener("mouseleave", () => { if (typeof _hideTooltip === "function") _hideTooltip(); });
  card.addEventListener("click", () => {
    _vbCurId = board.id;
    const navEl = document.querySelector(".nav-item[onclick*=\"'vision'\"]");
    if (navEl) nav(navEl, "vision");
  });

  const head = _vbEl("div", "vb-dash-card-head");
  head.appendChild(_vbSvgIcon("target", 13));
  const ttl = _vbEl("span", "vb-dash-card-title");
  ttl.textContent = " " + board.name;
  head.appendChild(ttl);
  const meta = _vbEl("span", "vb-dash-card-meta");
  meta.textContent = board.nodes.length + " Nodes";
  head.appendChild(meta);
  card.appendChild(head);

  const preview = _vbEl("div", "vb-dash-preview");
  const canvas = document.createElement("canvas");
  canvas.width = 260;
  canvas.height = 72;
  preview.appendChild(canvas);
  card.appendChild(preview);
  containerEl.appendChild(card);

  // Draw minimap
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, 260, 72);
  if (board.nodes.length) {
    const xs = board.nodes.map((n) => n.x);
    const ys = board.nodes.map((n) => n.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...board.nodes.map((n) => n.x + (n.w || VB_NODE_W)));
    const maxY = Math.max(...board.nodes.map((n) => n.y + (n.h || VB_NODE_H)));
    const scale = Math.min(260 / (maxX - minX + 40 || 1), 72 / (maxY - minY + 40 || 1), 0.75);
    const ox = (260 - (maxX - minX) * scale) / 2;
    const oy = (72 - (maxY - minY) * scale) / 2;
    board.nodes.forEach((n) => {
      ctx.fillStyle = (n.color || "#00c896") + "55";
      ctx.strokeStyle = n.color || "#00c896";
      ctx.lineWidth = 1;
      const rx = ox + (n.x - minX) * scale;
      const ry = oy + (n.y - minY) * scale;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(rx, ry, (n.w || VB_NODE_W) * scale, (n.h || VB_NODE_H) * scale, 2);
      else ctx.rect(rx, ry, (n.w || VB_NODE_W) * scale, (n.h || VB_NODE_H) * scale);
      ctx.fill();
      ctx.stroke();
    });
  }
}
