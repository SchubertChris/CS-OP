/* ============================================================
   CandleScope — Admin Settings / System
   src/admin/AdminSettings.tsx
   ============================================================ */

import { Shield, Database, Key, Server, ChevronRight } from 'lucide-react'

const systemModules = [
  {
    icon: Shield, label: 'AUTH', title: 'Authentifizierung',
    status: 'BYPASS · PHASE 1', statusColor: '#C9A84C',
    desc: 'Phase 2: JWT via NestJS API ersetzt den PIN-Bypass.',
    action: 'PIN einrichten', disabled: true,
  },
  {
    icon: Database, label: 'DATA', title: 'Datenquelle',
    status: 'localStorage · AKTIV', statusColor: '#00C896',
    desc: 'Phase 2: NestJS API + PostgreSQL. Gleiche Store-Struktur.',
    action: 'API verbinden', disabled: true,
  },
  {
    icon: Key, label: 'KEYS', title: 'Admin-Zugang',
    status: 'URL-KEY · AKTIV', statusColor: '#C9A84C',
    desc: '/admin?key=cs2025admin — nur wer die URL kennt kommt rein.',
    action: 'Key ändern', disabled: true,
  },
  {
    icon: Server, label: 'HOST', title: 'Hosting',
    status: 'LOKAL · DEV', statusColor: '#4a9eff',
    desc: 'Phase 1: localhost. Phase 2: IONOS VPS · Ubuntu · Nginx.',
    action: 'VPS verbinden', disabled: true,
  },
]

export default function AdminSettings() {
  return (
    <div className="p-6 md:p-10 max-w-3xl">

      <div className="mb-8">
        <p className="font-mono text-[11px] tracking-[0.2em] text-[var(--cs-text-2)] uppercase mb-3">── SYSTEM CONFIG</p>
        <h1 className="font-display text-3xl text-[var(--cs-text)] tracking-tight">System</h1>
      </div>

      <div className="flex flex-col gap-3">
        {systemModules.map(({ icon: Icon, label, title, status, statusColor, desc, action, disabled }) => (
          <div
            key={label}
            className="border border-[var(--cs-text)]/8 rounded-xl p-5 bg-[var(--cs-s2)] hover:border-[#C9A84C]/15 transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl border border-[var(--cs-text)]/10 bg-[var(--cs-s4)] flex items-center justify-center shrink-0">
                <Icon size={17} strokeWidth={1.5} className="text-[var(--cs-text-2)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="font-mono text-[10px] tracking-[0.16em] text-[var(--cs-text-3)]">{label}</span>
                  <span className="text-[14px] font-medium text-[var(--cs-text)]">{title}</span>
                  <span className="font-mono text-[10px] tracking-[0.1em] ml-auto shrink-0" style={{ color: statusColor + '90' }}>
                    {status}
                  </span>
                </div>
                <p className="text-[13px] text-[var(--cs-text-2)] leading-relaxed mb-3">{desc}</p>
                <button
                  disabled={disabled}
                  className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--cs-text-3)] hover:text-[#C9A84C] disabled:cursor-not-allowed transition-colors"
                >
                  {action}
                  <ChevronRight size={11} strokeWidth={1.5} />
                  {disabled && <span className="text-[10px] text-[var(--cs-text-3)] ml-1">· Phase 2</span>}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 border border-dashed border-[#C9A84C]/10 rounded-xl">
        <p className="font-mono text-[11px] text-[var(--cs-text-3)] tracking-[0.1em] leading-relaxed">
          CS-ADMIN v1.0 · PHASE-1 · BYPASS-MODE · BUILD 2026.03
        </p>
      </div>
    </div>
  )
}
