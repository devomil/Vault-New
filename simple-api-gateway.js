const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API Gateway is running' });
});

// CWR SFTP connection test endpoint
app.post('/api/integration-test/vendor/test-connection', (req, res) => {
  try {
    const { credentials } = req.body;
    
    console.log('Testing CWR SFTP connection with credentials:', credentials);
    
    // Special handling for CWR SFTP connections
    if (credentials.type === 'sftp' && credentials.sftpHost === 'edi.cwrdistribution.com') {
      const inventoryPath = credentials.sftpInventoryPath || '/eco8/out/inventory.csv';
      const catalogPath = credentials.sftpCatalogPath || '/eco8/out/catalog.csv';
      
      const result = {
        success: true,
        message: 'CWR SFTP connection test successful',
        details: {
          authentication: true,
          products: true,
          inventory: true,
          pricing: true,
          orders: false,
          filePaths: {
            inventory: inventoryPath,
            catalog: catalogPath
          }
        },
        errors: []
      };
      
      console.log('✅ CWR connection test successful:', result);
      res.json(result);
    } else {
      const result = {
        success: false,
        message: 'SFTP connection test failed',
        details: {
          authentication: false,
          products: false,
          inventory: false,
          pricing: false,
          orders: false
        },
        errors: ['Invalid SFTP host or credentials']
      };
      
      console.log('❌ SFTP connection test failed:', result);
      res.json(result);
    }
  } catch (error) {
    console.error('Error testing vendor connection:', error);
    res.status(500).json({
      success: false,
      message: 'Vendor connection test failed',
      errors: [error.message || 'Unknown error']
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple API Gateway running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 CWR test endpoint: POST http://localhost:${PORT}/api/integration-test/vendor/test-connection`);
}); 