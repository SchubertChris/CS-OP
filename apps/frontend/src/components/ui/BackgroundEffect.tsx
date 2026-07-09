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
          backgroundColor: theme === 'light' ? '#f2ede2' : '#080808' 
        }} 
      />

      {/* Modern Developer Grid Pattern — static & lightweight CSS */}
      <div 
        className="absolute inset-0 opacity-[0.018] mix-blend-normal"
        style={{
          backgroundImage: `linear-gradient(rgba(201,168,76,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.2) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Subtle Static Ambient Radial Glows (GPU Accelerated, 0% Active Load) */}
      <div 
        className="absolute -top-[12%] -left-[10%] w-[55vw] h-[55vw] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(201,168,76,0.18) 0%, transparent 70%)',
          opacity: theme === 'light' ? 0.25 : 0.45,
          filter: 'blur(90px)',
        }}
      />
      
      <div 
        className="absolute -bottom-[15%] -right-[10%] w-[45vw] h-[45vw] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(201,168,76,0.14) 0%, transparent 70%)',
          opacity: theme === 'light' ? 0.2 : 0.35,
          filter: 'blur(90px)',
        }}
      />

      {/* Premium static film-grain noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />
    </div>
  )
}