# Marketplace Listing System Documentation

## Overview
This document outlines the comprehensive marketplace listing system for Eco8.co, including product catalog management, UPC matching, ASIN discovery, intelligent automation, and multi-marketplace integration.

## 🏗️ System Architecture

### Core Components
1. **Master Product Catalog** - Centralized product database
2. **Vendor Integration Layer** - Multi-vendor product ingestion
3. **Marketplace Discovery Engine** - UPC/ASIN matching and discovery
4. **Intelligent Automation System** - Scheduling and dependency management
5. **Pricing & Markup Engine** - Cost, MAP, MSRP enforcement
6. **Multi-Marketplace Connectors** - Amazon SP-API, Walmart, eBay integration

## 📦 Master Product Catalog

### Database Schema
```sql
-- Master product catalog
CREATE TABLE master_products (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  upc VARCHAR(50),
  manufacturer_part_number VARCHAR(100),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  brand VARCHAR(100),
  category VARCHAR(100),
  subcategory VARCHAR(100),
  cost DECIMAL(10,2),
  msrp DECIMAL(10,2),
  map_price DECIMAL(10,2),
  weight DECIMAL(8,2),
  dimensions JSONB,
  attributes JSONB,
  images JSONB,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vendor product mappings
CREATE TABLE vendor_product_mappings (
  id UUID PRIMARY KEY,
  master_product_id UUID REFERENCES master_products(id),
  vendor_id UUID REFERENCES vendors(id),
  vendor_sku VARCHAR(100),
  vendor_cost DECIMAL(10,2),
  vendor_price DECIMAL(10,2),
  vendor_quantity INTEGER,
  dropship_fee DECIMAL(10,2),
  shipping_cost DECIMAL(10,2),
  markup_percentage DECIMAL(5,2),
  listing_percentage DECIMAL(5,2) DEFAULT 100.0,
  brand_rules JSONB,
  category_rules JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Marketplace listings
CREATE TABLE marketplace_listings (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  marketplace_id UUID REFERENCES marketplaces(id),
  master_product_id UUID REFERENCES master_products(id),
  external_id VARCHAR(100), -- ASIN, eBay Item ID, etc.
  listing_sku VARCHAR(100),
  title VARCHAR(500),
  price DECIMAL(10,2),
  quantity INTEGER,
  status VARCHAR(20) DEFAULT 'active',
  discovery_method VARCHAR(50), -- 'upc_match', 'mpn_match', 'title_similarity', 'brand_verification'
  confidence_score DECIMAL(3,2),
  opportunity_score DECIMAL(3,2),
  last_synced TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Automation schedules
CREATE TABLE automation_schedules (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'vendor_sync', 'marketplace_discovery', 'pricing_update', 'inventory_sync'
  schedule_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom'
  schedule_config JSONB,
  dependencies JSONB, -- Array of schedule IDs this depends on
  enabled BOOLEAN DEFAULT true,
  last_run TIMESTAMP,
  next_run TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔍 Marketplace Discovery Engine

### Discovery Methods
1. **UPC Matching** - Exact UPC code matching
2. **Manufacturer Part Number Matching** - MPN-based matching
3. **Title Similarity** - Fuzzy string matching with configurable thresholds
4. **Brand Verification** - Brand name matching with variations

### Discovery Process
```typescript
interface DiscoveryRequest {
  masterProductId: string;
  marketplaceType: 'amazon' | 'walmart' | 'ebay';
  discoveryMethods: DiscoveryMethod[];
  confidenceThreshold: number; // 0.0 - 1.0
}

interface DiscoveryResult {
  masterProductId: string;
  marketplaceType: string;
  matches: MarketplaceMatch[];
  totalMatches: number;
  bestMatch?: MarketplaceMatch;
}

interface MarketplaceMatch {
  externalId: string; // ASIN, Item ID, etc.
  title: string;
  price: number;
  currency: string;
  brand: string;
  category: string;
  discoveryMethod: DiscoveryMethod;
  confidenceScore: number;
  opportunityScore: number;
  salesRank?: number;
  competitionLevel?: 'low' | 'medium' | 'high';
  restrictions?: string[];
}
```

### Example: 82 Products → 182+ ASINs
```typescript
// Discovery configuration for high-volume matching
const discoveryConfig = {
  methods: [
    { type: 'upc_match', weight: 0.4, threshold: 0.9 },
    { type: 'mpn_match', weight: 0.3, threshold: 0.8 },
    { type: 'title_similarity', weight: 0.2, threshold: 0.7 },
    { type: 'brand_verification', weight: 0.1, threshold: 0.6 }
  ],
  allowMultipleMatches: true,
  maxMatchesPerProduct: 5,
  enableCrossMarketplace: true
};
```

## 🎯 Opportunity Scoring System

### Multi-Factor Scoring Algorithm
```typescript
interface OpportunityScore {
  profitMargin: number; // 0.0 - 1.0
  marketDemand: number; // 0.0 - 1.0
  competition: number; // 0.0 - 1.0 (inverted)
  listingRestrictions: number; // 0.0 - 1.0
  salesRank: number; // 0.0 - 1.0
  overallScore: number; // Weighted average
}

const calculateOpportunityScore = (match: MarketplaceMatch): OpportunityScore => {
  const profitMargin = calculateProfitMargin(match.price, vendorCost);
  const marketDemand = calculateMarketDemand(match.salesRank, match.category);
  const competition = 1 - calculateCompetitionLevel(match.competitionLevel);
  const restrictions = calculateRestrictionScore(match.restrictions);
  const salesRank = calculateSalesRankScore(match.salesRank);
  
  const weights = {
    profitMargin: 0.35,
    marketDemand: 0.25,
    competition: 0.20,
    listingRestrictions: 0.10,
    salesRank: 0.10
  };
  
  const overallScore = 
    (profitMargin * weights.profitMargin) +
    (marketDemand * weights.marketDemand) +
    (competition * weights.competition) +
    (restrictions * weights.listingRestrictions) +
    (salesRank * weights.salesRank);
    
  return {
    profitMargin,
    marketDemand,
    competition,
    listingRestrictions,
    salesRank,
    overallScore
  };
};
```

## 💰 Pricing & Markup Engine

### Pricing Rules Engine
```typescript
interface PricingRule {
  id: string;
  tenantId: string;
  name: string;
  type: 'cost_plus' | 'msrp_based' | 'competitive' | 'custom';
  conditions: PricingCondition[];
  calculations: PricingCalculation[];
  priority: number;
  enabled: boolean;
}

interface PricingCondition {
  field: 'brand' | 'category' | 'vendor' | 'cost' | 'msrp';
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_range';
  value: any;
}

interface PricingCalculation {
  type: 'markup_percentage' | 'markup_fixed' | 'discount_percentage' | 'price_floor' | 'price_ceiling';
  value: number;
  applyTo: 'cost' | 'msrp' | 'competitor_price';
}
```

### Pricing Enforcement
```typescript
const calculateListingPrice = (vendorProduct: VendorProduct, marketplaceMatch: MarketplaceMatch): number => {
  let basePrice = vendorProduct.cost;
  
  // Apply markup rules
  const markupRules = getApplicableMarkupRules(vendorProduct);
  for (const rule of markupRules) {
    basePrice = applyMarkupRule(basePrice, rule);
  }
  
  // Add shipping and dropship fees
  basePrice += vendorProduct.shippingCost || 0;
  basePrice += vendorProduct.dropshipFee || 0;
  
  // Enforce price constraints
  basePrice = Math.max(basePrice, vendorProduct.cost); // Never below cost
  basePrice = Math.max(basePrice, vendorProduct.mapPrice || 0); // Never below MAP
  basePrice = Math.min(basePrice, vendorProduct.msrp || Infinity); // Never above MSRP
  
  return basePrice;
};
```

## 🤖 Intelligent Automation System

### Schedule Management
```typescript
interface AutomationSchedule {
  id: string;
  tenantId: string;
  name: string;
  type: AutomationType;
  schedule: CronExpression;
  dependencies: string[]; // Schedule IDs this depends on
  config: AutomationConfig;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

enum AutomationType {
  VENDOR_SYNC = 'vendor_sync',
  MARKETPLACE_DISCOVERY = 'marketplace_discovery',
  PRICING_UPDATE = 'pricing_update',
  INVENTORY_SYNC = 'inventory_sync',
  OPPORTUNITY_ANALYSIS = 'opportunity_analysis'
}
```

### Dependency Management
```typescript
// Example: Weekly opportunity analysis depends on vendor sync and marketplace discovery
const weeklyOpportunityAnalysis: AutomationSchedule = {
  name: 'Weekly Opportunity Analysis',
  type: AutomationType.OPPORTUNITY_ANALYSIS,
  schedule: '0 2 * * 1', // Every Monday at 2 AM
  dependencies: [
    'vendor-sync-daily',
    'marketplace-discovery-weekly'
  ],
  config: {
    marketplaceTypes: ['amazon', 'walmart', 'ebay'],
    minOpportunityScore: 0.7,
    maxProductsPerRun: 1000,
    enableAutoListing: false
  }
};
```

## 🏪 Multi-Marketplace Integration

### Amazon SP-API Integration
```typescript
interface AmazonSPAPIConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  marketplaceId: string;
  sellerId: string;
  region: string;
  environment: 'sandbox' | 'production';
  rateLimits: {
    requestsPerSecond: number;
    requestsPerMinute: number;
  };
}

// ASIN Discovery via Amazon Catalog API
const discoverAmazonASINs = async (products: MasterProduct[]): Promise<DiscoveryResult[]> => {
  const results: DiscoveryResult[] = [];
  
  for (const product of products) {
    const matches: MarketplaceMatch[] = [];
    
    // Try UPC matching first
    if (product.upc) {
      const upcMatches = await searchAmazonByUPC(product.upc);
      matches.push(...upcMatches.map(match => ({
        ...match,
        discoveryMethod: 'upc_match',
        confidenceScore: 0.95
      })));
    }
    
    // Try MPN matching
    if (product.manufacturerPartNumber) {
      const mpnMatches = await searchAmazonByMPN(product.manufacturerPartNumber);
      matches.push(...mpnMatches.map(match => ({
        ...match,
        discoveryMethod: 'mpn_match',
        confidenceScore: 0.85
      })));
    }
    
    // Try title similarity
    const titleMatches = await searchAmazonByTitle(product.title, product.brand);
    matches.push(...titleMatches.map(match => ({
      ...match,
      discoveryMethod: 'title_similarity',
      confidenceScore: calculateTitleSimilarity(product.title, match.title)
    })));
    
    results.push({
      masterProductId: product.id,
      marketplaceType: 'amazon',
      matches: matches.filter(m => m.confidenceScore >= 0.6),
      totalMatches: matches.length
    });
  }
  
  return results;
};
```

### Walmart & eBay Integration
```typescript
// Similar discovery patterns for Walmart and eBay
const discoverWalmartItems = async (products: MasterProduct[]): Promise<DiscoveryResult[]> => {
  // Walmart Marketplace API integration
  // Similar UPC, MPN, title matching logic
};

const discoverEbayItems = async (products: MasterProduct[]): Promise<DiscoveryResult[]> => {
  // eBay Trading API integration
  // Similar UPC, MPN, title matching logic
};
```

## 🎛️ UI Configuration Interface

### Vendor Management Interface
```typescript
interface VendorConfigUI {
  // Basic vendor info
  name: string;
  type: string;
  credentials: VendorCredentials;
  
  // Product listing configuration
  listingPercentage: number; // 0-100%
  tieredMarkup: MarkupTier[];
  shippingCosts: ShippingConfig;
  dropshipFees: DropshipConfig;
  
  // Pricing constraints
  priceConstraints: {
    neverExceedMSRP: boolean;
    neverBelowCost: boolean;
    neverBelowMAP: boolean;
  };
  
  // Brand and category rules
  brandRules: BrandRule[];
  categoryRules: CategoryRule[];
}

interface MarkupTier {
  minCost: number;
  maxCost: number;
  markupPercentage: number;
  markupFixed: number;
}

interface BrandRule {
  brand: string;
  markupPercentage: number;
  markupFixed: number;
  listingPercentage: number;
  enabled: boolean;
}
```

### Automation Schedule UI
```typescript
interface AutomationScheduleUI {
  name: string;
  type: AutomationType;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  schedule: string; // Cron expression
  dependencies: string[]; // Schedule names
  config: AutomationConfigUI;
  enabled: boolean;
}

interface AutomationConfigUI {
  marketplaceTypes: string[];
  minOpportunityScore: number;
  maxProductsPerRun: number;
  enableAutoListing: boolean;
  notificationSettings: NotificationConfig;
}
```

## 📊 Analytics & Reporting

### Discovery Analytics
```typescript
interface DiscoveryAnalytics {
  totalProducts: number;
  totalMatches: number;
  averageMatchesPerProduct: number;
  discoveryMethodBreakdown: {
    upcMatch: number;
    mpnMatch: number;
    titleSimilarity: number;
    brandVerification: number;
  };
  opportunityScoreDistribution: {
    high: number; // 0.8-1.0
    medium: number; // 0.6-0.8
    low: number; // 0.0-0.6
  };
  marketplaceBreakdown: {
    amazon: number;
    walmart: number;
    ebay: number;
  };
}
```

### Performance Metrics
```typescript
interface ListingPerformance {
  totalListings: number;
  activeListings: number;
  revenue: number;
  profitMargin: number;
  conversionRate: number;
  averageOrderValue: number;
  topPerformingProducts: ProductPerformance[];
  marketplacePerformance: MarketplacePerformance[];
}
```

## 🔧 Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Master product catalog database schema
- [ ] Vendor product mapping system
- [ ] Basic UPC/MPN matching
- [ ] Simple pricing rules engine

### Phase 2: Discovery Engine (Week 3-4)
- [ ] Amazon SP-API ASIN discovery
- [ ] Walmart item discovery
- [ ] eBay item discovery
- [ ] Multi-factor opportunity scoring

### Phase 3: Automation (Week 5-6)
- [ ] Schedule management system
- [ ] Dependency management
- [ ] Automated discovery runs
- [ ] Opportunity analysis automation

### Phase 4: Advanced Features (Week 7-8)
- [ ] Advanced pricing rules
- [ ] Brand/category rules
- [ ] Performance analytics
- [ ] UI configuration interfaces

### Phase 5: Integration & Testing (Week 9-10)
- [ ] Full system integration
- [ ] Performance testing
- [ ] User acceptance testing
- [ ] Production deployment

## 🚀 Getting Started with Eco8.co

### 1. Tenant Setup
```typescript
// Create Eco8.co tenant
const eco8Tenant = await createTenant({
  name: 'Eco8.co',
  domain: 'eco8.co',
  settings: {
    defaultCurrency: 'USD',
    timezone: 'America/New_York',
    automationEnabled: true
  }
});
```

### 2. Vendor Configuration
```typescript
// Configure CWR as primary vendor
const cwrVendor = await createVendor({
  tenantId: eco8Tenant.id,
  name: 'CWR',
  type: 'sftp',
  credentials: {
    host: 'sftp.cwr.com',
    username: 'eco8',
    privateKey: 'path/to/private/key'
  },
  config: {
    listingPercentage: 100,
    tieredMarkup: [
      { minCost: 0, maxCost: 50, markupPercentage: 25 },
      { minCost: 50, maxCost: 200, markupPercentage: 20 },
      { minCost: 200, maxCost: 1000, markupPercentage: 15 },
      { minCost: 1000, maxCost: Infinity, markupPercentage: 10 }
    ],
    priceConstraints: {
      neverExceedMSRP: true,
      neverBelowCost: true,
      neverBelowMAP: true
    }
  }
});
```

### 3. Marketplace Integration
```typescript
// Configure Amazon SP-API
const amazonMarketplace = await createMarketplace({
  tenantId: eco8Tenant.id,
  name: 'Amazon US',
  type: 'amazon-sp-api',
  credentials: {
    clientId: 'amzn1.application-oa2-client.xxx',
    clientSecret: 'amzn1.oa2-cs.v1.xxx',
    refreshToken: 'Atzr|xxx',
    marketplaceId: 'ATVPDKIKX0DER',
    sellerId: 'A10D4VTYI7RMZ2'
  }
});
```

### 4. Automation Setup
```typescript
// Set up weekly opportunity analysis
await createAutomationSchedule({
  tenantId: eco8Tenant.id,
  name: 'Weekly Opportunity Analysis',
  type: 'opportunity_analysis',
  schedule: '0 2 * * 1', // Every Monday at 2 AM
  dependencies: ['vendor-sync-daily', 'marketplace-discovery-weekly'],
  config: {
    marketplaceTypes: ['amazon', 'walmart', 'ebay'],
    minOpportunityScore: 0.7,
    maxProductsPerRun: 1000,
    enableAutoListing: false
  }
});
```

---

**Last Updated**: 2025-07-18  
**Version**: 1.0  
**Status**: Planning Phase 