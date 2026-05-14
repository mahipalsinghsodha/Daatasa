const express = require('express')
const {
  createRazorpayOrder,
  verifyPayment,
  razorpayWebhook
} = require('../controllers/paymentController')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/create-order',auth, createRazorpayOrder)
router.post('/verify',auth, verifyPayment)
router.post('/webhook', razorpayWebhook)

module.exports = router
