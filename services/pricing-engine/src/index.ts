import { PricingEngineService } from './pricing-engine-service';

const config = {
  name: 'Pricing Engine Service',
  port: parseInt(process.env['PORT'] || '3005'),
  version: process.env['VERSION'] || '1.0.0',
  environment: process.env['NODE_ENV'] || 'development'
};

async function main() {
  const service = new PricingEngineService(config);
  
  try {
    await service.start();
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      await service.shutdown();
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      await service.shutdown();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Failed to start service:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 