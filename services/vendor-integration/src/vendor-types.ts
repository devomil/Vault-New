// Vendor Integration API Types
// Comprehensive types for real vendor integrations

export interface VendorCredentials {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  username?: string;
  password?: string;
  endpoint?: string;
  clientId?: string;
  clientSecret?: string;
  sftpHost?: string;
  sftpPort?: number;
  sftpUsername?: string;
  sftpPassword?: string;
  sftpPrivateKey?: string;
  ediPartnerId?: string;
  ediSenderId?: string;
  ediReceiverId?: string;
  customHeaders?: Record<string, string>;
  customParams?: Record<string, any>;
}

export interface VendorConfig {
  name: string;
  type: 'api' | 'sftp' | 'edi' | 'webhook' | 'custom';
  authentication: 'oauth2' | 'api_key' | 'basic' | 'sftp_key' | 'edi' | 'custom';
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  endpoints: {
    baseUrl: string;
    products?: string;
    inventory?: string;
    pricing?: string;
    orders?: string;
    auth?: string;
  };
  features: {
    productCatalog: boolean;
    realTimeInventory: boolean;
    realTimePricing: boolean;
    orderManagement: boolean;
    bulkOperations: boolean;
    webhooks: boolean;
  };
  dataFormats: {
    products: 'json' | 'xml' | 'csv' | 'edi';
    inventory: 'json' | 'xml' | 'csv' | 'edi';
    pricing: 'json' | 'xml' | 'csv' | 'edi';
    orders: 'json' | 'xml' | 'csv' | 'edi';
  };
}

// SP Richards Types
export interface SPRichardsProduct {
  sku: string;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  price: number;
  cost: number;
  quantity: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  attributes?: Record<string, any>;
}

export interface SPRichardsOrder {
  orderId: string;
  customerId: string;
  orderDate: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items: Array<{
    sku: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  totalAmount: number;
  shippingAddress?: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

// Newwave Types
export interface NewwaveProduct {
  productCode: string;
  name: string;
  description?: string;
  category?: string;
  manufacturer?: string;
  listPrice: number;
  netPrice: number;
  availableQuantity: number;
  weight?: number;
  attributes?: Record<string, any>;
}

export interface NewwaveOrder {
  orderNumber: string;
  customerNumber: string;
  orderDate: string;
  status: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: Array<{
    productCode: string;
    name: string;
    quantity: number;
    unitPrice: number;
    extendedPrice: number;
  }>;
  totalAmount: number;
}

// SuppliesNetwork Types
export interface SuppliesNetworkProduct {
  itemNumber: string;
  description: string;
  category?: string;
  brand?: string;
  listPrice: number;
  netPrice: number;
  quantityAvailable: number;
  weight?: number;
  attributes?: Record<string, any>;
}

export interface SuppliesNetworkOrder {
  orderId: string;
  customerId: string;
  orderDate: string;
  status: 'open' | 'processing' | 'shipped' | 'closed' | 'cancelled';
  items: Array<{
    itemNumber: string;
    description: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  totalAmount: number;
}

// ASI Types
export interface ASIProduct {
  asiNumber: string;
  name: string;
  description?: string;
  category?: string;
  supplier?: string;
  price: number;
  cost: number;
  quantity: number;
  attributes?: Record<string, any>;
}

export interface ASIOrder {
  orderId: string;
  customerId: string;
  orderDate: string;
  status: 'pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled';
  items: Array<{
    asiNumber: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  totalAmount: number;
}

// BlueStar Types
export interface BlueStarProduct {
  partNumber: string;
  name: string;
  description?: string;
  category?: string;
  manufacturer?: string;
  price: number;
  cost: number;
  stockQuantity: number;
  attributes?: Record<string, any>;
}

export interface BlueStarOrder {
  orderId: string;
  customerId: string;
  orderDate: string;
  status: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: Array<{
    partNumber: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  totalAmount: number;
}

// Azerty Types
export interface AzertyProduct {
  sku: string;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  price: number;
  cost: number;
  quantity: number;
  attributes?: Record<string, any>;
}

export interface AzertyOrder {
  orderId: string;
  customerId: string;
  orderDate: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items: Array<{
    sku: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  totalAmount: number;
}

// Arbitech Types
export interface ArbitechProduct {
  productId: string;
  name: string;
  description?: string;
  category?: string;
  manufacturer?: string;
  price: number;
  cost: number;
  availableQuantity: number;
  attributes?: Record<string, any>;
}

export interface ArbitechOrder {
  orderId: string;
  customerId: string;
  orderDate: string;
  status: 'open' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  totalAmount: number;
}

// SED Int Types
export interface SEDIntProduct {
  itemCode: string;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  price: number;
  cost: number;
  quantity: number;
  attributes?: Record<string, any>;
}

export interface SEDIntOrder {
  orderId: string;
  customerId: string;
  orderDate: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: Array<{
    itemCode: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  totalAmount: number;
}

// Universal Vendor Response Types
export interface VendorApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export interface VendorSyncResult {
  success: boolean;
  itemsProcessed: number;
  itemsTotal: number;
  errors: string[];
  warnings: string[];
  data?: any;
  timestamp: Date;
}

export interface VendorConnectionTest {
  success: boolean;
  message: string;
  details?: {
    authentication: boolean;
    products: boolean;
    inventory: boolean;
    pricing: boolean;
    orders: boolean;
  };
  errors?: string[];
}

// SFTP Configuration Types
export interface SFTPConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
  passphrase?: string;
  remotePath: string;
  localPath: string;
  filePattern: string;
  deleteAfterDownload: boolean;
  timeout: number;
}

// EDI Configuration Types
export interface EDIConfig {
  partnerId: string;
  senderId: string;
  receiverId: string;
  version: string;
  documentTypes: {
    products: string;
    inventory: string;
    pricing: string;
    orders: string;
  };
  fileFormat: 'x12' | 'edifact' | 'custom';
  encoding: 'utf8' | 'ascii' | 'iso-8859-1';
  delimiter: string;
  segmentTerminator: string;
}

// Universal Connector Types
export interface UniversalConnectorConfig {
  type: 'api' | 'sftp' | 'edi' | 'webhook' | 'custom';
  name: string;
  description: string;
  credentials: VendorCredentials;
  config: VendorConfig;
  mappings: {
    products: Record<string, string>;
    inventory: Record<string, string>;
    pricing: Record<string, string>;
    orders: Record<string, string>;
  };
  transformations?: {
    products?: (data: any) => any;
    inventory?: (data: any) => any;
    pricing?: (data: any) => any;
    orders?: (data: any) => any;
  };
}

// Vendor Registry Types
export interface VendorRegistry {
  id: string;
  name: string;
  type: string;
  description: string;
  website?: string;
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  capabilities: {
    products: boolean;
    inventory: boolean;
    pricing: boolean;
    orders: boolean;
    realTimeSync: boolean;
  };
  integrationMethods: ('api' | 'sftp' | 'edi' | 'webhook')[];
  config: VendorConfig;
  status: 'active' | 'inactive' | 'testing';
  createdAt: Date;
  updatedAt: Date;
} 