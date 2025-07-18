import { VendorConnector, VendorConnectorConfig } from './vendor-connector';
import { IngramMicroConnector } from './connectors/ingram-connector';
import { TDSynnexConnector } from './connectors/td-synnex-connector';
import { DHConnector } from './connectors/dh-connector';
import { SPRichardsConnector } from './connectors/sp-richards-connector';
import { UniversalConnector } from './connectors/universal-connector';
import { VendorRegistryService } from './vendor-registry';
import { UniversalConnectorConfig, VendorCredentials } from './vendor-types';

// Extended vendor types for this service
export interface Vendor {
  id?: string;
  tenantId?: string;
  vendorId?: string;
  name: string;
  type: VendorType;
  description?: string;
  status: 'active' | 'inactive' | 'suspended';
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type VendorType = 
  | 'ingram_micro' 
  | 'td_synnex' 
  | 'dh_distributing'
  | 'sp_richards'
  | 'newwave'
  | 'supplies_network'
  | 'asi'
  | 'bluestar'
  | 'azerty'
  | 'arbitech'
  | 'sed_int'
  | 'universal'
  | 'wynit'
  | 'other';

export class VendorConnectorFactory {
  static createConnector(vendor: Vendor, credentials: VendorCredentials, settings?: Record<string, any>, logger?: any): VendorConnector {
    const config: VendorConnectorConfig = {
      credentials,
      settings: settings || {},
      timeout: 30000,
      retryAttempts: 3
    };

    // Check if this is a real vendor from our registry
    const registry = VendorRegistryService.getInstance(logger);
    const vendorRegistry = registry.getVendor(vendor.type);
    
    if (vendorRegistry) {
      // Use the universal connector for registered vendors
      const universalConfig = registry.createUniversalConnectorConfig(vendor.type, {
        credentials: credentials as any
      });
      
      if (universalConfig) {
        return new UniversalConnector(vendor, universalConfig, logger);
      }
    }

    // Fall back to specific connectors
    switch (vendor.type as VendorType) {
      case 'ingram_micro':
        return new IngramMicroConnector(vendor, config);
      
      case 'td_synnex':
        return new TDSynnexConnector(vendor, config);
      
      case 'dh_distributing':
        return new DHConnector(vendor, config);
      
      case 'sp_richards':
        return new SPRichardsConnector(vendor, config);
      
      case 'universal':
        // Create universal connector with custom configuration
        const universalConfig: UniversalConnectorConfig = {
          type: 'api',
          name: vendor.name,
          description: vendor.description || '',
          credentials: credentials as any,
          config: {
            name: vendor.name,
            type: 'api',
            authentication: 'api_key',
            rateLimits: {
              requestsPerMinute: 30,
              requestsPerHour: 500,
              requestsPerDay: 5000
            },
            endpoints: {
              baseUrl: credentials.endpoint || '',
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
        return new UniversalConnector(vendor, universalConfig, logger);
      
      case 'wynit':
        // TODO: Implement Wynit connector
        throw new Error('Wynit connector not yet implemented');
      
      case 'other':
        // Use universal connector for unknown vendors
        const defaultUniversalConfig: UniversalConnectorConfig = {
          type: 'api',
          name: vendor.name,
          description: vendor.description || '',
          credentials: credentials as any,
          config: {
            name: vendor.name,
            type: 'api',
            authentication: 'api_key',
            rateLimits: {
              requestsPerMinute: 20,
              requestsPerHour: 300,
              requestsPerDay: 3000
            },
            endpoints: {
              baseUrl: credentials.endpoint || '',
              products: '/products',
              inventory: '/inventory',
              pricing: '/pricing',
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
        return new UniversalConnector(vendor, defaultUniversalConfig, logger);
      
      default:
        throw new Error(`Unsupported vendor type: ${vendor.type}`);
    }
  }

  static getSupportedVendorTypes(): VendorType[] {
    return [
      'ingram_micro', 
      'td_synnex', 
      'dh_distributing',
      'sp_richards',
      'newwave',
      'supplies_network',
      'asi',
      'bluestar',
      'azerty',
      'arbitech',
      'sed_int',
      'universal',
      'other'
    ];
  }

  static isVendorTypeSupported(vendorType: string): boolean {
    return this.getSupportedVendorTypes().includes(vendorType as VendorType);
  }

  static getVendorTypeDisplayName(vendorType: VendorType): string {
    const displayNames: Record<VendorType, string> = {
      ingram_micro: 'Ingram Micro',
      td_synnex: 'TD Synnex',
      dh_distributing: 'D&H Distributing',
      sp_richards: 'SP Richards',
      newwave: 'Newwave',
      supplies_network: 'SuppliesNetwork',
      asi: 'ASI',
      bluestar: 'BlueStar',
      azerty: 'Azerty',
      arbitech: 'Arbitech',
      sed_int: 'SED International',
      universal: 'Universal Connector',
      wynit: 'Wynit',
      other: 'Custom Vendor'
    };

    return displayNames[vendorType] || vendorType;
  }

  static getVendorTypeDescription(vendorType: VendorType): string {
    const descriptions: Record<VendorType, string> = {
      ingram_micro: 'Global technology distributor with comprehensive product catalog',
      td_synnex: 'Technology solutions aggregator with extensive partner network (merged Tech Data and Synnex)',
      dh_distributing: 'Specialized distributor focusing on consumer electronics and accessories',
      sp_richards: 'Leading wholesale distributor of office products and supplies',
      newwave: 'Technology distributor specializing in IT products and solutions',
      supplies_network: 'B2B marketplace for office supplies and equipment',
      asi: 'Promotional products distributor with extensive catalog',
      bluestar: 'Technology distributor specializing in point-of-sale and payment solutions',
      azerty: 'Technology distributor serving the Midwest region',
      arbitech: 'Technology distributor specializing in networking and security solutions',
      sed_int: 'Global technology distributor',
      universal: 'Universal connector for any vendor with API, SFTP, EDI, or webhook support',
      wynit: 'Consumer electronics and accessories distributor',
      other: 'Custom vendor integration with universal connector'
    };

    return descriptions[vendorType] || 'Vendor integration';
  }

  static getVendorRegistry(): VendorRegistryService {
    return VendorRegistryService.getInstance();
  }
} 