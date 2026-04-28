import { ShieldCheck, WarningCircle, ArrowLeft } from '@phosphor-icons/react'
import { Button } from '../../../shared/components/Button/Button'
import styles from './TwoFAVerify.module.scss'

interface Props {
  totpCode: string
  totpError: string | false
  isLoading: boolean
  onChange: (code: string) => void
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
}

export function TwoFAVerify({ totpCode, totpError, isLoading, onChange, onSubmit, onBack }: Props) {
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.hint}>
        <ShieldCheck size={18} weight="duotone" />
        <p>Gib den 6-stelligen Code aus deiner Authenticator-App ein.</p>
      </div>

      <input
        className={`${styles.input}${totpError ? ` ${styles.inputError}` : ''}`}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        placeholder="000000"
        value={totpCode}
        autoFocus
        autoComplete="one-time-code"
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
        onPaste={(e) => {
          e.preventDefault()
          const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6)
          onChange(pasted)
        }}
      />

      {totpError && (
        <span className={styles.error}>
          <WarningCircle size={13} weight="fill" />
          {totpError}
        </span>
      )}

      <Button
        type="submit"
        size="lg"
        loading={isLoading}
        disabled={isLoading || totpCode.length < 6}
        className={styles.submitBtn}
      >
        Bestätigen
      </Button>

      <button type="button" className={styles.back} onClick={onBack}>
        <ArrowLeft size={14} />
        Zurück zur Anmeldung
      </button>
    </form>
  )
}
