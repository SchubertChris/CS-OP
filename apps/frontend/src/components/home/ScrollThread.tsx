/* ============================================================
   CandleScope — Scroll Thread
   src/components/home/ScrollThread.tsx

   Eine durchgehende Linie, die zuerst UNSICHTBAR ist. Ein
   Diamant (der Hauptpunkt) fliegt scroll-synchron nach unten und
   ZEICHNET die Linie hinter sich (stroke-dashoffset). An vier
   Checkpoints explodiert ein Gold-Funken-Burst (einmalig).

   - viewBox 0 0 100 1000, preserveAspectRatio="none" → Linie
     streckt sich über die volle Seitenhöhe (Strichbreite bleibt
     dank vector-effect konstant).
   - Diamant + Bursts sind HTML-Elemente, prozentual positioniert
     (left = x%, top = y/10%) → nicht verzerrt.
   - Nur Desktop (lg+), reduced-motion → Linie statisch & dezent.
   ============================================================ */

import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, RefObject } from 'react'
import { useScroll, useMotionValueEvent, useReducedMotion } from 'framer-motion'

const PATH_D =
  'M50,18 C50,120 70,160 68,242 C66,322 36,352 34,432 C32,512 66,544 64,624 C62,706 38,734 40,814 C42,884 52,922 50,982'

/* Checkpoints als Pfad-Anteile (0..1) — hier explodiert es. */
const CHECKPOINTS = [0.16, 0.40, 0.74, 0.80]

interface Burst { id: number; x: number; y: number }

export default function ScrollThread({ targetRef }: { targetRef: RefObject<HTMLElement | null> }) {
  const pathRef = useRef<SVGPathElement>(null)
  const glowRef = useRef<SVGPathElement>(null)
  const coreRef = useRef<SVGPathElement>(null)
  const diamondRef = useRef<HTMLDivElement>(null)
  const lenRef = useRef(0)
  const firedRef = useRef<Set<number>>(new Set())
  const idRef = useRef(0)
  const reduced = useReducedMotion()
  const [bursts, setBursts] = useState<Burst[]>([])
  const [nodes, setNodes] = useState<{ x: number; y: number }[]>([])
  const [crackKey, setCrackKey] = useState(0)
  const crackedRef = useRef(false)

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end'],
  })

  useEffect(() => {
    const p = pathRef.current
    if (!p) return
    const len = p.getTotalLength()
    lenRef.current = len
    // Checkpoint-Punkte EINMAL exakt vorberechnen (für Nodes + Explosion identisch)
    setNodes(CHECKPOINTS.map(cp => {
      const pt = p.getPointAtLength(cp * len)
      return { x: pt.x, y: pt.y / 10 }
    }))
    // Track = volle, blasse Linie (immer da). Glow-Fill (Halo + Core) füllt nur das
    // bereits durchlaufene Stück → wächst mit dem Diamanten mit.
    const off = reduced ? '0' : `${len}`
    for (const el of [glowRef.current, coreRef.current]) {
      if (!el) continue
      el.style.strokeDasharray = `${len}`
      el.style.strokeDashoffset = off
    }
    if (reduced && diamondRef.current) diamondRef.current.style.opacity = '0'
  }, [reduced])

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (reduced) return
    const path = pathRef.current
    const len = lenRef.current
    if (!path || !len) return

    const prog = Math.max(0, Math.min(1, v))
    // „Durchbruch" an der Nav-Kante — weißer Riss beim Scroll-Start (re-armt ganz oben)
    if (prog > 0.012 && !crackedRef.current) {
      crackedRef.current = true
      setCrackKey(k => k + 1)
    } else if (prog < 0.004 && crackedRef.current) {
      crackedRef.current = false
    }

    // Glow-Fill (Halo + Core) füllt das durchlaufene Stück
    const off = `${len * (1 - prog)}`
    if (glowRef.current) glowRef.current.style.strokeDashoffset = off
    if (coreRef.current) coreRef.current.style.strokeDashoffset = off

    const pt = path.getPointAtLength(prog * len)
    const d = diamondRef.current
    if (d) {
      d.style.left = `${pt.x}%`
      d.style.top = `${pt.y / 10}%`
      d.style.opacity = prog > 0.01 && prog < 0.99 ? '1' : '0'
      // beim Reinkommen von oben „reinkrachen" — anfangs deutlich größer, settled schnell
      let scale = 1
      if (prog > 0.004 && prog < 0.07) {
        scale = 1 + ((0.07 - prog) / 0.066) * 1.7
      }
      d.style.transform = `translate(-50%, -50%) scale(${scale})`
    }

    CHECKPOINTS.forEach((cp, i) => {
      if (prog >= cp && !firedRef.current.has(i)) {
        firedRef.current.add(i)
        const id = idRef.current++
        // EXAKT am vorberechneten Checkpoint-Pfadpunkt — identisch zum sichtbaren Node
        const cpt = path.getPointAtLength(cp * len)
        setBursts(b => [...b, { id, x: cpt.x, y: cpt.y / 10 }])
        setTimeout(() => setBursts(b => b.filter(x => x.id !== id)), 1800)
      } else if (prog < cp - 0.03 && firedRef.current.has(i)) {
        // wieder „scharf" machen, wenn der Diamant den Checkpoint nach oben verlässt
        firedRef.current.delete(i)
      }
    })
  })

  return (
    <>
    {/* Linie + Diamant — hinter dem Inhalt (webt sich durch) */}
    <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
      <svg
        viewBox="0 0 100 1000"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
      >
        {/* Track — volle, blasse Linie */}
        <path
          ref={pathRef}
          className="cs-thread-track"
          d={PATH_D}
          fill="none"
          strokeWidth={1}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* Glow-Halo — weiche Aura auf dem durchlaufenen Stück */}
        <path
          ref={glowRef}
          className="cs-thread-glow"
          d={PATH_D}
          fill="none"
          strokeWidth={8}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* Glow-Core — heller Fortschritts-Strich */}
        <path
          ref={coreRef}
          className="cs-thread-core"
          d={PATH_D}
          fill="none"
          strokeWidth={1.7}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Diamant — der Hauptpunkt; der „Schweif" ist die glühende Linie dahinter */}
      <div
        ref={diamondRef}
        className="absolute"
        style={{ left: '50%', top: '1.8%', opacity: 0, transform: 'translate(-50%, -50%)', transition: 'opacity .3s ease' }}
      >
        <span className="cs-comet-head block" />
      </div>

      {/* Checkpoint-Nodes — exakt an den vorberechneten Pfadpunkten (= Explosions-Ort) */}
      {nodes.map((n, i) => (
        <div key={i} className="absolute" style={{ left: `${n.x}%`, top: `${n.y}%`, transform: 'translate(-50%, -50%)' }}>
          <span className="cs-checkpoint-node" />
        </div>
      ))}
    </div>

    {/* Explosionen — ÜBER dem Inhalt, sonst hinter Bildern unsichtbar */}
    <div className="hidden lg:block absolute inset-0 z-[25] pointer-events-none" aria-hidden="true">
      {bursts.map(b => <SparkBurst key={b.id} x={b.x} y={b.y} />)}
    </div>

    {/* Nav-Durchbruch — weißer Riss an der Nav-Kante beim Scroll-Start */}
    {crackKey > 0 && <NavImpact key={crackKey} />}
    </>
  )
}

/* ─── Eine einmalige, kräftige Gold-Partikel-Explosion ────── */
function SparkBurst({ x, y }: { x: number; y: number }) {
  // Positionen/Zufall EINMAL berechnen → springen bei Re-Renders nicht
  const dots = useMemo(
    () => Array.from({ length: 44 }, (_, i) => {
      const angle = (i / 44) * Math.PI * 2 + Math.random() * 0.5
      const dist = 110 + Math.random() * 220
      return {
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        size: 2 + (i % 4) * 2,
        light: i % 4 === 0,
        dur: 0.9 + Math.random() * 0.65,
      }
    }),
    [],
  )
  const shards = useMemo(
    () => Array.from({ length: 26 }, (_, i) => {
      const angle = (i / 26) * Math.PI * 2 + Math.random() * 0.7
      const dist = 100 + Math.random() * 210
      return {
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        rot: Math.random() * 760 - 380,
        w: 2 + Math.random() * 2.5,
        h: 9 + Math.random() * 11,
        dur: 1.0 + Math.random() * 0.65,
      }
    }),
    [],
  )

  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
      {/* harter Pop-Flash (Knall) — kurz & hell, kein expandierender Radius-Ring */}
      <span
        style={{
          position: 'absolute', left: '50%', top: '50%',
          width: 34, height: 34, marginLeft: -17, marginTop: -17,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #FFFDF5 0%, var(--cs-fx-spark) 46%, transparent 72%)',
          animation: 'cs-pop .26s ease-out forwards',
        }}
      />
      {/* Funken (Punkte) */}
      {dots.map((d, i) => {
        const style = {
          position: 'absolute', left: '50%', top: '50%',
          width: d.size, height: d.size, marginLeft: -d.size / 2, marginTop: -d.size / 2,
          borderRadius: '50%',
          background: d.light ? 'var(--cs-fx-spark-2)' : 'var(--cs-fx-spark)',
          boxShadow: '0 0 8px var(--cs-fx-glow)',
          '--dx': `${d.dx}px`,
          '--dy': `${d.dy}px`,
          animation: `cs-spark ${d.dur}s cubic-bezier(.16,1,.3,1) forwards`,
        } as CSSProperties
        return <span key={`d${i}`} style={style} />
      })}

      {/* Fragmente (Splitter) — fliegen raus und rotieren */}
      {shards.map((s, i) => {
        const style = {
          position: 'absolute', left: '50%', top: '50%',
          width: s.w, height: s.h, marginLeft: -s.w / 2, marginTop: -s.h / 2,
          borderRadius: 1,
          background: 'linear-gradient(180deg, var(--cs-fx-spark-2), var(--cs-fx-spark))',
          boxShadow: '0 0 6px var(--cs-fx-glow)',
          '--dx': `${s.dx}px`,
          '--dy': `${s.dy}px`,
          '--rot': `${s.rot}deg`,
          animation: `cs-frag ${s.dur}s cubic-bezier(.16,1,.3,1) forwards`,
        } as CSSProperties
        return <span key={`s${i}`} style={style} />
      })}
    </div>
  )
}

/* ─── Nav-Durchbruch — weißer „Glas-Riss" an der Nav-Kante beim Scroll-Start ─── */
function NavImpact() {
  const LINES = 8
  return (
    <div
      className="hidden lg:block"
      style={{ position: 'fixed', top: 66, left: '50%', transform: 'translate(-50%, -50%)', zIndex: 5, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {/* weißer Blitz */}
      <span
        style={{
          position: 'absolute', left: '50%', top: '50%',
          width: 64, height: 64, marginLeft: -32, marginTop: -32,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #ffffff 0%, rgba(255,255,255,.55) 36%, transparent 70%)',
          animation: 'cs-impact-flash .42s ease-out forwards',
        }}
      />
      {/* horizontaler Riss-Streifen entlang der Nav-Kante */}
      <span
        style={{
          position: 'absolute', left: '50%', top: '50%',
          width: 260, height: 2, marginLeft: -130, marginTop: -1,
          background: 'linear-gradient(90deg, transparent, #ffffff, transparent)',
          animation: 'cs-impact-streak .5s ease-out forwards',
        }}
      />
      {/* Riss-Linien (Splitter nach außen) */}
      {Array.from({ length: LINES }).map((_, i) => {
        const ang = (i / LINES) * 360 + (i % 2) * 16
        const style = {
          position: 'absolute', left: '50%', top: '50%',
          width: 2, height: 30, marginLeft: -1, marginTop: -1,
          transformOrigin: 'center top',
          background: 'linear-gradient(to bottom, #ffffff, transparent)',
          '--ang': `${ang}deg`,
          animation: 'cs-impact-line .42s cubic-bezier(.16,1,.3,1) forwards',
        } as CSSProperties
        return <span key={i} style={style} />
      })}
    </div>
  )
}
