/* ============================================================
   CandleScope — Hybrid WebGL 3D Particle Scroll Timeline
   src/components/home/ThreeParticleTimeline.tsx
   ============================================================ */

import { useEffect, useRef, useState } from 'react'
import { useScroll, useMotionValueEvent, useReducedMotion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'



// Colors helper functions removed because colors are now static theme-based gold

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
  uniform highp float uTime;
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

  // Single straight path for left margin rule
  const pathLeftRef = useRef<SVGPathElement>(null)
  const glowLeftRef = useRef<SVGPathElement>(null)
  const coreLeftRef = useRef<SVGPathElement>(null)

  // Single comet for left side
  const diamondLeftRef = useRef<HTMLDivElement>(null)

  const lenRef = useRef(0)
  const firedRef = useRef<Set<number>>(new Set())
  const { theme } = useTheme()
  const reduced = useReducedMotion()

  const [webglSupported, setWebglSupported] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  // Tracking dynamic checkpoints & scroll colors
  const [checkpoints, setCheckpoints] = useState<number[]>([0.16, 0.40, 0.74, 0.80])
  const [totalHeight, setTotalHeight] = useState(1000)

  // Dynamic vertical path geometry based on total page height
  const yStart = 0
  const yEnd = totalHeight
  const pathD = `M5,${yStart} L5,${yEnd}`

  // WebGL Uniform states
  const explodeStateRef = useRef<number[]>([0, 0, 0, 0])
  const activeStateRef = useRef<number[]>([0, 0, 0, 0])
  const shapePositionsRef = useRef<[number, number][]>([[0,0], [0,0], [0,0], [0,0]])

  // Track the start and end of the horizontal work carousel for opacity transitions
  const pStartRef = useRef(0.12)
  const pEndRef = useRef(0.95)

  // High performance Refs to avoid recompiling WebGL on scroll, theme, or checkpoint changes
  const checkpointsRef = useRef(checkpoints)
  const themeRef = useRef(theme)

  useEffect(() => {
    checkpointsRef.current = checkpoints
  }, [checkpoints])

  useEffect(() => {
    themeRef.current = theme
  }, [theme])

  // Single comet trail history
  const trailLeftRefs = useRef<(HTMLDivElement | null)[]>([])
  const trailLeftHistory = useRef<{ x: number; y: number }[]>([])

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

      const tHeight = document.documentElement.scrollHeight
      setTotalHeight(tHeight)

      const rect = workEl.getBoundingClientRect()
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const startScroll = rect.top + scrollTop
      const endScroll = rect.bottom + scrollTop - window.innerHeight

      const pStart = Math.max(0.12, Math.min(0.85, startScroll / maxScroll))
      const pEnd = Math.max(pStart + 0.1, Math.min(0.95, endScroll / maxScroll))

      pStartRef.current = pStart
      pEndRef.current = pEnd

      const range = pEnd - pStart
      // Mathematically aligned to trigger exactly when each card/slide centers horizontally
      const cp1 = pStart + 0.22 * range
      const cp2 = pStart + 0.3867 * range
      const cp3 = pStart + 0.5533 * range
      const cp4 = pStart + 0.72 * range

      setCheckpoints([cp1, cp2, cp3, cp4])
      setIsInitialized(true)
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
  useEffect(() => {
    const p = pathLeftRef.current
    if (!p) return
    const len = p.getTotalLength()
    if (!len) return
    lenRef.current = len

    // Map checkpoint percentages to coordinates on screen using pathLeftRef
    const newCoords = checkpoints.map(cp => {
      const pt = p.getPointAtLength(cp * len)
      // Convert SVG viewbox coords (0..100, 0..totalHeight) to NDC space (-1..1) for WebGL
      const glX = (pt.x / 100) * 2.0 - 1.0
      const glY = (1.0 - pt.y / totalHeight) * 2.0 - 1.0
      return [glX, glY] as [number, number]
    })
    shapePositionsRef.current = newCoords

    // Füllstand am aktuellen Scroll-Fortschritt halten
    const prog = Math.max(0, Math.min(1, scrollYProgress.get()))
    const off = reduced ? '0' : `${len * (1 - prog)}`
    for (const el of [glowLeftRef.current, coreLeftRef.current]) {
      if (!el) continue
      el.style.strokeDasharray = `${len}`
      el.style.strokeDashoffset = off
    }
    if (reduced) {
      if (diamondLeftRef.current) diamondLeftRef.current.style.opacity = '0'
    }
  }, [checkpoints, reduced])

  // Scroll triggers and updates
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (reduced) return
    const pL = pathLeftRef.current
    const len = lenRef.current
    if (!pL || !len) return

    const prog = Math.max(0, Math.min(1, v))

    // 1. Constant theme colors (no dynamic color changes on scroll)
    const isLight = theme === 'light'
    const colors = {
      accent: isLight ? '#8a6a1e' : '#C9A84C',
      accentDim: isLight ? 'rgba(138, 106, 30, 0.24)' : 'rgba(201, 168, 76, 0.28)',
      glow: isLight ? 'rgba(138, 106, 30, 0.12)' : 'rgba(232, 197, 109, 0.15)',
      cometShadow: isLight ? 'rgba(138, 106, 30, 0.3)' : 'rgba(201, 168, 76, 0.4)'
    }
    const container = containerRef.current
    if (container) {
      container.style.setProperty('--cs-thread-accent', colors.accent)
      container.style.setProperty('--cs-thread-accent-dim', colors.accentDim)
      container.style.setProperty('--cs-thread-glow-color', colors.glow)
      container.style.setProperty('--cs-comet-shadow', colors.cometShadow)

      // Make scroll timeline thread and comet paler (0.12 opacity) while in the reading carousel
      const pStart = pStartRef.current
      const pEnd = pEndRef.current
      const isCarouselActive = prog >= pStart && prog <= pEnd
      container.style.opacity = isCarouselActive ? '0.12' : '1.0'
    }

    // SVG path offset growth
    const off = `${len * (1 - prog)}`
    if (glowLeftRef.current) glowLeftRef.current.style.strokeDashoffset = off
    if (coreLeftRef.current) coreLeftRef.current.style.strokeDashoffset = off

    // 2. Animate comet indicator (remove +0.01 offset for perfect midpoint alignment)
    const cometProg = prog
    const ptL = pL.getPointAtLength(cometProg * len)

    const dL = diamondLeftRef.current
    const isVisible = prog > 0.012 && prog < 0.988
    
    if (dL) {
      dL.style.left = `${ptL.x}%`
      dL.style.top = `${ptL.y}px`
      dL.style.opacity = isVisible ? '1' : '0'
    }

    // 3. Comet trail updates
    trailLeftHistory.current.push({ x: ptL.x, y: ptL.y })
    if (trailLeftHistory.current.length > 30) trailLeftHistory.current.shift()

    const histL = trailLeftHistory.current

    for (let i = 0; i < 6; i++) {
      const trailElL = trailLeftRefs.current[i]
      const op = (1 - (i / 6)) * 0.6
      const scale = 1 - (i / 6)

      const histIdxL = histL.length - 1 - (i + 1) * 2
      if (trailElL) {
        if (histIdxL >= 0 && isVisible) {
          const hPt = histL[histIdxL]
          trailElL.style.left = `${hPt.x}%`
          trailElL.style.top = `${hPt.y}px`
          trailElL.style.opacity = `${op}`
          trailElL.style.transform = `translate(-50%, -50%) scale(${scale})`
        } else {
          trailElL.style.opacity = '0'
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

    // Bind Attributes
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

      // Calculate dynamic WebGL positions for the shapes
      const path = pathLeftRef.current
      const len = lenRef.current
      const totalHeight = document.documentElement.scrollHeight
      const maxScroll = totalHeight - window.innerHeight

      const flatPositions = new Float32Array(8)

      if (path && len > 0 && maxScroll > 0) {
        checkpointsRef.current.forEach((cp, idx) => {
          const pt = path.getPointAtLength(cp * len)
          const absY = pt.y
          const s = scrollYProgress.get()
          const viewY = absY - s * maxScroll
          
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
    {/* 3D WebGL rotating crystal checkpoints overlay (fixed viewport height) */}
    {!reduced && webglSupported && (
      <div 
        className="hidden lg:block fixed inset-0 z-[31] pointer-events-none transition-opacity duration-300"
        style={{ opacity: isInitialized ? 1 : 0 }}
        aria-hidden="true"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    )}

    {/* SVG Scroll progress line track - centered and aligned with content margin */}
    <div 
      ref={containerRef} 
      className="hidden lg:block absolute inset-y-0 left-0 right-0 z-[30] pointer-events-none transition-opacity duration-300" 
      style={{ opacity: isInitialized ? 1 : 0 }}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 100 ${totalHeight}`}
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
      >
        {/* Blasser Hintergrund-Pfad */}
        <path
          ref={pathLeftRef}
          d={pathD}
          fill="none"
          stroke="var(--cs-thread-accent-dim, rgba(201, 168, 76, 0.28))"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
          style={{ transition: 'stroke 0.4s ease' }}
        />
        {/* Glow Halo */}
        <path
          ref={glowLeftRef}
          d={pathD}
          fill="none"
          stroke="var(--cs-thread-glow-color, rgba(232, 197, 109, 0.15))"
          strokeWidth="3.2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ transition: 'stroke 0.4s ease' }}
        />
        {/* Core Linie */}
        <path
          ref={coreLeftRef}
          d={pathD}
          fill="none"
          stroke="var(--cs-thread-accent, #C9A84C)"
          strokeWidth="1.6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ transition: 'stroke 0.4s ease' }}
        />
      </svg>

      {/* Comet Trails */}
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

      {/* Glowing diamond comet */}
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
    </div>
    </>
  )
}
