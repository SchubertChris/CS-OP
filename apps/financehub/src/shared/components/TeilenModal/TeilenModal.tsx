import { useState } from 'react'
import {
  X, ShareNetwork, DownloadSimple, CaretDown, CheckCircle,
  Copy, EnvelopeSimple, QrCode, Link, Lock, Globe, ArrowRight,
} from '@phosphor-icons/react'
import styles from './TeilenModal.module.scss'

type Access = 'private' | 'link' | 'public'

const ACCESS_OPTS: { key: Access; label: string; Icon: React.ElementType }[] = [
  { key: 'private', label: 'Nur ich',    Icon: Lock  },
  { key: 'link',    label: 'Mit Link',   Icon: Link  },
  { key: 'public',  label: 'Öffentlich', Icon: Globe },
]

interface TeilenModalProps {
  onClose:   () => void
  title?:    string
  fileType?: string
  fileSize?: string
  shareUrl?: string
}

export function TeilenModal({
  onClose,
  title    = 'Monatsbericht April 2026',
  fileType = 'PDF',
  fileSize = '142 KB',
  shareUrl = 'https://app.candlescope.de/share/apr26',
}: TeilenModalProps) {
  const [copied,     setCopied]     = useState(false)
  const [showQR,     setShowQR]     = useState(false)
  const [access,     setAccess]     = useState<Access>('link')
  const [accessOpen, setAccessOpen] = useState(false)

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const current = ACCESS_OPTS.find(o => o.key === access)!

  return (
    <div className={styles.modal}>

        <div className={styles.head}>
          <ShareNetwork size={15} style={{ color: 'var(--cs-text-3)' }} />
          <span className={styles.headTitle}>Teilen</span>
          <button className={styles.close} onClick={onClose}><X size={14} /></button>
        </div>

        <div className={styles.preview}>
          <div className={styles.previewIcon}><DownloadSimple size={16} /></div>
          <div className={styles.previewInfo}>
            <div className={styles.previewName}>{title}</div>
            <div className={styles.previewMeta}>{fileType} · {fileSize}</div>
          </div>
        </div>

        <div className={styles.accessWrap} onClick={e => e.stopPropagation()}>
          <span className={styles.accessLabel}>Zugriff</span>
          <div className={styles.accessSelect} onClick={() => setAccessOpen(o => !o)}>
            <current.Icon size={12} />
            <span>{current.label}</span>
            <CaretDown size={10} className={accessOpen ? styles.caretFlip : ''} />
            {accessOpen && (
              <div className={styles.accessDropdown}>
                {ACCESS_OPTS.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    className={`${styles.accessOpt} ${access === key ? styles.accessOptActive : ''}`}
                    onClick={e => { e.stopPropagation(); setAccess(key); setAccessOpen(false) }}
                  >
                    <Icon size={12} />{label}
                    {access === key && <CheckCircle size={12} className={styles.accessCheck} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.rows}>
          <div className={styles.row}>
            <div className={styles.rowLeft}>
              <div className={styles.rowIcon}><Link size={14} /></div>
              <div>
                <div className={styles.rowLabel}>Link kopieren</div>
                <div className={styles.rowSub}>{shareUrl.replace('https://', '')}</div>
              </div>
            </div>
            <button
              className={`${styles.btn} ${copied ? styles.btnDone : ''}`}
              onClick={copyLink}
            >
              {copied ? <><CheckCircle size={12} />Kopiert!</> : <><Copy size={12} />Kopieren</>}
            </button>
          </div>

          <div className={styles.row}>
            <div className={styles.rowLeft}>
              <div className={styles.rowIcon}><EnvelopeSimple size={14} /></div>
              <div>
                <div className={styles.rowLabel}>Per E-Mail senden</div>
                <div className={styles.rowSub}>Einladung verschicken</div>
              </div>
            </div>
            <button className={styles.btn}>
              <ArrowRight size={12} />Senden
            </button>
          </div>

          <div className={styles.row}>
            <div className={styles.rowLeft}>
              <div className={styles.rowIcon}><QrCode size={14} /></div>
              <div>
                <div className={styles.rowLabel}>QR-Code</div>
                <div className={styles.rowSub}>Zum Scannen teilen</div>
              </div>
            </div>
            <button
              className={`${styles.btn} ${showQR ? styles.btnActive : ''}`}
              onClick={() => setShowQR(o => !o)}
            >
              {showQR ? 'Ausblenden' : 'Anzeigen'}
            </button>
          </div>
        </div>

        {showQR && (
          <div className={styles.qrWrap}>
            <div className={styles.qrGrid}>
              {Array.from({ length: 49 }).map((_, i) => {
                const r = Math.floor(i / 7), c = i % 7
                const outer = r === 0 || r === 6 || c === 0 || c === 6
                const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4
                return <div key={i} className={`${styles.qrCell} ${outer || inner ? styles.qrFilled : ''}`} />
              })}
            </div>
            <div className={styles.qrLabel}>Scannen zum Öffnen</div>
          </div>
        )}

      </div>
  )
}
