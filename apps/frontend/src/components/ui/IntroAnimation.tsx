/* ============================================================
   CandleScope — Intro Animation (Performance‑optimized v3)
   src/components/ui/IntroAnimation.tsx
   Mobile + Desktop, 3D Globe + Moon, data streams in gold/cyan
   ============================================================ */
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import csLogo from '../../assets/images/CandleScope.webp'

const DURATION = 5800      // Gesamt‑Intro‑Dauer
const RADIUS = 0.84

const CONTINENTS: [number, number][][] = [
  [[71,28],[70,18],[62,5],[51,-5],[44,-9],[36,-6],[36,3],[38,15],[41,20],[45,14],[47,8],[48,17],[54,18],[58,22],[60,25],[65,14],[68,14],[71,28]],
  [[37,10],[37,4],[32,-7],[18,-17],[15,-17],[10,-17],[5,-8],[4,8],[-5,10],[-18,12],[-34,18],[-34,26],[-26,33],[-11,40],[0,42],[11,42],[12,44],[15,40],[22,37],[30,33],[32,33],[37,10]],
  [[70,32],[72,60],[73,80],[68,100],[55,132],[45,135],[38,122],[25,121],[22,114],[10,100],[1,104],[-8,115],[-9,120],[-8,126],[4,118],[14,101],[22,92],[22,68],[28,62],[30,50],[38,44],[42,52],[55,60],[60,60],[68,56],[70,32]],
  [[70,-140],[72,-120],[72,-80],[60,-65],[47,-53],[44,-66],[40,-74],[34,-76],[30,-81],[25,-80],[20,-87],[15,-88],[10,-84],[9,-80],[9,-77],[11,-75],[12,-72],[19,-90],[22,-98],[24,-107],[30,-110],[32,-117],[38,-122],[48,-124],[54,-130],[60,-145],[70,-140]],
  [[12,-72],[10,-62],[8,-60],[5,-52],[2,-50],[-5,-35],[-10,-37],[-12,-38],[-23,-43],[-33,-70],[-40,-62],[-52,-68],[-55,-67],[-54,-64],[-42,-63],[-30,-50],[-22,-42],[-12,-76],[-5,-80],[0,-78],[5,-77],[10,-72],[12,-72]],
  [[-12,131],[-14,136],[-18,140],[-24,154],[-34,151],[-38,146],[-38,140],[-38,130],[-32,116],[-22,114],[-18,122],[-16,128],[-12,131]],
  [[76,-18],[84,-30],[84,-50],[76,-65],[68,-55],[64,-52],[66,-40],[70,-24],[76,-18]],
]

const TECTONIC_CRACKS: [number, number][][] = [
  [[60,-170],[50,-160],[40,-150],[30,-142],[20,-107],[10,-85],[0,-80],[-10,-78],[-20,-70],[-30,-68],[-40,-70]],
  [[70,-25],[60,-30],[50,-28],[40,-27],[30,-25],[20,-23],[10,-22],[0,-18],[-10,-14],[-20,-12],[-30,-10],[-40,-12],[-55,-18]],
  [[15,55],[10,57],[0,60],[-10,62],[-20,65],[-30,68],[-40,70]],
]

const CITIES: { lat: number; lon: number; size: number }[] = [
  { lat:40.7, lon:-74.0, size:1.0 },
  { lat:51.5, lon:-0.1,  size:0.9 },
  { lat:48.9, lon:2.3,   size:0.9 },
  { lat:35.7, lon:139.7, size:1.0 },
  { lat:31.2, lon:121.5, size:0.9 },
  { lat:1.3,  lon:103.8, size:0.8 },
  { lat:-23.5,lon:-46.6, size:0.8 },
  { lat:55.8, lon:37.6,  size:0.8 },
  { lat:28.6, lon:77.2,  size:0.8 },
  { lat:-33.9,lon:151.2, size:0.7 },
  { lat:30.0, lon:31.2,  size:0.7 },
  { lat:34.0, lon:-118.2, size:0.8 },
  { lat:52.5, lon:13.4,  size:0.7 },
  { lat:37.6, lon:126.9, size:0.7 },
]

const DATA_STREAMS: [number, number][] = [
  [0,1],[0,4],[1,2],[1,7],[4,5],[3,6],[6,9],[8,5],[0,11],[4,13],[1,8],[2,12],
]

function jitterPolyline(pts: [number,number][], jitter: number, subs: number): [number,number][] {
  const result: [number,number][] = []
  for (let i=0; i<pts.length-1; i++) {
    const [la1,lo1]=pts[i], [la2,lo2]=pts[i+1]
    result.push([la1,lo1])
    for (let s=1; s<subs; s++) {
      const t = s / subs
      result.push([
        la1 + (la2-la1)*t + (Math.random()-.5)*jitter*2,
        lo1 + (lo2-lo1)*t + (Math.random()-.5)*jitter*2,
      ])
    }
  }
  result.push(pts[pts.length-1])
  return result
}

function MobileIntro({ onDone }: { onDone: () => void }) {
  const [logoOpacity, setLogoOpacity] = useState(0)
  const [logoScale, setLogoScale] = useState(0.35)
  const [textOpacity, setTextOpacity] = useState(0)
  const [subOpacity, setSubOpacity] = useState(0)
  const [progress, setProgress] = useState(0)
  const completedRef = useRef(false)

  const complete = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    onDone()
  }, [onDone])

  useEffect(() => {
    const orig = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const start = Date.now()
    let raf = 0
    const tick = () => {
      const elapsed = Date.now() - start
      const t = Math.min(elapsed / DURATION, 1)
      setProgress(t)

      if (elapsed > 200) {
        const lt = Math.min((elapsed - 200) / 1300, 1)
        const e = 1 - Math.pow(1 - lt, 3)
        setLogoOpacity(e)
        setLogoScale(0.35 + e * 0.65)
      }
      if (elapsed > 1300) setTextOpacity(Math.min((elapsed - 1300) / 600, 1))
      if (elapsed > 1800) setSubOpacity(Math.min((elapsed - 1800) / 400, 1))
      if (t >= 1) { complete(); return }
      raf = requestAnimationFrame(tick)
    }
    setTimeout(() => raf = requestAnimationFrame(tick), 16)
    return () => {
      cancelAnimationFrame(raf)
      document.body.style.overflow = orig
    }
  }, [complete])

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center" style={{ background: '#030204' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(rgba(201,168,76,0.012) 1px,transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.012) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="flex flex-col items-center gap-5 relative z-10">
        <div className="relative flex items-center justify-center">
          <div
            className="absolute rounded-full blur-2xl"
            style={{
              width: 180,
              height: 180,
              background: 'radial-gradient(circle, rgba(201,168,76,0.16) 0%, rgba(201,168,76,0.04) 42%, transparent 70%)',
              opacity: logoOpacity,
            }}
          />
          <img
            src={csLogo}
            alt="CandleScope"
            style={{
              width: 90,
              height: 90,
              objectFit: 'contain',
              opacity: logoOpacity,
              transform: `scale(${logoScale})`,
              filter: `blur(${(1 - logoOpacity) * 6}px) drop-shadow(0 0 14px rgba(201,168,76,0.1))`,
            }}
          />
        </div>

        <div style={{ opacity: textOpacity, transform: `translateY(${(1 - textOpacity) * 8}px)`, textAlign: 'center' }}>
          <p className="font-display text-2xl tracking-[0.24em] uppercase text-[#F5F0E8]">
            Candle<span className="text-[#C9A84C]">Scope</span>
          </p>
          <p className="font-mono text-[9px] tracking-[0.32em] uppercase text-[#756e66] mt-1.5" style={{ opacity: subOpacity }}>
            Finance · WebDev · Trading
          </p>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="w-28 h-px rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${progress * 100}%`, background: 'linear-gradient(90deg, rgba(201,168,76,0.2), #C9A84C, rgba(84,232,255,0.3))' }}
          />
        </div>
      </div>

      <motion.button
        onClick={complete}
        className="absolute bottom-7 right-8 font-mono text-[10px] tracking-[0.2em] uppercase text-[#423d37] hover:text-[#C9A84C] transition-colors cursor-pointer"
        style={{ WebkitAppearance: 'none', appearance: 'none', background: 'none', border: 'none' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Skip ›
      </motion.button>
    </div>
  )
}

function DesktopIntro({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const disposeRef = useRef<(() => void) | null>(null)
  const completedRef = useRef(false)
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(0)
  const [logoOpacity, setLogoOpacity] = useState(0)
  const [logoScale, setLogoScale] = useState(0.26)
  const [logoBlur, setLogoBlur] = useState(10)
  const [textOpacity, setTextOpacity] = useState(0)
  const [subTextOpacity, setSubTextOpacity] = useState(0)

  const complete = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    disposeRef.current?.()
    setVisible(false)
    setTimeout(() => onDone(), 380)
  }, [onDone])
  const skip = useCallback(() => complete(), [complete])

  useEffect(() => {
    const orig = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = orig }
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return

    import('three').then((THREE) => {
      if (!canvasRef.current) return

      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: false })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setClearColor(0x030204, 1)
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.05
      renderer.outputColorSpace = THREE.SRGBColorSpace

      const scene = new THREE.Scene()
      scene.fog = new THREE.Fog(0x030204, 4.2, 10)

      const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100)
      camera.position.z = 3.25

      const GOLD      = new THREE.Color('#C9A84C')
      const GOLD_DIM  = new THREE.Color('#705811')
      const GOLD_HOT  = new THREE.Color('#FFE7A3')
      const CYAN      = new THREE.Color('#54E8FF')

      const toV = (lat: number, lon: number, r = RADIUS + 0.004) => {
        const phi = (90 - lat) * (Math.PI / 180)
        const theta = (lon + 180) * (Math.PI / 180)
        return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta))
      }

      const globeGeo = new THREE.SphereGeometry(RADIUS, 100, 100)
      const globeMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#090909'),
        roughness: 0.98,
        metalness: 0.0,
        transparent: true,
        opacity: 1,
      })
      const globe = new THREE.Mesh(globeGeo, globeMat)
      scene.add(globe)

      const streamContainer = new THREE.Object3D()
      scene.add(streamContainer)

      // Grid – nur sehr dezent
      ;[-60,0,60].forEach(lat => {
        const phi = (90-lat)*(Math.PI/180)
        const y = RADIUS*Math.cos(phi), cR=RADIUS*Math.sin(phi)
        const pts = Array.from({length: 129}, (_,i) => {
          const a = (i/128)*Math.PI*2
          return new THREE.Vector3(Math.cos(a)*cR,y,Math.sin(a)*cR)
        })
        globe.add(
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(pts),
            new THREE.LineBasicMaterial({ color: GOLD_DIM, transparent: true, opacity: lat===0?0.06:0.025 })
          )
        )
      })

            for (let i=0; i<12; i++) {
        const lon = (i/12)*Math.PI*2
        const pts = Array.from({length:65}, (_,j) => {
          const phi=(j/64)*Math.PI
          return new THREE.Vector3(RADIUS*Math.sin(phi)*Math.cos(lon),RADIUS*Math.cos(phi),RADIUS*Math.sin(phi)*Math.sin(lon))
        })
        globe.add(new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(pts),
          new THREE.LineBasicMaterial({ color: GOLD_DIM, transparent: true, opacity: 0.018 })
        ))
      }

      const crackMats: THREE.LineBasicMaterial[] = []
      const addCrack = (lls: [number,number][], op: number, col: THREE.Color, j: number, s: number, r=RADIUS+0.004) => {
        const pts = jitterPolyline([...lls,lls[0]], j, s).map(([la,lo]) => toV(la,lo,r))
        const mat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: op })
        crackMats.push(mat)
        globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),mat))
      }

      CONTINENTS.forEach(poly => {
        addCrack(poly, 0.42, GOLD, 0.22, 4)
        const inner = poly.map(([la,lo]): [number,number] => [la+(Math.random()-.5)*0.22,lo+(Math.random()-.5)*0.22])
        addCrack(inner, 0.12, GOLD, 0.4, 3, RADIUS+0.005)
      })
      TECTONIC_CRACKS.forEach(crack => {
        addCrack(crack, 0.32, GOLD_HOT, 0.72, 5)
        addCrack(crack, 0.07, GOLD_HOT, 0.18, 2, RADIUS+0.006)
      })

      for (let i=0; i<10; i++) {
        const sLat=(Math.random()-.5)*140,sLon=(Math.random()-.5)*340,len=2+Math.random()*5,ang=Math.random()*360
        const mc: [number,number][] = Array.from({length:5}, (_,s) => [
          sLat + Math.cos(ang*Math.PI/180)*len*(s/4) + (Math.random()-.5)*0.22,
          sLon + Math.sin(ang*Math.PI/180)*len*(s/4) + (Math.random()-.5)*0.22,
        ])
        addCrack(mc, 0.1 + Math.random()*0.1, GOLD, 0.22, 3)
      }

      const cityRings: {
        outer: THREE.Mesh;
        outerMat: THREE.MeshBasicMaterial;
        innerMat: THREE.MeshBasicMaterial;
        phase: number;
      }[] = []

      CITIES.forEach(city => {
        const pos = toV(city.lat, city.lon, RADIUS+0.001)
        const normal = pos.clone().normalize()
        const outerMat = new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.0 })
        const outer = new THREE.Mesh(new THREE.TorusGeometry(0.011*city.size,0.00065,6,32), outerMat)
        const innerMat = new THREE.MeshBasicMaterial({ color: GOLD_HOT, transparent: true, opacity: 0.82 })
        const inner = new THREE.Mesh(new THREE.CircleGeometry(0.0035*city.size,12), innerMat)

        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), normal)
        outer.quaternion.copy(quat)
        inner.quaternion.copy(quat)
        outer.position.copy(pos)
        inner.position.copy(pos)
        globe.add(outer)
        globe.add(inner)
        cityRings.push({ outer, outerMat, innerMat, phase: Math.random()*Math.PI*2 })
      })

      const streamMats: THREE.LineBasicMaterial[] = []
      const streamData: {
        points: THREE.Vector3[];
        mat: THREE.LineBasicMaterial;
        progress: number;
        speed: number;
        line: THREE.Line | null;
      }[] = []

      DATA_STREAMS.forEach(([a,b]) => {
        const pA = toV(CITIES[a].lat, CITIES[a].lon, RADIUS+0.006)
        const pB = toV(CITIES[b].lat, CITIES[b].lon, RADIUS+0.006)
        const mid = pA.clone().add(pB).multiplyScalar(0.5).normalize().multiplyScalar(RADIUS+0.11+Math.random()*0.05)
        const arcPts: THREE.Vector3[] = []

        for (let i=0; i<=32; i++) {
          const t=i/32
          arcPts.push(new THREE.Vector3(
            (1-t)*(1-t)*pA.x+2*(1-t)*t*mid.x+t*t*pB.x,
            (1-t)*(1-t)*pA.y+2*(1-t)*t*mid.y+t*t*pB.y,
            (1-t)*(1-t)*pA.z+2*(1-t)*t*mid.z+t*t*pB.z,
          ))
        }

        const mat = new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0 })
        streamMats.push(mat)
        streamData.push({
          points: arcPts,
          mat,
          progress: Math.random(),
          speed: 0.0022 + Math.random()*0.003,
          line: null,
        })
      })

      const moonCanvas = document.createElement('canvas')
      moonCanvas.width = 1024
      moonCanvas.height = 512
      const mctx = moonCanvas.getContext('2d')!
      const moonBg = mctx.createLinearGradient(0,0,1024,512)
      moonBg.addColorStop(0,   '#2a2a2a')
      moonBg.addColorStop(0.3, '#1c1c1c')
      moonBg.addColorStop(0.65,'#242424')
      moonBg.addColorStop(1,   '#161616')
      mctx.fillStyle = moonBg
      mctx.fillRect(0,0,1024,512)

      const mares = [
        {x:320,y:200,rx:110,ry:78},{x:470,y:220,rx:72,ry:56},{x:580,y:250,rx:58,ry:44},
        {x:700,y:210,rx:42,ry:34},{x:360,y:300,rx:92,ry:62},{x:240,y:230,rx:44,ry:32},{x:750,y:320,rx:34,ry:26},
      ]
      mares.forEach(m => {
        const g = mctx.createRadialGradient(m.x,m.y,0,m.x,m.y,Math.max(m.rx,m.ry))
        g.addColorStop(0,   'rgba(12,12,14,0.80)')
        g.addColorStop(0.6, 'rgba(14,14,16,0.42)')
        g.addColorStop(1,   'rgba(20,20,22,0)')
        mctx.save()
        mctx.scale(1, m.ry/m.rx)
        mctx.beginPath()
        mctx.arc(m.x, m.y*(m.rx/m.ry), m.rx, 0, Math.PI*2)
        mctx.fillStyle = g
        mctx.fill()
        mctx.restore()
      })

      const craters = [
        {x:640,y:140,r:26},{x:270,y:110,r:20},{x:840,y:180,r:14},{x:130,y:300,r:22},
        {x:760,y:350,r:16},{x:430,y:110,r:13},{x:920,y:90,r:11},{x:520,y:380,r:18},
        {x:230,y:360,r:14},{x:690,y:430,r:12},{x:980,y:300,r:9},{x:90,y:160,r:10},
      ]
      craters.forEach(c => {
        const shadow = mctx.createRadialGradient(c.x-c.r*0.3, c.y-c.r*0.3, 0, c.x, c.y, c.r*1.45)
        shadow.addColorStop(0,   'rgba(38,38,38,0)')
        shadow.addColorStop(0.55,'rgba(9,9,9,0.22)')
        shadow.addColorStop(0.85,'rgba(6,6,6,0.38)')
        shadow.addColorStop(1,   'rgba(26,26,26,0)')
        mctx.beginPath()
        mctx.arc(c.x, c.y, c.r*1.45, 0, Math.PI*2)
        mctx.fillStyle = shadow
        mctx.fill()

        const floor = mctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r)
        floor.addColorStop(0,   'rgba(26,26,28,0.78)')
        floor.addColorStop(0.7, 'rgba(19,19,21,0.54)')
        floor.addColorStop(1,   'rgba(28,28,30,0)')
        mctx.beginPath()
        mctx.arc(c.x, c.y, c.r, 0, Math.PI*2)
        mctx.fillStyle = floor
        mctx.fill()

        mctx.beginPath()
        mctx.arc(c.x+c.r*0.2, c.y-c.r*0.2, c.r*0.92, 0, Math.PI*2)
        mctx.strokeStyle = 'rgba(70,66,60,0.28)'
        mctx.lineWidth = 0.9
        mctx.stroke()
      })

      for (let i=0; i<1400; i++) {
        const nx=Math.random()*1024, ny=Math.random()*512, nb=Math.random()*0.04
        mctx.fillStyle=`rgba(216,210,196,${nb})`
        mctx.fillRect(nx, ny, 1, 1)
      }

      const moonTex = new THREE.CanvasTexture(moonCanvas)
      moonTex.colorSpace = THREE.SRGBColorSpace

      const normalCanvas = document.createElement('canvas')
      normalCanvas.width=1024; normalCanvas.height=512
      const nctx = normalCanvas.getContext('2d')!
      nctx.fillStyle='rgb(128,128,255)'
      nctx.fillRect(0,0,1024,512)
      craters.forEach(c => {
        const g = nctx.createRadialGradient(c.x,c.y,0,c.x,c.y,c.r)
        g.addColorStop(0,   'rgb(128,98,220)')
        g.addColorStop(0.5, 'rgb(102,120,230)')
        g.addColorStop(1,   'rgb(128,128,255)')
        nctx.beginPath()
        nctx.arc(c.x,c.y,c.r,0,Math.PI*2)
        nctx.fillStyle = g
        nctx.fill()
      })
      const moonNormal = new THREE.CanvasTexture(normalCanvas)

      const moonMat = new THREE.MeshStandardMaterial({
        map: moonTex,
        normalMap: moonNormal,
        normalScale: new THREE.Vector2(0.52,0.52),
        roughness: 0.98,
        metalness: 0.0,
        transparent: true,
        opacity: 1.0,
      })
      const moon = new THREE.Mesh(new THREE.SphereGeometry(0.057,64,64), moonMat)

      const moonPivot = new THREE.Object3D()
      moonPivot.rotation.z = 5.1*(Math.PI/180)
      moonPivot.rotation.x = 0.08
      moon.position.set(1.60,0,0)
      moonPivot.add(moon)
      scene.add(moonPivot)

      const moonLight = new THREE.PointLight(new THREE.Color('#e4dcc8'), 0.24, 8)
      scene.add(moonLight)

      const atmMat = new THREE.ShaderMaterial({
        uniforms: {
          glowColor: { value: new THREE.Color('#C9A84C') },
          viewVector: { value: camera.position },
          opacity: { value: 1.0 },
        },
        vertexShader: `
          uniform vec3 viewVector;
          varying float intensity;
          void main(){
            vec3 vN=normalize(normalMatrix*normal);
            vec3 vV=normalize(normalMatrix*viewVector);
            float d=abs(dot(vN,vV));
            intensity=pow(1.0-clamp(d,0.0,1.0),2.1);
            gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
          }`,
        fragmentShader: `
          uniform vec3 glowColor;
          uniform float opacity;
          varying float intensity;
          void main(){
            gl_FragColor=vec4(glowColor*intensity*0.42,intensity*0.38*opacity);
          }`,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      })
      scene.add(new THREE.Mesh(new THREE.SphereGeometry(RADIUS+0.22,48,48),atmMat))

      const haloMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#C9A84C'), transparent: true, opacity: 0.032, side: THREE.BackSide })
      scene.add(new THREE.Mesh(new THREE.SphereGeometry(RADIUS+0.04,32,32),haloMat))

      const ringMat = new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.12 })
      const ring = new THREE.Mesh(new THREE.TorusGeometry(RADIUS+0.044,0.0013,8,120), ringMat)
      ring.rotation.x = Math.PI*0.22
      scene.add(ring)

      const N=200
      const pPos = new Float32Array(N*3)
      for (let i=0; i<N; i++) {
        const r=1.06+Math.random()*0.82, phi=Math.random()*Math.PI*2, th=Math.random()*Math.PI
        pPos[i*3]=r*Math.sin(th)*Math.cos(phi)
        pPos[i*3+1]=r*Math.cos(th)
        pPos[i*3+2]=r*Math.sin(th)*Math.sin(phi)
      }
      const pGeo = new THREE.BufferGeometry()
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos,3))
      const pMat = new THREE.PointsMaterial({ color: GOLD, size: 0.0075, transparent: true, opacity: 0.16 })
      const particles = new THREE.Points(pGeo,pMat)
      scene.add(particles)

      ;[
        {lat:48,lon:2,h:0.04,bull:true},
        {lat:40,lon:-74,h:0.035,bull:false},
        {lat:35,lon:105,h:0.05,bull:true},
        {lat:-23,lon:-43,h:0.035,bull:true},
        {lat:55,lon:37,h:0.035,bull:false},
      ].forEach(p => {
        const base = toV(p.lat,p.lon)
        const dir = base.clone().normalize()
        const top = base.clone().add(dir.clone().multiplyScalar(p.h))
        globe.add(new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([base,top]),
          new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: p.bull ? 0.65 : 0.24 })
        ))
      })

      scene.add(new THREE.AmbientLight(0xffffff,0.12))
      const key = new THREE.DirectionalLight(new THREE.Color('#f0dc86'),1.7)
      key.position.set(5,4,5)
      scene.add(key)
      const rimL = new THREE.PointLight(new THREE.Color('#C9A84C'),0.5,12)
      rimL.position.set(-4,1,-5)
      scene.add(rimL)
      const coldFill = new THREE.PointLight(new THREE.Color('#54E8FF'),0.14,10)
      coldFill.position.set(0,1.5,4)
      scene.add(coldFill)

      const start = Date.now()
      let raf = 0

      const tick = () => {
        raf = requestAnimationFrame(tick)
        const elapsed = Date.now() - start
        const t = Math.min(elapsed / DURATION, 1)
        const time = elapsed * 0.001
        setProgress(t)

       const ROT_OFFSET = -0.82
     globe.rotation.y          = ROT_OFFSET + elapsed * 0.00022
     ring.rotation.y           = ROT_OFFSET + elapsed * 0.00022
     streamContainer.rotation.y = ROT_OFFSET + elapsed * 0.00022

      moonPivot.rotation.y = time * 0.2
      moon.rotation.y = time * 0.2
      const mAngle = time * 0.2
      const mInc   = 5.1 * (Math.PI/180)
      moonLight.position.set(
        Math.cos(mAngle) * 1.60,
        Math.sin(mInc) * 1.60,
        Math.sin(mAngle) * 1.60
      )

      cityRings.forEach(({ outer, outerMat, phase }) => {
        const p = (time * 1.18 + phase) % (Math.PI * 2)
        const s = 0.5 + 0.5 * Math.sin(p)
        outerMat.opacity = s * 0.42
        outer.scale.setScalar(1 + s * 0.98)
      })

      streamData.forEach(stream => {
        stream.progress = (stream.progress + stream.speed) % 1.3
        const p = stream.progress
        const tail = Math.max(0, p - 0.22)
        const head = Math.min(1, p)
        if (head > tail) {
          const segPts = stream.points.slice(
            Math.floor(tail * stream.points.length),
            Math.ceil(head * stream.points.length) + 1
          )
          if (segPts.length > 1) {
            if (!stream.line) {
              stream.mat.opacity = 0.62
              stream.line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(segPts), stream.mat)
              streamContainer.add(stream.line)
            } else {
              stream.line.geometry.setFromPoints(segPts)
            }
          }
        }
      })

      if (elapsed > 600) {
        const lt = Math.min((elapsed - 600) / 1950, 1)
        const ease = 1 - Math.pow(1 - lt, 3)
        setLogoOpacity(ease)
        setLogoScale(0.26 + ease * 0.74)
        setLogoBlur((1 - ease) * 8)
      }
      if (elapsed > 2350) setTextOpacity(Math.min((elapsed - 2350) / 620, 1))
      if (elapsed > 2830) setSubTextOpacity(Math.min((elapsed - 2830) / 520, 1))

      // Phase 1 — Mond + Streams verschwinden zuerst (3.15s → 4.0s)
      if (elapsed > 3150) {
        const ft = Math.min((elapsed - 3150) / 850, 1)
        const e = ft * ft
        moonMat.opacity = 1 - e
        moonLight.intensity = 0.24 * (1 - e)
        streamMats.forEach(m => { m.opacity = 0.62 * (1 - e) })
        cityRings.forEach(({ outerMat, innerMat }) => {
          outerMat.opacity *= (1 - e * 0.08)
          innerMat.opacity = 0.80 * (1 - e)
        })
      }

      // Phase 2 — Globus + alles andere (3.85s → 5.1s)
      if (elapsed > 3850) {
        const ft = Math.min((elapsed - 3850) / 1250, 1)
        const e = ft * ft
        globeMat.opacity = 1 - e
        atmMat.uniforms.opacity.value = 1 - e
        haloMat.opacity = 0.032 * (1 - e)
        pMat.opacity = 0.16 * (1 - e)
        ringMat.opacity = 0.12 * (1 - e)
        crackMats.forEach(m => { m.opacity *= (1 - e * 0.08) })
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
 })          
  return () => { disposeRef.current?.() }
}, [complete])

  return (
  <AnimatePresence mode="wait">
    {visible && (
      <motion.div
        key="intro-desktop"
        className="fixed inset-0 z-[300]"
        style={{ background: '#030204' }}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(201,168,76,0.014), transparent 48%), linear-gradient(rgba(201,168,76,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.01) 1px, transparent 1px)`,
            backgroundSize: '100% 100%, 82px 82px, 82px 82px',
          }}
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/18" />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-6">
            <div className="relative flex items-center justify-center">
              <div
                className="absolute rounded-full blur-2xl"
                style={{
                  width: 220,
                  height: 220,
                  background: 'radial-gradient(circle, rgba(201,168,76,0.16) 0%, rgba(201,168,76,0.04) 32%, transparent 70%)',
                  opacity: logoOpacity,
                }}
              />
              <img
                src={csLogo}
                alt="CandleScope"
                style={{
                  width: 98,
                  height: 98,
                  objectFit: 'contain',
                  position: 'relative',
                  opacity: logoOpacity,
                  transform: `scale(${logoScale})`,
                  filter: `blur(${logoBlur}px) drop-shadow(0 0 18px rgba(201,168,76,0.1))`,
                }}
              />
            </div>

            <div style={{ opacity: textOpacity, transform: `translateY(${(1 - textOpacity) * 10}px)`, textAlign: 'center' }}>
              <p className="font-display text-3xl tracking-[0.24em] uppercase text-[#F5F0E8]">
                Candle<span className="text-[#C9A84C]">Scope</span>
              </p>
              <p className="font-mono text-[10px] tracking-[0.38em] uppercase text-[#756e66] mt-2" style={{ opacity: subTextOpacity }}>
                Finance · WebDev · Trading
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="w-32 h-px rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${progress * 100}%`, background: 'linear-gradient(90deg, rgba(201,168,76,0.2), #C9A84C, rgba(84,232,255,0.3))' }}
            />
          </div>
        </div>

        <motion.button
          onClick={skip}
          className="absolute bottom-9 right-10 font-mono text-[10px] tracking-[0.22em] uppercase text-[#403a35] hover:text-[#C9A84C] transition-colors duration-300 cursor-pointer"
          style={{ WebkitAppearance: 'none', appearance: 'none', background: 'none', border: 'none' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          Skip ›
        </motion.button>

        {['top-5 left-5 border-t border-l','top-5 right-5 border-t border-r','bottom-5 left-5 border-b border-l','bottom-5 right-5 border-b border-r'].map((cls, i) => (
          <motion.div
            key={i}
            className={`absolute w-5 h-5 border-[#C9A84C]/18 pointer-events-none ${cls}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          />
        ))}
      </motion.div>
    )}
  </AnimatePresence>
)
}

export default function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const isMobile = window.innerWidth < 768
  const [done, setDone] = useState(false)
  const handleDone = useCallback(() => {
    setDone(true)
    onComplete()
  }, [onComplete])
  if (done) return null
  return isMobile ? <MobileIntro onDone={handleDone} /> : <DesktopIntro onDone={handleDone} />
}