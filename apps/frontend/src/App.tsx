import { Routes, Route } from 'react-router-dom'
import RootLayout from './components/layout/Rootlayout'

// Pages 
import HomePage       from './pages/HomePage'
import FinancePage    from './pages/FinancePage'
import DevPage        from './pages/DevPage'
import AboutPage      from './pages/AboutPage'
import CommunityPage  from './pages/CommunityPage'
import ContactPage    from './pages/ContactPage'
import AdminPage      from './pages/AdminPage'
import ImpressumPage  from './pages/ImpressumPage'
import DatenschutzPage from './pages/DatenschutzPage'
import NotFoundPage   from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/"           element={<HomePage />} />
        <Route path="/finance"    element={<FinancePage />} />
        <Route path="/dev"        element={<DevPage />} />
        <Route path="/about"      element={<AboutPage />} />
        <Route path="/community"  element={<CommunityPage />} />
        <Route path="/contact"    element={<ContactPage />} />
        <Route path="/admin"      element={<AdminPage />} />
        <Route path="/impressum"  element={<ImpressumPage />} />
        <Route path="/datenschutz" element={<DatenschutzPage />} />
        <Route path="*"           element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}