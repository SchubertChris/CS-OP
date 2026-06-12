// ══════════════════════════════════════
//  ARCHIV v4 — Eigenständig
//  Kategorien · Optional verknüpft
//  Vorschau · Drag & Drop · Print
// ══════════════════════════════════════

const ARCHIVE_CATEGORIES = [
  { id: "verträge", label: "Verträge", icon: "📄", color: "#4d9eff" },
  {
    id: "versicherungen",
    label: "Versicherungen",
    icon: "🛡️",
    color: "#00c87a",
  },
  {
    id: "legitimationen",
    label: "Legitimationen",
    icon: "🪪",
    color: "#c9a84c",
  },
  { id: "karten", label: "Karten & Konten", icon: "💳", color: "#7b5fff" },
  { id: "rechnungen", label: "Rechnungen", icon: "🧾", color: "#ff9f43" },
  { id: "lohn", label: "Lohn & Gehalt", icon: "💼", color: "#00d4cc" },
  { id: "eingänge", label: "Eingänge & Post", icon: "📬", color: "#fd79a8" },
  { id: "fotos", label: "Fotos & Scans", icon: "🖼️", color: "#a29bfe" },
  { id: "sonstiges", label: "Sonstiges", icon: "📁", color: "#636e72" },
];

function archiveCat(id) {
  return ARCHIVE_CATEGORIES.find((c) => c.id === id) || ARCHIVE_CATEGORIES[8];
}
function archiveFileIcon(ext) {
  const e = (ext || "").toLowerCase().replace(".", "");
  if (e === "pdf") return "📄";
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(e)) return "🖼️";
  if (["doc", "docx"].includes(e)) return "📝";
  if (["xls", "xlsx"].includes(e)) return "📊";
  if (["zip", "rar", "7z"].includes(e)) return "🗜️";
  if (["txt", "md"].includes(e)) return "📃";
  return "📎";
}
function archiveIsPreviewable(ext) {
  return ["pdf", "png", "jpg", "jpeg", "webp", "gif"].includes(
    (ext || "").toLowerCase().replace(".", ""),
  );
}
function archiveFormatSize(b) {
  if (!b) return "—";
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  return (b / 1048576).toFixed(1) + " MB";
}
function archiveFormatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ══════════════════════════════════════
//  ARCHIV — EIGENE SEITE (Explorer-Layout)
// ══════════════════════════════════════
let _archActiveCat = null;
let _archSortBy    = "date";   // "date" | "name" | "size"
let _archSortDir   = -1;       // -1 = desc, 1 = asc
let _archAllDocs   = [];

async function renderArchivePage() {
  const page = document.getElementById("p-archiv");
  if (!page) return;

  const _svgUpload = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`;

  page.innerHTML = `
    <div class="ph page-hdr">
      <div>
        <div class="ph-title">Archiv</div>
        <div class="ph-sub" id="archPageSub">Lade…</div>
      </div>
      <div id="archPageActions" style="display:none;gap:8px;align-items:center">
        <button class="btn primary" id="archUploadBtn" onclick="_archiveUploadNew(_archActiveCat||undefined)">
          ${_svgUpload}&nbsp; Hochladen
        </button>
      </div>
    </div>
    <div id="archivePageBody" class="arch-page-body">
      <div class="arch-loading">Lade Archiv…</div>
    </div>`;

  const body = document.getElementById("archivePageBody");

  if (!window.csf?.archive) {
    document.getElementById("archPageSub").textContent = "Nur in der Desktop-App verfügbar";
    body.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📱</div>
        <div class="empty-title">Archiv nicht verfügbar</div>
        <div class="empty-sub">Das Dokumentenarchiv ist nur in der Electron-Desktop-App verfügbar.</div>
      </div>`;
    return;
  }

  document.getElementById("archPageActions").style.display = "flex";

  let docs = [], sizeInfo = { bytes: 0 };
  try {
    [docs, sizeInfo] = await Promise.all([
      window.csf.archive.list().catch(() => []),
      window.csf.archive.size().catch(() => ({ bytes: 0 })),
    ]);
  } catch (e) {
    body.innerHTML = `<div class="arch-unavailable">Fehler beim Laden des Archivs.</div>`;
    return;
  }

  _archAllDocs = docs;

  // Ablauf-Warnung beim Seitenaufruf — einmal pro Session+Tag
  const _archNow = new Date();
  const _archExpKey = "csf_arch_exp_warned_" + _archNow.toISOString().slice(0, 10);
  if (!sessionStorage.getItem(_archExpKey)) {
    sessionStorage.setItem(_archExpKey, "1");
    const expired  = docs.filter(d => d.expires && new Date(d.expires) < _archNow);
    const expiring = docs.filter(d => {
      if (!d.expires) return false;
      const diff = Math.ceil((new Date(d.expires) - _archNow) / 86400000);
      return diff >= 0 && diff <= 30;
    });
    if (expired.length)
      showToast(`${expired.length} Dokument${expired.length !== 1 ? "e" : ""} abgelaufen`, "warning", 5000);
    else if (expiring.length)
      showToast(`${expiring.length} Dokument${expiring.length !== 1 ? "e" : ""} laufen bald ab`, "info", 4000);
  }

  const totalMB = (sizeInfo.bytes / 1048576).toFixed(1);
  const byCat = {};
  docs.forEach((d) => {
    const k = d.category || "sonstiges";
    if (!byCat[k]) byCat[k] = [];
    byCat[k].push(d);
  });

  document.getElementById("archPageSub").textContent =
    `${docs.length} Dokument${docs.length !== 1 ? "e" : ""} · ${totalMB} MB · ${Object.keys(byCat).length} Kategorien`;

  // ── KPI-Zeile ──
  const linkedCount = docs.filter((d) => d.refId).length;
  const kpiHtml = [
    { val: docs.length,                    lbl: "Dokumente",       icon: "📄" },
    { val: totalMB + " MB",                lbl: "Gesamt",          icon: "💾" },
    { val: Object.keys(byCat).length,      lbl: "Kategorien aktiv",icon: "📂" },
    { val: linkedCount,                    lbl: "Verknüpft",       icon: "🔗" },
  ].map(s => `
    <div class="arch-kpi-card">
      <div class="arch-kpi-icon">${s.icon}</div>
      <div class="arch-kpi-val">${s.val}</div>
      <div class="arch-kpi-lbl">${s.lbl}</div>
    </div>`).join("");

  // ── Explorer-Layout ──
  const sidebarItems = ARCHIVE_CATEGORIES.map((cat) => {
    const cnt = (byCat[cat.id] || []).length;
    const isActive = _archActiveCat === cat.id;
    return `
      <div class="arch-exp-cat${isActive ? " active" : ""}" data-catid="${cat.id}"
        onclick="_archShowCatDocs('${cat.id}')" style="--cat-color:${cat.color}">
        <span class="arch-exp-cat-icon">${cat.icon}</span>
        <span class="arch-exp-cat-label">${cat.label}</span>
        ${cnt ? `<span class="arch-exp-cat-count">${cnt}</span>` : ""}
      </div>`;
  }).join("");

  body.innerHTML = `
    <div class="arch-page-kpis">${kpiHtml}</div>
    <div class="arch-explorer">
      <div class="arch-exp-sidebar">
        <div class="arch-exp-sidebar-head">Kategorien</div>
        ${sidebarItems}
      </div>
      <div class="arch-exp-main" id="archExplorerMain">
        <div class="arch-exp-placeholder">
          <div style="font-size:2em;margin-bottom:10px">📂</div>
          Kategorie auswählen
        </div>
      </div>
    </div>`;

  // Aktive Kategorie wiederherstellen oder erste mit Docs öffnen
  const restoreCat = _archActiveCat
    || (ARCHIVE_CATEGORIES.find(c => (byCat[c.id] || []).length > 0) || ARCHIVE_CATEGORIES[0])?.id;
  if (restoreCat) _archShowCatDocs(restoreCat);
}

function _archShowCatDocs(catId) {
  _archActiveCat = catId;
  // Aktiv-Klasse im Sidebar setzen
  document.querySelectorAll(".arch-exp-cat").forEach(el => {
    el.classList.toggle("active", el.dataset.catid === catId);
  });

  const main = document.getElementById("archExplorerMain");
  if (!main) return;

  const cat = archiveCat(catId);
  const rawDocs = _archAllDocs.filter(d => (d.category || "sonstiges") === catId);

  // Sortieren
  const sorted = [...rawDocs].sort((a, b) => {
    if (_archSortBy === "name") {
      return _archSortDir * (a.name || "").localeCompare(b.name || "", "de");
    } else if (_archSortBy === "size") {
      return _archSortDir * ((a.size || 0) - (b.size || 0));
    } else {
      // date
      return _archSortDir * (new Date(a.addedAt || 0) - new Date(b.addedAt || 0));
    }
  });

  const _svgUpload = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`;

  const sortBtns = [
    { id: "date", label: "Datum" },
    { id: "name", label: "Name" },
    { id: "size", label: "Größe" },
  ].map(s => {
    const isActive = _archSortBy === s.id;
    const arrow = isActive ? (_archSortDir === -1 ? " ↓" : " ↑") : "";
    return `<button class="arch-sort-btn${isActive ? " active" : ""}"
      onclick="_archSetSort('${s.id}')">${s.label}${arrow}</button>`;
  }).join("");

  const docsHtml = sorted.length
    ? `<div class="arch-cat-list">${sorted.map(doc => _archiveCatTile(doc, catId)).join("")}</div>`
    : `<div class="arch-ov-empty">
        <div style="font-size:2em;margin-bottom:10px">${cat.icon}</div>
        Noch keine Dokumente.<br>
        <button class="btn" style="margin-top:12px" onclick="_archiveUploadNew('${catId}')">Jetzt hochladen</button>
       </div>`;

  main.innerHTML = `
    <div class="arch-exp-main-header">
      <div class="arch-exp-main-title">
        <span style="font-size:1.1em">${cat.icon}</span>
        <span>${cat.label}</span>
        ${rawDocs.length ? `<span class="arch-count">${rawDocs.length}</span>` : ""}
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        <div class="arch-sort-bar">${sortBtns}</div>
        <button class="btn sm" onclick="_archiveUploadNew('${catId}')">${_svgUpload}&nbsp;Hochladen</button>
      </div>
    </div>
    ${docsHtml}`;

  // Bild-Vorschau lazy
  sorted.forEach((doc) => {
    const isImg = ["png", "jpg", "jpeg", "webp", "gif"].includes((doc.ext || "").toLowerCase());
    if (!isImg) return;
    const wrap = document.getElementById("archimgwrap_" + doc.id);
    if (!wrap) return;
    window.csf.archive.getPath(doc.relPath).then((r) => {
      if (!r?.ok) return;
      const url = "file:///" + r.path.replace(/\\/g, "/");
      wrap.innerHTML = `<img src="${url}" class="arch-tile-img" onerror="this.parentNode.innerHTML='🖼️'">`;
    });
  });
}

function _archSetSort(by) {
  if (_archSortBy === by) {
    _archSortDir = _archSortDir === -1 ? 1 : -1;
  } else {
    _archSortBy = by;
    _archSortDir = -1;
  }
  if (_archActiveCat) _archShowCatDocs(_archActiveCat);
}

// Rückwärtskompatibel — Topbar-Button nutzt jetzt _navTo('archiv')
function openArchiveOverview() {
  if (typeof _navTo === "function") _navTo("archiv");
}

function closeArchiveOverview() {
  // Kein Overlay mehr — kein Schließen nötig
}

// ══════════════════════════════════════
//  NEUES DOKUMENT HOCHLADEN
//  Kategorie wählen → Name vergeben → optional Posten verknüpfen
// ══════════════════════════════════════
async function _archiveUploadNew(preselectedCat) {
  // Schritt 1: Kategorie wählen (falls nicht vorausgewählt)
  const catId = preselectedCat || (await _archivePickCategory());
  if (!catId) return;

  // Schritt 2: Datei auswählen
  const result = await window.csf.archive.add(null, "free", null, catId);
  if (result?.canceled || !result?.ok) return;

  // Schritt 3: Für jede Datei — Name vergeben + optional Posten verknüpfen
  for (const doc of result.added || []) {
    await _archiveNameAndLink(doc.id, doc.name, catId);
  }

  // Übersicht neu laden
  await renderArchivePage();
}

async function _archivePickCategory() {
  return new Promise((resolve) => {
    // Kategorie-Picker Modal
    const picker = document.createElement("div");
    picker.id = "archCatPicker";
    picker.className = "arch-cat-picker-overlay";
    picker.onclick = (e) => {
      if (e.target === picker) {
        picker.remove();
        resolve(null);
      }
    };
    picker.innerHTML = `
      <div class="arch-cat-picker">
        <div class="arch-cat-picker-title">Kategorie wählen</div>
        <div class="arch-cat-picker-grid">
          ${ARCHIVE_CATEGORIES.map(
            (cat) => `
            <div class="arch-cat-picker-item" onclick="
              document.getElementById('archCatPicker').remove();
              window._archiveCatResolve('${cat.id}')
            " style="--cat-color:${cat.color}">
              <span style="font-size:1.6em">${cat.icon}</span>
              <span style="font-size:.72em;font-weight:700;color:${cat.color}">${cat.label}</span>
            </div>`,
          ).join("")}
        </div>
      </div>`;
    document.body.appendChild(picker);
    requestAnimationFrame(() => picker.classList.add("open"));
    window._archiveCatResolve = (id) => {
      resolve(id);
    };
  });
}

async function _archiveNameAndLink(docId, originalName, catId) {
  const ext = originalName.includes(".") ? "." + originalName.split(".").pop() : "";
  const nameWithout = originalName.replace(/\.[^.]+$/, "");
  const cat = archiveCat(catId);

  const postenOpts = (S?.data || []).map(p => {
    const acc = (S.accounts || []).find(a => a.id === p.accountId);
    const accLabel = acc ? ` · ${acc.label}` : "";
    return `<option value="${p.id}">${p.type === "einnahme" ? "↑" : "↓"} ${esc(p.name)}${accLabel}</option>`;
  }).join("");

  return new Promise((resolve) => {
    document.getElementById("archUploadModal")?.remove();

    const ov = document.createElement("div");
    ov.id = "archUploadModal";
    ov.className = "arch-upload-overlay";
    ov.innerHTML = `
      <div class="arch-upload-modal">
        <div class="arch-upload-modal-head" style="--cat-color:${cat.color}">
          <div class="arch-upload-modal-title">
            <span>${cat.icon}</span>
            <span>${cat.label}</span>
          </div>
          <button class="arch-modal-close" id="archUploadClose">✕</button>
        </div>

        <div class="arch-upload-modal-body">
          <div class="arch-upload-file-row">
            <span class="arch-upload-file-icon">${archiveFileIcon(ext)}</span>
            <span class="arch-upload-file-name">${esc(originalName)}</span>
          </div>

          <div class="frow">
            <div class="fg">
              <label>Name</label>
              <input id="archUploadName" type="text" value="${esc(nameWithout)}"
                placeholder='z.B. "Mietvertrag 2024"' />
            </div>
          </div>

          <div class="frow">
            <div class="fg">
              <label>Gültig bis
                <span style="font-size:.8em;font-weight:400;color:var(--text3);margin-left:4px">optional</span>
              </label>
              <input id="archUploadExpires" type="date" />
            </div>
          </div>

          <div class="frow">
            <div class="fg">
              <label>Posten verknüpfen
                <span style="font-size:.8em;font-weight:400;color:var(--text3);margin-left:4px">optional</span>
              </label>
              <select id="archUploadPosten">
                <option value="">— nicht verknüpfen —</option>
                ${postenOpts}
              </select>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn" id="archUploadSkip">Überspringen</button>
          <button class="btn primary" id="archUploadSave" style="margin-left:auto">Speichern</button>
        </div>
      </div>`;

    document.body.appendChild(ov);
    requestAnimationFrame(() => ov.classList.add("open"));
    setTimeout(() => document.getElementById("archUploadName")?.select(), 80);

    const cleanup = () => { ov.remove(); resolve(); };

    document.getElementById("archUploadClose").onclick = cleanup;
    document.getElementById("archUploadSkip").onclick = cleanup;
    ov.addEventListener("click", e => { if (e.target === ov) cleanup(); });

    document.getElementById("archUploadSave").onclick = async () => {
      const nameVal = document.getElementById("archUploadName").value.trim();
      const postenId = document.getElementById("archUploadPosten").value;
      const expiresVal = document.getElementById("archUploadExpires").value || null;
      const finalName = (nameVal || nameWithout) + ext;

      if (finalName !== originalName) {
        await window.csf.archive.renameDoc(docId, finalName).catch(() => {});
      }
      if (postenId) {
        const p = (S?.data || []).find(d => d.id === postenId);
        if (p) await window.csf.archive.linkDoc(docId, postenId, "posten", p.name).catch(() => {});
      }
      if (expiresVal && window.csf?.archive?.updateExpires) {
        await window.csf.archive.updateExpires(docId, expiresVal).catch(() => {});
      }
      ov.remove();
      resolve();
    };

    // Enter = Speichern
    document.getElementById("archUploadName").addEventListener("keydown", e => {
      if (e.key === "Enter") document.getElementById("archUploadSave").click();
    });
  });
}

// ══════════════════════════════════════
//  KATEGORIE-MODAL — Inhalt einer Kategorie
// ══════════════════════════════════════
async function _archiveOpenCatModal(catId) {
  const cat = archiveCat(catId);
  document.getElementById("archCatModal")?.remove();

  let docs = [];
  try {
    docs = await window.csf.archive.list({ category: catId });
  } catch (e) {
    return;
  }

  const modal = document.createElement("div");
  modal.id = "archCatModal";
  modal.className = "arch-cat-modal-overlay";
  modal.onclick = (e) => {
    if (e.target === modal) _archiveCloseCatModal();
  };

  modal.innerHTML = `
    <div class="arch-cat-modal" style="--cat-color:${cat.color}">
      <div class="arch-cat-modal-header">
        <div class="arch-cat-modal-title">
          <span style="font-size:1.3em">${cat.icon}</span>
          <span>${cat.label}</span>
          ${docs.length ? `<span class="arch-count">${docs.length}</span>` : ""}
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          <button class="arch-preview-btn"
            onclick="_archiveUploadNew('${catId}')"
            style="font-size:.7em">
            + Hochladen
          </button>
          <button class="arch-modal-close" onclick="_archiveCloseCatModal()">✕</button>
        </div>
      </div>
      <div class="arch-cat-modal-body">
        ${
          docs.length === 0
            ? `<div class="arch-ov-empty">
               <div style="font-size:2em;margin-bottom:10px">${cat.icon}</div>
               Noch keine Dokumente.<br>
               <button class="btn" style="margin-top:12px"
                 onclick="_archiveUploadNew('${catId}')">
                 Jetzt hochladen
               </button>
             </div>`
            : `<div class="arch-cat-list">
               ${docs.map((doc) => _archiveCatTile(doc, catId)).join("")}
             </div>`
        }
      </div>
    </div>`;

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add("open"));

  // Bild-Vorschau lazy laden
  docs.forEach((doc) => {
    const isImg = ["png", "jpg", "jpeg", "webp", "gif"].includes(
      (doc.ext || "").toLowerCase(),
    );
    if (!isImg) return;
    const wrap = document.getElementById("archimgwrap_" + doc.id);
    if (!wrap) return;
    window.csf.archive.getPath(doc.relPath).then((r) => {
      if (!r?.ok) return;
      const url = "file:///" + r.path.replace(/\\/g, "/");
      wrap.innerHTML = `<img src="${url}" class="arch-tile-img"
        onerror="this.parentNode.innerHTML='🖼️'">`;
    });
  });
}

function _archiveCatTile(doc, catId) {
  const canPreview = archiveIsPreviewable(doc.ext);
  const isLinked = !!doc.refId;

  // Posten-Infos aus S.data holen falls verknüpft
  let postenInfo = null;
  if (doc.refId && typeof S !== "undefined") {
    const p = (S.data || []).find((x) => x.id === doc.refId);
    if (p) postenInfo = p;
  }

  return `
    <div class="arch-cat-row" id="archrow_${doc.id}">

      <!-- Icon -->
      <div class="arch-cat-row-icon">${archiveFileIcon(doc.ext)}</div>

      <!-- Info -->
      <div class="arch-cat-row-info"
        onclick="${
          canPreview
            ? `_archivePreview('${doc.relPath}','${esc(doc.name)}','${doc.ext}')`
            : `_archiveOpenByRelPath('${doc.relPath}')`
        }" style="cursor:pointer;flex:1;min-width:0">
        <div class="arch-cat-row-name" title="${esc(doc.name)}">${esc(doc.name)}${(() => {
          if (!doc.expires) return "";
          const now = new Date(); const exp = new Date(doc.expires);
          const diff = Math.ceil((exp - now) / 86400000);
          if (diff < 0) return ` <span class="arch-exp-badge arch-exp-expired">Abgelaufen</span>`;
          if (diff <= 30) return ` <span class="arch-exp-badge arch-exp-soon">${diff}d</span>`;
          if (diff <= 90) return ` <span class="arch-exp-badge arch-exp-warn">${diff}d</span>`;
          return "";
        })()}</div>
        <div class="arch-cat-row-meta">
          ${archiveFormatSize(doc.size)} · ${archiveFormatDate(doc.addedAt)}
          ${doc.expires ? ` · Gültig bis ${new Date(doc.expires).toLocaleDateString("de-DE")}` : ""}
          ${doc.note ? ` · <em title="${esc(doc.note)}">${esc(doc.note.length > 40 ? doc.note.slice(0, 40) + "…" : doc.note)}</em>` : ""}
        </div>
      </div>

      <!-- Verknüpfung -->
      <div class="arch-cat-row-link ${isLinked ? "linked" : "unlinked"}"
        onclick="_archiveLinkToPosten('${doc.id}').then(()=>{ _archRefreshAfterEdit('${catId}'); })"
        onmouseenter="_showTooltip('${isLinked ? "Verknüpfung ändern" : "Mit Posten verknüpfen"}', this)" onmouseleave="_hideTooltip()">
        ${
          isLinked
            ? `<span class="arch-link-badge">
               🔗
               <span>${esc(doc.refName || "—")}</span>
               ${
                 postenInfo
                   ? `<span class="arch-link-type ${postenInfo.type}">
                      ${postenInfo.type === "einnahme" ? "↑" : "↓"}
                    </span>`
                   : ""
               }
             </span>`
            : `<span class="arch-link-empty">+ Verknüpfen</span>`
        }
      </div>

      <!-- Aktionen -->
      <div class="arch-cat-row-actions">
        ${
          canPreview
            ? `<button class="arch-btn arch-btn-preview" onmouseenter="_showTooltip('Vorschau', this)" onmouseleave="_hideTooltip()"
               onclick="_archivePreview('${doc.relPath}','${esc(doc.name)}','${doc.ext}')">👁</button>`
            : `<button class="arch-btn" onmouseenter="_showTooltip('Extern öffnen', this)" onmouseleave="_hideTooltip()"
               onclick="_archiveOpenByRelPath('${doc.relPath}')">↗</button>`
        }
        <button class="arch-btn" onmouseenter="_showTooltip('Notiz bearbeiten', this)" onmouseleave="_hideTooltip()"
          onclick="_archiveNoteStandalone('${doc.id}','${esc(doc.note || "")}','${catId}')">✏️</button>
        <button class="arch-btn arch-btn-del" onmouseenter="_showTooltip('Löschen', this)" onmouseleave="_hideTooltip()"
          onclick="_archiveDeleteFromCat('${doc.id}','${doc.relPath}','${catId}','${esc(doc.name)}','${esc(doc.name)}')">🗑</button>
      </div>
    </div>`;
}

function _archiveCloseCatModal() {
  const m = document.getElementById("archCatModal");
  if (!m) return;
  m.classList.remove("open");
  setTimeout(() => m.remove(), 220);
}

async function _archiveNoteStandalone(docId, currentNote, catId) {
  const note = await appPrompt("Notiz zur Datei:", {
    placeholder: 'z.B. "Original · unterzeichnet 01.01.2025"',
    value: currentNote,
  });
  if (note === null) return;
  await window.csf.archive.updateNote(docId, note);
  await _archRefreshAfterEdit(catId);
}

async function _archiveDeleteFromCat(docId, relPath, catId, docName) {
  const ok = await appConfirm(`"${docName}" löschen?`, {
    icon: "🗑️",
    title: "Dokument löschen",
    confirmLabel: "Löschen",
    confirmClass: "danger",
  });
  if (!ok) return;
  await window.csf.archive.delete(docId, relPath);
  await _archRefreshAfterEdit(catId);
}

// Reload-Fix: aktualisiert _archAllDocs und re-rendert das aktive Panel ohne Vollseiten-Reload
async function _archRefreshAfterEdit(catId) {
  if (document.getElementById("archExplorerMain")) {
    // Explorer-Modus: nur Dateiliste aktualisieren
    try {
      _archAllDocs = await window.csf.archive.list().catch(() => _archAllDocs);
    } catch (e) { /* keep stale */ }
    _archShowCatDocs(catId || _archActiveCat);
  } else {
    // Fallback: Kategorie-Modal neu öffnen (Mini-Panel / älterer Aufruf)
    _archiveCloseCatModal();
    setTimeout(() => _archiveOpenCatModal(catId), 250);
  }
}

// ══════════════════════════════════════
//  MINI-PANEL im Posten-Modal
//  Zeigt verknüpfte Docs + Link-Button
// ══════════════════════════════════════
async function renderArchivePanel(containerId, refId, refType, refName) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!window.csf?.archive) {
    container.innerHTML = `<div class="arch-unavailable">
      📱 Archiv nur in der Desktop-App verfügbar
    </div>`;
    return;
  }

  let docs = [];
  try {
    const all = await window.csf.archive.list();
    docs = all.filter((d) => d.refId === refId);
  } catch (e) {
    container.innerHTML = `<div class="arch-unavailable">Archiv nicht erreichbar</div>`;
    return;
  }

  container.innerHTML = `
    <div class="arch-panel">
      <div class="arch-panel-head">
        <span class="arch-panel-title">
          🔗 Verknüpfte Dokumente
          ${docs.length ? `<span class="arch-count">${docs.length}</span>` : ""}
        </span>
        <button class="arch-add-btn"
          onclick="_archiveLinkExisting('${refId}','${refType}','${esc(refName || "")}','${containerId}')">
          + Verknüpfen
        </button>
      </div>

      ${
        docs.length === 0
          ? `<div class="arch-empty-hint">
             Noch keine Dokumente verknüpft.<br>
             <span style="font-size:.85em;opacity:.6">
               Dokumente werden im Archiv verwaltet und können hier zugeordnet werden.
             </span>
             <br><br>
             <button class="btn" style="font-size:.72em"
               onclick="closeModal();openArchiveOverview()">
               📂 Archiv öffnen
             </button>
           </div>`
          : `<div class="arch-list">
             ${docs
               .map(
                 (doc) => `
               <div class="arch-doc-row">
                 <span class="arch-doc-icon">${archiveFileIcon(doc.ext)}</span>
                 <div class="arch-doc-info">
                   <div class="arch-doc-name">${esc(doc.name)}</div>
                   <div class="arch-doc-meta">
                     ${archiveCat(doc.category || doc.catId).icon}
                     ${archiveCat(doc.category || doc.catId).label} ·
                     ${archiveFormatSize(doc.size)}
                   </div>
                 </div>
                 <div class="arch-doc-actions">
                   ${
                     archiveIsPreviewable(doc.ext)
                       ? `<button class="arch-btn arch-btn-preview"
                          onclick="_archivePreview('${doc.relPath}','${esc(doc.name)}','${doc.ext}')">👁</button>`
                       : `<button class="arch-btn"
                          onclick="_archiveOpenByRelPath('${doc.relPath}')">↗</button>`
                   }
                   <button class="arch-btn arch-btn-del" onmouseenter="_showTooltip('Verknüpfung lösen', this)" onmouseleave="_hideTooltip()"
                     onclick="_archiveUnlink('${doc.id}','${containerId}','${refId}','${refType}','${esc(refName || "")}')">
                     ✕
                   </button>
                 </div>
               </div>`,
               )
               .join("")}
           </div>`
      }
    </div>`;
}

// Bestehendes Dokument aus Archiv verknüpfen
async function _archiveLinkExisting(refId, refType, refName, containerId) {
  // Alle unverknüpften oder anders verknüpften Docs zeigen
  const all = await window.csf.archive.list();
  const free = all.filter((d) => !d.refId || d.refId !== refId);

  if (!free.length) {
    appAlert(
      "Keine weiteren Dokumente im Archiv vorhanden.\nLade zuerst Dokumente im Archiv hoch.",
      { icon: "📂" },
    );
    return;
  }

  return new Promise((resolve) => {
    const picker = document.createElement("div");
    picker.className = "arch-cat-picker-overlay";
    picker.onclick = (e) => {
      if (e.target === picker) {
        picker.remove();
        resolve(null);
      }
    };

    picker.innerHTML = `
      <div class="arch-cat-picker" style="max-height:65vh">
        <div class="arch-cat-picker-title">Dokument auswählen</div>
        <div class="arch-link-list">
          ${free
            .map(
              (doc) => `
            <div class="arch-link-item"
              onclick="window._archiveLinkExistingResolve('${doc.id}')">
              <span>${archiveFileIcon(doc.ext)}</span>
              <div style="flex:1;min-width:0">
                <div style="font-size:.78em;font-weight:600;color:var(--text);
                  white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                  ${esc(doc.name)}
                </div>
                <div style="font-size:.65em;color:var(--text3)">
                  ${archiveCat(doc.category || doc.catId).icon}
                  ${archiveCat(doc.category || doc.catId).label}
                  ${doc.refName ? ` · Aktuell: ${esc(doc.refName)}` : ""}
                </div>
              </div>
            </div>`,
            )
            .join("")}
        </div>
      </div>`;

    document.body.appendChild(picker);
    requestAnimationFrame(() => picker.classList.add("open"));

    window._archiveLinkExistingResolve = async (docId) => {
      picker.remove();
      await window.csf.archive.linkDoc(docId, refId, refType, refName);
      renderArchivePanel(containerId, refId, refType, refName);
      resolve(docId);
    };
  });
}

// Verknüpfung lösen (nicht löschen)
async function _archiveUnlink(docId, containerId, refId, refType, refName) {
  await window.csf.archive.linkDoc(docId, null, null, null);
  renderArchivePanel(containerId, refId, refType, refName);
}

// ══════════════════════════════════════
//  INLINE VORSCHAU
// ══════════════════════════════════════
async function _archivePreview(relPath, docName, ext) {
  const result = await window.csf.archive.getPath(relPath);
  if (!result?.ok) {
    appAlert("Datei nicht gefunden.", { icon: "⚠️" });
    return;
  }
  _archiveCreatePreviewOverlay(docName, result.path, ext);
}

function _archiveCreatePreviewOverlay(name, filePath, ext) {
  document.getElementById("archPreviewOverlay")?.remove();
  const isImage = ["png", "jpg", "jpeg", "webp", "gif"].includes(
    (ext || "").toLowerCase(),
  );
  const isPdf = ext?.toLowerCase() === "pdf";
  const fileUrl = "file:///" + filePath.replace(/\\/g, "/");

  const overlay = document.createElement("div");
  overlay.id = "archPreviewOverlay";
  overlay.className = "arch-preview-overlay";
  overlay.dataset.filepath = filePath;
  overlay.onclick = (e) => {
    if (e.target === overlay) _archiveClosePreview();
  };

  overlay.innerHTML = `
    <div class="arch-preview-modal">
      <div class="arch-preview-header">
        <div class="arch-preview-title" title="${esc(name)}">${esc(name)}</div>
        <div class="arch-preview-actions">
          <button class="arch-preview-btn" onclick="_archivePrintPreview()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" width="13" height="13">
              <path d="M7 17H4a1 1 0 01-1-1v-5a1 1 0 011-1h16a1 1 0 011 1v5a1 1 0 01-1 1h-3"/>
              <path d="M7 9V3h10v6"/><rect x="7" y="14" width="10" height="7" rx="1"/>
            </svg>
            Drucken
          </button>
          <button class="arch-preview-btn" onclick="_archiveOpenExternalFromPreview()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" width="13" height="13">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Extern öffnen
          </button>
          <button class="arch-preview-close" onclick="_archiveClosePreview()">✕</button>
        </div>
      </div>
      <div class="arch-preview-body">
        ${
          isPdf
            ? `<iframe id="archPreviewFrame" src="${fileUrl}"
               class="arch-preview-iframe"></iframe>`
            : isImage
              ? `<div class="arch-preview-img-wrap">
                 <img src="${fileUrl}" class="arch-preview-img" id="archPreviewImg"
                   ondblclick="_archiveImgZoom(this)"
                   onmouseenter="_showTooltip('Doppelklick zum Zoomen', this)" onmouseleave="_hideTooltip()">
               </div>`
              : `<div class="arch-preview-unsupported">
                 <div style="font-size:2em;margin-bottom:12px">
                   ${archiveFileIcon(ext)}
                 </div>
                 Vorschau nicht verfügbar.<br>
                 <button class="btn" style="margin-top:12px"
                   onclick="_archiveOpenExternalFromPreview()">
                   Extern öffnen
                 </button>
               </div>`
        }
      </div>
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("open"));
}

function _archiveClosePreview() {
  const ov = document.getElementById("archPreviewOverlay");
  if (!ov) return;
  ov.classList.remove("open");
  setTimeout(() => ov.remove(), 250);
}
function _archivePrintPreview() {
  const frame = document.getElementById("archPreviewFrame");
  if (frame) {
    frame.contentWindow.print();
    return;
  }
  const img = document.getElementById("archPreviewImg");
  if (img) {
    const w = window.open("");
    w.document.write(`<html><head><style>body{margin:0;display:flex;
      align-items:center;justify-content:center;min-height:100vh}
      img{max-width:100%;max-height:100vh}</style></head>
      <body><img src="${img.src}"
        onload="window.print();window.close()"></body></html>`);
  }
}
function _archiveImgZoom(img) {
  img.classList.toggle("arch-preview-img-zoomed");
}
async function _archiveOpenExternalFromPreview() {
  const fp = document.getElementById("archPreviewOverlay")?.dataset?.filepath;
  if (!fp) return;
  _archiveClosePreview();
  await window.csf.archive.openPath(fp);
}
async function _archiveOpenByRelPath(relPath) {
  const r = await window.csf.archive.open(relPath);
  if (!r?.ok) appAlert("Datei nicht gefunden.", { icon: "⚠️" });
}
