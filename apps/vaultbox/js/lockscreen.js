// ══════════════════════════════════════
//  LOCKSCREEN — Passwortschutz
// ══════════════════════════════════════

const LOCK_KEY  = 'csf_pw_hash';
const LOCK_DONE = 'csf_unlocked';

// ── HASH-HELPERS ──────────────────────
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

async function _pwHash(pw) {
  if (window.csf?.pw) return window.csf.pw.hash(pw);
  return sha256(pw);
}

async function _pwVerify(pw, stored) {
  if (window.csf?.pw) return window.csf.pw.verify(pw, stored);
  return (await sha256(pw)) === stored;
}

// ── PASSWORT VALIDIERUNG ──────────────
function validatePassword(pw) {
  if (pw.length < 8)             return 'Mindestens 8 Zeichen';
  if (!/[A-Z]/.test(pw))        return 'Mindestens ein Großbuchstabe';
  if (!/[a-z]/.test(pw))        return 'Mindestens ein Kleinbuchstabe';
  if (!/[0-9]/.test(pw))        return 'Mindestens eine Zahl';
  if (!/[^A-Za-z0-9]/.test(pw)) return 'Mindestens ein Sonderzeichen';
  return null;
}

// ── LOCKSCREEN ANZEIGEN ───────────────
function showLockScreen(mode = 'unlock') {
  const el = document.getElementById('lockScreen');
  if (!el) return;
  el.style.display = 'flex';

  const isSetup = mode === 'setup';
  document.getElementById('lockTitle').textContent    = isSetup ? 'Passwort festlegen' : 'VaultBox entsperren';
  document.getElementById('lockSubtitle').textContent = isSetup
    ? 'Lege ein sicheres Passwort fest (mind. 8 Zeichen, Groß/Klein, Zahl, Sonderzeichen)'
    : 'Bitte Passwort eingeben um fortzufahren';

  const confirmRow = document.getElementById('lockConfirmRow');
  if (confirmRow) confirmRow.style.display = isSetup ? '' : 'none';

  const btn = document.getElementById('lockBtn');
  if (btn) btn.textContent = isSetup ? 'Passwort speichern' : 'Entsperren';
  btn.onclick = isSetup ? setupPassword : unlockApp;

  document.getElementById('lockError').textContent = '';
  document.getElementById('lockPw').value = '';
  if (document.getElementById('lockPwConfirm')) document.getElementById('lockPwConfirm').value = '';
  setTimeout(() => document.getElementById('lockPw').focus(), 100);
}

function hideLockScreen() {
  const el = document.getElementById('lockScreen');
  if (el) {
    el.classList.add('fade-out');
    setTimeout(() => { el.style.display = 'none'; el.classList.remove('fade-out'); }, 500);
  }
}

// ── PASSWORT EINRICHTEN ───────────────
async function setupPassword() {
  const pw  = document.getElementById('lockPw').value;
  const pw2 = document.getElementById('lockPwConfirm')?.value || '';
  const err = document.getElementById('lockError');

  const valErr = validatePassword(pw);
  if (valErr)    { err.textContent = valErr; return; }
  if (pw !== pw2){ err.textContent = 'Passwörter stimmen nicht überein'; return; }

  const hash = await _pwHash(pw);
  localStorage.setItem(LOCK_KEY, hash);
  hideLockScreen();
}

// ── ENTSPERREN ────────────────────────
async function unlockApp() {
  const pw      = document.getElementById('lockPw').value;
  const err     = document.getElementById('lockError');
  const stored  = localStorage.getItem(LOCK_KEY);
  const ok      = await _pwVerify(pw, stored);

  if (ok) {
    if (stored && !stored.startsWith('scrypt$') && window.csf?.pw) {
      const upgraded = await _pwHash(pw);
      localStorage.setItem(LOCK_KEY, upgraded);
    }
    sessionStorage.setItem(LOCK_DONE, '1');
    hideLockScreen();
  } else {
    err.textContent = 'Falsches Passwort';
    document.getElementById('lockPw').value = '';
    document.getElementById('lockPw').focus();
    // Shake-Animation
    const box = document.getElementById('lockBox');
    if (box) { box.classList.add('shake'); setTimeout(() => box.classList.remove('shake'), 500); }
  }
}

// ── ENTER-KEY ─────────────────────────
function lockKeydown(e) {
  if (e.key === 'Enter') {
    const isSetup = document.getElementById('lockConfirmRow')?.style.display !== 'none';
    if (isSetup) setupPassword(); else unlockApp();
  }
}

// ── INIT CHECK ────────────────────────
function checkLock() {
  let hasPassword = false;
  try {
    hasPassword = !!localStorage.getItem(LOCK_KEY);
    if (!!sessionStorage.getItem(LOCK_DONE)) return;
  } catch (_) {
    showLockScreen('unlock');
    return;
  }
  if (!hasPassword) return;
  showLockScreen('unlock');
}

// ══════════════════════════════════════
//  PRIVACY MODE + INAKTIVITÄTS-TIMER
// ══════════════════════════════════════

let _inactivityTimer = null;
let _privacyActive   = false;
const INACTIVITY_MS  = 5 * 60 * 1000; // 5 Minuten

function _resetInactivityTimer() {
  clearTimeout(_inactivityTimer);
  if (!CFG?.privacyAutoLock) return;
  _inactivityTimer = setTimeout(() => {
    if (typeof _vaultMode !== "undefined" && _vaultMode) { lockVaultNow(); return; } // Vault: DEK aus RAM
    if (localStorage.getItem(LOCK_KEY)) {
      _showPrivacyBlur(true);
    }
  }, INACTIVITY_MS);
}

function _buildPrivacyContent(overlay) {
  while (overlay.firstChild) overlay.removeChild(overlay.firstChild);
  const hasPw = !!localStorage.getItem(LOCK_KEY);

  const icon = document.createElement('div');
  icon.style.cssText = 'color:var(--blue);filter:drop-shadow(0 0 20px var(--blue-a35));display:flex';
  icon.innerHTML = (typeof iconHtml === 'function') ? iconHtml('lock', 42) : '🔒';
  overlay.appendChild(icon);

  const ttl = document.createElement('div');
  ttl.style.cssText = 'font-family:var(--sans);font-size:1em;font-weight:700;color:var(--text);letter-spacing:-.3px;';
  ttl.textContent = 'Inaktivitäts-Sperre';
  overlay.appendChild(ttl);

  const sub = document.createElement('div');
  sub.style.cssText = 'font-size:.75em;color:var(--text3);margin-bottom:4px;';
  sub.textContent = 'Nach 5 Min. Inaktivität gesperrt';
  overlay.appendChild(sub);

  if (hasPw) {
    const inp = document.createElement('input');
    inp.id = 'privacyPwInp';
    inp.type = 'password';
    inp.placeholder = 'Passwort eingeben…';
    inp.style.cssText =
      'width:220px;box-sizing:border-box;background:var(--panel2);border:1px solid var(--border2);' +
      'border-radius:var(--r1);padding:10px 14px;color:var(--text);font-size:.92em;outline:none;' +
      'text-align:center;font-family:var(--sans);';
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') unlockPrivacy(); });
    overlay.appendChild(inp);

    const err = document.createElement('div');
    err.id = 'privacyPwErr';
    err.style.cssText = 'font-size:.72em;color:var(--red);min-height:16px;margin-top:-8px;';
    overlay.appendChild(err);
  }

  const btn = document.createElement('button');
  btn.className = 'btn primary';
  btn.style.minWidth = '160px';
  btn.textContent = 'Entsperren';
  btn.addEventListener('click', unlockPrivacy);
  overlay.appendChild(btn);
}

function _showPrivacyBlur(show) {
  _privacyActive = show;
  let overlay = document.getElementById('privacyOverlay');
  if (show) {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'privacyOverlay';
      overlay.style.cssText =
        'position:fixed;inset:0;z-index:9998;background:rgba(8,10,18,0.96);' +
        'backdrop-filter:blur(24px);display:flex;align-items:center;' +
        'justify-content:center;flex-direction:column;gap:16px;';
      document.body.appendChild(overlay);
    }
    _buildPrivacyContent(overlay);
    overlay.style.display = 'flex';
    setTimeout(() => document.getElementById('privacyPwInp')?.focus(), 80);
  } else {
    if (overlay) overlay.style.display = 'none';
  }
}

async function unlockPrivacy() {
  if (!localStorage.getItem(LOCK_KEY)) {
    _showPrivacyBlur(false);
    _resetInactivityTimer();
    return;
  }
  const inp = document.getElementById('privacyPwInp');
  const pw  = inp ? inp.value : '';
  if (!pw) { inp?.focus(); return; }

  const ok = await _pwVerify(pw, localStorage.getItem(LOCK_KEY));
  if (ok) {
    _showPrivacyBlur(false);
    _resetInactivityTimer();
  } else {
    const errEl = document.getElementById('privacyPwErr');
    if (errEl) errEl.textContent = 'Falsches Passwort';
    if (inp) { inp.value = ''; inp.focus(); }
    const overlay = document.getElementById('privacyOverlay');
    if (overlay) {
      overlay.classList.add('privacy-shake');
      setTimeout(() => overlay.classList.remove('privacy-shake'), 450);
    }
  }
}

// Privacy blur toggle (manuell)
function togglePrivacyBlur() {
  if (_privacyActive) {
    unlockPrivacy();
  } else {
    _showPrivacyBlur(true);
  }
}

// Aktivitätserkennung
['mousemove','mousedown','keydown','scroll','touchstart','click'].forEach(ev => {
  document.addEventListener(ev, () => {
    if (_privacyActive) return;
    _resetInactivityTimer();
  }, { passive: true });
});

// ══════════════════════════════════════
//  VAULT-SPERRBILDSCHIRM (verschlüsselter Modus)
// ══════════════════════════════════════
// Nutzt dasselbe #lockScreen-DOM, ruft aber die echte Krypto (vault:unlock /
// enableEncryption) statt eines Hash-Vergleichs.
let _vaultUnlockResolve = null;   // beim Initial-Boot gesetzt; resolve() gibt den Boot frei
let _vaultBusy = false;           // verhindert Doppel-Submit / UI-Freeze

function showVaultUnlockUI() {
  const el = document.getElementById('lockScreen'); if (!el) return;
  el.style.display = 'flex';
  document.getElementById('lockTitle').textContent = 'VaultBox entsperren';
  document.getElementById('lockSubtitle').textContent = 'Master-Passwort eingeben — deine Daten sind verschlüsselt.';
  const cr = document.getElementById('lockConfirmRow'); if (cr) cr.style.display = 'none';
  const btn = document.getElementById('lockBtn'); if (btn) { btn.disabled = false; btn.textContent = 'Entsperren'; btn.onclick = submitVaultUnlock; }
  document.getElementById('lockError').textContent = '';
  const pw = document.getElementById('lockPw'); pw.value = '';
  pw.onkeydown = (e) => { if (e.key === 'Enter') submitVaultUnlock(); };
  _ensureRecoverLink(true);
  setTimeout(() => pw.focus(), 100);
}

async function submitVaultUnlock() {
  if (_vaultBusy) return;
  const pwEl = document.getElementById('lockPw'); const err = document.getElementById('lockError'); const pw = pwEl.value;
  if (!pw) { pwEl.focus(); return; }
  _vaultBusy = true;
  const btn = document.getElementById('lockBtn'); if (btn) { btn.disabled = true; btn.textContent = 'Entschlüssele…'; }
  err.textContent = '';
  try {
    const r = await unlockVaultFlow(pw, { initialBoot: !!_vaultUnlockResolve });
    if (r && r.ok) {
      sessionStorage.setItem(LOCK_DONE, '1'); hideLockScreen();
      const done = _vaultUnlockResolve; _vaultUnlockResolve = null; if (done) done(true);
    } else {
      const code = r && r.error;
      err.textContent = code === 'bad-password' ? 'Falsches Passwort' : 'Entsperren fehlgeschlagen' + (code ? ' (' + code + ')' : '');
      pwEl.value = ''; pwEl.focus();
      const box = document.getElementById('lockBox'); if (box) { box.classList.add('shake'); setTimeout(() => box.classList.remove('shake'), 500); }
    }
  } catch (e) { err.textContent = 'Unerwarteter Fehler beim Entsperren.'; }
  finally { _vaultBusy = false; if (btn) { btn.disabled = false; btn.textContent = 'Entsperren'; } }
}

// Blockierender Boot-Unlock: Promise resolved ERST bei erfolgreichem Entsperren.
function showVaultUnlockBlocking() {
  return new Promise((resolve) => { _vaultUnlockResolve = resolve; showVaultUnlockUI(); });
}

// In laufender Session sperren (Privacy-Timer / manuell): DEK im Main löschen, dann Re-Unlock.
async function lockVaultNow() {
  if (!window.csf?.vault) return;
  await window.csf.vault.lock();
  sessionStorage.removeItem(LOCK_DONE);
  showVaultUnlockUI();   // _vaultUnlockResolve bleibt null → Re-Unlock-Modus (kein Hydrate)
}

// ── VAULT EINRICHTEN (Verschlüsselung aktivieren) ──
function showVaultSetupUI() {
  const el = document.getElementById('lockScreen'); if (!el) return;
  el.style.display = 'flex';
  document.getElementById('lockTitle').textContent = 'Verschlüsselung aktivieren';
  document.getElementById('lockSubtitle').textContent = 'Master-Passwort festlegen. Du bekommst danach einen Notfall-Schlüssel zum Aufschreiben — das ist die EINZIGE Rettung, falls du das Passwort vergisst.';
  const cr = document.getElementById('lockConfirmRow'); if (cr) cr.style.display = '';
  const btn = document.getElementById('lockBtn'); if (btn) { btn.disabled = false; btn.textContent = 'Verschlüsseln'; btn.onclick = submitVaultSetup; }
  document.getElementById('lockError').textContent = '';
  const pw = document.getElementById('lockPw'); const pw2 = document.getElementById('lockPwConfirm');
  pw.value = ''; if (pw2) pw2.value = '';
  pw.onkeydown = (e) => { if (e.key === 'Enter' && pw2) pw2.focus(); };
  if (pw2) pw2.onkeydown = (e) => { if (e.key === 'Enter') submitVaultSetup(); };
  _ensureRecoverLink(false);
  setTimeout(() => pw.focus(), 100);
}

async function submitVaultSetup() {
  if (_vaultBusy) return;
  const pwEl = document.getElementById('lockPw'); const pw2El = document.getElementById('lockPwConfirm'); const err = document.getElementById('lockError');
  const pw = pwEl.value; const pw2 = pw2El ? pw2El.value : '';
  const valErr = validatePassword(pw); if (valErr) { err.textContent = valErr; return; }
  if (pw !== pw2) { err.textContent = 'Passwörter stimmen nicht überein'; return; }
  _vaultBusy = true;
  const btn = document.getElementById('lockBtn'); if (btn) { btn.disabled = true; btn.textContent = 'Verschlüssele…'; }
  err.textContent = '';
  try {
    const r = await enableEncryption(pw);
    if (r && r.ok) {
      sessionStorage.setItem(LOCK_DONE, '1'); hideLockScreen();
      if (r.recoveryCode) await showRecoveryCodeOverlay(r.recoveryCode);   // Notfall-Schlüssel EINMALIG zeigen
      if (typeof showToast === 'function') showToast('Verschlüsselung aktiv — deine Daten sind jetzt verschlüsselt.', 'success', 3500);
      if (typeof renderSettings === 'function') renderSettings();
    } else {
      err.textContent = (r && r.error) || 'Aktivierung fehlgeschlagen — deine Daten sind unverändert erhalten.';
    }
  } catch (e) { err.textContent = 'Unerwarteter Fehler — deine Daten sind unverändert.'; }
  finally { _vaultBusy = false; if (btn) { btn.disabled = false; btn.textContent = 'Verschlüsseln'; } }
}

// ── RECOVERY (Passwort vergessen) ──
function _ensureRecoverLink(show) {
  let rl = document.getElementById('vaultRecoverLink');
  if (!rl) {
    rl = document.createElement('div');
    rl.id = 'vaultRecoverLink';
    rl.style.cssText = 'margin-top:14px;font-size:12px;color:var(--text3,#888);cursor:pointer;text-decoration:underline;text-align:center;';
    rl.textContent = 'Passwort vergessen? Mit Notfall-Schlüssel entsperren';
    rl.addEventListener('click', showVaultRecoverUI);
    const box = document.getElementById('lockBox') || document.getElementById('lockScreen');
    if (box) box.appendChild(rl);
  }
  rl.style.display = show ? '' : 'none';
}

function showVaultRecoverUI() {
  const el = document.getElementById('lockScreen'); if (!el) return;
  el.style.display = 'flex';
  document.getElementById('lockTitle').textContent = 'Mit Notfall-Schlüssel entsperren';
  document.getElementById('lockSubtitle').textContent = 'Recovery-Code eingeben und ein neues Master-Passwort festlegen.';
  const cr = document.getElementById('lockConfirmRow'); if (cr) cr.style.display = '';
  const pw = document.getElementById('lockPw'); const pw2 = document.getElementById('lockPwConfirm');
  pw.value = ''; if (pw2) pw2.value = '';
  pw.placeholder = 'Notfall-Schlüssel (XXXXX-XXXXX-…)';
  if (pw2) pw2.placeholder = 'Neues Master-Passwort';
  const btn = document.getElementById('lockBtn'); if (btn) { btn.disabled = false; btn.textContent = 'Wiederherstellen'; btn.onclick = submitVaultRecover; }
  document.getElementById('lockError').textContent = '';
  pw.onkeydown = (e) => { if (e.key === 'Enter' && pw2) pw2.focus(); };
  if (pw2) pw2.onkeydown = (e) => { if (e.key === 'Enter') submitVaultRecover(); };
  _ensureRecoverLink(false);
  setTimeout(() => pw.focus(), 100);
}

async function submitVaultRecover() {
  if (_vaultBusy) return;
  const codeEl = document.getElementById('lockPw'); const pwEl = document.getElementById('lockPwConfirm'); const err = document.getElementById('lockError');
  const code = codeEl.value; const newPw = pwEl ? pwEl.value : '';
  if (!code) { codeEl.focus(); return; }
  const valErr = validatePassword(newPw); if (valErr) { err.textContent = 'Neues Passwort: ' + valErr; return; }
  _vaultBusy = true;
  const btn = document.getElementById('lockBtn'); if (btn) { btn.disabled = true; btn.textContent = 'Stelle wieder her…'; }
  err.textContent = '';
  try {
    const r = await window.csf.vault.recover(code, newPw);
    if (r && r.ok) {
      setVaultMode(true);
      hydrate(r.state);
      sessionStorage.setItem(LOCK_DONE, '1'); hideLockScreen();
      const done = _vaultUnlockResolve; _vaultUnlockResolve = null; if (done) done(true);
      if (typeof showToast === 'function') showToast('Wiederhergestellt — neues Passwort gesetzt.', 'success', 3500);
    } else {
      err.textContent = (r && r.error === 'bad-recovery') ? 'Notfall-Schlüssel ungültig' : 'Wiederherstellung fehlgeschlagen' + (r && r.error ? ' (' + r.error + ')' : '');
      codeEl.focus();
      const box = document.getElementById('lockBox'); if (box) { box.classList.add('shake'); setTimeout(() => box.classList.remove('shake'), 500); }
    }
  } catch (e) { err.textContent = 'Unerwarteter Fehler bei der Wiederherstellung.'; }
  finally { _vaultBusy = false; if (btn) { btn.disabled = false; btn.textContent = 'Wiederherstellen'; } }
}

// Zeigt den Notfall-Schlüssel EINMALIG; resolved erst nach Bestätigung "notiert".
function showRecoveryCodeOverlay(code) {
  return new Promise((resolve) => {
    const ov = document.createElement('div');
    ov.id = 'recoveryOverlay';
    ov.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(8,8,6,0.97);display:flex;align-items:center;justify-content:center;';
    const card = document.createElement('div');
    card.style.cssText = 'max-width:440px;text-align:center;padding:32px;font-family:var(--sans,Segoe UI,Arial);color:var(--text,#e8e4da);';
    const h = document.createElement('div'); h.style.cssText = 'font-size:20px;font-weight:700;color:var(--blue,#d4a843);margin-bottom:10px;'; h.textContent = '🔑 Notfall-Schlüssel — JETZT notieren';
    const p = document.createElement('div'); p.style.cssText = 'font-size:13px;line-height:1.6;color:var(--text3,#b8b2a6);margin-bottom:18px;'; p.textContent = 'Das ist der EINZIGE Weg, deinen Vault zu öffnen, falls du dein Passwort vergisst. Er wird nur EINMAL angezeigt und nirgends gespeichert. Schreib ihn auf und bewahre ihn getrennt vom Gerät auf.';
    const codeBox = document.createElement('div'); codeBox.style.cssText = 'font-family:var(--mono,DM Mono,monospace);font-size:18px;letter-spacing:1px;background:var(--panel2,#1a1a17);border:1px solid var(--border2,#333);border-radius:8px;padding:16px;margin-bottom:14px;user-select:all;word-break:break-all;'; codeBox.textContent = code;
    const copyBtn = document.createElement('button'); copyBtn.className = 'btn'; copyBtn.style.marginBottom = '16px'; copyBtn.textContent = 'In Zwischenablage kopieren';
    copyBtn.addEventListener('click', () => { try { navigator.clipboard.writeText(code); copyBtn.textContent = '✓ Kopiert'; } catch (_) {} });
    const chk = document.createElement('label'); chk.style.cssText = 'display:flex;gap:8px;align-items:center;justify-content:center;font-size:12px;color:var(--text3,#b8b2a6);margin-bottom:14px;cursor:pointer;';
    const cb = document.createElement('input'); cb.type = 'checkbox';
    chk.appendChild(cb); chk.appendChild(document.createTextNode('Ich habe den Notfall-Schlüssel sicher notiert.'));
    const okBtn = document.createElement('button'); okBtn.className = 'btn primary'; okBtn.disabled = true; okBtn.style.minWidth = '200px'; okBtn.textContent = 'Fertig';
    cb.addEventListener('change', () => { okBtn.disabled = !cb.checked; });
    okBtn.addEventListener('click', () => { ov.remove(); resolve(); });
    card.appendChild(h); card.appendChild(p); card.appendChild(codeBox); card.appendChild(copyBtn); card.appendChild(chk); card.appendChild(okBtn);
    ov.appendChild(card); document.body.appendChild(ov);
  });
}