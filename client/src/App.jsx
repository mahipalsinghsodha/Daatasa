import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HelmetProvider } from 'react-helmet-async'
import Navbar from './components/Navbar'
import Breadcrumb from './components/Breadcrumb'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import WhatsAppButton from './components/WhatsAppButton'
import { useThemeStore } from './store/theme'
import NotificationDrawer from './components/NotificationDrawer'


// ─── Lazy Imports ─────────────────────────────────────────────────────────────
const Home            = lazy(() => import('./pages/Home'))
const Products        = lazy(() => import('./pages/Products'))
const SearchResults   = lazy(() => import('./pages/SearchResults'))
const ProductDetail   = lazy(() => import('./pages/ProductDetail'))
const Cart            = lazy(() => import('./pages/Cart'))
const Login           = lazy(() => import('./pages/Login'))
const Register        = lazy(() => import('./pages/Register'))
const ForgotPassword  = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword   = lazy(() => import('./pages/ResetPassword'))
const Contact         = lazy(() => import('./pages/Contact'))
const Profile         = lazy(() => import('./pages/Profile'))
const Orders          = lazy(() => import('./pages/Orders'))
const Checkout        = lazy(() => import('./pages/Checkout'))
const Support         = lazy(() => import('./pages/Support'))
const OrderDetail     = lazy(() => import('./pages/OrderDetail'))
const Wishlist        = lazy(() => import('./pages/Wishlist'))  // ✅ P1: Wishlist page
const NotFound        = lazy(() => import('./pages/NotFound'))

// Static Pages
const AboutUs         = lazy(() => import('./pages/AboutUs'))
const PrivacyPolicy   = lazy(() => import('./pages/PrivacyPolicy'))
const Terms           = lazy(() => import('./pages/Terms'))
const RefundPolicy    = lazy(() => import('./pages/RefundPolicy'))
const ShippingPolicy  = lazy(() => import('./pages/ShippingPolicy'))
const FAQ             = lazy(() => import('./pages/FAQ'))

const CheckoutSubscription = lazy(() => import('./pages/CheckoutSubscription'))

// Admin pages
const AdminDashboard  = lazy(() => import('./pages/Admin/AdminDashboard'))
const AddProduct      = lazy(() => import('./pages/Admin/AddProduct'))
const ManageOrders    = lazy(() => import('./pages/Admin/ManageOrders'))
const AdminReviews    = lazy(() => import('./pages/Admin/AdminReviews'))
const AdminSupport    = lazy(() => import('./pages/Admin/AdminSupport'))
const AdminCoupons    = lazy(() => import('./pages/Admin/AdminCoupons'))
const AdminUsers      = lazy(() => import('./pages/Admin/AdminUsers'))
const AdminCategories = lazy(() => import('./pages/Admin/AdminCategories'))
const AdminProducts   = lazy(() => import('./pages/Admin/AdminProducts'))
const AdminManagement = lazy(() => import('./pages/Admin/AdminManagement'))
const AuditLogs       = lazy(() => import('./pages/Admin/AuditLogs'))
const AdminAnalytics  = lazy(() => import('./pages/Admin/AdminAnalytics'))
const AdminSettings   = lazy(() => import('./pages/Admin/AdminSettings'))
const AdminNewsletters= lazy(() => import('./pages/Admin/AdminNewsletters'))
const AdminSubscriptions = lazy(() => import('./pages/Admin/AdminSubscriptions'))

// ─── Guest-Only Route ─────────────────────────────────────────────────────────
function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />

  if (user) {
    const isAdmin = user.role === 'admin' || user.role === 'superadmin'
    // Respect the intended destination set by navigate('/login', { state: { from } })
    const destination = location.state?.from || (isAdmin ? '/admin' : '/')
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

// ─── Page loading spinner ─────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4"
      style={{ background: 'var(--bg-base)' }}>
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full" style={{ border: '2px solid var(--border-color)' }} />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--brand-primary)] animate-spin" />
      </div>
      <p className="text-[12px] font-medium tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>Loading…</p>
    </div>
  )
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
            <Route path="/"                       element={<Home />} />
            <Route path="/products"               element={<Products />} />
            <Route path="/search"                 element={<SearchResults />} />
            <Route path="/products/:id"           element={<ProductDetail />} />
            <Route path="/cart"                   element={<Cart />} />
            <Route path="/checkout-subscription"  element={<ProtectedRoute><CheckoutSubscription /></ProtectedRoute>} />
            <Route path="/contact"                element={<Contact />} />

            {/* ── Static ── */}
            <Route path="/about"                  element={<AboutUs />} />
            <Route path="/privacy-policy"         element={<PrivacyPolicy />} />
            <Route path="/terms"                  element={<Terms />} />
            <Route path="/refund-policy"          element={<RefundPolicy />} />
            <Route path="/shipping-policy"        element={<ShippingPolicy />} />
            <Route path="/faq"                    element={<FAQ />} />

            {/* ── Guest-Only ── */}
            <Route path="/login"                  element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register"               element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/forgot-password"        element={<GuestRoute><ForgotPassword /></GuestRoute>} />
            <Route path="/reset-password/:token"  element={<GuestRoute><ResetPassword /></GuestRoute>} />

            {/* ── Protected User ── */}
            <Route path="/profile"  element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/orders"   element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} /> {/* ✅ P1 */}
            <Route path="/support"  element={<ProtectedRoute><Support /></ProtectedRoute>} />

            {/* ── Admin ── */}
            <Route path="/admin"                  element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/add-product"      element={<ProtectedRoute adminOnly><AddProduct /></ProtectedRoute>} />
            <Route path="/admin/products"         element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/categories"       element={<ProtectedRoute adminOnly><AdminCategories /></ProtectedRoute>} />
            <Route path="/products/edit/:id"      element={<ProtectedRoute adminOnly><AddProduct /></ProtectedRoute>} />
            <Route path="/admin/orders"           element={<ProtectedRoute adminOnly><ManageOrders /></ProtectedRoute>} />
            <Route path="/admin/support"          element={<ProtectedRoute adminOnly><AdminSupport /></ProtectedRoute>} />
            <Route path="/admin/newsletters"      element={<ProtectedRoute adminOnly><AdminNewsletters /></ProtectedRoute>} />
            <Route path="/admin/subscriptions"    element={<ProtectedRoute adminOnly><AdminSubscriptions /></ProtectedRoute>} />
            <Route path="/admin/coupons"          element={<ProtectedRoute adminOnly><AdminCoupons /></ProtectedRoute>} />
            <Route path="/admin/users"            element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/analytics"        element={<ProtectedRoute adminOnly><AdminAnalytics /></ProtectedRoute>} />
            <Route path="/admin/settings"          element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />
            <Route path="/admin/reviews"          element={<ProtectedRoute adminOnly><AdminReviews /></ProtectedRoute>} />

            {/* ── Superadmin ── */}
            <Route path="/admin/manage-admins"    element={<ProtectedRoute adminOnly permission="superadmin_view"><AdminManagement /></ProtectedRoute>} />
            <Route path="/admin/audit-logs"       element={<ProtectedRoute adminOnly permission="superadmin_view"><AuditLogs /></ProtectedRoute>} />

            {/* ── 404 ── */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </Suspense>
      </motion.main>
    </AnimatePresence>
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
        <AuthProvider>
          <CartProvider>
            <Router>
              <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg-base)' }}>
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
                <ScrollToTop />
                <Navbar />
                <Breadcrumb />
                <AnimatedRoutes />
                <Footer />
                <WhatsAppButton />
                <NotificationDrawer />
              </div>
            </Router>
          </CartProvider>
        </AuthProvider>
      </HelmetProvider>
    </ErrorBoundary>
  )
}

export default App