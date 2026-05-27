import { useEffect, useState } from 'react'
import styles from './SiteImagesPage.module.scss'

interface SiteImage {
  key: string
  url: string
  label: string
  updated_at: string
}

export default function SiteImagesPage() {
  const [images, setImages]     = useState<SiteImage[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [editing, setEditing]   = useState<string | null>(null)
  const [draftUrl, setDraftUrl] = useState('')
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState<string | null>(null)

  // ── Bilder laden ───────────────────────────────────────────────────────
  async function load() {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch('/api/admin/images', { credentials: 'include' })
      if (!r.ok) {
        if (r.status === 404) {
          // Tabelle noch nicht erstellt → Seed auslösen
          await fetch('/api/admin/images?action=seed', { method: 'POST', credentials: 'include' })
          return load()
        }
        throw new Error(`HTTP ${r.status}`)
      }
      const data = await r.json()
      setImages(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Laden')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // ── URL speichern ──────────────────────────────────────────────────────
  async function save(key: string) {
    if (!draftUrl.trim()) return
    setSaving(true)
    try {
      const r = await fetch('/api/admin/images', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, url: draftUrl.trim() }),
      })
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        throw new Error(j.error ?? `HTTP ${r.status}`)
      }
      const updated = await r.json()
      setImages(prev => prev.map(img => img.key === key ? { ...img, url: updated.url, updated_at: updated.updated_at } : img))
      showToast('✓ Gespeichert')
      setEditing(null)
    } catch (e) {
      showToast(`Fehler: ${e instanceof Error ? e.message : 'Unbekannt'}`)
    } finally {
      setSaving(false)
    }
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function startEdit(img: SiteImage) {
    setEditing(img.key)
    setDraftUrl(img.url)
  }

  function cancelEdit() {
    setEditing(null)
    setDraftUrl('')
  }

  // ── Seed-Button: Tabelle erstellen + befüllen ──────────────────────────
  async function runSeed() {
    setSaving(true)
    try {
      const r = await fetch('/api/admin/images?action=seed', { method: 'POST', credentials: 'include' })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      showToast('✓ Tabelle erstellt und befüllt')
      await load()
    } catch (e) {
      showToast(`Fehler: ${e instanceof Error ? e.message : 'Unbekannt'}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* Toast */}
      {toast && <div className={styles.toast}>{toast}</div>}

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Website-Bilder</h1>
          <p className={styles.subtitle}>
            Bilder der Candlescope-Website verwalten. URL einfach ersetzen — kein Redeploy nötig.
          </p>
        </div>
        <button className={styles.seedBtn} onClick={runSeed} disabled={saving}>
          Seed / Reset
        </button>
      </div>

      {loading && <p className={styles.state}>Lade…</p>}
      {error   && (
        <div className={styles.errorBox}>
          <p>{error}</p>
          <button onClick={load} className={styles.retryBtn}>Neu laden</button>
          <button onClick={runSeed} className={styles.retryBtn} style={{ marginLeft: 8 }}>
            Tabelle erstellen
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className={styles.grid}>
          {images.map(img => (
            <div key={img.key} className={styles.card}>
              {/* Vorschaubild */}
              <div className={styles.preview}>
                <img
                  src={img.url}
                  alt={img.label}
                  onError={e => { (e.target as HTMLImageElement).style.opacity = '0.2' }}
                />
              </div>

              {/* Info */}
              <div className={styles.info}>
                <span className={styles.label}>{img.label}</span>
                <code className={styles.key}>{img.key}</code>
                <span className={styles.meta}>
                  Zuletzt geändert: {new Date(img.updated_at).toLocaleDateString('de-DE')}
                </span>
              </div>

              {/* Edit-Bereich */}
              {editing === img.key ? (
                <div className={styles.editRow}>
                  <input
                    className={styles.urlInput}
                    value={draftUrl}
                    onChange={e => setDraftUrl(e.target.value)}
                    placeholder="https://... oder /images/..."
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') save(img.key)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                  />
                  <div className={styles.editActions}>
                    <button className={styles.saveBtn} onClick={() => save(img.key)} disabled={saving}>
                      {saving ? '…' : 'Speichern'}
                    </button>
                    <button className={styles.cancelBtn} onClick={cancelEdit}>
                      Abbrechen
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.urlRow}>
                  <span className={styles.currentUrl} title={img.url}>{img.url}</span>
                  <button className={styles.editBtn} onClick={() => startEdit(img)}>
                    Bearbeiten
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
