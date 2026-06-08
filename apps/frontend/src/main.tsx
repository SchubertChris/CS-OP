import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useLocation } from 'react-router-dom'
import './styles/index.css'
import App from './App'
import CalendlyBadge from './components/CalendlyBadge'

function ConditionalCalendly() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/admin') || pathname.startsWith('/analytics')) return null
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