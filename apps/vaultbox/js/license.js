// ══════════════════════════════════════
//  LICENSE — Aktivierung & Offline-Check
// ══════════════════════════════════════

let _licenseValid = false;

async function checkLicense() {
  if (!window.csf?.license) {
    _licenseValid = true;
    return;
  }
  const result = await window.csf.license.check();
  _licenseValid = result.valid;
  if (!_licenseValid) {
    _showLicenseScreen();
  }
}

function _showLicenseScreen() {
  const el = document.getElementById("licenseScreen");
  if (el) el.style.display = "flex";
}

function _hideLicenseScreen() {
  const el = document.getElementById("licenseScreen");
  if (el) el.style.display = "none";
}

async function activateLicense() {
  const inp = document.getElementById("licenseKeyInput");
  const errEl = document.getElementById("licenseError");
  const btn = document.getElementById("licenseActivateBtn");
  if (!inp || !btn || !errEl) return;

  const key = inp.value.trim();
  if (!key) { errEl.textContent = "Bitte Lizenzschlüssel eingeben."; return; }

  btn.disabled = true;
  btn.textContent = "Überprüfe…";
  errEl.textContent = "";

  if (!window.csf?.license?.activate) {
    errEl.textContent = "Lizenz-System nicht verfügbar. Bitte App neu starten.";
    btn.disabled = false;
    btn.textContent = "Jetzt aktivieren";
    return;
  }

  const result = await window.csf.license.activate(key);
  if (result.ok) {
    _licenseValid = true;
    _hideLicenseScreen();
    if (typeof showToast === "function") showToast("Lizenz aktiviert! Willkommen bei VaultBox.", "success", 4000);
  } else {
    errEl.textContent = result.error || "Ungültiger Lizenzschlüssel. Bitte prüfe deine Eingabe.";
    btn.disabled = false;
    btn.textContent = "Jetzt aktivieren";
  }
}
