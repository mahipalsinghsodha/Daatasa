import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children, adminOnly = false, permission = null }) => {
  const { user, loading, hasPermission } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Admin and Super Admin can access adminOnly routes
  if (adminOnly && user.role !== 'admin' && user.role !== 'superadmin') {
    return <Navigate to="/" replace />
  }

  // Fine-grained permission check for specific pages
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/admin" replace />
  }

  return children
}

export default ProtectedRoute