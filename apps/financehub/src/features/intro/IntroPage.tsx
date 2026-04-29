import { useNavigate } from 'react-router-dom'
import { IntroAnimation } from './IntroAnimation'

export default function IntroPage() {
  const navigate = useNavigate()
  const isLight  = document.documentElement.classList.contains('theme-light')

  return (
    <IntroAnimation
      isLight={isLight}
      onComplete={() => navigate('/app/dashboard', { replace: true })}
    />
  )
}
