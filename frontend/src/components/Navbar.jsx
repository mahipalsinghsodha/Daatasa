import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi'
import { useState } from 'react'
import { useCart } from '../context/CartContext'

const Navbar = () => {
  const { user, logout, hasPermission } = useAuth()
  const navigate = useNavigate()
  const { cartCount } = useCart()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMobileMenuOpen(false)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const navLinkClass = "relative text-sm font-semibold text-gray-600 hover:text-primary-600 transition-colors py-2 group"
  const activeDotClass = "absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full scale-0 group-hover:scale-100 transition-transform"

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" onClick={closeMobileMenu}>
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-black shadow-md shadow-orange-200 group-hover:scale-105 transition-transform">
              G
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900 font-head">
              Ghee<span className="text-orange-600">Store</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {(!user || (user.role !== 'admin' && user.role !== 'superadmin')) && (
              <>
                <Link to="/" className={navLinkClass}>
                  Home
                  <div className={activeDotClass} />
                </Link>
                <Link to="/products" className={navLinkClass}>
                  Products
                  <div className={activeDotClass} />
                </Link>
                <Link to="/contact" className={navLinkClass}>
                  Support
                  <div className={activeDotClass} />
                </Link>
              </>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                {(!user || (user.role !== 'admin' && user.role !== 'superadmin')) && (
                  <Link to="/cart" className="relative p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition">
                    <FiShoppingCart size={20} />
                    {cartCount > 0 && (
                      <span className="absolute top-1 right-1 bg-orange-600 text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}

                {(user.role === 'admin' || user.role === 'superadmin') && (
                  <div className="flex items-center gap-2">
                    <Link to="/admin" className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition shadow-sm">
                      {user.role === 'superadmin' ? 'Super Admin' : 'Admin Panel'}
                    </Link>
                    {hasPermission('support') && (
                      <Link to="/admin/support" className="px-4 py-2 text-gray-600 text-xs font-bold hover:text-orange-600 transition">
                        Support
                      </Link>
                    )}
                  </div>
                )}

                <div className="h-6 w-[1px] bg-gray-200 mx-2" />

                <Link to="/profile" className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition">
                  <FiUser size={20} />
                </Link>
                
                <button onClick={handleLogout} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition">
                  <FiLogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-bold text-gray-700 hover:text-orange-600 transition">
                  Log in
                </Link>
                <Link to="/register" className="px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition shadow-md shadow-gray-200">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-3">
             {(!user || (user.role !== 'admin' && user.role !== 'superadmin')) && (
              <Link to="/cart" className="relative p-2 text-gray-600" onClick={closeMobileMenu}>
                <FiShoppingCart size={20} />
                {cartCount > 0 && <span className="absolute top-1 right-1 bg-orange-600 text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-white">{cartCount}</span>}
              </Link>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
            >
              {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-white border-t border-gray-100 overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-6 space-y-4">
          {(!user || (user.role !== 'admin' && user.role !== 'superadmin')) && (
            <div className="grid grid-cols-1 gap-2">
              <Link to="/" className="px-4 py-3 text-sm font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition" onClick={closeMobileMenu}>Home</Link>
              <Link to="/products" className="px-4 py-3 text-sm font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition" onClick={closeMobileMenu}>Products</Link>
              <Link to="/orders" className="px-4 py-3 text-sm font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition" onClick={closeMobileMenu}>My Orders</Link>
            </div>
          )}

          {user && (user.role === 'admin' || user.role === 'superadmin') && (
            <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Admin Dashboard</p>
              <Link to="/admin" className="block px-4 py-3 text-sm font-bold text-gray-900 hover:bg-white rounded-xl transition" onClick={closeMobileMenu}>Admin Center</Link>
              {hasPermission('support') && (
                <Link to="/admin/support" className="block px-4 py-3 text-sm font-bold text-gray-700 hover:bg-white rounded-xl transition" onClick={closeMobileMenu}>Support Tickets</Link>
              )}
            </div>
          )}

          <div className="h-[1px] bg-gray-100 my-4" />

          {user ? (
            <div className="space-y-2">
              <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition" onClick={closeMobileMenu}>
                <FiUser size={18} /> Profile Settings
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition">
                <FiLogOut size={18} /> Logout Account
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link to="/login" className="px-4 py-3 text-center text-sm font-bold text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50 transition" onClick={closeMobileMenu}>Login</Link>
              <Link to="/register" className="px-4 py-3 text-center text-sm font-bold text-white bg-orange-600 rounded-xl hover:bg-orange-700 shadow-md shadow-orange-100 transition" onClick={closeMobileMenu}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar