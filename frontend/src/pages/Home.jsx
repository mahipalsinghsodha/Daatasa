// import { Link } from 'react-router-dom'
// import { useEffect, useState } from 'react'
// import axios from 'axios'
// import { motion } from 'framer-motion'
// import ProductCard from '../components/ProductCard'
// import { FiArrowRight, FiShield, FiStar, FiTruck, FiAward } from 'react-icons/fi'

// // ── Brand Tokens ──────────────────────────────────────────────────────────────
// const C = {
//   orange:      '#e8621a',
//   orangeHov:   '#cf5618',
//   orangeLight: '#fff4ee',
//   orangeMid:   '#fddcca',
//   bg:          '#f2f4f6',
//   white:       '#ffffff',
//   text:        '#1a1a2e',
//   textMid:     '#444455',
//   textLight:   '#8899aa',
//   border:      '#e4e9f0',
//   shadow:      '0 2px 12px rgba(0,0,0,0.07)',
//   shadowMd:    '0 8px 32px rgba(0,0,0,0.11)',
//   font:        "'Plus Jakarta Sans', system-ui, sans-serif",
// }

// const fadeUp = (delay = 0) => ({
//   initial: { opacity: 0, y: 22 },
//   animate: { opacity: 1, y: 0 },
//   transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
// })

// // ── Main Component ────────────────────────────────────────────────────────────
// const Home = () => {
//   const [featuredProducts, setFeaturedProducts] = useState([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => { fetchFeatured() }, [])

//   const fetchFeatured = async () => {
//     try {
//       const res = await axios.get('/api/products?featured=true')
//       setFeaturedProducts(res.data.slice(0, 4))
//     } catch (e) { console.error(e) }
//     finally { setLoading(false) }
//   }

//   return (
//     <div style={{ fontFamily: C.font, color: C.text, background: C.bg }}>
//       <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

//       {/* ── Hero ──────────────────────────────────────────────────────────── */}
//       <section style={{
//         background: `linear-gradient(135deg, #1a1a2e 0%, #2d1810 60%, #3d2010 100%)`,
//         padding: '80px 24px',
//         position: 'relative',
//         overflow: 'hidden',
//       }}>
//         {/* Background decorative circles */}
//         <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, background: 'radial-gradient(circle, rgba(232,98,26,0.15) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
//         <div style={{ position: 'absolute', bottom: -80, left: -80, width: 360, height: 360, background: 'radial-gradient(circle, rgba(232,98,26,0.08) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
//         {/* Subtle grid */}
//         <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />

//         <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>

//             {/* Left: Text */}
//             <div>
//               <motion.div {...fadeUp(0)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(232,98,26,0.15)', border: '1px solid rgba(232,98,26,0.3)', padding: '6px 14px', borderRadius: 20, marginBottom: 22 }}>
//                 <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.orange }} />
//                 <span style={{ color: C.orange, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em' }}>100% PURE &amp; NATURAL</span>
//               </motion.div>

//               <motion.h1 {...fadeUp(0.08)} style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, color: '#fff', margin: '0 0 16px', lineHeight: 1.12, letterSpacing: '-0.02em' }}>
//                 Premium Quality<br />
//                 <span style={{ color: C.orange }}>Desi Ghee</span>
//               </motion.h1>

//               <motion.p {...fadeUp(0.14)} style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 32, maxWidth: 420 }}>
//                 Crafted from the finest A1 &amp; A2 cow milk using traditional Bilona method. Rich in nutrients, pure in taste — your family's trusted health companion.
//               </motion.p>

//               <motion.div {...fadeUp(0.2)} style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
//                 <Link to="/products" style={{
//                   display: 'inline-flex', alignItems: 'center', gap: 8,
//                   padding: '13px 26px', background: C.orange,
//                   borderRadius: 12, color: '#fff', fontWeight: 800,
//                   fontSize: 15, textDecoration: 'none',
//                   boxShadow: '0 8px 24px rgba(232,98,26,0.4)',
//                   transition: 'background 0.2s',
//                 }}>
//                   Shop Now <FiArrowRight size={16} />
//                 </Link>
//                 <Link to="/products?category=a1" style={{
//                   display: 'inline-flex', alignItems: 'center', gap: 8,
//                   padding: '13px 26px', background: 'rgba(255,255,255,0.08)',
//                   border: '1.5px solid rgba(255,255,255,0.15)',
//                   borderRadius: 12, color: '#fff', fontWeight: 700,
//                   fontSize: 15, textDecoration: 'none',
//                   transition: 'background 0.2s',
//                 }}>
//                   View Categories
//                 </Link>
//               </motion.div>

//               {/* Trust pills */}
//               <motion.div {...fadeUp(0.26)} style={{ display: 'flex', gap: 20, marginTop: 36, flexWrap: 'wrap' }}>
//                 {[
//                   { icon: <FiStar size={13} />, label: '4.9 Rating' },
//                   { icon: <FiShield size={13} />, label: 'FSSAI Certified' },
//                   { icon: <FiTruck size={13} />, label: 'Free Delivery' },
//                 ].map(t => (
//                   <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
//                     <span style={{ color: C.orange }}>{t.icon}</span> {t.label}
//                   </div>
//                 ))}
//               </motion.div>
//             </div>

//             {/* Right: Visual card */}
//             <motion.div
//               initial={{ opacity: 0, x: 30 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
//               style={{ position: 'relative' }}
//             >
//               {/* Main visual card */}
//               <div style={{
//                 background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
//                 border: '1.5px solid rgba(255,255,255,0.1)',
//                 borderRadius: 24, padding: 32,
//                 backdropFilter: 'blur(12px)',
//                 textAlign: 'center',
//               }}>
//                 <div style={{ fontSize: 90, marginBottom: 12 }}>🧈</div>
//                 <div style={{ color: '#fff', fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Bilona Ghee</div>
//                 <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 20 }}>Traditional hand-churned method</div>
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
//                   {[
//                     { label: 'Protein', val: '0.5g' },
//                     { label: 'Fat',     val: '99.5g' },
//                     { label: 'Calories','val': '900 kcal' },
//                     { label: 'Purity',  val: '100%' },
//                   ].map(n => (
//                     <div key={n.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 0' }}>
//                       <div style={{ fontWeight: 800, fontSize: 16, color: C.orange }}>{n.val}</div>
//                       <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{n.label}</div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Floating badge */}
//               <div style={{
//                 position: 'absolute', top: -16, right: -16,
//                 background: C.orange, borderRadius: 14, padding: '10px 16px',
//                 boxShadow: '0 8px 24px rgba(232,98,26,0.4)',
//               }}>
//                 <div style={{ color: '#fff', fontWeight: 800, fontSize: 13 }}>A1 &amp; A2</div>
//                 <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>Available</div>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* ── Trust Bar ─────────────────────────────────────────────────────── */}
//       <section style={{ background: C.white, borderBottom: `1.5px solid ${C.border}`, padding: '18px 24px' }}>
//         <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
//           {[
//             { icon: '🐄', label: 'Farm Fresh' },
//             { icon: '✅', label: 'FSSAI Approved' },
//             { icon: '🌿', label: 'No Preservatives' },
//             { icon: '🚚', label: 'Pan India Delivery' },
//             { icon: '⭐', label: '10,000+ Happy Customers' },
//           ].map(t => (
//             <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: C.textMid }}>
//               <span style={{ fontSize: 18 }}>{t.icon}</span> {t.label}
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* ── Categories ────────────────────────────────────────────────────── */}
//       <section style={{ padding: '64px 24px' }}>
//         <div style={{ maxWidth: 1100, margin: '0 auto' }}>
//           <motion.div {...fadeUp(0)} style={{ textAlign: 'center', marginBottom: 44 }}>
//             <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.orangeLight, border: `1px solid ${C.orangeMid}`, padding: '5px 14px', borderRadius: 20, marginBottom: 12 }}>
//               <span style={{ color: C.orange, fontSize: 12, fontWeight: 700, letterSpacing: '0.07em' }}>CATEGORIES</span>
//             </div>
//             <h2 style={{ margin: 0, fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 900, letterSpacing: '-0.02em' }}>Choose Your Ghee</h2>
//             <p style={{ color: C.textLight, fontSize: 15, marginTop: 10 }}>Two varieties, one uncompromising standard of purity</p>
//           </motion.div>

//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
//             {[
//               {
//                 to: '/products?category=a1',
//                 tag: 'A1',
//                 title: 'Category A1',
//                 desc: 'Premium ghee made from the milk of HF and Jersey cows. Rich, creamy texture with a classic golden hue and traditional aroma.',
//                 emoji: '🥛',
//                 features: ['Rich Flavor', 'Golden Color', 'High Fat'],
//                 bg: 'linear-gradient(135deg, #fff8f0 0%, #fef0e4 100%)',
//                 border: C.orangeMid,
//               },
//               {
//                 to: '/products?category=a2',
//                 tag: 'A2',
//                 title: 'Category A2',
//                 desc: 'Organic ghee from pure desi Gir cow milk. Naturally easy to digest with a light, aromatic taste loved by health enthusiasts.',
//                 emoji: '🌿',
//                 features: ['Easy Digest', 'Organic', 'Desi Cow'],
//                 bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
//                 border: '#86efac',
//               },
//             ].map((cat, i) => (
//               <motion.div key={cat.tag} {...fadeUp(i * 0.1)}>
//                 <Link to={cat.to} style={{ textDecoration: 'none', display: 'block' }}>
//                   <motion.div
//                     whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(0,0,0,0.13)' }}
//                     style={{
//                       background: cat.bg,
//                       border: `1.5px solid ${cat.border}`,
//                       borderRadius: 20, padding: '36px 32px',
//                       boxShadow: C.shadow, transition: 'all 0.2s',
//                     }}
//                   >
//                     <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
//                       <div>
//                         <div style={{ display: 'inline-flex', background: C.orange, color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', marginBottom: 12 }}>
//                           {cat.tag} GHEE
//                         </div>
//                         <h3 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: C.text, letterSpacing: '-0.01em' }}>{cat.title}</h3>
//                       </div>
//                       <div style={{ fontSize: 52 }}>{cat.emoji}</div>
//                     </div>
//                     <p style={{ color: C.textMid, fontSize: 14, lineHeight: 1.7, marginBottom: 20, margin: '0 0 20px' }}>{cat.desc}</p>
//                     <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
//                       {cat.features.map(f => (
//                         <span key={f} style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.7)', border: `1px solid ${cat.border}`, borderRadius: 20, fontSize: 12, fontWeight: 700, color: C.textMid }}>
//                           ✓ {f}
//                         </span>
//                       ))}
//                     </div>
//                     <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: C.orange, fontWeight: 800, fontSize: 14 }}>
//                       Explore {cat.tag} Products <FiArrowRight size={15} />
//                     </div>
//                   </motion.div>
//                 </Link>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── Featured Products ──────────────────────────────────────────────── */}
//       <section style={{ padding: '64px 24px', background: C.white }}>
//         <div style={{ maxWidth: 1100, margin: '0 auto' }}>
//           <motion.div {...fadeUp(0)} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 14 }}>
//             <div>
//               <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.orangeLight, border: `1px solid ${C.orangeMid}`, padding: '5px 14px', borderRadius: 20, marginBottom: 12 }}>
//                 <FiStar size={12} style={{ color: C.orange }} />
//                 <span style={{ color: C.orange, fontSize: 12, fontWeight: 700, letterSpacing: '0.07em' }}>FEATURED</span>
//               </div>
//               <h2 style={{ margin: 0, fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 900, letterSpacing: '-0.02em' }}>Best Sellers</h2>
//               <p style={{ color: C.textLight, fontSize: 14, marginTop: 8 }}>Hand-picked favourites loved by our customers</p>
//             </div>
//             <Link to="/products" style={{
//               display: 'inline-flex', alignItems: 'center', gap: 8,
//               padding: '10px 20px', background: C.orangeLight,
//               border: `1.5px solid ${C.orangeMid}`, borderRadius: 10,
//               color: C.orange, fontWeight: 800, fontSize: 14,
//               textDecoration: 'none', transition: 'background 0.2s',
//             }}>
//               View All <FiArrowRight size={14} />
//             </Link>
//           </motion.div>

//           {loading ? (
//             <div style={{ textAlign: 'center', padding: '60px 0' }}>
//               <div style={{ width: 40, height: 40, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.orange}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
//               <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//             </div>
//           ) : featuredProducts.length > 0 ? (
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
//               {featuredProducts.map((product, i) => (
//                 <motion.div key={product._id} {...fadeUp(i * 0.07)}>
//                   <ProductCard product={product} />
//                 </motion.div>
//               ))}
//             </div>
//           ) : (
//             <div style={{ textAlign: 'center', padding: '40px 0', color: C.textLight }}>
//               <p style={{ fontSize: 15 }}>No featured products available at the moment.</p>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* ── Why Choose Us ─────────────────────────────────────────────────── */}
//       <section style={{ padding: '64px 24px', background: C.bg }}>
//         <div style={{ maxWidth: 1100, margin: '0 auto' }}>
//           <motion.div {...fadeUp(0)} style={{ textAlign: 'center', marginBottom: 44 }}>
//             <h2 style={{ margin: 0, fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 900, letterSpacing: '-0.02em' }}>Why Ghee Store?</h2>
//             <p style={{ color: C.textLight, fontSize: 15, marginTop: 10 }}>We take pride in delivering nothing but the best</p>
//           </motion.div>
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18 }}>
//             {[
//               { icon: '🐄', title: 'Farm Sourced', desc: 'Directly procured from trusted farms across India' },
//               { icon: '🔥', title: 'Bilona Method', desc: 'Traditional hand-churning preserves all nutrients' },
//               { icon: '🧪', title: 'Lab Tested', desc: 'Every batch tested for purity and quality assurance' },
//               { icon: '📦', title: 'Safe Packaging', desc: 'Hygienic, tamper-proof glass and food-grade containers' },
//             ].map((f, i) => (
//               <motion.div key={f.title} {...fadeUp(i * 0.07)}>
//                 <motion.div
//                   whileHover={{ y: -3, boxShadow: C.shadowMd }}
//                   style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 16, padding: '28px 24px', boxShadow: C.shadow, textAlign: 'center', transition: 'all 0.2s' }}
//                 >
//                   <div style={{ fontSize: 40, marginBottom: 14 }}>{f.icon}</div>
//                   <h4 style={{ margin: '0 0 8px', fontWeight: 800, fontSize: 16, color: C.text }}>{f.title}</h4>
//                   <p style={{ margin: 0, fontSize: 13, color: C.textLight, lineHeight: 1.6 }}>{f.desc}</p>
//                 </motion.div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── CTA Banner ────────────────────────────────────────────────────── */}
//       <section style={{ padding: '0 24px 64px' }}>
//         <div style={{ maxWidth: 1100, margin: '0 auto' }}>
//           <motion.div
//             {...fadeUp(0)}
//             style={{
//               background: `linear-gradient(135deg, #1a1a2e 0%, #2d1810 100%)`,
//               borderRadius: 24, padding: '48px 40px',
//               display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//               flexWrap: 'wrap', gap: 24,
//               position: 'relative', overflow: 'hidden',
//             }}
//           >
//             <div style={{ position: 'absolute', top: -60, right: 60, width: 300, height: 300, background: 'radial-gradient(circle, rgba(232,98,26,0.15) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
//             <div style={{ position: 'relative', zIndex: 1 }}>
//               <h3 style={{ margin: '0 0 10px', fontWeight: 900, fontSize: 'clamp(20px, 3vw, 30px)', color: '#fff', letterSpacing: '-0.02em' }}>
//                 Ready to taste purity? 🧈
//               </h3>
//               <p style={{ margin: 0, color: 'rgba(255,255,255,0.55)', fontSize: 15 }}>
//                 Free delivery on orders above ₹999 · Pan India shipping
//               </p>
//             </div>
//             <Link to="/products" style={{
//               display: 'inline-flex', alignItems: 'center', gap: 10,
//               padding: '14px 30px', background: C.orange,
//               borderRadius: 12, color: '#fff', fontWeight: 800,
//               fontSize: 15, textDecoration: 'none', flexShrink: 0,
//               boxShadow: '0 8px 24px rgba(232,98,26,0.4)',
//               transition: 'background 0.2s', position: 'relative', zIndex: 1,
//             }}>
//               Order Now <FiArrowRight size={16} />
//             </Link>
//           </motion.div>
//         </div>
//       </section>

//     </div>
//   )
// }

// export default Home

import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import ProductCard from '../components/ProductCard'
import { FiArrowRight, FiShield, FiStar, FiTruck } from 'react-icons/fi'

const C = {
  orange:'#e8621a', orangeHov:'#cf5618', orangeLight:'#fff4ee', orangeMid:'#fddcca',
  bg:'#f2f4f6', white:'#ffffff', text:'#1a1a2e', textMid:'#444455', textLight:'#8899aa',
  border:'#e4e9f0', shadow:'0 2px 12px rgba(0,0,0,0.07)', shadowMd:'0 8px 32px rgba(0,0,0,0.11)',
  font:"'Plus Jakarta Sans', system-ui, sans-serif",
}

const useW=()=>{const[w,setW]=useState(typeof window!=='undefined'?window.innerWidth:1200);useEffect(()=>{const h=()=>setW(window.innerWidth);window.addEventListener('resize',h);return()=>window.removeEventListener('resize',h)},[]);return w}

const fadeUp=(delay=0)=>({initial:{opacity:0,y:22},animate:{opacity:1,y:0},transition:{duration:0.5,delay,ease:[0.22,1,0.36,1]}})

const Home=()=>{
  const w        = useW()
  const isMobile = w < 640
  const isTablet = w >= 640 && w < 1024

  const [featuredProducts,setFeaturedProducts]=useState([])
  const [loading,setLoading]=useState(true)

  useEffect(()=>{fetchFeatured()},[])
  const fetchFeatured=async()=>{try{const res=await axios.get('/api/products?featured=true');setFeaturedProducts(res.data.slice(0,4))}catch(e){console.error(e)}finally{setLoading(false)}}

  return(
    <div style={{fontFamily:C.font,color:C.text,background:C.bg}}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section style={{background:'linear-gradient(135deg,#1a1a2e 0%,#2d1810 60%,#3d2010 100%)',padding:isMobile?'48px 16px':'80px 24px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-100,right:-100,width:isMobile?300:500,height:isMobile?300:500,background:'radial-gradient(circle,rgba(232,98,26,0.15) 0%,transparent 65%)',borderRadius:'50%',pointerEvents:'none'}}/>
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)',backgroundSize:'48px 48px',pointerEvents:'none'}}/>

        <div style={{maxWidth:1100,margin:'0 auto',position:'relative',zIndex:1}}>
          {/* Mobile/Tablet: stacked, Desktop: 2-col */}
          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':isTablet?'1fr':'1fr 1fr',gap:isMobile?32:60,alignItems:'center'}}>

            {/* Text */}
            <div>
              <motion.div {...fadeUp(0)} style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(232,98,26,0.15)',border:'1px solid rgba(232,98,26,0.3)',padding:'5px 13px',borderRadius:20,marginBottom:18}}>
                <span style={{width:6,height:6,borderRadius:'50%',background:C.orange}}/>
                <span style={{color:C.orange,fontSize:11,fontWeight:700,letterSpacing:'0.08em'}}>100% PURE & NATURAL</span>
              </motion.div>

              <motion.h1 {...fadeUp(0.08)} style={{fontSize:isMobile?'clamp(28px,8vw,36px)':'clamp(32px,4vw,52px)',fontWeight:900,color:'#fff',margin:'0 0 14px',lineHeight:1.12,letterSpacing:'-0.02em'}}>
                Premium Quality<br/><span style={{color:C.orange}}>Desi Ghee</span>
              </motion.h1>

              <motion.p {...fadeUp(0.14)} style={{fontSize:isMobile?14:16,color:'rgba(255,255,255,0.6)',lineHeight:1.7,marginBottom:28,maxWidth:420}}>
                Crafted using traditional Bilona method from A1 & A2 cow milk. Rich in nutrients, pure in taste.
              </motion.p>

              <motion.div {...fadeUp(0.2)} style={{display:'flex',gap:12,flexWrap:'wrap'}}>
                <Link to="/products" style={{display:'inline-flex',alignItems:'center',gap:8,padding:isMobile?'11px 20px':'13px 26px',background:C.orange,borderRadius:12,color:'#fff',fontWeight:800,fontSize:isMobile?14:15,textDecoration:'none',boxShadow:'0 8px 24px rgba(232,98,26,0.4)'}}>
                  Shop Now <FiArrowRight size={15}/>
                </Link>
                <Link to="/products?category=a1" style={{display:'inline-flex',alignItems:'center',gap:8,padding:isMobile?'11px 20px':'13px 26px',background:'rgba(255,255,255,0.08)',border:'1.5px solid rgba(255,255,255,0.15)',borderRadius:12,color:'#fff',fontWeight:700,fontSize:isMobile?14:15,textDecoration:'none'}}>
                  Categories
                </Link>
              </motion.div>

              <motion.div {...fadeUp(0.26)} style={{display:'flex',gap:isMobile?14:20,marginTop:28,flexWrap:'wrap'}}>
                {[{icon:<FiStar size={12}/>,label:'4.9 Rating'},{icon:<FiShield size={12}/>,label:'FSSAI Certified'},{icon:<FiTruck size={12}/>,label:'Free Delivery'}].map(t=>(
                  <div key={t.label} style={{display:'flex',alignItems:'center',gap:6,color:'rgba(255,255,255,0.55)',fontSize:12}}>
                    <span style={{color:C.orange}}>{t.icon}</span>{t.label}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Visual card — hidden on small mobile to save space */}
            {!isMobile&&(
              <motion.div initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} transition={{duration:0.6,delay:0.1,ease:[0.22,1,0.36,1]}} style={{position:'relative'}}>
                <div style={{background:'linear-gradient(135deg,rgba(255,255,255,0.08) 0%,rgba(255,255,255,0.03) 100%)',border:'1.5px solid rgba(255,255,255,0.1)',borderRadius:24,padding:isTablet?24:32,backdropFilter:'blur(12px)',textAlign:'center'}}>
                  <div style={{fontSize:isTablet?70:90,marginBottom:10}}>🧈</div>
                  <div style={{color:'#fff',fontWeight:800,fontSize:isTablet?17:20,marginBottom:5}}>Bilona Ghee</div>
                  <div style={{color:'rgba(255,255,255,0.5)',fontSize:13,marginBottom:18}}>Traditional hand-churned method</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                    {[{label:'Protein',val:'0.5g'},{label:'Fat',val:'99.5g'},{label:'Calories',val:'900 kcal'},{label:'Purity',val:'100%'}].map(n=>(
                      <div key={n.label} style={{background:'rgba(255,255,255,0.06)',borderRadius:10,padding:'9px 0'}}>
                        <div style={{fontWeight:800,fontSize:15,color:C.orange}}>{n.val}</div>
                        <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',marginTop:2}}>{n.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{position:'absolute',top:-14,right:-14,background:C.orange,borderRadius:12,padding:'9px 14px',boxShadow:'0 8px 24px rgba(232,98,26,0.4)'}}>
                  <div style={{color:'#fff',fontWeight:800,fontSize:12}}>A1 & A2</div>
                  <div style={{color:'rgba(255,255,255,0.75)',fontSize:10}}>Available</div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ── Trust Bar ─────────────────────────────────────────────────── */}
      <section style={{background:C.white,borderBottom:`1.5px solid ${C.border}`,padding:'14px 16px',overflowX:'auto'}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'center',gap:isMobile?20:48,flexWrap:isMobile?'nowrap':'wrap',minWidth:isMobile?'max-content':'auto'}}>
          {[{icon:'🐄',label:'Farm Fresh'},{icon:'✅',label:'FSSAI Approved'},{icon:'🌿',label:'No Preservatives'},{icon:'🚚',label:'Pan India'},{icon:'⭐',label:'10K+ Customers'}].map(t=>(
            <div key={t.label} style={{display:'flex',alignItems:'center',gap:7,fontSize:12,fontWeight:600,color:C.textMid,flexShrink:0}}>
              <span style={{fontSize:16}}>{t.icon}</span>{t.label}
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────────── */}
      <section style={{padding:isMobile?'40px 16px':'64px 24px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <motion.div {...fadeUp(0)} style={{textAlign:'center',marginBottom:isMobile?28:44}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,background:C.orangeLight,border:`1px solid ${C.orangeMid}`,padding:'5px 13px',borderRadius:20,marginBottom:10}}>
              <span style={{color:C.orange,fontSize:11,fontWeight:700,letterSpacing:'0.07em'}}>CATEGORIES</span>
            </div>
            <h2 style={{margin:0,fontSize:isMobile?'clamp(20px,6vw,28px)':'clamp(24px,3vw,36px)',fontWeight:900,letterSpacing:'-0.02em'}}>Choose Your Ghee</h2>
            <p style={{color:C.textLight,fontSize:14,marginTop:8}}>Two varieties, one uncompromising standard of purity</p>
          </motion.div>

          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:isMobile?14:20}}>
            {[
              {to:'/products?category=a1',tag:'A1',title:'Category A1',desc:'Premium ghee from HF & Jersey cows. Rich, creamy with classic golden hue.',emoji:'🥛',features:['Rich Flavor','Golden Color','High Fat'],bg:'linear-gradient(135deg,#fff8f0 0%,#fef0e4 100%)',border:C.orangeMid},
              {to:'/products?category=a2',tag:'A2',title:'Category A2',desc:'Organic ghee from pure desi Gir cow milk. Light, aromatic and easy to digest.',emoji:'🌿',features:['Easy Digest','Organic','Desi Cow'],bg:'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)',border:'#86efac'},
            ].map((cat,i)=>(
              <motion.div key={cat.tag} {...fadeUp(i*0.1)}>
                <Link to={cat.to} style={{textDecoration:'none',display:'block'}}>
                  <motion.div whileHover={{y:-3,boxShadow:C.shadowMd}}
                    style={{background:cat.bg,border:`1.5px solid ${cat.border}`,borderRadius:20,padding:isMobile?'22px 18px':'36px 32px',boxShadow:C.shadow,transition:'all 0.2s'}}>
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14}}>
                      <div>
                        <div style={{display:'inline-flex',background:C.orange,color:'#fff',padding:'3px 11px',borderRadius:20,fontSize:10,fontWeight:800,letterSpacing:'0.06em',marginBottom:10}}>{cat.tag} GHEE</div>
                        <h3 style={{margin:0,fontSize:isMobile?18:24,fontWeight:900,color:C.text,letterSpacing:'-0.01em'}}>{cat.title}</h3>
                      </div>
                      <div style={{fontSize:isMobile?36:52}}>{cat.emoji}</div>
                    </div>
                    <p style={{color:C.textMid,fontSize:isMobile?13:14,lineHeight:1.7,margin:'0 0 16px'}}>{cat.desc}</p>
                    <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:18}}>
                      {cat.features.map(f=><span key={f} style={{padding:'3px 10px',background:'rgba(255,255,255,0.7)',border:`1px solid ${cat.border}`,borderRadius:20,fontSize:11,fontWeight:700,color:C.textMid}}>✓ {f}</span>)}
                    </div>
                    <div style={{display:'inline-flex',alignItems:'center',gap:6,color:C.orange,fontWeight:800,fontSize:13}}>Explore {cat.tag} <FiArrowRight size={13}/></div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ──────────────────────────────────────────── */}
      <section style={{padding:isMobile?'40px 16px':'64px 24px',background:C.white}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <motion.div {...fadeUp(0)} style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:isMobile?22:36,flexWrap:'wrap',gap:12}}>
            <div>
              <div style={{display:'inline-flex',alignItems:'center',gap:7,background:C.orangeLight,border:`1px solid ${C.orangeMid}`,padding:'5px 13px',borderRadius:20,marginBottom:10}}>
                <FiStar size={11} style={{color:C.orange}}/>
                <span style={{color:C.orange,fontSize:11,fontWeight:700,letterSpacing:'0.07em'}}>FEATURED</span>
              </div>
              <h2 style={{margin:0,fontSize:isMobile?'clamp(20px,6vw,26px)':'clamp(22px,3vw,34px)',fontWeight:900,letterSpacing:'-0.02em'}}>Best Sellers</h2>
              <p style={{color:C.textLight,fontSize:13,marginTop:6}}>Hand-picked favourites loved by our customers</p>
            </div>
            <Link to="/products" style={{display:'inline-flex',alignItems:'center',gap:7,padding:'9px 18px',background:C.orangeLight,border:`1.5px solid ${C.orangeMid}`,borderRadius:10,color:C.orange,fontWeight:800,fontSize:13,textDecoration:'none'}}>
              View All <FiArrowRight size={13}/>
            </Link>
          </motion.div>

          {loading?(
            <div style={{textAlign:'center',padding:'50px 0'}}>
              <div style={{width:38,height:38,border:`3px solid ${C.border}`,borderTop:`3px solid ${C.orange}`,borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto'}}/>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ):featuredProducts.length>0?(
            <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':isTablet?'repeat(3,1fr)':'repeat(4,1fr)',gap:isMobile?12:18}}>
              {featuredProducts.map((product,i)=>(
                <motion.div key={product._id} {...fadeUp(i*0.07)}>
                  <ProductCard product={product}/>
                </motion.div>
              ))}
            </div>
          ):(
            <div style={{textAlign:'center',padding:'36px 0',color:C.textLight,fontSize:14}}>No featured products available.</div>
          )}
        </div>
      </section>

      {/* ── Why Choose Us ─────────────────────────────────────────────── */}
      <section style={{padding:isMobile?'40px 16px':'64px 24px',background:C.bg}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <motion.div {...fadeUp(0)} style={{textAlign:'center',marginBottom:isMobile?24:40}}>
            <h2 style={{margin:0,fontSize:isMobile?'clamp(20px,6vw,26px)':'clamp(22px,3vw,34px)',fontWeight:900,letterSpacing:'-0.02em'}}>Why Ghee Store?</h2>
            <p style={{color:C.textLight,fontSize:14,marginTop:8}}>We take pride in delivering nothing but the best</p>
          </motion.div>
          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':isTablet?'repeat(2,1fr)':'repeat(4,1fr)',gap:isMobile?12:18}}>
            {[{icon:'🐄',title:'Farm Sourced',desc:'Directly procured from trusted farms'},{icon:'🔥',title:'Bilona Method',desc:'Traditional hand-churning preserves nutrients'},{icon:'🧪',title:'Lab Tested',desc:'Every batch tested for purity'},{icon:'📦',title:'Safe Packaging',desc:'Hygienic tamper-proof containers'}].map((f,i)=>(
              <motion.div key={f.title} {...fadeUp(i*0.07)}>
                <motion.div whileHover={{y:-3,boxShadow:C.shadowMd}}
                  style={{background:C.white,border:`1.5px solid ${C.border}`,borderRadius:16,padding:isMobile?'20px 16px':'28px 24px',boxShadow:C.shadow,textAlign:'center',transition:'all 0.2s'}}>
                  <div style={{fontSize:isMobile?32:40,marginBottom:12}}>{f.icon}</div>
                  <h4 style={{margin:'0 0 7px',fontWeight:800,fontSize:isMobile?13:16,color:C.text}}>{f.title}</h4>
                  <p style={{margin:0,fontSize:isMobile?12:13,color:C.textLight,lineHeight:1.6}}>{f.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────── */}
      <section style={{padding:isMobile?'0 16px 40px':'0 24px 64px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <motion.div {...fadeUp(0)}
            style={{background:'linear-gradient(135deg,#1a1a2e 0%,#2d1810 100%)',borderRadius:isMobile?18:24,padding:isMobile?'32px 20px':'48px 40px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:20,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:-60,right:60,width:260,height:260,background:'radial-gradient(circle,rgba(232,98,26,0.15) 0%,transparent 65%)',borderRadius:'50%',pointerEvents:'none'}}/>
            <div style={{position:'relative',zIndex:1}}>
              <h3 style={{margin:'0 0 8px',fontWeight:900,fontSize:isMobile?'clamp(17px,5vw,22px)':'clamp(20px,3vw,30px)',color:'#fff',letterSpacing:'-0.02em'}}>Ready to taste purity? 🧈</h3>
              <p style={{margin:0,color:'rgba(255,255,255,0.55)',fontSize:isMobile?13:15}}>Free delivery on orders above ₹999 · Pan India shipping</p>
            </div>
            <Link to="/products" style={{display:'inline-flex',alignItems:'center',gap:9,padding:isMobile?'12px 22px':'14px 30px',background:C.orange,borderRadius:12,color:'#fff',fontWeight:800,fontSize:isMobile?14:15,textDecoration:'none',flexShrink:0,boxShadow:'0 8px 24px rgba(232,98,26,0.4)',position:'relative',zIndex:1}}>
              Order Now <FiArrowRight size={15}/>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home

