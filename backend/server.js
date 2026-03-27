// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');

// dotenv.config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Health check endpoint
// app.get('/api/health', (req, res) => {
//   res.json({ 
//     status: 'OK', 
//     mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
//     timestamp: new Date().toISOString()
//   });
// });

// // Routes
// app.use('/api/products', require('./routes/productRoutes'));
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/cart', require('./routes/cartRoutes'));
// app.use('/api/orders', require('./routes/orderRoutes'));
// app.use('/api/invoices', require('./routes/invoiceRoutes'));
// app.use('/api/payment', require('./routes/paymentRoutes'))
// app.use('/api/support', require('./routes/supportRoutes'));

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error('Global error handler:', err);
//   res.status(err.status || 500).json({
//     message: err.message || 'Internal server error',
//     error: process.env.NODE_ENV === 'development' ? err.stack : undefined
//   });
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({ message: 'Route not found' });
// });

// // MongoDB Connection
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ghee-ecommerce';

// // Connect to MongoDB before starting server
// const connectDB = async () => {
//   try {
//     await mongoose.connect(MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log('MongoDB Connected Successfully');
//   } catch (error) {
//     console.error('MongoDB Connection Error:', error.message);
//     process.exit(1);
//   }
// };

// // Start server only after MongoDB connection
// const startServer = async () => {
//   await connectDB();
  
//   const PORT = process.env.PORT || 5000;
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// };

// startServer();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const passport = require("passport");
const session = require("express-session");

dotenv.config();

const app = express();

/*
=====================
MIDDLEWARE
=====================
*/

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://dhanifresh-1.onrender.com"
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
=====================
PASSPORT
=====================
*/
require("./config/passport")();

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

/*
=====================
HEALTH CHECK
=====================
*/

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    mongodb:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected",
    timestamp: new Date().toISOString(),
  });
});

/*
=====================
ROUTES
=====================
*/

app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/auth", require("./routes/oauth"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/invoices", require("./routes/invoiceRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/support", require("./routes/supportRoutes"));
app.use('/api/contact', require('./routes/contactRoute'));
/*
=====================
ERROR HANDLER
=====================
*/

app.use((err, req, res, next) => {
  console.error("Global error:", err);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

/*
=====================
404
=====================
*/

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

/*
=====================
DATABASE
=====================
*/

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log(
      "MongoDB Connected Successfully"
    );
  } catch (error) {
    console.error(
      "MongoDB Connection Error:",
      error.message
    );

    process.exit(1);
  }
};

/*
=====================
START SERVER
=====================
*/

const startServer = async () => {
  await connectDB();

  const PORT =
    process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(
      `Server running on port ${PORT}`
    );
  });
};

startServer();
