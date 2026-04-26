import logoSrc from '@/assets/CandleScopeLogo.png'
import styles from './CandleScopeMarkImage.module.scss'

interface CandleScopeMarkImageProps {
  size?: number
  className?: string
}

export function CandleScopeMarkImage({ size = 48, className }: CandleScopeMarkImageProps) {
  return (
    <span
      className={[styles.mark, className].filter(Boolean).join(' ')}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <img src={logoSrc} alt="" className={styles.img} draggable={false} />
    </span>
  )
}
