import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi'
import ProductCard from './ProductCard'
import { useTranslation } from 'react-i18next'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
})

const ProductCarousel = ({ title, subtitle, products, loading, viewAllLink, showRank }) => {
  const { t } = useTranslation()
  const scrollContainerRef = useRef(null)

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 px-4 sm:px-0">
        <div>
          {subtitle && (
            <motion.h4 {...fadeUp(0)} className="text-sm font-bold uppercase tracking-[0.2em] text-brand-secondary mb-2">
              {subtitle}
            </motion.h4>
          )}
          <motion.h2 {...fadeUp(0.1)} className="text-3xl sm:text-4xl font-display font-bold text-brand-primary">
            {title}
          </motion.h2>
        </div>
        
        <motion.div {...fadeUp(0.2)} className="flex items-center gap-4">
          {viewAllLink && (
            <Link to={viewAllLink} className="text-sm font-bold text-brand-secondary hover:text-brand-primary transition-colors flex items-center gap-1 hidden sm:flex">
              {t('carousel.viewAll', 'View All')} <FiArrowRight />
            </Link>
          )}
          
          {/* Custom Navigation Arrows */}
          <div className="hidden sm:flex gap-2">
            <button 
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border border-brand-primary/10 flex items-center justify-center text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
            >
              <FiChevronLeft size={20} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border border-brand-primary/10 flex items-center justify-center text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        <div 
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto snap-x no-scrollbar pb-8 px-4 sm:px-0 scroll-smooth"
        >
          {loading ? (
             [...Array(4)].map((_, i) => (
               <div key={i} className="snap-start shrink-0 w-[260px] sm:w-[300px] h-[400px] bg-white rounded-[2rem] skeleton border border-brand-primary/5" />
             ))
          ) : products && products.length > 0 ? (
            products.map((product, idx) => (
              <motion.div 
                key={product._id} 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="snap-start shrink-0 w-[260px] sm:w-[300px]"
              >
                <ProductCard product={product} rank={showRank ? idx + 1 : undefined} />
              </motion.div>
            ))
          ) : (
            <div className="w-full py-12 text-center text-brand-text/50 font-light bg-white rounded-2xl border border-brand-primary/5">
              {t('carousel.noProducts', 'No products available at the moment.')}
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile View All Button */}
      {viewAllLink && (
        <div className="mt-4 text-center sm:hidden px-4">
          <Link to={viewAllLink} className="btn btn-secondary w-full h-12 flex items-center justify-center rounded-full text-sm">
            {t('carousel.viewAll', 'View All')}
          </Link>
        </div>
      )}
    </div>
  )
}

export default ProductCarousel
