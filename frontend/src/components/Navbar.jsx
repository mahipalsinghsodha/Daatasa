// components/Navbar.jsx — Premium Frosted Glass Theme
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect, useRef } from 'react'
import { useCart } from '../context/CartContext'
import { AnimatePresence, motion } from 'framer-motion'
import ThemeToggle from './layout/ThemeToggle'
import { useNotificationStore } from '../store/notifications'
import {
  ShoppingCart, User, LogOut, Menu, X, Package,
  Heart, Bell, ChevronDown, Shield, Search, Sparkles
} from 'lucide-react'

const Navbar = () => {
  const { user, logout, hasPermission } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { cartCount } = useCart()
  const { unreadCount, toggleDrawer } = useNotificationStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const userMenuRef = useRef(null)
  const searchRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false); setSearchOpen(false) }, [location.pathname])

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { if (searchOpen) searchRef.current?.focus() }, [searchOpen])

  const handleLogout = () => { logout(); navigate('/') }
  const isActive = (path) => location.pathname === path
  const isCustomer = !user || (user.role !== 'admin' && user.role !== 'superadmin')
  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin')

  const navLinkCls = (path) => `
    relative px-3.5 py-1.5 text-[13.5px] font-semibold rounded-lg transition-all duration-200 group
    ${isActive(path) ? 'text-[var(--gold)]' : 'text-white/75 hover:text-white'}
  `

  const mobileLinkCls = (path) => `
    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
    ${isActive(path)
      ? 'text-[var(--gold)]'
      : 'text-white/70 hover:text-white'
    }
  `

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-400`}
      style={{
        background: scrolled
          ? 'rgba(27, 47, 110, 0.85)'
          : 'var(--bg-navy)',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.10)' : '1px solid transparent',
        boxShadow: scrolled ? '0 4px 30px rgba(27,47,110,0.40)' : 'none',
      }}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[68px]">

          {/* ── Logo ── */}
          <Link to={isAdmin ? '/admin' : '/'} className="flex items-center gap-2.5 shrink-0 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{
                background: 'var(--gold)',
                boxShadow: '0 4px 14px rgba(245,166,35,0.45)',
              }}
            >
              <span className="text-lg">🫙</span>
            </div>
            <span className="font-extrabold text-[18px] tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Dhani<span style={{ color: 'var(--gold)' }}>Fresh</span>
              {isAdmin && (
                <span className="ml-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-full"
                  style={{ background: 'var(--gold)', color: 'var(--navy)' }}>
                  {user.role === 'superadmin' ? 'Super' : 'Admin'}
                </span>
              )}
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-0.5">
            {isCustomer && (
              <>
                {[
                  { to: '/', label: 'Home' },
                  { to: '/products', label: 'Products' },
                  { to: '/about', label: 'About Us' },
                  { to: '/support', label: 'Support' },
                  { to: '/contact', label: 'Contact' },
                ].map(({ to, label }) => (
                  <Link key={to} to={to} className={navLinkCls(to)}>
                    {label}
                    {isActive(to) && (
                      <motion.span
                        layoutId="navActive"
                        className="absolute bottom-0 left-3.5 right-3.5 h-0.5 rounded-full"
                        style={{ background: 'var(--gold)' }}
                      />
                    )}
                  </Link>
                ))}
              </>
            )}
            {isAdmin && (
              <>
                {[
                  { to: '/admin', label: 'Dashboard' },
                  ...(hasPermission('products') ? [{ to: '/admin/products', label: 'Products' }] : []),
                  ...(hasPermission('orders') ? [{ to: '/admin/orders', label: 'Orders' }] : []),
                  ...(hasPermission('users') ? [{ to: '/admin/users', label: 'Users' }] : []),
                  { to: '/admin/analytics', label: 'Analytics' },
                ].map(({ to, label }) => (
                  <Link key={to} to={to} className={navLinkCls(to)}>
                    {label}
                    {isActive(to) && (
                      <motion.span
                        layoutId="navActiveAdmin"
                        className="absolute bottom-0 left-3.5 right-3.5 h-0.5 rounded-full"
                        style={{ background: 'var(--gold)' }}
                      />
                    )}
                  </Link>
                ))}
              </>
            )}
          </nav>

          {/* ── Desktop Actions ── */}
          <div className="hidden md:flex items-center gap-1.5">

            {/* Search */}
            <button
              onClick={() => setSearchOpen(v => !v)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all text-white/65 hover:text-white hover:bg-white/12"
              aria-label="Search" id="search-toggle"
            >
              <Search size={16} />
            </button>

            {/* Theme toggle */}
            <ThemeToggle />

            {user && (
              <>
                {/* Notifications */}
                <button
                  onClick={toggleDrawer}
                  className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all text-white/65 hover:text-white hover:bg-white/12"
                  aria-label="Notifications" id="notifications-btn"
                >
                  <Bell size={16} />
                  <AnimatePresence>
                    {unreadCount > 0 && (
                      <motion.span
                        key={unreadCount}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center"
                        style={{ background: 'var(--gold)', color: 'var(--navy)' }}
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>

                {/* Cart */}
                {isCustomer && (
                  <Link
                    to="/cart"
                    className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all text-white/65 hover:text-white hover:bg-white/12"
                    aria-label="Cart"
                  >
                    <ShoppingCart size={16} />
                    <AnimatePresence>
                      {cartCount > 0 && (
                        <motion.span
                          key={cartCount}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center"
                          style={{ background: 'var(--gold)', color: 'var(--navy)' }}
                        >
                          {cartCount > 99 ? '99+' : cartCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                )}

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full transition-all hover:bg-white/12"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold"
                      style={{ background: 'var(--gold)', color: 'var(--navy)' }}
                    >
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="text-[13px] font-semibold text-white max-w-[72px] truncate hidden lg:block">
                      {user.name?.split(' ')[0]}
                    </span>
                    <ChevronDown size={13} className={`text-white/45 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden z-50"
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-color)',
                          boxShadow: '0 20px 60px rgba(27,47,110,0.20), 0 4px 20px rgba(27,47,110,0.12)',
                        }}
                      >
                        <div className="px-4 py-3.5" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-alt)' }}>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0"
                              style={{ background: 'var(--brand-gradient)', color: 'white' }}>
                              {user.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                              <p className="text-[11px] truncate max-w-[140px]" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-1.5 space-y-0.5">
                          {[
                            { to: '/profile', icon: User, label: 'My Profile' },
                            ...(isCustomer ? [
                              { to: '/orders', icon: Package, label: 'My Orders' },
                              { to: '/wishlist', icon: Heart, label: 'Wishlist' },
                            ] : []),
                            ...(isAdmin ? [
                              { to: '/admin', icon: Shield, label: 'Admin Panel' },
                            ] : []),
                          ].map(item => (
                            <Link key={item.to} to={item.to}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all"
                              style={{ color: 'var(--text-secondary)' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-alt)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                            >
                              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-alt)' }}>
                                <item.icon size={13} style={{ color: 'var(--text-muted)' }} />
                              </div>
                              {item.label}
                            </Link>
                          ))}
                        </div>
                        <div className="p-1.5" style={{ borderTop: '1px solid var(--border-color)' }}>
                          <button onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-2.5 text-[13px] font-semibold rounded-xl transition-all"
                            style={{ color: 'var(--danger)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(229,62,62,0.07)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(229,62,62,0.08)' }}>
                              <LogOut size={13} />
                            </div>
                            Log out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {!user && (
              <>
                <Link to="/login" className="text-[13.5px] font-semibold text-white/75 hover:text-white px-3.5 py-1.5 rounded-lg hover:bg-white/12 transition-all">
                  Log in
                </Link>
                <Link to="/register"
                  className="text-[13.5px] font-bold px-5 py-2 rounded-lg transition-all hover:scale-105 flex items-center gap-1.5"
                  style={{ background: 'var(--gold)', color: 'var(--navy)', boxShadow: '0 4px 14px rgba(245,166,35,0.40)' }}
                >
                  <Sparkles size={13} />
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile Right ── */}
          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle size="sm" />
            {user && isCustomer && (
              <Link to="/cart" className="relative w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:bg-white/12 transition-all">
                <ShoppingCart size={17} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                    style={{ background: 'var(--gold)', color: 'var(--navy)' }}>
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:bg-white/12 transition-all"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileOpen ? 'x' : 'm'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                >
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* ── Search Expansion ── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 56, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
            style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}
          >
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex items-center gap-3 h-full">
              <Search size={16} style={{ color: 'rgba(255,255,255,0.45)' }} className="shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search products…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
                    setSearchOpen(false); setSearchQuery('')
                  }
                  if (e.key === 'Escape') setSearchOpen(false)
                }}
                className="flex-1 bg-transparent border-0 text-[14px] font-semibold placeholder:font-normal focus:outline-none"
                style={{ color: '#FFFFFF', caretColor: 'var(--gold)' }}
                id="global-search"
              />
              <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] rounded border text-white/35"
                style={{ borderColor: 'rgba(255,255,255,0.18)' }}>ESC</kbd>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-[68px] bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden absolute top-full left-0 right-0 z-50"
              style={{
                background: 'rgba(15, 22, 60, 0.97)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(255,255,255,0.10)',
                boxShadow: '0 20px 50px rgba(27,47,110,0.55)',
              }}
            >
              <div className="px-4 py-5 space-y-1">
                {user && (
                  <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-4"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0"
                      style={{ background: 'var(--gold)', color: 'var(--navy)' }}>
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-white">{user.name}</p>
                      <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.50)' }}>{user.email}</p>
                    </div>
                  </div>
                )}

                {isCustomer && (
                  <>
                    {[
                      { to: '/', label: 'Home' },
                      { to: '/products', label: 'Products' },
                      { to: '/about', label: 'About Us' },
                      { to: '/support', label: 'Support' },
                      { to: '/contact', label: 'Contact' },
                    ].map(({ to, label }, i) => (
                      <motion.div
                        key={to}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Link to={to} className={mobileLinkCls(to)}>
                          {isActive(to) && (
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--gold)' }} />
                          )}
                          {label}
                        </Link>
                      </motion.div>
                    ))}
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

                <div className="pt-4 mt-2 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}>
                  {user ? (
                    <>
                      <Link to="/profile" className={mobileLinkCls('/profile')}><User size={16} className="shrink-0" />Profile</Link>
                      {isCustomer && (
                        <>
                          <Link to="/orders" className={mobileLinkCls('/orders')}><Package size={16} className="shrink-0" />My Orders</Link>
                          <Link to="/wishlist" className={mobileLinkCls('/wishlist')}><Heart size={16} className="shrink-0" />Wishlist</Link>
                        </>
                      )}
                      <button onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all"
                        style={{ color: '#FC8181' }}>
                        <LogOut size={16} className="shrink-0" /> Log out
                      </button>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link to="/login" className="flex items-center justify-center h-11 rounded-xl border border-white/20 text-white font-semibold text-[13.5px] hover:bg-white/10 transition-all">
                        Log in
                      </Link>
                      <Link to="/register"
                        className="flex items-center justify-center h-11 rounded-xl font-bold text-[13.5px] transition-all hover:scale-[1.02] gap-1.5"
                        style={{ background: 'var(--gold)', color: 'var(--navy)', boxShadow: '0 4px 14px rgba(245,166,35,0.35)' }}>
                        <Sparkles size={13} /> Sign up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navbar