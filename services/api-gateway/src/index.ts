import { SimpleApiGateway } from './simple-gateway';

// Service configuration
const port = parseInt(process.env['PORT'] || '3000');

// Create and start the service
async function main() {
  const gateway = new SimpleApiGateway(port);
  
  try {
    await gateway.start();
    
    // Graceful shutdown handling
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully...');
      await gateway.shutdown();
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      console.log('SIGINT received, shutting down gracefully...');
      await gateway.shutdown();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Failed to start API Gateway:', error);
    process.exit(1);
  }
}

// Start the service
main().catch((error) => {
  console.error('Unhandled error in API Gateway:', error);
  process.exit(1);
}); 