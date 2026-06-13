// ══════════════════════════════════════
//  TOAST — Benachrichtigungen
//  showToast(msg, type, duration)
//  type: 'success' | 'error' | 'info' | 'warning'
// ══════════════════════════════════════

const _toastIcons = {
  success: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`,
  error:   `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  info:    `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  warning: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
};

function showToast(msg, type = 'info', duration = 3200) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${_toastIcons[type] || _toastIcons.info}</div>
    <span class="toast-msg">${msg}</span>
    <button class="toast-close" onclick="this.closest('.toast')._dismiss()">✕</button>
  `;

  toast._dismiss = () => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 200);
  };

  container.appendChild(toast);

  const t = setTimeout(() => toast._dismiss(), duration);
  toast.addEventListener('mouseenter', () => clearTimeout(t));
  toast.addEventListener('mouseleave', () => {
    setTimeout(() => toast._dismiss(), 1200);
  });
}

// ══════════════════════════════════════
//  GLOBALE ERROR-BOUNDARY
//  Zeigt einen Toast statt leerer/kaputter Seite bei Laufzeitfehlern.
// ══════════════════════════════════════
let _lastErrToastAt = 0;
function _reportRuntimeError(detail) {
  try { console.error('[VaultBox] Laufzeitfehler:', detail); } catch (_) {}
  const now = Date.now();
  if (now - _lastErrToastAt < 2500) return; // Toast-Flut vermeiden
  _lastErrToastAt = now;
  try {
    if (typeof showToast === 'function') {
      showToast('Ein unerwarteter Fehler ist aufgetreten — die Aktion wurde abgebrochen. Deine gespeicherten Daten sind sicher.', 'error', 5000);
    }
  } catch (_) {}
}

window.addEventListener('error', (e) => {
  // Resource-Load-Fehler (img/script/link 404) ignorieren — nur echte JS-Fehler
  if (e && e.target && e.target !== window && e.target.tagName) return;
  _reportRuntimeError((e && (e.error || e.message)) || 'Fehler');
});
window.addEventListener('unhandledrejection', (e) => {
  _reportRuntimeError((e && e.reason) || 'Promise rejected');
});
