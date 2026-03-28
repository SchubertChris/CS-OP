/* ============================================================
   CandleScope — Intro Animation
   src/components/ui/IntroAnimation.tsx

   Desktop: Three.js 3D Globus mit Kontinentumrissen
   Mobile:  CSS-only Animation (kein Three.js → kein Ruckeln)
   ============================================================ */
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import csLogo from '../../assets/images/CandleScope.webp'

const TOTAL  = 4200
const RADIUS = 0.80

const CONTINENTS: [number, number][][] = [
  // Europa
  [[71,28],[70,18],[62,5],[51,-5],[44,-9],[36,-6],[36,3],[38,15],
   [41,20],[45,14],[47,8],[48,17],[54,18],[58,22],[60,25],[65,14],[68,14],[71,28]],
  // Afrika
  [[37,10],[37,4],[32,-7],[18,-17],[15,-17],[10,-17],[5,-8],[4,8],
   [-5,10],[-18,12],[-34,18],[-34,26],[-26,33],[-11,40],[0,42],
   [11,42],[12,44],[15,40],[22,37],[30,33],[32,33],[37,10]],
  // Asien
  [[70,32],[72,60],[73,80],[68,100],[55,132],[45,135],[38,122],
   [25,121],[22,114],[10,100],[1,104],[-8,115],[-9,120],[-8,126],
   [4,118],[14,101],[22,92],[22,68],[28,62],[30,50],[38,44],
   [42,52],[55,60],[60,60],[68,56],[70,32]],
  // Nordamerika
  [[70,-140],[72,-120],[72,-80],[60,-65],[47,-53],[44,-66],[40,-74],
   [34,-76],[30,-81],[25,-80],[20,-87],[15,-88],[10,-84],[9,-80],
   [9,-77],[11,-75],[12,-72],[19,-90],[22,-98],[24,-107],[30,-110],
   [32,-117],[38,-122],[48,-124],[54,-130],[60,-145],[70,-140]],
  // Südamerika
  [[12,-72],[10,-62],[8,-60],[5,-52],[2,-50],[-5,-35],[-10,-37],
   [-12,-38],[-23,-43],[-33,-70],[-40,-62],[-52,-68],[-55,-67],
   [-54,-64],[-42,-63],[-30,-50],[-22,-42],[-12,-76],[-5,-80],
   [0,-78],[5,-77],[10,-72],[12,-72]],
  // Australien
  [[-12,131],[-14,136],[-18,140],[-24,154],[-34,151],[-38,146],
   [-38,140],[-38,130],[-32,116],[-22,114],[-18,122],[-16,128],[-12,131]],
  // Grönland
  [[76,-18],[84,-30],[84,-50],[76,-65],[68,-55],[64,-52],[66,-40],[70,-24],[76,-18]],
]

/* ════════════════════════════════════════════════════════════
   MOBILE VERSION — rein CSS, kein Three.js
════════════════════════════════════════════════════════════ */
function MobileIntro({ onDone }: { onDone: () => void }) {
  const [logoOpacity, setLogoOpacity]     = useState(0)
  const [logoScale, setLogoScale]         = useState(0.4)
  const [textOpacity, setTextOpacity]     = useState(0)
  const [subOpacity, setSubOpacity]       = useState(0)
  const [progress, setProgress]           = useState(0)
  const completedRef = useRef(false)

  const complete = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    onDone()
  }, [onDone])

  useEffect(() => {
    const orig = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = orig }
  }, [])

  useEffect(() => {
    const start = Date.now()
    let raf: number
    const tick = () => {
      const elapsed = Date.now() - start
      const t = Math.min(elapsed / TOTAL, 1)
      setProgress(t)
      if (elapsed > 400) {
        const lt = Math.min((elapsed - 400) / 1400, 1)
        const e  = 1 - Math.pow(1 - lt, 3)
        setLogoOpacity(e)
        setLogoScale(0.4 + e * 0.6)
      }
      if (elapsed > 1600) setTextOpacity(Math.min((elapsed - 1600) / 600, 1))
      if (elapsed > 2100) setSubOpacity(Math.min((elapsed - 2100) / 500, 1))
      if (t >= 1) { complete(); return }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [complete])

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center" style={{ background: '#080808' }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(201,168,76,0.016) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.016) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      {/* Pulsing rings — CSS only */}
      {[140, 100, 68].map((size, i) => (
        <motion.div key={size}
          className="absolute rounded-full border border-[#C9A84C]"
          style={{ width: size, height: size }}
          animate={{ opacity: [0.06, 0.14, 0.06], scale: [1, 1.04, 1] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
        />
      ))}

      {/* Logo */}
      <div className="flex flex-col items-center gap-5 relative z-10">
        <div className="relative flex items-center justify-center">
          <div className="absolute rounded-full" style={{
            width: 160, height: 160,
            background: 'radial-gradient(circle, rgba(201,168,76,0.18) 0%, transparent 65%)',
            opacity: logoOpacity,
          }} />
          <img src={csLogo} alt="CandleScope" style={{
            width: 88, height: 88, objectFit: 'contain',
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
            filter: `blur(${(1 - logoOpacity) * 10}px)`,
          }} />
        </div>
        <div style={{ opacity: textOpacity, transform: `translateY(${(1 - textOpacity) * 8}px)`, textAlign: 'center' }}>
          <p className="font-display text-2xl tracking-[0.22em] uppercase text-[#F5F0E8]">
            Candle<span className="text-[#C9A84C]">Scope</span>
          </p>
          <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#5a5550] mt-1.5"
            style={{ opacity: subOpacity }}>
            Finance · WebDev · Trading
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="w-28 h-px rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full" style={{
            width: `${progress * 100}%`,
            background: 'linear-gradient(90deg, rgba(201,168,76,0.4), #C9A84C)',
          }} />
        </div>
      </div>

      <motion.button onClick={complete}
        className="absolute bottom-7 right-8 font-mono text-[10px] tracking-[0.2em] uppercase text-[#3a3530] hover:text-[#C9A84C] transition-colors cursor-pointer"
        style={{ WebkitAppearance: 'none', appearance: 'none', background: 'none', border: 'none' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        Skip ›
      </motion.button>

      {['top-4 left-4 border-t border-l','top-4 right-4 border-t border-r',
        'bottom-4 left-4 border-b border-l','bottom-4 right-4 border-b border-r',
      ].map((cls, i) => (
        <div key={i} className={`absolute w-4 h-4 border-[#C9A84C]/20 pointer-events-none ${cls}`} />
      ))}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   DESKTOP VERSION — Three.js Globe
════════════════════════════════════════════════════════════ */
function DesktopIntro({ onDone }: { onDone: () => void }) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const disposeRef   = useRef<(() => void) | null>(null)
  const completedRef = useRef(false)

  const [visible, setVisible]               = useState(true)
  const [progress, setProgress]             = useState(0)
  const [logoOpacity, setLogoOpacity]       = useState(0)
  const [logoScale, setLogoScale]           = useState(0.3)
  const [logoBlur, setLogoBlur]             = useState(14)
  const [textOpacity, setTextOpacity]       = useState(0)
  const [subTextOpacity, setSubTextOpacity] = useState(0)

  const complete = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    disposeRef.current?.()
    setVisible(false)
    setTimeout(() => onDone(), 520)
  }, [onDone])

  const skip = useCallback(() => complete(), [complete])

  useEffect(() => {
    const orig = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = orig }
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return

    // Lazy import Three.js only on desktop
    import('three').then((THREE) => {
      if (!canvasRef.current) return

      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current!, antialias: true })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setClearColor(0x080808, 1)

      const scene  = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100)
      camera.position.z = 3.0

      const GOLD = new THREE.Color('#C9A84C')

      // Globe
      const globeGeo = new THREE.SphereGeometry(RADIUS, 72, 72)
      const globeMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#0b0b0b'),
        roughness: 0.95, metalness: 0.0,
        transparent: true, opacity: 1,
      })
      const globe = new THREE.Mesh(globeGeo, globeMat)
      scene.add(globe)

      // Grid
      const addLine = (pts: InstanceType<typeof THREE.Vector3>[], opacity: number) => {
        const geo = new THREE.BufferGeometry().setFromPoints(pts)
        const mat = new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity })
        scene.add(new THREE.Line(geo, mat))
      }
      ;[-60,-30,0,30,60].forEach(lat => {
        const phi = (90 - lat) * (Math.PI / 180)
        const y = RADIUS * Math.cos(phi), cR = RADIUS * Math.sin(phi)
        addLine(Array.from({ length: 129 }, (_, i) => {
          const a = (i / 128) * Math.PI * 2
          return new THREE.Vector3(Math.cos(a) * cR, y, Math.sin(a) * cR)
        }), lat === 0 ? 0.18 : 0.06)
      })
      for (let i = 0; i < 12; i++) {
        const lon = (i / 12) * Math.PI * 2
        addLine(Array.from({ length: 65 }, (_, j) => {
          const phi = (j / 64) * Math.PI
          return new THREE.Vector3(RADIUS*Math.sin(phi)*Math.cos(lon), RADIUS*Math.cos(phi), RADIUS*Math.sin(phi)*Math.sin(lon))
        }), 0.05)
      }

      // Continent outlines — attached to globe mesh so they rotate with it
      const toV = (lat: number, lon: number, r = RADIUS + 0.003) => {
        const phi = (90-lat)*(Math.PI/180), theta = (lon+180)*(Math.PI/180)
        return new THREE.Vector3(-r*Math.sin(phi)*Math.cos(theta), r*Math.cos(phi), r*Math.sin(phi)*Math.sin(theta))
      }

      const continentMats: InstanceType<typeof THREE.LineBasicMaterial>[] = []
      CONTINENTS.forEach(poly => {
        const pts = [...poly.map(([lat,lon]) => toV(lat,lon)), toV(poly[0][0], poly[0][1])]
        const mat = new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.95 })
        continentMats.push(mat)
        globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat))
      })

      // Candlestick pins
      ;[
        { lat:48,lon:2,h:0.045,bull:true }, { lat:40,lon:-74,h:0.04,bull:false },
        { lat:35,lon:105,h:0.055,bull:true }, { lat:-23,lon:-43,h:0.04,bull:true },
        { lat:55,lon:37,h:0.04,bull:false }, { lat:-34,lon:151,h:0.045,bull:true },
      ].forEach(p => {
        const base = toV(p.lat,p.lon), dir = base.clone().normalize()
        const top  = base.clone().add(dir.clone().multiplyScalar(p.h))
        globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([base,top]),
          new THREE.LineBasicMaterial({ color:GOLD, transparent:true, opacity:p.bull?0.9:0.35 })))
        globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
          base.clone().add(dir.clone().multiplyScalar(-0.012)),
          top.clone().add(dir.clone().multiplyScalar(0.012)),
        ]), new THREE.LineBasicMaterial({ color:GOLD, transparent:true, opacity:p.bull?0.4:0.15 })))
      })

      // Ring
      const ringMat = new THREE.MeshBasicMaterial({ color:GOLD, transparent:true, opacity:0.3 })
      const ring    = new THREE.Mesh(new THREE.TorusGeometry(RADIUS+0.045,0.002,8,120), ringMat)
      ring.rotation.x = Math.PI*0.22
      scene.add(ring)

      // Atmosphere — Fresnel shader (leuchtet nur an den Rändern)
      const atmMat = new THREE.ShaderMaterial({
        uniforms: {
          glowColor:  { value: new THREE.Color('#C9A84C') },
          viewVector: { value: camera.position },
          opacity:    { value: 1.0 },
        },
        vertexShader: `
          uniform vec3 viewVector;
          varying float intensity;
          void main() {
            vec3 vNormal = normalize(normalMatrix * normal);
            vec3 vNormel = normalize(normalMatrix * viewVector);
            float dot_ = abs(dot(vNormal, vNormel));
            intensity = pow(1.0 - clamp(dot_, 0.0, 1.0), 2.5);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 glowColor;
          uniform float opacity;
          varying float intensity;
          void main() {
            gl_FragColor = vec4(glowColor * intensity * 0.6, intensity * 0.5 * opacity);
          }
        `,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      })
      const atmMesh = new THREE.Mesh(new THREE.SphereGeometry(RADIUS + 0.22, 48, 48), atmMat)
      scene.add(atmMesh)

      // Thin inner halo
      const haloMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color('#C9A84C'),
        transparent: true, opacity: 0.05,
        side: THREE.BackSide,
      })
      scene.add(new THREE.Mesh(new THREE.SphereGeometry(RADIUS + 0.035, 32, 32), haloMat))

      // Particles
      const N=300, pPos=new Float32Array(N*3)
      for (let i=0;i<N;i++) {
        const r=1.05+Math.random()*0.9, phi=Math.random()*Math.PI*2, th=Math.random()*Math.PI
        pPos[i*3]=r*Math.sin(th)*Math.cos(phi); pPos[i*3+1]=r*Math.cos(th); pPos[i*3+2]=r*Math.sin(th)*Math.sin(phi)
      }
      const pGeo = new THREE.BufferGeometry()
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos,3))
      const pMat = new THREE.PointsMaterial({ color:GOLD, size:0.01, transparent:true, opacity:0.3 })
      const particles = new THREE.Points(pGeo, pMat)
      scene.add(particles)

      // Lights
      scene.add(new THREE.AmbientLight(0xffffff,0.25))
      const key = new THREE.DirectionalLight(new THREE.Color('#EDD87A'),2.2)
      key.position.set(5,4,5); scene.add(key)
      const rim = new THREE.PointLight(new THREE.Color('#C9A84C'),0.7,12)
      rim.position.set(-4,1,-5); scene.add(rim)

      // Animate
      const start = Date.now()
      let raf: number
      const tick = () => {
        raf = requestAnimationFrame(tick)
        const elapsed = Date.now()-start, t = Math.min(elapsed/TOTAL,1)
        setProgress(t)
        globe.rotation.y = elapsed*0.00026
        ring.rotation.y  = elapsed*0.00026
        particles.rotation.y = elapsed*0.00013
        if (elapsed>600) {
          const lt=Math.min((elapsed-600)/2000,1), ease=1-Math.pow(1-lt,3)
          setLogoOpacity(ease); setLogoScale(0.3+ease*0.7); setLogoBlur((1-ease)*14)
        }
        if (elapsed>2000) setTextOpacity(Math.min((elapsed-2000)/700,1))
        if (elapsed>2600) setSubTextOpacity(Math.min((elapsed-2600)/600,1))
        if (elapsed>2800) {
          const ft=Math.min((elapsed-2800)/1100,1), e=ft*ft
          globeMat.opacity=1-e; atmMat.uniforms.opacity.value=1-e; haloMat.opacity=0.05*(1-e); pMat.opacity=0.3*(1-e); ringMat.opacity=0.3*(1-e)
          continentMats.forEach(m => { m.opacity=0.95*(1-e) })
        }
        if (t>=1) { cancelAnimationFrame(raf); complete(); return }
        renderer.render(scene,camera)
      }
      raf = requestAnimationFrame(tick)

      const onResize = () => {
        camera.aspect = window.innerWidth/window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth,window.innerHeight)
      }
      window.addEventListener('resize', onResize)

      disposeRef.current = () => {
        cancelAnimationFrame(raf)
        window.removeEventListener('resize', onResize)
        renderer.dispose()
      }
    })

    return () => { disposeRef.current?.() }
  }, [complete])

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div key="intro-desktop" className="fixed inset-0 z-[300]"
          style={{ background: '#080808' }}
          initial={{ opacity:1 }} exit={{ opacity:0 }}
          transition={{ duration:0.5, ease:'easeInOut' }}>

          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage:`linear-gradient(rgba(201,168,76,0.016) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.016) 1px,transparent 1px)`,
            backgroundSize:'80px 80px',
          }} />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-6">
              <div className="relative flex items-center justify-center">
                <div className="absolute rounded-full" style={{
                  width:200, height:200,
                  background:'radial-gradient(circle,rgba(201,168,76,0.2) 0%,transparent 65%)',
                  opacity:logoOpacity,
                }} />
                <img src={csLogo} alt="CandleScope" style={{
                  width:96, height:96, objectFit:'contain', position:'relative',
                  opacity:logoOpacity, transform:`scale(${logoScale})`, filter:`blur(${logoBlur}px)`,
                }} />
              </div>
              <div style={{ opacity:textOpacity, transform:`translateY(${(1-textOpacity)*10}px)`, textAlign:'center' }}>
                <p className="font-display text-3xl tracking-[0.22em] uppercase text-[#F5F0E8]">
                  Candle<span className="text-[#C9A84C]">Scope</span>
                </p>
                <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-[#5a5550] mt-2"
                  style={{ opacity:subTextOpacity }}>
                  Finance · WebDev · Trading
                </p>
              </div>
            </div>
          </div>

          <motion.div className="absolute left-0 right-0 pointer-events-none"
            style={{ height:2, background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.45) 40%,rgba(201,168,76,0.7) 50%,rgba(201,168,76,0.45) 60%,transparent)', boxShadow:'0 0 12px rgba(201,168,76,0.25)' }}
            initial={{ top:'-2px', opacity:0 }} animate={{ top:'calc(100% + 2px)', opacity:[0,1,1,0.4,0] }}
            transition={{ duration:2.8, ease:'linear', delay:0.4 }} />

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="w-32 h-px rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full" style={{ width:`${progress*100}%`, background:'linear-gradient(90deg,rgba(201,168,76,0.4),#C9A84C)' }} />
            </div>
          </div>

          <motion.button onClick={skip}
            className="absolute bottom-9 right-10 font-mono text-[10px] tracking-[0.22em] uppercase text-[#3a3530] hover:text-[#C9A84C] transition-colors duration-300 cursor-pointer"
            style={{ WebkitAppearance:'none', appearance:'none', background:'none', border:'none' }}
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.0 }}>
            Skip ›
          </motion.button>

          {['top-5 left-5 border-t border-l','top-5 right-5 border-t border-r',
            'bottom-5 left-5 border-b border-l','bottom-5 right-5 border-b border-r',
          ].map((cls,i) => (
            <motion.div key={i} className={`absolute w-5 h-5 border-[#C9A84C]/20 pointer-events-none ${cls}`}
              initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1+i*0.05 }} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ════════════════════════════════════════════════════════════
   MAIN — Device detection
════════════════════════════════════════════════════════════ */
export default function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const isMobile = window.innerWidth < 768

  const [done, setDone] = useState(false)

  const handleDone = useCallback(() => {
    setDone(true)
    onComplete()
  }, [onComplete])

  if (done) return null

  return isMobile
    ? <MobileIntro onDone={handleDone} />
    : <DesktopIntro onDone={handleDone} />
}