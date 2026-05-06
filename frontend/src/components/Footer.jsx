import { Link } from 'react-router-dom'
import { FiInstagram, FiFacebook, FiTwitter, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400">
      {/* Main footer */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-4">
            <Link to="/" className="inline-flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-black text-sm">D</div>
              <span className="font-extrabold text-lg text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Dhani<span className="text-orange-400">Fresh</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              Premium quality Desi Ghee from the finest farms in India. Handcrafted using traditional Bilona methods for unmatched purity and taste.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3">
              {[FiInstagram, FiFacebook, FiTwitter].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-white/5 hover:bg-orange-500 text-gray-400 hover:text-white rounded-lg flex items-center justify-center transition-all border border-white/10 hover:border-orange-500">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold text-white mb-5 uppercase tracking-wider">Shop</h4>
            <ul className="space-y-3">
              <li><Link to="/products" className="text-sm hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/products?category=a2" className="text-sm hover:text-white transition-colors">A2 Ghee</Link></li>
              <li><Link to="/products?category=cow" className="text-sm hover:text-white transition-colors">Cow Ghee</Link></li>
              <li><Link to="/products?category=buffalo" className="text-sm hover:text-white transition-colors">Buffalo Ghee</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold text-white mb-5 uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/faq" className="text-sm hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold text-white mb-5 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3">
              <li><Link to="/privacy-policy" className="text-sm hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/refund-policy" className="text-sm hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold text-white mb-5 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <FiMail size={14} className="mt-0.5 shrink-0 text-orange-400" />
                <span className="text-sm">support@dhanifresh.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <FiPhone size={14} className="mt-0.5 shrink-0 text-orange-400" />
                <span className="text-sm">+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-2.5">
                <FiMapPin size={14} className="mt-0.5 shrink-0 text-orange-400" />
                <span className="text-sm">Mumbai, Maharashtra</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} DhaniFresh Ghee. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-gray-500">
            <span>Pan India Delivery</span>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span>100% Secure Payments</span>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span>FSSAI Certified</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
