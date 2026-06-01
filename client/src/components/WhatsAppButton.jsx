import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

// You can configure this to your actual support number
const WHATSAPP_NUMBER = '7665306403' // Replace with actual number
const MESSAGE = encodeURIComponent('Hi DhaniFresh, I need some help!')

const WhatsAppButton = () => {
  return (
    <motion.a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full flex items-center justify-center text-white cursor-pointer shadow-[0_8px_25px_rgba(37,211,102,0.4)]"
      style={{ background: '#25D366' }} // Official WhatsApp Green
      title="Chat with us on WhatsApp"
    >
      <MessageCircle size={30} strokeWidth={2} />
      
      {/* Pulse effect */}
      <span className="absolute w-full h-full rounded-full border-2 border-[#25D366] opacity-0 animate-[ping_2s_ease-in-out_infinite]" />
    </motion.a>
  )
}

export default WhatsAppButton
