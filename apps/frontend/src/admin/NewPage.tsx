/* ============================================================
   CandleScope — New Page Creator
   src/admin/NewPage.tsx
   ============================================================ */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, FileText, Check } from 'lucide-react'
import { usePagesStore } from '../store/usePagesStore'
import { motion } from 'framer-motion'

const ICON_OPTIONS = [
  { value: 'FileText',     label: 'Dokument'   },
  { value: 'TrendingUp',   label: 'Finance'    },
  { value: 'Code2',        label: 'Code'       },
  { value: 'User',         label: 'Person'     },
  { value: 'MessageSquare',label: 'Chat'       },
  { value: 'ShoppingBag',  label: 'Shop'       },
  { value: 'BookOpen',     label: 'Blog'       },
  { value: 'Globe',        label: 'Web'        },
  { value: 'Layers',       label: 'Layers'     },
  { value: 'Star',         label: 'Featured'   },
  { value: 'Zap',          label: 'Action'     },
  { value: 'Mail',         label: 'Kontakt'    },
]

export default function NewPage() {
  const navigate = useNavigate()
  const { createPage, pages } = usePagesStore()

  const [title,    setTitle]    = useState('')
  const [slug,     setSlug]     = useState('')
  const [icon,     setIcon]     = useState('FileText')
  const [showInNav,setShowInNav] = useState(false)
  const [error,    setError]    = useState('')

  /* Auto-Slug aus Titel */
  const handleTitleChange = (val: string) => {
    setTitle(val)
    setSlug(val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
  }

  const handleCreate = () => {
    setError('')

    if (!title.trim()) { setError('Titel ist erforderlich'); return }
    if (!slug.trim())  { setError('Slug ist erforderlich'); return }

    /* Slug-Duplikat prüfen */
    if (pages.some(p => p.slug === slug)) {
      setError(`Slug "/${slug}" ist bereits vergeben`)
      return
    }

    const page = createPage({
      title:     title.trim(),
      slug:      slug.trim(),
      navIcon:   icon,
      navLabel:  title.trim(),
      showInNav: showInNav,
    })

    navigate(`/admin/pages/${page.id}`)
  }

  return (
    <div className="p-6 md:p-10 max-w-xl">

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link
          to="/admin/pages"
          className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] text-[#3a3530] hover:text-[#C9A84C] transition-colors mb-6"
        >
          <ArrowLeft size={11} strokeWidth={1.5} />
          PAGES
        </Link>

        <p className="font-mono text-[10px] tracking-[0.2em] text-[#3a3530] uppercase mb-3">
          ── NEUE SEITE
        </p>
        <h1 className="font-display text-3xl text-[#F5F0E8] tracking-tight mb-8">
          Seite erstellen
        </h1>

        <div className="flex flex-col gap-5">

          {/* Titel */}
          <div>
            <label className="font-mono text-[9px] tracking-[0.16em] text-[#3a3530] uppercase block mb-1.5">
              TITEL
            </label>
            <input
              type="text"
              placeholder="z.B. Blog, Shop, Über mich..."
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              autoFocus
              className="w-full bg-[#080808] border border-[#ffffff]/6 rounded-xl px-4 py-3 text-sm text-[#F5F0E8] placeholder:text-[#2a2a2a] font-mono focus:outline-none focus:border-[#C9A84C]/30 transition-colors"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="font-mono text-[9px] tracking-[0.16em] text-[#3a3530] uppercase block mb-1.5">
              URL-SLUG
            </label>
            <div className="flex items-center gap-1.5 bg-[#080808] border border-[#ffffff]/6 rounded-xl px-4 py-3 focus-within:border-[#C9A84C]/30 transition-colors">
              <span className="font-mono text-sm text-[#3a3530]">candlescope.de/</span>
              <input
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="flex-1 bg-transparent text-sm text-[#F5F0E8] font-mono focus:outline-none"
                placeholder="meine-seite"
              />
            </div>
            <p className="font-mono text-[9px] text-[#2a2a2a] mt-1 tracking-[0.08em]">
              Nur Kleinbuchstaben, Zahlen und Bindestriche
            </p>
          </div>

          {/* Icon */}
          <div>
            <label className="font-mono text-[9px] tracking-[0.16em] text-[#3a3530] uppercase block mb-1.5">
              NAV-ICON
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ICON_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setIcon(opt.value)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-[10px] font-mono transition-all ${
                    icon === opt.value
                      ? 'border-[#C9A84C]/40 bg-[#C9A84C]/8 text-[#C9A84C]'
                      : 'border-[#ffffff]/4 bg-[#080808] text-[#3a3530] hover:border-[#C9A84C]/20 hover:text-[#9A9590]'
                  }`}
                >
                  <FileText size={14} strokeWidth={1.5} />
                  {opt.label}
                  {icon === opt.value && <Check size={10} strokeWidth={2} className="text-[#C9A84C]" />}
                </button>
              ))}
            </div>
          </div>

          {/* In Navigation */}
          <div>
            <label className="font-mono text-[9px] tracking-[0.16em] text-[#3a3530] uppercase block mb-1.5">
              NAVIGATION
            </label>
            <button
              onClick={() => setShowInNav(v => !v)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border w-full text-left transition-all ${
                showInNav
                  ? 'border-[#C9A84C]/30 bg-[#C9A84C]/6 text-[#C9A84C]'
                  : 'border-[#ffffff]/6 bg-[#080808] text-[#5a5550]'
              }`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                showInNav ? 'border-[#C9A84C] bg-[#C9A84C]' : 'border-[#3a3530]'
              }`}>
                {showInNav && <Check size={10} strokeWidth={2.5} className="text-[#080808]" />}
              </div>
              <span className="font-mono text-[11px] tracking-[0.08em]">
                In Navigation anzeigen
              </span>
            </button>
            <p className="font-mono text-[9px] text-[#2a2a2a] mt-1 tracking-[0.08em]">
              Die Seite wird erst live wenn du sie publizierst
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.p
              className="font-mono text-[11px] text-[#FF4444] tracking-[0.06em]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCreate}
              disabled={!title || !slug}
              className="relative overflow-hidden group flex-1 py-3 rounded-full border border-[#C9A84C]/40 text-[#C9A84C] font-mono text-[11px] tracking-[0.14em] uppercase disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300">
                Seite erstellen
              </span>
              <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </button>
            <Link
              to="/admin/pages"
              className="flex-1 py-3 rounded-full border border-[#ffffff]/6 text-[#5a5550] font-mono text-[11px] tracking-[0.14em] uppercase text-center hover:text-[#F5F0E8] transition-colors"
            >
              Abbrechen
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}