/* ============================================================
   CandleScope — Scroll Reveal Hook  (fixed: kein Framer-Konflikt)
   src/hooks/useScrollReveal.ts

   FIX: Elemente mit data-framer="true" werden übersprungen
        damit Framer Motion und dieser Hook nicht kollidieren.
   ============================================================ */

import { useEffect, useRef } from 'react'

interface ScrollRevealOptions {
  baseDelay?: number
  stagger?: number
  threshold?: number
  once?: boolean
}

export function useScrollReveal(options: ScrollRevealOptions = {}) {
  const { baseDelay = 0, stagger = 80, threshold = 0.12, once = true } = options

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const children = Array.from(el.children) as HTMLElement[]

    children.forEach((child, i) => {
      // Framer Motion Elemente überspringen
      if (child.hasAttribute('data-framer') || child.style.transform !== '') return

      child.style.opacity = '0'
      child.style.transform = 'translateY(24px)'
      child.style.transition = `opacity 0.6s ease, transform 0.6s ease`
      child.style.transitionDelay = `${baseDelay + i * stagger}ms`
      child.style.willChange = 'opacity, transform'
    })

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          children.forEach((child) => {
            if (child.hasAttribute('data-framer') || child.dataset.noReveal) return
            child.style.opacity = '1'
            child.style.transform = 'translateY(0)'
          })
          if (once) observer.unobserve(el)
        } else if (!once) {
          children.forEach((child) => {
            if (child.hasAttribute('data-framer') || child.dataset.noReveal) return
            child.style.opacity = '0'
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

    // Wenn Framer Motion das Element bereits steuert → nichts tun
    if (el.hasAttribute('data-framer-appear-id') || el.style.willChange === 'transform') return

    el.style.opacity = '0'
    el.style.transform = 'translateY(20px)'
    el.style.transition = `opacity 0.65s ease, transform 0.65s ease`
    el.style.transitionDelay = `${delay}ms`
    el.style.willChange = 'opacity, transform'

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
          if (once) observer.unobserve(el)
        } else if (!once) {
          el.style.opacity = '0'
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
