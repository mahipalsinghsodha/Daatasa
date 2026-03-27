import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'

// ─── Lazy Imports ────────────────────────────────────────────────────────────
const Home           = lazy(() => import('./pages/Home'))
const Products       = lazy(() => import('./pages/Products'))
const ProductDetail  = lazy(() => import('./pages/ProductDetail'))
const Cart           = lazy(() => import('./pages/Cart'))
const Login          = lazy(() => import('./pages/Login'))
const Register       = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/Forgotpassword'))
const ResetPassword  = lazy(() => import('./pages/ResetPassword'))
const Contact        = lazy(() => import('./pages/Contact'))
const Profile        = lazy(() => import('./pages/Profile'))
const Orders         = lazy(() => import('./pages/Orders'))
const Checkout       = lazy(() => import('./pages/Checkout'))
const Support        = lazy(() => import('./pages/Support'))

// Admin pages — loaded only when accessed
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'))
const AddProduct     = lazy(() => import('./pages/Admin/AddProduct'))
const ManageOrders   = lazy(() => import('./pages/Admin/ManageOrders'))
const AdminSupport   = lazy(() => import('./pages/Admin/AdminSupport'))

// ─── Guest-Only Route (redirect away if already logged in) ───────────────────
// Covers /login, /register, /forgot-password, /reset-password
function GuestRoute({ children }) {
  const { user } = useAuth()
  if (user) {
    // Logged-in admins go to /admin, regular users go to /
    return <Navigate to={user.isAdmin ? '/admin' : '/'} replace />
  }
  return children
}

// ─── Fallback UI while lazy chunk loads ──────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ─── Wildcard: * → Home if logged in, Login if not ───────────────────────────
function CatchAll() {
  const { user } = useAuth()
  return <Navigate to={user ? '/' : '/login'} replace />
}

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              closeOnClick
              pauseOnHover
              draggable
              theme="light"
            />
            <Navbar />

            {/* Suspense wraps ALL routes — shows spinner during any lazy load */}
            <Suspense fallback={<PageLoader />}>
              <Routes>

                {/* ── Public Routes ── */}
                <Route path="/"                    element={<Home />} />
                <Route path="/products"            element={<Products />} />
                <Route path="/products/:id"        element={<ProductDetail />} />
                <Route path="/cart"                element={<Cart />} />
                <Route path="/contact"             element={<Contact />} />
                <Route path="/support"             element={<Support />} />

                {/* ── Guest-Only Routes (redirect if logged in) ── */}
                <Route path="/login"               element={<GuestRoute><Login /></GuestRoute>} />
                <Route path="/register"            element={<GuestRoute><Register /></GuestRoute>} />
                <Route path="/forgot-password"     element={<GuestRoute><ForgotPassword /></GuestRoute>} />
                <Route path="/reset-password/:token" element={<GuestRoute><ResetPassword /></GuestRoute>} />

                {/* ── Protected User Routes ── */}
                <Route path="/profile"  element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/orders"   element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />

                {/* ── Protected Admin Routes ── */}
                <Route path="/admin"               element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/add-product"   element={<ProtectedRoute adminOnly><AddProduct /></ProtectedRoute>} />
                <Route path="/products/edit/:id"   element={<ProtectedRoute adminOnly><AddProduct /></ProtectedRoute>} />
                <Route path="/admin/orders"        element={<ProtectedRoute adminOnly><ManageOrders /></ProtectedRoute>} />
                <Route path="/admin/support"       element={<ProtectedRoute adminOnly><AdminSupport /></ProtectedRoute>} />

                {/* ── 404 Catch-All ── */}
                <Route path="*" element={<CatchAll />} />

              </Routes>
            </Suspense>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App