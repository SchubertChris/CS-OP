import styles from './Avatar.module.scss'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type AvatarStatus = 'online' | 'offline' | 'away'

interface AvatarProps {
  src?: string
  name?: string
  size?: AvatarSize
  shape?: 'circle' | 'rounded'
  status?: AvatarStatus
  className?: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function getColorIndex(name: string): number {
  let hash = 0
  for (const c of name) hash = ((hash * 31) + c.charCodeAt(0)) & 0x7fffffff
  return hash % 6
}

export function Avatar({ src, name = '', size = 'md', shape = 'circle', status, className }: AvatarProps) {
  return (
    <div className={[styles.avatar, styles[size], styles[shape], className].filter(Boolean).join(' ')}>
      {src ? (
        <img src={src} alt={name} className={styles.img} loading="lazy" />
      ) : (
        <span className={[styles.initials, styles[`color${getColorIndex(name)}`]].join(' ')}>
          {getInitials(name) || '?'}
        </span>
      )}
      {status && <span className={[styles.status, styles[status]].join(' ')} aria-label={status} />}
    </div>
  )
}
