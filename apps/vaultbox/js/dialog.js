// ══════════════════════════════════════
//  DIALOG — Ersetzt alert() / confirm()
// ══════════════════════════════════════

/**
 * appAlert(msg, { title, icon })
 * appConfirm(msg, { title, icon, confirmLabel, confirmClass }) → Promise<bool>
 * appPrompt(msg, { title, icon, placeholder, defaultVal }) → Promise<string|null>
 */

// Legacy-Emoji → Icon-Name, damit bestehende Aufrufer (icon:"🗑️" etc.)
// automatisch SVG-Icons bekommen — ohne jeden Call zu ändern.
const DLG_EMOJI_TO_ICON = {
  "ℹ️":"info", "ℹ":"info", "❓":"help-circle", "✏️":"pencil", "✏":"pencil",
  "🗑️":"trash-2", "🗑":"trash-2", "⚠️":"alert-triangle", "⚠":"alert-triangle",
  "✅":"check-circle", "✔️":"check-circle", "✓":"check", "❌":"x-circle", "✕":"x-circle",
  "🔓":"unlock", "🔒":"lock", "🔐":"lock", "💾":"save", "🔄":"rotate-ccw",
  "🎉":"star", "📦":"package", "🚀":"trending-up",
};

function _dlgSetIcon(iconVal) {
  const el = document.getElementById("dlgIcon");
  if (!el) return;
  const name = DLG_EMOJI_TO_ICON[iconVal] || iconVal;
  if (name && typeof CS_ICON_PATHS !== "undefined" && CS_ICON_PATHS[name] && typeof iconHtml === "function") {
    el.innerHTML = iconHtml(name, 26);
  } else {
    el.textContent = iconVal || ""; // unbekanntes Emoji als Fallback
  }
}

function _dlgOpen(icon, title, body, buttons) {
  _dlgSetIcon(icon);
  document.getElementById("dlgTitle").textContent = title || "";
  document.getElementById("dlgBody").textContent = body || "";

  const acts = document.getElementById("dlgActions");
  acts.innerHTML = "";
  buttons.forEach((b) => {
    const btn = document.createElement("button");
    btn.className = "dlg-btn " + (b.cls || "");
    btn.textContent = b.label;
    btn.onclick = b.action;
    acts.appendChild(btn);
  });

  document.getElementById("appDialogOverlay").classList.add("open");

  // Close on overlay click
  document.getElementById("appDialogOverlay").onclick = (e) => {
    if (e.target === document.getElementById("appDialogOverlay")) _dlgClose();
  };

  // ESC to close
  document._dlgKeyHandler = (e) => {
    if (e.key === "Escape") _dlgClose();
  };
  document.addEventListener("keydown", document._dlgKeyHandler);
}

function _dlgClose() {
  document.getElementById("appDialogOverlay").classList.remove("open");
  document.removeEventListener("keydown", document._dlgKeyHandler);
}

// ── PUBLIC API ────────────────────────

function appAlert(msg, opts = {}) {
  return new Promise((resolve) => {
    _dlgOpen(opts.icon || "info", opts.title || "Hinweis", msg, [
      {
        label: opts.okLabel || "OK",
        cls: "primary",
        action: () => {
          _dlgClose();
          resolve();
        },
      },
    ]);
  });
}

function appConfirm(msg, opts = {}) {
  return new Promise((resolve) => {
    _dlgOpen(opts.icon || "help-circle", opts.title || "Bestätigung", msg, [
      {
        label: "Abbrechen",
        cls: "",
        action: () => {
          _dlgClose();
          resolve(false);
        },
      },
      {
        label: opts.confirmLabel || "Bestätigen",
        cls: opts.confirmClass || "primary",
        action: () => {
          _dlgClose();
          resolve(true);
        },
      },
    ]);
  });
}

function appPrompt(msg, opts = {}) {
  return new Promise((resolve) => {
    // Build body with input field
    _dlgSetIcon(opts.icon || "pencil");
    document.getElementById("dlgTitle").textContent = opts.title || "Eingabe";
    const body = document.getElementById("dlgBody");
    body.innerHTML = "";
    const p = document.createElement("p");
    p.style.cssText = "margin-bottom:10px;font-size:.85em;color:var(--text2);";
    p.textContent = msg;
    const inp = document.createElement("input");
    inp.type = "text";
    inp.placeholder = opts.placeholder || "";
    inp.value = opts.defaultVal || "";
    inp.style.cssText =
      "width:100%;background:var(--input-bg);border:1px solid var(--border2);border-radius:var(--r1);padding:8px 10px;color:var(--text);font-size:.85em;outline:none;font-family:inherit;box-sizing:border-box;";
    body.appendChild(p);
    body.appendChild(inp);

    const acts = document.getElementById("dlgActions");
    acts.innerHTML = "";

    const cancel = document.createElement("button");
    cancel.className = "dlg-btn";
    cancel.textContent = "Abbrechen";
    cancel.onclick = () => {
      _dlgClose();
      resolve(null);
    };

    const ok = document.createElement("button");
    ok.className = "dlg-btn primary";
    ok.textContent = opts.okLabel || "OK";
    ok.onclick = () => {
      _dlgClose();
      resolve(inp.value.trim() || null);
    };

    acts.appendChild(cancel);
    acts.appendChild(ok);

    document.getElementById("appDialogOverlay").classList.add("open");
    document.getElementById("appDialogOverlay").onclick = (e) => {
      if (e.target === document.getElementById("appDialogOverlay")) {
        _dlgClose();
        resolve(null);
      }
    };
    document._dlgKeyHandler = (e) => {
      if (e.key === "Escape") {
        _dlgClose();
        resolve(null);
      }
      if (e.key === "Enter") {
        _dlgClose();
        resolve(inp.value.trim() || null);
      }
    };
    document.addEventListener("keydown", document._dlgKeyHandler);
    setTimeout(() => inp.focus(), 60);
  });
}
