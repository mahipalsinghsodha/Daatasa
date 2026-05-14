import { Component } from 'react'
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // In production, you'd send this to an error tracking service (Sentry, etc.)
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f8f9fa' }}>
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiAlertCircle size={28} className="text-red-400" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Something went wrong
            </h1>
            <p className="text-sm text-gray-400 mb-6">
              An unexpected error occurred. Please refresh the page and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-orange-500 text-white text-sm font-semibold rounded-lg transition-all"
            >
              <FiRefreshCw size={15} /> Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
