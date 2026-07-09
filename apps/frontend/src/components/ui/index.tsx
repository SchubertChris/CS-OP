/* ============================================================
   CandleScope — Shared UI Components
   src/components/ui/index.tsx

   Alle wiederverwendbaren UI-Bausteine an einem Ort.
   Theme-aware über --cs-* Tokens (Gold/Status/on-gold), Glass-
   Panels + premium Hover — angehoben aufs Home-Niveau.
   Import:
     import { SectionHeader, Card, GradientText, GoldDivider, Badge } from '../components/ui'
   ============================================================ */

import React from 'react'
import { Link } from 'react-router-dom'
import { useScrollReveal, useReveal } from '../../hooks/useScrollReveal'

/* ══════════════════════════════════════════════════════════════
   GRADIENT TEXT — Gold-Verlauf (theme-aware)
   ============================================================ */
interface GradientTextProps {
  children: React.ReactNode
  className?: string
  variant?: 'gold' | 'subtle'
}

export function GradientText({ children, className = '', variant = 'gold' }: GradientTextProps) {
  const gradient = variant === 'gold'
    ? 'from-[var(--cs-gold)] via-[var(--cs-gold-hi)] to-[var(--cs-gold)]'
    : 'from-[var(--cs-text-2)] via-[var(--cs-gold)] to-[var(--cs-text-2)]'

  return (
    <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════
   BADGE — Label-Pill (theme-aware, leichtes Glas)
   ============================================================ */
interface BadgeProps {
  children: React.ReactNode
  variant?: 'gold' | 'green' | 'red' | 'muted'
  className?: string
}

export function Badge({ children, variant = 'gold', className = '' }: BadgeProps) {
  const styles = {
    gold:  'border-[var(--cs-gold)]/30 bg-[var(--cs-gold)]/10 text-[var(--cs-gold)]',
    green: 'border-[var(--cs-success)]/30 bg-[var(--cs-success)]/10 text-[var(--cs-success)]',
    red:   'border-[var(--cs-danger)]/30 bg-[var(--cs-danger)]/10 text-[var(--cs-danger)]',
    muted: 'border-[var(--cs-border-w2)] bg-[var(--cs-s3)]/60 text-[var(--cs-text-2)]',
  }

  return (
    <span className={`
      inline-flex items-center
      font-mono text-[10px] tracking-[0.14em] uppercase
      border rounded-full px-3 py-1 backdrop-blur-sm
      ${styles[variant]}
      ${className}
    `}>
      {children}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════
   GOLD DIVIDER
   ============================================================ */
interface GoldDividerProps {
  variant?: 'full' | 'short' | 'fade'
  className?: string
}

export function GoldDivider({ variant = 'fade', className = '' }: GoldDividerProps) {
  if (variant === 'short') {
    return (
      <div className={`flex items-center justify-center py-2 ${className}`}>
        <div className="w-20 h-px bg-[var(--cs-gold)]/40" />
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--cs-gold)]/60 mx-3" />
        <div className="w-20 h-px bg-[var(--cs-gold)]/40" />
      </div>
    )
  }

  if (variant === 'full') {
    return <div className={`h-px bg-[var(--cs-gold)]/15 ${className}`} />
  }

  // fade (default)
  return (
    <div className={`h-px bg-gradient-to-r from-transparent via-[var(--cs-gold)]/30 to-transparent ${className}`} />
  )
}

/* ══════════════════════════════════════════════════════════════
   SECTION HEADER — Eyebrow + Titel (fluide Type-Scale) + Beschreibung
   ============================================================ */
interface SectionHeaderProps {
  eyebrow?: string
  title: React.ReactNode
  description?: string
  align?: 'left' | 'center'
  className?: string
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
          text-[var(--cs-gold)] mb-4
          flex items-center gap-3
          ${centered ? 'justify-center' : ''}
        `}>
          <span className="w-6 h-px bg-[var(--cs-gold)]/45" />
          {eyebrow}
          <span className="w-6 h-px bg-[var(--cs-gold)]/45" />
        </p>
      )}
      <h2 className="font-display font-medium text-display text-[var(--cs-text)] tracking-[-0.02em] leading-[1.08] mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-[var(--cs-text-2)] text-base md:text-lg leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   SECTION WRAPPER — konsistentes Padding + max-width
   ============================================================ */
interface SectionWrapperProps {
  children: React.ReactNode
  id?: string
  className?: string
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
   CARD — Glass-Panel mit Gold-Glow-Hover (theme-aware)
   ============================================================ */
interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'gold'
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
    default:  'bg-[var(--cs-s1)]/70 border border-[var(--cs-border-w2)] hover:border-[var(--cs-gold)]/25 hover:shadow-[0_0_44px_-10px_rgba(201,168,76,0.18)]',
    elevated: 'bg-[var(--cs-s1)]/80 border border-[var(--cs-gold)]/12 shadow-xl shadow-black/25 hover:border-[var(--cs-gold)]/35 hover:shadow-[0_0_54px_-10px_rgba(201,168,76,0.22)]',
    gold:     'bg-[var(--cs-s1)]/80 border border-[var(--cs-gold)]/28 shadow-lg shadow-black/20 hover:border-[var(--cs-gold)]/55 hover:shadow-[0_0_54px_-8px_rgba(201,168,76,0.28)]',
  }
  const clickable = href || onClick

  const classes = `
    rounded-2xl backdrop-blur-md
    ${variantClasses[variant]}
    ${padClasses[padding]}
    transition-[color,border-color,box-shadow,transform] duration-300
    ${clickable ? 'cursor-pointer group hover:-translate-y-0.5' : ''}
    ${className}
  `

  if (href) {
    return <a href={href} className={classes}>{children}</a>
  }
  if (onClick) {
    return <div onClick={onClick} className={classes} role="button">{children}</div>
  }
  return <div className={classes}>{children}</div>
}

/* ══════════════════════════════════════════════════════════════
   CARD ICON — Icon-Box für Feature-Cards
   ============================================================ */
interface CardIconProps {
  children: React.ReactNode
  className?: string
}

export function CardIcon({ children, className = '' }: CardIconProps) {
  return (
    <div className={`
      w-11 h-11 rounded-xl
      bg-[var(--cs-gold)]/10 border border-[var(--cs-gold)]/22
      flex items-center justify-center
      text-[var(--cs-gold)]
      transition-transform duration-300 group-hover:scale-105
      mb-4
      ${className}
    `}>
      {children}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   STAT ITEM — Zahl + Label
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
        <span className="font-display font-semibold text-display text-[var(--cs-gold)] leading-none">
          {value}
        </span>
        {suffix && (
          <span className="font-display text-xl text-[var(--cs-gold)]/60 mb-1">{suffix}</span>
        )}
      </div>
      <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--cs-text-3)]">
        {label}
      </span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   CTA BUTTON — Gold-Fill-Animation (theme-aware, korrekter Kontrast)
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
    font-mono text-[11px] tracking-[0.16em] uppercase
    rounded-full transition-colors duration-300
    ${variant === 'primary'
      ? 'border border-[var(--cs-gold)]/45 text-[var(--cs-gold)] px-7 py-3.5'
      : 'text-[var(--cs-text-2)] hover:text-[var(--cs-text)] px-2 py-1'
    }
    ${className}
  `

  const inner = variant === 'primary' ? (
    <>
      <span className="relative z-10 group-hover:text-[var(--cs-on-gold)] transition-colors duration-300">
        {children}
      </span>
      <span className="absolute inset-0 bg-[var(--cs-gold)] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
    </>
  ) : (
    <>
      {children}
      <span className="w-4 h-px bg-current transition-transform duration-300 group-hover:scale-x-[1.5] origin-left" />
    </>
  )

  if (href) {
    const isExternal = external || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')
    
    if (isExternal) {
      return (
        <a
          href={href}
          className={baseClasses}
          target="_blank"
          rel="noopener noreferrer"
        >
          {inner}
        </a>
      )
    }

    return (
      <Link
        to={href}
        className={baseClasses}
      >
        {inner}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      {inner}
    </button>
  )
}

/* ══════════════════════════════════════════════════════════════
   TAG LIST — Skills / kleine Tags
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
          className="font-mono text-[11px] tracking-[0.08em] text-[var(--cs-text-2)] bg-[var(--cs-s3)]/50 border border-[var(--cs-border-w2)] px-3 py-1.5 rounded-lg transition-colors duration-200 hover:border-[var(--cs-gold)]/30 hover:text-[var(--cs-gold)]"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   HIGHLIGHT LINE — goldene Akzent-Linie links (Quotes)
   ============================================================ */
interface HighlightLineProps {
  children: React.ReactNode
  className?: string
}

export function HighlightLine({ children, className = '' }: HighlightLineProps) {
  return (
    <div className={`border-l-2 border-[var(--cs-gold)]/50 pl-5 ${className}`}>
      <p className="text-[var(--cs-text-2)] text-base leading-relaxed italic">
        {children}
      </p>
    </div>
  )
}
