/* ============================================================
   CandleScope — Dynamic Page Renderer
   src/pages/DynamicPage.tsx
   ============================================================ */

import { useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { usePagesStore } from '../store/usePagesStore'
import type { HeroBlockProps } from '../types/page.types'
import PageHero from '../components/ui/PageHero'

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>()
  const { pages, loadPages } = usePagesStore()

  useEffect(() => { loadPages() }, [loadPages])

  const page = pages.find(p => p.slug === (slug ?? ''))

  if (!page) return <Navigate to="/404" replace />
  if (!page.published) return <Navigate to="/404" replace />

  return (
    <div className="min-h-screen">
      {page.blocks
        .slice()
        .sort((a, b) => a.order - b.order)
        .map(block => (
          <BlockRenderer key={block.id} block={block} />
        ))
      }
    </div>
  )
}

function BlockRenderer({ block }: { block: { id: string; type: string; props: unknown } }) {
  switch (block.type) {

    case 'hero': {
      const p = block.props as HeroBlockProps
      return (
        <PageHero
          eyebrow={p.eyebrow}
          titleLine1={p.titleLine1}
          titleLine2={p.titleLine2}
          titleAccent={p.titleAccent}
          description={p.description}
          badge={p.badge}
          theme={p.theme}
        >
          {p.ctas && p.ctas.length > 0 && (
            <>
              {p.ctas.map((cta, i) => (
                cta.variant === 'primary' ? (
                  <a key={i} href={cta.href}
                    className="relative overflow-hidden group text-[11px] tracking-[0.16em] uppercase border border-[#C9A84C]/35 text-[#C9A84C] px-7 py-3.5 rounded-full">
                    <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300">{cta.label}</span>
                    <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  </a>
                ) : (
                  <a key={i} href={cta.href}
                    className="text-[11px] tracking-[0.16em] uppercase text-[#5a5550] hover:text-[#F5F0E8] transition-colors duration-300 flex items-center gap-2 group">
                    {cta.label}
                    <span className="w-4 h-px bg-current transition-all duration-300 group-hover:w-6" />
                  </a>
                )
              ))}
            </>
          )}
        </PageHero>
      )
    }

    case 'text': {
      const p = block.props as { content: string; alignment?: string; maxWidth?: string }
      const maxW = { sm: 'max-w-lg', md: 'max-w-2xl', lg: 'max-w-4xl', full: 'max-w-none' }[p.maxWidth ?? 'md'] ?? 'max-w-2xl'
      const align = { left: 'text-left', center: 'text-center', right: 'text-right' }[p.alignment ?? 'left'] ?? 'text-left'
      return (
        <section className={`px-8 md:px-16 lg:px-24 py-16 ${align}`}>
          <div className={`${maxW} ${p.alignment === 'center' ? 'mx-auto' : ''}`}>
            <p className="text-[#9A9590] text-base leading-relaxed whitespace-pre-wrap">{p.content}</p>
          </div>
        </section>
      )
    }

    case 'stats': {
      const p = block.props as { items: Array<{ id: string; value: string; label: string }> }
      return (
        <section className="px-8 md:px-16 lg:px-24 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl">
            {p.items.map(item => (
              <div key={item.id} className="flex flex-col gap-2">
                <span className="font-display text-5xl text-[#C9A84C]">{item.value}</span>
                <span className="text-[11px] tracking-[0.12em] uppercase text-[#5a5550]">{item.label}</span>
              </div>
            ))}
          </div>
        </section>
      )
    }

    case 'cta-banner': {
      const p = block.props as { title: string; description?: string; buttonLabel: string; buttonHref: string }
      return (
        <section className="px-8 md:px-16 lg:px-24 py-20">
          <div className="border border-[#C9A84C]/20 rounded-2xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="font-display text-3xl text-[#F5F0E8] mb-2">{p.title}</h2>
              {p.description && <p className="text-[#5a5550] text-sm">{p.description}</p>}
            </div>
            <a href={p.buttonHref}
              className="relative overflow-hidden group text-[11px] tracking-[0.16em] uppercase border border-[#C9A84C]/35 text-[#C9A84C] px-8 py-4 rounded-full shrink-0">
              <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300">{p.buttonLabel}</span>
              <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </a>
          </div>
        </section>
      )
    }

    case 'divider': {
      const p = block.props as { style?: string; spacing?: string }
      const pad = { sm: 'py-4', md: 'py-8', lg: 'py-16' }[p.spacing ?? 'md'] ?? 'py-8'
      return (
        <div className={`px-8 md:px-16 lg:px-24 ${pad}`}>
          {p.style !== 'space' && (
            <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />
          )}
        </div>
      )
    }

    case 'image': {
      const p = block.props as { src: string; alt: string; caption?: string; rounded?: boolean }
      if (!p.src) return null
      return (
        <section className="px-8 md:px-16 lg:px-24 py-8">
          <figure>
            <img src={p.src} alt={p.alt} className={`w-full object-cover ${p.rounded ? 'rounded-2xl' : ''}`} />
            {p.caption && (
              <figcaption className="text-[11px] text-[#5a5550] mt-3 text-center tracking-[0.06em]">{p.caption}</figcaption>
            )}
          </figure>
        </section>
      )
    }

    case 'list': {
      const p = block.props as { title?: string; items: Array<{ id: string; text: string; subtext?: string }> }
      return (
        <section className="px-8 md:px-16 lg:px-24 py-12 max-w-3xl">
          {p.title && <h2 className="font-display text-2xl text-[#F5F0E8] mb-6">{p.title}</h2>}
          <ul className="flex flex-col gap-3">
            {p.items.map(item => (
              <li key={item.id} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] mt-2 shrink-0" />
                <div>
                  <p className="text-[#9A9590] text-sm">{item.text}</p>
                  {item.subtext && <p className="text-[#5a5550] text-xs mt-0.5">{item.subtext}</p>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )
    }

    case 'timeline': {
      const p = block.props as { title?: string; items: Array<{ id: string; date: string; title: string; description: string; status?: string }> }
      return (
        <section className="px-8 md:px-16 lg:px-24 py-16 max-w-3xl">
          {p.title && <h2 className="font-display text-2xl text-[#F5F0E8] mb-10">{p.title}</h2>}
          <div className="flex flex-col gap-8">
            {p.items.map(item => (
              <div key={item.id} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full mt-1 ${item.status === 'done' ? 'bg-[#00C896]' : item.status === 'active' ? 'bg-[#C9A84C]' : 'bg-[#3a3530]'}`} />
                  <div className="w-px flex-1 bg-[#C9A84C]/10 mt-2" />
                </div>
                <div className="pb-8">
                  <p className="font-mono text-[10px] text-[#5a5550] tracking-[0.1em] mb-1">{item.date}</p>
                  <h3 className="font-display text-lg text-[#F5F0E8] mb-1">{item.title}</h3>
                  <p className="text-[#5a5550] text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )
    }

    case 'card-grid': {
      const p = block.props as { cols: number; cards: Array<{ id: string; title: string; description: string; badge?: string }> }
      const cols = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' }[p.cols] ?? 'md:grid-cols-3'
      return (
        <section className="px-8 md:px-16 lg:px-24 py-16">
          <div className={`grid grid-cols-1 ${cols} gap-5`}>
            {p.cards.map(card => (
              <div key={card.id} className="border border-[#C9A84C]/10 rounded-2xl p-6 bg-[#0d0d0d]">
                {card.badge && (
                  <span className="font-mono text-[9px] tracking-[0.14em] text-[#C9A84C]/60 border border-[#C9A84C]/20 px-2 py-0.5 rounded-full mb-3 inline-block">
                    {card.badge}
                  </span>
                )}
                <h3 className="font-display text-lg text-[#F5F0E8] mb-2">{card.title}</h3>
                <p className="text-[#5a5550] text-sm leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </section>
      )
    }

    default:
      return null
  }
}