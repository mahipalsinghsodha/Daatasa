import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { lazy, Suspense, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HelmetProvider } from 'react-helmet-async'
import Navbar from './components/Navbar'
import Breadcrumb from './components/Breadcrumb'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import { AuthProvider, useAuth } from './context/AuthContext'
import PromoPopup from './components/PromoPopup'
import { CartProvider } from './context/CartContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import WhatsAppButton from './components/WhatsAppButton'
import { useThemeStore } from './store/theme'
import NotificationDrawer from './components/NotificationDrawer'
import api from './api/axios'
import { ConfirmProvider } from './context/ConfirmContext'
import SupportPopup from './components/chat/SupportPopup'
import { useSupportStore } from './store/support'
import BrandLoader from './components/BrandLoader'
import Home from './pages/Home'

const IncomingChatModal = lazy(() => import('./components/chat/IncomingChatModal'))

// ─── Lazy Imports ─────────────────────────────────────────────────────────────
const Products = lazy(() => import('./pages/Products'))
const SearchResults = lazy(() => import('./pages/SearchResults'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Category = lazy(() => import('./pages/Category'))   // ✅ P1: Category Landing page

const ChangePassword = lazy(() => import('./pages/ChangePassword')) // ✅ P1: Change Password page
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Contact = lazy(() => import('./pages/Contact'))
const Profile = lazy(() => import('./pages/Profile'))
const Addresses = lazy(() => import('./pages/Addresses')) // ✅ P1: Address Book page
const Orders = lazy(() => import('./pages/Orders'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderDetail = lazy(() => import('./pages/OrderDetail'))
const ReturnRequest = lazy(() => import('./pages/ReturnRequest')) // ✅ P1: Return Request page
const Wishlist = lazy(() => import('./pages/Wishlist'))  // ✅ P1: Wishlist page
const NotFound = lazy(() => import('./pages/NotFound'))
const ComingSoon = lazy(() => import('./pages/ComingSoon'))
const Maintenance = lazy(() => import('./pages/Maintenance'))

// Static Pages
const AboutUs = lazy(() => import('./pages/AboutUs'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const Terms = lazy(() => import('./pages/Terms'))
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'))
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'))
const FAQ = lazy(() => import('./pages/FAQ'))
const Disclaimer = lazy(() => import('./pages/Disclaimer'))
const HowItWorks = lazy(() => import('./pages/HowItWorks'))

const CheckoutSubscription = lazy(() => import('./pages/CheckoutSubscription'))
const B2B = lazy(() => import('./pages/B2B'))
const Blogs = lazy(() => import('./pages/Blogs'))
const BlogDetail = lazy(() => import('./pages/BlogDetail'))
const GiftCards = lazy(() => import('./pages/GiftCards'))

// Support Admin pages
const SupportDashboard = lazy(() => import('./pages/Admin/SupportDashboard.jsx'))

// Modular Admin Routes (Lazy-loaded as a single chunk ONLY when an admin visits /admin/*)
const AdminRoutes = lazy(() => import('./pages/Admin/AdminRoutes.jsx'))

// ─── Guest-Only Route ─────────────────────────────────────────────────────────
function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />

  if (user) {
    const isAdmin = user.role === 'admin' || user.role === 'superadmin'
    const isSupport = user.role === 'support'
    
    let destination = location.state?.from
    if (!destination && !isAdmin && !isSupport) {
      try {
        destination = sessionStorage.getItem('auth_redirect')
      } catch {}
    }
    destination = destination || (isAdmin ? '/admin' : isSupport ? '/support-panel' : '/')
    return <Navigate to={destination} replace />
  }
  return children
}

// ─── Scroll to top on route change ───────────────────────────────────────────
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

// ─── Site Status Interceptor (Non-blocking for instant initial render) ────────
function SiteStatusWrapper({ children }) {
  const { user } = useAuth()
  const [settings, setSettings] = useState(() => {
    try {
      const cached = sessionStorage.getItem('site_settings')
      return cached ? JSON.parse(cached) : { isMaintenanceMode: false, isComingSoon: false }
    } catch {
      return { isMaintenanceMode: false, isComingSoon: false }
    }
  })
  const location = useLocation()

  useEffect(() => {
    api.get('/api/settings')
      .then(res => {
        if (res.data) {
          setSettings(res.data)
          try { sessionStorage.setItem('site_settings', JSON.stringify(res.data)) } catch {}
        }
      })
      .catch(() => {})
  }, [])

  const isAdmin = ['admin', 'superadmin', 'support'].includes(user?.role)

  if (!isAdmin && settings) {
    if (settings.isMaintenanceMode) {
      return (
        <Suspense fallback={<PageLoader />}>
          <Maintenance />
        </Suspense>
      );
    }
    if (settings.isComingSoon) {
      let isLaunchPast = false;
      if (settings.comingSoonLaunchDate) {
        isLaunchPast = new Date(settings.comingSoonLaunchDate).getTime() < Date.now();
      }
      if (!isLaunchPast) {
        if (location.pathname !== '/' && location.pathname !== '/login' && !location.pathname.startsWith('/admin')) {
          return <Navigate to="/" replace />;
        }
        return (
          <Suspense fallback={<PageLoader />}>
            <ComingSoon launchDate={settings.comingSoonLaunchDate} />
          </Suspense>
        );
      }
    }
  }

  return children
}

// ─── Page loading spinner ─────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] py-16"
      style={{ background: 'var(--bg-base)' }}>
      <BrandLoader mode="inline" size="lg" text="Loading…" subtext="Crafting your pure Vedic experience" />
    </div>
  )
}

function SupportRedirect() {
  const { user } = useAuth()
  const openSupport = useSupportStore(state => state.openSupport)
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')

  useEffect(() => {
    if (user?.role !== 'support') {
      openSupport(orderId ? { _id: orderId } : null)
    }
  }, [openSupport, orderId, user?.role])

  if (user?.role === 'support') {
    return <Navigate to="/support-panel" replace />
  }

  return <Navigate to="/orders" replace />
}

// ─── Animated page transitions ────────────────────────────────────────────────
function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: 'easeInOut' }}
        className="flex-1"
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location} key={location.pathname}>

            {/* ── Public ── */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/category/:slug" element={<Category />} /> {/* ✅ P1 */}

            <Route path="/search" element={<SearchResults />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout-subscription" element={<ProtectedRoute><CheckoutSubscription /></ProtectedRoute>} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/b2b" element={<B2B />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/gift-cards" element={<GiftCards />} />

            {/* ── Static ── */}
            <Route path="/about" element={<AboutUs />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/shipping-policy" element={<ShippingPolicy />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/how-it-works" element={<HowItWorks />} />

            {/* ── Guest-Only ── */}
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
            <Route path="/reset-password/:token" element={<GuestRoute><ResetPassword /></GuestRoute>} />

            {/* ── Protected User ── */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} /> {/* ✅ P1 */}
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
            <Route path="/orders/:id/return" element={<ProtectedRoute><ReturnRequest /></ProtectedRoute>} /> {/* ✅ P1 */}
            <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} /> {/* ✅ P1 */}
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} /> {/* ✅ P1 */}
            <Route path="/support" element={<ProtectedRoute><SupportRedirect /></ProtectedRoute>} />

            {/* ── Admin (Encapsulated into AdminRoutes) ── */}
            <Route path="/admin/*" element={
              <ProtectedRoute adminOnly>
                <AdminRoutes />
              </ProtectedRoute>
            } />
            <Route path="/products/edit/:id" element={<Navigate to="/admin/products" replace />} />

            {/* ── Support ── */}
            <Route path="/support-panel" element={<ProtectedRoute supportAccess><SupportDashboard /></ProtectedRoute>} />
            <Route path="/support-dashboard" element={<Navigate to="/support-panel" replace />} />
            <Route path="/support-agent" element={<Navigate to="/support-panel" replace />} />

            {/* ── 404 ── */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </Suspense>
      </motion.main>
    </AnimatePresence>
  )
}


function GlobalStaffIncomingChat() {
  const { user, hasPermission } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isStaff = user && (
    ['admin', 'superadmin', 'support'].includes(user.role) ||
    (Array.isArray(user.permissions) && (user.permissions.includes('support') || user.permissions.includes('all'))) ||
    (typeof hasPermission === 'function' && hasPermission('support'))
  )

  if (!isStaff) return null

  return (
    <Suspense fallback={null}>
      <IncomingChatModal
        onAcceptChat={(sessionId) => {
          window.dispatchEvent(new CustomEvent('support:incoming_accepted', { detail: { sessionId } }))
          if (location.pathname !== '/support-panel' && location.pathname !== '/admin/support') {
            navigate('/support-panel', { state: { autoSelectSessionId: sessionId } })
          }
        }}
      />
    </Suspense>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const { initTheme } = useThemeStore()

  // Sync theme class with stored state on mount
  useEffect(() => { initTheme() }, [])

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ConfirmProvider>
          <AuthProvider>
            <CartProvider>
              <Router>
                <div className="flex flex-col min-h-screen overflow-x-hidden" style={{ background: 'var(--bg-base)' }}>
                  <ToastContainer
                    position="bottom-center"
                    autoClose={4000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    pauseOnHover
                    draggable
                    theme="light"
                    limit={3}
                    toastStyle={{
                      borderRadius: '12px',
                      fontSize: '13.5px',
                      fontWeight: 500,
                      background: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <SiteStatusWrapper>
                    <PromoPopup />
                    <ScrollToTop />
                    <Navbar />
                    <Breadcrumb />
                    <AnimatedRoutes />
                    <Footer />
                    <WhatsAppButton />
                    <NotificationDrawer />
                    <SupportPopup />
                    <GlobalStaffIncomingChat />
                  </SiteStatusWrapper>
                </div>
              </Router>
            </CartProvider>
          </AuthProvider>
        </ConfirmProvider>
      </HelmetProvider>
    </ErrorBoundary>
  )
}

export default App