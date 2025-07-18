"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const product_intelligence_service_1 = require("./product-intelligence-service");
// Service configuration
const config = {
    name: 'Product Intelligence Service',
    port: parseInt(process.env['PORT'] || '3001'),
    version: process.env['VERSION'] || '1.0.0',
    environment: process.env['NODE_ENV'] || 'development'
};
// Create and start the service
async function main() {
    const service = new product_intelligence_service_1.ProductIntelligenceService(config);
    try {
        await service.start();
        // Graceful shutdown handling
        process.on('SIGTERM', async () => {
            console.log('SIGTERM received, shutting down gracefully...');
            await service.shutdown();
            process.exit(0);
        });
        process.on('SIGINT', async () => {
            console.log('SIGINT received, shutting down gracefully...');
            await service.shutdown();
            process.exit(0);
        });
    }
    catch (error) {
        console.error('Failed to start Product Intelligence Service:', error);
        process.exit(1);
    }
}
// Start the service
main().catch((error) => {
    console.error('Unhandled error in Product Intelligence Service:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map