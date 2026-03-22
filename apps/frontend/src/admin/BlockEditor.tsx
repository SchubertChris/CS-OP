/* ============================================================
   CandleScope — Block Editor
   src/admin/BlockEditor.tsx
   ============================================================ */

import { Plus, Trash2, Copy, GripVertical } from 'lucide-react'
import { usePagesStore } from '../store/usePagesStore'
import type { AnyBlock, HeroBlockProps, HeroTheme } from '../types/page.types'
import { BLOCK_REGISTRY } from '../types/block.registry'
import { nanoid } from 'nanoid'
import {
  Sparkles, AlignLeft, LayoutGrid, List,
  Image, BarChart2, Megaphone, GitBranch,
  Minus, Play,
} from 'lucide-react'

export const BLOCK_ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  hero: Sparkles, text: AlignLeft, 'card-grid': LayoutGrid,
  list: List, image: Image, stats: BarChart2,
  'cta-banner': Megaphone, timeline: GitBranch,
  divider: Minus, embed: Play,
}

const HERO_THEMES: HeroTheme[] = ['home', 'finance', 'dev', 'about', 'community', 'contact', 'default']

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-mono text-[11px] tracking-[0.12em] text-[#9A9590] uppercase block mb-2">{label}</label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, multiline }: {
  value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean
}) {
  const cls = "w-full bg-[#080808] border border-[#ffffff]/8 rounded-xl px-4 py-3 text-[14px] text-[#F5F0E8] placeholder:text-[#3a3530] focus:outline-none focus:border-[#C9A84C]/40 transition-colors"
  if (multiline) return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className={cls + ' resize-none'} />
  return <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
}

function SelectInput({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full bg-[#080808] border border-[#ffffff]/8 rounded-xl px-4 py-3 text-[14px] text-[#F5F0E8] focus:outline-none focus:border-[#C9A84C]/40 transition-colors appearance-none">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function ToggleInput({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border w-full text-left transition-all ${value ? 'border-[#C9A84C]/35 bg-[#C9A84C]/8 text-[#C9A84C]' : 'border-[#ffffff]/8 bg-[#080808] text-[#9A9590] hover:border-[#C9A84C]/20'
        }`}>
      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${value ? 'border-[#C9A84C] bg-[#C9A84C]' : 'border-[#5a5550]'}`}>
        {value && <div className="w-2 h-1.5 border-l-2 border-b-2 border-[#080808] -mt-0.5 rotate-[-45deg]" />}
      </div>
      <span className="text-[13px]">{label}</span>
    </button>
  )
}

function BlockHeader({ block, pageId }: { block: AnyBlock; pageId: string }) {
  const { deleteBlock, duplicateBlock } = usePagesStore()
  const config = BLOCK_REGISTRY.find(b => b.type === block.type)
  const Icon = BLOCK_ICONS[block.type] ?? Sparkles
  return (
    <div className="flex items-center justify-between mb-6 pb-5 border-b border-[#C9A84C]/10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/12 border border-[#C9A84C]/25 flex items-center justify-center text-[#C9A84C]">
          <Icon size={17} strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[15px] font-medium text-[#F5F0E8]">{config?.label ?? block.type}</p>
          <p className="font-mono text-[11px] text-[#5a5550]">{block.id}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => duplicateBlock(pageId, block.id)}
          className="flex items-center gap-1.5 font-mono text-[12px] text-[#9A9590] hover:text-[#C9A84C] transition-colors px-3 py-2 rounded-lg hover:bg-[#C9A84C]/8 border border-transparent hover:border-[#C9A84C]/20">
          <Copy size={13} strokeWidth={1.5} /> Duplizieren
        </button>
        <button onClick={() => deleteBlock(pageId, block.id)}
          className="flex items-center gap-1.5 font-mono text-[12px] text-[#9A9590] hover:text-[#FF4444] transition-colors px-3 py-2 rounded-lg hover:bg-[#FF4444]/8 border border-transparent hover:border-[#FF4444]/20">
          <Trash2 size={13} strokeWidth={1.5} /> Löschen
        </button>
      </div>
    </div>
  )
}

function HeroEditor({ block, pageId }: { block: AnyBlock; pageId: string }) {
  const { updateBlock } = usePagesStore()
  const p = block.props as HeroBlockProps
  const update = (key: string, value: unknown) => updateBlock(pageId, block.id, { [key]: value })
  const updateCta = (index: number, key: string, value: string) => {
    const ctas = [...(p.ctas ?? [])]
    ctas[index] = { ...ctas[index], [key]: value }
    update('ctas', ctas)
  }
  const addCta = () => update('ctas', [...(p.ctas ?? []), { label: 'Button', href: '/', variant: 'primary' }])
  const removeCta = (index: number) => { const c = [...(p.ctas ?? [])]; c.splice(index, 1); update('ctas', c) }

  return (
    <div className="flex flex-col gap-5">
      <p className="font-mono text-[11px] tracking-[0.18em] text-[#9A9590] uppercase">Hero Block</p>
      <Field label="Eyebrow"><TextInput value={p.eyebrow ?? ''} onChange={v => update('eyebrow', v)} placeholder="z.B. Finance" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Titel Zeile 1"><TextInput value={p.titleLine1 ?? ''} onChange={v => update('titleLine1', v)} placeholder="Märkte &" /></Field>
        <Field label="Titel Zeile 2"><TextInput value={p.titleLine2 ?? ''} onChange={v => update('titleLine2', v)} placeholder="Tools" /></Field>
      </div>
      <Field label="Gold-Akzent">
        <SelectInput value={p.titleAccent ?? 'line2'} onChange={v => update('titleAccent', v)}
          options={[{ value: 'line1', label: 'Zeile 1 (gold)' }, { value: 'line2', label: 'Zeile 2 (gold)' }]} />
      </Field>
      <Field label="Beschreibung"><TextInput value={p.description ?? ''} onChange={v => update('description', v)} placeholder="Kurze Beschreibung..." multiline /></Field>
      <Field label="Badge (optional)"><TextInput value={p.badge ?? ''} onChange={v => update('badge', v)} placeholder="z.B. Coming soon" /></Field>
      <Field label="Theme">
        <SelectInput value={p.theme ?? 'default'} onChange={v => update('theme', v)}
          options={HERO_THEMES.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))} />
      </Field>
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="font-mono text-[11px] tracking-[0.12em] text-[#9A9590] uppercase">CTAs</label>
          <button onClick={addCta} className="flex items-center gap-1.5 font-mono text-[11px] text-[#C9A84C]/60 hover:text-[#C9A84C] transition-colors">
            <Plus size={12} strokeWidth={1.5} /> Hinzufügen
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {(p.ctas ?? []).map((cta, i) => (
            <div key={i} className="border border-[#ffffff]/8 rounded-xl p-4 bg-[#080808] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-[#5a5550]">CTA {i + 1}</span>
                <button onClick={() => removeCta(i)} className="text-[#5a5550] hover:text-[#FF4444] transition-colors"><Trash2 size={13} strokeWidth={1.5} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Label"><TextInput value={cta.label} onChange={v => updateCta(i, 'label', v)} placeholder="Button Text" /></Field>
                <Field label="Variante">
                  <SelectInput value={cta.variant} onChange={v => updateCta(i, 'variant', v)}
                    options={[{ value: 'primary', label: 'Primary' }, { value: 'ghost', label: 'Ghost' }]} />
                </Field>
              </div>
              <Field label="Link"><TextInput value={cta.href} onChange={v => updateCta(i, 'href', v)} placeholder="/seite" /></Field>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TextEditor({ block, pageId }: { block: AnyBlock; pageId: string }) {
  const { updateBlock } = usePagesStore()
  const p = block.props as { content: string; alignment?: string; maxWidth?: string }
  const update = (key: string, value: unknown) => updateBlock(pageId, block.id, { [key]: value })
  return (
    <div className="flex flex-col gap-5">
      <p className="font-mono text-[11px] tracking-[0.18em] text-[#9A9590] uppercase">Text Block</p>
      <Field label="Inhalt"><TextInput value={p.content ?? ''} onChange={v => update('content', v)} placeholder="Dein Text hier..." multiline /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Ausrichtung">
          <SelectInput value={p.alignment ?? 'left'} onChange={v => update('alignment', v)}
            options={[{ value: 'left', label: 'Links' }, { value: 'center', label: 'Mitte' }, { value: 'right', label: 'Rechts' }]} />
        </Field>
        <Field label="Max-Breite">
          <SelectInput value={p.maxWidth ?? 'md'} onChange={v => update('maxWidth', v)}
            options={[{ value: 'sm', label: 'Schmal' }, { value: 'md', label: 'Mittel' }, { value: 'lg', label: 'Breit' }, { value: 'full', label: 'Voll' }]} />
        </Field>
      </div>
    </div>
  )
}

function StatsEditor({ block, pageId }: { block: AnyBlock; pageId: string }) {
  const { updateBlock } = usePagesStore()
  const p = block.props as { items: Array<{ id: string; value: string; label: string }> }
  const updateItem = (index: number, key: string, value: string) => {
    const items = [...p.items]; items[index] = { ...items[index], [key]: value }; updateBlock(pageId, block.id, { items })
  }
  const addItem = () => updateBlock(pageId, block.id, { items: [...p.items, { id: nanoid(6), value: '0', label: 'Stat' }] })
  const removeItem = (index: number) => updateBlock(pageId, block.id, { items: p.items.filter((_, i) => i !== index) })
  return (
    <div className="flex flex-col gap-5">
      <p className="font-mono text-[11px] tracking-[0.18em] text-[#9A9590] uppercase">Stats Block</p>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[12px] text-[#5a5550]">{p.items.length} Statistiken</span>
        <button onClick={addItem} className="flex items-center gap-1.5 font-mono text-[11px] text-[#C9A84C]/60 hover:text-[#C9A84C] transition-colors"><Plus size={12} strokeWidth={1.5} /> Hinzufügen</button>
      </div>
      {p.items.map((item, i) => (
        <div key={item.id} className="border border-[#ffffff]/8 rounded-xl p-4 bg-[#080808] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[#5a5550]">Stat {i + 1}</span>
            <button onClick={() => removeItem(i)} className="text-[#5a5550] hover:text-[#FF4444] transition-colors"><Trash2 size={13} strokeWidth={1.5} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Wert"><TextInput value={item.value} onChange={v => updateItem(i, 'value', v)} placeholder="42+" /></Field>
            <Field label="Label"><TextInput value={item.label} onChange={v => updateItem(i, 'label', v)} placeholder="Projekte" /></Field>
          </div>
        </div>
      ))}
    </div>
  )
}

function CtaBannerEditor({ block, pageId }: { block: AnyBlock; pageId: string }) {
  const { updateBlock } = usePagesStore()
  const p = block.props as { title: string; description?: string; buttonLabel: string; buttonHref: string; variant?: string }
  const update = (key: string, value: unknown) => updateBlock(pageId, block.id, { [key]: value })
  return (
    <div className="flex flex-col gap-5">
      <p className="font-mono text-[11px] tracking-[0.18em] text-[#9A9590] uppercase">CTA Banner</p>
      <Field label="Titel"><TextInput value={p.title ?? ''} onChange={v => update('title', v)} placeholder="Bereit loszulegen?" /></Field>
      <Field label="Beschreibung"><TextInput value={p.description ?? ''} onChange={v => update('description', v)} placeholder="Kurze Beschreibung..." multiline /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Button Text"><TextInput value={p.buttonLabel ?? ''} onChange={v => update('buttonLabel', v)} placeholder="Jetzt starten" /></Field>
        <Field label="Variante">
          <SelectInput value={p.variant ?? 'gold'} onChange={v => update('variant', v)}
            options={[{ value: 'gold', label: 'Gold' }, { value: 'dark', label: 'Dark' }, { value: 'outline', label: 'Outline' }]} />
        </Field>
      </div>
      <Field label="Button Link"><TextInput value={p.buttonHref ?? ''} onChange={v => update('buttonHref', v)} placeholder="/contact" /></Field>
    </div>
  )
}

function CardGridEditor({ block, pageId }: { block: AnyBlock; pageId: string }) {
  const { updateBlock } = usePagesStore()
  const p = block.props as { cols: number; cards: Array<{ id: string; title: string; description: string; badge?: string; href?: string }> }
  const updateCard = (index: number, key: string, value: string) => {
    const cards = [...p.cards]; cards[index] = { ...cards[index], [key]: value }; updateBlock(pageId, block.id, { cards })
  }
  const addCard = () => updateBlock(pageId, block.id, { cards: [...p.cards, { id: nanoid(6), title: 'Neue Karte', description: 'Beschreibung...' }] })
  const removeCard = (index: number) => updateBlock(pageId, block.id, { cards: p.cards.filter((_, i) => i !== index) })
  return (
    <div className="flex flex-col gap-5">
      <p className="font-mono text-[11px] tracking-[0.18em] text-[#9A9590] uppercase">Card Grid</p>
      <Field label="Spalten">
        <SelectInput value={String(p.cols ?? 3)} onChange={v => updateBlock(pageId, block.id, { cols: Number(v) })}
          options={[{ value: '2', label: '2 Spalten' }, { value: '3', label: '3 Spalten' }, { value: '4', label: '4 Spalten' }]} />
      </Field>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[12px] text-[#5a5550]">{p.cards.length} Karten</span>
        <button onClick={addCard} className="flex items-center gap-1.5 font-mono text-[11px] text-[#C9A84C]/60 hover:text-[#C9A84C] transition-colors"><Plus size={12} strokeWidth={1.5} /> Hinzufügen</button>
      </div>
      {p.cards.map((card, i) => (
        <div key={card.id} className="border border-[#ffffff]/8 rounded-xl p-4 bg-[#080808] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[#5a5550]">Karte {i + 1}</span>
            <button onClick={() => removeCard(i)} className="text-[#5a5550] hover:text-[#FF4444] transition-colors"><Trash2 size={13} strokeWidth={1.5} /></button>
          </div>
          <Field label="Titel"><TextInput value={card.title} onChange={v => updateCard(i, 'title', v)} placeholder="Titel" /></Field>
          <Field label="Beschreibung"><TextInput value={card.description} onChange={v => updateCard(i, 'description', v)} placeholder="Beschreibung..." multiline /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Badge"><TextInput value={card.badge ?? ''} onChange={v => updateCard(i, 'badge', v)} placeholder="Neu" /></Field>
            <Field label="Link"><TextInput value={card.href ?? ''} onChange={v => updateCard(i, 'href', v)} placeholder="/seite" /></Field>
          </div>
        </div>
      ))}
    </div>
  )
}

function ListEditor({ block, pageId }: { block: AnyBlock; pageId: string }) {
  const { updateBlock } = usePagesStore()
  const p = block.props as { title?: string; style?: string; items: Array<{ id: string; text: string; subtext?: string }> }
  const updateItem = (index: number, key: string, value: string) => {
    const items = [...p.items]; items[index] = { ...items[index], [key]: value }; updateBlock(pageId, block.id, { items })
  }
  const addItem = () => updateBlock(pageId, block.id, { items: [...p.items, { id: nanoid(6), text: 'Neuer Punkt' }] })
  const removeItem = (index: number) => updateBlock(pageId, block.id, { items: p.items.filter((_, i) => i !== index) })
  return (
    <div className="flex flex-col gap-5">
      <p className="font-mono text-[11px] tracking-[0.18em] text-[#9A9590] uppercase">Liste</p>
      <Field label="Überschrift"><TextInput value={p.title ?? ''} onChange={v => updateBlock(pageId, block.id, { title: v })} placeholder="Titel..." /></Field>
      <Field label="Stil">
        <SelectInput value={p.style ?? 'bullet'} onChange={v => updateBlock(pageId, block.id, { style: v })}
          options={[{ value: 'bullet', label: 'Bullet' }, { value: 'numbered', label: 'Nummeriert' }, { value: 'check', label: 'Checkmarks' }]} />
      </Field>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[12px] text-[#5a5550]">{p.items.length} Punkte</span>
        <button onClick={addItem} className="flex items-center gap-1.5 font-mono text-[11px] text-[#C9A84C]/60 hover:text-[#C9A84C] transition-colors"><Plus size={12} strokeWidth={1.5} /> Hinzufügen</button>
      </div>
      {p.items.map((item, i) => (
        <div key={item.id} className="border border-[#ffffff]/8 rounded-xl p-3 bg-[#080808] flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <GripVertical size={13} className="text-[#5a5550] shrink-0" />
            <input type="text" value={item.text} onChange={e => updateItem(i, 'text', e.target.value)}
              className="flex-1 bg-transparent text-[13px] text-[#F5F0E8] focus:outline-none placeholder:text-[#3a3530]" placeholder="Listenpunkt..." />
            <button onClick={() => removeItem(i)} className="text-[#5a5550] hover:text-[#FF4444] transition-colors shrink-0"><Trash2 size={12} strokeWidth={1.5} /></button>
          </div>
          <input type="text" value={item.subtext ?? ''} onChange={e => updateItem(i, 'subtext', e.target.value)}
            className="bg-transparent text-[12px] text-[#5a5550] focus:outline-none placeholder:text-[#2a2a2a] pl-5 border-t border-[#ffffff]/4 pt-2" placeholder="Beschreibung (optional)..." />
        </div>
      ))}
    </div>
  )
}

function TimelineEditor({ block, pageId }: { block: AnyBlock; pageId: string }) {
  const { updateBlock } = usePagesStore()
  const p = block.props as { title?: string; items: Array<{ id: string; date: string; title: string; description: string; status?: string }> }
  const updateItem = (index: number, key: string, value: string) => {
    const items = [...p.items]; items[index] = { ...items[index], [key]: value }; updateBlock(pageId, block.id, { items })
  }
  const addItem = () => updateBlock(pageId, block.id, { items: [...p.items, { id: nanoid(6), date: '2026', title: 'Neuer Eintrag', description: 'Beschreibung...', status: 'upcoming' }] })
  const removeItem = (index: number) => updateBlock(pageId, block.id, { items: p.items.filter((_, i) => i !== index) })
  return (
    <div className="flex flex-col gap-5">
      <p className="font-mono text-[11px] tracking-[0.18em] text-[#9A9590] uppercase">Timeline</p>
      <Field label="Überschrift"><TextInput value={p.title ?? ''} onChange={v => updateBlock(pageId, block.id, { title: v })} placeholder="Timeline Titel..." /></Field>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[12px] text-[#5a5550]">{p.items.length} Einträge</span>
        <button onClick={addItem} className="flex items-center gap-1.5 font-mono text-[11px] text-[#C9A84C]/60 hover:text-[#C9A84C] transition-colors"><Plus size={12} strokeWidth={1.5} /> Hinzufügen</button>
      </div>
      {p.items.map((item, i) => (
        <div key={item.id} className="border border-[#ffffff]/8 rounded-xl p-4 bg-[#080808] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[#5a5550]">Eintrag {i + 1}</span>
            <button onClick={() => removeItem(i)} className="text-[#5a5550] hover:text-[#FF4444] transition-colors"><Trash2 size={13} strokeWidth={1.5} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Datum"><TextInput value={item.date} onChange={v => updateItem(i, 'date', v)} placeholder="2026" /></Field>
            <Field label="Status">
              <SelectInput value={item.status ?? 'upcoming'} onChange={v => updateItem(i, 'status', v)}
                options={[{ value: 'done', label: '✓ Erledigt' }, { value: 'active', label: '● Aktiv' }, { value: 'upcoming', label: '○ Geplant' }]} />
            </Field>
          </div>
          <Field label="Titel"><TextInput value={item.title} onChange={v => updateItem(i, 'title', v)} placeholder="Titel..." /></Field>
          <Field label="Beschreibung"><TextInput value={item.description} onChange={v => updateItem(i, 'description', v)} placeholder="Beschreibung..." multiline /></Field>
        </div>
      ))}
    </div>
  )
}

function ImageEditor({ block, pageId }: { block: AnyBlock; pageId: string }) {
  const { updateBlock } = usePagesStore()
  const p = block.props as { src: string; alt: string; caption?: string; layout?: string; rounded?: boolean }
  const update = (key: string, value: unknown) => updateBlock(pageId, block.id, { [key]: value })
  return (
    <div className="flex flex-col gap-5">
      <p className="font-mono text-[11px] tracking-[0.18em] text-[#9A9590] uppercase">Bild</p>
      <Field label="Bild URL"><TextInput value={p.src ?? ''} onChange={v => update('src', v)} placeholder="https://..." /></Field>
      <Field label="Alt-Text"><TextInput value={p.alt ?? ''} onChange={v => update('alt', v)} placeholder="Bildbeschreibung" /></Field>
      <Field label="Bildunterschrift"><TextInput value={p.caption ?? ''} onChange={v => update('caption', v)} placeholder="Bildunterschrift..." /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Layout">
          <SelectInput value={p.layout ?? 'full'} onChange={v => update('layout', v)}
            options={[{ value: 'full', label: 'Voll' }, { value: 'center', label: 'Zentriert' }, { value: 'left', label: 'Links' }, { value: 'right', label: 'Rechts' }]} />
        </Field>
        <Field label="Abgerundet"><ToggleInput value={p.rounded ?? true} onChange={v => update('rounded', v)} label="Abgerundet" /></Field>
      </div>
    </div>
  )
}

function DividerEditor({ block, pageId }: { block: AnyBlock; pageId: string }) {
  const { updateBlock } = usePagesStore()
  const p = block.props as { style?: string; spacing?: string }
  const update = (key: string, value: unknown) => updateBlock(pageId, block.id, { [key]: value })
  return (
    <div className="flex flex-col gap-5">
      <p className="font-mono text-[11px] tracking-[0.18em] text-[#9A9590] uppercase">Trennlinie</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Stil">
          <SelectInput value={p.style ?? 'gold'} onChange={v => update('style', v)}
            options={[{ value: 'line', label: 'Linie' }, { value: 'gold', label: 'Gold' }, { value: 'dots', label: 'Punkte' }, { value: 'space', label: 'Nur Abstand' }]} />
        </Field>
        <Field label="Abstand">
          <SelectInput value={p.spacing ?? 'md'} onChange={v => update('spacing', v)}
            options={[{ value: 'sm', label: 'Klein' }, { value: 'md', label: 'Mittel' }, { value: 'lg', label: 'Groß' }]} />
        </Field>
      </div>
    </div>
  )
}

function EmbedEditor({ block, pageId }: { block: AnyBlock; pageId: string }) {
  const { updateBlock } = usePagesStore()
  const p = block.props as { url: string; type: string; ratio?: string; caption?: string }
  const update = (key: string, value: unknown) => updateBlock(pageId, block.id, { [key]: value })
  return (
    <div className="flex flex-col gap-5">
      <p className="font-mono text-[11px] tracking-[0.18em] text-[#9A9590] uppercase">Embed</p>
      <Field label="URL"><TextInput value={p.url ?? ''} onChange={v => update('url', v)} placeholder="https://youtube.com/watch?v=..." /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Typ">
          <SelectInput value={p.type ?? 'youtube'} onChange={v => update('type', v)}
            options={[{ value: 'youtube', label: 'YouTube' }, { value: 'vimeo', label: 'Vimeo' }, { value: 'iframe', label: 'iFrame' }]} />
        </Field>
        <Field label="Seitenverhältnis">
          <SelectInput value={p.ratio ?? '16/9'} onChange={v => update('ratio', v)}
            options={[{ value: '16/9', label: '16:9' }, { value: '4/3', label: '4:3' }, { value: '1/1', label: '1:1' }]} />
        </Field>
      </div>
      <Field label="Bildunterschrift"><TextInput value={p.caption ?? ''} onChange={v => update('caption', v)} placeholder="Beschreibung..." /></Field>
    </div>
  )
}

export default function BlockEditor({ block, pageId }: { block: AnyBlock; pageId: string }) {
  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <BlockHeader block={block} pageId={pageId} />
      {block.type === 'hero' && <HeroEditor block={block} pageId={pageId} />}
      {block.type === 'text' && <TextEditor block={block} pageId={pageId} />}
      {block.type === 'stats' && <StatsEditor block={block} pageId={pageId} />}
      {block.type === 'cta-banner' && <CtaBannerEditor block={block} pageId={pageId} />}
      {block.type === 'card-grid' && <CardGridEditor block={block} pageId={pageId} />}
      {block.type === 'list' && <ListEditor block={block} pageId={pageId} />}
      {block.type === 'timeline' && <TimelineEditor block={block} pageId={pageId} />}
      {block.type === 'image' && <ImageEditor block={block} pageId={pageId} />}
      {block.type === 'divider' && <DividerEditor block={block} pageId={pageId} />}
      {block.type === 'embed' && <EmbedEditor block={block} pageId={pageId} />}
    </div>
  )
}