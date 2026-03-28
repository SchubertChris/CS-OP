import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import RootLayout from './components/layout/RootLayout'
import AdminGuard from './admin/AdminGuard'

/* ── Admin — eager (nur geladen wenn /admin besucht) ── */
const AdminLayout = lazy(() => import('./admin/AdminLayout'))
const AdminLogin = lazy(() => import('./admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'))
const AdminSettings = lazy(() => import('./admin/AdminSettings'))
const PageList = lazy(() => import('./admin/PageList'))
const PageEditor = lazy(() => import('./admin/PageEditor'))
const NewPage = lazy(() => import('./admin/NewPage'))

/* ── Public Pages — lazy ───────────────────────────── */
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

export default function App() {
  return (
    <Routes>

      {/* ── Public Website ─────────────────────────────── */}
      <Route element={<RootLayout />}>
        <Suspense fallback={<PageLoader />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/dev" element={<DevPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/impressum" element={<ImpressumPage />} />
          <Route path="/datenschutz" element={<DatenschutzPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="/:slug" element={<DynamicPage />} />
        </Suspense>
      </Route>

      {/* ── 404 ────────────────────────────────────────── */}
      <Route path="*" element={
        <Suspense fallback={<PageLoader />}>
          <NotFoundPage />
        </Suspense>
      } />

      {/* ── Admin Login ────────────────────────────────── */}
      <Route path="/admin/login" element={
        <Suspense fallback={<PageLoader />}>
          <AdminLogin />
        </Suspense>
      } />

      {/* ── Admin Panel ────────────────────────────────── */}
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <Suspense fallback={<PageLoader />}>
              <AdminLayout />
            </Suspense>
          </AdminGuard>
        }
      >
        <Route index element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
        <Route path="pages" element={<Suspense fallback={<PageLoader />}><PageList /></Suspense>} />
        <Route path="pages/new" element={<Suspense fallback={<PageLoader />}><NewPage /></Suspense>} />
        <Route path="pages/:id" element={<Suspense fallback={<PageLoader />}><PageEditor /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<PageLoader />}><AdminSettings /></Suspense>} />
      </Route>

    </Routes>
  )
}