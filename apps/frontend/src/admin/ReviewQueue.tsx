// src/admin/ReviewQueue.tsx
import { useState } from 'react'
import { Check, X, Trash2, MessageSquarePlus, Plus } from 'lucide-react'
import { useReviewStore } from '../store/useReviewStore'

const STAR_POLY = '12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26'

function StarDisplay({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 shrink-0">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24"
          fill={i < count ? '#C9A84C' : 'none'}
          stroke={i < count ? '#C9A84C' : 'currentColor'}
          strokeWidth="2"
          className={i >= count ? 'text-[var(--cs-text-3)]' : ''}>
          <polygon points={STAR_POLY} />
        </svg>
      ))}
    </div>
  )
}

function StarInputAdmin({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  const active = hovered || value
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <button key={i} type="button"
          onClick={() => onChange(i + 1)}
          onMouseEnter={() => setHovered(i + 1)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${i + 1} Stern`}
          className="cursor-pointer transition-transform hover:scale-110">
          <svg width="20" height="20" viewBox="0 0 24 24"
            fill={active > i ? '#C9A84C' : 'none'}
            stroke={active > i ? '#C9A84C' : 'currentColor'}
            strokeWidth="2"
            className={active <= i ? 'text-[var(--cs-text-3)]' : ''}
            style={{ transition: 'fill 0.1s, stroke 0.1s' }}>
            <polygon points={STAR_POLY} />
          </svg>
        </button>
      ))}
    </div>
  )
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

type Tab = 'pending' | 'approved'

export default function ReviewQueue() {
  const { reviews, approve, reject, remove, add } = useReviewStore()

  const [tab,      setTab]      = useState<Tab>('pending')
  const [adding,   setAdding]   = useState(false)
  const [newName,  setNewName]  = useState('')
  const [newRole,  setNewRole]  = useState('')
  const [newStars, setNewStars] = useState(5)
  const [newText,  setNewText]  = useState('')

  const pending  = reviews.filter(r => r.status === 'pending')
  const approved = reviews.filter(r => r.status === 'approved')

  const inputCls = `w-full bg-[var(--cs-s2)] border border-[#C9A84C]/15 rounded-lg px-3 py-2
                    text-[var(--cs-text)] text-xs placeholder:text-[var(--cs-text-3)]
                    focus:outline-none focus:border-[#C9A84C]/35 transition-colors`

  const resetForm = () => {
    setNewName(''); setNewRole(''); setNewStars(5); setNewText('')
    setAdding(false)
  }

  const handleAdd = () => {
    if (!newName.trim() || !newText.trim() || newStars < 1) return
    add({ name: newName.trim(), role: newRole.trim(), stars: newStars, text: newText.trim() })
    resetForm()
  }

  return (
    <div className="bg-[var(--cs-s2)] border border-[#C9A84C]/12 rounded-2xl p-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <MessageSquarePlus size={14} strokeWidth={1.5} className="text-[#C9A84C]/50" />
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--cs-text-2)]">
            Bewertungen
          </p>
          {pending.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full
                             bg-[#C9A84C] text-[#080808] text-[10px] font-bold leading-none animate-pulse">
              {pending.length}
            </span>
          )}
        </div>

        {/* Segment tabs */}
        <div className="flex bg-[var(--cs-s4)] rounded-lg p-0.5 gap-px">
          {(['pending', 'approved'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`font-mono text-[10px] tracking-[0.08em] uppercase px-3 py-1.5 rounded-[6px]
                          transition-all cursor-pointer ${
                t === tab
                  ? 'bg-[var(--cs-s2)] text-[var(--cs-text)] shadow-sm'
                  : 'text-[var(--cs-text-3)] hover:text-[var(--cs-text-2)]'
              }`}>
              {t === 'pending'
                ? `Ausstehend${pending.length > 0 ? ` (${pending.length})` : ''}`
                : `Genehmigt (${approved.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          PENDING TAB
      ══════════════════════════════════════════ */}
      {tab === 'pending' && (
        <div className="flex flex-col gap-3">
          {pending.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <span className="text-3xl opacity-20">✓</span>
              <p className="text-[var(--cs-text-3)] text-xs">Keine ausstehenden Bewertungen</p>
            </div>
          ) : (
            pending.map(r => (
              <div key={r.id} className="border border-[#C9A84C]/8 rounded-xl p-4 bg-[var(--cs-bg)]">
                {/* Meta row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <StarDisplay count={r.stars} />
                    <p className="text-sm text-[var(--cs-text)] font-medium leading-none">
                      {r.name}
                      {r.role && (
                        <span className="text-[var(--cs-text-3)] font-normal text-xs"> · {r.role}</span>
                      )}
                    </p>
                    <p className="font-mono text-[10px] text-[var(--cs-text-3)]">
                      {fmtDate(r.createdAt)}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => approve(r.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono
                                 text-[10px] tracking-[0.08em] uppercase cursor-pointer transition-colors
                                 bg-[#00C896]/10 border border-[#00C896]/25 text-[#00C896]
                                 hover:bg-[#00C896]/18">
                      <Check size={11} strokeWidth={2.5} /> Ja
                    </button>
                    <button onClick={() => reject(r.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono
                                 text-[10px] tracking-[0.08em] uppercase cursor-pointer transition-colors
                                 bg-[#FF4444]/8 border border-[#FF4444]/20 text-[#FF4444]
                                 hover:bg-[#FF4444]/14">
                      <X size={11} strokeWidth={2.5} /> Nein
                    </button>
                  </div>
                </div>

                {/* Review text */}
                <p className="text-sm text-[var(--cs-text-2)] leading-relaxed border-t border-[#C9A84C]/6 pt-3">
                  „{r.text}"
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          APPROVED TAB
      ══════════════════════════════════════════ */}
      {tab === 'approved' && (
        <div className="flex flex-col gap-3">

          {/* Manual add button */}
          {!adding ? (
            <button onClick={() => setAdding(true)}
              className="self-start flex items-center gap-2 border border-dashed border-[#C9A84C]/20
                         hover:border-[#C9A84C]/40 text-[var(--cs-text-2)] hover:text-[#C9A84C]
                         rounded-lg px-3 py-2 font-mono text-[10px] tracking-[0.08em] uppercase
                         transition-colors cursor-pointer">
              <Plus size={12} strokeWidth={2} /> Manuell hinzufügen
            </button>
          ) : (
            /* Inline add form */
            <div className="border border-[#C9A84C]/15 rounded-xl p-4 bg-[var(--cs-bg)] flex flex-col gap-3">
              <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--cs-text-2)]">
                Neue Bewertung (direkt genehmigt)
              </p>

              <StarInputAdmin value={newStars} onChange={setNewStars} />

              <div className="grid grid-cols-2 gap-2">
                <input
                  className={inputCls}
                  placeholder="Name *"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                />
                <input
                  className={inputCls}
                  placeholder="Kontext (optional)"
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                />
              </div>

              <textarea
                className={`${inputCls} resize-none`}
                rows={3}
                placeholder="Bewertungstext *"
                value={newText}
                onChange={e => setNewText(e.target.value)}
              />

              <div className="flex gap-2">
                <button onClick={handleAdd}
                  className="flex-1 bg-[#C9A84C] text-[#080808] text-xs font-bold py-2 rounded-lg
                             hover:opacity-90 transition-opacity cursor-pointer">
                  Hinzufügen
                </button>
                <button onClick={resetForm}
                  className="px-4 text-[var(--cs-text-2)] text-xs border border-[var(--cs-text)]/10
                             rounded-lg hover:text-[var(--cs-text)] transition-colors cursor-pointer">
                  Abbrechen
                </button>
              </div>
            </div>
          )}

          {/* Approved list */}
          {approved.length === 0 ? (
            <p className="text-[var(--cs-text-3)] text-xs text-center py-4">
              Noch keine genehmigten Bewertungen
            </p>
          ) : (
            <div className="flex flex-col">
              {approved.map((r, i) => (
                <div key={r.id}
                  className={`flex items-center gap-3 py-2.5 ${
                    i < approved.length - 1 ? 'border-b border-[#C9A84C]/6' : ''
                  }`}>
                  <StarDisplay count={r.stars} />
                  <span className="text-sm text-[var(--cs-text)] font-medium flex-1 min-w-0 truncate">
                    {r.name}
                  </span>
                  {r.role && (
                    <span className="text-xs text-[var(--cs-text-3)] shrink-0 hidden sm:block truncate max-w-[140px]">
                      {r.role}
                    </span>
                  )}
                  <span className="font-mono text-[10px] text-[var(--cs-text-3)] shrink-0 hidden md:block">
                    {fmtDate(r.createdAt)}
                  </span>
                  <button onClick={() => remove(r.id)} title="Löschen"
                    className="text-[var(--cs-text-3)] hover:text-[#FF4444] transition-colors cursor-pointer shrink-0">
                    <Trash2 size={13} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
