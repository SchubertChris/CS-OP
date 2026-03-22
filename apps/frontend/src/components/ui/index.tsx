/* ============================================================
   CandleScope — Shared UI Components
   src/components/ui/index.tsx

   Alle wiederverwendbaren UI-Bausteine an einem Ort.
   Import:
     import { SectionHeader, Card, GradientText, GoldDivider, Badge } from '../components/ui'
   ============================================================ */

import React from 'react'
import { useScrollReveal, useReveal } from '../../hooks/useScrollReveal'

/* ══════════════════════════════════════════════════════════════
   GRADIENT TEXT
   Gold-Verlauf auf beliebigem Text
   ============================================================ */
interface GradientTextProps {
  children: React.ReactNode
  className?: string
  /** 'gold' = #C9A84C → #E8C56D, 'subtle' = gedämpfter */
  variant?: 'gold' | 'subtle'
}

export function GradientText({ children, className = '', variant = 'gold' }: GradientTextProps) {
  const gradient = variant === 'gold'
    ? 'from-[#C9A84C] via-[#E8C56D] to-[#C9A84C]'
    : 'from-[#9A9590] via-[#C9A84C] to-[#9A9590]'

  return (
    <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════
   BADGE
   Kleines Label-Pill — für Status, Tags, Kategorien
   ============================================================ */
interface BadgeProps {
  children: React.ReactNode
  variant?: 'gold' | 'green' | 'red' | 'muted'
  className?: string
}

export function Badge({ children, variant = 'gold', className = '' }: BadgeProps) {
  const styles = {
    gold:  'border-[#C9A84C]/30 bg-[#C9A84C]/8  text-[#C9A84C]',
    green: 'border-[#00C896]/30 bg-[#00C896]/8  text-[#00C896]',
    red:   'border-[#FF4444]/30 bg-[#FF4444]/8  text-[#FF4444]',
    muted: 'border-[#ffffff]/8  bg-[#ffffff]/4  text-[#9A9590]',
  }

  return (
    <span className={`
      inline-flex items-center
      font-mono text-[10px] tracking-[0.14em] uppercase
      border rounded-full px-3 py-1
      ${styles[variant]}
      ${className}
    `}>
      {children}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════
   GOLD DIVIDER
   Elegante Trennlinie mit Gold-Akzent
   ============================================================ */
interface GoldDividerProps {
  /** 'full' = rand-zu-rand, 'short' = zentriert 80px */
  variant?: 'full' | 'short' | 'fade'
  className?: string
}

export function GoldDivider({ variant = 'fade', className = '' }: GoldDividerProps) {
  if (variant === 'short') {
    return (
      <div className={`flex items-center justify-center py-2 ${className}`}>
        <div className="w-20 h-px bg-[#C9A84C]/40" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]/60 mx-3" />
        <div className="w-20 h-px bg-[#C9A84C]/40" />
      </div>
    )
  }

  if (variant === 'full') {
    return (
      <div className={`h-px bg-[#C9A84C]/15 ${className}`} />
    )
  }

  // fade (default)
  return (
    <div className={`h-px bg-gradient-to-r from-transparent via-[#C9A84C]/30 to-transparent ${className}`} />
  )
}

/* ══════════════════════════════════════════════════════════════
   SECTION HEADER
   Eyebrow + Titel + optionale Beschreibung
   Mit Scroll-Reveal
   ============================================================ */
interface SectionHeaderProps {
  eyebrow?: string
  title: React.ReactNode
  description?: string
  align?: 'left' | 'center'
  className?: string
  /** Verzögerung in ms bevor Header reinkommt */
  delay?: number
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  className = '',
  delay = 0,
}: SectionHeaderProps) {
  const ref = useReveal({ delay })
  const centered = align === 'center'

  return (
    <div
      ref={ref}
      className={`${centered ? 'text-center mx-auto' : ''} max-w-2xl ${className}`}
    >
      {eyebrow && (
        <p className={`
          font-mono text-[11px] tracking-[0.22em] uppercase
          text-[#C9A84C]/70 mb-3
          flex items-center gap-3
          ${centered ? 'justify-center' : ''}
        `}>
          <span className="w-6 h-px bg-[#C9A84C]/40" />
          {eyebrow}
          <span className="w-6 h-px bg-[#C9A84C]/40" />
        </p>
      )}
      <h2 className={`
        font-display text-3xl md:text-4xl lg:text-5xl
        text-[#F5F0E8] tracking-tight leading-[1.1]
        mb-4
      `}>
        {title}
      </h2>
      {description && (
        <p className="text-[#9A9590] text-base md:text-lg leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   SECTION WRAPPER
   Konsistentes Padding + max-width für alle Sections
   ============================================================ */
interface SectionWrapperProps {
  children: React.ReactNode
  id?: string
  className?: string
  /** Staggered reveal für direkte Kinder */
  reveal?: boolean
  stagger?: number
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function SectionWrapper({
  children,
  id,
  className = '',
  reveal = true,
  stagger = 80,
  maxWidth = 'xl',
}: SectionWrapperProps) {
  const revealRef = useScrollReveal({ stagger })
  const maxWClasses = {
    sm:   'max-w-3xl',
    md:   'max-w-4xl',
    lg:   'max-w-5xl',
    xl:   'max-w-6xl',
    full: 'max-w-none',
  }

  return (
    <section
      id={id}
      className={`px-8 md:px-16 lg:px-24 py-20 md:py-28 ${className}`}
    >
      <div
        ref={reveal ? revealRef : undefined}
        className={`${maxWClasses[maxWidth]} mx-auto`}
      >
        {children}
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════
   CARD
   Universelle Karte — für Features, Produkte, Projekte
   ============================================================ */
interface CardProps {
  children: React.ReactNode
  className?: string
  /** 'default' = subtiler Border, 'elevated' = mehr Tiefe, 'gold' = Gold-Border */
  variant?: 'default' | 'elevated' | 'gold'
  /** Klickbar mit Hover-Effekt */
  href?: string
  onClick?: () => void
  padding?: 'sm' | 'md' | 'lg'
}

export function Card({
  children,
  className = '',
  variant = 'default',
  href,
  onClick,
  padding = 'md',
}: CardProps) {
  const padClasses = { sm: 'p-4', md: 'p-6', lg: 'p-8' }
  const variantClasses = {
    default:  'bg-[#0d0d0d] border border-[#ffffff]/6 hover:border-[#C9A84C]/20',
    elevated: 'bg-[#0d0d0d] border border-[#C9A84C]/10 hover:border-[#C9A84C]/30 shadow-xl shadow-black/40',
    gold:     'bg-[#0d0d0d] border border-[#C9A84C]/25 hover:border-[#C9A84C]/50 shadow-lg shadow-[#C9A84C]/5',
  }

  const classes = `
    rounded-2xl
    ${variantClasses[variant]}
    ${padClasses[padding]}
    transition-all duration-300
    ${href || onClick ? 'cursor-pointer group' : ''}
    ${className}
  `

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    )
  }

  if (onClick) {
    return (
      <div onClick={onClick} className={classes} role="button">
        {children}
      </div>
    )
  }

  return <div className={classes}>{children}</div>
}

/* ══════════════════════════════════════════════════════════════
   CARD ICON
   Icon-Box für Feature-Cards
   ============================================================ */
interface CardIconProps {
  children: React.ReactNode
  className?: string
}

export function CardIcon({ children, className = '' }: CardIconProps) {
  return (
    <div className={`
      w-11 h-11 rounded-xl
      bg-[#C9A84C]/8 border border-[#C9A84C]/20
      flex items-center justify-center
      text-[#C9A84C]
      mb-4
      ${className}
    `}>
      {children}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   STAT ITEM
   Für Zahlen/Stats Darstellung
   ============================================================ */
interface StatItemProps {
  value: string
  label: string
  suffix?: string
  className?: string
}

export function StatItem({ value, label, suffix, className = '' }: StatItemProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-end gap-1">
        <span className="font-display text-4xl md:text-5xl text-[#C9A84C] leading-none">
          {value}
        </span>
        {suffix && (
          <span className="font-display text-xl text-[#C9A84C]/60 mb-1">{suffix}</span>
        )}
      </div>
      <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#5a5550]">
        {label}
      </span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   CTA BUTTON
   Haupt-Button mit Gold Fill-Animation
   ============================================================ */
interface CtaButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'ghost'
  className?: string
  external?: boolean
}

export function CtaButton({
  children,
  href,
  onClick,
  variant = 'primary',
  className = '',
  external = false,
}: CtaButtonProps) {
  const baseClasses = `
    relative overflow-hidden group
    inline-flex items-center gap-2
    text-[11px] tracking-[0.16em] uppercase
    rounded-full transition-all duration-300
    ${variant === 'primary'
      ? 'border border-[#C9A84C]/40 text-[#C9A84C] px-7 py-3.5'
      : 'text-[#9A9590] hover:text-[#F5F0E8] px-2 py-1'
    }
    ${className}
  `

  const inner = variant === 'primary' ? (
    <>
      <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300">
        {children}
      </span>
      <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
    </>
  ) : (
    <>
      {children}
      <span className="w-4 h-px bg-current transition-all duration-300 group-hover:w-6" />
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        className={baseClasses}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {inner}
      </a>
    )
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      {inner}
    </button>
  )
}

/* ══════════════════════════════════════════════════════════════
   TAG LIST
   Reihe von kleinen Tags / Skills
   ============================================================ */
interface TagListProps {
  tags: string[]
  className?: string
}

export function TagList({ tags, className = '' }: TagListProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map(tag => (
        <span
          key={tag}
          className="font-mono text-[11px] tracking-[0.08em] text-[#9A9590] bg-[#ffffff]/4 border border-[#ffffff]/8 px-3 py-1.5 rounded-lg"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   HIGHLIGHT LINE
   Goldene Akzent-Linie links — für Quotes, Highlights
   ============================================================ */
interface HighlightLineProps {
  children: React.ReactNode
  className?: string
}

export function HighlightLine({ children, className = '' }: HighlightLineProps) {
  return (
    <div className={`border-l-2 border-[#C9A84C]/50 pl-5 ${className}`}>
      <p className="text-[#9A9590] text-base leading-relaxed italic">
        {children}
      </p>
    </div>
  )
}