const http = require('http');

const API_BASE = 'http://localhost:5000/api';

async function request(url, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting API Verification Tests...\n');

  try {
    // 1. Authenticate (Login)
    console.log('🔑 Testing Authentication (/api/auth/login)...');
    const loginRes = await request(`${API_BASE}/auth/login`, 'POST', {
      email: 'superadmin@traveloop.ai',
      password: 'SuperAdmin@123!'
    });

    if (loginRes.status !== 200 || !(loginRes.data.data?.accessToken || loginRes.data.data?.token)) {
      console.error('❌ Login failed!', loginRes);
      process.exit(1);
    }
    const token = loginRes.data.data.accessToken || loginRes.data.data.token;
    console.log('✅ Authentication successful! Token acquired.\n');

    // Endpoints to check
    const endpoints = [
      { name: 'Analytics Overview', url: `${API_BASE}/analytics/overview` },
      { name: 'Analytics Revenue', url: `${API_BASE}/analytics/revenue` },
      { name: 'Analytics AI Statistics', url: `${API_BASE}/analytics/ai` },
      { name: 'Users List', url: `${API_BASE}/users` },
      { name: 'Destinations List', url: `${API_BASE}/destinations` },
      { name: 'Activities List', url: `${API_BASE}/activities` },
      { name: 'Community Reports', url: `${API_BASE}/community/reports` }
    ];

    for (const ep of endpoints) {
      console.log(`📡 Testing ${ep.name} (${ep.url.replace(API_BASE, '/api')})...`);
      const res = await request(ep.url, 'GET', null, token);
      if (res.status === 200) {
        console.log(`✅ Success (200 OK)`);
      } else {
        console.log(`❌ Failed! (Status: ${res.status})`, res.data || res.raw);
      }
    }

    console.log('\n🎉 All API checks completed.');
  } catch (error) {
    console.error('❌ Verification failed due to network or connection error:', error.message);
  }
}

runTests();
