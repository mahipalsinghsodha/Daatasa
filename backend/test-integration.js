const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let token = '';

async function runTests() {
  try {
    console.log('--- STARTING INTEGRATION TESTS ---');

    // 1. Register
    const email = `test_${Date.now()}@example.com`;
    console.log(`Testing Registration with ${email}...`);
    const regRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Integration Test',
      email: email,
      password: 'password123'
    });
    console.log('✅ Registration successful');
    token = regRes.data.token;

    // 2. Get Me
    console.log('Testing /auth/me...');
    const meRes = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Get Me successful: ${meRes.data.name}`);

    // 3. Products
    console.log('Testing /products...');
    const prodRes = await axios.get(`${API_URL}/products`);
    console.log(`✅ Products fetched: ${prodRes.data.length} items`);

    // 4. Cart
    if (prodRes.data.length > 0) {
      const productId = prodRes.data[0]._id;
      console.log(`Testing Add to Cart for product ${productId}...`);
      await axios.post(`${API_URL}/cart/items`, {
        productId,
        quantity: 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Add to Cart successful');

      const cartRes = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Cart fetched: ${cartRes.data.items.length} items`);
    }

    // 5. Admin Access (Expected Failure)
    console.log('Testing Admin Access (should fail)...');
    try {
      await axios.get(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('❌ FAIL: Regular user accessed admin stats!');
    } catch (err) {
      if (err.response?.status === 403) {
        console.log('✅ Admin access correctly denied');
      } else {
        console.log(`❓ Unexpected error: ${err.message}`);
      }
    }

    console.log('--- TESTS COMPLETED ---');
  } catch (error) {
    console.error('❌ TEST FAILED:', error.response?.data || error.message);
  }
}

runTests();
