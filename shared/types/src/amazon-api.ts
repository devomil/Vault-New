// Amazon Seller Central API Types
// Based on Amazon Selling Partner API and MWS API specifications

export interface AmazonCredentials {
  // MWS API credentials
  accessKeyId?: string;
  secretAccessKey?: string;
  sellerId: string;
  marketplaceId: string;
  
  // Selling Partner API credentials
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
  accessToken?: string;
  
  // Region configuration
  region: 'us-east-1' | 'us-west-2' | 'eu-west-1' | 'eu-central-1' | 'ap-southeast-1';
  
  // API version
  apiVersion: 'v1' | 'v2';
}

export interface AmazonMarketplace {
  id: string;
  name: string;
  countryCode: string;
  currency: string;
  timezone: string;
  region: string;
}

export interface AmazonProduct {
  asin: string;
  sku: string;
  title: string;
  description?: string;
  brand?: string;
  category?: string;
  images?: string[];
  attributes?: Record<string, any>;
  status: 'active' | 'inactive' | 'pending' | 'error';
  listingPrice?: number;
  currency?: string;
  quantity?: number;
  fulfillmentChannel?: 'AMAZON' | 'MERCHANT';
  condition?: 'New' | 'Used' | 'Collectible' | 'Refurbished';
}

export interface AmazonListing {
  asin: string;
  sku: string;
  title: string;
  price: number;
  currency: string;
  quantity: number;
  status: 'active' | 'inactive' | 'pending' | 'error';
  fulfillmentChannel: 'AMAZON' | 'MERCHANT';
  condition: 'New' | 'Used' | 'Collectible' | 'Refurbished';
  marketplaceId: string;
  lastUpdated: Date;
}

export interface AmazonOrder {
  amazonOrderId: string;
  sellerOrderId?: string;
  orderStatus: 'Pending' | 'Unshipped' | 'PartiallyShipped' | 'Shipped' | 'Canceled' | 'Unfulfillable';
  orderType: 'StandardOrder' | 'Preorder';
  purchaseDate: Date;
  lastUpdateDate: Date;
  fulfillmentChannel: 'MFN' | 'AFN';
  salesChannel?: string;
  orderChannel?: string;
  shipServiceLevel?: string;
  orderTotal?: {
    currencyCode: string;
    amount: number;
  };
  numberOfItemsShipped: number;
  numberOfItemsUnshipped: number;
  paymentMethod?: string;
  marketplaceId: string;
  shipmentServiceLevelCategory?: string;
  orderItems: AmazonOrderItem[];
  shippingAddress?: AmazonAddress;
  buyerInfo?: AmazonBuyerInfo;
}

export interface AmazonOrderItem {
  asin: string;
  sellerSku: string;
  title: string;
  quantityOrdered: number;
  quantityShipped: number;
  itemPrice?: {
    currencyCode: string;
    amount: number;
  };
  shippingPrice?: {
    currencyCode: string;
    amount: number;
  };
  itemTax?: {
    currencyCode: string;
    amount: number;
  };
  shippingTax?: {
    currencyCode: string;
    amount: number;
  };
  shippingDiscount?: {
    currencyCode: string;
    amount: number;
  };
  shippingDiscountTax?: {
    currencyCode: string;
    amount: number;
  };
  promotionDiscount?: {
    currencyCode: string;
    amount: number;
  };
  promotionDiscountTax?: {
    currencyCode: string;
    amount: number;
  };
  codFee?: {
    currencyCode: string;
    amount: number;
  };
  codFeeDiscount?: {
    currencyCode: string;
    amount: number;
  };
  isGift?: boolean;
  conditionNote?: string;
  conditionId?: string;
  conditionSubtypeId?: string;
  scheduledDeliveryStartDate?: Date;
  scheduledDeliveryEndDate?: Date;
  priceDesignation?: string;
}

export interface AmazonAddress {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  addressLine3?: string;
  city: string;
  county?: string;
  district?: string;
  stateOrRegion: string;
  municipality?: string;
  postalCode: string;
  countryCode: string;
  phone?: string;
  addressType?: 'Residential' | 'Commercial';
}

export interface AmazonBuyerInfo {
  buyerEmail?: string;
  buyerName?: string;
  buyerCounty?: string;
  buyerTaxInfo?: {
    companyLegalName?: string;
    taxingRegion?: string;
    taxClassifications?: Array<{
      name: string;
      value: string;
    }>;
  };
  purchaseOrderNumber?: string;
}

export interface AmazonInventoryUpdate {
  sku: string;
  quantity: number;
  fulfillmentLatency?: number;
  supplyDetail?: Array<{
    quantity: number;
    supplyType: 'InStock' | 'Inbound' | 'Transfer';
    earliestAvailableToPick?: Date;
    latestAvailableToPick?: Date;
  }>;
}

export interface AmazonPriceUpdate {
  sku: string;
  price: number;
  currency: string;
  marketplaceId: string;
}

export interface AmazonReportRequest {
  reportType: string;
  dataStartTime?: Date;
  dataEndTime?: Date;
  marketplaceIds?: string[];
  reportOptions?: Record<string, string>;
}

export interface AmazonReport {
  reportId: string;
  reportType: string;
  dataStartTime?: Date;
  dataEndTime?: Date;
  status: 'CANCELLED' | 'DONE' | 'FATAL' | 'IN_PROGRESS' | 'IN_QUEUE';
  processingStatus: 'CANCELLED' | 'DONE' | 'FATAL' | 'IN_PROGRESS' | 'IN_QUEUE';
  marketplaceIds?: string[];
  createdTime: Date;
  processingStartTime?: Date;
  processingEndTime?: Date;
  reportDocumentId?: string;
}

export interface AmazonApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  rateLimit?: {
    remaining: number;
    resetTime: Date;
  };
}

export interface AmazonWebhookPayload {
  eventType: 'ORDER_STATUS_CHANGED' | 'INVENTORY_UPDATED' | 'PRICE_CHANGED' | 'LISTING_STATUS_CHANGED';
  eventTime: Date;
  marketplaceId: string;
  data: any;
}

// API Endpoints
export const AMAZON_API_ENDPOINTS = {
  'us-east-1': {
    mws: 'https://mws.amazonservices.com',
    spApi: 'https://sellingpartnerapi-na.amazon.com'
  },
  'us-west-2': {
    mws: 'https://mws.amazonservices.com',
    spApi: 'https://sellingpartnerapi-na.amazon.com'
  },
  'eu-west-1': {
    mws: 'https://mws-eu.amazonservices.com',
    spApi: 'https://sellingpartnerapi-eu.amazon.com'
  },
  'eu-central-1': {
    mws: 'https://mws-eu.amazonservices.com',
    spApi: 'https://sellingpartnerapi-eu.amazon.com'
  },
  'ap-southeast-1': {
    mws: 'https://mws.amazonservices.com',
    spApi: 'https://sellingpartnerapi-fe.amazon.com'
  }
} as const;

// Marketplace IDs
export const AMAZON_MARKETPLACE_IDS = {
  'US': 'ATVPDKIKX0DER',
  'CA': 'A2EUQ1WTGCTBG2',
  'MX': 'A1AM78C64UM0Y8',
  'BR': 'A2Q3Y263D00KWC',
  'ES': 'A1RKKUPIHCS9HS',
  'UK': 'A1F83G8C2ARO7P',
  'FR': 'A13V1IB3VIYZZH',
  'DE': 'A1PA6795UKMFR9',
  'IT': 'APJ6JRA9NG5V4',
  'JP': 'A1VC38T7YXB528',
  'AU': 'A39IBJ37TRP1C6',
  'IN': 'A21TJRUUN4KGV'
} as const;

// Report Types
export const AMAZON_REPORT_TYPES = {
  // Inventory Reports
  'GET_FLAT_FILE_OPEN_LISTINGS_DATA': 'Open Listings Report',
  'GET_MERCHANT_LISTINGS_DATA': 'Active Listings Report',
  'GET_MERCHANT_LISTINGS_INACTIVE_DATA': 'Inactive Listings Report',
  
  // Order Reports
  'GET_FLAT_FILE_ORDERS_DATA_BY_ORDER_DATE_GENERAL': 'Orders Report',
  'GET_FLAT_FILE_ORDERS_DATA_BY_LAST_UPDATE_GENERAL': 'Orders Report by Last Update',
  
  // Financial Reports
  'GET_FLAT_FILE_ACTIONABLE_ORDER_DATA_SHIPPING': 'Shipping Actionable Order Report',
  
  // Performance Reports
  'GET_SELLER_FEEDBACK_DATA': 'Seller Feedback Report',
  'GET_V1_SELLER_PERFORMANCE_REPORT': 'Seller Performance Report'
} as const; 