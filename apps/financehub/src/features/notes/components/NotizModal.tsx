import { useState, useEffect, useRef } from 'react'
import { X, Plus, CaretLeft, CaretDown, CaretUp, Trash, Question, Calculator, NotePencil } from '@phosphor-icons/react'
import styles from './NotizModal.module.scss'

type FNPView = 'notes' | 'faq' | 'calc'

type Note = { id: number; title: string; content: string }

const INIT_NOTES: Note[] = [
  { id: 1, title: 'Amazon Prime',  content: 'Läuft am <strong>03.05.</strong> aus — kündigen?<br>Kündigungslink: amazon.de/manage' },
  { id: 2, title: 'Monatsbudget',  content: '' },
]

const EMOJIS = [
  '😊','😄','😅','🤔','😬','🙄','🥳','🙏',
  '👍','👎','✅','❌','⚠️','💡','🔔','📌',
  '🎯','🚀','🌟','❤️','🎉','🔥','💪','👀',
  '💰','💸','🏦','💳','📊','📈','📉','🛒',
  '🏠','🚗','✈️','☕','📅','📝','🔑','📦',
]

const FAQ_ITEMS = [
  { q: 'Wie buche ich eine neue Transaktion?',  a: 'Tippe auf den + Ring-Button unten rechts und wähle "Neue Buchung".' },
  { q: 'Wie verbinde ich mein Konto?',          a: 'Gehe zu Einstellungen → Konten → finAPI Verbindung hinzufügen.' },
  { q: 'Kann ich Kategorien selbst anlegen?',   a: 'Ja — unter Einstellungen → Kategorien kannst du eigene anlegen.' },
  { q: 'Wie funktioniert der Dauerauftrag?',    a: 'Beim Anlegen einer Buchung den Typ "Dauerauftrag" wählen und Intervall setzen.' },
  { q: 'Sind meine Daten sicher?',              a: 'Ja — alle Daten liegen verschlüsselt auf deutschen Servern (Frankfurt).' },
]

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

const CALC_BTNS = [
  ['C', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
]

const TOOL_TABS: { key: FNPView; Icon: typeof Question; label: string }[] = [
  { key: 'faq',   Icon: Question,   label: 'FAQ'     },
  { key: 'calc',  Icon: Calculator, label: 'Rechner' },
  { key: 'notes', Icon: NotePencil, label: 'Notizen' },
]

const TITLES: Record<FNPView, string> = { notes: 'Notizen', faq: 'FAQ', calc: 'Rechner' }

interface NotizModalProps {
  onClose: () => void
}

export function NotizModal({ onClose }: NotizModalProps) {
  const [view,       setView]       = useState<FNPView>('notes')
  const [notes,      setNotes]      = useState<Note[]>(INIT_NOTES)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [newTitle,   setNewTitle]   = useState('')
  const nextId                      = useRef(10)
  const editorRef                   = useRef<HTMLDivElement>(null)
  const [showEmoji,  setShowEmoji]  = useState(false)
  const [activeFmts, setActiveFmts] = useState<Set<string>>(new Set())
  const [faqOpen,    setFaqOpen]    = useState<number | null>(null)
  const [calcDisp,   setCalcDisp]   = useState('0')
  const [calcPrev,   setCalcPrev]   = useState<number | null>(null)
  const [calcOp,     setCalcOp]     = useState<string | null>(null)
  const [calcFresh,  setCalcFresh]  = useState(false)

  const selectedNote = notes.find(n => n.id === selectedId)

  const loadEditorContent = (html: string) => {
    if (!editorRef.current) return
    const doc = new DOMParser().parseFromString(html, 'text/html')
    editorRef.current.replaceChildren(
      ...Array.from(doc.body.childNodes).map(n => n.cloneNode(true))
    )
  }

  useEffect(() => {
    const update = () => {
      if (editorRef.current?.contains(document.activeElement) || document.activeElement === editorRef.current) {
        setActiveFmts(new Set([
          document.queryCommandState('bold')          ? 'bold'   : '',
          document.queryCommandState('italic')        ? 'italic' : '',
          document.queryCommandState('strikeThrough') ? 'strike' : '',
        ].filter(Boolean)))
      }
    }
    document.addEventListener('selectionchange', update)
    return () => document.removeEventListener('selectionchange', update)
  }, [])

  useEffect(() => {
    if (!editorRef.current) return
    const note = notes.find(n => n.id === selectedId)
    if (note) {
      loadEditorContent(note.content)
      editorRef.current.focus()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  const saveEditor = () => {
    if (editorRef.current && selectedId !== null)
      updateContent(selectedId, editorRef.current.innerHTML)
  }

  const fmt = (cmd: string) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false)
    saveEditor()
  }

  const wrapCode = () => {
    const sel = window.getSelection()
    if (!sel || !editorRef.current?.contains(sel.anchorNode)) return
    editorRef.current.focus()
    const text = sel.toString()
    document.execCommand('insertHTML', false, text ? `<code>${text}</code>` : '<code>​</code>')
    saveEditor()
  }

  const insertAtCursor = (text: string) => {
    editorRef.current?.focus()
    document.execCommand('insertText', false, text)
    saveEditor()
  }

  const createNote = () => {
    const title = newTitle.trim()
    if (!title) return
    const id = nextId.current++
    setNotes(prev => [...prev, { id, title, content: '' }])
    setSelectedId(id)
    setNewTitle('')
  }

  const updateContent = (id: number, content: string) =>
    setNotes(prev => prev.map(n => n.id === id ? { ...n, content } : n))

  const updateTitle = (id: number, title: string) =>
    setNotes(prev => prev.map(n => n.id === id ? { ...n, title } : n))

  const deleteNote = (id: number) => {
    setNotes(prev => prev.filter(n => n.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const pressCalc = (val: string) => {
    if (val === 'C')  { setCalcDisp('0'); setCalcPrev(null); setCalcOp(null); setCalcFresh(false); return }
    if (val === '±')  { setCalcDisp(d => d.startsWith('-') ? d.slice(1) : '-' + d); return }
    if (val === '%')  { setCalcDisp(d => String(parseFloat(d) / 100)); return }
    if (['+', '−', '×', '÷'].includes(val)) {
      setCalcPrev(parseFloat(calcDisp)); setCalcOp(val); setCalcFresh(true); return
    }
    if (val === '=') {
      if (calcPrev === null || !calcOp) return
      const cur = parseFloat(calcDisp)
      const res = calcOp === '+' ? calcPrev + cur : calcOp === '−' ? calcPrev - cur
                : calcOp === '×' ? calcPrev * cur : (cur !== 0 ? calcPrev / cur : NaN)
      setCalcDisp(String(parseFloat(res.toFixed(10))))
      setCalcPrev(null); setCalcOp(null); setCalcFresh(false); return
    }
    if (val === '.' && calcDisp.includes('.') && !calcFresh) return
    setCalcDisp(prev => {
      if (calcFresh) { setCalcFresh(false); return val === '.' ? '0.' : val }
      if (prev === '0' && val !== '.') return val
      return prev + val
    })
  }

  return (
    <div className={styles.modal}>

        <div className={styles.head}>
          <div className={styles.headAvatar}>
            {view === 'notes'  && <NotePencil  size={14} weight="duotone" />}
            {view === 'faq'    && <Question    size={14} weight="duotone" />}
            {view === 'calc'   && <Calculator  size={14} weight="duotone" />}
          </div>
          <div className={styles.headInfo}>
            <div className={styles.headTitle}>
              {view === 'notes' && selectedNote ? selectedNote.title : TITLES[view]}
            </div>
            {view === 'notes' && !selectedNote && (
              <div className={styles.headSub}>{notes.length} Notiz{notes.length !== 1 ? 'en' : ''}</div>
            )}
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={14} /></button>
        </div>

        {view === 'notes' && selectedNote && (
          <button className={styles.backBar} onClick={() => setSelectedId(null)}>
            <CaretLeft size={11} weight="bold" />
            <span>Alle Notizen</span>
          </button>
        )}

        <div className={`${styles.body} ${view === 'calc' ? styles.bodyCalc : ''}`}>

          {view === 'notes' && selectedId === null && (
            notes.length === 0
              ? <p className={styles.notesEmpty}>Noch keine Notizen.</p>
              : <div className={styles.notesList}>
                  {notes.map(n => (
                    <div key={n.id} className={styles.notesItem} onClick={() => setSelectedId(n.id)}>
                      <div className={styles.notesItemMain}>
                        <span className={styles.notesItemTitle}>{n.title}</span>
                        {n.content && (
                          <span className={styles.notesItemPrev}>{stripHtml(n.content)}</span>
                        )}
                      </div>
                      <button
                        className={styles.notesItemDel}
                        onClick={e => { e.stopPropagation(); deleteNote(n.id) }}
                      >
                        <Trash size={11} />
                      </button>
                    </div>
                  ))}
                </div>
          )}

          {view === 'notes' && selectedNote && (
            <div className={styles.noteDetail} onClick={() => setShowEmoji(false)}>
              <input
                className={styles.noteDetailTitle}
                value={selectedNote.title}
                onChange={e => updateTitle(selectedId!, e.target.value)}
                placeholder="Titel"
              />
              <div className={styles.noteDetailBar} onClick={e => e.stopPropagation()}>
                <div className={styles.emojiWrap}>
                  <button
                    className={`${styles.barBtn} ${showEmoji ? styles.barBtnActive : ''}`}
                    title="Emoji einfügen"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => setShowEmoji(v => !v)}
                  >😊</button>
                  {showEmoji && (
                    <div className={styles.emojiPicker}>
                      {EMOJIS.map(e => (
                        <button key={e} className={styles.emojiBtn}
                          onMouseDown={ev => ev.preventDefault()}
                          onClick={() => { insertAtCursor(e); setShowEmoji(false) }}>
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className={styles.barDivider} />
                {([
                  { label: <strong>B</strong>, cmd: 'bold',          title: 'Fett (Strg+B)'        },
                  { label: <em>I</em>,         cmd: 'italic',        title: 'Kursiv (Strg+I)'      },
                  { label: <s>S</s>,           cmd: 'strikeThrough', title: 'Durchgestrichen'      },
                ]).map(({ label, cmd, title }) => (
                  <button key={cmd}
                    className={`${styles.barBtn} ${activeFmts.has(cmd) ? styles.barBtnActive : ''}`}
                    title={title}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => fmt(cmd)}>
                    {label}
                  </button>
                ))}
                <button className={styles.barBtn} title="Code"
                  onMouseDown={e => e.preventDefault()}
                  onClick={wrapCode}><code>`</code></button>
                <button className={styles.barBtn} title="Aufgabe einfügen"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => { editorRef.current?.focus(); document.execCommand('insertHTML', false, '<br>☐ '); saveEditor() }}>☑</button>
              </div>
              <div
                ref={editorRef}
                className={styles.noteEditor}
                contentEditable
                suppressContentEditableWarning
                onInput={saveEditor}
              />
            </div>
          )}

          {view === 'faq' && (
            <div className={styles.faqList}>
              {FAQ_ITEMS.map((f, i) => (
                <div key={i} className={styles.faqItem}>
                  <button className={styles.faqQ} onClick={() => setFaqOpen(p => p === i ? null : i)}>
                    <span>{f.q}</span>
                    {faqOpen === i ? <CaretUp size={11} weight="bold" /> : <CaretDown size={11} weight="bold" />}
                  </button>
                  {faqOpen === i && <div className={styles.faqA}>{f.a}</div>}
                </div>
              ))}
            </div>
          )}

          {view === 'calc' && (
            <>
              <div className={styles.calcDisplay}>
                {calcOp && <span className={styles.calcOp}>{String(calcPrev)} {calcOp}</span>}
                <span className={styles.calcVal}>{calcDisp}</span>
              </div>
              <div className={styles.calcGrid}>
                {CALC_BTNS.flat().map((b, i) => (
                  <button
                    key={i}
                    className={`${styles.calcBtn}
                      ${['+','−','×','÷'].includes(b) ? styles.calcBtnOp   : ''}
                      ${b === '='                     ? styles.calcBtnEq   : ''}
                      ${['C','±','%'].includes(b)     ? styles.calcBtnTop  : ''}
                      ${b === '0'                     ? styles.calcBtnZero : ''}
                    `}
                    onClick={() => pressCalc(b)}
                  >{b}</button>
                ))}
              </div>
            </>
          )}

        </div>

        <div className={styles.toolbar}>
          {TOOL_TABS.map(({ key, Icon, label }) => (
            <button
              key={key}
              className={`${styles.toolBtn} ${view === key ? styles.toolBtnActive : ''}`}
              onClick={() => { setView(key); if (key !== 'notes') setSelectedId(null) }}
            >
              <Icon size={12} weight={view === key ? 'fill' : 'regular'} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {view === 'notes' && selectedId === null && (
          <div className={styles.input}>
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') createNote() }}
              placeholder="Neue Notiz: Titel eingeben…"
            />
            <button onClick={createNote} disabled={!newTitle.trim()}>
              <Plus size={14} weight="bold" />
            </button>
          </div>
        )}

      </div>
  )
}
