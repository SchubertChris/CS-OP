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
  const hasPassword = !!localStorage.getItem(LOCK_KEY);
  const isUnlocked  = !!sessionStorage.getItem(LOCK_DONE);

  if (!hasPassword) return; // Kein Passwort gesetzt → direkt rein
  if (isUnlocked)   return; // Diese Session bereits entsperrt

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
    if (localStorage.getItem(LOCK_KEY)) {
      _showPrivacyBlur(true);
    }
  }, INACTIVITY_MS);
}

function _buildPrivacyContent(overlay) {
  while (overlay.firstChild) overlay.removeChild(overlay.firstChild);
  const hasPw = !!localStorage.getItem(LOCK_KEY);

  const icon = document.createElement('div');
  icon.style.cssText = 'font-size:2.5em;filter:drop-shadow(0 0 20px var(--blue-a35))';
  icon.textContent = '🔒';
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