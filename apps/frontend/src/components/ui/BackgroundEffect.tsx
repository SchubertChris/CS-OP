/* ============================================================
   CandleScope — High-Performance Static Background
   src/components/ui/BackgroundEffect.tsx
   ============================================================ */

import { useTheme } from '../../contexts/ThemeContext'

export default function BackgroundEffect() {
  const { theme } = useTheme()

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Background color base with smooth transitions */}
      <div 
        className="absolute inset-0 transition-colors duration-500" 
        style={{ 
          backgroundColor: theme === 'light' ? '#f2ede2' : '#0a0a0a' 
        }} 
      />

      {/* Modern Developer Grid Pattern — static & lightweight CSS */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-normal"
        style={{
          backgroundImage: theme === 'light'
            ? `linear-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.08) 1px, transparent 1px)`
            : `linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Premium static film-grain noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.012] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />
    </div>
  )
}