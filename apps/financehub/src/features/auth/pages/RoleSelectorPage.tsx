import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SquaresFour, Shield, ArrowLeft } from '@phosphor-icons/react'
import { useAuthStore } from '../../../store/authStore'
import { CandleScopeMarkImage } from '../../../shared/components/Logo/CandleScopeMarkImage'
import { PageBackground } from '../../../shared/components/Background'
import styles from './RoleSelectorPage.module.scss'

const ADMIN_URL = import.meta.env.VITE_ADMIN_URL ?? 'https://candlescope.de/cs-backstage'

const CARD_VARIANTS = {
  initial: { opacity: 0, y: 20, filter: 'blur(6px)' },
  animate: (i: number) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.45, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

export default function RoleSelectorPage() {
  const navigate     = useNavigate()
  const user         = useAuthStore((s) => s.user)
  const selectRole   = useAuthStore((s) => s.selectRole)

  if (!user) return null

  return (
    <div className={styles.page}>
      <PageBackground />
      <div className={styles.pageInner}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 28, scale: 0.96, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0,  scale: 1,    filter: 'blur(0px)' }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.header}>
          <CandleScopeMarkImage size={56} />
          <span className={styles.greeting}>Willkommen, {user.displayName}</span>
          <span className={styles.sub}>Wohin möchtest du?</span>
        </div>

        <div className={styles.options}>
          <motion.button
            custom={0}
            variants={CARD_VARIANTS}
            initial="initial"
            animate="animate"
            className={styles.option}
            onClick={() => { selectRole(); navigate('/intro', { replace: true }) }}
          >
            <span className={styles.optionIcon}>
              <SquaresFour size={28} weight="duotone" />
            </span>
            <span className={styles.optionLabel}>FinanzHub</span>
            <span className={styles.optionDesc}>Zur persönlichen Finanzübersicht</span>
          </motion.button>

          <motion.a
            custom={1}
            variants={CARD_VARIANTS}
            initial="initial"
            animate="animate"
            className={`${styles.option} ${styles.optionAdmin}`}
            href={ADMIN_URL}
          >
            <span className={styles.optionIcon}>
              <Shield size={28} weight="duotone" />
            </span>
            <span className={styles.optionLabel}>Admin Panel</span>
            <span className={styles.optionDesc}>Website verwalten · CMS · Einstellungen</span>
          </motion.a>
        </div>
      </motion.div>

      <a href="https://candlescope.de" className={styles.backToSite}>
        <ArrowLeft size={12} />
        Zurück zur Website
      </a>
      </div>
    </div>
  )
}
