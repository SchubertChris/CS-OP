/* ============================================================
   CandleScope — Starfield
   src/components/home/Starfield.tsx

   Feine, ferne Mini-Sterne (Universum-Tiefe) auf einer fixen
   Viewport-Canvas hinter dem Inhalt.

   Performance: DPR-Cap 1.5, ~110 Sterne (40 mobil), ~30 fps
   (Throttle), gebündelte Draw-Calls (2 fillStyle/Frame +
   globalAlpha statt rgba-String pro Stern), Pause bei
   document.hidden, reduced-motion → einmal statisch.
   Theme-fähig (im Light-Mode dunkle „Tinten-Sterne").
   ============================================================ */

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

interface Star { x: number; y: number; r: number; a: number; tw: number; sp: number; vx: number; vy: number; gold: boolean }

export default function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const getTheme = () => (document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark')
    let theme = getTheme()
    let w = 0, h = 0
    let stars: Star[] = []
    let raf = 0
    let running = true
    let last = 0
    let mtx = 0, mty = 0  // Maus-Ziel (normiert -1..1)
    let mx = 0, my = 0    // geglättet (Parallax)

    const build = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const mobile = w < 768
      const count = mobile ? 40 : Math.min(110, Math.floor((w * h) / 17000))
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.1 + 0.35,
        a: Math.random() * 0.5 + 0.12,
        tw: Math.random() * Math.PI * 2,
        sp: Math.random() * 0.7 + 0.2,
        vx: (Math.random() - 0.5) * 0.03,
        vy: (Math.random() - 0.5) * 0.03,
        gold: Math.random() < 0.22,
      }))
    }

    const colorFor = (gold: boolean) =>
      theme === 'light'
        ? (gold ? '#6b5214' : '#14100a')   // Light-Mode: dunkle „Tinten-Sterne" (invertiert)
        : (gold ? '#C9A84C' : '#E8E1D0')

    const PARALLAX = 16
    const render = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      // Maus-Parallax sanft nachziehen (Tiefe: größere/nähere Sterne wandern mehr)
      mx += (mtx - mx) * 0.08
      my += (mty - my) * 0.08
      // im Light-Mode etwas kräftiger, damit die dunklen Sterne auf Beige sichtbar sind
      const boost = theme === 'light' ? 1.5 : 1
      // zwei Pässe → nur 2 fillStyle-Wechsel pro Frame
      for (let pass = 0; pass < 2; pass++) {
        const gold = pass === 1
        ctx.fillStyle = colorFor(gold)
        for (const s of stars) {
          if (s.gold !== gold) continue
          const fl = (reduced ? s.a : s.a + Math.sin(t * 0.001 * s.sp + s.tw) * 0.14) * boost
          ctx.globalAlpha = fl < 0 ? 0 : fl > 1 ? 1 : fl
          ctx.beginPath()
          ctx.arc(s.x - mx * s.r * PARALLAX, s.y - my * s.r * PARALLAX, s.r, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
      if (!reduced) {
        for (const s of stars) {
          s.x += s.vx; s.y += s.vy
          if (s.x < 0) s.x += w; else if (s.x > w) s.x -= w
          if (s.y < 0) s.y += h; else if (s.y > h) s.y -= h
        }
      }
    }

    const loop = (t: number) => {
      if (!running) return
      if (t - last >= 33) { render(t); last = t }  // ~30 fps reichen fürs Funkeln
      raf = requestAnimationFrame(loop)
    }

    const onResize = () => { build(); if (reduced) render(0) }
    const onVisibility = () => {
      if (document.hidden) { running = false; cancelAnimationFrame(raf) }
      else if (!reduced) { running = true; last = 0; raf = requestAnimationFrame(loop) }
    }

    build()
    if (reduced) render(0)
    else raf = requestAnimationFrame(loop)
    const onMouse = (e: MouseEvent) => {
      mtx = (e.clientX / w - 0.5) * 2
      mty = (e.clientY / h - 0.5) * 2
    }
    window.addEventListener('resize', onResize, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('mousemove', onMouse, { passive: true })

    // Theme-Wechsel live mitziehen (data-theme auf <html>)
    const obs = new MutationObserver(() => { theme = getTheme(); if (reduced) render(0) })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('mousemove', onMouse)
      obs.disconnect()
    }
  }, [reduced])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }}
    />
  )
}
