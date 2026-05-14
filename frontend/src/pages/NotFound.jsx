import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHome, FiPackage, FiArrowRight } from 'react-icons/fi'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f8f9fa' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-md"
      >
        {/* Icon */}
        <div className="w-20 h-20 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FiPackage size={36} className="text-orange-400" />
        </div>

        {/* Error Code */}
        <p className="text-7xl font-black text-gray-100 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          404
        </p>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Page Not Found
        </h1>
        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 hover:bg-orange-500 text-white text-sm font-semibold rounded-lg transition-all shadow-sm"
          >
            <FiHome size={16} /> Go Home
          </Link>
          <Link
            to="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg transition-all"
          >
            Browse Products <FiArrowRight size={15} />
          </Link>
        </div>

        {/* Brand */}
        <div className="mt-10 flex items-center justify-center gap-2">
          <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center text-white font-black text-xs">D</div>
          <span className="text-sm font-extrabold text-gray-500" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Dhani<span className="text-orange-500">Fresh</span>
          </span>
        </div>
      </motion.div>
    </div>
  )
}

export default NotFound
