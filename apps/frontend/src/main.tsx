import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useLocation } from 'react-router-dom'
import './styles/index.css'
import App from './App'
import CalendlyBadge from './components/CalendlyBadge'

function ConditionalCalendly() {
  const { pathname } = useLocation()
  // Calendly-Badge erst NACH der Entrance-Animation einblenden
  const [introDone, setIntroDone] = useState(
    () => sessionStorage.getItem('cs_intro_seen') === '1' || navigator.webdriver
  )

  useEffect(() => {
    if (introDone) return
    const onDone = () => setIntroDone(true)
    window.addEventListener('cs:intro-done', onDone)
    return () => window.removeEventListener('cs:intro-done', onDone)
  }, [introDone])

  if (pathname.startsWith('/admin') || pathname.startsWith('/analytics')) return null
  if (!introDone) return null
  return <CalendlyBadge />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <ConditionalCalendly />
    </BrowserRouter>
  </StrictMode>
)