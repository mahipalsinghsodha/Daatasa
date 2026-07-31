import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'

const HeroCarousel = () => {
  const { t } = useTranslation()
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?w=1600&q=80",
      badge: t('hero.badge1', 'Heritage of Rajasthan'),
      title: t('hero.title1', 'Pure Vedic Bilona'),
      subtitle: t('hero.sub1', 'Desi Cow Ghee'),
      description: t('hero.desc1', 'Experience the pinnacle of purity with our traditionally hand-churned liquid gold. Crafted slowly in earthen pots to preserve authentic aroma.'),
      buttonText: t('hero.btn1', 'Shop Collection'),
      link: '/products'
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1511690078903-71dc5a49f5e3?w=1600&q=80",
      badge: t('hero.badge2', 'Farm to Family'),
      title: t('hero.title2', '100% Organic & Natural'),
      subtitle: t('hero.sub2', 'Directly from Farms'),
      description: t('hero.desc2', 'Sourced from happy, free-grazing cows fed on natural organic grass. Unadulterated purity delivered straight to your doorstep.'),
      buttonText: t('hero.btn2', 'Discover More'),
      link: '/about'
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1513682121497-80211f36a790?w=1600&q=80",
      badge: t('hero.badge3', 'Authentic Process'),
      title: t('hero.title3', 'Traditional Bilona'),
      subtitle: t('hero.sub3', 'Hand-Churned Perfection'),
      description: t('hero.desc3', 'We follow the rigorous 4-step Vedic process. Every drop is crafted with patience, tradition, and devotion to bring you unparalleled health benefits.'),
      buttonText: t('hero.btn3', 'Shop Now'),
      link: '/products'
    }
  ]

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  }, [slides.length])

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  // Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide()
    }, 6000)
    return () => clearInterval(timer)
  }, [nextSlide])

  return (
    <div className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[85vh] overflow-hidden bg-brand-bg group">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div className="absolute inset-0 w-full h-full">
            <img 
              src={slides[currentSlide].image} 
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
          </div>

          {/* Slide Content */}
          <div className="relative z-10 h-full max-w-[1440px] mx-auto px-6 sm:px-12 flex flex-col justify-center">
            <div className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="mb-4"
              >
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.15em] text-white bg-brand-secondary/80 backdrop-blur-md border border-white/20">
                  {slides[currentSlide].badge}
                </span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold leading-[1.1] mb-4 text-white"
              >
                {slides[currentSlide].title} <br />
                <span className="text-brand-secondary italic">{slides[currentSlide].subtitle}</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="text-base sm:text-lg text-white/80 mb-8 sm:mb-10 leading-relaxed font-light line-clamp-3 sm:line-clamp-none"
              >
                {slides[currentSlide].description}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
              >
                <Link to={slides[currentSlide].link} className="btn btn-primary h-12 sm:h-14 px-8 text-[14px] sm:text-[15px] rounded-full shadow-gold inline-flex items-center gap-2 group-hover:scale-105 transition-transform">
                  {slides[currentSlide].buttonText} <FiArrowRight />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide} 
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-20"
      >
        <FiChevronLeft size={24} />
      </button>
      <button 
        onClick={nextSlide} 
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-20"
      >
        <FiChevronRight size={24} />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`transition-all duration-300 rounded-full ${
              currentSlide === idx 
                ? 'w-8 h-2.5 bg-brand-secondary shadow-gold' 
                : 'w-2.5 h-2.5 bg-white/50 hover:bg-white'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default HeroCarousel
