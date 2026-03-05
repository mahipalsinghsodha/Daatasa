import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'

const Checkout = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchCart()
    if (user.address) {
      setShippingAddress(user.address)
    }
  }, [user])

  const fetchCart = async () => {
    try {
      const res = await axios.get('/api/cart')
      setCart(res.data)
      if (res.data.items.length === 0) {
        navigate('/cart')
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setShippingAddress({
      ...shippingAddress,
      [name]: value
    })
  }

  const calculateTotal = () => {
    if (!cart || !cart.items) return { subtotal: 0, tax: 0, shipping: 0, total: 0 }
    
    const subtotal = cart.items.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity,
      0
    )
    const tax = subtotal * 0.18
    const shipping = subtotal > 500 ? 0 : 50
    const total = subtotal + tax + shipping

    return { subtotal, tax, shipping, total }
  }

//   const handleSubmit = async (e) => {
//   e.preventDefault()
//   setLoading(true)

//   try {
//     const token = localStorage.getItem('token')

//     // 1️⃣ CREATE ORDER FIRST (FOR BOTH COD & ONLINE)
//     const { data: order } = await axios.post(
//       '/api/orders',
//       {
//         shippingAddress,
//         paymentMethod
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       }
//     )

//     // 2️⃣ COD → DONE
//     if (paymentMethod === 'COD') {
//       navigate('/orders')
//       return
//     }

//     // 3️⃣ ONLINE → START PAYMENT
//     await handleOnlinePayment()

//   } catch (error) {
//     console.error(error)
//     toast.error('Order creation failed')
//   } finally {
//     setLoading(false)
//   }
// }



  const totals = calculateTotal()

  if (!cart || cart.items.length === 0) {
    return null
  }

//   const handleOnlinePayment = async () => {
//   try {
//     const token = localStorage.getItem('token')

//     // 1️⃣ Create Razorpay order (NO amount)
//     const { data: razorOrder } = await axios.post(
//       '/api/payment/create-order',
//       {},
//       {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       }
//     )

//     const options = {
//       key: "rzp_test_EvzmZvtG1AJQAS",
//       amount: razorOrder.amount,
//       currency: 'INR',
//       name: 'Shayar Dairy',
//       description: 'Order Payment',
//       order_id: razorOrder.id,

//       // 2️⃣ Payment Success Handler
//       handler: async (response) => {
//         // 3️⃣ Verify payment
//         const verifyRes = await axios.post(
//           '/api/payment/verify',
//           response,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`
//             }
//           }
//         )

//         if (!verifyRes.data.success) {
//           toast.error('Payment verification failed')
//           return
//         }

//         // 4️⃣ Create order AFTER verification
//         await axios.post(
//           '/api/orders',
//           {
//             shippingAddress,
//             paymentMethod: 'Online',
//             paymentInfo: {
//               razorpay_order_id: response.razorpay_order_id,
//               razorpay_payment_id: response.razorpay_payment_id,
//               razorpay_signature: response.razorpay_signature
//             }
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`
//             }
//           }
//         )

//         navigate('/orders')
//       },

//       prefill: {
//         name: user.name,
//         email: user.email
//       },

//       theme: {
//         color: '#3399cc'
//       }
//     }

//     const rzp = new window.Razorpay(options)
//     rzp.open()

//   } catch (error) {
//     console.error(error)
//     toast.error('Payment failed, try again')
//   }
// }


const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)

  try {
    if (paymentMethod === 'COD') {
      await createCODOrder()
      navigate('/orders')
    } else {
      await startOnlinePayment()
    }
  } catch (error) {
    console.error(error)
    toast.error('Something went wrong')
  } finally {
    setLoading(false)
  }
}
const createCODOrder = async () => {
  const token = localStorage.getItem('token')

  await axios.post(
    '/api/orders',
    {
      shippingAddress,
      paymentMethod: 'COD'
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
}

const startOnlinePayment = async () => {
  const token = localStorage.getItem('token')

  // 1️⃣ CREATE RAZORPAY ORDER FIRST
   const { data: order } = await axios.post(
    '/api/orders',
    {
      shippingAddress,
      paymentMethod: 'Online'
    },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  )

  // 2️⃣ CREATE RAZORPAY ORDER USING DB ORDER ID
  const { data: razorOrder } = await axios.post(
    '/api/payment/create-order',
    { orderId: order._id },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  )

  // 3️⃣ OPEN RAZORPAY
  openRazorpay(razorOrder.id)
}
const openRazorpay = (razorpayOrderId) => {
  const token = localStorage.getItem('token')

  const options = {
    key: 'rzp_test_EvzmZvtG1AJQAS',
    order_id: razorpayOrderId,
    name: 'Shayar Dairy',
    currency: 'INR',

    // ✅ SUCCESS
    handler: async (response) => {
      await axios.post(
        '/api/payment/verify',
        response,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      navigate('/orders')
    },

    // ❌ POPUP CLOSED
    modal: {
      ondismiss: async () => {
        await axios.post(
          '/api/orders/fail',
          { razorpay_order_id: razorpayOrderId },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )

        toast.error('Payment cancelled')
      }
    }
  }

  const rzp = new window.Razorpay(options)

  // ❌ PAYMENT FAILED
  rzp.on('payment.failed', async () => {
    await axios.post(
      '/api/orders/fail',
      { razorpay_order_id: razorpayOrderId },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    toast.error('Payment failed')
  })

  rzp.open()
}


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  name="street"
                  value={shippingAddress.street}
                  onChange={handleChange}
                  placeholder="Street Address"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleChange}
                    placeholder="City"
                    required
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleChange}
                    placeholder="State"
                    required
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="zipCode"
                    value={shippingAddress.zipCode}
                    onChange={handleChange}
                    placeholder="Zip Code"
                    required
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleChange}
                    placeholder="Country"
                    required
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Payment Method</h2>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-primary-600"
                  />
                  <span>Cash on Delivery</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="Online"
                    checked={paymentMethod === 'Online'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-primary-600"
                  />
                  <span>Online Payment</span>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span>{item.product?.name} x {item.quantity}</span>
                    <span>₹{((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (18%):</span>
                  <span>₹{totals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{totals.shipping === 0 ? 'Free' : `₹${totals.shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>₹{totals.total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Checkout
