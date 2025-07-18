// Walmart Marketplace API Types
// Based on Walmart Marketplace API specifications

export interface WalmartCredentials {
  clientId: string;
  clientSecret: string;
  correlationId: string;
  channelType: 'MARKETPLACE' | 'DROPSHIP';
  environment: 'PRODUCTION' | 'SANDBOX';
}

export interface WalmartMarketplace {
  id: string;
  name: string;
  countryCode: string;
  currency: string;
  timezone: string;
  region: string;
}

export interface WalmartProduct {
  sku: string;
  productName: string;
  shortDescription: string;
  price: {
    amount: number;
    currency: string;
  };
  shipping: {
    weight: {
      value: number;
      unit: string;
    };
    dimension: {
      length: number;
      width: number;
      height: number;
      unit: string;
    };
  };
  inventory: {
    quantity: number;
    fulfillmentLagTime: number;
  };
  images: string[];
  attributes: Record<string, any>;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'REJECTED';
}

export interface WalmartOrder {
  purchaseOrderId: string;
  customerOrderId: string;
  customerEmailId: string;
  orderDate: string;
  buyerId: string;
  mart: string;
  isGuest: boolean;
  shippingInfo: {
    phone: string;
    estimatedDeliveryDate: string;
    estimatedShipDate: string;
    methodCode: string;
    postalAddress: {
      name: string;
      address1: string;
      address2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      addressType: string;
    };
  };
  orderLines: WalmartOrderLine[];
  paymentType: string;
  orderStatus: 'Acknowledged' | 'Created' | 'Shipped' | 'Delivered' | 'Cancelled';
  orderTotal: {
    totalAmount: number;
    currency: string;
  };
}

export interface WalmartOrderLine {
  orderLineNumber: string;
  item: {
    productName: string;
    sku: string;
    imageUrl?: string;
  };
  orderLineQuantity: number;
  orderLineStatuses: {
    orderLineStatus: string;
    statusQuantity: number;
    trackingInfo?: {
      eventDate: string;
      eventTime: string;
      eventDescription: string;
      eventCity: string;
      eventState: string;
      eventZipCode: string;
      eventCountry: string;
    };
  }[];
  charges: {
    chargeType: string;
    chargeName: string;
    chargeAmount: number;
    tax: {
      taxName: string;
      taxAmount: number;
    };
  }[];
  statusDate: string;
  orderLineFulfillment: {
    fulfillmentOption: string;
    shipMethod: string;
    storeId?: string;
    pickupDateTime?: string;
    pickupBy?: string;
  };
}

export interface WalmartInventory {
  sku: string;
  quantity: number;
  fulfillmentLagTime: number;
}

export interface WalmartPricing {
  sku: string;
  price: {
    amount: number;
    currency: string;
  };
}

export interface WalmartListing {
  sku: string;
  productName: string;
  shortDescription: string;
  price: {
    amount: number;
    currency: string;
  };
  inventory: {
    quantity: number;
    fulfillmentLagTime: number;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface WalmartApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface WalmartError {
  error: {
    code: string;
    field: string;
    description: string;
    info: string;
    severity: string;
    category: string;
  };
}

// Walmart API endpoints
export const WALMART_API_ENDPOINTS = {
  SANDBOX: {
    BASE_URL: 'https://marketplace.walmartapis.com/v3',
    AUTH_URL: 'https://marketplace.walmartapis.com/v3/token',
  },
  PRODUCTION: {
    BASE_URL: 'https://marketplace.walmartapis.com/v3',
    AUTH_URL: 'https://marketplace.walmartapis.com/v3/token',
  },
} as const;

// Walmart marketplace IDs
export const WALMART_MARKETPLACE_IDS = {
  US: 'US',
  CA: 'CA',
  MX: 'MX',
} as const;

// Walmart API rate limits
export const WALMART_RATE_LIMITS = {
  REQUESTS_PER_MINUTE: 20,
  REQUESTS_PER_HOUR: 1000,
  REQUESTS_PER_DAY: 10000,
} as const; 