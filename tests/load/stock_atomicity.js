import http from 'k6/http';
import { check, sleep } from 'k6';

// Test configuration
export const options = {
  // Simulate 100 concurrent users attempting to checkout simultaneously
  vus: 100,
  duration: '10s',
};

// You need a valid auth token to checkout. In a real load test,
// you would either generate these dynamically or use a pre-generated array of valid tokens.
// Replace with a valid JWT token for testing.
const AUTH_TOKEN = 'YOUR_VALID_JWT_TOKEN_HERE';

export default function () {
  const url = 'http://localhost:5000/api/orders';
  
  const payload = JSON.stringify({
    paymentMethod: 'COD',
    shippingAddress: {
      name: 'Load Test User',
      phone: '1234567890',
      street: '123 Load St',
      city: 'Load City',
      state: 'Load State',
      zipCode: '110001'
    }
    // Note: The cart is fetched from the DB based on the auth token.
    // For this test to accurately reflect race conditions, all 100 users must
    // have the target item in their carts already.
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`,
    },
  };

  const res = http.post(url, payload, params);

  // Check that the request either succeeded (if stock was available)
  // or returned 409 Conflict / 400 Bad Request (if stock ran out).
  // We want to ensure no 500 errors occur due to race conditions.
  check(res, {
    'is status 201 or 409/400': (r) => r.status === 201 || r.status === 409 || r.status === 400,
  });

  sleep(1);
}
