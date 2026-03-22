/* ============================================================
   CandleScope — Contact Page
   src/pages/ContactPage.tsx

   Setup Formspree:
   1. formspree.io → Konto erstellen → "New Form"
   2. Form-ID kopieren (sieht aus wie: xpzgkwrb)
   3. VITE_FORMSPREE_ID=xpzgkwrb in .env eintragen
   ============================================================ */

import { useState } from 'react'
import PageHero from '../components/ui/PageHero'
import {
  SectionWrapper, SectionHeader, GoldDivider,
  Card, CardIcon, GradientText, Badge, HighlightLine,
} from '../components/ui'
import {
  Mail, Github, MessageSquare, Clock,
  Code2, TrendingUp, Gamepad2, GraduationCap,
  CheckCircle2, AlertCircle, Send, ExternalLink,
  Calendar,
} from 'lucide-react'

/* ─── Formspree ID aus .env ────────────────────────────────── */
const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID ?? ''

/* ─── Wofür kontaktieren ───────────────────────────────────── */
const TOPICS = [
  { icon: <Code2 size={16} strokeWidth={1.5} />, label: 'Web-Projekt', value: 'web-projekt' },
  { icon: <TrendingUp size={16} strokeWidth={1.5} />, label: 'Finance', value: 'finance' },
  { icon: <Gamepad2 size={16} strokeWidth={1.5} />, label: 'Gaming / Tech', value: 'gaming' },
  { icon: <GraduationCap size={16} strokeWidth={1.5} />, label: 'Coaching', value: 'coaching' },
  { icon: <MessageSquare size={16} strokeWidth={1.5} />, label: 'Kooperation', value: 'kooperation' },
  { icon: <Mail size={16} strokeWidth={1.5} />, label: 'Sonstiges', value: 'sonstiges' },
]

/* ─── Kontaktwege ──────────────────────────────────────────── */
const CONTACTS = [
  {
    icon: <Mail size={20} strokeWidth={1.5} />,
    title: 'E-Mail',
    value: 'hello@candlescope.de',
    href: 'mailto:hello@candlescope.de',
    desc: 'Direkter Kontakt — bevorzugter Weg.',
  },
  {
    icon: <Github size={20} strokeWidth={1.5} />,
    title: 'GitHub',
    value: 'SchubertChris',
    href: 'https://github.com/SchubertChris',
    desc: 'Code, Open Source, Projekte.',
    external: true,
  },
  {
    icon: <MessageSquare size={20} strokeWidth={1.5} />,
    title: 'Discord',
    value: 'Community Server',
    href: 'https://discord.gg/',
    desc: 'Community & schneller Austausch.',
    external: true,
  },
]

/* ─── Form State ───────────────────────────────────────────── */
type FormStatus = 'idle' | 'sending' | 'success' | 'error'

interface FormData {
  name: string
  email: string
  topic: string
  message: string
}

export default function ContactPage() {
  const [form, setForm] = useState<FormData>({ name: '', email: '', topic: '', message: '' })
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errors, setErrors] = useState<Partial<FormData>>({})

  /* Validierung */
  const validate = (): boolean => {
    const e: Partial<FormData> = {}
    if (!form.name.trim()) e.name = 'Name ist erforderlich'
    if (!form.email.trim()) e.email = 'E-Mail ist erforderlich'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Ungültige E-Mail-Adresse'
    if (!form.topic) e.topic = 'Bitte ein Thema wählen'
    if (!form.message.trim()) e.message = 'Nachricht ist erforderlich'
    if (form.message.trim().length < 20) e.message = 'Bitte etwas mehr schreiben (min. 20 Zeichen)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  /* Absenden */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    if (!FORMSPREE_ID) {
      alert('Formspree ID fehlt — VITE_FORMSPREE_ID in .env eintragen')
      return
    }

    setStatus('sending')
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          topic: form.topic,
          message: form.message,
          _subject: `[CandleScope] ${form.topic} — ${form.name}`,
        }),
      })
      if (res.ok) {
        setStatus('success')
        setForm({ name: '', email: '', topic: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const update = (key: keyof FormData, value: string) => {
    setForm(f => ({ ...f, [key]: value }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }))
  }

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <PageHero
        eyebrow="Kontakt"
        titleLine1="Lass uns"
        titleLine2="reden"
        titleAccent="line2"
        description="Projekt · Kooperation · Beratung · Einfach ein Gespräch. Ich antworte innerhalb von 24 Stunden."
        theme="contact"
      >
        <a href="mailto:hello@candlescope.de"
          className="relative overflow-hidden group text-[11px] tracking-[0.16em] uppercase border border-[#C9A84C]/35 text-[#C9A84C] px-7 py-3.5 rounded-full">
          <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300">E-Mail schreiben</span>
          <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        </a>
      </PageHero>

      {/* ── Wofür + Verfügbarkeit ─────────────────────────── */}
      <SectionWrapper id="topics">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Wofür */}
          <div>
            <SectionHeader
              eyebrow="Wofür"
              title={<>Ich helfe dir <GradientText>dabei</GradientText></>}
              className="mb-8"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TOPICS.map(t => (
                <div key={t.value}
                  className="flex items-center gap-2.5 px-4 py-3 border border-[#ffffff]/6 rounded-xl bg-[#0d0d0d]">
                  <span className="text-[#C9A84C]/60 shrink-0">{t.icon}</span>
                  <span className="text-[13px] text-[#9A9590]">{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Verfügbarkeit */}
          <div>
            <SectionHeader
              eyebrow="Verfügbarkeit"
              title={<><GradientText>Wann</GradientText> & Wie</>}
              className="mb-8"
            />
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4 p-4 border border-[#ffffff]/6 rounded-xl bg-[#0d0d0d]">
                <div className="w-10 h-10 rounded-lg bg-[#C9A84C]/8 border border-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C] shrink-0">
                  <Clock size={17} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[14px] text-[#F5F0E8] mb-1">Antwortzeit: 24 Stunden</p>
                  <p className="text-[12px] text-[#9A9590]">Werktags · Deutsch oder Englisch</p>
                </div>
              </div>
              <HighlightLine>
                Kein automatisches System — ich antworte persönlich auf jede Anfrage.
              </HighlightLine>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse" />
                <span className="font-mono text-[12px] text-[#9A9590]">Aktuell verfügbar für neue Projekte</span>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <GoldDivider className="mx-8 md:mx-16 lg:mx-24" />

      {/* ── Formular + Kontaktwege ────────────────────────── */}
      <SectionWrapper id="form">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">

          {/* Formular */}
          <div>
            <SectionHeader
              eyebrow="Schreib mir"
              title={<>Deine <GradientText>Nachricht</GradientText></>}
              className="mb-8"
            />

            {status === 'success' ? (
              <div className="flex flex-col items-start gap-4 p-8 border border-[#00C896]/25 rounded-2xl bg-[#00C896]/5">
                <CheckCircle2 size={32} strokeWidth={1.5} className="text-[#00C896]" />
                <div>
                  <p className="font-display text-xl text-[#F5F0E8] mb-1">Nachricht gesendet!</p>
                  <p className="text-[#9A9590] text-sm">Ich melde mich innerhalb von 24 Stunden bei dir.</p>
                </div>
                <button
                  onClick={() => setStatus('idle')}
                  className="font-mono text-[11px] tracking-[0.1em] uppercase text-[#9A9590] hover:text-[#F5F0E8] transition-colors"
                >
                  Neue Nachricht schreiben
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

                {/* Name + E-Mail */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-[11px] tracking-[0.12em] text-[#9A9590] uppercase block mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => update('name', e.target.value)}
                      placeholder="Chris Mustermann"
                      className={`w-full bg-[#0d0d0d] border rounded-xl px-4 py-3.5 text-[14px] text-[#F5F0E8] placeholder:text-[#3a3530] focus:outline-none transition-colors ${errors.name ? 'border-[#FF4444]/50' : 'border-[#ffffff]/8 focus:border-[#C9A84C]/40'
                        }`}
                    />
                    {errors.name && <p className="font-mono text-[11px] text-[#FF4444] mt-1.5">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="font-mono text-[11px] tracking-[0.12em] text-[#9A9590] uppercase block mb-2">
                      E-Mail *
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => update('email', e.target.value)}
                      placeholder="deine@email.de"
                      className={`w-full bg-[#0d0d0d] border rounded-xl px-4 py-3.5 text-[14px] text-[#F5F0E8] placeholder:text-[#3a3530] focus:outline-none transition-colors ${errors.email ? 'border-[#FF4444]/50' : 'border-[#ffffff]/8 focus:border-[#C9A84C]/40'
                        }`}
                    />
                    {errors.email && <p className="font-mono text-[11px] text-[#FF4444] mt-1.5">{errors.email}</p>}
                  </div>
                </div>

                {/* Thema */}
                <div>
                  <label className="font-mono text-[11px] tracking-[0.12em] text-[#9A9590] uppercase block mb-2">
                    Thema *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TOPICS.map(t => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => update('topic', t.label)}
                        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-[13px] transition-all duration-150 ${form.topic === t.label
                            ? 'border-[#C9A84C]/50 bg-[#C9A84C]/10 text-[#C9A84C]'
                            : 'border-[#ffffff]/6 bg-[#0d0d0d] text-[#9A9590] hover:border-[#C9A84C]/20 hover:text-[#F5F0E8]'
                          }`}
                      >
                        <span className={form.topic === t.label ? 'text-[#C9A84C]' : 'text-[#5a5550]'}>
                          {t.icon}
                        </span>
                        {t.label}
                      </button>
                    ))}
                  </div>
                  {errors.topic && <p className="font-mono text-[11px] text-[#FF4444] mt-1.5">{errors.topic}</p>}
                </div>

                {/* Nachricht */}
                <div>
                  <label className="font-mono text-[11px] tracking-[0.12em] text-[#9A9590] uppercase block mb-2">
                    Nachricht *
                  </label>
                  <textarea
                    value={form.message}
                    onChange={e => update('message', e.target.value)}
                    placeholder="Beschreib dein Projekt, deine Frage oder was du im Kopf hast..."
                    rows={5}
                    className={`w-full bg-[#0d0d0d] border rounded-xl px-4 py-3.5 text-[14px] text-[#F5F0E8] placeholder:text-[#3a3530] focus:outline-none transition-colors resize-none ${errors.message ? 'border-[#FF4444]/50' : 'border-[#ffffff]/8 focus:border-[#C9A84C]/40'
                      }`}
                  />
                  <div className="flex items-center justify-between mt-1">
                    {errors.message
                      ? <p className="font-mono text-[11px] text-[#FF4444]">{errors.message}</p>
                      : <span />
                    }
                    <span className="font-mono text-[11px] text-[#3a3530]">{form.message.length} Zeichen</span>
                  </div>
                </div>

                {/* Error banner */}
                {status === 'error' && (
                  <div className="flex items-center gap-3 p-4 border border-[#FF4444]/25 rounded-xl bg-[#FF4444]/5">
                    <AlertCircle size={16} strokeWidth={1.5} className="text-[#FF4444] shrink-0" />
                    <p className="text-[13px] text-[#FF4444]">Etwas ist schiefgelaufen. Schreib mir direkt an hello@candlescope.de</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="relative overflow-hidden group flex items-center justify-center gap-2 text-[12px] tracking-[0.14em] uppercase border border-[#C9A84C]/40 text-[#C9A84C] px-8 py-4 rounded-full w-full sm:w-auto sm:self-start disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 group-hover:text-[#080808] transition-colors duration-300 flex items-center gap-2">
                    <Send size={14} strokeWidth={1.5} />
                    {status === 'sending' ? 'Wird gesendet...' : 'Nachricht senden'}
                  </span>
                  <span className="absolute inset-0 bg-[#C9A84C] rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                </button>

              </form>
            )}
          </div>

          {/* Rechte Spalte — Kontaktwege + Calendly */}
          <div className="flex flex-col gap-6">

            {/* Kontaktwege */}
            <div>
              <p className="font-mono text-[11px] tracking-[0.18em] text-[#9A9590] uppercase mb-4">── Direkt erreichen</p>
              <div className="flex flex-col gap-3">
                {CONTACTS.map((c, i) => (
                  <a
                    key={i}
                    href={c.href}
                    {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="group flex items-center gap-4 p-4 border border-[#ffffff]/6 rounded-xl bg-[#0d0d0d] hover:border-[#C9A84C]/25 hover:bg-[#C9A84C]/3 transition-all duration-200"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-[#ffffff]/6 flex items-center justify-center text-[#9A9590] group-hover:text-[#C9A84C] group-hover:border-[#C9A84C]/20 transition-all shrink-0">
                      {c.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-[#F5F0E8] group-hover:text-[#C9A84C] transition-colors">{c.title}</p>
                      <p className="font-mono text-[11px] text-[#9A9590] truncate">{c.value}</p>
                    </div>
                    {c.external && <ExternalLink size={13} strokeWidth={1.5} className="text-[#3a3530] group-hover:text-[#C9A84C]/50 transition-colors shrink-0 ml-auto" />}
                  </a>
                ))}
              </div>
            </div>

            {/* Calendly */}
            <div className="p-5 border border-[#C9A84C]/15 rounded-2xl bg-[#0d0d0d]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-[#C9A84C]/8 border border-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C]">
                  <Calendar size={16} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[14px] font-medium text-[#F5F0E8]">Termin buchen</p>
                  <p className="font-mono text-[11px] text-[#9A9590]">15 oder 30 Minuten</p>
                </div>
              </div>
              <p className="text-[13px] text-[#9A9590] leading-relaxed mb-4">
                Lieber direkt sprechen? Buch dir einen kostenlosen Slot.
              </p>
              {/* TODO: echten Calendly-Link eintragen */}
              <a
                href="https://calendly.com/schubertchris8/new-meeting"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 border border-[#C9A84C]/25 rounded-xl font-mono text-[12px] tracking-[0.1em] uppercase text-[#C9A84C]/70 hover:text-[#C9A84C] hover:border-[#C9A84C]/45 hover:bg-[#C9A84C]/5 transition-all"
              >
                <Calendar size={13} strokeWidth={1.5} />
                Kalender öffnen
              </a>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </>
  )
}