import { useEffect } from 'react'

declare global {
  interface Window {
    Calendly?: {
      initBadgeWidget: (opts: {
        url: string
        text: string
        color: string
        textColor: string
        branding: boolean
      }) => void
    }
  }
}

export default function CalendlyBadge() {
  useEffect(() => {
    const cssHref = 'https://assets.calendly.com/assets/external/widget.css'
    const scriptSrc = 'https://assets.calendly.com/assets/external/widget.js'

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = cssHref
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = scriptSrc
    script.async = true
    script.onload = () => {
      window.Calendly?.initBadgeWidget({
        url: 'https://calendly.com/schubertchris8/new-meeting?hide_event_type_details=1&hide_gdpr_banner=1',
        text: 'Termin vereinbaren',
        color: '#C9A84C',
        textColor: '#080808',
        branding: false,
      })
    }
    document.head.appendChild(script)

    return () => {
      try { document.head.removeChild(link) } catch (_) {}
      try { document.head.removeChild(script) } catch (_) {}
      document.querySelector('.calendly-badge-widget')?.remove()
    }
  }, [])

  return null
}
