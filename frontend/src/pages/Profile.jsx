// import { useState, useEffect } from 'react'
// import { useAuth } from '../context/AuthContext'
// import axios from 'axios'

// const Profile = () => {
//   const { user } = useAuth()
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     address: {
//       street: '',
//       city: '',
//       state: '',
//       zipCode: '',
//       country: ''
//     }
//   })
//   const [message, setMessage] = useState('')

//   useEffect(() => {
//     if (user) {
//       fetchUserDetails()
//     }
//   }, [user])

//   const fetchUserDetails = async () => {
//     try {
//       const res = await api.get('/api/auth/me')
//       setFormData({
//         name: res.data.name || '',
//         email: res.data.email || '',
//         phone: res.data.phone || '',
//         address: res.data.address || {
//           street: '',
//           city: '',
//           state: '',
//           zipCode: '',
//           country: ''
//         }
//       })
//     } catch (error) {
//       console.error('Error fetching user details:', error)
//     }
//   }

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     if (name.startsWith('address.')) {
//       const field = name.split('.')[1]
//       setFormData({
//         ...formData,
//         address: {
//           ...formData.address,
//           [field]: value
//         }
//       })
//     } else {
//       setFormData({
//         ...formData,
//         [name]: value
//       })
//     }
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     try {
//       // Update user profile (you'll need to create this endpoint)
//       setMessage('Profile updated successfully!')
//       setTimeout(() => setMessage(''), 3000)
//     } catch (error) {
//       setMessage('Error updating profile')
//     }
//   }

//   if (!user) {
//     return <div>Please log in to view your profile</div>
//   }

//   return (
//     <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <h1 className="text-4xl font-bold mb-8">My Profile</h1>

//       {message && (
//         <div className={`mb-4 p-4 rounded ${
//           message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
//         }`}>
//           {message}
//         </div>
//       )}

//       <div className="bg-white rounded-lg shadow-lg p-8">
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-gray-700 font-semibold mb-2">Name</label>
//               <input
//                 type="text"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
//               />
//             </div>
//             <div>
//               <label className="block text-gray-700 font-semibold mb-2">Email</label>
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 disabled
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-gray-700 font-semibold mb-2">Phone</label>
//             <input
//               type="tel"
//               name="phone"
//               value={formData.phone}
//               onChange={handleChange}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
//             />
//           </div>

//           <div>
//             <h3 className="text-xl font-semibold mb-4">Address</h3>
//             <div className="space-y-4">
//               <input
//                 type="text"
//                 name="address.street"
//                 value={formData.address.street}
//                 onChange={handleChange}
//                 placeholder="Street Address"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
//               />
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <input
//                   type="text"
//                   name="address.city"
//                   value={formData.address.city}
//                   onChange={handleChange}
//                   placeholder="City"
//                   className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
//                 />
//                 <input
//                   type="text"
//                   name="address.state"
//                   value={formData.address.state}
//                   onChange={handleChange}
//                   placeholder="State"
//                   className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
//                 />
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <input
//                   type="text"
//                   name="address.zipCode"
//                   value={formData.address.zipCode}
//                   onChange={handleChange}
//                   placeholder="Zip Code"
//                   className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
//                 />
//                 <input
//                   type="text"
//                   name="address.country"
//                   value={formData.address.country}
//                   onChange={handleChange}
//                   placeholder="Country"
//                   className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
//                 />
//               </div>
//             </div>
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
//           >
//             Update Profile
//           </button>
//         </form>
//       </div>
//     </div>
//   )
// }

// export default Profile
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import {
  FiUser, FiMapPin, FiPhone, FiMail, FiPlus, FiEdit2,
  FiTrash2, FiCheck, FiX, FiHome, FiBriefcase,
  FiAlertCircle, FiCheckCircle, FiStar, FiSearch,
  FiCamera, FiLock,
} from 'react-icons/fi'

const C = {
  orange:      '#e8621a', orangeHov: '#cf5618',
  orangeLight: '#fff4ee', orangeMid: '#fddcca',
  bg:          '#f2f4f6', white: '#ffffff',
  text:        '#1a1a2e', textMid: '#444455', textLight: '#8899aa',
  border:      '#e4e9f0',
  shadow:      '0 2px 12px rgba(0,0,0,0.07)',
  shadowMd:    '0 6px 28px rgba(0,0,0,0.11)',
  green:       '#16a34a', greenBg: '#dcfce7',
  red:         '#dc2626', redBg:   '#fee2e2',
  yellow:      '#b45309', yellowBg: '#fef3c7',
  grayBg:      '#f1f5f9',
  font:        "'Inter', system-ui, sans-serif",
}

const STATES = [
  'Andaman and Nicobar Islands','Andhra Pradesh','Arunachal Pradesh','Assam',
  'Bihar','Chandigarh','Chhattisgarh','Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jammu and Kashmir',
  'Jharkhand','Karnataka','Kerala','Ladakh','Lakshadweep','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Puducherry',
  'Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal',
]

const DISTRICTS = {
  'Maharashtra':    ['Ahmednagar','Akola','Amravati','Aurangabad','Beed','Bhandara','Buldhana','Chandrapur','Dhule','Gadchiroli','Gondia','Hingoli','Jalgaon','Jalna','Kolhapur','Latur','Mumbai City','Mumbai Suburban','Nagpur','Nanded','Nandurbar','Nashik','Osmanabad','Palghar','Parbhani','Pune','Raigad','Ratnagiri','Sangli','Satara','Sindhudurg','Solapur','Thane','Wardha','Washim','Yavatmal'],
  'Delhi':          ['Central Delhi','East Delhi','New Delhi','North Delhi','North East Delhi','North West Delhi','Shahdara','South Delhi','South East Delhi','South West Delhi','West Delhi'],
  'Gujarat':        ['Ahmedabad','Amreli','Anand','Aravalli','Banaskantha','Bharuch','Bhavnagar','Botad','Chhota Udaipur','Dahod','Dang','Devbhoomi Dwarka','Gandhinagar','Gir Somnath','Jamnagar','Junagadh','Kheda','Kutch','Mahisagar','Mehsana','Morbi','Narmada','Navsari','Panchmahal','Patan','Porbandar','Rajkot','Sabarkantha','Surat','Surendranagar','Tapi','Vadodara','Valsad'],
  'Karnataka':      ['Bagalkot','Ballari','Belagavi','Bengaluru Rural','Bengaluru Urban','Bidar','Chamarajanagar','Chikballapur','Chikkamagaluru','Chitradurga','Dakshina Kannada','Davanagere','Dharwad','Gadag','Hassan','Haveri','Kalaburagi','Kodagu','Kolar','Koppal','Mandya','Mysuru','Raichur','Ramanagara','Shivamogga','Tumakuru','Udupi','Uttara Kannada','Vijayapura','Yadgir'],
  'Tamil Nadu':     ['Ariyalur','Chengalpattu','Chennai','Coimbatore','Cuddalore','Dharmapuri','Dindigul','Erode','Kallakurichi','Kancheepuram','Karur','Krishnagiri','Madurai','Mayiladuthurai','Nagapattinam','Namakkal','Nilgiris','Perambalur','Pudukkottai','Ramanathapuram','Ranipet','Salem','Sivaganga','Tenkasi','Thanjavur','Theni','Thoothukudi','Tiruchirappalli','Tirunelveli','Tirupathur','Tiruppur','Tiruvallur','Tiruvannamalai','Tiruvarur','Vellore','Viluppuram','Virudhunagar'],
  'Uttar Pradesh':  ['Agra','Aligarh','Ambedkar Nagar','Amethi','Amroha','Auraiya','Ayodhya','Azamgarh','Baghpat','Bahraich','Ballia','Balrampur','Banda','Barabanki','Bareilly','Basti','Bhadohi','Bijnor','Budaun','Bulandshahr','Chandauli','Chitrakoot','Deoria','Etah','Etawah','Farrukhabad','Fatehpur','Firozabad','Gautam Buddha Nagar','Ghaziabad','Ghazipur','Gonda','Gorakhpur','Hamirpur','Hapur','Hardoi','Hathras','Jalaun','Jaunpur','Jhansi','Kannauj','Kanpur Dehat','Kanpur Nagar','Kasganj','Kaushambi','Kushinagar','Lakhimpur Kheri','Lalitpur','Lucknow','Maharajganj','Mahoba','Mainpuri','Mathura','Mau','Meerut','Mirzapur','Moradabad','Muzaffarnagar','Pilibhit','Pratapgarh','Prayagraj','Raebareli','Rampur','Saharanpur','Sambhal','Sant Kabir Nagar','Shahjahanpur','Shamli','Shravasti','Siddharthnagar','Sitapur','Sonbhadra','Sultanpur','Unnao','Varanasi'],
  'Rajasthan':      ['Ajmer','Alwar','Banswara','Baran','Barmer','Bharatpur','Bhilwara','Bikaner','Bundi','Chittorgarh','Churu','Dausa','Dholpur','Dungarpur','Hanumangarh','Jaipur','Jaisalmer','Jalore','Jhalawar','Jhunjhunu','Jodhpur','Karauli','Kota','Nagaur','Pali','Pratapgarh','Rajsamand','Sawai Madhopur','Sikar','Sirohi','Sri Ganganagar','Tonk','Udaipur'],
  'West Bengal':    ['Alipurduar','Bankura','Birbhum','Cooch Behar','Dakshin Dinajpur','Darjeeling','Hooghly','Howrah','Jalpaiguri','Jhargram','Kalimpong','Kolkata','Malda','Murshidabad','Nadia','North 24 Parganas','Paschim Bardhaman','Paschim Medinipur','Purba Bardhaman','Purba Medinipur','Purulia','South 24 Parganas','Uttar Dinajpur'],
  'Telangana':      ['Adilabad','Bhadradri Kothagudem','Hyderabad','Jagtial','Jangaon','Jayashankar Bhupalpally','Jogulamba Gadwal','Kamareddy','Karimnagar','Khammam','Kumuram Bheem','Mahabubabad','Mahabubnagar','Mancherial','Medak','Medchal-Malkajgiri','Mulugu','Nagarkurnool','Nalgonda','Narayanpet','Nirmal','Nizamabad','Peddapalli','Rajanna Sircilla','Rangareddy','Sangareddy','Siddipet','Suryapet','Vikarabad','Wanaparthy','Warangal Rural','Warangal Urban','Yadadri Bhuvanagiri'],
  'Andhra Pradesh': ['Alluri Sitharama Raju','Anakapalli','Anantapur','Annamayya','Bapatla','Chittoor','East Godavari','Eluru','Guntur','Kadapa','Kakinada','Krishna','Kurnool','Nandyal','Nellore','Palnadu','Prakasam','Srikakulam','Tirupati','Visakhapatnam','Vizianagaram','West Godavari'],
  'Kerala':         ['Alappuzha','Ernakulam','Idukki','Kannur','Kasaragod','Kollam','Kottayam','Kozhikode','Malappuram','Palakkad','Pathanamthitta','Thiruvananthapuram','Thrissur','Wayanad'],
  'Madhya Pradesh': ['Agar Malwa','Alirajpur','Anuppur','Ashoknagar','Balaghat','Barwani','Betul','Bhind','Bhopal','Burhanpur','Chhatarpur','Chhindwara','Damoh','Datia','Dewas','Dhar','Dindori','Guna','Gwalior','Harda','Hoshangabad','Indore','Jabalpur','Jhabua','Katni','Khandwa','Khargone','Mandla','Mandsaur','Morena','Narsinghpur','Neemuch','Niwari','Panna','Raisen','Rajgarh','Ratlam','Rewa','Sagar','Satna','Sehore','Seoni','Shahdol','Shajapur','Sheopur','Shivpuri','Sidhi','Singrauli','Tikamgarh','Ujjain','Umaria','Vidisha'],
  'Punjab':         ['Amritsar','Barnala','Bathinda','Faridkot','Fatehgarh Sahib','Fazilka','Ferozepur','Gurdaspur','Hoshiarpur','Jalandhar','Kapurthala','Ludhiana','Mansa','Moga','Mohali','Muktsar','Nawanshahr','Pathankot','Patiala','Rupnagar','Sangrur','Tarn Taran'],
  'Haryana':        ['Ambala','Bhiwani','Charkhi Dadri','Faridabad','Fatehabad','Gurugram','Hisar','Jhajjar','Jind','Kaithal','Karnal','Kurukshetra','Mahendragarh','Nuh','Palwal','Panchkula','Panipat','Rewari','Rohtak','Sirsa','Sonipat','Yamunanagar'],
  'Bihar':          ['Araria','Arwal','Aurangabad','Banka','Begusarai','Bhagalpur','Bhojpur','Buxar','Darbhanga','East Champaran','Gaya','Gopalganj','Jamui','Jehanabad','Kaimur','Katihar','Khagaria','Kishanganj','Lakhisarai','Madhepura','Madhubani','Munger','Muzaffarpur','Nalanda','Nawada','Patna','Purnia','Rohtas','Saharsa','Samastipur','Saran','Sheikhpura','Sheohar','Sitamarhi','Siwan','Supaul','Vaishali','West Champaran'],
  'Odisha':         ['Angul','Balangir','Balasore','Bargarh','Bhadrak','Boudh','Cuttack','Deogarh','Dhenkanal','Gajapati','Ganjam','Jagatsinghpur','Jajpur','Jharsuguda','Kalahandi','Kandhamal','Kendrapara','Kendujhar','Khordha','Koraput','Malkangiri','Mayurbhanj','Nabarangpur','Nayagarh','Nuapada','Puri','Rayagada','Sambalpur','Sonepur','Sundargarh'],
}

const LABELS = [
  { value: 'Home',  Icon: FiHome,      color: '#3B82F6' },
  { value: 'Work',  Icon: FiBriefcase, color: '#8B5CF6' },
  { value: 'Other', Icon: FiMapPin,    color: '#EC4899' },
]

const emptyAddr = {
  label: 'Home', name: '', phone: '', street: '',
  city: '', district: '', state: '', zipCode: '', country: 'India', isDefault: false,
}

// ── PIN auto-lookup via India Post API ────────────────────────────────────────
const lookupPin = async (pin) => {
  if (pin.length !== 6) return null
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
    const data = await res.json()
    if (data[0]?.Status === 'Success' && data[0].PostOffice?.length) {
      const po = data[0].PostOffice[0]
      return { state: po.State, district: po.District, city: po.Division || po.District }
    }
  } catch (_) {}
  return null
}

// ── StableInput — fixes cursor-reset bug in controlled inputs ─────────────────
// The bug occurs because React re-renders reset cursor position.
// This component saves cursor position before state update and restores it after.
const StableInput = ({ value, onChange, style, ...rest }) => {
  const ref = useRef(null)
  const savedPos = useRef(null)

  const handleChange = (e) => {
    savedPos.current = e.target.selectionStart
    onChange(e)
  }

  // After every render, if this input is focused, restore cursor
  useEffect(() => {
    const el = ref.current
    if (el && savedPos.current !== null && document.activeElement === el) {
      try { el.setSelectionRange(savedPos.current, savedPos.current) } catch (_) {}
    }
  })

  return <input ref={ref} value={value} onChange={handleChange} style={style} {...rest} />
}

// ── Shared input style ────────────────────────────────────────────────────────
const iS = (extra = {}) => ({
  width: '100%', boxSizing: 'border-box',
  border: `1.5px solid ${C.border}`, borderRadius: 10,
  padding: '11px 14px', fontSize: 14, color: C.text,
  outline: 'none', fontFamily: C.font, background: C.white,
  transition: 'border-color 0.2s, box-shadow 0.2s', ...extra,
})
const oF = e => { e.target.style.borderColor = C.orange; e.target.style.boxShadow = '0 0 0 3px rgba(232,98,26,0.12)' }
const oB = e => { e.target.style.borderColor = C.border;  e.target.style.boxShadow = 'none' }

const FL = ({ label, required, hint, col, children }) => (
  <div style={{ gridColumn: col || 'span 1' }}>
    {label && <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.textMid, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {label}{required && <span style={{ color: C.orange }}> *</span>}
    </label>}
    {children}
    {hint && <p style={{ margin: '5px 0 0', fontSize: 11, color: hint.startsWith('✓') ? C.green : C.textLight }}>{hint}</p>}
  </div>
)

const Toast = ({ msg }) => !msg ? null : (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', borderRadius: 10, marginBottom: 18, fontSize: 13, fontWeight: 600, background: msg.type === 'success' ? C.greenBg : C.redBg, color: msg.type === 'success' ? C.green : C.red, border: `1.5px solid ${msg.type === 'success' ? '#86efac' : '#fca5a5'}` }}>
    {msg.type === 'success' ? <FiCheckCircle size={15} /> : <FiAlertCircle size={15} />} {msg.text}
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
const Profile = () => {
  const { user, setUser } = useAuth()
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  // Individual states prevent cursor-reset (not nested object)
  const [name,  setName]  = useState('')
  const [phone, setPhone] = useState('')
  const [profMsg,     setProfMsg]     = useState(null)
  const [profLoading, setProfLoading] = useState(false)

  const [addresses,    setAddresses]   = useState([])
  const [showForm,     setShowForm]    = useState(false)
  const [editId,       setEditId]      = useState(null)
  const [addrForm,     setAddrForm]    = useState(emptyAddr)
  const [addrLoading,  setAddrLoading] = useState(false)
  const [addrMsg,      setAddrMsg]     = useState(null)
  const [deletingId,   setDeletingId]  = useState(null)
  const [pinLoading,   setPinLoading]  = useState(false)
  const [districtList, setDistrictList] = useState([])

  useEffect(() => { if (user) fetchProfile() }, [user])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/api/auth/me', { headers })
      setName(res.data.name || '')
      setPhone(res.data.phone || '')
      setAddresses(res.data.addresses || [])
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    setDistrictList(DISTRICTS[addrForm.state] || [])
    if (addrForm.district && !(DISTRICTS[addrForm.state] || []).includes(addrForm.district))
      setAddrForm(p => ({ ...p, district: '' }))
  }, [addrForm.state])

  const handlePinChange = useCallback(async (pin) => {
    const cleaned = pin.replace(/\D/g, '').slice(0, 6)
    setAddrForm(p => ({ ...p, zipCode: cleaned }))
    if (cleaned.length === 6) {
      setPinLoading(true)
      const result = await lookupPin(cleaned)
      if (result) {
        setAddrForm(p => ({ ...p, zipCode: cleaned, state: result.state || p.state, district: result.district || p.district, city: result.city || p.city }))
        setDistrictList(DISTRICTS[result.state] || [])
      }
      setPinLoading(false)
    }
  }, [])

  const handleProfileSubmit = async (e) => {
    e.preventDefault(); setProfLoading(true)
    try {
      const res = await api.put('/api/auth/profile', { name, phone }, { headers })
      setUser?.(prev => ({ ...prev, name: res.data.name }))
      setProfMsg({ type: 'success', text: 'Profile updated successfully!' })
    } catch (err) {
      setProfMsg({ type: 'error', text: err.response?.data?.message || 'Update failed' })
    } finally {
      setProfLoading(false)
      setTimeout(() => setProfMsg(null), 3000)
    }
  }

  const handleAddrSubmit = async (e) => {
    e.preventDefault(); setAddrLoading(true)
    try {
      const res = editId
        ? await api.put(`/api/auth/addresses/${editId}`, addrForm, { headers })
        : await api.post('/api/auth/addresses', addrForm, { headers })
      setAddresses(res.data.addresses)
      closeForm()
      setAddrMsg({ type: 'success', text: editId ? 'Address updated!' : 'Address added!' })
    } catch (err) {
      setAddrMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save' })
    } finally {
      setAddrLoading(false)
      setTimeout(() => setAddrMsg(null), 3000)
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      const res = await api.delete(`/api/auth/addresses/${id}`, { headers })
      setAddresses(res.data.addresses)
    } catch (e) { console.error(e) }
    finally { setDeletingId(null) }
  }

  const handleSetDefault = async (id) => {
    try {
      const res = await api.patch(`/api/auth/addresses/${id}/default`, {}, { headers })
      setAddresses(res.data.addresses)
    } catch (e) { console.error(e) }
  }

  const openEdit = (addr) => {
    setAddrForm({ ...addr })
    setDistrictList(DISTRICTS[addr.state] || [])
    setEditId(String(addr._id))
    setShowForm(true)
  }

  const closeForm = () => { setShowForm(false); setEditId(null); setAddrForm(emptyAddr); setDistrictList([]) }
  const af = f => e => setAddrForm(p => ({ ...p, [f]: e.target.value }))

  if (!user) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: C.font }}>
      <p style={{ color: C.textLight }}>Please log in to view your profile.</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: C.font, color: C.text }}>

      {/* Header */}
      <div style={{ background: C.white, borderBottom: `1.5px solid ${C.border}`, padding: '20px 28px', boxShadow: C.shadow }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, background: C.orange, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiUser size={20} color="#fff" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Account</p>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>My Profile</h1>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 20px 60px' }}>

        {/* Avatar hero */}
        <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 20, padding: '24px 28px', boxShadow: C.shadow, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${C.orange}, ${C.orangeMid})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 900, color: '#fff', border: `3px solid ${C.orangeMid}` }}>
              {(name || user.name || 'U')[0].toUpperCase()}
            </div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, background: C.orange, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
              <FiCamera size={10} color="#fff" />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: '0 0 3px', fontSize: 19, fontWeight: 800 }}>{name || user.name}</h2>
            <p style={{ margin: '0 0 8px', fontSize: 13, color: C.textLight }}>{user.email}</p>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: user.role === 'admin' ? C.yellowBg : C.orangeLight, color: user.role === 'admin' ? C.yellow : C.orange }}>
                {user.role === 'admin' ? '⚡ Admin' : '👤 Customer'}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: C.greenBg, color: C.green }}>
                ✓ {addresses.length} address{addresses.length !== 1 ? 'es' : ''} saved
              </span>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 20, overflow: 'hidden', boxShadow: C.shadow, marginBottom: 20 }}>
          <div style={{ padding: '16px 24px', borderBottom: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: C.orangeLight, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiUser size={16} style={{ color: C.orange }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Personal Information</h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: C.textLight }}>Update your name and phone number</p>
            </div>
          </div>
          <div style={{ padding: '24px' }}>
            <Toast msg={profMsg} />
            <form onSubmit={handleProfileSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

                <FL label="Full Name" required col="span 1">
                  {/* ✅ StableInput — cursor never resets */}
                  <StableInput
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="Your full name"
                    style={iS()}
                    onFocus={oF} onBlur={oB}
                  />
                </FL>

                <FL label="Email Address" col="span 1">
                  <div style={{ position: 'relative' }}>
                    <FiMail size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.textLight }} />
                    <FiLock size={11} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: C.textLight }} />
                    <input type="email" value={user.email} disabled style={iS({ paddingLeft: 34, paddingRight: 32, background: C.grayBg, color: C.textLight, cursor: 'not-allowed' })} />
                  </div>
                  <p style={{ margin: '5px 0 0', fontSize: 11, color: C.textLight }}>Email cannot be changed</p>
                </FL>

                <FL label="Phone Number" col="span 2">
                  <div style={{ position: 'relative' }}>
                    <FiPhone size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.textLight }} />
                    {/* ✅ StableInput — fixes cursor-reset on phone field */}
                    <StableInput
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      style={iS({ paddingLeft: 34 })}
                      onFocus={oF} onBlur={oB}
                    />
                  </div>
                </FL>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={profLoading}
                  style={{ padding: '12px 28px', background: profLoading ? '#f0a070' : C.orange, border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 14, cursor: profLoading ? 'not-allowed' : 'pointer', fontFamily: C.font, boxShadow: '0 4px 16px rgba(232,98,26,0.25)', transition: 'background 0.2s' }}
                  onMouseEnter={e => { if (!profLoading) e.currentTarget.style.background = C.orangeHov }}
                  onMouseLeave={e => { if (!profLoading) e.currentTarget.style.background = profLoading ? '#f0a070' : C.orange }}>
                  {profLoading ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Addresses */}
        <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 20, overflow: 'hidden', boxShadow: C.shadow }}>
          <div style={{ padding: '16px 24px', borderBottom: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: C.orangeLight, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiMapPin size={16} style={{ color: C.orange }} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Saved Addresses</h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: C.textLight }}>Manage your delivery locations</p>
            </div>
            {!showForm && (
              <button onClick={() => { closeForm(); setShowForm(true) }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: C.orange, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: C.font }}>
                <FiPlus size={14} /> Add
              </button>
            )}
          </div>

          <div style={{ padding: '20px 24px' }}>
            <Toast msg={addrMsg} />

            {/* Address grid */}
            {addresses.length > 0 && !showForm && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: 0 }}>
                {addresses.map(addr => {
                  const lc = LABELS.find(l => l.value === addr.label) || LABELS[2]
                  const LI = lc.Icon
                  return (
                    <div key={String(addr._id)} style={{ border: `1.5px solid ${addr.isDefault ? C.orange : C.border}`, background: addr.isDefault ? C.orangeLight : C.grayBg, borderRadius: 16, padding: '16px', position: 'relative' }}>
                      {addr.isDefault && <span style={{ position: 'absolute', top: 10, right: 10, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: C.orange, color: '#fff' }}>Default</span>}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: `${lc.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <LI size={16} style={{ color: lc.color }} />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: C.text }}>{addr.label}</p>
                          <p style={{ margin: 0, fontSize: 12, color: C.textMid }}>{addr.name}</p>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7, marginBottom: 12 }}>
                        <p style={{ margin: 0 }}>{addr.street}</p>
                        <p style={{ margin: 0 }}>{addr.city}{addr.district && addr.district !== addr.city ? `, ${addr.district}` : ''}</p>
                        <p style={{ margin: 0 }}>{addr.state} — {addr.zipCode}</p>
                        <p style={{ margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: 4, color: C.textLight }}>
                          <FiPhone size={10} /> {addr.phone}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {!addr.isDefault && (
                          <button onClick={() => handleSetDefault(String(addr._id))} style={{ flex: 1, padding: '6px', background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 8, color: C.textMid, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: C.font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                            <FiStar size={11} /> Default
                          </button>
                        )}
                        <button onClick={() => openEdit(addr)} style={{ flex: 1, padding: '6px', background: C.orangeLight, border: `1.5px solid ${C.orangeMid}`, borderRadius: 8, color: C.orange, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: C.font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                          <FiEdit2 size={11} /> Edit
                        </button>
                        <button onClick={() => handleDelete(String(addr._id))} disabled={deletingId === String(addr._id)} style={{ flex: 1, padding: '6px', background: C.redBg, border: '1.5px solid #fca5a5', borderRadius: 8, color: C.red, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: C.font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                          <FiTrash2 size={11} /> {deletingId === String(addr._id) ? '…' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Address Form */}
            {showForm && (
              <div style={{ background: C.grayBg, border: `1.5px solid ${C.border}`, borderRadius: 16, padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: C.text }}>{editId ? 'Edit Address' : 'New Address'}</h3>
                  <button type="button" onClick={closeForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textLight, padding: 4 }}><FiX size={18} /></button>
                </div>

                <form onSubmit={handleAddrSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

                    {/* Label selector */}
                    <FL label="Address Type" col="span 2">
                      <div style={{ display: 'flex', gap: 8 }}>
                        {LABELS.map(l => {
                          const LI = l.Icon; const active = addrForm.label === l.value
                          return (
                            <button key={l.value} type="button" onClick={() => setAddrForm(p => ({ ...p, label: l.value }))}
                              style={{ flex: 1, padding: '9px', border: `1.5px solid ${active ? l.color : C.border}`, borderRadius: 10, background: active ? `${l.color}14` : C.white, color: active ? l.color : C.textLight, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: C.font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}>
                              <LI size={14} /> {l.value}
                            </button>
                          )
                        })}
                      </div>
                    </FL>

                    {/* Recipient name + phone */}
                    <FL label="Recipient Name" required>
                      <StableInput type="text" value={addrForm.name} onChange={af('name')} required placeholder="Full name" style={iS()} onFocus={oF} onBlur={oB} />
                    </FL>
                    <FL label="Phone Number" required>
                      <StableInput type="tel" value={addrForm.phone} onChange={af('phone')} required placeholder="+91 98765 43210" style={iS()} onFocus={oF} onBlur={oB} />
                    </FL>

                    {/* Street */}
                    <FL label="Street Address" required col="span 2">
                      <StableInput type="text" value={addrForm.street} onChange={af('street')} required placeholder="House no., building, street, area" style={iS()} onFocus={oF} onBlur={oB} />
                    </FL>

                    {/* PIN — auto fills state/district/city via India Post API */}
                    <FL label="PIN Code" required hint={pinLoading ? '⏳ Looking up PIN…' : addrForm.state ? `✓ ${addrForm.state}` : 'Auto-fills state & district'}>
                      <div style={{ position: 'relative' }}>
                        <FiSearch size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: pinLoading ? C.orange : C.textLight }} />
                        <StableInput
                          type="text" value={addrForm.zipCode}
                          onChange={e => handlePinChange(e.target.value)}
                          required maxLength={6} placeholder="6-digit PIN"
                          style={iS({ paddingLeft: 34 })} onFocus={oF} onBlur={oB}
                        />
                      </div>
                    </FL>

                    {/* State dropdown */}
                    <FL label="State / UT" required>
                      <select value={addrForm.state} onChange={e => setAddrForm(p => ({ ...p, state: e.target.value, district: '' }))} required style={{ ...iS(), cursor: 'pointer' }} onFocus={oF} onBlur={oB}>
                        <option value="">Select State</option>
                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </FL>

                    {/* District — dropdown if available, else text */}
                    <FL label="District" required>
                      {districtList.length > 0 ? (
                        <select value={addrForm.district} onChange={af('district')} required style={{ ...iS(), cursor: 'pointer' }} onFocus={oF} onBlur={oB}>
                          <option value="">Select District</option>
                          {districtList.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      ) : (
                        <StableInput type="text" value={addrForm.district} onChange={af('district')} required placeholder="Enter district" style={iS()} onFocus={oF} onBlur={oB} />
                      )}
                    </FL>

                    {/* City */}
                    <FL label="City / Town" required col="span 2">
                      <StableInput type="text" value={addrForm.city} onChange={af('city')} required placeholder="City or town name" style={iS()} onFocus={oF} onBlur={oB} />
                    </FL>

                    {/* Default toggle */}
                    <FL col="span 2">
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '11px 14px', background: C.white, border: `1.5px solid ${addrForm.isDefault ? C.orange : C.border}`, borderRadius: 10 }}>
                        <input type="checkbox" checked={addrForm.isDefault} onChange={e => setAddrForm(p => ({ ...p, isDefault: e.target.checked }))} style={{ width: 16, height: 16, accentColor: C.orange, cursor: 'pointer' }} />
                        <div>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.text }}>Set as Default Address</p>
                          <p style={{ margin: 0, fontSize: 11, color: C.textLight }}>Auto-selected at checkout</p>
                        </div>
                      </label>
                    </FL>

                    {/* Submit */}
                    <FL col="span 2">
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button type="submit" disabled={addrLoading}
                          style={{ flex: 1, padding: '13px', background: addrLoading ? '#f0a070' : C.orange, border: 'none', borderRadius: 12, color: '#fff', fontWeight: 800, fontSize: 14, cursor: addrLoading ? 'not-allowed' : 'pointer', fontFamily: C.font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 16px rgba(232,98,26,0.25)' }}>
                          <FiCheck size={15} /> {addrLoading ? 'Saving…' : editId ? 'Update Address' : 'Save Address'}
                        </button>
                        <button type="button" onClick={closeForm} style={{ padding: '13px 20px', background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 12, color: C.textMid, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: C.font }}>
                          Cancel
                        </button>
                      </div>
                    </FL>
                  </div>
                </form>
              </div>
            )}

            {/* Empty state */}
            {addresses.length === 0 && !showForm && (
              <div style={{ textAlign: 'center', padding: '36px 20px' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📍</div>
                <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 15, color: C.text }}>No addresses yet</p>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: C.textLight }}>Add an address for faster checkout</p>
                <button onClick={() => setShowForm(true)} style={{ padding: '10px 20px', background: C.orange, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: C.font, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <FiPlus size={14} /> Add First Address
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
