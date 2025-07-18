import { Vendor, VendorType, VendorCredentials } from '../../../shared/types/src';
import { VendorConnector, VendorConnectorConfig } from './vendor-connector';
import { IngramMicroConnector } from './connectors/ingram-connector';
import { TDSynnexConnector } from './connectors/td-synnex-connector';
import { DHConnector } from './connectors/dh-connector';

export class VendorConnectorFactory {
  static createConnector(vendor: Vendor, credentials: VendorCredentials, settings?: Record<string, any>): VendorConnector {
    const config: VendorConnectorConfig = {
      credentials,
      settings: settings || {},
      timeout: 30000,
      retryAttempts: 3
    };

    switch (vendor.type as VendorType) {
      case 'ingram_micro':
        return new IngramMicroConnector(vendor, config);
      
      case 'td_synnex':
        return new TDSynnexConnector(vendor, config);
      
      case 'dh_distributing':
        return new DHConnector(vendor, config);
      
      case 'wynit':
        // TODO: Implement Wynit connector
        throw new Error('Wynit connector not yet implemented');
      
      case 'other':
        // TODO: Implement generic connector
        throw new Error('Generic vendor connector not yet implemented');
      
      default:
        throw new Error(`Unsupported vendor type: ${vendor.type}`);
    }
  }

  static getSupportedVendorTypes(): VendorType[] {
    return ['ingram_micro', 'td_synnex', 'dh_distributing'];
  }

  static isVendorTypeSupported(vendorType: string): boolean {
    return this.getSupportedVendorTypes().includes(vendorType as VendorType);
  }

  static getVendorTypeDisplayName(vendorType: VendorType): string {
    const displayNames: Record<VendorType, string> = {
      ingram_micro: 'Ingram Micro',
      td_synnex: 'TD Synnex',
      dh_distributing: 'D&H Distributing',
      wynit: 'Wynit',
      other: 'Other'
    };

    return displayNames[vendorType] || vendorType;
  }

  static getVendorTypeDescription(vendorType: VendorType): string {
    const descriptions: Record<VendorType, string> = {
      ingram_micro: 'Global technology distributor with comprehensive product catalog',
      td_synnex: 'Technology solutions aggregator with extensive partner network (merged Tech Data and Synnex)',
      dh_distributing: 'Specialized distributor focusing on consumer electronics and accessories',
      wynit: 'Consumer electronics and accessories distributor',
      other: 'Custom vendor integration'
    };

    return descriptions[vendorType] || 'Vendor integration';
  }
} 