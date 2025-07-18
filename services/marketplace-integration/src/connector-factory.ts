import { 
  MarketplaceConnector, 
  MarketplaceCredentials, 
  MarketplaceSettings 
} from './marketplace-connector';
import { AmazonConnector } from './connectors/amazon-connector';
import { AmazonRealConnector } from './connectors/amazon-real-connector';
import { WalmartConnector } from './connectors/walmart-connector';
import { EbayConnector } from './connectors/ebay-connector';
import { EbayRealConnector } from './connectors/ebay-real-connector';

export type MarketplaceType = 'amazon' | 'amazon-real' | 'walmart' | 'ebay' | 'ebay-real';

export class MarketplaceConnectorFactory {
  private static logger: any;

  static setLogger(logger: any): void {
    MarketplaceConnectorFactory.logger = logger;
  }

  static createConnector(
    type: MarketplaceType,
    credentials: MarketplaceCredentials,
    settings: MarketplaceSettings
  ): MarketplaceConnector {
    if (!MarketplaceConnectorFactory.logger) {
      throw new Error('Logger must be set before creating connectors');
    }

    switch (type.toLowerCase()) {
      case 'amazon':
        return new AmazonConnector(credentials, settings, MarketplaceConnectorFactory.logger);
      
      case 'amazon-real':
        return new AmazonRealConnector(credentials, settings, MarketplaceConnectorFactory.logger);
      
      case 'walmart':
        return new WalmartConnector(credentials, settings, MarketplaceConnectorFactory.logger);
      
      case 'ebay':
        return new EbayConnector(credentials, settings, MarketplaceConnectorFactory.logger);
      
      case 'ebay-real':
        return new EbayRealConnector(credentials, settings, MarketplaceConnectorFactory.logger);
      
      default:
        throw new Error(`Unsupported marketplace type: ${type}`);
    }
  }

  static getSupportedMarketplaces(): MarketplaceType[] {
    return ['amazon', 'amazon-real', 'walmart', 'ebay', 'ebay-real'];
  }

  static getMarketplaceInfo(type: MarketplaceType): {
    name: string;
    description: string;
    requiredCredentials: string[];
    features: string[];
    rateLimits: { requestsPerSecond: number; requestsPerHour: number };
  } {
    switch (type.toLowerCase()) {
      case 'amazon':
        return {
          name: 'Amazon Seller Central (Mock)',
          description: 'Amazon marketplace integration for sellers (mock data)',
          requiredCredentials: ['apiKey', 'apiSecret', 'sellerId'],
          features: ['inventory', 'pricing', 'orders', 'listings'],
          rateLimits: { requestsPerSecond: 2, requestsPerHour: 7200 }
        };
      
      case 'amazon-real':
        return {
          name: 'Amazon Seller Central (Real API)',
          description: 'Amazon marketplace integration with real API calls',
          requiredCredentials: ['clientId', 'clientSecret', 'sellerId', 'marketplaceId'],
          features: ['inventory', 'pricing', 'orders', 'listings', 'reports'],
          rateLimits: { requestsPerSecond: 2, requestsPerHour: 7200 }
        };
      
      case 'walmart':
        return {
          name: 'Walmart Marketplace',
          description: 'Walmart marketplace integration for sellers',
          requiredCredentials: ['apiKey', 'apiSecret'],
          features: ['inventory', 'pricing', 'orders', 'listings'],
          rateLimits: { requestsPerSecond: 1, requestsPerHour: 3600 }
        };
      
      case 'ebay':
        return {
          name: 'eBay Trading API',
          description: 'eBay marketplace integration for sellers',
          requiredCredentials: ['apiKey', 'apiSecret', 'sellerId', 'accessToken'],
          features: ['inventory', 'pricing', 'orders', 'listings'],
          rateLimits: { requestsPerSecond: 5, requestsPerHour: 5000 }
        };
      
      case 'ebay-real':
        return {
          name: 'eBay Trading API (Real)',
          description: 'Real eBay marketplace integration with actual API calls',
          requiredCredentials: ['apiKey', 'apiSecret', 'sellerId', 'marketplaceId'],
          features: ['inventory', 'pricing', 'orders', 'listings'],
          rateLimits: { requestsPerSecond: 5, requestsPerHour: 5000 }
        };
      
      default:
        throw new Error(`Unsupported marketplace type: ${type}`);
    }
  }

  static validateCredentials(type: MarketplaceType, credentials: MarketplaceCredentials): {
    valid: boolean;
    errors: string[];
  } {
    const info = this.getMarketplaceInfo(type);
    const errors: string[] = [];

    for (const required of info.requiredCredentials) {
      if (!credentials[required as keyof MarketplaceCredentials]) {
        errors.push(`Missing required credential: ${required}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
} 