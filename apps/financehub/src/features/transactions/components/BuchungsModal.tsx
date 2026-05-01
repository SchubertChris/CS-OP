import { useState, useRef, useEffect, type ReactNode } from 'react'
import {
  X, ArrowDown, ArrowUp, ArrowsLeftRight, CaretLeft, CaretRight,
  CheckCircle, MagnifyingGlass,
} from '@phosphor-icons/react'
import styles from './BuchungsModal.module.scss'

const MOCK_KONTEN = [
  { name: 'Girokonto · DKB', sub: '€ 3.240,00', color: '#3B82F6' },
  { name: 'Sparkasse Haupt', sub: '€ 8.910,50',  color: '#F59E0B' },
  { name: 'PayPal',          sub: '€ 124,80',    color: '#0070BA' },
]

const MOCK_KREDITOREN = [
  { name: 'Amazon.de',    initials: 'AM', color: '#FF9900', bg: 'rgba(255,153,0,0.15)'  },
  { name: 'Rewe',         initials: 'RW', color: '#EF4444', bg: 'rgba(239,68,68,0.15)'  },
  { name: 'Spotify',      initials: 'SP', color: '#1DB954', bg: 'rgba(29,185,84,0.15)'  },
  { name: 'Netflix',      initials: 'NF', color: '#E50914', bg: 'rgba(229,9,20,0.15)'   },
  { name: 'Kunde A GmbH', initials: 'KA', color: '#22C55E', bg: 'rgba(34,197,94,0.15)'  },
  { name: 'ADAC',         initials: 'AD', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  { name: 'Edeka',        initials: 'ED', color: '#16A34A', bg: 'rgba(22,163,74,0.15)'  },
  { name: 'Lidl',         initials: 'LI', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
]

const MOCK_KATEGORIEN = [
  { name: 'Abonnements',  emoji: '📱', color: '#8B5CF6', bg: 'rgba(139,92,246,0.14)' },
  { name: 'Lebensmittel', emoji: '🛒', color: '#22C55E', bg: 'rgba(34,197,94,0.14)'  },
  { name: 'Transport',    emoji: '🚗', color: '#3B82F6', bg: 'rgba(59,130,246,0.14)' },
  { name: 'Einnahmen',    emoji: '💰', color: '#F59E0B', bg: 'rgba(245,158,11,0.14)' },
  { name: 'Wohnen',       emoji: '🏠', color: '#EF4444', bg: 'rgba(239,68,68,0.14)'  },
  { name: 'Gesundheit',   emoji: '💊', color: '#EC4899', bg: 'rgba(236,72,153,0.14)' },
  { name: 'Freizeit',     emoji: '🎮', color: '#14B8A6', bg: 'rgba(20,184,166,0.14)' },
]

const MOCK_ZAHLUNGSARTEN = [
  { name: 'Überweisung', icon: '🏦' },
  { name: 'Lastschrift',  icon: '📋' },
  { name: 'Bargeld',      icon: '💵' },
  { name: 'Karte',        icon: '💳' },
]

const MOCK_INTERVALLE = [
  { name: 'Täglich'         },
  { name: 'Wöchentlich'     },
  { name: 'Monatlich'       },
  { name: 'Vierteljährlich' },
  { name: 'Halbjährlich'    },
]

const MONTH_NAMES = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']
const DAY_NAMES   = ['Mo','Di','Mi','Do','Fr','Sa','So']

function getCalDays(month: number, year: number) {
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return { startOffset: (firstDay + 6) % 7, daysInMonth }
}

function fmtAmount(raw: string): string {
  if (!raw) return ''
  const [intStr = '', decStr] = raw.split(',')
  const intFmt = intStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return decStr !== undefined ? intFmt + ',' + decStr : intFmt
}

function DropdownFieldRow({
  label, preview, isOpen, onToggle, children,
}: {
  label: string
  preview: ReactNode
  isOpen: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className={styles.dropWrap}>
      <div
        className={`${styles.fieldRow} ${styles.fieldRowDrop} ${isOpen ? styles.fieldRowOpen : ''}`}
        onClick={onToggle}
      >
        <span className={styles.fieldLabel}>{label}</span>
        <div className={styles.fieldDropRight}>{preview}</div>
      </div>
      {isOpen && <div className={styles.dropList} onClick={e => e.stopPropagation()}>{children}</div>}
    </div>
  )
}

function SearchableDropdownFieldRow<T extends { name: string }>({
  label, preview, isOpen, onToggle, items, renderItem,
}: {
  label: string
  preview: ReactNode
  isOpen: boolean
  onToggle: () => void
  items: T[]
  renderItem: (item: T) => ReactNode
}) {
  const [q, setQ]  = useState('')
  const inputRef   = useRef<HTMLInputElement>(null)
  const showSearch = items.length > 5
  const filtered   = showSearch
    ? items.filter(i => i.name.toLowerCase().includes(q.toLowerCase()))
    : items

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 30)
    else setQ('')
  }, [isOpen])

  return (
    <div className={styles.dropWrap}>
      <div
        className={`${styles.fieldRow} ${styles.fieldRowDrop} ${isOpen ? styles.fieldRowOpen : ''}`}
        onClick={onToggle}
      >
        <span className={styles.fieldLabel}>{label}</span>
        <div className={styles.fieldDropRight}>{preview}</div>
      </div>
      {isOpen && (
        <div className={styles.dropList} onClick={e => e.stopPropagation()}>
          {showSearch && (
            <div className={styles.dropSearch}>
              <MagnifyingGlass size={12} />
              <input
                ref={inputRef}
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Suchen…"
                className={styles.dropSearchInput}
              />
              {q && (
                <button onClick={e => { e.stopPropagation(); setQ('') }}>
                  <X size={10} />
                </button>
              )}
            </div>
          )}
          <div className={styles.dropScroll}>
            {filtered.map(item => renderItem(item))}
            {showSearch && filtered.length === 0 && (
              <p className={styles.dropEmpty}>Kein Treffer für „{q}"</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function FieldRow({ label, value, isTag }: { label: string; value: string; isTag?: boolean }) {
  return (
    <div className={styles.fieldRow}>
      <span className={styles.fieldLabel}>{label}</span>
      {isTag
        ? <span className={styles.fieldTag}>{value}</span>
        : <span className={styles.fieldValue}>{value}</span>
      }
    </div>
  )
}

interface BuchungsModalProps {
  onClose: () => void
}

export function BuchungsModal({ onClose }: BuchungsModalProps) {
  const [flow,        setFlow]       = useState<'ein' | 'aus' | 'umbuchung'>('aus')
  const [type,        setType]       = useState<'einzeln' | 'dauerauftrag'>('einzeln')
  const [amount,      setAmount]     = useState('')
  const amountRef                    = useRef<HTMLInputElement>(null)
  const [openDrop,    setOpenDrop]   = useState<'konto' | 'zielkonto' | 'kreditor' | 'zweck' | 'datum' | 'kategorie' | 'zahlungsart' | 'intervall' | 'notiz' | null>(null)
  const [konto,       setKonto]      = useState('Girokonto · DKB')
  const [zielkonto,   setZielkonto]  = useState('Sparkasse Haupt')
  const [kreditor,    setKreditor]   = useState('Amazon.de')
  const [zweck,       setZweck]      = useState('Prime Jahresabo')
  const [kategorie,   setKategorie]  = useState('Abonnements')
  const [zahlungsart, setZahlungsart]= useState('Überweisung')
  const [intervall,   setIntervall]  = useState('Monatlich')
  const [notiz,       setNotiz]      = useState('')
  const [datum,       setDatum]      = useState({ day: 30, month: 3, year: 2026 })
  const [calNav,      setCalNav]     = useState({ month: 3, year: 2026 })

  type DropKey = 'konto' | 'zielkonto' | 'kreditor' | 'zweck' | 'datum' | 'kategorie' | 'zahlungsart' | 'intervall' | 'notiz'
  const toggle = (f: DropKey) => setOpenDrop(prev => prev === f ? null : f)

  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCalNav(p => p.month === 0 ? { month: 11, year: p.year - 1 } : { month: p.month - 1, year: p.year })
  }
  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCalNav(p => p.month === 11 ? { month: 0, year: p.year + 1 } : { month: p.month + 1, year: p.year })
  }

  const datumStr       = `${String(datum.day).padStart(2,'0')}.${String(datum.month+1).padStart(2,'0')}.${datum.year}`
  const selKonto       = MOCK_KONTEN.find(k => k.name === konto)!
  const selZielkonto   = MOCK_KONTEN.find(k => k.name === zielkonto) ?? MOCK_KONTEN[1]
  const selKreditor    = MOCK_KREDITOREN.find(k => k.name === kreditor)!
  const selKat         = MOCK_KATEGORIEN.find(k => k.name === kategorie)!
  const selZahlungsart = MOCK_ZAHLUNGSARTEN.find(z => z.name === zahlungsart)!

  return (
    <div className={styles.backdrop} onClick={() => { onClose(); setOpenDrop(null) }}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        <div className={styles.head}>
          <span className={styles.headTitle}>Neue Buchung</span>
          <button className={styles.closeBtn} onClick={onClose}><X size={14} /></button>
        </div>

        <div className={styles.flowToggle}>
          <button className={`${styles.flowBtn} ${flow === 'ein' ? styles.flowIn : ''}`} onClick={() => setFlow('ein')}>
            <ArrowDown size={12} weight="bold" />Einnahme
          </button>
          <button className={`${styles.flowBtn} ${flow === 'aus' ? styles.flowOut : ''}`} onClick={() => setFlow('aus')}>
            <ArrowUp size={12} weight="bold" />Ausgabe
          </button>
          <button className={`${styles.flowBtn} ${flow === 'umbuchung' ? styles.flowTransfer : ''}`} onClick={() => setFlow('umbuchung')}>
            <ArrowsLeftRight size={12} weight="bold" />Umbuchung
          </button>
        </div>

        <div className={styles.typeToggle}>
          {(['einzeln', 'dauerauftrag'] as const).map(t => (
            <button
              key={t}
              className={`${styles.typeBtn} ${type === t ? styles.typeBtnActive : ''}`}
              onClick={() => setType(t)}
            >
              {t === 'einzeln' ? 'Einzeln' : 'Dauerauftrag'}
            </button>
          ))}
        </div>

        <div className={styles.amountRow} onClick={() => amountRef.current?.focus()}>
          <span className={`${styles.amountCurrency} ${
            flow === 'ein' ? styles.amountIn :
            flow === 'umbuchung' ? styles.amountTransfer :
            styles.amountOut
          }`}>€</span>
          <div className={styles.amountWrap}>
            {(() => {
              const parts      = fmtAmount(amount).split(',')
              const intDisplay = parts[0] || '0'
              const decDisplay = parts[1]
              const dim        = !amount
              return (
                <>
                  <span className={styles.amountInt} style={{ color: dim ? 'var(--cs-text-3)' : undefined }}>
                    {intDisplay}
                  </span>
                  <span className={styles.amountDec} style={{ color: dim ? 'var(--cs-text-3)' : undefined }}>
                    ,{decDisplay ?? '00'}
                  </span>
                </>
              )
            })()}
            <input
              ref={amountRef}
              className={styles.amountHiddenInput}
              type="text"
              inputMode="decimal"
              value={fmtAmount(amount)}
              onChange={e => {
                const stripped = e.target.value.replace(/\./g, '')
                const valid    = stripped.replace(/[^0-9,]/g, '')
                const parts    = valid.split(',')
                if (parts.length > 2) return
                if (parts[1] !== undefined && parts[1].length > 2) return
                setAmount(valid)
              }}
            />
          </div>
        </div>

        <div className={styles.fieldList} onClick={() => setOpenDrop(null)}>

          <SearchableDropdownFieldRow
            label="Konto"
            isOpen={openDrop === 'konto'}
            onToggle={() => toggle('konto')}
            items={MOCK_KONTEN}
            preview={
              <div className={styles.dropPreview}>
                <span className={styles.dropDotSm} style={{ background: selKonto.color }} />
                <span className={styles.fieldValue}>{konto}</span>
              </div>
            }
            renderItem={k => (
              <div
                key={k.name}
                className={`${styles.dropItem} ${konto === k.name ? styles.dropItemActive : ''}`}
                onClick={() => { setKonto(k.name); setOpenDrop(null) }}
              >
                <span className={styles.dropDot} style={{ background: k.color }} />
                <div className={styles.dropItemInfo}>
                  <span className={styles.dropItemName}>{k.name}</span>
                  <span className={styles.dropItemSub}>{k.sub}</span>
                </div>
                {konto === k.name && <CheckCircle size={13} weight="fill" className={styles.dropCheck} />}
              </div>
            )}
          />

          {flow === 'umbuchung' ? (
            <SearchableDropdownFieldRow
              label="Zielkonto"
              isOpen={openDrop === 'zielkonto'}
              onToggle={() => toggle('zielkonto')}
              items={MOCK_KONTEN.filter(k => k.name !== konto)}
              preview={
                <div className={styles.dropPreview}>
                  <span className={styles.dropDotSm} style={{ background: selZielkonto.color }} />
                  <span className={styles.fieldValue}>{selZielkonto.name}</span>
                </div>
              }
              renderItem={k => (
                <div
                  key={k.name}
                  className={`${styles.dropItem} ${zielkonto === k.name ? styles.dropItemActive : ''}`}
                  onClick={() => { setZielkonto(k.name); setOpenDrop(null) }}
                >
                  <span className={styles.dropDot} style={{ background: k.color }} />
                  <div className={styles.dropItemInfo}>
                    <span className={styles.dropItemName}>{k.name}</span>
                    <span className={styles.dropItemSub}>{k.sub}</span>
                  </div>
                  {zielkonto === k.name && <CheckCircle size={13} weight="fill" className={styles.dropCheck} />}
                </div>
              )}
            />
          ) : (
            <SearchableDropdownFieldRow
              label="Kreditor"
              isOpen={openDrop === 'kreditor'}
              onToggle={() => toggle('kreditor')}
              items={MOCK_KREDITOREN}
              preview={
                <div className={styles.dropPreview}>
                  <div className={styles.dropAvatarSm} style={{ background: selKreditor.bg, color: selKreditor.color }}>
                    {selKreditor.initials}
                  </div>
                  <span className={styles.fieldValue}>{kreditor}</span>
                </div>
              }
              renderItem={k => (
                <div
                  key={k.name}
                  className={`${styles.dropItem} ${kreditor === k.name ? styles.dropItemActive : ''}`}
                  onClick={() => { setKreditor(k.name); setOpenDrop(null) }}
                >
                  <div className={styles.dropAvatar} style={{ background: k.bg, color: k.color }}>
                    {k.initials}
                  </div>
                  <span className={styles.dropItemName}>{k.name}</span>
                  {kreditor === k.name && <CheckCircle size={13} weight="fill" className={styles.dropCheck} />}
                </div>
              )}
            />
          )}

          <DropdownFieldRow
            label="Verwendungszweck"
            isOpen={openDrop === 'zweck'}
            onToggle={() => toggle('zweck')}
            preview={<span className={styles.fieldValue}>{zweck || '—'}</span>}
          >
            <div className={styles.zweckDrop}>
              <input
                className={styles.zweckInput}
                value={zweck}
                onChange={e => setZweck(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setOpenDrop(null) }}
                placeholder="Verwendungszweck eingeben…"
                autoFocus
              />
            </div>
          </DropdownFieldRow>

          <DropdownFieldRow
            label="Datum"
            isOpen={openDrop === 'datum'}
            onToggle={() => toggle('datum')}
            preview={<span className={styles.fieldValue}>{datumStr}</span>}
          >
            <div className={styles.calDrop}>
              <div className={styles.calHead}>
                <button className={styles.calNavBtn} onClick={prevMonth}>
                  <CaretLeft size={11} weight="bold" />
                </button>
                <span className={styles.calMonthLabel}>{MONTH_NAMES[calNav.month]} {calNav.year}</span>
                <button className={styles.calNavBtn} onClick={nextMonth}>
                  <CaretRight size={11} weight="bold" />
                </button>
              </div>
              <div className={styles.calGrid}>
                {DAY_NAMES.map(d => <span key={d} className={styles.calDayName}>{d}</span>)}
                {Array.from({ length: getCalDays(calNav.month, calNav.year).startOffset }).map((_, i) => (
                  <span key={`pad-${i}`} />
                ))}
                {Array.from({ length: getCalDays(calNav.month, calNav.year).daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const isSel = datum.day === day && datum.month === calNav.month && datum.year === calNav.year
                  return (
                    <button
                      key={day}
                      className={`${styles.calDay} ${isSel ? styles.calDaySelected : ''}`}
                      onClick={() => { setDatum({ day, month: calNav.month, year: calNav.year }); setOpenDrop(null) }}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>
          </DropdownFieldRow>

          {flow !== 'umbuchung' && (
            <SearchableDropdownFieldRow
              label="Kategorie"
              isOpen={openDrop === 'kategorie'}
              onToggle={() => toggle('kategorie')}
              items={MOCK_KATEGORIEN}
              preview={
                <div className={styles.dropPreview}>
                  <div className={styles.dropCatIconSm} style={{ background: selKat.bg, color: selKat.color }}>
                    {selKat.emoji}
                  </div>
                  <span className={styles.fieldValue}>{kategorie}</span>
                </div>
              }
              renderItem={k => (
                <div
                  key={k.name}
                  className={`${styles.dropItem} ${kategorie === k.name ? styles.dropItemActive : ''}`}
                  onClick={() => { setKategorie(k.name); setOpenDrop(null) }}
                >
                  <div className={styles.dropCatIcon} style={{ background: k.bg, color: k.color }}>
                    {k.emoji}
                  </div>
                  <span className={styles.dropItemName}>{k.name}</span>
                  {kategorie === k.name && <CheckCircle size={13} weight="fill" className={styles.dropCheck} />}
                </div>
              )}
            />
          )}

          <SearchableDropdownFieldRow
            label="Zahlungsart"
            isOpen={openDrop === 'zahlungsart'}
            onToggle={() => toggle('zahlungsart')}
            items={MOCK_ZAHLUNGSARTEN}
            preview={
              <div className={styles.dropPreview}>
                <span className={styles.dropEmojiSm}>{selZahlungsart.icon}</span>
                <span className={styles.fieldValue}>{zahlungsart}</span>
              </div>
            }
            renderItem={z => (
              <div
                key={z.name}
                className={`${styles.dropItem} ${zahlungsart === z.name ? styles.dropItemActive : ''}`}
                onClick={() => { setZahlungsart(z.name); setOpenDrop(null) }}
              >
                <span className={styles.dropEmojiLg}>{z.icon}</span>
                <span className={styles.dropItemName}>{z.name}</span>
                {zahlungsart === z.name && <CheckCircle size={13} weight="fill" className={styles.dropCheck} />}
              </div>
            )}
          />

          {type === 'dauerauftrag' && (
            <SearchableDropdownFieldRow
              label="Intervall"
              isOpen={openDrop === 'intervall'}
              onToggle={() => toggle('intervall')}
              items={MOCK_INTERVALLE}
              preview={<span className={styles.fieldValue}>{intervall}</span>}
              renderItem={iv => (
                <div
                  key={iv.name}
                  className={`${styles.dropItem} ${intervall === iv.name ? styles.dropItemActive : ''}`}
                  onClick={() => { setIntervall(iv.name); setOpenDrop(null) }}
                >
                  <span className={styles.dropItemName}>{iv.name}</span>
                  {intervall === iv.name && <CheckCircle size={13} weight="fill" className={styles.dropCheck} />}
                </div>
              )}
            />
          )}

          <DropdownFieldRow
            label="Notiz"
            isOpen={openDrop === 'notiz'}
            onToggle={() => toggle('notiz')}
            preview={
              <span className={styles.fieldValue} style={{ color: !notiz ? 'var(--cs-text-3)' : undefined }}>
                {notiz || '—'}
              </span>
            }
          >
            <div className={styles.zweckDrop}>
              <textarea
                className={`${styles.zweckInput} ${styles.notizTextarea}`}
                value={notiz}
                onChange={e => setNotiz(e.target.value)}
                onKeyDown={e => { if (e.key === 'Escape') setOpenDrop(null) }}
                placeholder="Eigene Notiz zur Buchung…"
                autoFocus
                rows={3}
              />
            </div>
          </DropdownFieldRow>

          <FieldRow label="Status" value={type === 'einzeln' ? 'Gebucht' : 'Aktiv'} isTag />
        </div>

        <button className={styles.saveBtn} onClick={onClose}>Speichern</button>
      </div>
    </div>
  )
}
