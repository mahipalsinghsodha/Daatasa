const express = require('express')
const {
  createRazorpayOrder,
  verifyPayment
} = require('../controllers/paymentController')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/create-order',auth, createRazorpayOrder)
router.post('/verify',auth, verifyPayment)

module.exports = router
