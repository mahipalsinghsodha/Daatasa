# Daatasa E-Commerce — Complete Project Documentation

Welcome to the **Daatasa E-Commerce** project documentation. Daatasa is a premium, full-stack web application tailored for selling high-quality A1 and A2 Bilona Ghee. This document covers the architecture, features, setup instructions, and testing guidelines for the entire platform.

---

## 1. System Architecture
The application is built on a robust **MERN** (MongoDB, Express, React, Node.js) stack, enhanced with real-time web sockets and advanced caching mechanisms.

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Framer Motion (for micro-animations), Zustand (State Management), React Toastify.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ORM).
- **Caching**: Redis (via `ioredis`) for high-performance analytics aggregation.
- **Real-Time Communication**: Socket.io for live order tracking and admin notifications.
- **Authentication**: JWT (JSON Web Tokens), Passport.js (Google/GitHub OAuth), and HTTP-only cookies.
- **Media Storage**: Cloudinary (via `multer-storage-cloudinary`).
- **Payments**: Razorpay Gateway Integration with webhook signature validation.

---

## 2. Core Features

### 🛒 Customer Experience
- **Premium UI/UX**: Immersive visual design with micro-animations, glassmorphism, and responsive mobile layouts.
- **Product Discovery**: Advanced filtering, search, category browsing, and dynamic product detail pages with customer reviews.
- **Cart & Checkout**: Real-time cart state, coupon application, and seamless Razorpay/COD checkout flows.
- **Live Order Tracking**: Socket.io integrated `OrderDetail.jsx` page displaying a live timeline of the order's status (Pending → Processing → Shipped → Delivered).
- **Return Requests**: Customers can request order returns within 7 days of delivery directly from their order page.

### 🛡️ Admin & Analytics
- **Dashboard & Analytics**: Dynamic chart aggregations (Sales trends, top products, category breakdown) powered by Redis caching to prevent database overload.
- **Order Management**: Bulk status updates, invoice generation, return approvals, and refund processing.
- **Inventory Management**: Create, edit, and categorize products.
- **User & Coupon Management**: Control customer roles, create custom discount codes, and manage active coupons.
- **Audit Logging**: Every sensitive action taken by an admin is logged into an `AuditLog` collection for strict compliance tracking.

### 🔒 Security
- **Rate Limiting**: Global API limits (`express-rate-limit`) restricting burst traffic. Development limits are bumped to `5000` to support fast reloads, while production correctly enforces `100` reqs/15 min.
- **Payload Limits**: Strict `10kb` JSON body parser limits to prevent DoS attacks.
- **Sanitization**: `helmet` headers and `express-mongo-sanitize` to prevent NoSQL injection and XSS.
- **Secure WebSockets**: Socket.io connections are protected by a middleware requiring a valid JWT.

---

## 3. Project Structure

```text
ghee-ecommerce/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── api/                # Axios instances and interceptors
│   │   ├── components/         # Reusable UI components (Navbar, Footer, etc.)
│   │   ├── context/            # React Contexts (Auth, Cart, etc.)
│   │   └── pages/              # Page views (Home, Checkout, Admin Dashboard)
│   ├── vite.config.js          # Vite and PWA configuration
│   └── playwright.config.js    # Playwright E2E configuration
├── server/                     # Node.js Backend
│   ├── config/                 # Passport strategies and DB config
│   ├── controllers/            # Route business logic (auth, orders, products)
│   ├── middleware/             # Auth, roles, body limits, db checks
│   ├── models/                 # Mongoose schemas (User, Order, Product, etc.)
│   ├── routes/                 # Express route definitions
│   ├── services/               # NodeMailer, cleanup scripts
│   ├── socket/                 # Socket.io event listeners and authentication
│   └── utils/                  # Redis caching, audit loggers, helpers
├── tests/                      # Automated Testing
│   ├── e2e/                    # Playwright E2E specs
│   └── load/                   # k6 load testing scripts
└── k6-bin/                     # Local k6 binary for load testing
```

---

## 4. Environment Variables

Create a `.env` file in the `server/` directory with the following keys:

```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000

# Database & Caching
MONGODB_URI=mongodb://127.0.0.1:27017/ghee-ecommerce
REDIS_URL=redis://127.0.0.1:6379

# Authentication
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
COOKIE_SECRET=your_cookie_secret
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret

# Payments
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Media Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

---

## 5. Setup & Execution

### Prerequisites
- **Node.js**: v18+
- **MongoDB**: Running locally or via Atlas.
- **Redis**: Running locally (default port `6379`).

### Running Locally
1. **Backend**:
   ```bash
   cd server
   npm install
   npm run dev
   ```
2. **Frontend**:
   ```bash
   cd client
   npm install --legacy-peer-deps
   npm run dev
   ```
*(The frontend automatically proxies `/api` and `/socket.io` to the backend running on port 5000).*

---

## 6. Testing Strategy

The repository includes both End-to-End (E2E) and Load testing setups.

### End-to-End (E2E) Testing with Playwright
Playwright is installed and configured to simulate real user journeys across the application (e.g., registering, adding products to the cart, and checking out).

To run the Playwright tests:
```bash
# Ensure both frontend and backend are running first!
npx playwright test
```

### Load Testing with k6
`k6` is utilized to simulate high-concurrency environments to ensure the application handles database locks correctly (e.g., preventing overselling of limited stock).

To run the k6 load test:
1. Open `tests/load/stock_atomicity.js`.
2. Replace `YOUR_VALID_JWT_TOKEN_HERE` with an active user's token.
3. Run the binary from the project root:
```bash
.\k6-bin\k6-v0.51.0-windows-amd64\k6.exe run tests\load\stock_atomicity.js
```

---

## 7. API Routing Summary
- **`/api/auth`**: Registration, Login, OAuth, Profile updates.
- **`/api/products`**: Fetching, filtering, and creating inventory.
- **`/api/orders`**: Checkout flows, Razorpay intent generation, status history modifications, and return requests.
- **`/api/cart`**: User cart synchronization.
- **`/api/admin`**: Protected routes for analytics, user management, and audit logs.
- **`/api/payment`**: Razorpay webhook validation.

*For precise payload structures, consult the respective controllers in `server/controllers/`.*
