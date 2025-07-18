import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 },  // Ramp up to 10 users
    { duration: '5m', target: 10 },  // Stay at 10 users
    { duration: '2m', target: 50 },  // Ramp up to 50 users
    { duration: '5m', target: 50 },  // Stay at 50 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate must be less than 10%
    errors: ['rate<0.1'],             // Custom error rate
  },
};

// Test data
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const TEST_USER = {
  email: 'admin@demo-tenant.com',
  password: 'adminpass'
};

// Helper function to get auth token
function getAuthToken() {
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify(TEST_USER), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (loginRes.status === 200) {
    const body = JSON.parse(loginRes.body);
    return body.token;
  }
  return null;
}

// Main test function
export default function() {
  const token = getAuthToken();
  
  if (!token) {
    errorRate.add(1);
    return;
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Test scenarios
  const scenarios = [
    // Dashboard access
    () => {
      const res = http.get(`${BASE_URL}/api/dashboard`, { headers });
      check(res, {
        'dashboard status is 200': (r) => r.status === 200,
        'dashboard response time < 200ms': (r) => r.timings.duration < 200,
      });
    },

    // Product listing
    () => {
      const res = http.get(`${BASE_URL}/api/products?limit=20&offset=0`, { headers });
      check(res, {
        'products status is 200': (r) => r.status === 200,
        'products response time < 300ms': (r) => r.timings.duration < 300,
        'products have data': (r) => JSON.parse(r.body).length > 0,
      });
    },

    // Order creation
    () => {
      const orderData = {
        customerId: 'demo-customer-1',
        items: [
          { productId: 'demo-product-1', quantity: 2, price: 29.99 },
          { productId: 'demo-product-2', quantity: 1, price: 49.99 }
        ],
        shippingAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'US'
        }
      };

      const res = http.post(`${BASE_URL}/api/orders`, JSON.stringify(orderData), { headers });
      check(res, {
        'order creation status is 201': (r) => r.status === 201,
        'order creation response time < 500ms': (r) => r.timings.duration < 500,
      });
    },

    // Inventory check
    () => {
      const res = http.get(`${BASE_URL}/api/inventory/check?productId=demo-product-1`, { headers });
      check(res, {
        'inventory status is 200': (r) => r.status === 200,
        'inventory response time < 150ms': (r) => r.timings.duration < 150,
      });
    },

    // Analytics data
    () => {
      const res = http.get(`${BASE_URL}/api/analytics/sales?period=30d`, { headers });
      check(res, {
        'analytics status is 200': (r) => r.status === 200,
        'analytics response time < 400ms': (r) => r.timings.duration < 400,
      });
    },

    // Pricing calculation
    () => {
      const pricingData = {
        productId: 'demo-product-1',
        quantity: 5,
        customerTier: 'premium'
      };

      const res = http.post(`${BASE_URL}/api/pricing/calculate`, JSON.stringify(pricingData), { headers });
      check(res, {
        'pricing status is 200': (r) => r.status === 200,
        'pricing response time < 200ms': (r) => r.timings.duration < 200,
      });
    },

    // Marketplace integration
    () => {
      const res = http.get(`${BASE_URL}/api/marketplace/amazon/listings`, { headers });
      check(res, {
        'marketplace status is 200': (r) => r.status === 200,
        'marketplace response time < 1000ms': (r) => r.timings.duration < 1000,
      });
    },

    // Vendor integration
    () => {
      const res = http.get(`${BASE_URL}/api/vendor/ingram/products?search=laptop`, { headers });
      check(res, {
        'vendor status is 200': (r) => r.status === 200,
        'vendor response time < 800ms': (r) => r.timings.duration < 800,
      });
    },
  ];

  // Execute random scenario
  const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  randomScenario();

  // Think time between requests
  sleep(Math.random() * 3 + 1); // 1-4 seconds
}

// Setup function (runs once at the beginning)
export function setup() {
  console.log('Starting load test against:', BASE_URL);
  
  // Verify service is up
  const healthCheck = http.get(`${BASE_URL}/health`);
  if (healthCheck.status !== 200) {
    throw new Error('Service is not healthy');
  }
  
  return { baseUrl: BASE_URL };
}

// Teardown function (runs once at the end)
export function teardown(data) {
  console.log('Load test completed for:', data.baseUrl);
} 