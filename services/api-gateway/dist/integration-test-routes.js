"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// Mock implementations for testing - in a real setup, these would be proper imports
const VendorConnectorFactory = {
    createConnector: async (_vendor, _credentials, _settings, _logger) => {
        // Mock connector for testing
        return {
            validateCredentials: async () => {
                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                // For testing, return true if credentials are provided
                return !!(_credentials.apiKey || _credentials.clientId);
            },
            getProducts: async () => [],
            getInventory: async () => ({}),
            getCapabilities: () => ({
                products: true,
                inventory: true,
                pricing: true,
                orders: true
            })
        };
    }
};
const VendorManagementService = class {
    constructor(_logger) { }
    async testVendorConnection(_vendorId, credentials) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        // For testing, return success if credentials are provided
        const hasCredentials = !!(credentials.apiKey || credentials.username || credentials.sftpHost);
        // Special handling for SFTP connections
        if (credentials.type === 'sftp' && credentials.sftpHost) {
            try {
                // Simulate SFTP connection test
                // TODO: Implement actual SFTP connection test
                // SFTP connection parameters would be used here
                // For CWR specifically, test the known file paths
                if (credentials.sftpHost === 'edi.cwrdistribution.com') {
                    const inventoryPath = credentials.sftpInventoryPath || '/eco8/out/inventory.csv';
                    const catalogPath = credentials.sftpCatalogPath || '/eco8/out/catalog.csv';
                    return {
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
                }
                return {
                    success: true,
                    message: 'SFTP connection test successful',
                    details: {
                        authentication: true,
                        products: true,
                        inventory: true,
                        pricing: true,
                        orders: false
                    },
                    errors: []
                };
            }
            catch (error) {
                return {
                    success: false,
                    message: 'SFTP connection test failed',
                    details: {
                        authentication: false,
                        products: false,
                        inventory: false,
                        pricing: false,
                        orders: false
                    },
                    errors: [error instanceof Error ? error.message : 'SFTP connection failed']
                };
            }
        }
        return {
            success: hasCredentials,
            message: hasCredentials ? 'Vendor connection test successful' : 'Vendor connection test failed',
            details: hasCredentials ? {
                authentication: true,
                products: true,
                inventory: true,
                pricing: true,
                orders: true
            } : undefined,
            errors: hasCredentials ? [] : ['Invalid credentials provided']
        };
    }
    getVendorTemplates() {
        return [
            {
                id: 'rest-api',
                name: 'REST API',
                description: 'Standard REST API with JSON responses',
                type: 'api',
                template: {
                    type: 'api',
                    authentication: 'api_key',
                    endpoints: {
                        baseUrl: '',
                        products: '/products',
                        inventory: '/inventory',
                        pricing: '/pricing',
                        orders: '/orders'
                    }
                }
            }
        ];
    }
    getConnectionWizardSteps(_type) {
        return [
            {
                id: 'basic-info',
                title: 'Basic Information',
                description: 'Enter the vendor name and description',
                fields: [
                    {
                        name: 'name',
                        label: 'Vendor Name',
                        type: 'text',
                        required: true,
                        placeholder: 'Enter vendor name'
                    }
                ]
            }
        ];
    }
    getAllVendors() {
        return [
            {
                id: 'sp-richards',
                name: 'SP Richards',
                type: 'custom',
                description: 'Office products distributor',
                capabilities: {
                    products: true,
                    inventory: true,
                    pricing: true,
                    orders: true,
                    realTimeSync: false
                },
                integrationMethods: ['api'],
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
    }
    searchVendors(query) {
        return this.getAllVendors().filter(vendor => vendor.name.toLowerCase().includes(query.toLowerCase()));
    }
    getVendorStats() {
        return {
            total: 8,
            active: 6,
            inactive: 2,
            byType: {
                api: 5,
                sftp: 2,
                edi: 1
            }
        };
    }
};
const router = express_1.default.Router();
// Simple logger for testing
const logger = {
    info: (message, ...args) => console.log(`[INFO] ${message}`, ...args),
    error: (message, ...args) => console.error(`[ERROR] ${message}`, ...args),
    warn: (message, ...args) => console.warn(`[WARN] ${message}`, ...args),
    debug: (message, ...args) => console.log(`[DEBUG] ${message}`, ...args)
};
// Test marketplace connection
// @ts-ignore
router.post('/marketplace/test-connection', async (req, res) => {
    try {
        const { type, credentials } = req.body;
        logger.info(`Testing marketplace connection for ${type}`);
        // Create mock vendor object
        const mockVendor = {
            id: 'test-marketplace',
            name: `${type.toUpperCase()} Marketplace`,
            type: type,
            description: `Test ${type} marketplace connection`,
            status: 'active'
        };
        // Create mock settings
        const settings = {
            rateLimits: {
                requestsPerMinute: 30,
                requestsPerHour: 500,
                requestsPerDay: 5000
            }
        };
        // Create connector based on type
        let connector;
        switch (type) {
            case 'amazon':
                connector = await VendorConnectorFactory.createConnector(mockVendor, {
                    apiKey: credentials.clientId,
                    apiSecret: credentials.clientSecret,
                    endpoint: 'https://sellingpartnerapi-na.amazon.com'
                }, settings, logger);
                break;
            case 'ebay':
                connector = await VendorConnectorFactory.createConnector(mockVendor, {
                    apiKey: credentials.apiKey,
                    apiSecret: credentials.apiSecret,
                    endpoint: 'https://api.ebay.com'
                }, settings, logger);
                break;
            case 'walmart':
                connector = await VendorConnectorFactory.createConnector(mockVendor, {
                    apiKey: credentials.clientId,
                    apiSecret: credentials.clientSecret,
                    endpoint: 'https://marketplace.walmartapis.com'
                }, settings, logger);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: `Unsupported marketplace type: ${type}`,
                    errors: [`Marketplace type '${type}' is not supported`]
                });
        }
        // Test the connection
        const startTime = Date.now();
        const isValid = await connector.validateCredentials();
        const duration = Date.now() - startTime;
        if (isValid) {
            // Try to get some basic data to verify the connection
            try {
                const products = await connector.getProducts();
                const inventory = await connector.getInventory();
                res.json({
                    success: true,
                    message: `${type.toUpperCase()} marketplace connection successful`,
                    details: {
                        productsAvailable: products.length > 0,
                        inventoryAvailable: Object.keys(inventory).length > 0,
                        capabilities: connector.getCapabilities()
                    },
                    duration
                });
                return;
            }
            catch (dataError) {
                // Connection works but data retrieval failed (might be expected for test credentials)
                res.json({
                    success: true,
                    message: `${type.toUpperCase()} marketplace connection successful (authentication only)`,
                    details: {
                        authentication: true,
                        dataRetrieval: false,
                        error: dataError instanceof Error ? dataError.message : 'Unknown error'
                    },
                    duration
                });
                return;
            }
        }
        else {
            res.json({
                success: false,
                message: `${type.toUpperCase()} marketplace connection failed`,
                errors: ['Invalid credentials or connection failed'],
                duration
            });
            return;
        }
    }
    catch (error) {
        logger.error('Marketplace test connection error:', error);
        res.status(500).json({
            success: false,
            message: 'Marketplace connection test failed',
            errors: [error instanceof Error ? error.message : 'Unknown error']
        });
        return;
    }
});
// Test vendor connection
// @ts-ignore
router.post('/vendor/test-connection', async (req, res) => {
    try {
        const { credentials } = req.body;
        logger.info(`Testing vendor connection for ${credentials.name}`);
        // Create vendor management service
        const vendorManagement = new VendorManagementService(logger);
        // Test the connection using the vendor management service
        const startTime = Date.now();
        const testResult = await vendorManagement.testVendorConnection('test-vendor', credentials);
        const duration = Date.now() - startTime;
        res.json({
            success: testResult.success,
            message: testResult.message,
            details: testResult.details,
            errors: testResult.errors,
            duration
        });
        return;
    }
    catch (error) {
        logger.error('Vendor test connection error:', error);
        res.status(500).json({
            success: false,
            message: 'Vendor connection test failed',
            errors: [error instanceof Error ? error.message : 'Unknown error']
        });
        return;
    }
});
// Get available vendor templates
router.get('/vendor/templates', (_req, res) => {
    try {
        const vendorManagement = new VendorManagementService(logger);
        const templates = vendorManagement.getVendorTemplates();
        res.json({
            success: true,
            templates
        });
    }
    catch (error) {
        logger.error('Error getting vendor templates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get vendor templates',
            errors: [error instanceof Error ? error.message : 'Unknown error']
        });
    }
});
// Get connection wizard steps
router.get('/vendor/wizard-steps/:type', (req, res) => {
    try {
        const { type } = req.params;
        const vendorManagement = new VendorManagementService(logger);
        const steps = vendorManagement.getConnectionWizardSteps(type);
        res.json({
            success: true,
            steps
        });
    }
    catch (error) {
        logger.error('Error getting wizard steps:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get wizard steps',
            errors: [error instanceof Error ? error.message : 'Unknown error']
        });
    }
});
// Get all vendors
router.get('/vendor/list', (_req, res) => {
    try {
        const vendorManagement = new VendorManagementService(logger);
        const vendors = vendorManagement.getAllVendors();
        res.json({
            success: true,
            vendors
        });
    }
    catch (error) {
        logger.error('Error getting vendors:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get vendors',
            errors: [error instanceof Error ? error.message : 'Unknown error']
        });
    }
});
// Search vendors
router.get('/vendor/search', (req, res) => {
    try {
        const { query } = req.query;
        const vendorManagement = new VendorManagementService(logger);
        const vendors = vendorManagement.searchVendors(query);
        res.json({
            success: true,
            vendors
        });
    }
    catch (error) {
        logger.error('Error searching vendors:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search vendors',
            errors: [error instanceof Error ? error.message : 'Unknown error']
        });
    }
});
// Get vendor statistics
router.get('/vendor/stats', (_req, res) => {
    try {
        const vendorManagement = new VendorManagementService(logger);
        const stats = vendorManagement.getVendorStats();
        res.json({
            success: true,
            stats
        });
    }
    catch (error) {
        logger.error('Error getting vendor stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get vendor statistics',
            errors: [error instanceof Error ? error.message : 'Unknown error']
        });
    }
});
exports.default = router;
//# sourceMappingURL=integration-test-routes.js.map