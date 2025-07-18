import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const timeoutRate = new Rate('timeouts');

// Stress test configuration
export const options = {
  stages: [
    { duration: '2m', target: 20 },   // Ramp up to 20 users
    { duration: '5m', target: 20 },   // Stay at 20 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Ramp up to 200 users
    { duration: '5m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests must complete below 1s
    http_req_failed: ['rate<0.2'],     // Error rate must be less than 20%
    errors: ['rate<0.2'],              // Custom error rate
    timeouts: ['rate<0.1'],            // Timeout rate must be less than 10%
  },
};

// Test data
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const TEST_USERS = [
  { email: 'admin@demo-tenant.com', password: 'adminpass' },
  { email: 'user1@demo-tenant.com', password: 'userpass' },
  { email: 'user2@demo-tenant.com', password: 'userpass' },
];

// Helper function to get auth token
function getAuthToken() {
  const user = TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' },
    timeout: '10s',
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

  // Heavy load scenarios
  const scenarios = [
    // Complex product search with filters
    () => {
      const params = {
        search: 'laptop computer',
        category: 'electronics',
        priceMin: 100,
        priceMax: 2000,
        brand: 'dell,hp,lenovo',
        inStock: true,
        sortBy: 'price',
        sortOrder: 'asc',
        limit: 50,
        offset: 0
      };
      
      const queryString = new URLSearchParams(params).toString();
      const res = http.get(`${BASE_URL}/api/products/search?${queryString}`, { 
        headers,
        timeout: '15s'
      });
      
      check(res, {
        'complex search status is 200': (r) => r.status === 200,
        'complex search response time < 2000ms': (r) => r.timings.duration < 2000,
      });
    },

    // Bulk order creation
    () => {
      const bulkOrderData = {
        orders: Array.from({ length: 10 }, (_, i) => ({
          customerId: `demo-customer-${i + 1}`,
          items: [
            { productId: 'demo-product-1', quantity: Math.floor(Math.random() * 10) + 1, price: 29.99 },
            { productId: 'demo-product-2', quantity: Math.floor(Math.random() * 5) + 1, price: 49.99 }
          ],
          shippingAddress: {
            street: `${i + 1} Test St`,
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            country: 'US'
          }
        }))
      };

      const res = http.post(`${BASE_URL}/api/orders/bulk`, JSON.stringify(bulkOrderData), { 
        headers,
        timeout: '30s'
      });
      
      check(res, {
        'bulk order status is 201': (r) => r.status === 201,
        'bulk order response time < 5000ms': (r) => r.timings.duration < 5000,
      });
    },

    // Large analytics report
    () => {
      const res = http.get(`${BASE_URL}/api/analytics/comprehensive?period=90d&groupBy=day&includeDetails=true`, { 
        headers,
        timeout: '20s'
      });
      
      check(res, {
        'analytics report status is 200': (r) => r.status === 200,
        'analytics report response time < 3000ms': (r) => r.timings.duration < 3000,
      });
    },

    // Complex pricing calculation
    () => {
      const pricingData = {
        items: Array.from({ length: 20 }, (_, i) => ({
          productId: `demo-product-${i + 1}`,
          quantity: Math.floor(Math.random() * 20) + 1,
          customerTier: ['basic', 'premium', 'enterprise'][Math.floor(Math.random() * 3)]
        })),
        applyDiscounts: true,
        includeTax: true,
        includeShipping: true
      };

      const res = http.post(`${BASE_URL}/api/pricing/calculate-bulk`, JSON.stringify(pricingData), { 
        headers,
        timeout: '15s'
      });
      
      check(res, {
        'bulk pricing status is 200': (r) => r.status === 200,
        'bulk pricing response time < 2000ms': (r) => r.timings.duration < 2000,
      });
    },

    // Marketplace sync
    () => {
      const syncData = {
        marketplace: 'amazon',
        syncType: 'full',
        includeInventory: true,
        includePricing: true,
        includeImages: true
      };

      const res = http.post(`${BASE_URL}/api/marketplace/sync`, JSON.stringify(syncData), { 
        headers,
        timeout: '60s'
      });
      
      check(res, {
        'marketplace sync status is 202': (r) => r.status === 202,
        'marketplace sync response time < 10000ms': (r) => r.timings.duration < 10000,
      });
    },

    // Vendor catalog update
    () => {
      const res = http.post(`${BASE_URL}/api/vendor/ingram/catalog/update`, {}, { 
        headers,
        timeout: '45s'
      });
      
      check(res, {
        'vendor update status is 202': (r) => r.status === 202,
        'vendor update response time < 8000ms': (r) => r.timings.duration < 8000,
      });
    },

    // Database intensive operations
    () => {
      const res = http.get(`${BASE_URL}/api/reports/inventory/aging?detailed=true&includeHistory=true`, { 
        headers,
        timeout: '25s'
      });
      
      check(res, {
        'inventory report status is 200': (r) => r.status === 200,
        'inventory report response time < 4000ms': (r) => r.timings.duration < 4000,
      });
    },

    // File upload simulation
    () => {
      const fileData = {
        filename: 'large-inventory-import.csv',
        size: 1024 * 1024, // 1MB
        type: 'text/csv'
      };

      const res = http.post(`${BASE_URL}/api/import/inventory`, JSON.stringify(fileData), { 
        headers,
        timeout: '30s'
      });
      
      check(res, {
        'file upload status is 202': (r) => r.status === 202,
        'file upload response time < 5000ms': (r) => r.timings.duration < 5000,
      });
    },
  ];

  // Execute random scenario
  const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  
  try {
    randomScenario();
  } catch (error) {
    if (error.message.includes('timeout')) {
      timeoutRate.add(1);
    } else {
      errorRate.add(1);
    }
  }

  // Shorter think time for stress test
  sleep(Math.random() * 2 + 0.5); // 0.5-2.5 seconds
}

// Setup function
export function setup() {
  console.log('Starting stress test against:', BASE_URL);
  
  // Verify service is up
  const healthCheck = http.get(`${BASE_URL}/health`);
  if (healthCheck.status !== 200) {
    throw new Error('Service is not healthy');
  }
  
  return { baseUrl: BASE_URL };
}

// Teardown function
export function teardown(data) {
  console.log('Stress test completed for:', data.baseUrl);
} 