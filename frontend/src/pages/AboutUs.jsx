import { motion } from 'framer-motion'
import { FiCheck, FiAward, FiDroplet, FiShield } from 'react-icons/fi'

const AboutUs = () => {
  return (
    <div className="min-h-screen" style={{ background: '#f8f9fa' }}>

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full border border-orange-200 mb-4"
          >
            Our Story
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.025em' }}
          >
            About DhaniFresh
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="text-base text-gray-500 max-w-xl mx-auto"
          >
            Bringing the purest traditional ghee from our farms to your family's table.
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Main story */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Our Story</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                DhaniFresh started with a simple mission: to revive the ancient, authentic taste of pure Indian Desi Ghee.
                We noticed that the market was flooded with processed alternatives lacking the rich aroma, texture, and
                health benefits of traditionally churned ghee.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Founded by a family passionate about traditional food sciences, we set out to bridge the gap between
                ancient wisdom and modern convenience — delivering pure, lab-tested ghee right to your doorstep.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>The Bilona Process</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                We strictly adhere to the Vedic Bilona method. Fresh A2 milk from our happy, grass-fed cows is set into curd.
                This curd is then hand-churned in wooden vats to extract makkhan (butter), which is slowly heated over a low
                flame to create the golden, aromatic ghee you love. No shortcuts — ever.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Our Promise</h2>
              <ul className="space-y-3">
                {[
                  'No preservatives, no artificial colors, and no hidden chemicals.',
                  'Our cows are treated with love, left to graze freely, and never injected with hormones.',
                  'Every batch is rigorously tested for purity to ensure your family\'s safety.',
                  'Delivered fresh within days of production in food-safe packaging.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                      <FiCheck size={11} className="text-green-600" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Side stats */}
          <div className="space-y-5">
            {[
              { icon: <FiAward size={22} />, title: '5000+', sub: 'Happy Customers', color: 'bg-orange-50 text-orange-500' },
              { icon: <FiDroplet size={22} />, title: '100%', sub: 'Pure & Natural', color: 'bg-blue-50 text-blue-500' },
              { icon: <FiShield size={22} />, title: 'FSSAI', sub: 'Certified Quality', color: 'bg-green-50 text-green-500' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.1 }}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${item.color}`}>
                  {item.icon}
                </div>
                <div className="text-2xl font-extrabold text-gray-900 mb-0.5" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{item.title}</div>
                <div className="text-sm text-gray-500">{item.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutUs
