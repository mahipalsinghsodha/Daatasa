import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiGrid } from 'react-icons/fi'

const CategoryMenu = ({ categories }) => {
  return (
    <div className="w-full bg-white border-b border-brand-primary/10 sticky top-[60px] sm:top-[68px] z-40 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex items-center h-14 sm:h-16 gap-6 overflow-x-auto no-scrollbar snap-x">
        
        {/* 'All Categories' Link */}
        <Link 
          to="/products" 
          className="flex items-center gap-2 shrink-0 snap-start text-brand-primary font-semibold hover:text-brand-secondary transition-colors text-sm sm:text-base py-2"
        >
          <FiGrid size={18} />
          <span>All Categories</span>
        </Link>
        
        <div className="w-[1px] h-6 bg-brand-primary/10 shrink-0 hidden sm:block"></div>

        {/* Dynamic Categories */}
        {categories && categories.length > 0 ? (
          categories.map((cat, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={cat._id || idx} 
              className="shrink-0 snap-start"
            >
              <Link 
                to={`/products?category=${cat.slug || cat.name.toLowerCase()}`} 
                className="flex items-center gap-2 text-brand-text/80 hover:text-brand-secondary font-medium transition-colors text-sm sm:text-base py-2 group"
              >
                {cat.image && (
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="w-6 h-6 rounded-full object-cover border border-brand-primary/10 group-hover:border-brand-secondary/50 transition-colors"
                  />
                )}
                <span className="whitespace-nowrap">{cat.name}</span>
              </Link>
            </motion.div>
          ))
        ) : (
          /* Fallback dummy categories if none provided */
          ['Pure Ghee', 'Raw Honey', 'Organic Spices', 'Dry Fruits', 'Healthy Seeds'].map((name, idx) => (
             <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={idx} 
              className="shrink-0 snap-start"
            >
              <Link 
                to="/products" 
                className="flex items-center gap-2 text-brand-text/80 hover:text-brand-secondary font-medium transition-colors text-sm sm:text-base py-2"
              >
                <span className="whitespace-nowrap">{name}</span>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

export default CategoryMenu
