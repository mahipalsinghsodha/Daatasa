const axios = require('axios');

(async () => {
  try {
    const api = axios.create({
      baseURL: 'http://localhost:5000',
      withCredentials: true
    });
    
    console.log('Logging in...');
    let res = await api.post('/api/auth/login', {
      email: 'mahipal.gtropy@gmail.com',
      password: 'mahipal@123'
    });
    console.log('Login successful, token:', res.data.token.substring(0, 10) + '...');
    const setCookieHeader = res.headers['set-cookie'];
    console.log('Set-Cookie received:', setCookieHeader);
    
    if (setCookieHeader) {
      // Simulate browser by extracting the cookie and sending it in the next request
      const cookieString = setCookieHeader[0].split(';')[0];
      console.log('Extracted cookie:', cookieString);
      
      console.log('Calling /refresh...');
      const refreshRes = await api.post('/api/auth/refresh', {}, {
        headers: {
          Cookie: cookieString
        }
      });
      console.log('Refresh successful! New token:', refreshRes.data.token.substring(0, 10) + '...');
    }
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
})();
