import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX, FiArrowLeft
} from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'

const Navbar = () => {
  const { user, logout, hasPermission } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { cartCount } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path
  const isCustomer = !user || (user.role !== 'admin' && user.role !== 'superadmin')
  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin')

  const navLinkCls = (path) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-all ${
      isActive(path)
        ? 'bg-orange-50 text-orange-600 font-semibold'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`

  const mobileLinkCls = (path) =>
    `block px-4 py-3 text-sm font-medium rounded-lg transition-all ${
      isActive(path)
        ? 'bg-orange-50 text-orange-600 font-semibold'
        : 'text-gray-700 hover:bg-gray-50'
    }`

  return (
    <header className={`sticky top-0 z-50 w-full transition-shadow duration-200 bg-white border-b border-gray-100 ${scrolled ? 'shadow-sm' : ''}`}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to={isAdmin ? '/admin' : '/'} className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-sm">D</div>
            <span className="font-extrabold text-lg tracking-tight text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Dhani<span className="text-orange-500">Fresh</span>
              {isAdmin && (
                <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-600 rounded-full border border-orange-200">
                  {user.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                </span>
              )}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {isCustomer && (
              <>
                <Link to="/" className={navLinkCls('/')}>Home</Link>
                <Link to="/products" className={navLinkCls('/products')}>Products</Link>
                <Link to="/contact" className={navLinkCls('/contact')}>Support</Link>
              </>
            )}
            {isAdmin && (
              <>
                <Link to="/admin" className={navLinkCls('/admin')}>Dashboard</Link>
                {hasPermission('products') && <Link to="/admin/products" className={navLinkCls('/admin/products')}>Products</Link>}
                {hasPermission('orders') && <Link to="/admin/orders" className={navLinkCls('/admin/orders')}>Orders</Link>}
                {hasPermission('users') && <Link to="/admin/users" className={navLinkCls('/admin/users')}>Users</Link>}
                <Link to="/admin/analytics" className={navLinkCls('/admin/analytics')}>Analytics</Link>
              </>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-1.5">
            {user ? (
              <>
                {/* Cart for customers only */}
                {isCustomer && (
                  <Link to="/cart" className="relative p-2.5 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all">
                    <FiShoppingCart size={20} />
                    {cartCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Profile */}
                <Link to="/profile" className={`p-2.5 rounded-lg transition-all ${isActive('/profile') ? 'bg-orange-50 text-orange-500' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                  <FiUser size={20} />
                </Link>

                {/* Logout */}
                <button onClick={handleLogout} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Log out">
                  <FiLogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-all">Log in</Link>
                <Link to="/register" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-all">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="flex md:hidden items-center gap-1">
            {isCustomer && user && (
              <Link to="/cart" className="relative p-2 text-gray-500">
                <FiShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
            >
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-200 border-t border-gray-100 ${mobileOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="bg-white px-4 py-4 space-y-1">
          {isCustomer && (
            <>
              <Link to="/" className={mobileLinkCls('/')}>Home</Link>
              <Link to="/products" className={mobileLinkCls('/products')}>Products</Link>
              <Link to="/contact" className={mobileLinkCls('/contact')}>Support</Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link to="/admin" className={mobileLinkCls('/admin')}>Dashboard</Link>
              <Link to="/admin/products" className={mobileLinkCls('/admin/products')}>Products</Link>
              <Link to="/admin/orders" className={mobileLinkCls('/admin/orders')}>Orders</Link>
              <Link to="/admin/users" className={mobileLinkCls('/admin/users')}>Users</Link>
              <Link to="/admin/analytics" className={mobileLinkCls('/admin/analytics')}>Analytics</Link>
            </>
          )}

          <div className="pt-3 mt-2 border-t border-gray-100 space-y-1">
            {user ? (
              <>
                <Link to="/profile" className={mobileLinkCls('/profile') + ' flex items-center gap-3'}>
                  <FiUser size={16} /> Profile
                </Link>
                {isCustomer && (
                  <Link to="/orders" className={mobileLinkCls('/orders')}>My Orders</Link>
                )}
                <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg">
                  <FiLogOut size={16} /> Log out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" className="px-4 py-2.5 text-center text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">Log in</Link>
                <Link to="/register" className="px-4 py-2.5 text-center text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar