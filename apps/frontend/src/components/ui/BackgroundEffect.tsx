/* ============================================================
   CandleScope — Background Effect
   src/components/ui/BackgroundEffect.tsx
   Mobile: deaktiviert (spart CPU + Akku)
   Desktop: langsam gleitende Orbs
   ============================================================ */
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const ORBS = [
  { w: 600, h: 600, x: -10, y: -5, tx: 8, ty: 12, duration: 28, delay: 0, opacity: 0.045 },
  { w: 500, h: 500, x: 70, y: 60, tx: -10, ty: -8, duration: 35, delay: 5, opacity: 0.035 },
  { w: 700, h: 700, x: 40, y: -15, tx: -6, ty: 15, duration: 42, delay: 10, opacity: 0.025 },
  { w: 400, h: 400, x: 85, y: 20, tx: -12, ty: 8, duration: 30, delay: 3, opacity: 0.04 },
  { w: 550, h: 550, x: 20, y: 70, tx: 10, ty: -10, duration: 38, delay: 8, opacity: 0.03 },
  { w: 350, h: 350, x: 60, y: 85, tx: -8, ty: -12, duration: 25, delay: 15, opacity: 0.035 },
]

export default function BackgroundEffect() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Auf Mobile nur statische Orbs — kein Infinite-Animation
  if (isMobile) {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
        {ORBS.slice(0, 2).map((orb, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: orb.w * 0.6,
              height: orb.h * 0.6,
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              background: 'radial-gradient(circle, rgba(201,168,76,1) 0%, transparent 70%)',
              opacity: orb.opacity * 0.6,
              filter: 'blur(60px)',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.w,
            height: orb.h,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            background: 'radial-gradient(circle, rgba(201,168,76,1) 0%, transparent 70%)',
            opacity: orb.opacity,
            filter: 'blur(80px)',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            x: [`0%`, `${orb.tx}%`, `${orb.tx * 0.5}%`, `0%`],
            y: [`0%`, `${orb.ty}%`, `${orb.ty * 0.3}%`, `0%`],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatType: 'mirror',
          }}
        />
      ))}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />
    </div>
  )
}