import { Shield } from 'lucide-react'

export default function AdminSetup() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <Shield size={40} strokeWidth={1.5} className="text-[#C9A84C] mx-auto mb-6" />
        <h1 className="font-display text-2xl text-[#F5F0E8] mb-4">TOTP Einrichten</h1>
        <p className="text-[#9A9590] text-sm leading-relaxed mb-6">
          Öffne diese URL in einem Browser:<br />
          <code className="bg-[#111] text-[#C9A84C] px-3 py-1 rounded text-xs mt-2 inline-block">
            /api/auth/totp-setup?token=DEIN_SETUP_TOKEN
          </code>
        </p>
        <p className="text-[#5a5550] text-xs">
          Der Setup-Token ist in deinen Vercel Environment Variables gesetzt.
        </p>
      </div>
    </div>
  )
}
