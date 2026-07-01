/* ============================================================
   CandleScope — Hybrid WebGL 3D Particle Scroll Timeline
   src/components/home/ThreeParticleTimeline.tsx
   ============================================================ */

import { useEffect, useRef, useState } from 'react'
import { useScroll, useMotionValueEvent, useReducedMotion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'

// Rahmen-Pfad wird dynamisch aus der echten Position der #work-Sektion gebaut,
// damit der Split die (sticky, 560vh hohe) Carousel sauber umschließt: öffnet
// knapp über der Sektion, schließt knapp darunter (unter Sentinel) — auf jeder
// Bildschirmgröße korrekt. yOpen/yClose sind viewBox-Einheiten (0..1000).
function buildTimelinePath(side: 'left' | 'right', yOpen: number, yClose: number) {
  const edge = side === 'left' ? 2 : 98
  const c1 = side === 'left' ? 35 : 65
  const c2 = side === 'left' ? 10 : 90
  const o = Math.round(yOpen)
  const cl = Math.round(yClose)
  return (
    `M51,18 C51,100 6,130 3.5,220 ` +
    `C2,${o - 120} 50,${o - 60} 50,${o} ` +
    `C${c1},${o} ${c2},${o} ${edge},${o} ` +
    `L${edge},${cl - 30} ` +
    `C${c2},${cl - 30} ${c1},${cl} 50,${cl} ` +
    `C50,${cl + 70} 50,${Math.round((cl + 982) / 2)} 50,982`
  )
}

const DEFAULT_Y_OPEN = 345
const DEFAULT_Y_CLOSE = 780

const RANGES = [0, 0.22, 0.28, 0.35, 0.42, 0.48, 0.55, 0.62, 0.70, 0.78, 0.85, 1]

interface ThemePalette {
  accent: string
  accentDim: string
  glow: string
  cometShadow: string
}

const PALETTES_DARK: ThemePalette[] = [
  { accent: '#C9A84C', accentDim: 'rgba(201, 168, 76, 0.25)', glow: 'rgba(232, 197, 109, 0.25)', cometShadow: 'rgba(201, 168, 76, 0.6)' },
  { accent: '#C9A84C', accentDim: 'rgba(201, 168, 76, 0.25)', glow: 'rgba(232, 197, 109, 0.25)', cometShadow: 'rgba(201, 168, 76, 0.6)' },
  { accent: '#E87D3E', accentDim: 'rgba(232, 125, 62, 0.25)', glow: 'rgba(240, 153, 102, 0.25)', cometShadow: 'rgba(232, 125, 62, 0.6)' },
  { accent: '#E87D3E', accentDim: 'rgba(232, 125, 62, 0.25)', glow: 'rgba(240, 153, 102, 0.25)', cometShadow: 'rgba(232, 125, 62, 0.6)' },
  { accent: '#D2E83E', accentDim: 'rgba(210, 232, 62, 0.25)', glow: 'rgba(221, 240, 102, 0.25)', cometShadow: 'rgba(210, 232, 62, 0.6)' },
  { accent: '#D2E83E', accentDim: 'rgba(210, 232, 62, 0.25)', glow: 'rgba(221, 240, 102, 0.25)', cometShadow: 'rgba(210, 232, 62, 0.6)' },
  { accent: '#3EB9E8', accentDim: 'rgba(62, 185, 232, 0.25)', glow: 'rgba(102, 203, 240, 0.25)', cometShadow: 'rgba(62, 185, 232, 0.6)' },
  { accent: '#3EB9E8', accentDim: 'rgba(62, 185, 232, 0.25)', glow: 'rgba(102, 203, 240, 0.25)', cometShadow: 'rgba(62, 185, 232, 0.6)' },
  { accent: '#C43EE8', accentDim: 'rgba(196, 62, 232, 0.25)', glow: 'rgba(211, 102, 240, 0.25)', cometShadow: 'rgba(196, 62, 232, 0.6)' },
  { accent: '#C43EE8', accentDim: 'rgba(196, 62, 232, 0.25)', glow: 'rgba(211, 102, 240, 0.25)', cometShadow: 'rgba(196, 62, 232, 0.6)' },
  { accent: '#C9A84C', accentDim: 'rgba(201, 168, 76, 0.25)', glow: 'rgba(232, 197, 109, 0.25)', cometShadow: 'rgba(201, 168, 76, 0.6)' },
  { accent: '#C9A84C', accentDim: 'rgba(201, 168, 76, 0.25)', glow: 'rgba(232, 197, 109, 0.25)', cometShadow: 'rgba(201, 168, 76, 0.6)' },
]

const PALETTES_LIGHT: ThemePalette[] = [
  { accent: '#8A6A1E', accentDim: 'rgba(138, 106, 30, 0.25)', glow: 'rgba(179, 146, 62, 0.25)', cometShadow: 'rgba(138, 106, 30, 0.5)' },
  { accent: '#8A6A1E', accentDim: 'rgba(138, 106, 30, 0.25)', glow: 'rgba(179, 146, 62, 0.25)', cometShadow: 'rgba(138, 106, 30, 0.5)' },
  { accent: '#B2501B', accentDim: 'rgba(178, 80, 27, 0.25)', glow: 'rgba(214, 114, 60, 0.25)', cometShadow: 'rgba(178, 80, 27, 0.5)' },
  { accent: '#B2501B', accentDim: 'rgba(178, 80, 27, 0.25)', glow: 'rgba(214, 114, 60, 0.25)', cometShadow: 'rgba(178, 80, 27, 0.5)' },
  { accent: '#85961B', accentDim: 'rgba(133, 150, 27, 0.25)', glow: 'rgba(167, 184, 60, 0.25)', cometShadow: 'rgba(133, 150, 27, 0.5)' },
  { accent: '#85961B', accentDim: 'rgba(133, 150, 27, 0.25)', glow: 'rgba(167, 184, 60, 0.25)', cometShadow: 'rgba(133, 150, 27, 0.5)' },
  { accent: '#1C7FA3', accentDim: 'rgba(28, 127, 163, 0.25)', glow: 'rgba(60, 160, 196, 0.25)', cometShadow: 'rgba(28, 127, 163, 0.5)' },
  { accent: '#1C7FA3', accentDim: 'rgba(28, 127, 163, 0.25)', glow: 'rgba(60, 160, 196, 0.25)', cometShadow: 'rgba(28, 127, 163, 0.5)' },
  { accent: '#8E1CA3', accentDim: 'rgba(142, 28, 163, 0.25)', glow: 'rgba(175, 60, 196, 0.25)', cometShadow: 'rgba(142, 28, 163, 0.5)' },
  { accent: '#8E1CA3', accentDim: 'rgba(142, 28, 163, 0.25)', glow: 'rgba(175, 60, 196, 0.25)', cometShadow: 'rgba(142, 28, 163, 0.5)' },
  { accent: '#8A6A1E', accentDim: 'rgba(138, 106, 30, 0.25)', glow: 'rgba(179, 146, 62, 0.25)', cometShadow: 'rgba(138, 106, 30, 0.5)' },
  { accent: '#8A6A1E', accentDim: 'rgba(138, 106, 30, 0.25)', glow: 'rgba(179, 146, 62, 0.25)', cometShadow: 'rgba(138, 106, 30, 0.5)' },
]

function interpolateColor(color1: string, color2: string, factor: number) {
  const r1 = parseInt(color1.substring(1, 3), 16)
  const g1 = parseInt(color1.substring(3, 5), 16)
  const b1 = parseInt(color1.substring(5, 7), 16)

  const r2 = parseInt(color2.substring(1, 3), 16)
  const g2 = parseInt(color2.substring(3, 5), 16)
  const b2 = parseInt(color2.substring(5, 7), 16)

  const r = Math.round(r1 + factor * (r2 - r1))
  const g = Math.round(g1 + factor * (g2 - g1))
  const b = Math.round(b1 + factor * (b2 - b1))

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

function interpolateRgbString(rgb1: string, rgb2: string, factor: number) {
  const parse = (s: string) => {
    const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
    return m ? [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]), m[4] !== undefined ? parseFloat(m[4]) : 1.0] : [0, 0, 0, 1]
  }

  const [r1, g1, b1, a1] = parse(rgb1)
  const [r2, g2, b2, a2] = parse(rgb2)

  const r = Math.round(r1 + factor * (r2 - r1))
  const g = Math.round(g1 + factor * (g2 - g1))
  const b = Math.round(b1 + factor * (b2 - b1))
  const a = a1 + factor * (a2 - a1)

  return `rgba(${r}, ${g}, ${b}, ${a})`
}

function getColorsForProgress(v: number, isLight: boolean, ranges: number[]) {
  const palettes = isLight ? PALETTES_LIGHT : PALETTES_DARK
  let idx = 0
  for (let i = 0; i < ranges.length - 1; i++) {
    if (v >= ranges[i] && v <= ranges[i + 1]) {
      idx = i
      break
    }
  }
  const v1 = ranges[idx]
  const v2 = ranges[idx + 1]
  const factor = (v - v1) / (v2 - v1 || 1)

  const p1 = palettes[idx]
  const p2 = palettes[idx + 1]

  if (!p1 || !p2) return palettes[0]

  return {
    accent: interpolateColor(p1.accent, p2.accent, factor),
    accentDim: interpolateRgbString(p1.accentDim, p2.accentDim, factor),
    glow: interpolateRgbString(p1.glow, p2.glow, factor),
    cometShadow: interpolateRgbString(p1.cometShadow, p2.cometShadow, factor),
  }
}

// WebGL shaders for the 3D rotating crystals at the checkpoints
const VS_SOURCE = `
  attribute vec3 position;
  attribute float aShapeIndex;
  attribute float aRandom;

  uniform vec2 uShapePos[4];
  uniform float uExplode[4];
  uniform float uTime;
  uniform vec2 uResolution;

  varying float vRandom;
  varying float vShapeIndex;

  void main() {
    vRandom = aRandom;
    vShapeIndex = aShapeIndex;

    int idx = int(aShapeIndex);
    float explode = 0.0;
    vec2 center = vec2(0.0);

    // Unroll uniform arrays for WebGL 1.0 compatibility
    if (aShapeIndex < 0.5) {
      explode = uExplode[0];
      center = uShapePos[0];
    } else if (aShapeIndex < 1.5) {
      explode = uExplode[1];
      center = uShapePos[1];
    } else if (aShapeIndex < 2.5) {
      explode = uExplode[2];
      center = uShapePos[2];
    } else {
      explode = uExplode[3];
      center = uShapePos[3];
    }

    vec3 pos = position;

    // Apply 3D gravitational explosion/implosion
    if (explode > 0.01) {
      float wave = sin(aRandom * 12.0 + uTime * 6.0) * 0.35;
      pos += normalize(pos) * explode * (7.5 + wave * 2.5);
    }

    // Apply 3D local rotation
    float angleY = uTime * 0.45 + aRandom * 0.12;
    float sY = sin(angleY);
    float cY = cos(angleY);
    vec3 rotated = vec3(
      pos.x * cY - pos.z * sY,
      pos.y,
      pos.x * sY + pos.z * cY
    );

    // Local scaling
    rotated *= 0.046;

    // Correct aspect ratio of the full-height canvas
    float aspect = uResolution.x / uResolution.y;
    rotated.y *= aspect;

    // Center of shape in screen coordinates (NDC space)
    gl_Position = vec4(center.x + rotated.x, center.y + rotated.y, 0.0, 1.0);

    // Sparkle size
    float sparkle = sin(uTime * 2.0 + aRandom * 9.0) * 1.0;
    gl_PointSize = (4.0 + sparkle) * (uResolution.x / 1320.0);
  }
`

const FS_SOURCE = `
  precision mediump float;
  varying float vRandom;
  varying float vShapeIndex;
  uniform float uLightMode;
  uniform float uTime;
  uniform float uActiveState[4];

  void main() {
    vec2 circ = gl_PointCoord - vec2(0.5);
    if (dot(circ, circ) > 0.25) discard;

    float dist = length(gl_PointCoord - vec2(0.5));
    float alpha = smoothstep(0.5, 0.0, dist) * 0.85;

    // Get active state for this shape
    float activeGlow = 0.0;
    if (vShapeIndex < 0.5) activeGlow = uActiveState[0];
    else if (vShapeIndex < 1.5) activeGlow = uActiveState[1];
    else if (vShapeIndex < 2.5) activeGlow = uActiveState[2];
    else activeGlow = uActiveState[3];

    // Colors
    vec3 goldColor;
    if (uLightMode > 0.5) {
      goldColor = mix(vec3(0.52, 0.40, 0.14), vec3(0.85, 0.65, 0.18), activeGlow);
    } else {
      goldColor = mix(vec3(0.70, 0.55, 0.22), vec3(1.0, 0.85, 0.42), activeGlow);
    }

    // Twinkling highlights
    float sparkle = pow(max(0.0, sin(uTime * 5.0 + vRandom * 6.28)), 12.0) * (0.35 + activeGlow * 0.4);
    vec3 col = goldColor + vec3(sparkle);

    gl_FragColor = vec4(col, alpha * (0.55 + activeGlow * 0.45));
  }
`

export default function ThreeParticleTimeline({ targetRef }: { targetRef: React.RefObject<HTMLElement | null> }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Double paths for splitting and merging around the carousel
  const pathLeftRef = useRef<SVGPathElement>(null)
  const pathRightRef = useRef<SVGPathElement>(null)
  const glowLeftRef = useRef<SVGPathElement>(null)
  const glowRightRef = useRef<SVGPathElement>(null)
  const coreLeftRef = useRef<SVGPathElement>(null)
  const coreRightRef = useRef<SVGPathElement>(null)

  // Double comets for left and right loops
  const diamondLeftRef = useRef<HTMLDivElement>(null)
  const diamondRightRef = useRef<HTMLDivElement>(null)

  const lenRef = useRef(0)
  const firedRef = useRef<Set<number>>(new Set())
  const { theme } = useTheme()
  const reduced = useReducedMotion()

  const [webglSupported, setWebglSupported] = useState(true)

  // Tracking dynamic checkpoints & scroll colors
  const [checkpoints, setCheckpoints] = useState<number[]>([0.16, 0.40, 0.74, 0.80])
  const [ranges, setRanges] = useState<number[]>(RANGES)

  // Dynamisch an #work gekoppelter Rahmen-Pfad (Split öffnet/schließt um die Sektion)
  const [paths, setPaths] = useState({
    left: buildTimelinePath('left', DEFAULT_Y_OPEN, DEFAULT_Y_CLOSE),
    right: buildTimelinePath('right', DEFAULT_Y_OPEN, DEFAULT_Y_CLOSE),
  })
  const lastPathKeyRef = useRef('')

  // WebGL Uniform states
  const explodeStateRef = useRef<number[]>([0, 0, 0, 0])
  const activeStateRef = useRef<number[]>([0, 0, 0, 0])
  const shapePositionsRef = useRef<[number, number][]>([[0,0], [0,0], [0,0], [0,0]])

  // High performance Refs to avoid recompiling WebGL on scroll, theme, or checkpoint changes
  const checkpointsRef = useRef(checkpoints)
  const themeRef = useRef(theme)

  useEffect(() => {
    checkpointsRef.current = checkpoints
  }, [checkpoints])

  useEffect(() => {
    themeRef.current = theme
  }, [theme])

  // Double comet trail history
  const trailLeftRefs = useRef<(HTMLDivElement | null)[]>([])
  const trailRightRefs = useRef<(HTMLDivElement | null)[]>([])
  const trailLeftHistory = useRef<{ x: number; y: number }[]>([])
  const trailRightHistory = useRef<{ x: number; y: number }[]>([])

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end'],
  })

  // Dynamic Scroll Mapping
  useEffect(() => {
    const updateCheckpoints = () => {
      const workEl = document.getElementById('work')
      if (!workEl) return

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      if (maxScroll <= 0) return

      const rect = workEl.getBoundingClientRect()
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const startScroll = rect.top + scrollTop
      const endScroll = rect.bottom + scrollTop - window.innerHeight

      const pStart = Math.max(0.12, Math.min(0.85, startScroll / maxScroll))
      const pEnd = Math.max(pStart + 0.1, Math.min(0.95, endScroll / maxScroll))

      const step = (pEnd - pStart) / 3
      const cp1 = pStart
      const cp2 = pStart + step
      const cp3 = pStart + step * 2
      const cp4 = pEnd

      setCheckpoints([cp1, cp2, cp3, cp4])

      setRanges([
        0,
        cp1 - 0.04, cp1 + 0.04,
        cp2 - 0.04, cp2 + 0.04,
        cp3 - 0.04, cp3 + 0.04,
        cp4 - 0.04, cp4 + 0.04,
        Math.min(0.90, cp4 + 0.08),
        Math.min(0.95, cp4 + 0.12),
        1
      ])

      // Rahmen-Pfad an die echte #work-Position koppeln (viewBox 0..1000 = ganze Seite).
      // Öffnet ~250px über der Sektion, schließt ~200px darunter (unter Sentinel).
      const totalHeight = document.documentElement.scrollHeight
      const workTopPx = startScroll
      const workBottomPx = rect.bottom + scrollTop
      let yOpen = ((workTopPx - 250) / totalHeight) * 1000
      let yClose = ((workBottomPx + 200) / totalHeight) * 1000
      yOpen = Math.max(250, yOpen)
      yClose = Math.min(930, yClose)
      if (yOpen > yClose - 140) yOpen = yClose - 140
      const pathKey = `${Math.round(yOpen)}-${Math.round(yClose)}`
      if (pathKey !== lastPathKeyRef.current) {
        lastPathKeyRef.current = pathKey
        setPaths({
          left: buildTimelinePath('left', yOpen, yClose),
          right: buildTimelinePath('right', yOpen, yClose),
        })
      }
    }

    const timer = setTimeout(updateCheckpoints, 400)
    window.addEventListener('resize', updateCheckpoints)
    window.addEventListener('scroll', updateCheckpoints, { passive: true })

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateCheckpoints)
      window.removeEventListener('scroll', updateCheckpoints)
    }
  }, [reduced])

  // Recalculate checkpoints physical positions along SVG path.
  // Läuft auch neu, wenn sich der (dynamische) Pfad ändert → Länge frisch messen.
  useEffect(() => {
    const p = pathLeftRef.current
    if (!p) return
    const len = p.getTotalLength()
    if (!len) return
    lenRef.current = len

    // Map checkpoint percentages to coordinates on screen using pathLeftRef
    const newCoords = checkpoints.map(cp => {
      const pt = p.getPointAtLength(cp * len)
      // Convert SVG viewbox coords (0..100, 0..1000) to NDC space (-1..1) for WebGL
      const glX = (pt.x / 100) * 2.0 - 1.0
      const glY = (1.0 - pt.y / 1000) * 2.0 - 1.0
      return [glX, glY] as [number, number]
    })
    shapePositionsRef.current = newCoords

    // Füllstand am aktuellen Scroll-Fortschritt halten (nicht auf 0 zurücksetzen)
    const prog = Math.max(0, Math.min(1, scrollYProgress.get()))
    const off = reduced ? '0' : `${len * (1 - prog)}`
    for (const el of [glowLeftRef.current, glowRightRef.current, coreLeftRef.current, coreRightRef.current]) {
      if (!el) continue
      el.style.strokeDasharray = `${len}`
      el.style.strokeDashoffset = off
    }
    if (reduced) {
      if (diamondLeftRef.current) diamondLeftRef.current.style.opacity = '0'
      if (diamondRightRef.current) diamondRightRef.current.style.opacity = '0'
    }
  }, [checkpoints, paths, reduced])

  // Scroll triggers and updates
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (reduced) return
    const pL = pathLeftRef.current
    const pR = pathRightRef.current
    const len = lenRef.current
    if (!pL || !pR || !len) return

    const prog = Math.max(0, Math.min(1, v))

    // 1. Dynamic color changes
    const colors = getColorsForProgress(prog, theme === 'light', ranges)
    const container = containerRef.current
    if (container) {
      container.style.setProperty('--cs-thread-accent', colors.accent)
      container.style.setProperty('--cs-thread-accent-dim', colors.accentDim)
      container.style.setProperty('--cs-thread-glow-color', colors.glow)
      container.style.setProperty('--cs-comet-shadow', colors.cometShadow)
    }

    // SVG path offset growth for BOTH left and right paths
    const off = `${len * (1 - prog)}`
    if (glowLeftRef.current) glowLeftRef.current.style.strokeDashoffset = off
    if (glowRightRef.current) glowRightRef.current.style.strokeDashoffset = off
    if (coreLeftRef.current) coreLeftRef.current.style.strokeDashoffset = off
    if (coreRightRef.current) coreRightRef.current.style.strokeDashoffset = off

    // 2. Animate comet indicators (Left & Right comets).
    // Kleiner Vorlauf: die Rahmen-Schleife verlängert den Pfad in der Mitte, dadurch
    // fällt der Punkt (arc-length-basiert) hinter den Scroll zurück — leicht vorziehen.
    const cometProg = Math.min(1, prog + 0.025)
    const ptL = pL.getPointAtLength(cometProg * len)
    const ptR = pR.getPointAtLength(cometProg * len)

    const dL = diamondLeftRef.current
    const dR = diamondRightRef.current
    
    // We only show comets if prog is within boundaries
    const isVisible = prog > 0.012 && prog < 0.988
    
    if (dL) {
      dL.style.left = `${ptL.x}%`
      dL.style.top = `${ptL.y / 10}%`
      dL.style.opacity = isVisible ? '1' : '0'
    }
    if (dR) {
      dR.style.left = `${ptR.x}%`
      dR.style.top = `${ptR.y / 10}%`
      dR.style.opacity = isVisible ? '1' : '0'
    }

    // 3. Comet trail updates (Left & Right trails)
    trailLeftHistory.current.push({ x: ptL.x, y: ptL.y / 10 })
    trailRightHistory.current.push({ x: ptR.x, y: ptR.y / 10 })
    
    if (trailLeftHistory.current.length > 30) trailLeftHistory.current.shift()
    if (trailRightHistory.current.length > 30) trailRightHistory.current.shift()

    const histL = trailLeftHistory.current
    const histR = trailRightHistory.current

    for (let i = 0; i < 6; i++) {
      const trailElL = trailLeftRefs.current[i]
      const trailElR = trailRightRefs.current[i]
      const op = (1 - (i / 6)) * 0.6
      const scale = 1 - (i / 6)

      const histIdxL = histL.length - 1 - (i + 1) * 2
      if (trailElL) {
        if (histIdxL >= 0 && isVisible) {
          const hPt = histL[histIdxL]
          trailElL.style.left = `${hPt.x}%`
          trailElL.style.top = `${hPt.y}%`
          trailElL.style.opacity = `${op}`
          trailElL.style.transform = `translate(-50%, -50%) scale(${scale})`
        } else {
          trailElL.style.opacity = '0'
        }
      }

      const histIdxR = histR.length - 1 - (i + 1) * 2
      if (trailElR) {
        if (histIdxR >= 0 && isVisible) {
          const hPt = histR[histIdxR]
          trailElR.style.left = `${hPt.x}%`
          trailElR.style.top = `${hPt.y}%`
          trailElR.style.opacity = `${op}`
          trailElR.style.transform = `translate(-50%, -50%) scale(${scale})`
        } else {
          trailElR.style.opacity = '0'
        }
      }
    }

    // 4. Trigger WebGL bursts and activate shape glow states
    checkpoints.forEach((cp, i) => {
      const dist = Math.abs(prog - cp)
      activeStateRef.current[i] = dist < 0.06 ? Math.max(0, 1.0 - dist / 0.06) : 0.0

      if (prog >= cp && !firedRef.current.has(i)) {
        firedRef.current.add(i)
        explodeStateRef.current[i] = 2.5
      } else if (prog < cp - 0.03 && firedRef.current.has(i)) {
        firedRef.current.delete(i)
      }
    })
  })

  // 3D Particles Shape Generation (1024 points total, 256 per shape)
  const count = 1024
  const dataRef = useRef<{
    position: Float32Array
    aShapeIndex: Float32Array
    randoms: Float32Array
  } | null>(null)

  if (!dataRef.current) {
    const position = new Float32Array(count * 3)
    const aShapeIndex = new Float32Array(count)
    const rand = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      rand[i] = Math.random()
      const shapeIdx = Math.floor(i / 256)
      aShapeIndex[i] = shapeIdx

      const localIdx = i % 256
      const theta = Math.random() * Math.PI * 2

      if (shapeIdx === 0) {
        // Shape 0: Diamond (Was ich mache)
        const y = (localIdx / 256) * 2.0 - 1.0
        const r = 0.9 - Math.abs(y)
        position[i * 3] = Math.cos(theta) * r
        position[i * 3 + 1] = y
        position[i * 3 + 2] = Math.sin(theta) * r
      } else if (shapeIdx === 1) {
        // Shape 1: Cube (VaultBox)
        const face = localIdx % 6
        const u = Math.random() - 0.5
        const v = Math.random() - 0.5
        if (face === 0) {
          position[i * 3] = 0.7; position[i * 3 + 1] = u * 1.4; position[i * 3 + 2] = v * 1.4;
        } else if (face === 1) {
          position[i * 3] = -0.7; position[i * 3 + 1] = u * 1.4; position[i * 3 + 2] = v * 1.4;
        } else if (face === 2) {
          position[i * 3] = u * 1.4; position[i * 3 + 1] = 0.7; position[i * 3 + 2] = v * 1.4;
        } else if (face === 3) {
          position[i * 3] = u * 1.4; position[i * 3 + 1] = -0.7; position[i * 3 + 2] = v * 1.4;
        } else if (face === 4) {
          position[i * 3] = u * 1.4; position[i * 3 + 1] = v * 1.4; position[i * 3 + 2] = 0.7;
        } else {
          position[i * 3] = u * 1.4; position[i * 3 + 1] = v * 1.4; position[i * 3 + 2] = -0.7;
        }
      } else if (shapeIdx === 2) {
        // Shape 2: Cylinder stack (CRM)
        const r = 0.72
        const ring = localIdx % 3
        const y = ring === 0 ? -0.6 : ring === 1 ? 0.0 : 0.6
        position[i * 3] = Math.cos(theta) * r + (Math.random() - 0.5) * 0.05
        position[i * 3 + 1] = y + (Math.random() - 0.5) * 0.05
        position[i * 3 + 2] = Math.sin(theta) * r + (Math.random() - 0.5) * 0.05
      } else {
        // Shape 3: Shield crystal (Storefront/Sentinel)
        const y = (localIdx / 256) * 2.0 - 1.0
        const r = 0.8 * Math.cos(y * 0.9)
        position[i * 3] = Math.cos(theta) * r
        position[i * 3 + 1] = y
        position[i * 3 + 2] = Math.sin(theta) * r
      }
    }

    dataRef.current = { position, aShapeIndex, randoms: rand }
  }

  const { position, aShapeIndex, randoms } = dataRef.current

  // WebGL Setup
  useEffect(() => {
    if (reduced || !webglSupported) return

    const canvas = canvasRef.current
    if (!canvas) return

    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
    if (!gl) {
      setWebglSupported(false)
      return
    }

    // Compile helper
    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('ThreeParticleTimeline compilation error:', gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vs = compileShader(gl.VERTEX_SHADER, VS_SOURCE)
    const fs = compileShader(gl.FRAGMENT_SHADER, FS_SOURCE)
    if (!vs || !fs) {
      setWebglSupported(false)
      return
    }

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setWebglSupported(false)
      return
    }

    gl.useProgram(program)

    // Bind Attributes with safety checks to avoid invalid index WebGL errors
    const bindAttribute = (name: string, data: Float32Array, size: number) => {
      const buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
      const loc = gl.getAttribLocation(program, name)
      if (loc !== -1) {
        gl.enableVertexAttribArray(loc)
        gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0)
      }
      return buffer
    }

    const bPos = bindAttribute('position', position, 3)
    const bIdx = bindAttribute('aShapeIndex', aShapeIndex, 1)
    const bRand = bindAttribute('aRandom', randoms, 1)

    // Uniforms
    const uShapePosLoc = gl.getUniformLocation(program, 'uShapePos')
    const uExplodeLoc = gl.getUniformLocation(program, 'uExplode')
    const uTimeLoc = gl.getUniformLocation(program, 'uTime')
    const uResLoc = gl.getUniformLocation(program, 'uResolution')
    const uLightModeLoc = gl.getUniformLocation(program, 'uLightMode')
    const uActiveStateLoc = gl.getUniformLocation(program, 'uActiveState')

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      gl.viewport(0, 0, rect.width, rect.height)
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    // Interpolated rendering state
    const currentExplode = [0, 0, 0, 0]
    const currentActive = [0, 0, 0, 0]
    let animId: number
    const startTime = performance.now()

    const render = () => {
      const time = (performance.now() - startTime) * 0.001

      // Exponential decay for explosions, linear interpolation for active glow states
      for (let i = 0; i < 4; i++) {
        if (explodeStateRef.current[i] > 0.01) {
          currentExplode[i] = explodeStateRef.current[i]
          explodeStateRef.current[i] = 0.0
        } else {
          currentExplode[i] *= 0.94 // exponential decay
        }
        currentActive[i] += (activeStateRef.current[i] - currentActive[i]) * 0.15
      }

      // Calculate dynamic WebGL positions for the shapes based on current scroll offset in 100vh viewport canvas
      const path = pathLeftRef.current
      const len = lenRef.current
      const totalHeight = document.documentElement.scrollHeight
      const maxScroll = totalHeight - window.innerHeight

      const flatPositions = new Float32Array(8)

      if (path && len > 0 && maxScroll > 0) {
        checkpointsRef.current.forEach((cp, idx) => {
          const pt = path.getPointAtLength(cp * len)
          const absY = cp * totalHeight
          // Smooth scroll current interpolation from framer-motion useScroll
          const s = scrollYProgress.get()
          const viewY = absY - s * maxScroll
          
          // Map to WebGL NDC space (-1 to 1) for the 100vh viewport canvas
          const glX = (pt.x / 100) * 2.0 - 1.0
          const glY = (1.0 - viewY / window.innerHeight) * 2.0 - 1.0

          flatPositions[idx * 2] = glX
          flatPositions[idx * 2 + 1] = glY
        })
      }

      gl.uniform2fv(uShapePosLoc, flatPositions)
      gl.uniform1fv(uExplodeLoc, new Float32Array(currentExplode))
      gl.uniform1fv(uActiveStateLoc, new Float32Array(currentActive))
      gl.uniform1f(uTimeLoc, time)
      gl.uniform2f(uResLoc, canvas.width, canvas.height)
      gl.uniform1f(uLightModeLoc, themeRef.current === 'light' ? 1.0 : 0.0)

      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE)

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.POINTS, 0, count)

      animId = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteProgram(program)
      gl.deleteBuffer(bPos)
      gl.deleteBuffer(bIdx)
      gl.deleteBuffer(bRand)
    }
  }, [reduced, webglSupported])

  return (
    <>
    {/* 3D WebGL rotating crystal checkpoints overlay (fixed viewport height) - moved behind content to z-[1] and expanded to 100vw */}
    {!reduced && webglSupported && (
      <div className="hidden lg:block fixed inset-0 z-[1] pointer-events-none" aria-hidden="true">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    )}

    {/* SVG Scroll progress line tracks (Left & Right loops) - moved behind content to z-[0] and expanded to 100vw */}
    <div ref={containerRef} className="hidden lg:block absolute inset-x-0 top-0 bottom-0 z-[0] pointer-events-none" aria-hidden="true">
      <svg
        viewBox="0 0 100 1000"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
      >
        {/* ==================== LEFT PROGRESS PATH ==================== */}
        {/* Blasser Hintergrund-Pfad Links */}
        <path
          ref={pathLeftRef}
          d={paths.left}
          fill="none"
          stroke="var(--cs-thread-accent-dim, rgba(201, 168, 76, 0.28))"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
          style={{ transition: 'stroke 0.4s ease' }}
        />
        {/* Glow Halo Links */}
        <path
          ref={glowLeftRef}
          d={paths.left}
          fill="none"
          stroke="var(--cs-thread-glow-color, rgba(232, 197, 109, 0.15))"
          strokeWidth="3.2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ transition: 'stroke 0.4s ease' }}
        />
        {/* Core Linie Links */}
        <path
          ref={coreLeftRef}
          d={paths.left}
          fill="none"
          stroke="var(--cs-thread-accent, #C9A84C)"
          strokeWidth="1.6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ transition: 'stroke 0.4s ease' }}
        />

        {/* ==================== RIGHT PROGRESS PATH ==================== */}
        {/* Blasser Hintergrund-Pfad Rechts */}
        <path
          ref={pathRightRef}
          d={paths.right}
          fill="none"
          stroke="var(--cs-thread-accent-dim, rgba(201, 168, 76, 0.28))"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
          style={{ transition: 'stroke 0.4s ease' }}
        />
        {/* Glow Halo Rechts */}
        <path
          ref={glowRightRef}
          d={paths.right}
          fill="none"
          stroke="var(--cs-thread-glow-color, rgba(232, 197, 109, 0.15))"
          strokeWidth="3.2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ transition: 'stroke 0.4s ease' }}
        />
        {/* Core Linie Rechts */}
        <path
          ref={coreRightRef}
          d={paths.right}
          fill="none"
          stroke="var(--cs-thread-accent, #C9A84C)"
          strokeWidth="1.6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ transition: 'stroke 0.4s ease' }}
        />
      </svg>

      {/* Left Comet Trails */}
      {!reduced && Array.from({ length: 6 }).map((_, i) => (
        <div
          key={`trail-l-${i}`}
          ref={el => { trailLeftRefs.current[i] = el }}
          className="absolute w-2 h-2 rounded-full pointer-events-none"
          style={{
            background: 'var(--cs-thread-accent, #C9A84C)',
            boxShadow: '0 0 10px var(--cs-thread-accent, var(--cs-fx-glow))',
            opacity: 0,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Right Comet Trails */}
      {!reduced && Array.from({ length: 6 }).map((_, i) => (
        <div
          key={`trail-r-${i}`}
          ref={el => { trailRightRefs.current[i] = el }}
          className="absolute w-2 h-2 rounded-full pointer-events-none"
          style={{
            background: 'var(--cs-thread-accent, #C9A84C)',
            boxShadow: '0 0 10px var(--cs-thread-accent, var(--cs-fx-glow))',
            opacity: 0,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Left glowing diamond comet */}
      <div
        ref={diamondLeftRef}
        className="absolute w-3.5 h-3.5 pointer-events-none"
        style={{
          background: '#FFFDF5',
          border: '1px solid var(--cs-thread-accent, #C9A84C)',
          boxShadow: '0 0 12px var(--cs-thread-accent, var(--cs-fx-glow)), 0 0 4px #FFFDF5',
          transform: 'translate(-50%, -50%) rotate(45deg)',
          opacity: 0,
          transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
        }}
      />

      {/* Right glowing diamond comet */}
      <div
        ref={diamondRightRef}
        className="absolute w-3.5 h-3.5 pointer-events-none"
        style={{
          background: '#FFFDF5',
          border: '1px solid var(--cs-thread-accent, #C9A84C)',
          boxShadow: '0 0 12px var(--cs-thread-accent, var(--cs-fx-glow)), 0 0 4px #FFFDF5',
          transform: 'translate(-50%, -50%) rotate(45deg)',
          opacity: 0,
          transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
        }}
      />
    </div>
    </>
  )
}
