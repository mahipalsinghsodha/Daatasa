import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronDown } from 'react-icons/fi'

const FAQs = [
  { question: 'What is Bilona Ghee?', answer: 'Bilona Ghee is prepared using the traditional Vedic method. Fresh A2 cow milk is boiled, cultured into curd, and then hand-churned in wooden vats to extract makkhan (butter). This butter is slowly heated to make pure, aromatic ghee, retaining maximum nutrients.' },
  { question: 'Do you deliver across India?', answer: 'Yes, we offer Pan India delivery! Orders above ₹500 qualify for free shipping. For orders below ₹500, a nominal logistics fee of ₹50 is applied.' },
  { question: 'How long does delivery take?', answer: 'Standard delivery takes between 4 to 7 business days depending on your location. Metro cities usually receive orders faster.' },
  { question: 'Is your ghee lab tested?', answer: 'Absolutely. Every batch of our ghee undergoes rigorous testing in FSSAI-certified laboratories to ensure purity, quality, and adherence to food safety standards.' },
  { question: 'How should I store the ghee?', answer: 'Store your ghee in a cool, dry place away from direct sunlight. There is no need to refrigerate it. Always use a clean, dry spoon to prevent moisture from spoiling the ghee.' },
  { question: 'What is your return policy?', answer: 'We accept returns within 7 days of delivery if the product is damaged or tampered. Please contact our support team with a photo of the product and your order ID to initiate a return request.' },
]

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="min-h-screen" style={{ background: '#f8f9fa' }}>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center">
          <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full border border-orange-200 mb-4">Support</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.025em' }}>
            Frequently Asked Questions
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.14 }} className="text-sm text-gray-500 max-w-lg mx-auto">
            Everything you need to know about our products and services.
          </motion.p>
        </div>
      </div>

      <div className="max-w-[860px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="space-y-3">
          {FAQs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none hover:bg-gray-50/50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{faq.question}</span>
                <motion.div animate={{ rotate: openIndex === index ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
                  <FiChevronDown size={16} className="text-gray-400" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FAQ
