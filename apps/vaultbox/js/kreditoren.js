// ══════════════════════════════════════
//  KREDITOREN — Zahlungsempfänger
// ══════════════════════════════════════

const CREDITOR_TEMPLATES = [
  { name: "PayPal",           color: "#003087", domain: "paypal.com"     },
  { name: "Klarna",           color: "#ff607e", domain: "klarna.com"     },
  { name: "Amazon",           color: "#ff9900", domain: "amazon.de"      },
  { name: "Apple",            color: "#1d1d1f", domain: "apple.com"      },
  { name: "Google",           color: "#4285f4", domain: "google.com"     },
  { name: "Stripe",           color: "#635bff", domain: "stripe.com"     },
  { name: "Apple Pay",        color: "#1d1d1f", domain: "apple.com"      },
  { name: "Google Pay",       color: "#4285f4", domain: "google.com"     },
  { name: "SEPA Lastschrift", color: "#003399", domain: null             },
  { name: "Visa",             color: "#1a1f71", domain: "visa.com"       },
  { name: "Mastercard",       color: "#eb001b", domain: "mastercard.com" },
  { name: "AMEX",             color: "#007bc1", domain: "americanexpress.com" },
];

// Favicon-URL aus gespeicherter Domain, Website-Feld oder Template ermitteln
function _krLogoUrl(c) {
  const domain = c.logoDomain || (() => {
    if (c.website) {
      try {
        const raw = c.website.startsWith("http") ? c.website : "https://" + c.website;
        return new URL(raw).hostname.replace(/^www\./, "");
      } catch { return null; }
    }
    const tpl = CREDITOR_TEMPLATES.find(t => t.name === c.name);
    return tpl ? tpl.domain : null;
  })();
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

// Logo-Picker befüllen
function _krFillLogoPicker() {
  const wrap = document.getElementById("krLogoPicker");
  if (!wrap) return;
  while (wrap.firstChild) wrap.removeChild(wrap.firstChild);
  CREDITOR_TEMPLATES.filter(t => t.domain).forEach(t => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "kr-logo-chip";
    chip.dataset.domain = t.domain;
    chip.dataset.color  = t.color;
    chip.dataset.name   = t.name;
    const img = document.createElement("img");
    img.src = `https://www.google.com/s2/favicons?domain=${t.domain}&sz=64`;
    img.alt = t.name;
    img.style.cssText = "width:22px;height:22px;object-fit:contain;border-radius:4px;";
    img.onerror = () => { chip.textContent = t.name[0]; };
    chip.appendChild(img);
    chip.addEventListener("mouseenter", () => _showTooltip(t.name, chip));
    chip.addEventListener("mouseleave", _hideTooltip);
    chip.onclick = () => krSelectLogo(t.domain, t.color, t.name, chip);
    wrap.appendChild(chip);
  });
  // Aktuell gesetzten Domain-Chip markieren
  const curDomain = document.getElementById("krLogoDomain")?.value || "";
  if (curDomain) {
    wrap.querySelectorAll(".kr-logo-chip").forEach(ch => {
      ch.classList.toggle("active", ch.dataset.domain === curDomain);
    });
  }
}

function krSelectLogo(domain, color, name, chipEl) {
  const domainInp = document.getElementById("krLogoDomain");
  const colorInp  = document.getElementById("krColor");
  const iconInp   = document.getElementById("krIcon");
  const nameInp   = document.getElementById("krName");
  if (domainInp) domainInp.value = domain;
  if (colorInp)  colorInp.value  = color;
  if (iconInp)   iconInp.value   = "";  // Custom-Kürzel leeren
  if (nameInp && !nameInp.value) nameInp.value = name;
  // Chip aktiv markieren
  chipEl.closest(".kr-logo-picker")?.querySelectorAll(".kr-logo-chip").forEach(c => c.classList.remove("active"));
  chipEl.classList.add("active");
}

function krClearLogoPicker() {
  // Wenn User manuelles Kürzel eingibt → Domain-Auswahl aufheben
  const domainInp = document.getElementById("krLogoDomain");
  if (domainInp) domainInp.value = "";
  document.querySelectorAll(".kr-logo-chip").forEach(c => c.classList.remove("active"));
}

// Avatar-Element befüllen: Favicon-Bild mit Letter-Fallback
function _krFillAvatar(avatarEl, c) {
  const fallback = c.icon || (c.name||"?").split(/\s+/).map(w=>w[0]).slice(0,2).join("").toUpperCase();
  avatarEl.textContent = fallback;

  const logoUrl = _krLogoUrl(c);
  if (logoUrl) {
    const img = document.createElement("img");
    img.src = logoUrl;
    img.style.cssText = "width:26px;height:26px;object-fit:contain;border-radius:4px;";
    img.onload  = () => { avatarEl.textContent = ""; avatarEl.appendChild(img); };
    img.onerror = () => { avatarEl.textContent = fallback; };
  }
}

let _krSearch = "";
let _krEditId  = null;

// ── HELPERS ───────────────────────────
function _krEl(tag, cls) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  return el;
}

function _krFieldEl(parent, lbl, val, mono) {
  const row = _krEl("div","kr-field");
  const l = _krEl("span","kr-field-lbl"); l.textContent = lbl; row.appendChild(l);
  const v = _krEl("span", mono ? "kr-field-val mono" : "kr-field-val"); v.textContent = val; row.appendChild(v);
  parent.appendChild(row);
}

function _krPopRowEl(parent, lbl, display, copyVal, canCopy) {
  const row = _krEl("div","kr-pop-row");
  const l = _krEl("span","kr-pop-lbl"); l.textContent = lbl; row.appendChild(l);
  const v = _krEl("span","kr-pop-val"); v.textContent = display; row.appendChild(v);
  if (canCopy && copyVal) {
    const btn = _krEl("button","kr-copy-btn"); btn.textContent = "⧉";
    btn.addEventListener("mouseenter", () => { if (typeof _showTooltip === "function") _showTooltip("Kopieren", btn); });
    btn.addEventListener("mouseleave", () => { if (typeof _hideTooltip === "function") _hideTooltip(); });
    btn.onclick = () => {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(copyVal).then(() => {
        const o = btn.textContent; btn.textContent = "✓"; btn.style.color = "var(--green)";
        setTimeout(() => { btn.textContent = o; btn.style.color = ""; }, 1400);
      });
    };
    row.appendChild(btn);
  }
  parent.appendChild(row);
}

// ── RENDER SEITE ──────────────────────
function renderKreditoren() {
  const el = document.getElementById("p-kreditoren");
  if (!el) return;
  const creds = Array.isArray(S.creditors) ? S.creditors : [];
  const q = _krSearch.toLowerCase().trim();
  const filtered = q
    ? creds.filter(c =>
        (c.name||"").toLowerCase().includes(q) ||
        (c.email||"").toLowerCase().includes(q) ||
        (c.phone||"").toLowerCase().includes(q))
    : creds;

  while (el.firstChild) el.removeChild(el.firstChild);
  const page = _krEl("div","kr-page");

  // Header
  const hdr = _krEl("div","kr-header");
  const hdrLeft = _krEl("div");
  const hdrTitle = _krEl("div","ph-title"); hdrTitle.textContent = "Kreditoren"; hdrLeft.appendChild(hdrTitle);
  const hdrSub = _krEl("div","ph-sub");
  const linked = (S.data||[]).filter(p=>p.creditorId).length;
  hdrSub.textContent = creds.length + " Zahlungsempfänger · " + linked + " Posten verknüpft";
  hdrLeft.appendChild(hdrSub); hdr.appendChild(hdrLeft);

  const hdrRight = _krEl("div","kr-header-actions");
  const searchWrap = _krEl("div","kr-search-wrap");
  const searchInp = _krEl("input","kr-search");
  searchInp.placeholder = "Suchen…"; searchInp.value = _krSearch;
  searchInp.oninput = function() {
    const sel = [this.selectionStart, this.selectionEnd];
    _krSearch = this.value;
    renderKreditoren();
    const ni = document.querySelector(".kr-search");
    if (ni) { ni.focus(); ni.setSelectionRange(sel[0], sel[1]); }
  };
  searchWrap.appendChild(searchInp); hdrRight.appendChild(searchWrap);

  const addBtn = _krEl("button","btn primary");
  addBtn.textContent = "+ Kreditor";
  addBtn.onclick = () => openCreditorModal();
  hdrRight.appendChild(addBtn);
  hdr.appendChild(hdrRight);
  page.appendChild(hdr);

  if (filtered.length === 0) {
    const empty = _krEl("div","kr-empty");
    const eIcon = _krEl("div","kr-empty-icon"); eIcon.textContent = "🏢"; empty.appendChild(eIcon);
    const eTitle = _krEl("div","kr-empty-title");
    eTitle.textContent = q ? "Keine Treffer" : "Noch keine Kreditoren";
    empty.appendChild(eTitle);
    const eSub = _krEl("div","kr-empty-sub");
    eSub.textContent = q
      ? "Suchbegriff ändern"
      : "Lege Zahlungsempfänger an — IBAN, E-Mail und Telefon immer griffbereit.";
    empty.appendChild(eSub);
    if (!q) {
      const eb = _krEl("button","btn primary");
      eb.style.marginTop = "16px";
      eb.textContent = "Ersten Kreditor anlegen";
      eb.onclick = () => openCreditorModal();
      empty.appendChild(eb);
    }
    page.appendChild(empty);
  } else {
    const grid = _krEl("div","kr-grid");
    filtered.forEach(c => grid.appendChild(_krBuildCard(c)));
    page.appendChild(grid);
  }
  el.appendChild(page);
}

// ── KARTE ─────────────────────────────
function _krBuildCard(c) {
  const color = c.color || "var(--blue)";

  const card = _krEl("div","kr-card");
  card.onclick = () => openCreditorModal(c.id);

  // Head
  const head = _krEl("div","kr-card-head");
  const avatar = _krEl("div","kr-avatar");
  avatar.style.background = color + "22";
  avatar.style.color = color;
  avatar.style.borderColor = color + "44";
  head.appendChild(avatar);
  _krFillAvatar(avatar, c);

  const info = _krEl("div","kr-card-info");
  const namEl = _krEl("div","kr-card-name"); namEl.textContent = c.name; info.appendChild(namEl);
  if (c.website) { const sub = _krEl("div","kr-card-sub"); sub.textContent = c.website; info.appendChild(sub); }
  head.appendChild(info);

  const menuWrap = _krEl("div","kr-card-menu");
  menuWrap.onclick = e => e.stopPropagation();
  const editBtn = _krEl("button","icon-btn sm"); editBtn.textContent = "✎";
  editBtn.addEventListener("mouseenter", () => { if (typeof _showTooltip === "function") _showTooltip("Bearbeiten", editBtn); });
  editBtn.addEventListener("mouseleave", () => { if (typeof _hideTooltip === "function") _hideTooltip(); });
  editBtn.onclick = () => openCreditorModal(c.id);
  menuWrap.appendChild(editBtn); head.appendChild(menuWrap);
  card.appendChild(head);

  // Body
  const body = _krEl("div","kr-card-body");
  if (c.accountId) {
    const acc = (S.accounts || []).find(a => a.id === c.accountId);
    if (acc) {
      const grp = acc.bankGroup ? acc.bankGroup + " · " : "";
      _krFieldEl(body, "Konto", grp + acc.label, false);
    }
  }
  if (c.email)   _krFieldEl(body, "E-Mail",  c.email);
  if (c.phone)   _krFieldEl(body, "Tel.",    c.phone);
  if (c.address) _krFieldEl(body, "Adresse", c.address);
  card.appendChild(body);

  return card;
}

// ── MODAL ─────────────────────────────
function openCreditorModal(creditorId) {
  _krEditId = creditorId || null;
  const existing = _krEditId ? (S.creditors||[]).find(c=>c.id===_krEditId) : null;
  const ov = document.getElementById("creditorModalOverlay");
  if (!ov) return;

  const f = id => document.getElementById(id);
  f("creditorModalTitle").textContent = existing ? "Kreditor bearbeiten" : "Neuer Kreditor";
  f("krName").value    = existing ? (existing.name    || "") : "";
  f("krEmail").value   = existing ? (existing.email   || "") : "";
  f("krPhone").value   = existing ? (existing.phone   || "") : "";
  // Populate account dropdown — grouped by bankGroup
  const accSel = f("krAccountId");
  if (accSel) {
    accSel.innerHTML = '<option value="">— kein Konto —</option>';
    const grpMap = {};
    (S.accounts || []).forEach(a => {
      const g = (a.bankGroup || "").trim();
      if (!grpMap[g]) grpMap[g] = [];
      grpMap[g].push(a);
    });
    const ungrouped = grpMap[""] || [];
    const groupKeys = Object.keys(grpMap).filter(k => k !== "").sort();
    const _addOpt = (parent, a) => {
      const opt = document.createElement("option");
      opt.value = a.id;
      opt.textContent = a.label + (a.sub ? " · " + a.sub : "");
      if (existing && existing.accountId === a.id) opt.selected = true;
      parent.appendChild(opt);
    };
    ungrouped.forEach(a => _addOpt(accSel, a));
    groupKeys.forEach(gName => {
      const og = document.createElement("optgroup");
      og.label = gName;
      (grpMap[gName] || []).forEach(a => _addOpt(og, a));
      accSel.appendChild(og);
    });
    // Gruppen-Hint unter dem Select
    const hint = f("krAccountHint");
    const _updateHint = () => {
      if (!hint) return;
      const selId = accSel.value;
      const selAcc = (S.accounts || []).find(a => a.id === selId);
      hint.textContent = selAcc?.bankGroup ? selAcc.bankGroup + " · " + (selAcc.accountType || "") : "";
    };
    accSel.onchange = _updateHint;
    _updateHint();
  }
  f("krAddress").value = existing ? (existing.address || "") : "";
  f("krWebsite").value = existing ? (existing.website || "") : "";
  f("krNote").value    = existing ? (existing.note    || "") : "";
  f("krColor").value      = existing ? (existing.color      || "#4d9eff") : "#4d9eff";
  f("krIcon").value       = existing ? (existing.icon       || "")        : "";
  f("krLogoDomain").value = existing ? (existing.logoDomain || "")        : "";
  _krFillLogoPicker();

  const delBtn = f("creditorModalDelete");
  if (delBtn) delBtn.style.display = existing ? "" : "none";

  // Vorlagen
  const tplWrap = f("krTemplates");
  if (tplWrap) tplWrap.style.display = existing ? "none" : "";

  ov.classList.add("open");
  if (typeof _modalPush === "function") _modalPush("creditorModalOverlay");
  if (typeof _refreshModalTip === "function") _refreshModalTip("creditorModalOverlay");
  setTimeout(() => { const n = f("krName"); if (n) n.focus(); }, 50);
}

function closeCreditorModal() {
  const ov = document.getElementById("creditorModalOverlay");
  if (!ov) return;
  ov.classList.remove("open");
  ov.style.zIndex = "";
  // Inputs zurücksetzen falls Read-only-Modus aktiv war
  ov.querySelectorAll(".kr-inp, .kr-color-inp").forEach(el => {
    el.disabled = false; el.style.opacity = ""; el.style.cursor = "";
  });
  ov.querySelector(".kr-details-edit-btn")?.remove();
  const saveBtn = [...ov.querySelectorAll(".btn.primary")].find(b => b.textContent.trim() === "Speichern");
  if (saveBtn) saveBtn.style.display = "";
  if (typeof _modalPop === "function") _modalPop("creditorModalOverlay");
  _krEditId = null;
}

let _creditorModalMousedownOnBg = false;
document.addEventListener("DOMContentLoaded", () => {
  const ov = document.getElementById("creditorModalOverlay");
  if (!ov) return;
  ov.addEventListener("mousedown", e => { _creditorModalMousedownOnBg = e.target === ov; });
});

function creditorOverlayClick(e) {
  if (_creditorModalMousedownOnBg && e.target === document.getElementById("creditorModalOverlay"))
    closeCreditorModal();
}

function saveCreditor() {
  const nameEl = document.getElementById("krName");
  const name = nameEl ? nameEl.value.trim() : "";
  if (!name) { if (nameEl) nameEl.focus(); return; }

  const gv = id => { const el = document.getElementById(id); return el ? el.value.trim() : ""; };
  const gc = id => { const el = document.getElementById(id); return el ? el.value : ""; };

  const c = {
    id:      _krEditId || genId("cred"),
    name,
    email:     gv("krEmail"),
    phone:     gv("krPhone"),
    accountId: gv("krAccountId") || null,
    address:   gv("krAddress"),
    website: gv("krWebsite"),
    note:    gv("krNote"),
    color:      gc("krColor") || "#4d9eff",
    icon:       gv("krIcon"),
    logoDomain: gv("krLogoDomain"),
  };

  // Auto-extract logoDomain from website if not manually set
  if (c.website && !c.logoDomain) {
    try {
      const raw = c.website.startsWith("http") ? c.website : "https://" + c.website;
      c.logoDomain = new URL(raw).hostname.replace(/^www\./, "");
    } catch {}
  }

  if (!Array.isArray(S.creditors)) S.creditors = [];
  if (_krEditId) {
    const idx = S.creditors.findIndex(x => x.id === _krEditId);
    if (idx >= 0) S.creditors[idx] = c; else S.creditors.push(c);
  } else {
    S.creditors.push(c);
  }
  persist();
  const wasNew = !_krEditId;
  const savedId = c.id;
  closeCreditorModal();
  const pg = document.getElementById("p-kreditoren");
  if (pg && pg.classList.contains("active")) renderKreditoren();
  // Refresh Posten-modal select if open, and auto-select the just-saved creditor
  if (typeof _fillCreditorSelect === "function") {
    const mo = document.getElementById("modalOverlay");
    if (mo && mo.classList.contains("open")) {
      _fillCreditorSelect(savedId);
    }
  }
  if (typeof showToast === "function")
    showToast(wasNew ? "Kreditor angelegt" : "Kreditor gespeichert", "success", 2200);
}

function deleteCreditor() {
  if (!_krEditId) return;
  const c = (S.creditors||[]).find(x => x.id === _krEditId);
  if (!c) return;
  const linkedPosten = (S.data||[]).filter(p => p.creditorId === _krEditId).length;
  const linkedBookings = (S.bookings||[]).filter(b => b.creditorId === _krEditId).length;
  const linkedTotal = linkedPosten + linkedBookings;
  const warnMsg = linkedTotal > 0
    ? `"${c.name}" löschen?\n\n${linkedTotal} verknüpfte Einträge (${linkedPosten} Posten, ${linkedBookings} Buchungen) verlieren die Kreditor-Zuweisung.`
    : `"${c.name}" löschen?`;
  appConfirm(warnMsg, {
    icon:"🗑️", title:"Kreditor löschen", confirmLabel:"Löschen", confirmClass:"danger"
  }).then(ok => {
    if (!ok) return;
    (S.data||[]).forEach(p => { if (p.creditorId === _krEditId) p.creditorId = null; });
    S.creditors = (S.creditors||[]).filter(x => x.id !== _krEditId);
    persist();
    closeCreditorModal();
    const pg = document.getElementById("p-kreditoren");
    if (pg && pg.classList.contains("active")) renderKreditoren();
    if (typeof showToast === "function") showToast("Kreditor gelöscht","info",2000);
  });
}

function krApplyTemplate(tplName) {
  const t = CREDITOR_TEMPLATES.find(t => t.name === tplName);
  if (!t) return;
  const nameEl   = document.getElementById("krName");
  const colorEl  = document.getElementById("krColor");
  const domainEl = document.getElementById("krLogoDomain");
  const iconEl   = document.getElementById("krIcon");
  if (nameEl && !nameEl.value) nameEl.value = t.name;
  if (colorEl)  colorEl.value  = t.color;
  if (domainEl) domainEl.value = t.domain || "";
  if (iconEl)   iconEl.value   = "";
  // Chip aktiv markieren
  if (t.domain) {
    document.querySelectorAll(".kr-logo-chip").forEach(c => {
      c.classList.toggle("active", c.dataset.domain === t.domain && c.dataset.name === t.name);
    });
  }
}

// ── DETAILS-MODAL (read-only, nutzt dasselbe Modal wie Bearbeiten) ────
function openCreditorDetails(creditorId) {
  // Dasselbe Modal wie openCreditorModal — nur im Read-only-Modus
  openCreditorModal(creditorId);

  const ov = document.getElementById("creditorModalOverlay");
  if (!ov) return;

  // Z-index hoch setzen damit es über Buchungsmodals liegt
  ov.style.zIndex = "1200";

  // Alle Eingabefelder sperren
  ov.querySelectorAll(".kr-inp, .kr-color-inp").forEach(el => {
    el.disabled = true;
    el.style.opacity = "0.65";
    el.style.cursor = "default";
  });

  // Vorlagen + Löschen + Speichern ausblenden
  const tpl = document.getElementById("krTemplates");
  if (tpl) tpl.style.display = "none";
  const delBtn = document.getElementById("creditorModalDelete");
  if (delBtn) delBtn.style.display = "none";

  // Speichern-Button durch Bearbeiten-Button ersetzen
  const actions = ov.querySelector(".kr-modal-actions");
  if (actions) {
    // Speichern-Button verstecken
    const saveBtn = [...actions.querySelectorAll(".btn.primary")].find(b => b.textContent.trim() === "Speichern");
    if (saveBtn) saveBtn.style.display = "none";

    // Bearbeiten-Button einfügen (falls noch nicht vorhanden)
    if (!actions.querySelector(".kr-details-edit-btn")) {
      const editBtn = document.createElement("button");
      editBtn.className = "btn primary kr-details-edit-btn";
      editBtn.textContent = "✎ Bearbeiten";
      editBtn.onclick = () => _krEnableEdit(creditorId);
      actions.appendChild(editBtn);
    }
  }
}

function _krEnableEdit(creditorId) {
  const ov = document.getElementById("creditorModalOverlay");
  if (!ov) return;

  // Z-index HOCH lassen — damit es über Buchungsmodals bleibt
  ov.style.zIndex = "1200";

  // Inputs wieder aktivieren
  ov.querySelectorAll(".kr-inp, .kr-color-inp").forEach(el => {
    el.disabled = false;
    el.style.opacity = "";
    el.style.cursor = "";
  });

  // Vorlagen einblenden (nur bei neuem Kreditor, hier immer ausgeblendet lassen)
  // Speichern-Button wieder zeigen
  const actions = ov.querySelector(".kr-modal-actions");
  if (actions) {
    const saveBtn = [...actions.querySelectorAll(".btn.primary")].find(b => b.textContent.trim() === "Speichern");
    if (saveBtn) saveBtn.style.display = "";

    // Bearbeiten-Button entfernen
    actions.querySelector(".kr-details-edit-btn")?.remove();
  }

  // Löschen-Button wieder zeigen (existierender Kreditor)
  const delBtn = document.getElementById("creditorModalDelete");
  if (delBtn && creditorId) delBtn.style.display = "";

  // Erstes Feld fokussieren
  setTimeout(() => document.getElementById("krName")?.focus(), 50);
}

// ── POPOVER ───────────────────────────
function openCreditorPopover(creditorId, anchorEl) {
  document.querySelectorAll(".kr-popover").forEach(p => p.remove());
  const c = (S.creditors||[]).find(x => x.id === creditorId);
  if (!c) return;

  const lp = (S.data||[]).filter(p => p.creditorId === creditorId);
  const color = c.color || "var(--blue)";

  const pop = _krEl("div","kr-popover");

  // Head
  const popHead = _krEl("div","kr-pop-head");
  const popAvatar = _krEl("div","kr-pop-avatar");
  popAvatar.style.background = color + "22";
  popAvatar.style.color = color;
  popAvatar.style.borderColor = color + "44";
  popHead.appendChild(popAvatar);
  _krFillAvatar(popAvatar, c);

  const popInfo = _krEl("div");
  const popName = _krEl("div","kr-pop-name"); popName.textContent = c.name; popInfo.appendChild(popName);
  if (c.website) { const ws = _krEl("div","kr-pop-website"); ws.textContent = c.website; popInfo.appendChild(ws); }
  popHead.appendChild(popInfo);

  const closeBtn = _krEl("button","kr-pop-close"); closeBtn.textContent = "✕";
  closeBtn.addEventListener("mouseenter", () => { if (typeof _showTooltip === "function") _showTooltip("Schließen", closeBtn); });
  closeBtn.addEventListener("mouseleave", () => { if (typeof _hideTooltip === "function") _hideTooltip(); });
  closeBtn.onclick = () => pop.remove();
  popHead.appendChild(closeBtn);
  pop.appendChild(popHead);

  // Body
  const popBody = _krEl("div","kr-pop-body");
  if (c.accountId) {
    const acc = (S.accounts || []).find(a => a.id === c.accountId);
    if (acc) _krPopRowEl(popBody, "Konto", acc.label, null, false);
  }
  if (c.email)   _krPopRowEl(popBody,"E-Mail",  c.email, c.email, true);
  if (c.phone)   _krPopRowEl(popBody,"Tel.",    c.phone, c.phone, true);
  if (c.address) _krPopRowEl(popBody,"Adresse", c.address, null, false);
  if (c.note)    _krPopRowEl(popBody,"Notiz",   c.note, null, false);
  pop.appendChild(popBody);

  // Linked Posten
  if (lp.length) {
    const lnkSec = _krEl("div","kr-pop-linked");
    const lnkT = _krEl("div","kr-pop-linked-title"); lnkT.textContent = "Verknüpfte Posten"; lnkSec.appendChild(lnkT);
    lp.forEach(p => {
      const li = _krEl("div","kr-pop-linked-item");
      const n = _krEl("span"); n.textContent = p.name + " ";
      const a = _krEl("span"); a.style.color = "var(--text3)"; a.textContent = fm(p.amount);
      li.appendChild(n); li.appendChild(a); lnkSec.appendChild(li);
    });
    pop.appendChild(lnkSec);
  }

  // Footer
  const popFoot = _krEl("div","kr-pop-footer");
  const editBtn2 = _krEl("button","btn sm"); editBtn2.textContent = "✎ Bearbeiten";
  editBtn2.onclick = () => {
    // Dynamische Overlays schließen, damit Kreditor-Modal korrekt erscheint
    ["umEditOverlay", "mmBookingEditOverlay"].forEach(id => document.getElementById(id)?.remove());
    openCreditorModal(c.id);
    pop.remove();
  };
  popFoot.appendChild(editBtn2);
  pop.appendChild(popFoot);

  document.body.appendChild(pop);

  // Positionieren
  const rect = anchorEl.getBoundingClientRect();
  const pw = 280;
  let left = rect.right + 8;
  if (left + pw > window.innerWidth - 16) left = rect.left - pw - 8;
  let top = rect.top;
  if (top + 360 > window.innerHeight - 16) top = window.innerHeight - 376;
  pop.style.left = left + "px";
  pop.style.top  = Math.max(8, top) + "px";

  setTimeout(() => {
    document.addEventListener("click", function _close(e) {
      if (!pop.contains(e.target) && e.target !== anchorEl) {
        pop.remove();
        document.removeEventListener("click", _close, true);
      }
    }, true);
  }, 10);
}
