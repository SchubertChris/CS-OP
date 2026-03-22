/* ============================================================
   CandleScope — Scroll Reveal Hook
   src/hooks/useScrollReveal.ts

   Staggered Reveal für Sections und ihre Kinder.
   Nutzung:
     const ref = useScrollReveal()
     <div ref={ref} data-reveal> → Eltern
       <div>Kind 1</div>          → kommt als erstes rein
       <div>Kind 2</div>          → 80ms später
       <div>Kind 3</div>          → 160ms später
     </div>

   Optionen via data-Attribute:
     data-reveal-delay="200"   → zusätzliche Basis-Verzögerung (ms)
     data-reveal-once          → nur einmal animieren (default)
   ============================================================ */

import { useEffect, useRef } from 'react'

interface ScrollRevealOptions {
  /** Verzögerung vor dem ersten Kind in ms */
  baseDelay?: number
  /** Verzögerung zwischen Kindern in ms */
  stagger?: number
  /** Schwellenwert — wie viel sichtbar sein muss (0-1) */
  threshold?: number
  /** Nur einmal animieren */
  once?: boolean
}

export function useScrollReveal(options: ScrollRevealOptions = {}) {
  const {
    baseDelay = 0,
    stagger   = 80,
    threshold = 0.12,
    once      = true,
  } = options

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    /* Direkte Kinder die animiert werden */
    const children = Array.from(el.children) as HTMLElement[]

    /* Initial verstecken */
    children.forEach((child, i) => {
      child.style.opacity    = '0'
      child.style.transform  = 'translateY(24px)'
      child.style.transition = `opacity 0.6s ease, transform 0.6s ease`
      child.style.transitionDelay = `${baseDelay + i * stagger}ms`
    })

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          children.forEach(child => {
            child.style.opacity   = '1'
            child.style.transform = 'translateY(0)'
          })
          if (once) observer.unobserve(el)
        } else if (!once) {
          children.forEach(child => {
            child.style.opacity   = '0'
            child.style.transform = 'translateY(24px)'
          })
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [baseDelay, stagger, threshold, once])

  return ref
}

/* ─── Einzelnes Element reveal ─────────────────────────────── */
export function useReveal(options: Omit<ScrollRevealOptions, 'stagger'> & { delay?: number } = {}) {
  const { delay = 0, threshold = 0.12, once = true } = options
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    el.style.opacity    = '0'
    el.style.transform  = 'translateY(20px)'
    el.style.transition = `opacity 0.65s ease, transform 0.65s ease`
    el.style.transitionDelay = `${delay}ms`

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity   = '1'
          el.style.transform = 'translateY(0)'
          if (once) observer.unobserve(el)
        } else if (!once) {
          el.style.opacity   = '0'
          el.style.transform = 'translateY(20px)'
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay, threshold, once])

  return ref
}