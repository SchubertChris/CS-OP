/* ============================================================
   CandleScope — Immersive WebGL Background Effect
   src/components/ui/BackgroundEffect.tsx
   ============================================================ */

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'

// Simple Vertex Shader
const VS_SOURCE = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

// Fragment Shader with Fluid FBM Warp
const FS_SOURCE = `
  precision mediump float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uScroll;
  uniform float uResolutionWidth;
  uniform float uResolutionHeight;
  uniform float uLightMode;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
               mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(0.87758, 0.47942, -0.47942, 0.87758);
    for (int i = 0; i < 4; ++i) {
      v += a * noise(p);
      p = rot * p * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 res = vec2(uResolutionWidth, uResolutionHeight);
    vec2 aspectUv = vec2(uv.x * (res.x / res.y), uv.y);
    
    // Mouse push coordinates
    vec2 targetMouse = vec2(uMouse.x * (res.x / res.y), uMouse.y);
    float distToMouse = length(aspectUv - targetMouse);
    
    // Warp settings
    vec2 warpUv = aspectUv * 2.2;
    warpUv.y -= uScroll * 1.0; // Move vertically with scroll
    
    // Add mouse repulsion
    float mousePush = smoothstep(0.45, 0.0, distToMouse) * 0.18;
    warpUv += (aspectUv - targetMouse) * mousePush;

    float timeScale = uTime * 0.035;
    
    // FBM warp calculations for fluid look
    vec2 q = vec2(
      fbm(warpUv + vec2(0.0, timeScale)),
      fbm(warpUv + vec2(5.2, 1.3 * timeScale))
    );
    
    vec2 r = vec2(
      fbm(warpUv + 4.0 * q + vec2(1.7, 9.2) + 0.15 * timeScale),
      fbm(warpUv + 4.0 * q + vec2(8.3, 2.8) + 0.126 * timeScale)
    );
    
    float f = fbm(warpUv + 4.0 * r);
    
    // Map theme colors
    vec3 bg;
    vec3 goldColor;
    
    if (uLightMode > 0.5) {
      bg = vec3(0.949, 0.929, 0.886); // Light: #F2EDE2
      goldColor = vec3(0.50, 0.38, 0.12); // Deep Gold #8A6A1E for contrast
    } else {
      bg = vec3(0.031, 0.031, 0.031); // Dark: #080808
      goldColor = vec3(0.79, 0.66, 0.30); // Gold #C9A84C
    }
    
    // Smooth glow based on noise peaks (extremely soft and transparent gold mist)
    float intensity = pow(f, 3.2) * 0.28;
    
    // Ambient mouse spotlight glow
    float mouseGlow = smoothstep(0.38, 0.0, distToMouse) * 0.04;
    
    vec3 finalColor = mix(bg, goldColor, intensity + mouseGlow);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`

const ORBS = [
  { w: 600, h: 600, x: -10, y: -5, tx: 8, ty: 12, duration: 28, delay: 0, opacity: 0.045 },
  { w: 500, h: 500, x: 70, y: 60, tx: -10, ty: -8, duration: 35, delay: 5, opacity: 0.035 },
  { w: 700, h: 700, x: 40, y: -15, tx: -6, ty: 15, duration: 42, delay: 10, opacity: 0.025 },
  { w: 400, h: 400, x: 85, y: 20, tx: -12, ty: 8, duration: 30, delay: 3, opacity: 0.04 },
  { w: 550, h: 550, x: 20, y: 70, tx: 10, ty: -10, duration: 38, delay: 8, opacity: 0.03 },
  { w: 350, h: 350, x: 60, y: 85, tx: -8, ty: -12, duration: 25, delay: 15, opacity: 0.035 },
]

export default function BackgroundEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [webglSupported, setWebglSupported] = useState(true)
  const { theme } = useTheme()
  const reduced = useReducedMotion()

  // Track mouse coordinates
  const mouseRef = useRef({ x: 0.5, y: 0.5, currentX: 0.5, currentY: 0.5 })
  // Track scroll depth
  const scrollRef = useRef({ target: 0, current: 0 })

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const check = () => setIsMobile(window.innerWidth < 768)
    const debounced = () => { clearTimeout(timer); timer = setTimeout(check, 150) }
    check()
    window.addEventListener('resize', debounced, { passive: true })
    return () => { window.removeEventListener('resize', debounced); clearTimeout(timer) }
  }, [])

  // WebGL Render Loop Setup
  useEffect(() => {
    if (isMobile || reduced || !webglSupported) return

    const canvas = canvasRef.current
    if (!canvas) return

    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
    if (!gl) {
      setWebglSupported(false)
      return
    }

    // Helper: Compile Shader
    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader))
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

    // Program Setup
    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('WebGL program link error:', gl.getProgramInfoLog(program))
      setWebglSupported(false)
      return
    }

    gl.useProgram(program)

    // Full screen quad geometry
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ])

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const positionLoc = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

    // Uniform locations
    const uTimeLoc = gl.getUniformLocation(program, 'uTime')
    const uMouseLoc = gl.getUniformLocation(program, 'uMouse')
    const uScrollLoc = gl.getUniformLocation(program, 'uScroll')
    const uResWLoc = gl.getUniformLocation(program, 'uResolutionWidth')
    const uResHLoc = gl.getUniformLocation(program, 'uResolutionHeight')
    const uLightModeLoc = gl.getUniformLocation(program, 'uLightMode')

    // Resize Handler
    const handleResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    // Mouse Move Handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth
      mouseRef.current.y = 1.0 - (e.clientY / window.innerHeight) // WebGL coordinates are bottom-up
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Scroll Handler
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      scrollRef.current.target = maxScroll > 0 ? window.scrollY / maxScroll : 0
    }
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Loop
    let animId: number
    let startTime = performance.now()

    const render = () => {
      const time = (performance.now() - startTime) * 0.001
      
      // Interpolate mouse & scroll for smooth physics feel
      const mouse = mouseRef.current
      mouse.currentX += (mouse.x - mouse.currentX) * 0.08
      mouse.currentY += (mouse.y - mouse.currentY) * 0.08

      const scroll = scrollRef.current
      scroll.current += (scroll.target - scroll.current) * 0.08

      // Bind uniforms
      gl.uniform1f(uTimeLoc, time)
      gl.uniform2f(uMouseLoc, mouse.currentX, mouse.currentY)
      gl.uniform1f(uScrollLoc, scroll.current)
      gl.uniform1f(uResWLoc, canvas.width)
      gl.uniform1f(uResHLoc, canvas.height)
      gl.uniform1f(uLightModeLoc, theme === 'light' ? 1.0 : 0.0)

      gl.clearColor(0, 0, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 6)

      animId = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
      gl.deleteProgram(program)
      gl.deleteBuffer(buffer)
    }
  }, [isMobile, reduced, webglSupported, theme])

  // Fallback to static CSS orbs if WebGL not supported, mobile or reduced motion active
  if (isMobile || reduced || !webglSupported) {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {ORBS.slice(0, isMobile ? 2 : 4).map((orb, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: orb.w * 0.7,
              height: orb.h * 0.7,
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              background: 'radial-gradient(circle, rgba(201,168,76,1) 0%, transparent 70%)',
              opacity: orb.opacity * 0.7,
              filter: 'blur(70px)',
              transform: 'translate(-50%, -50%)',
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

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      <div
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />
    </div>
  )
}