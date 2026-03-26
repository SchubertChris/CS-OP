/* ============================================================
   CandleScope — Root Layout
   src/components/layout/RootLayout.tsx
   ============================================================ */

import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import BackgroundEffect from '../ui/BackgroundEffect'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F0E8] flex flex-col relative">

      {/* Globaler Hintergrund-Effekt */}
      <BackgroundEffect />

      <ScrollToTop />
      <Header />

      <main className="flex-1 relative z-10">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}