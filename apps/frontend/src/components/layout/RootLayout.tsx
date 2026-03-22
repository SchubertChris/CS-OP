import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import ScrollToTop from '../scrollToTop'

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F0E8]">
      <ScrollToTop />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}