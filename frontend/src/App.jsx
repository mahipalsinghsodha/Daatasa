import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'

// ─── Lazy Imports ─────────────────────────────────────────────────────────────
const Home            = lazy(() => import('./pages/Home'))
const Products        = lazy(() => import('./pages/Products'))
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

// Static Pages
const AboutUs         = lazy(() => import('./pages/AboutUs'))
const PrivacyPolicy   = lazy(() => import('./pages/PrivacyPolicy'))
const Terms           = lazy(() => import('./pages/Terms'))
const RefundPolicy    = lazy(() => import('./pages/RefundPolicy'))
const FAQ             = lazy(() => import('./pages/FAQ'))

// Admin pages
const AdminDashboard  = lazy(() => import('./pages/Admin/AdminDashboard'))
const AddProduct      = lazy(() => import('./pages/Admin/AddProduct'))
const ManageOrders    = lazy(() => import('./pages/Admin/ManageOrders'))
const AdminSupport    = lazy(() => import('./pages/Admin/AdminSupport'))
const AdminCoupons    = lazy(() => import('./pages/Admin/AdminCoupons'))
const AdminUsers      = lazy(() => import('./pages/Admin/AdminUsers'))
const AdminCategories = lazy(() => import('./pages/Admin/AdminCategories'))
const AdminProducts   = lazy(() => import('./pages/Admin/AdminProducts'))
const AdminManagement = lazy(() => import('./pages/Admin/AdminManagement'))
const AuditLogs       = lazy(() => import('./pages/Admin/AuditLogs'))
const AdminAnalytics  = lazy(() => import('./pages/Admin/AdminAnalytics'))

// ─── Guest-Only Route ─────────────────────────────────────────────────────────
function GuestRoute({ children }) {
  const { user } = useAuth()
  const location = useLocation()

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
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3" style={{ background: '#f8f9fa' }}>
      <div className="w-8 h-8 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      <p className="text-xs text-gray-400 font-medium">Loading...</p>
    </div>
  )
}

// ─── Catch-all 404 ───────────────────────────────────────────────────────────
function CatchAll() {
  const { user } = useAuth()
  return <Navigate to={user ? '/' : '/login'} replace />
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
            <Route path="/products/:id"           element={<ProductDetail />} />
            <Route path="/cart"                   element={<Cart />} />
            <Route path="/contact"                element={<Contact />} />
            <Route path="/support"                element={<Support />} />

            {/* ── Static ── */}
            <Route path="/about"                  element={<AboutUs />} />
            <Route path="/privacy-policy"         element={<PrivacyPolicy />} />
            <Route path="/terms"                  element={<Terms />} />
            <Route path="/refund-policy"          element={<RefundPolicy />} />
            <Route path="/faq"                    element={<FAQ />} />

            {/* ── Guest-Only ── */}
            <Route path="/login"                  element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register"               element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/forgot-password"        element={<GuestRoute><ForgotPassword /></GuestRoute>} />
            <Route path="/reset-password/:token"  element={<GuestRoute><ResetPassword /></GuestRoute>} />

            {/* ── Protected User ── */}
            <Route path="/profile"  element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/orders"   element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />

            {/* ── Admin ── */}
            <Route path="/admin"                  element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/add-product"      element={<ProtectedRoute adminOnly><AddProduct /></ProtectedRoute>} />
            <Route path="/admin/products"         element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/categories"       element={<ProtectedRoute adminOnly><AdminCategories /></ProtectedRoute>} />
            <Route path="/products/edit/:id"      element={<ProtectedRoute adminOnly><AddProduct /></ProtectedRoute>} />
            <Route path="/admin/orders"           element={<ProtectedRoute adminOnly><ManageOrders /></ProtectedRoute>} />
            <Route path="/admin/support"          element={<ProtectedRoute adminOnly><AdminSupport /></ProtectedRoute>} />
            <Route path="/admin/coupons"          element={<ProtectedRoute adminOnly><AdminCoupons /></ProtectedRoute>} />
            <Route path="/admin/users"            element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/analytics"        element={<ProtectedRoute adminOnly><AdminAnalytics /></ProtectedRoute>} />

            {/* ── Superadmin ── */}
            <Route path="/admin/manage-admins"    element={<ProtectedRoute adminOnly permission="superadmin_view"><AdminManagement /></ProtectedRoute>} />
            <Route path="/admin/audit-logs"       element={<ProtectedRoute adminOnly permission="superadmin_view"><AuditLogs /></ProtectedRoute>} />

            {/* ── 404 ── */}
            <Route path="*" element={<CatchAll />} />

          </Routes>
        </Suspense>
      </motion.main>
    </AnimatePresence>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          {/* CRITICAL: flex flex-col min-h-screen ensures footer always stays at bottom */}
          <div className="flex flex-col min-h-screen" style={{ background: '#f8f9fa' }}>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              closeOnClick
              pauseOnHover
              draggable
              theme="light"
              toastStyle={{ borderRadius: '12px', fontSize: '14px' }}
            />
            <ScrollToTop />
            <Navbar />
            <AnimatedRoutes />
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App