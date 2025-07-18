import { VendorRegistry, VendorConfig, UniversalConnectorConfig } from './vendor-types';

export class VendorRegistryService {
  private static instance: VendorRegistryService;
  private vendors: Map<string, VendorRegistry> = new Map();
  private logger: any;

  private constructor(logger: any) {
    this.logger = logger;
    this.initializeDefaultVendors();
  }

  static getInstance(logger?: any): VendorRegistryService {
    if (!VendorRegistryService.instance) {
      if (!logger) {
        throw new Error('Logger is required for first initialization');
      }
      VendorRegistryService.instance = new VendorRegistryService(logger);
    }
    return VendorRegistryService.instance;
  }

  private initializeDefaultVendors(): void {
    // SP Richards
    this.registerVendor({
      id: 'sp-richards',
      name: 'SP Richards',
      type: 'distributor',
      description: 'SP Richards is a leading wholesale distributor of office products and supplies',
      website: 'https://www.sprichards.com',
      contact: {
        email: 'support@sprichards.com',
        phone: '1-800-SPRICHARDS',
        address: 'SP Richards Co., 1000 Richards Blvd, Atlanta, GA 30319'
      },
      capabilities: {
        products: true,
        inventory: true,
        pricing: true,
        orders: true,
        realTimeSync: true
      },
      integrationMethods: ['api', 'sftp', 'edi'],
      config: {
        name: 'SP Richards API',
        type: 'api',
        authentication: 'oauth2',
        rateLimits: {
          requestsPerMinute: 60,
          requestsPerHour: 1000,
          requestsPerDay: 10000
        },
        endpoints: {
          baseUrl: 'https://api.sprichards.com/v1',
          products: '/products',
          inventory: '/inventory',
          pricing: '/pricing',
          orders: '/orders',
          auth: '/auth/token'
        },
        features: {
          productCatalog: true,
          realTimeInventory: true,
          realTimePricing: true,
          orderManagement: true,
          bulkOperations: true,
          webhooks: true
        },
        dataFormats: {
          products: 'json',
          inventory: 'json',
          pricing: 'json',
          orders: 'json'
        }
      },
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Newwave
    this.registerVendor({
      id: 'newwave',
      name: 'Newwave',
      type: 'distributor',
      description: 'Newwave is a technology distributor specializing in IT products and solutions',
      website: 'https://www.newwave.com',
      contact: {
        email: 'support@newwave.com',
        phone: '1-800-NEWWAVE',
        address: 'Newwave, 2000 Tech Drive, San Jose, CA 95110'
      },
      capabilities: {
        products: true,
        inventory: true,
        pricing: true,
        orders: true,
        realTimeSync: true
      },
      integrationMethods: ['api', 'sftp'],
      config: {
        name: 'Newwave API',
        type: 'api',
        authentication: 'api_key',
        rateLimits: {
          requestsPerMinute: 30,
          requestsPerHour: 500,
          requestsPerDay: 5000
        },
        endpoints: {
          baseUrl: 'https://api.newwave.com/v2',
          products: '/catalog',
          inventory: '/stock',
          pricing: '/prices',
          orders: '/orders'
        },
        features: {
          productCatalog: true,
          realTimeInventory: true,
          realTimePricing: true,
          orderManagement: true,
          bulkOperations: true,
          webhooks: false
        },
        dataFormats: {
          products: 'json',
          inventory: 'json',
          pricing: 'json',
          orders: 'json'
        }
      },
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // SuppliesNetwork
    this.registerVendor({
      id: 'supplies-network',
      name: 'SuppliesNetwork',
      type: 'distributor',
      description: 'SuppliesNetwork is a B2B marketplace for office supplies and equipment',
      website: 'https://www.suppliesnetwork.com',
      contact: {
        email: 'support@suppliesnetwork.com',
        phone: '1-800-SUPPLIES',
        address: 'SuppliesNetwork, 3000 Supply Ave, Chicago, IL 60601'
      },
      capabilities: {
        products: true,
        inventory: true,
        pricing: true,
        orders: true,
        realTimeSync: false
      },
      integrationMethods: ['api', 'edi'],
      config: {
        name: 'SuppliesNetwork API',
        type: 'api',
        authentication: 'basic',
        rateLimits: {
          requestsPerMinute: 20,
          requestsPerHour: 300,
          requestsPerDay: 3000
        },
        endpoints: {
          baseUrl: 'https://api.suppliesnetwork.com/v1',
          products: '/items',
          inventory: '/availability',
          pricing: '/costs',
          orders: '/purchase-orders'
        },
        features: {
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
      },
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // ASI
    this.registerVendor({
      id: 'asi',
      name: 'ASI',
      type: 'distributor',
      description: 'ASI is a promotional products distributor with extensive catalog',
      website: 'https://www.asicentral.com',
      contact: {
        email: 'support@asicentral.com',
        phone: '1-800-ASI-HELP',
        address: 'ASI, 4000 Promo Way, Trevose, PA 19053'
      },
      capabilities: {
        products: true,
        inventory: true,
        pricing: true,
        orders: true,
        realTimeSync: true
      },
      integrationMethods: ['api', 'edi', 'sftp'],
      config: {
        name: 'ASI API',
        type: 'api',
        authentication: 'oauth2',
        rateLimits: {
          requestsPerMinute: 40,
          requestsPerHour: 600,
          requestsPerDay: 6000
        },
        endpoints: {
          baseUrl: 'https://api.asicentral.com/v3',
          products: '/catalog',
          inventory: '/availability',
          pricing: '/pricing',
          orders: '/orders',
          auth: '/oauth/token'
        },
        features: {
          productCatalog: true,
          realTimeInventory: true,
          realTimePricing: true,
          orderManagement: true,
          bulkOperations: true,
          webhooks: true
        },
        dataFormats: {
          products: 'json',
          inventory: 'json',
          pricing: 'json',
          orders: 'json'
        }
      },
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // BlueStar
    this.registerVendor({
      id: 'bluestar',
      name: 'BlueStar',
      type: 'distributor',
      description: 'BlueStar is a technology distributor specializing in point-of-sale and payment solutions',
      website: 'https://www.bluestarinc.com',
      contact: {
        email: 'support@bluestarinc.com',
        phone: '1-800-BLUESTAR',
        address: 'BlueStar, 5000 Tech Blvd, Charlotte, NC 28202'
      },
      capabilities: {
        products: true,
        inventory: true,
        pricing: true,
        orders: true,
        realTimeSync: true
      },
      integrationMethods: ['api', 'edi'],
      config: {
        name: 'BlueStar API',
        type: 'api',
        authentication: 'api_key',
        rateLimits: {
          requestsPerMinute: 50,
          requestsPerHour: 800,
          requestsPerDay: 8000
        },
        endpoints: {
          baseUrl: 'https://api.bluestarinc.com/v2',
          products: '/products',
          inventory: '/inventory',
          pricing: '/pricing',
          orders: '/orders'
        },
        features: {
          productCatalog: true,
          realTimeInventory: true,
          realTimePricing: true,
          orderManagement: true,
          bulkOperations: true,
          webhooks: true
        },
        dataFormats: {
          products: 'json',
          inventory: 'json',
          pricing: 'json',
          orders: 'json'
        }
      },
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Azerty
    this.registerVendor({
      id: 'azerty',
      name: 'Azerty',
      type: 'distributor',
      description: 'Azerty is a technology distributor serving the Midwest region',
      website: 'https://www.azerty.com',
      contact: {
        email: 'support@azerty.com',
        phone: '1-800-AZERTY',
        address: 'Azerty, 6000 Midwest Ave, Minneapolis, MN 55401'
      },
      capabilities: {
        products: true,
        inventory: true,
        pricing: true,
        orders: true,
        realTimeSync: false
      },
      integrationMethods: ['api', 'sftp'],
      config: {
        name: 'Azerty API',
        type: 'api',
        authentication: 'basic',
        rateLimits: {
          requestsPerMinute: 25,
          requestsPerHour: 400,
          requestsPerDay: 4000
        },
        endpoints: {
          baseUrl: 'https://api.azerty.com/v1',
          products: '/catalog',
          inventory: '/stock',
          pricing: '/prices',
          orders: '/orders'
        },
        features: {
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
      },
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Arbitech
    this.registerVendor({
      id: 'arbitech',
      name: 'Arbitech',
      type: 'distributor',
      description: 'Arbitech is a technology distributor specializing in networking and security solutions',
      website: 'https://www.arbitech.com',
      contact: {
        email: 'support@arbitech.com',
        phone: '1-800-ARBITECH',
        address: 'Arbitech, 7000 Network Dr, Irvine, CA 92618'
      },
      capabilities: {
        products: true,
        inventory: true,
        pricing: true,
        orders: true,
        realTimeSync: true
      },
      integrationMethods: ['api', 'edi'],
      config: {
        name: 'Arbitech API',
        type: 'api',
        authentication: 'oauth2',
        rateLimits: {
          requestsPerMinute: 35,
          requestsPerHour: 550,
          requestsPerDay: 5500
        },
        endpoints: {
          baseUrl: 'https://api.arbitech.com/v2',
          products: '/products',
          inventory: '/availability',
          pricing: '/pricing',
          orders: '/orders',
          auth: '/oauth/token'
        },
        features: {
          productCatalog: true,
          realTimeInventory: true,
          realTimePricing: true,
          orderManagement: true,
          bulkOperations: true,
          webhooks: true
        },
        dataFormats: {
          products: 'json',
          inventory: 'json',
          pricing: 'json',
          orders: 'json'
        }
      },
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // SED Int
    this.registerVendor({
      id: 'sed-int',
      name: 'SED International',
      type: 'distributor',
      description: 'SED International is a global technology distributor',
      website: 'https://www.sedintl.com',
      contact: {
        email: 'support@sedintl.com',
        phone: '1-800-SED-INTL',
        address: 'SED International, 8000 Global Way, Atlanta, GA 30328'
      },
      capabilities: {
        products: true,
        inventory: true,
        pricing: true,
        orders: true,
        realTimeSync: true
      },
      integrationMethods: ['api', 'edi', 'sftp'],
      config: {
        name: 'SED International API',
        type: 'api',
        authentication: 'api_key',
        rateLimits: {
          requestsPerMinute: 45,
          requestsPerHour: 700,
          requestsPerDay: 7000
        },
        endpoints: {
          baseUrl: 'https://api.sedintl.com/v2',
          products: '/catalog',
          inventory: '/inventory',
          pricing: '/pricing',
          orders: '/orders'
        },
        features: {
          productCatalog: true,
          realTimeInventory: true,
          realTimePricing: true,
          orderManagement: true,
          bulkOperations: true,
          webhooks: true
        },
        dataFormats: {
          products: 'json',
          inventory: 'json',
          pricing: 'json',
          orders: 'json'
        }
      },
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  registerVendor(vendor: VendorRegistry): void {
    this.vendors.set(vendor.id, vendor);
    this.logger.info(`Registered vendor: ${vendor.name} (${vendor.id})`);
  }

  getVendor(id: string): VendorRegistry | undefined {
    return this.vendors.get(id);
  }

  getAllVendors(): VendorRegistry[] {
    return Array.from(this.vendors.values());
  }

  getVendorsByType(type: string): VendorRegistry[] {
    return Array.from(this.vendors.values()).filter(vendor => vendor.type === type);
  }

  getVendorsByCapability(capability: keyof VendorRegistry['capabilities']): VendorRegistry[] {
    return Array.from(this.vendors.values()).filter(vendor => vendor.capabilities[capability]);
  }

  getVendorsByIntegrationMethod(method: string): VendorRegistry[] {
    return Array.from(this.vendors.values()).filter(vendor => 
      vendor.integrationMethods.includes(method as any)
    );
  }

  updateVendor(id: string, updates: Partial<VendorRegistry>): boolean {
    const vendor = this.vendors.get(id);
    if (!vendor) {
      return false;
    }

    const updatedVendor = { ...vendor, ...updates, updatedAt: new Date() };
    this.vendors.set(id, updatedVendor);
    this.logger.info(`Updated vendor: ${updatedVendor.name} (${id})`);
    return true;
  }

  removeVendor(id: string): boolean {
    const vendor = this.vendors.get(id);
    if (!vendor) {
      return false;
    }

    this.vendors.delete(id);
    this.logger.info(`Removed vendor: ${vendor.name} (${id})`);
    return true;
  }

  createUniversalConnectorConfig(vendorId: string, customConfig: Partial<UniversalConnectorConfig>): UniversalConnectorConfig | null {
    const vendor = this.getVendor(vendorId);
    if (!vendor) {
      return null;
    }

    const defaultConfig: UniversalConnectorConfig = {
      type: 'api',
      name: vendor.name,
      description: vendor.description,
      credentials: {},
      config: vendor.config,
      mappings: {
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

    return { ...defaultConfig, ...customConfig };
  }

  searchVendors(query: string): VendorRegistry[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.vendors.values()).filter(vendor => 
      vendor.name.toLowerCase().includes(lowercaseQuery) ||
      vendor.description.toLowerCase().includes(lowercaseQuery) ||
      vendor.type.toLowerCase().includes(lowercaseQuery)
    );
  }

  getVendorStats(): {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byIntegrationMethod: Record<string, number>;
  } {
    const vendors = Array.from(this.vendors.values());
    
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byIntegrationMethod: Record<string, number> = {};

    vendors.forEach(vendor => {
      // Count by type
      byType[vendor.type] = (byType[vendor.type] || 0) + 1;
      
      // Count by status
      byStatus[vendor.status] = (byStatus[vendor.status] || 0) + 1;
      
      // Count by integration method
      vendor.integrationMethods.forEach(method => {
        byIntegrationMethod[method] = (byIntegrationMethod[method] || 0) + 1;
      });
    });

    return {
      total: vendors.length,
      byType,
      byStatus,
      byIntegrationMethod
    };
  }
} 