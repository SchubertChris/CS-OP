import { Routes, Route } from 'react-router-dom'
import RootLayout from './components/layout/RootLayout'
import AdminGuard from './admin/AdminGuard'
import AdminLayout from './admin/AdminLayout'
import AdminLogin from './admin/AdminLogin'
import AdminDashboard from './admin/AdminDashboard'
import AdminSettings from './admin/AdminSettings'
import PageList from './admin/PageList'
import PageEditor from './admin/PageEditor'
import NewPage from './admin/NewPage'

import HomePage from './pages/HomePage'
import FinancePage from './pages/FinancePage'
import DevPage from './pages/DevPage'
import AboutPage from './pages/AboutPage'
import CommunityPage from './pages/CommunityPage'
import ContactPage from './pages/ContactPage'
import ImpressumPage from './pages/ImpressumPage'
import DatenschutzPage from './pages/DatenschutzPage'
import NotFoundPage from './pages/NotFoundPage'
import DynamicPage from './pages/DynamicPage'

export default function App() {
  return (
    <Routes>

      {/* ── Public Website ─────────────────────────────── */}
      <Route element={<RootLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/dev" element={<DevPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/impressum" element={<ImpressumPage />} />
        <Route path="/datenschutz" element={<DatenschutzPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        {/* Dynamische Seiten aus dem Store (published=true) */}
        <Route path="/:slug" element={<DynamicPage />} />
      </Route>

      {/* ── 404 — kein Header/Footer, eigene Seite ─────── */}
      <Route path="*" element={<NotFoundPage />} />

      {/* ── Admin Login ────────────────────────────────── */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ── Admin Panel ────────────────────────────────── */}
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="pages" element={<PageList />} />
        <Route path="pages/new" element={<NewPage />} />
        <Route path="pages/:id" element={<PageEditor />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

    </Routes>
  )
}