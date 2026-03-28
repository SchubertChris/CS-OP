import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import RootLayout from './components/layout/RootLayout'
import AdminGuard from './admin/AdminGuard'

/* ── Lazy imports ──────────────────────────────────── */
const AdminLayout = lazy(() => import('./admin/AdminLayout'))
const AdminLogin = lazy(() => import('./admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'))
const AdminSettings = lazy(() => import('./admin/AdminSettings'))
const PageList = lazy(() => import('./admin/PageList'))
const PageEditor = lazy(() => import('./admin/PageEditor'))
const NewPage = lazy(() => import('./admin/NewPage'))

const HomePage = lazy(() => import('./pages/HomePage'))
const FinancePage = lazy(() => import('./pages/FinancePage'))
const DevPage = lazy(() => import('./pages/DevPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const CommunityPage = lazy(() => import('./pages/CommunityPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const ImpressumPage = lazy(() => import('./pages/ImpressumPage'))
const DatenschutzPage = lazy(() => import('./pages/DatenschutzPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const DynamicPage = lazy(() => import('./pages/DynamicPage'))

/* ── Loading Fallback ──────────────────────────────── */
function PageLoader() {
  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-[#C9A84C]/20 border-t-[#C9A84C] animate-spin" />
        <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#5a5550]">Laden...</span>
      </div>
    </div>
  )
}

const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
)

export default function App() {
  return (
    <Routes>

      {/* ── Public Website ─────────────────────────────── */}
      <Route element={<RootLayout />}>
        <Route path="/" element={<S><HomePage /></S>} />
        <Route path="/finance" element={<S><FinancePage /></S>} />
        <Route path="/dev" element={<S><DevPage /></S>} />
        <Route path="/about" element={<S><AboutPage /></S>} />
        <Route path="/community" element={<S><CommunityPage /></S>} />
        <Route path="/contact" element={<S><ContactPage /></S>} />
        <Route path="/impressum" element={<S><ImpressumPage /></S>} />
        <Route path="/datenschutz" element={<S><DatenschutzPage /></S>} />
        <Route path="/404" element={<S><NotFoundPage /></S>} />
        <Route path="/:slug" element={<S><DynamicPage /></S>} />
      </Route>

      {/* ── 404 ────────────────────────────────────────── */}
      <Route path="*" element={<S><NotFoundPage /></S>} />

      {/* ── Admin Login ────────────────────────────────── */}
      <Route path="/admin/login" element={<S><AdminLogin /></S>} />

      {/* ── Admin Panel ────────────────────────────────── */}
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <S><AdminLayout /></S>
          </AdminGuard>
        }
      >
        <Route index element={<S><AdminDashboard /></S>} />
        <Route path="pages" element={<S><PageList /></S>} />
        <Route path="pages/new" element={<S><NewPage /></S>} />
        <Route path="pages/:id" element={<S><PageEditor /></S>} />
        <Route path="settings" element={<S><AdminSettings /></S>} />
      </Route>

    </Routes>
  )
}