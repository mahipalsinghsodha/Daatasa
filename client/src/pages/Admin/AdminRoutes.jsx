import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import BrandLoader from '../../components/BrandLoader';

const AdminDashboard = lazy(() => import('./AdminDashboard.jsx'));
const AddProduct = lazy(() => import('./AddProduct.jsx'));
const AdminProducts = lazy(() => import('./AdminProducts.jsx'));
const AdminCategories = lazy(() => import('./AdminCategories.jsx'));
const AdminInventory = lazy(() => import('./AdminInventory.jsx'));
const ManageOrders = lazy(() => import('./ManageOrders.jsx'));
const AdminReturns = lazy(() => import('./AdminReturns.jsx'));
const AdminSupport = lazy(() => import('./AdminSupport.jsx'));
const AdminNewsletters = lazy(() => import('./AdminNewsletters.jsx'));
const AdminSubscriptions = lazy(() => import('./AdminSubscriptions.jsx'));
const AdminCoupons = lazy(() => import('./AdminCoupons.jsx'));
const AdminUsers = lazy(() => import('./AdminUsers.jsx'));
const AdminAnalytics = lazy(() => import('./AdminAnalytics.jsx'));
const AdminSettings = lazy(() => import('./AdminSettings.jsx'));
const AdminMedia = lazy(() => import('./AdminMedia.jsx'));
const AdminProductImages = lazy(() => import('./AdminProductImages.jsx'));
const AdminReviews = lazy(() => import('./AdminReviews.jsx'));
const ManageBlogs = lazy(() => import('./ManageBlogs.jsx'));
const ManageB2B = lazy(() => import('./ManageB2B.jsx'));
const AdminManagement = lazy(() => import('./AdminManagement.jsx'));
const AdminSupportAgents = lazy(() => import('./AdminSupportAgents.jsx'));
const AuditLogs = lazy(() => import('./AuditLogs.jsx'));

function AdminLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] py-12" style={{ background: 'var(--bg-base)' }}>
      <BrandLoader mode="inline" size="lg" text="Loading Admin…" subtext="Accessing secure administrative panel" />
    </div>
  );
}

export default function AdminRoutes() {
  return (
    <Suspense fallback={<AdminLoader />}>
      <Routes>
        <Route index element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="add-product" element={<ProtectedRoute adminOnly><AddProduct /></ProtectedRoute>} />
        <Route path="products" element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>} />
        <Route path="categories" element={<ProtectedRoute adminOnly><AdminCategories /></ProtectedRoute>} />
        <Route path="inventory" element={<ProtectedRoute adminOnly><AdminInventory /></ProtectedRoute>} />
        <Route path="orders" element={<ProtectedRoute adminOnly><ManageOrders /></ProtectedRoute>} />
        <Route path="returns" element={<ProtectedRoute adminOnly><AdminReturns /></ProtectedRoute>} />
        <Route path="support" element={<ProtectedRoute adminOnly><AdminSupport /></ProtectedRoute>} />
        <Route path="newsletters" element={<ProtectedRoute adminOnly><AdminNewsletters /></ProtectedRoute>} />
        <Route path="subscriptions" element={<ProtectedRoute adminOnly><AdminSubscriptions /></ProtectedRoute>} />
        <Route path="coupons" element={<ProtectedRoute adminOnly><AdminCoupons /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
        <Route path="analytics" element={<ProtectedRoute adminOnly><AdminAnalytics /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />
        <Route path="media" element={<ProtectedRoute adminOnly><AdminMedia /></ProtectedRoute>} />
        <Route path="products/:id/images" element={<ProtectedRoute adminOnly><AdminProductImages /></ProtectedRoute>} />
        <Route path="reviews" element={<ProtectedRoute adminOnly><AdminReviews /></ProtectedRoute>} />
        <Route path="blogs" element={<ProtectedRoute adminOnly><ManageBlogs /></ProtectedRoute>} />
        <Route path="b2b" element={<ProtectedRoute adminOnly><ManageB2B /></ProtectedRoute>} />

        {/* Superadmin specific routes */}
        <Route path="manage-admins" element={<ProtectedRoute adminOnly permission="superadmin_view"><AdminManagement /></ProtectedRoute>} />
        <Route path="support-agents" element={<ProtectedRoute adminOnly permission="superadmin_view"><AdminSupportAgents /></ProtectedRoute>} />
        <Route path="audit-logs" element={<ProtectedRoute adminOnly permission="superadmin_view"><AuditLogs /></ProtectedRoute>} />

        {/* Fallback to /admin */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Suspense>
  );
}
