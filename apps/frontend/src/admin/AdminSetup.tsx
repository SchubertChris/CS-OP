import { Shield } from 'lucide-react'

export default function AdminSetup() {
  return (
    <div className="min-h-screen bg-[var(--cs-bg)] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <Shield size={40} strokeWidth={1.5} className="text-[#C9A84C] mx-auto mb-6" />
        <h1 className="font-display text-2xl text-[var(--cs-text)] mb-4">TOTP Einrichten</h1>
        <p className="text-[var(--cs-text-2)] text-sm leading-relaxed mb-6">
          Öffne diese URL in einem Browser:<br />
          <code className="bg-[var(--cs-s4)] text-[var(--cs-text-2)] border border-[var(--cs-text)]/10 px-3 py-1 rounded text-xs mt-2 inline-block">
            /api/auth/totp-setup?token=DEIN_SETUP_TOKEN
          </code>
        </p>
        <p className="text-[var(--cs-text-3)] text-xs">
          Der Setup-Token ist in deinen Vercel Environment Variables gesetzt.
        </p>
      </div>
    </div>
  )
}
