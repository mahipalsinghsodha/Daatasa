const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Create order
// router.post('/', auth, async (req, res) => {
//   try {
//     const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({ message: 'Cart is empty' });
//     }

//     const orderItems = cart.items.map(item => ({
//       product: item.product._id,
//       name: item.product.name,
//       image: item.product.image,
//       price: item.product.price,
//       quantity: item.quantity
//     }));

//     const itemsPrice = orderItems.reduce(
//       (total, item) => total + item.price * item.quantity,
//       0
//     );
//     const taxPrice = itemsPrice * 0.18; // 18% GST
//     const shippingPrice = itemsPrice > 500 ? 0 : 50;
//     const totalPrice = itemsPrice + taxPrice + shippingPrice;

//     const order = new Order({
//       user: req.user._id,
//       orderItems,
//       shippingAddress: req.body.shippingAddress || req.user.address,
//       paymentMethod: req.body.paymentMethod || 'COD',
//       itemsPrice,
//       taxPrice,
//       shippingPrice,
//       totalPrice
//     });

//     // Update product stock
//     for (const item of cart.items) {
//       await Product.findByIdAndUpdate(item.product._id, {
//         $inc: { stock: -item.quantity }
//       });
//     }

//     // Clear cart
//     cart.items = [];
//     await cart.save();
//     await order.save();
//     await order.populate('user', 'name email');
//     await order.populate('orderItems.product');

//     res.status(201).json(order);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });
// router.post('/', auth, async (req, res) => {
//   try {
//     const { paymentMethod, paymentInfo } = req.body

//     const cart = await Cart.findOne({ user: req.user._id })
//       .populate('items.product')

//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({ message: 'Cart is empty' })
//     }

//     const orderItems = cart.items.map(item => ({
//       product: item.product._id,
//       name: item.product.name,
//       image: item.product.image,
//       price: item.product.price,
//       quantity: item.quantity
//     }))

//     const itemsPrice = orderItems.reduce(
//       (total, item) => total + item.price * item.quantity,
//       0
//     )

//     const taxPrice = itemsPrice * 0.18
//     const shippingPrice = itemsPrice > 500 ? 0 : 50
//     const totalPrice = itemsPrice + taxPrice + shippingPrice

//     // ✅ CREATE ORDER OBJECT
//     const order = new Order({
//       user: req.user._id,
//       orderItems,
//       shippingAddress: req.body.shippingAddress || req.user.address,
//       paymentMethod,
//       itemsPrice,
//       taxPrice,
//       shippingPrice,
//       totalPrice
//     })

//     // =========================
//     // ✅ ONLINE PAYMENT
//     // =========================
//     if (paymentMethod === 'Online') {
//       order.paymentInfo = paymentInfo
//       order.isPaid = true
//       order.paidAt = Date.now()
//     }

//     // =========================
//     // ✅ SAVE ORDER
//     // =========================
//     await order.save()

//     // =========================
//     // ✅ UPDATE STOCK (AFTER ORDER)
//     // =========================
//     for (const item of cart.items) {
//       await Product.findByIdAndUpdate(item.product._id, {
//         $inc: { stock: -item.quantity }
//       })
//     }

//     // =========================
//     // ✅ CLEAR CART
//     // =========================
//     cart.items = []
//     await cart.save()

//     await order.populate('user', 'name email')
//     await order.populate('orderItems.product')

//     res.status(201).json(order)

//   } catch (error) {
//     res.status(400).json({ message: error.message })
//   }
// })
router.post('/', auth, async (req, res) => {
  try {
    const { paymentMethod, razorpay_order_id } = req.body

    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product')

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' })
    }
 console.log("card",cart)
    // ===============================
    // 1️⃣ CHECK STOCK
    // ===============================
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          message: `${item.product.name} is out of stock`
        })
      }
    }

    // ===============================
    // 2️⃣ PREPARE ORDER ITEMS
    // ===============================
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.image,
      price: item.product.price,
      quantity: item.quantity
    }))
console.log("orderItems",orderItems)
    // ===============================
    // 3️⃣ PRICE CALCULATION
    // ===============================
    const itemsPrice = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )

    const taxPrice = itemsPrice * 0.18
    const shippingPrice = itemsPrice > 500 ? 0 : 50
    const totalPrice = itemsPrice + taxPrice + shippingPrice

    // ===============================
    // 4️⃣ CREATE ORDER DATA
    // ===============================
    const orderData = {
      user: req.user._id,
      orderItems,
      shippingAddress: req.body.shippingAddress || req.user.address,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: false,
      paymentStatus: 'PENDING'
    }
 console.log("orderData",orderData)
    // ✅ ONLY ONLINE → SAVE RAZORPAY ORDER ID
    if (paymentMethod === 'Online') {
      orderData.paymentInfo = {
        razorpay_order_id
      }
    }

    // ===============================
    // 5️⃣ CREATE ORDER
    // ===============================
    const order = await Order.create(orderData)
    console.log('create order:', order);
    // ===============================
    // 6️⃣ REDUCE STOCK (LOCK 🔒)
    // ===============================
    for (const item of cart.items) {
    let a = await Product.findByIdAndUpdate(
     item.product._id,
     { $inc: { stock: -item.quantity } },
     { new: true } // 👈 IMPORTANT
     )

      console.log('create order stock:', a.stock);
    }
  
    // ===============================
    // 7️⃣ CLEAR CART (ONLY COD)
    // ===============================
    if (paymentMethod === 'COD') {
      cart.items = []
      await cart.save()
    }

    await order.populate('user', 'name email')
    await order.populate('orderItems.product')

    res.status(201).json(order)

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: error.message })
  }
})



// Get user orders
router.get('/myorders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('orderItems.product');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('orderItems.product')
      .sort({ createdAt: -1 });
    
    // Add new order count (orders created in last 5 minutes that are not paid)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const newOrdersCount = orders.filter(
      order => new Date(order.createdAt) > fiveMinutesAgo && !order.isPaid
    ).length;

    res.json({ orders, newOrdersCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (Admin only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { isPaid, isDelivered } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (isPaid !== undefined) {
      order.isPaid = isPaid;
      if (isPaid) {
        order.paidAt = new Date();
      } else {
        order.paidAt = null;
      }
    }

    if (isDelivered !== undefined) {
      order.isDelivered = isDelivered;
      if (isDelivered) {
        order.deliveredAt = new Date();
      } else {
        order.deliveredAt = null;
      }
    }

    await order.save();
    await order.populate('user', 'name email');
    await order.populate('orderItems.product');

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mark order as paid (Admin only)
router.put('/:id/pay', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    await order.save();
    await order.populate('user', 'name email');
    await order.populate('orderItems.product');

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mark order as delivered (Admin only)
router.put('/:id/deliver', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isDelivered = true;
    order.deliveredAt = new Date();
    await order.save();
    await order.populate('user', 'name email');
    await order.populate('orderItems.product');

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Bulk update orders (Admin only)
router.put('/bulk/update', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { orderIds, action } = req.body; // action: 'pay' or 'deliver'

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ message: 'Invalid order IDs' });
    }

    const updatePromises = orderIds.map(async (orderId) => {
      const order = await Order.findById(orderId);
      if (order) {
        if (action === 'pay') {
          order.isPaid = true;
          order.paidAt = new Date();
        } else if (action === 'deliver') {
          order.isDelivered = true;
          order.deliveredAt = new Date();
        }
        return order.save();
      }
    });

    await Promise.all(updatePromises);

    const updatedOrders = await Order.find({ _id: { $in: orderIds } })
      .populate('user', 'name email')
      .populate('orderItems.product');

    res.json({ message: `${orderIds.length} orders updated successfully`, orders: updatedOrders });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/fail', auth, async (req, res) => {
  try {
    const { razorpay_order_id } = req.body

    if (!razorpay_order_id) {
      return res.status(400).json({ message: 'razorpay_order_id required' })
    }

    const order = await Order.findOne({
      paymentStatus: 'PENDING',
      'paymentInfo.razorpay_order_id': razorpay_order_id
    })

    if (!order) {
      return res.status(404).json({
        message: 'Pending order not found (already paid or deleted)'
      })
    }
 console.log("order detere",order)
    // 🔁 ROLLBACK STOCK
   for (const item of order.orderItems) {
  const updatedProduct = await Product.findByIdAndUpdate(
    item.product,
    { $inc: { stock: item.quantity } },
     { new: true } // 👈 IMPORTANT
  )

  console.log('Updated Product:', updatedProduct.stock)
}


    // ❌ DELETE ORDER
    await order.deleteOne()

    res.json({
      success: true,
      message: 'Payment failed. Order cancelled and stock restored.'
    })

  } catch (error) {
    console.error('ORDER FAIL ERROR:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})


module.exports = router;
