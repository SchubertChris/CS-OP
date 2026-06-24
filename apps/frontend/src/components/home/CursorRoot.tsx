/* ============================================================
   CandleScope — Custom Cursor
   src/components/home/CursorRoot.tsx

   Punkt (exakt) + nachziehender Ring (lerp). Morpht:
   - default → kleiner Ring
   - Links/Buttons/[data-cursor] → größerer Ring
   - [data-cursor="case"] → großer Ring + „Ansehen"-Label
   Nur Desktop (pointer: fine). Per Portal an document.body →
   liegt über allem (auch über der Nav). Versteckt den nativen
   Cursor nur solange diese Komponente lebt (.cs-cursor-on).
   Position via direkte DOM-Writes → keine React-Re-Renders.
   ============================================================ */

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type Mode = 'default' | 'link' | 'case'

export default function CursorRoot() {
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<Mode>('default')
  const [on, setOn] = useState(false)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    setOn(true)
    document.body.classList.add('cs-cursor-on')

    let raf = 0
    const tgt = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const ring = { x: tgt.x, y: tgt.y }
    let curMode: Mode = 'default'

    const onMove = (e: MouseEvent) => {
      tgt.x = e.clientX
      tgt.y = e.clientY
      const dot = dotRef.current
      if (dot) dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`
      const el = e.target as HTMLElement | null
      const hit = el?.closest?.('[data-cursor], a, button, [role="button"]') as HTMLElement | null
      const m: Mode = hit ? (hit.dataset?.cursor === 'case' ? 'case' : 'link') : 'default'
      if (m !== curMode) { curMode = m; setMode(m) }
    }
    const loop = () => {
      ring.x += (tgt.x - ring.x) * 0.18
      ring.y += (tgt.y - ring.y) * 0.18
      const r = ringRef.current
      if (r) r.style.transform = `translate(${ring.x}px, ${ring.y}px) translate(-50%, -50%)`
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    raf = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
      document.body.classList.remove('cs-cursor-on')
    }
  }, [])

  if (!on) return null

  return createPortal(
    <>
      <div ref={dotRef} className="cs-cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className={`cs-cursor-ring cs-cursor-${mode}`} aria-hidden="true">
        {mode === 'case' && <span className="cs-cursor-label">Ansehen</span>}
      </div>
    </>,
    document.body,
  )
}
