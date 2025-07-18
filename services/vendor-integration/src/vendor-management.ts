import { VendorRegistryService } from './vendor-registry';
import { UniversalConnector } from './connectors/universal-connector';
import { VendorConnectorFactory } from './connector-factory';
import { 
  VendorRegistry, 
  UniversalConnectorConfig, 
  VendorCredentials,
  VendorConnectionTest,
  VendorConfig
} from './vendor-types';

export interface VendorConnectionRequest {
  name: string;
  description: string;
  type: 'api' | 'sftp' | 'edi' | 'webhook';
  authentication: 'oauth2' | 'api_key' | 'basic' | 'sftp_key' | 'edi';
  credentials: VendorCredentials;
  endpoints?: {
    baseUrl: string;
    products?: string;
    inventory?: string;
    pricing?: string;
    orders?: string;
    auth?: string;
  };
  mappings?: {
    products: Record<string, string>;
    inventory: Record<string, string>;
    pricing: Record<string, string>;
    orders: Record<string, string>;
  };
  rateLimits?: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  features?: {
    productCatalog: boolean;
    realTimeInventory: boolean;
    realTimePricing: boolean;
    orderManagement: boolean;
    bulkOperations: boolean;
    webhooks: boolean;
  };
}

export interface VendorConnectionResult {
  success: boolean;
  vendorId: string;
  message: string;
  testResults?: VendorConnectionTest;
  errors?: string[];
}

export class VendorManagementService {
  private registry: VendorRegistryService;
  private logger: any;

  constructor(logger: any) {
    this.registry = VendorRegistryService.getInstance(logger);
    this.logger = logger;
  }

  /**
   * Connect a new vendor using the universal connector
   */
  async connectVendor(request: VendorConnectionRequest): Promise<VendorConnectionResult> {
    try {
      this.logger.info(`Connecting new vendor: ${request.name}`);

      // Generate a unique vendor ID
      const vendorId = this.generateVendorId(request.name);

      // Create vendor configuration
      const vendorConfig: VendorConfig = {
        name: request.name,
        type: request.type,
        authentication: request.authentication,
        rateLimits: request.rateLimits || {
          requestsPerMinute: 30,
          requestsPerHour: 500,
          requestsPerDay: 5000
        },
        endpoints: {
          baseUrl: request.endpoints?.baseUrl || '',
          products: request.endpoints?.products || '/products',
          inventory: request.endpoints?.inventory || '/inventory',
          pricing: request.endpoints?.pricing || '/pricing',
          orders: request.endpoints?.orders || '/orders',
          auth: request.endpoints?.auth || '/auth'
        },
        features: request.features || {
          productCatalog: true,
          realTimeInventory: false,
          realTimePricing: true,
          orderManagement: true,
          bulkOperations: false,
          webhooks: false
        },
        dataFormats: {
          products: 'json',
          inventory: 'json',
          pricing: 'json',
          orders: 'json'
        }
      };

      // Create universal connector configuration
      const universalConfig: UniversalConnectorConfig = {
        type: request.type,
        name: request.name,
        description: request.description,
        credentials: request.credentials,
        config: vendorConfig,
        mappings: request.mappings || {
          products: {
            sku: 'sku',
            name: 'name',
            price: 'price',
            cost: 'cost',
            quantity: 'quantity',
            description: 'description'
          },
          inventory: {
            sku: 'sku',
            quantity: 'quantity'
          },
          pricing: {
            sku: 'sku',
            price: 'price'
          },
          orders: {
            orderId: 'orderId',
            sku: 'sku',
            name: 'name',
            quantity: 'quantity',
            price: 'price',
            total: 'total',
            totalAmount: 'totalAmount'
          }
        }
      };

      // Create a mock vendor object for testing
      const mockVendor = {
        id: vendorId,
        name: request.name,
        type: vendorId,
        description: request.description,
        status: 'active' as const
      };

      // Test the connection
      const connector = new UniversalConnector(mockVendor, universalConfig, this.logger);
      const testResults = await connector.testConnection();

      if (!testResults.success) {
        return {
          success: false,
          vendorId,
          message: 'Connection test failed',
          testResults,
          errors: testResults.errors
        };
      }

      // Register the vendor in the registry
      const vendorRegistry: VendorRegistry = {
        id: vendorId,
        name: request.name,
        type: 'custom',
        description: request.description,
        capabilities: {
          products: testResults.details?.products || false,
          inventory: testResults.details?.inventory || false,
          pricing: testResults.details?.pricing || false,
          orders: testResults.details?.orders || false,
          realTimeSync: false
        },
        integrationMethods: [request.type],
        config: vendorConfig,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.registry.registerVendor(vendorRegistry);

      this.logger.info(`Successfully connected vendor: ${request.name} (${vendorId})`);

      return {
        success: true,
        vendorId,
        message: 'Vendor connected successfully',
        testResults
      };

    } catch (error) {
      this.logger.error(`Failed to connect vendor ${request.name}:`, error);
      return {
        success: false,
        vendorId: '',
        message: 'Failed to connect vendor',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Test connection to an existing vendor
   */
  async testVendorConnection(vendorId: string, credentials: VendorCredentials): Promise<VendorConnectionTest> {
    try {
      const vendor = this.registry.getVendor(vendorId);
      if (!vendor) {
        throw new Error(`Vendor not found: ${vendorId}`);
      }

      const universalConfig = this.registry.createUniversalConnectorConfig(vendorId, {
        credentials
      });

      if (!universalConfig) {
        throw new Error(`Failed to create connector configuration for vendor: ${vendorId}`);
      }

      const mockVendor = {
        id: vendorId,
        name: vendor.name,
        type: vendorId,
        description: vendor.description,
        status: 'active' as const
      };

      const connector = new UniversalConnector(mockVendor, universalConfig, this.logger);
      return await connector.testConnection();

    } catch (error) {
      this.logger.error(`Failed to test vendor connection ${vendorId}:`, error);
      return {
        success: false,
        message: 'Connection test failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get available vendor templates for quick setup
   */
  getVendorTemplates(): Array<{
    id: string;
    name: string;
    description: string;
    type: string;
    template: Partial<VendorConnectionRequest>;
  }> {
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
          },
          rateLimits: {
            requestsPerMinute: 30,
            requestsPerHour: 500,
            requestsPerDay: 5000
          },
          features: {
            productCatalog: true,
            realTimeInventory: true,
            realTimePricing: true,
            orderManagement: true,
            bulkOperations: false,
            webhooks: false
          }
        }
      },
      {
        id: 'oauth2-api',
        name: 'OAuth 2.0 API',
        description: 'REST API with OAuth 2.0 authentication',
        type: 'api',
        template: {
          type: 'api',
          authentication: 'oauth2',
          endpoints: {
            baseUrl: '',
            products: '/products',
            inventory: '/inventory',
            pricing: '/pricing',
            orders: '/orders',
            auth: '/oauth/token'
          },
          rateLimits: {
            requestsPerMinute: 60,
            requestsPerHour: 1000,
            requestsPerDay: 10000
          },
          features: {
            productCatalog: true,
            realTimeInventory: true,
            realTimePricing: true,
            orderManagement: true,
            bulkOperations: true,
            webhooks: true
          }
        }
      },
      {
        id: 'sftp-files',
        name: 'SFTP File Transfer',
        description: 'File-based integration via SFTP',
        type: 'sftp',
        template: {
          type: 'sftp',
          authentication: 'sftp_key',
          features: {
            productCatalog: true,
            realTimeInventory: false,
            realTimePricing: true,
            orderManagement: false,
            bulkOperations: true,
            webhooks: false
          }
        }
      },
      {
        id: 'edi-x12',
        name: 'EDI X12',
        description: 'Electronic Data Interchange using X12 format',
        type: 'edi',
        template: {
          type: 'edi',
          authentication: 'edi',
          features: {
            productCatalog: true,
            realTimeInventory: false,
            realTimePricing: true,
            orderManagement: true,
            bulkOperations: true,
            webhooks: false
          }
        }
      },
      {
        id: 'webhook',
        name: 'Webhook Integration',
        description: 'Real-time integration via webhooks',
        type: 'webhook',
        template: {
          type: 'webhook',
          authentication: 'api_key',
          features: {
            productCatalog: false,
            realTimeInventory: true,
            realTimePricing: true,
            orderManagement: true,
            bulkOperations: false,
            webhooks: true
          }
        }
      }
    ];
  }

  /**
   * Get connection wizard steps for guided setup
   */
  getConnectionWizardSteps(vendorType: string): Array<{
    id: string;
    title: string;
    description: string;
    fields: Array<{
      name: string;
      label: string;
      type: 'text' | 'password' | 'url' | 'number' | 'select';
      required: boolean;
      options?: Array<{ value: string; label: string }>;
      placeholder?: string;
      help?: string;
    }>;
  }> {
    const baseSteps: Array<{
      id: string;
      title: string;
      description: string;
      fields: Array<{
        name: string;
        label: string;
        type: 'text' | 'password' | 'url' | 'number' | 'select';
        required: boolean;
        options?: Array<{ value: string; label: string }>;
        placeholder?: string;
        help?: string;
      }>;
    }> = [
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
          },
          {
            name: 'description',
            label: 'Description',
            type: 'text',
            required: false,
            placeholder: 'Brief description of the vendor'
          }
        ]
      }
    ];

    switch (vendorType) {
      case 'api':
        return [
          ...baseSteps,
          {
            id: 'authentication',
            title: 'Authentication',
            description: 'Configure API authentication',
            fields: [
              {
                name: 'authentication',
                label: 'Authentication Type',
                type: 'select',
                required: true,
                options: [
                  { value: 'api_key', label: 'API Key' },
                  { value: 'oauth2', label: 'OAuth 2.0' },
                  { value: 'basic', label: 'Basic Auth' }
                ]
              },
              {
                name: 'apiKey',
                label: 'API Key',
                type: 'text',
                required: true,
                placeholder: 'Enter API key'
              },
              {
                name: 'apiSecret',
                label: 'API Secret',
                type: 'password',
                required: false,
                placeholder: 'Enter API secret (if required)'
              }
            ]
          },
          {
            id: 'endpoints',
            title: 'API Endpoints',
            description: 'Configure API endpoints',
            fields: [
              {
                name: 'baseUrl',
                label: 'Base URL',
                type: 'url',
                required: true,
                placeholder: 'https://api.vendor.com/v1'
              },
              {
                name: 'productsEndpoint',
                label: 'Products Endpoint',
                type: 'text',
                required: false,
                placeholder: '/products',
                help: 'Leave empty to use default'
              },
              {
                name: 'inventoryEndpoint',
                label: 'Inventory Endpoint',
                type: 'text',
                required: false,
                placeholder: '/inventory'
              },
              {
                name: 'pricingEndpoint',
                label: 'Pricing Endpoint',
                type: 'text',
                required: false,
                placeholder: '/pricing'
              },
              {
                name: 'ordersEndpoint',
                label: 'Orders Endpoint',
                type: 'text',
                required: false,
                placeholder: '/orders'
              }
            ]
          }
        ];

      case 'sftp':
        return [
          ...baseSteps,
          {
            id: 'sftp-config',
            title: 'SFTP Configuration',
            description: 'Configure SFTP connection details',
            fields: [
              {
                name: 'sftpHost',
                label: 'SFTP Host',
                type: 'text',
                required: true,
                placeholder: 'sftp.vendor.com'
              },
              {
                name: 'sftpPort',
                label: 'SFTP Port',
                type: 'number',
                required: false,
                placeholder: '22'
              },
              {
                name: 'sftpUsername',
                label: 'Username',
                type: 'text',
                required: true,
                placeholder: 'Enter SFTP username'
              },
              {
                name: 'sftpPassword',
                label: 'Password',
                type: 'password',
                required: false,
                placeholder: 'Enter SFTP password'
              },
              {
                name: 'sftpPrivateKey',
                label: 'Private Key Path',
                type: 'text',
                required: false,
                placeholder: '/path/to/private/key',
                help: 'Path to private key file (if using key-based auth)'
              }
            ]
          }
        ];

      case 'edi':
        return [
          ...baseSteps,
          {
            id: 'edi-config',
            title: 'EDI Configuration',
            description: 'Configure EDI partner details',
            fields: [
              {
                name: 'ediPartnerId',
                label: 'Partner ID',
                type: 'text',
                required: true,
                placeholder: 'Enter EDI partner ID'
              },
              {
                name: 'ediSenderId',
                label: 'Sender ID',
                type: 'text',
                required: true,
                placeholder: 'Enter sender ID'
              },
              {
                name: 'ediReceiverId',
                label: 'Receiver ID',
                type: 'text',
                required: true,
                placeholder: 'Enter receiver ID'
              }
            ]
          }
        ];

      default:
        return baseSteps;
    }
  }

  /**
   * Generate a unique vendor ID
   */
  private generateVendorId(name: string): string {
    const timestamp = Date.now();
    const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${sanitizedName}-${timestamp}`;
  }

  /**
   * Get all available vendors
   */
  getAllVendors(): VendorRegistry[] {
    return this.registry.getAllVendors();
  }

  /**
   * Search vendors
   */
  searchVendors(query: string): VendorRegistry[] {
    return this.registry.searchVendors(query);
  }

  /**
   * Get vendor statistics
   */
  getVendorStats() {
    return this.registry.getVendorStats();
  }

  /**
   * Update vendor configuration
   */
  updateVendor(vendorId: string, updates: Partial<VendorRegistry>): boolean {
    return this.registry.updateVendor(vendorId, updates);
  }

  /**
   * Remove vendor
   */
  removeVendor(vendorId: string): boolean {
    return this.registry.removeVendor(vendorId);
  }
} 