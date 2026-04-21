/* ============================================================
   CandleScope — Intro Animation (App-Style Splash)
   Orbital rings · Particles · Logo box · Beam · Wordmark
   Pure CSS animations, no THREE.js
   ============================================================ */
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import csLogo from '../../assets/images/CandleScopeLogo.png'

const GOLD = '#C9A84C'
const DISPLAY_MS = 2600

const KEYFRAMES = `
@keyframes sp-halo-appear { from { opacity: 0 } to { opacity: 1 } }
@keyframes sp-halo-cw-72  { from { transform: rotateX(72deg) rotateZ(0deg)   } to { transform: rotateX(72deg) rotateZ(360deg)   } }
@keyframes sp-halo-ccw-58 { from { transform: rotateX(58deg) rotateZ(0deg)   } to { transform: rotateX(58deg) rotateZ(-360deg)  } }
@keyframes sp-halo-cw-80  { from { transform: rotateX(80deg) rotateZ(0deg)   } to { transform: rotateX(80deg) rotateZ(360deg)   } }
@keyframes sp-logo-in     { from { opacity:0; transform:scale(0.88) translateY(8px) } to { opacity:1; transform:scale(1) translateY(0) } }
@keyframes sp-beam        { from { width:0 } to { width:260px } }
@keyframes sp-dots        { from { opacity:0 } to { opacity:1 } }
@keyframes sp-title       { from { clip-path:inset(0 100% 0 0) } to { clip-path:inset(0 0% 0 0) } }
@keyframes sp-sub         { from { opacity:0 } to { opacity:1 } }
@keyframes sp-pt-in       { from { opacity:0 } to { opacity:1 } }
@keyframes sp-orbit-1 { from{transform:rotate(0deg)   translateX(76px)  rotate(0deg)}   to{transform:rotate(360deg)  translateX(76px)  rotate(-360deg)} }
@keyframes sp-orbit-2 { from{transform:rotate(60deg)  translateX(96px)  rotate(-60deg)  translateY(12px)}  to{transform:rotate(420deg)  translateX(96px)  rotate(-420deg) translateY(12px)} }
@keyframes sp-orbit-3 { from{transform:rotate(130deg) translateX(66px)  rotate(-130deg) translateY(-8px)}  to{transform:rotate(490deg)  translateX(66px)  rotate(-490deg) translateY(-8px)} }
@keyframes sp-orbit-4 { from{transform:rotate(200deg) translateX(110px) rotate(-200deg) translateY(18px)}  to{transform:rotate(560deg)  translateX(110px) rotate(-560deg) translateY(18px)} }
@keyframes sp-orbit-5 { from{transform:rotate(290deg) translateX(82px)  rotate(-290deg) translateY(-14px)} to{transform:rotate(650deg)  translateX(82px)  rotate(-650deg) translateY(-14px)} }
@keyframes sp-orbit-6 { from{transform:rotate(45deg)  translateX(120px) rotate(-45deg)  translateY(6px)}   to{transform:rotate(405deg)  translateX(120px) rotate(-405deg) translateY(6px)} }
@keyframes sp-orbit-7 { from{transform:rotate(170deg) translateX(58px)  rotate(-170deg) translateY(-10px)} to{transform:rotate(530deg)  translateX(58px)  rotate(-530deg) translateY(-10px)} }
@keyframes sp-orbit-8 { from{transform:rotate(320deg) translateX(102px) rotate(-320deg) translateY(20px)}  to{transform:rotate(680deg)  translateX(102px) rotate(-680deg) translateY(20px)} }
`

const PARTICLES: { w: number; delay: string; orbit: string; dur: string; blur: string; dimmed?: boolean }[] = [
  { w: 5, delay: '0.70s', orbit: 'sp-orbit-1', dur: '4.2s', blur: '0.5px' },
  { w: 3, delay: '0.85s', orbit: 'sp-orbit-2', dur: '5.8s', blur: '1px',  dimmed: true },
  { w: 4, delay: '0.65s', orbit: 'sp-orbit-3', dur: '3.6s', blur: '0px'  },
  { w: 2, delay: '0.90s', orbit: 'sp-orbit-4', dur: '7.1s', blur: '1.5px',dimmed: true },
  { w: 5, delay: '0.75s', orbit: 'sp-orbit-5', dur: '4.9s', blur: '0.5px'},
  { w: 3, delay: '1.00s', orbit: 'sp-orbit-6', dur: '6.3s', blur: '1px',  dimmed: true },
  { w: 4, delay: '0.80s', orbit: 'sp-orbit-7', dur: '3.9s', blur: '0px'  },
  { w: 2, delay: '0.95s', orbit: 'sp-orbit-8', dur: '8.0s', blur: '1.5px',dimmed: true },
]

const CORNERS = [
  'top-5 left-5 border-t border-l',
  'top-5 right-5 border-t border-r',
  'bottom-5 left-5 border-b border-l',
  'bottom-5 right-5 border-b border-r',
]

export default function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true)
  const doneRef = useRef(false)

  const complete = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    setVisible(false)
    setTimeout(onComplete, 520)
  }, [onComplete])

  useEffect(() => {
    const orig = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const t = setTimeout(complete, DISPLAY_MS)
    return () => { clearTimeout(t); document.body.style.overflow = orig }
  }, [complete])

  return (
    <>
      <style>{KEYFRAMES}</style>
      <AnimatePresence>
        {visible && (
          <motion.div
            key="intro"
            className="fixed inset-0 z-[300] flex flex-col items-center justify-center"
            style={{ background: 'var(--cs-bg)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            {/* Subtle grid */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'linear-gradient(rgba(201,168,76,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.012) 1px,transparent 1px)',
              backgroundSize: '64px 64px',
            }} />

            {/* Orbital rings + particles + logo */}
            <div className="relative flex items-center justify-center mb-8">

              {/* Halo perspective anchor */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                perspective: '700px', perspectiveOrigin: '50% 50%',
                width: 0, height: 0,
                transform: 'translate(-50%,-50%)',
                pointerEvents: 'none',
              }}>
                {/* Halo A — 230px, 72°, CW 9s */}
                <div style={{
                  position:'absolute', width:230, height:230, top:-115, left:-115,
                  borderRadius:'50%', borderStyle:'solid', borderWidth:1.5, boxSizing:'border-box',
                  borderColor:'rgba(201,168,76,0.35) rgba(201,168,76,0.12) rgba(201,168,76,0.08) rgba(201,168,76,0.20)',
                  boxShadow:'0 0 18px 2px rgba(201,168,76,0.08),inset 0 0 12px rgba(201,168,76,0.08)',
                  opacity:0,
                  animation:'sp-halo-appear 0.7s ease 0.3s forwards,sp-halo-cw-72 9s linear 0.3s infinite',
                }} />
                {/* Halo B — 170px, 58°, CCW 14s */}
                <div style={{
                  position:'absolute', width:170, height:170, top:-85, left:-85,
                  borderRadius:'50%', borderStyle:'solid', borderWidth:1, boxSizing:'border-box',
                  borderColor:'rgba(201,168,76,0.20) rgba(201,168,76,0.08) rgba(201,168,76,0.12) rgba(201,168,76,0.25)',
                  boxShadow:'0 0 10px 1px rgba(201,168,76,0.08)',
                  opacity:0,
                  animation:'sp-halo-appear 0.7s ease 0.5s forwards,sp-halo-ccw-58 14s linear 0.5s infinite',
                }} />
                {/* Halo C — 300px, 80°, CW 24s, blurred */}
                <div style={{
                  position:'absolute', width:300, height:300, top:-150, left:-150,
                  borderRadius:'50%', borderStyle:'solid', borderWidth:1, boxSizing:'border-box',
                  borderColor:'rgba(201,168,76,0.12) transparent rgba(201,168,76,0.08) transparent',
                  boxShadow:'0 0 30px 6px rgba(201,168,76,0.08)',
                  filter:'blur(1.5px)', opacity:0,
                  animation:'sp-halo-appear 0.9s ease 0.15s forwards,sp-halo-cw-80 24s linear 0.15s infinite',
                }} />
              </div>

              {/* Orbital particles */}
              {PARTICLES.map((p, i) => (
                <div key={i} style={{
                  position:'absolute', width:p.w, height:p.w, borderRadius:'50%',
                  background: p.dimmed ? `rgba(201,168,76,0.25)` : GOLD,
                  filter:`blur(${p.blur})`, opacity:0,
                  animation:`${p.orbit} ${p.dur} linear ${p.delay} infinite,sp-pt-in 0.4s ease ${p.delay} forwards`,
                }} />
              ))}

              {/* Logo box */}
              <div style={{
                position:'relative', zIndex:1,
                width:100, height:100, borderRadius:26,
                background:'radial-gradient(circle at 22% 12%,rgba(255,255,255,0.10),transparent 52%),linear-gradient(145deg,#131420,#07080f)',
                border:'1px solid rgba(201,168,76,0.25)',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 0 0 1px rgba(201,168,76,0.12),0 24px 56px rgba(0,0,0,0.65),0 0 80px rgba(201,168,76,0.15)',
                opacity:0,
                animation:'sp-logo-in 0.55s cubic-bezier(0.22,1,0.36,1) 0.15s forwards',
              }}>
                <img src={csLogo} alt="CandleScope"
                  style={{ width:52, height:52, borderRadius:12, objectFit:'contain' }} />
              </div>
            </div>

            {/* Gold beam */}
            <div style={{
              width:260, height:1, marginBottom:20,
              position:'relative', display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <div style={{
                height:1, width:0,
                background:GOLD,
                boxShadow:`0 0 12px 2px rgba(201,168,76,0.35),0 0 40px 8px rgba(201,168,76,0.15)`,
                animation:'sp-beam 0.65s cubic-bezier(0.22,1,0.36,1) 0.62s forwards',
              }} />
              {/* Endpoint dot — left */}
              <div style={{
                position:'absolute', left:0, top:'50%', transform:'translateY(-50%)',
                width:4, height:4, borderRadius:'50%', background:GOLD,
                boxShadow:`0 0 8px 2px rgba(201,168,76,0.35)`,
                opacity:0, animation:'sp-dots 0.3s ease 1.2s forwards',
              }} />
              {/* Endpoint dot — right */}
              <div style={{
                position:'absolute', right:0, top:'50%', transform:'translateY(-50%)',
                width:4, height:4, borderRadius:'50%', background:GOLD,
                boxShadow:`0 0 8px 2px rgba(201,168,76,0.35)`,
                opacity:0, animation:'sp-dots 0.3s ease 1.2s forwards',
              }} />
            </div>

            {/* Wordmark */}
            <div style={{ textAlign:'center' }}>
              <p style={{
                fontFamily:"'Space Grotesk',sans-serif",
                fontSize:'1.8em', fontWeight:800,
                letterSpacing:'0.22em', textTransform:'uppercase',
                color:'var(--cs-text)',
                clipPath:'inset(0 100% 0 0)',
                animation:'sp-title 0.65s cubic-bezier(0.22,1,0.36,1) 1.0s forwards',
              }}>
                Candle<span style={{color:GOLD}}>Scope</span>
              </p>
              <p style={{
                fontFamily:"'DM Mono',monospace",
                fontSize:'0.62em', fontWeight:600,
                color:GOLD, letterSpacing:'0.32em', textTransform:'uppercase',
                opacity:0, marginTop:6,
                animation:'sp-sub 0.45s ease 1.5s forwards',
              }}>
                Finance · WebDev · Trading
              </p>
            </div>

            {/* Corner brackets */}
            {CORNERS.map((cls, i) => (
              <motion.div key={i}
                className={`absolute w-5 h-5 border-[#C9A84C]/18 pointer-events-none ${cls}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              />
            ))}

            {/* Skip */}
            <motion.button
              onClick={complete}
              className="absolute bottom-9 right-10 font-mono text-[10px] tracking-[0.22em] uppercase text-[#403a35] hover:text-[#C9A84C] transition-colors duration-300 cursor-pointer"
              style={{ WebkitAppearance:'none', appearance:'none', background:'none', border:'none' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Skip ›
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
