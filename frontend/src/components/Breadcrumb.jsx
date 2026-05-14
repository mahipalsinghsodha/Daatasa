import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// Route map: path → breadcrumb label
const ROUTE_MAP = {
  // User pages
  '/products':      { label: 'Products', parent: '/' },
  '/cart':          { label: 'Cart', parent: '/' },
  '/checkout':      { label: 'Checkout', parent: '/cart' },
  '/orders':        { label: 'My Orders', parent: '/' },
  '/profile':       { label: 'My Profile', parent: '/' },
  '/support':       { label: 'Help Center', parent: '/' },
  '/contact':       { label: 'Contact Us', parent: '/' },
  '/about':         { label: 'About Us', parent: '/' },
  '/faq':           { label: 'FAQ', parent: '/' },
  '/privacy-policy':{ label: 'Privacy Policy', parent: '/' },
  '/terms':         { label: 'Terms & Conditions', parent: '/' },
  '/refund-policy': { label: 'Refund Policy', parent: '/' },
  // Admin pages
  '/admin':               { label: 'Dashboard', parent: null, admin: true },
  '/admin/products':      { label: 'Products', parent: '/admin', admin: true },
  '/admin/add-product':   { label: 'Add Product', parent: '/admin/products', admin: true },
  '/admin/orders':        { label: 'Orders', parent: '/admin', admin: true },
  '/admin/support':       { label: 'Support Tickets', parent: '/admin', admin: true },
  '/admin/users':         { label: 'Users', parent: '/admin', admin: true },
  '/admin/coupons':       { label: 'Coupons', parent: '/admin', admin: true },
  '/admin/analytics':     { label: 'Analytics', parent: '/admin', admin: true },
  '/admin/categories':    { label: 'Categories', parent: '/admin', admin: true },
  '/admin/manage-admins': { label: 'Manage Admins', parent: '/admin', admin: true },
  '/admin/audit-logs':    { label: 'Audit Logs', parent: '/admin', admin: true },
}

// Pages where breadcrumb should NOT show
const HIDDEN_ON = ['/', '/login', '/register', '/forgot-password']

function buildCrumbs(pathname) {
  const crumbs = []
  let current = pathname

  // Handle dynamic routes like /products/:id or /reset-password/:token
  const isProductDetail = /^\/products\/[^/]+$/.test(current)
  const isEditProduct   = /^\/products\/edit\/[^/]+$/.test(current)

  if (isProductDetail) {
    // Try to get real product name from page title (set by ProductDetail page)
    const pageTitle = document.title?.split(' – ')?.[0] || document.title?.split(' | ')?.[0] || 'Product Details'
    const productName = pageTitle !== 'DhaniFresh' ? pageTitle : 'Product Details'
    crumbs.unshift({ path: current, label: productName })
    crumbs.unshift({ path: '/products', label: 'Products' })
    crumbs.unshift({ path: '/', label: 'Home' })
    return crumbs
  }
  if (isEditProduct) {
    crumbs.unshift({ path: current, label: 'Edit Product' })
    crumbs.unshift({ path: '/admin/products', label: 'Products' })
    crumbs.unshift({ path: '/admin', label: 'Dashboard' })
    return crumbs
  }

  // Walk up via parent chain
  const visited = new Set()
  while (current && !visited.has(current)) {
    visited.add(current)
    const config = ROUTE_MAP[current]
    if (!config) break
    crumbs.unshift({ path: current, label: config.label })
    current = config.parent
  }

  // Always prepend Home
  const homeLabel = crumbs[0]?.path?.startsWith('/admin') ? 'Admin' : 'Home'
  const homePath  = crumbs[0]?.path?.startsWith('/admin') ? '/admin' : '/'

  if (crumbs.length > 0 && crumbs[0].path !== homePath) {
    crumbs.unshift({ path: homePath, label: homeLabel })
  }

  return crumbs
}

export default function Breadcrumb() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const pathname = location.pathname

  // Don't show on hidden pages
  if (HIDDEN_ON.includes(pathname)) return null
  if (pathname.startsWith('/reset-password')) return null

  const crumbs = buildCrumbs(pathname)
  if (crumbs.length < 2) return null  // No breadcrumb if only Home

  const isAdmin = pathname.startsWith('/admin')

  return (
    <div
      className="sticky top-16 z-40 border-b border-gray-100"
      style={{ background: isAdmin ? '#1a1a2e' : '#fff' }}
    >
      <div className={`${isAdmin ? 'max-w-full px-4 sm:px-6' : 'max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8'} py-2.5`}>
        <div className="flex items-center gap-3">

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all shrink-0 ${
              isAdmin
                ? 'text-gray-400 hover:text-white hover:bg-white/10'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">Back</span>
          </button>

          {/* Divider */}
          <div className={`w-px h-4 ${isAdmin ? 'bg-white/10' : 'bg-gray-200'}`} />

          {/* Breadcrumb trail */}
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar min-w-0">
            {crumbs.map((crumb, i) => {
              const isLast = i === crumbs.length - 1
              return (
                <div key={crumb.path} className="flex items-center gap-1 shrink-0">
                  {i > 0 && (
                    <ChevronRight
                      size={12}
                      className={isAdmin ? 'text-white/20' : 'text-gray-300'}
                    />
                  )}
                  {isLast ? (
                    <span className={`text-xs font-semibold ${isAdmin ? 'text-white' : 'text-gray-900'}`}>
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      to={crumb.path}
                      className={`text-xs font-medium transition-colors ${
                        isAdmin
                          ? 'text-white/50 hover:text-white'
                          : 'text-gray-400 hover:text-orange-500'
                      }`}
                    >
                      {crumb.label}
                    </Link>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
