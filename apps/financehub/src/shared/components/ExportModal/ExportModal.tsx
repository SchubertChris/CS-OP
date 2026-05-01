import { useState } from 'react'
import { X, DownloadSimple, FolderOpen, ArrowRight, ArrowCounterClockwise } from '@phosphor-icons/react'
import styles from './ExportModal.module.scss'

const FORMATS = [
  { label: 'CSV',  desc: 'Kommagetrennte Tabelle', cls: 'csv'  },
  { label: 'PDF',  desc: 'Druckbares Dokument',    cls: 'pdf'  },
  { label: 'XLSX', desc: 'Excel-Tabelle',           cls: 'xlsx' },
] as const

interface ExportModalProps {
  onClose: () => void
  title?: string
}

export function ExportModal({ onClose, title = 'Transaktionen · April 2026' }: ExportModalProps) {
  const [downloading, setDownloading] = useState<string | null>(null)

  const start = (label: string) => {
    setDownloading(label)
    setTimeout(() => setDownloading(null), 1800)
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        <div className={styles.head}>
          <div className={styles.headInfo}>
            <div className={styles.headTitle}>Exportieren</div>
            <div className={styles.headSub}>{title}</div>
          </div>
          <button className={styles.close} onClick={onClose}><X size={14} /></button>
        </div>

        <div className={styles.formats}>
          {FORMATS.map(f => (
            <div
              key={f.label}
              className={`${styles.format} ${downloading === f.label ? styles.formatActive : ''}`}
              onClick={() => start(f.label)}
            >
              <div className={styles.fmtLeft}>
                <div className={`${styles.fmtIcon} ${styles[f.cls]}`}>{f.label}</div>
                <div>
                  <div className={styles.fmtName}>{f.label}</div>
                  <div className={styles.fmtDesc}>
                    {downloading === f.label ? 'Wird vorbereitet…' : f.desc}
                  </div>
                </div>
              </div>
              {downloading === f.label
                ? <ArrowCounterClockwise size={14} className={`${styles.dlIcon} ${styles.spin}`} />
                : <DownloadSimple size={14} className={styles.dlIcon} />
              }
            </div>
          ))}
        </div>

        <div className={styles.foot}>
          <button className={styles.archiveBtn}>
            <FolderOpen size={13} />Zum Archiv <ArrowRight size={11} />
          </button>
        </div>

      </div>
    </div>
  )
}
