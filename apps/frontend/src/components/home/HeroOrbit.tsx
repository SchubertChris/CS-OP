/* ============================================================
   CandleScope — Hero Orbit (3D Agent-Organigramm / Security)
   src/components/home/HeroOrbit.tsx

   Streng gekapselt: alles liegt im relativen .cs-orbit-Wrapper,
   innere Elemente sind absolute → keine globalen Styles, kein
   Eingriff in Scroll/Layout. Transparenter Hintergrund.

   - Zentrum: Shield-Kern mit Box-Shadow/Glow-Pulse („atmet").
   - 3 gekippte, konzentrische 3D-Ellipsen-Ringe (rotateX 62°),
     hauchdünn (Gold, ~20–30 % Opacity), je ein orbitierender Punkt.
   - Radar-Sweep: conic-gradient, endlos rotierend.
   - Agenten-Nodes (Finance/Commerce/Security) am Rand, mit Icon
     + Label + sanftem Glow-Pulse.
   - Datenströme: SVG-Linien vom Zentrum zu den Nodes; kleine
     Licht-Pakete wandern via stroke-dasharray/-dashoffset.
   - Sunburst-Filamente als dezente Tiefe.
   reduced-motion → alles statisch.
   ============================================================ */

import { useReducedMotion } from 'framer-motion'
import { ShieldCheck, Coins, ShoppingCart, Package, FileText, Users, Cpu } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Node { x: number; y: number; label: string; Icon: LucideIcon }

/* Security = Kern in der Mitte. Die Nodes = Domänen, die er absichert
   (eindeutig, keine Doppelungen). */
const NODES: Node[] = [
  { x: 24, y: 15, label: 'Finanzen',     Icon: Coins },
  { x: 79, y: 18, label: 'Produkte',     Icon: Package },
  { x: 91, y: 52, label: 'Verträge',     Icon: FileText },
  { x: 74, y: 85, label: 'Bestellungen', Icon: ShoppingCart },
  { x: 22, y: 83, label: 'Kundendaten',  Icon: Users },
  { x: 9,  y: 50, label: 'Automation',   Icon: Cpu },
]

/* dichte Filament-Fächer (deterministisch) — laufen zu jedem Node zusammen */
const FILAMENTS = NODES.flatMap((n) =>
  Array.from({ length: 11 }, (_, j) => {
    const a = (j / 11) * Math.PI * 2 + j * 0.35
    const rad = 3.5 + (j % 4) * 2.6
    return { x: n.x + Math.cos(a) * rad, y: n.y + Math.sin(a) * rad }
  }),
)

const RINGS = [
  { size: '92%', dur: 32, rev: false, opacity: 0.5 },
  { size: '62%', dur: 23, rev: true,  opacity: 0.4 },
  { size: '36%', dur: 40, rev: false, opacity: 0.55 },
]

export default function HeroOrbit() {
  const reduced = useReducedMotion()

  return (
    <div
      className="cs-orbit relative w-full max-w-[520px] aspect-square mx-auto"
      aria-hidden="true"
      style={{ perspective: '1000px' }}
    >
      {/* Glow */}
      <div
        className="absolute inset-[14%] rounded-full"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(229,192,92,0.14), transparent 62%)' }}
      />

      {/* Datenströme (SVG) */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        style={{ overflow: 'visible' }}
      >
        {/* Sunburst-Filamente */}
        {FILAMENTS.map((f, i) => (
          <line key={`f${i}`} x1="50" y1="50" x2={f.x} y2={f.y}
            vectorEffect="non-scaling-stroke"
            style={{ stroke: 'rgba(var(--cs-orbit-rgb), 0.09)', strokeWidth: 0.5 }} />
        ))}
        {/* Verbindungen zu den Nodes */}
        {NODES.map((n, i) => (
          <line key={`c${i}`} x1="50" y1="50" x2={n.x} y2={n.y}
            vectorEffect="non-scaling-stroke"
            style={{ stroke: 'rgba(var(--cs-orbit-rgb), 0.18)', strokeWidth: 0.8 }} />
        ))}
        {/* Daten-Pakete — wandern vom Zentrum zum Node */}
        {!reduced && NODES.map((n, i) => (
          <line key={`p${i}`} x1="50" y1="50" x2={n.x} y2={n.y}
            pathLength={1} vectorEffect="non-scaling-stroke"
            style={{
              stroke: 'var(--cs-fx-spark)', strokeWidth: 1.8, strokeLinecap: 'round',
              strokeDasharray: '0.05 0.95',
              animation: `cs-stream ${2.4 + i * 0.25}s linear infinite`,
              animationDelay: `${i * 0.4}s`,
            }} />
        ))}
      </svg>

      {/* 3D-Ring-System (gekippte Ellipsen) */}
      <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
        {RINGS.map((r, i) => (
          <div
            key={i}
            className="absolute rounded-full border"
            style={{
              top: '50%', left: '50%', width: r.size, height: r.size,
              transformStyle: 'preserve-3d',
              transform: 'translate(-50%,-50%) rotateX(68deg)',
              borderColor: `rgba(var(--cs-orbit-rgb), ${r.opacity})`,
              animation: reduced ? undefined : `cs-ellipse ${r.dur}s linear infinite${r.rev ? ' reverse' : ''}`,
            }}
          >
            <span
              className="absolute rounded-full"
              style={{
                top: 0, left: '50%', width: 7, height: 7, transform: 'translate(-50%,-50%)',
                background: 'radial-gradient(circle at 35% 35%, #F5F0E8, #E5C05C)',
                boxShadow: '0 0 10px 2px rgba(229,192,92,0.6)',
              }}
            />
          </div>
        ))}
      </div>

      {/* Radar-Scan */}
      <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
        <div
          className="absolute rounded-full"
          style={{
            top: '50%', left: '50%', width: '62%', height: '62%',
            transform: 'translate(-50%,-50%) rotateX(68deg)',
            background: 'conic-gradient(from 0deg, rgba(229,192,92,0.22), transparent 26%)',
            animation: reduced ? undefined : 'cs-scan 6s linear infinite',
          }}
        />
      </div>

      {/* Security-Kern — Shield */}
      <div className="absolute left-1/2 top-1/2" style={{ transform: 'translate(-50%,-50%)' }}>
        <div className="cs-orbit-core" style={{ animation: reduced ? undefined : 'cs-shield-pulse 3.4s ease-in-out infinite' }}>
          <ShieldCheck size={42} strokeWidth={1.5} />
        </div>
      </div>

      {/* Agenten-Nodes */}
      {NODES.map((n, i) => {
        const Icon = n.Icon
        return (
          <div
            key={i}
            className="absolute flex flex-col items-center gap-1.5"
            style={{ left: `${n.x}%`, top: `${n.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <span className="cs-agent-node" style={{ animationDelay: `${i * 0.35}s` }}>
              <Icon size={13} strokeWidth={1.7} />
            </span>
            <span className="cs-agent-label">{n.label}</span>
          </div>
        )
      })}
    </div>
  )
}
