/* ============================================================
   CandleScope — Intro Animation
   src/components/ui/IntroAnimation.tsx

   Echter 3D Globus mit Kontinentumrissen als goldene Linien
   Logo fädet von hinter dem Globus rein
   ============================================================ */
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import csLogo from '../../assets/images/CandleScope.webp'

const TOTAL  = 4500
const RADIUS = 0.80

/* ── Kontinentumrisse als lat/lon Polylines ─────────────
   Vereinfachte aber erkennbare Umrisse
──────────────────────────────────────────────────────── */
const CONTINENTS: [number, number][][] = [
  // Europa
  [
    [71,28],[70,18],[62,5],[51,-5],[44,-9],[36,-6],[36,3],[38,15],
    [41,20],[45,14],[47,8],[48,17],[54,18],[58,22],[60,25],[65,14],
    [68,14],[71,28],
  ],
  // Afrika
  [
    [37,10],[37,4],[32,-7],[18,-17],[15,-17],[10,-17],[5,-8],[4,8],
    [-5,10],[-18,12],[-34,18],[-34,26],[-26,33],[-11,40],[0,42],
    [11,42],[12,44],[15,40],[22,37],[30,33],[32,33],[37,10],
  ],
  // Asien (vereinfacht)
  [
    [70,32],[72,60],[73,80],[68,100],[55,132],[45,135],[38,122],
    [25,121],[22,114],[10,100],[1,104],[-8,115],[-9,120],
    [-8,126],[4,118],[14,101],[22,92],[22,68],[28,62],[30,50],
    [38,44],[42,52],[55,60],[60,60],[68,56],[70,32],
  ],
  // Nordamerika
  [
    [70,-140],[72,-120],[72,-80],[60,-65],[47,-53],[44,-66],
    [40,-74],[34,-76],[30,-81],[25,-80],[20,-87],[15,-88],
    [10,-84],[9,-80],[9,-77],[11,-75],[12,-72],[19,-90],
    [22,-98],[24,-107],[30,-110],[32,-117],[38,-122],[48,-124],
    [54,-130],[60,-145],[70,-140],
  ],
  // Südamerika
  [
    [12,-72],[10,-62],[8,-60],[5,-52],[2,-50],[-5,-35],
    [-10,-37],[-12,-38],[-23,-43],[-33,-70],[-40,-62],
    [-52,-68],[-55,-67],[-54,-64],[-42,-63],[-30,-50],
    [-22,-42],[-12,-76],[-5,-80],[0,-78],[5,-77],
    [10,-72],[12,-72],
  ],
  // Australien
  [
    [-12,131],[-14,136],[-18,140],[-24,154],[-34,151],
    [-38,146],[-38,140],[-38,130],[-32,116],[-22,114],
    [-18,122],[-16,128],[-12,131],
  ],
  // Grönland
  [
    [76,-18],[84,-30],[84,-50],[76,-65],[68,-55],[64,-52],
    [66,-40],[70,-24],[76,-18],
  ],
]

export default function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const disposeRef   = useRef<() => void>()
  const completedRef = useRef(false)

  const [visible, setVisible]               = useState(true)
  const [progress, setProgress]             = useState(0)
  const [logoOpacity, setLogoOpacity]       = useState(0)
  const [logoScale, setLogoScale]           = useState(0.3)
  const [logoBlur, setLogoBlur]             = useState(14)
  const [textOpacity, setTextOpacity]       = useState(0)
  const [subTextOpacity, setSubTextOpacity] = useState(0)

  /* ── Scroll lock ─────────────────────────────────────── */
  useEffect(() => {
    const orig = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = orig }
  }, [])

  /* ── Complete ────────────────────────────────────────── */
  const complete = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    disposeRef.current?.()
    setVisible(false)
    setTimeout(() => onComplete(), 520)
  }, [onComplete])

  const skip = useCallback(() => complete(), [complete])

  /* ── Three.js ────────────────────────────────────────── */
  useEffect(() => {
    if (!canvasRef.current) return

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x080808, 1)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.z = 3.0

    const GOLD = new THREE.Color('#C9A84C')

    /* ── Solid dark globe ───────────────── */
    const globeGeo = new THREE.SphereGeometry(RADIUS, 72, 72)
    const globeMat = new THREE.MeshStandardMaterial({
      color:     new THREE.Color('#0b0b0b'),
      roughness: 0.95,
      metalness: 0.0,
      transparent: true,
      opacity:   1,
    })
    const globe = new THREE.Mesh(globeGeo, globeMat)
    scene.add(globe)

    /* ── Grid lines ─────────────────────── */
    const addLine = (pts: THREE.Vector3[], opacity: number) => {
      const geo = new THREE.BufferGeometry().setFromPoints(pts)
      const mat = new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity })
      scene.add(new THREE.Line(geo, mat))
    }

    // Latitude
    ;[-60, -30, 0, 30, 60].forEach(lat => {
      const phi = (90 - lat) * (Math.PI / 180)
      const y   = RADIUS * Math.cos(phi)
      const cR  = RADIUS * Math.sin(phi)
      addLine(
        Array.from({ length: 129 }, (_, i) => {
          const a = (i / 128) * Math.PI * 2
          return new THREE.Vector3(Math.cos(a) * cR, y, Math.sin(a) * cR)
        }),
        lat === 0 ? 0.18 : 0.06,
      )
    })

    // Longitude
    for (let i = 0; i < 12; i++) {
      const lon = (i / 12) * Math.PI * 2
      addLine(
        Array.from({ length: 65 }, (_, j) => {
          const phi = (j / 64) * Math.PI
          return new THREE.Vector3(
            RADIUS * Math.sin(phi) * Math.cos(lon),
            RADIUS * Math.cos(phi),
            RADIUS * Math.sin(phi) * Math.sin(lon),
          )
        }),
        0.05,
      )
    }

    /* ── Helper: lat/lon → 3D ────────────── */
    const toV = (lat: number, lon: number, r = RADIUS + 0.003) => {
      const phi   = (90 - lat) * (Math.PI / 180)
      const theta = (lon + 180) * (Math.PI / 180)
      return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
        r  * Math.cos(phi),
        r  * Math.sin(phi) * Math.sin(theta),
      )
    }

    /* ── Continent outline lines ─────────── */
    const continentLines: THREE.Line[] = []
    CONTINENTS.forEach(poly => {
      const pts = poly.map(([lat, lon]) => toV(lat, lon))
      // Close the polygon
      pts.push(pts[0].clone())
      const geo = new THREE.BufferGeometry().setFromPoints(pts)
      const mat = new THREE.LineBasicMaterial({
        color: GOLD, transparent: true, opacity: 0.75,
      })
      const line = new THREE.Line(geo, mat)
      globe.add(line) // attach to globe so it rotates with it
      continentLines.push(line)
    })

    /* ── Candlestick pins ────────────────── */
    const pins = [
      { lat: 48, lon: 2,    h: 0.045, bull: true  },
      { lat: 40, lon: -74,  h: 0.04,  bull: false },
      { lat: 35, lon: 105,  h: 0.055, bull: true  },
      { lat: -23, lon: -43, h: 0.04,  bull: true  },
      { lat: 55, lon: 37,   h: 0.04,  bull: false },
      { lat: -34, lon: 151, h: 0.045, bull: true  },
      { lat: 1,  lon: 104,  h: 0.04,  bull: false },
    ]

    pins.forEach(p => {
      const base = toV(p.lat, p.lon)
      const dir  = base.clone().normalize()
      const top  = base.clone().add(dir.clone().multiplyScalar(p.h))
      const body = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([base, top]),
        new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: p.bull ? 0.9 : 0.35 }),
      )
      const wick = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          base.clone().add(dir.clone().multiplyScalar(-0.012)),
          top.clone().add(dir.clone().multiplyScalar(0.012)),
        ]),
        new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: p.bull ? 0.4 : 0.15 }),
      )
      globe.add(body)
      globe.add(wick)
    })

    /* ── Outer ring ──────────────────────── */
    const ringMat = new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.3 })
    const ring    = new THREE.Mesh(new THREE.TorusGeometry(RADIUS + 0.045, 0.002, 8, 120), ringMat)
    ring.rotation.x = Math.PI * 0.22
    scene.add(ring)

    /* ── Atmosphere ──────────────────────── */
    const atmMat = new THREE.MeshBasicMaterial({
      color: GOLD, transparent: true, opacity: 0.045, side: THREE.BackSide,
    })
    const atm = new THREE.Mesh(new THREE.SphereGeometry(RADIUS + 0.07, 32, 32), atmMat)
    scene.add(atm)

    /* ── Particles ───────────────────────── */
    const N    = 300
    const pPos = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      const r   = 1.05 + Math.random() * 0.9
      const phi = Math.random() * Math.PI * 2
      const th  = Math.random() * Math.PI
      pPos[i * 3]     = r * Math.sin(th) * Math.cos(phi)
      pPos[i * 3 + 1] = r * Math.cos(th)
      pPos[i * 3 + 2] = r * Math.sin(th) * Math.sin(phi)
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    const pMat = new THREE.PointsMaterial({ color: GOLD, size: 0.01, transparent: true, opacity: 0.3 })
    const particles = new THREE.Points(pGeo, pMat)
    scene.add(particles)

    /* ── Lights ──────────────────────────── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.25))
    const key = new THREE.DirectionalLight(new THREE.Color('#EDD87A'), 2.2)
    key.position.set(5, 4, 5)
    scene.add(key)
    const rim = new THREE.PointLight(new THREE.Color('#C9A84C'), 0.7, 12)
    rim.position.set(-4, 1, -5)
    scene.add(rim)

    /* ── Animation loop ──────────────────── */
    const start = Date.now()
    let raf: number

    const tick = () => {
      raf = requestAnimationFrame(tick)
      const elapsed = Date.now() - start
      const t       = Math.min(elapsed / TOTAL, 1)

      setProgress(t)

      // Globe rotation
      globe.rotation.y     = elapsed * 0.00026
      ring.rotation.y      = elapsed * 0.00026
      particles.rotation.y = elapsed * 0.00013

      // Logo: fade in 0.6s → 2.6s
      if (elapsed > 600) {
        const lt   = Math.min((elapsed - 600) / 2000, 1)
        const ease = 1 - Math.pow(1 - lt, 3)
        setLogoOpacity(ease)
        setLogoScale(0.3 + ease * 0.7)
        setLogoBlur((1 - ease) * 14)
      }

      // Text 2.0s
      if (elapsed > 2000) setTextOpacity(Math.min((elapsed - 2000) / 700, 1))

      // Subtext 2.6s
      if (elapsed > 2600) setSubTextOpacity(Math.min((elapsed - 2600) / 600, 1))

      // Fade out globe 3.0s → 4.3s
      if (elapsed > 3000) {
        const ft = Math.min((elapsed - 3000) / 1300, 1)
        const e  = ft * ft
        globeMat.opacity = 1 - e
        atmMat.opacity   = 0.045 * (1 - e)
        pMat.opacity     = 0.3   * (1 - e)
        ringMat.opacity  = 0.3   * (1 - e)
        continentLines.forEach(l => {
          ;(l.material as THREE.LineBasicMaterial).opacity = 0.75 * (1 - e)
        })
      }

      if (t >= 1) {
        cancelAnimationFrame(raf)
        complete()
        return
      }

      renderer.render(scene, camera)
    }
    raf = requestAnimationFrame(tick)

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    disposeRef.current = () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
    }

    return () => disposeRef.current?.()
  }, [complete])

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[300]"
          style={{ background: '#080808' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          {/* Grid */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `linear-gradient(rgba(201,168,76,0.016) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.016) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }} />

          {/* Logo + Text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-6">
              <div className="relative flex items-center justify-center">
                <div className="absolute rounded-full" style={{
                  width: 200, height: 200,
                  background: 'radial-gradient(circle, rgba(201,168,76,0.2) 0%, transparent 65%)',
                  opacity: logoOpacity,
                }} />
                <img src={csLogo} alt="CandleScope" style={{
                  width: 96, height: 96,
                  objectFit: 'contain',
                  position: 'relative',
                  opacity: logoOpacity,
                  transform: `scale(${logoScale})`,
                  filter: `blur(${logoBlur}px)`,
                }} />
              </div>
              <div style={{
                opacity: textOpacity,
                transform: `translateY(${(1 - textOpacity) * 10}px)`,
                textAlign: 'center',
              }}>
                <p className="font-display text-3xl tracking-[0.22em] uppercase text-[#F5F0E8]">
                  Candle<span className="text-[#C9A84C]">Scope</span>
                </p>
                <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-[#5a5550] mt-2"
                  style={{ opacity: subTextOpacity }}>
                  Finance · WebDev · Trading
                </p>
              </div>
            </div>
          </div>

          {/* Scan line */}
          <motion.div className="absolute left-0 right-0 pointer-events-none"
            style={{
              height: 2,
              background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.45) 40%, rgba(201,168,76,0.7) 50%, rgba(201,168,76,0.45) 60%, transparent)',
              boxShadow: '0 0 12px rgba(201,168,76,0.25)',
            }}
            initial={{ top: '-2px', opacity: 0 }}
            animate={{ top: 'calc(100% + 2px)', opacity: [0, 1, 1, 0.4, 0] }}
            transition={{ duration: 2.8, ease: 'linear', delay: 0.4 }}
          />

          {/* Progress */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="w-32 h-px rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full" style={{
                width: `${progress * 100}%`,
                background: 'linear-gradient(90deg, rgba(201,168,76,0.4), #C9A84C)',
              }} />
            </div>
          </div>

          {/* Skip */}
          <motion.button onClick={skip}
            className="absolute bottom-9 right-10 font-mono text-[10px] tracking-[0.22em] uppercase text-[#3a3530] hover:text-[#C9A84C] transition-colors duration-300 cursor-pointer"
            style={{ WebkitAppearance: 'none', appearance: 'none', background: 'none', border: 'none' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
          >
            Skip ›
          </motion.button>

          {/* Corner brackets */}
          {['top-5 left-5 border-t border-l', 'top-5 right-5 border-t border-r',
            'bottom-5 left-5 border-b border-l', 'bottom-5 right-5 border-b border-r',
          ].map((cls, i) => (
            <motion.div key={i}
              className={`absolute w-5 h-5 border-[#C9A84C]/20 pointer-events-none ${cls}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}