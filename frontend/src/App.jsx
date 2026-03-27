import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Orders from './pages/Orders'
import Checkout from './pages/Checkout'
import AddProduct from './pages/Admin/AddProduct'
import AdminDashboard from './pages/Admin/AdminDashboard'
import ManageOrders from './pages/Admin/ManageOrders'
import { AuthProvider } from './context/AuthContext'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import './App.css'
import { CartProvider } from './context/CartContext'
import Support from './pages/Support'
import AdminSupport from './pages/Admin/AdminSupport'
import Contact from './pages/Contact'
import ForgotPassword from './pages/Forgotpassword'
import ResetPassword from './pages/ResetPassword'

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
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password"    element={<ForgotPassword />} />         {/* ← new */}
            <Route path="/reset-password/:token" element={<ResetPassword />} />       {/* ← new */}
             <Route path="/contact" element={<Contact />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/add-product" element={<ProtectedRoute adminOnly={true}><AddProduct /></ProtectedRoute>} />
            <Route path="/products/edit/:id" element={<ProtectedRoute adminOnly={true}><AddProduct /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute adminOnly={true}><ManageOrders /></ProtectedRoute>} />
            <Route path="/support" element={<Support />} />
            <Route path="/admin/support" element={<ProtectedRoute adminOnly={true}><AdminSupport /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
