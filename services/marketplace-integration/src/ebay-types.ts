// eBay Trading API Types
// Based on eBay Trading API and REST API specifications

export interface EbayCredentials {
  // eBay Trading API credentials
  appId: string;
  certId: string;
  devId: string;
  authToken: string;
  
  // eBay REST API credentials
  clientId: string;
  clientSecret: string;
  refreshToken?: string;
  accessToken?: string;
  
  // Site configuration
  siteId: number; // 0=US, 2=Canada, 3=UK, etc.
  sandbox: boolean;
}

export interface EbaySite {
  id: number;
  name: string;
  countryCode: string;
  currency: string;
  timezone: string;
  language: string;
}

export interface EbayProduct {
  itemId: string;
  sku: string;
  title: string;
  description?: string;
  categoryId: number;
  conditionId: number;
  conditionDescription?: string;
  images?: EbayImage[];
  variations?: EbayVariation[];
  status: 'active' | 'ended' | 'suspended' | 'pending';
  listingType: 'FixedPrice' | 'Auction' | 'AuctionWithBIN';
  startPrice?: number;
  buyItNowPrice?: number;
  currency: string;
  quantity: number;
  quantityAvailable: number;
  location: string;
  postalCode: string;
  country: string;
  listingDuration: string;
  startTime: Date;
  endTime: Date;
  viewItemURL: string;
}

export interface EbayImage {
  url: string;
  height: number;
  width: number;
  altText?: string;
}

export interface EbayVariation {
  sku: string;
  startPrice: number;
  quantity: number;
  quantityAvailable: number;
  variationSpecifics?: Record<string, string[]>;
}

export interface EbayListing {
  itemId: string;
  sku: string;
  title: string;
  price: number;
  currency: string;
  quantity: number;
  quantityAvailable: number;
  status: 'active' | 'ended' | 'suspended' | 'pending';
  listingType: 'FixedPrice' | 'Auction' | 'AuctionWithBIN';
  startTime: Date;
  endTime: Date;
  viewItemURL: string;
  categoryId: number;
  conditionId: number;
  location: string;
  postalCode: string;
  country: string;
}

export interface EbayOrder {
  orderId: string;
  orderStatus: 'Complete' | 'Incomplete' | 'Pending' | 'Shipped' | 'Cancelled';
  adjustmentAmount?: {
    currency: string;
    value: string;
  };
  amountPaid?: {
    currency: string;
    value: string;
  };
  amountSaved?: {
    currency: string;
    value: string;
  };
  buyerCheckoutMessage?: string;
  buyerUserID: string;
  checkoutStatus: {
    ebayPaymentStatus: string;
    lastModifiedTime: Date;
    paymentMethod: string;
    status: string;
    integratedMerchantCreditCardEnabled: boolean;
  };
  creationTime: Date;
  lastModifiedTime: Date;
  orderItems: EbayOrderItem[];
  paidTime?: Date;
  paymentHoldStatus: string;
  sellerUserID: string;
  shippingAddress: EbayAddress;
  shippingServiceSelected?: {
    shippingService: string;
    shippingServiceCost: {
      currency: string;
      value: string;
    };
    shippingServicePriority: number;
  };
  subtotal?: {
    currency: string;
    value: string;
  };
  total?: {
    currency: string;
    value: string;
  };
}

export interface EbayOrderItem {
  itemId: string;
  sku: string;
  title: string;
  quantity: number;
  transactionId: string;
  transactionPrice: {
    currency: string;
    value: string;
  };
  listingType: string;
  variation?: {
    sku: string;
    variationSpecifics?: Record<string, string[]>;
  };
}

export interface EbayAddress {
  name: string;
  street1: string;
  street2?: string;
  cityName: string;
  stateOrProvince: string;
  country: string;
  countryName: string;
  phone?: string;
  postalCode: string;
  addressID?: string;
  addressOwner?: string;
  externalAddressID?: string;
  internationalName?: string;
  internationalStateAndCity?: string;
  internationalStreet?: string;
  addressType?: string;
}

export interface EbayInventoryUpdate {
  sku: string;
  quantity: number;
  price?: number;
  currency?: string;
}

export interface EbayPriceUpdate {
  sku: string;
  price: number;
  currency: string;
}

export interface EbayApiResponse<T> {
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

export interface EbayWebhookPayload {
  eventType: 'ORDER_PAID' | 'ORDER_SHIPPED' | 'ITEM_SOLD' | 'ITEM_ENDED' | 'INVENTORY_UPDATED';
  eventTime: Date;
  data: any;
}

// API Endpoints
export const EBAY_API_ENDPOINTS = {
  production: {
    trading: 'https://api.ebay.com/ws/api.dll',
    rest: 'https://api.ebay.com',
    auth: 'https://api.ebay.com/identity/v1/oauth2/token'
  },
  sandbox: {
    trading: 'https://api.sandbox.ebay.com/ws/api.dll',
    rest: 'https://api.sandbox.ebay.com',
    auth: 'https://api.sandbox.ebay.com/identity/v1/oauth2/token'
  }
} as const;

// Site IDs
export const EBAY_SITE_IDS = {
  'US': 0,
  'Canada': 2,
  'UK': 3,
  'Australia': 15,
  'Austria': 16,
  'Belgium_French': 23,
  'France': 71,
  'Germany': 77,
  'Italy': 101,
  'Spain': 186,
  'Switzerland': 193,
  'Ireland': 205
} as const;

// Condition IDs
export const EBAY_CONDITION_IDS = {
  'New': 1000,
  'New_Other': 1500,
  'New_WithDefects': 1501,
  'New_OEM': 1502,
  'New_OpenBox': 1503,
  'New_OriginalWrapping': 1504,
  'Used_Excellent': 2000,
  'Used_VeryGood': 2010,
  'Used_Good': 2020,
  'Used_Acceptable': 2030,
  'Used_NotWorking': 3000,
  'ForPartsOrNotWorking': 4000,
  'Unspecified': 5000
} as const;

// Listing Types
export const EBAY_LISTING_TYPES = {
  'FixedPrice': 'FixedPrice',
  'Auction': 'Auction',
  'AuctionWithBIN': 'AuctionWithBIN'
} as const;

// Listing Durations
export const EBAY_LISTING_DURATIONS = {
  'Days_1': 'Days_1',
  'Days_3': 'Days_3',
  'Days_5': 'Days_5',
  'Days_7': 'Days_7',
  'Days_10': 'Days_10',
  'Days_30': 'Days_30',
  'GTC': 'GTC' // Good Till Cancelled
} as const; 