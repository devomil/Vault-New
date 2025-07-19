# Eco8.co Implementation Plan
## Comprehensive Marketplace Listing System

### 🎯 **Project Overview**
**Company**: Eco8.co  
**Objective**: Build a comprehensive marketplace listing system that can handle 100,000-1,000,000 products from multiple vendors with intelligent automation, UPC/ASIN discovery, and multi-marketplace integration.

---

## 📋 **Current System Assessment**

### ✅ **What We Have**
- **Amazon SP-API Integration**: OAuth 2.0 authentication working
- **Vendor Integration Framework**: Universal connector system
- **Multi-tenant Architecture**: Database with RLS policies
- **Frontend UI**: React dashboard with marketplace management
- **Basic Listing Management**: Create, update, delete listings

### 🔧 **What We Need to Build**
1. **Master Product Catalog** - Centralized product database
2. **Vendor Product Mapping** - Multi-vendor product relationships
3. **Marketplace Discovery Engine** - UPC/ASIN matching system
4. **Intelligent Automation** - Scheduling with dependency management
5. **Advanced Pricing Engine** - Cost, MAP, MSRP enforcement
6. **Opportunity Scoring** - Multi-factor analysis system

---

## 🏗️ **Phase 1: Foundation (Weeks 1-2)**

### 1.1 Master Product Catalog Database
```sql
-- Extend existing database schema
ALTER TABLE products ADD COLUMN upc VARCHAR(50);
ALTER TABLE products ADD COLUMN manufacturer_part_number VARCHAR(100);
ALTER TABLE products ADD COLUMN msrp DECIMAL(10,2);
ALTER TABLE products ADD COLUMN map_price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN weight DECIMAL(8,2);
ALTER TABLE products ADD COLUMN dimensions JSONB;

-- New vendor product mappings table
CREATE TABLE vendor_product_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  product_id UUID REFERENCES products(id),
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

-- New automation schedules table
CREATE TABLE automation_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  schedule_type VARCHAR(20) NOT NULL,
  schedule_config JSONB,
  dependencies JSONB,
  enabled BOOLEAN DEFAULT true,
  last_run TIMESTAMP,
  next_run TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 1.2 Vendor Configuration System
```typescript
// Enhanced vendor configuration interface
interface VendorConfig {
  // Basic vendor info
  name: string;
  type: 'api' | 'sftp' | 'edi' | 'webhook';
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

### 1.3 Basic UPC/MPN Matching
```typescript
// Simple matching engine
class ProductMatchingEngine {
  async matchByUPC(upc: string, marketplaceType: string): Promise<MarketplaceMatch[]> {
    // Implement UPC-based matching
  }
  
  async matchByMPN(mpn: string, marketplaceType: string): Promise<MarketplaceMatch[]> {
    // Implement MPN-based matching
  }
  
  async matchByTitle(title: string, brand: string, marketplaceType: string): Promise<MarketplaceMatch[]> {
    // Implement title similarity matching
  }
}
```

---

## 🔍 **Phase 2: Discovery Engine (Weeks 3-4)**

### 2.1 Amazon SP-API ASIN Discovery
```typescript
// Extend existing Amazon SP-API connector
class AmazonSPAPIConnector extends MarketplaceConnector {
  // Add discovery methods
  async discoverASINs(products: MasterProduct[]): Promise<DiscoveryResult[]> {
    const results: DiscoveryResult[] = [];
    
    for (const product of products) {
      const matches: MarketplaceMatch[] = [];
      
      // UPC matching
      if (product.upc) {
        const upcMatches = await this.searchByUPC(product.upc);
        matches.push(...upcMatches.map(match => ({
          ...match,
          discoveryMethod: 'upc_match',
          confidenceScore: 0.95
        })));
      }
      
      // MPN matching
      if (product.manufacturerPartNumber) {
        const mpnMatches = await this.searchByMPN(product.manufacturerPartNumber);
        matches.push(...mpnMatches.map(match => ({
          ...match,
          discoveryMethod: 'mpn_match',
          confidenceScore: 0.85
        })));
      }
      
      // Title similarity
      const titleMatches = await this.searchByTitle(product.title, product.brand);
      matches.push(...titleMatches.map(match => ({
        ...match,
        discoveryMethod: 'title_similarity',
        confidenceScore: this.calculateTitleSimilarity(product.title, match.title)
      })));
      
      results.push({
        masterProductId: product.id,
        marketplaceType: 'amazon',
        matches: matches.filter(m => m.confidenceScore >= 0.6),
        totalMatches: matches.length
      });
    }
    
    return results;
  }
  
  private async searchByUPC(upc: string): Promise<AmazonProduct[]> {
    // Use Amazon Catalog API to search by UPC
    const response = await this.httpClient.get('/catalog/v0/items', {
      params: {
        identifiers: [upc],
        identifierType: 'UPC',
        marketplaceIds: [this.marketplaceId]
      }
    });
    
    return response.data.items || [];
  }
  
  private async searchByMPN(mpn: string): Promise<AmazonProduct[]> {
    // Use Amazon Catalog API to search by MPN
    const response = await this.httpClient.get('/catalog/v0/items', {
      params: {
        identifiers: [mpn],
        identifierType: 'MPN',
        marketplaceIds: [this.marketplaceId]
      }
    });
    
    return response.data.items || [];
  }
  
  private async searchByTitle(title: string, brand?: string): Promise<AmazonProduct[]> {
    // Use Amazon Catalog API to search by title
    const searchQuery = brand ? `${brand} ${title}` : title;
    const response = await this.httpClient.get('/catalog/v0/items', {
      params: {
        keywords: searchQuery,
        marketplaceIds: [this.marketplaceId]
      }
    });
    
    return response.data.items || [];
  }
}
```

### 2.2 Walmart & eBay Discovery
```typescript
// Similar discovery patterns for other marketplaces
class WalmartConnector extends MarketplaceConnector {
  async discoverItems(products: MasterProduct[]): Promise<DiscoveryResult[]> {
    // Implement Walmart item discovery
  }
}

class EbayConnector extends MarketplaceConnector {
  async discoverItems(products: MasterProduct[]): Promise<DiscoveryResult[]> {
    // Implement eBay item discovery
  }
}
```

### 2.3 Multi-Factor Opportunity Scoring
```typescript
class OpportunityScoringEngine {
  calculateOpportunityScore(match: MarketplaceMatch, vendorProduct: VendorProduct): OpportunityScore {
    const profitMargin = this.calculateProfitMargin(match.price, vendorProduct.cost);
    const marketDemand = this.calculateMarketDemand(match.salesRank, match.category);
    const competition = 1 - this.calculateCompetitionLevel(match.competitionLevel);
    const restrictions = this.calculateRestrictionScore(match.restrictions);
    const salesRank = this.calculateSalesRankScore(match.salesRank);
    
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
  }
  
  private calculateProfitMargin(listingPrice: number, cost: number): number {
    if (cost <= 0) return 0;
    const margin = (listingPrice - cost) / listingPrice;
    return Math.max(0, Math.min(1, margin));
  }
  
  private calculateMarketDemand(salesRank?: number, category?: string): number {
    if (!salesRank) return 0.5; // Default medium demand
    
    // Convert sales rank to demand score (lower rank = higher demand)
    const maxRank = 1000000;
    const demandScore = Math.max(0, (maxRank - salesRank) / maxRank);
    return Math.min(1, demandScore);
  }
  
  private calculateCompetitionLevel(level?: 'low' | 'medium' | 'high'): number {
    switch (level) {
      case 'low': return 0.2;
      case 'medium': return 0.5;
      case 'high': return 0.8;
      default: return 0.5;
    }
  }
  
  private calculateRestrictionScore(restrictions?: string[]): number {
    if (!restrictions || restrictions.length === 0) return 1.0;
    
    // Penalize based on number and severity of restrictions
    const restrictionPenalty = restrictions.length * 0.1;
    return Math.max(0, 1 - restrictionPenalty);
  }
  
  private calculateSalesRankScore(salesRank?: number): number {
    if (!salesRank) return 0.5;
    
    // Better score for lower (better) sales rank
    const maxRank = 1000000;
    const score = Math.max(0, (maxRank - salesRank) / maxRank);
    return Math.min(1, score);
  }
}
```

---

## 🤖 **Phase 3: Intelligent Automation (Weeks 5-6)**

### 3.1 Schedule Management System
```typescript
class AutomationScheduleManager {
  async createSchedule(schedule: AutomationSchedule): Promise<void> {
    // Validate dependencies
    await this.validateDependencies(schedule.dependencies);
    
    // Calculate next run time
    const nextRun = this.calculateNextRun(schedule.schedule);
    
    // Save to database
    await this.prisma.automationSchedule.create({
      data: {
        ...schedule,
        nextRun
      }
    });
  }
  
  async runSchedule(scheduleId: string): Promise<void> {
    const schedule = await this.prisma.automationSchedule.findUnique({
      where: { id: scheduleId }
    });
    
    if (!schedule || !schedule.enabled) return;
    
    // Check dependencies
    const dependenciesMet = await this.checkDependencies(schedule.dependencies);
    if (!dependenciesMet) {
      this.logger.warn(`Dependencies not met for schedule: ${schedule.name}`);
      return;
    }
    
    // Execute schedule
    await this.executeSchedule(schedule);
    
    // Update last run and next run
    await this.prisma.automationSchedule.update({
      where: { id: scheduleId },
      data: {
        lastRun: new Date(),
        nextRun: this.calculateNextRun(schedule.schedule)
      }
    });
  }
  
  private async executeSchedule(schedule: AutomationSchedule): Promise<void> {
    switch (schedule.type) {
      case 'vendor_sync':
        await this.runVendorSync(schedule);
        break;
      case 'marketplace_discovery':
        await this.runMarketplaceDiscovery(schedule);
        break;
      case 'opportunity_analysis':
        await this.runOpportunityAnalysis(schedule);
        break;
      default:
        throw new Error(`Unknown schedule type: ${schedule.type}`);
    }
  }
}
```

### 3.2 Dependency Management
```typescript
class DependencyManager {
  async validateDependencies(dependencies: string[]): Promise<boolean> {
    for (const depId of dependencies) {
      const dep = await this.prisma.automationSchedule.findUnique({
        where: { id: depId }
      });
      
      if (!dep) {
        throw new Error(`Dependency not found: ${depId}`);
      }
    }
    
    return true;
  }
  
  async checkDependencies(dependencies: string[]): Promise<boolean> {
    for (const depId of dependencies) {
      const dep = await this.prisma.automationSchedule.findUnique({
        where: { id: depId }
      });
      
      if (!dep || !dep.lastRun) {
        return false;
      }
      
      // Check if dependency has run recently enough
      const hoursSinceLastRun = (Date.now() - dep.lastRun.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastRun > 24) {
        return false;
      }
    }
    
    return true;
  }
}
```

### 3.3 Weekly Opportunity Analysis
```typescript
class OpportunityAnalysisEngine {
  async runWeeklyAnalysis(tenantId: string): Promise<void> {
    this.logger.info(`Starting weekly opportunity analysis for tenant: ${tenantId}`);
    
    // Get all active products
    const products = await this.prisma.product.findMany({
      where: { 
        tenantId,
        status: 'active'
      },
      include: {
        vendorProductMappings: {
          include: {
            vendor: true
          }
        }
      }
    });
    
    // Get marketplace configurations
    const marketplaces = await this.prisma.marketplace.findMany({
      where: { tenantId }
    });
    
    const results: DiscoveryResult[] = [];
    
    // Run discovery for each marketplace
    for (const marketplace of marketplaces) {
      const connector = this.createConnector(marketplace);
      const discoveryResults = await connector.discoverASINs(products);
      results.push(...discoveryResults);
    }
    
    // Calculate opportunity scores
    const scoredResults = await this.calculateOpportunityScores(results);
    
    // Filter high-opportunity matches
    const highOpportunityMatches = scoredResults.filter(
      result => result.bestMatch && result.bestMatch.opportunityScore >= 0.7
    );
    
    // Generate report
    await this.generateOpportunityReport(tenantId, highOpportunityMatches);
    
    this.logger.info(`Weekly opportunity analysis completed. Found ${highOpportunityMatches.length} high-opportunity matches.`);
  }
  
  private async calculateOpportunityScores(results: DiscoveryResult[]): Promise<DiscoveryResult[]> {
    const scoringEngine = new OpportunityScoringEngine();
    
    for (const result of results) {
      for (const match of result.matches) {
        const vendorProduct = await this.getVendorProduct(result.masterProductId);
        if (vendorProduct) {
          match.opportunityScore = scoringEngine.calculateOpportunityScore(match, vendorProduct).overallScore;
        }
      }
      
      // Sort matches by opportunity score
      result.matches.sort((a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0));
      result.bestMatch = result.matches[0];
    }
    
    return results;
  }
}
```

---

## 💰 **Phase 4: Advanced Pricing Engine, Vendor Overlap Management & Purchasing AI (Weeks 7-8)**

### 4.1 Vendor Overlap Management

### 4.2 Purchasing AI System
```typescript
// Purchasing AI Decision Engine
class PurchasingAIDecisionEngine {
  async analyzeProductForPurchase(
    masterProductId: string,
    tenantId: string
  ): Promise<PurchaseRecommendation> {
    // Gather marketplace data
    const marketplaceData = await this.getMarketplaceAnalysis(masterProductId);
    const vendorData = await this.getVendorData(masterProductId);
    const historicalData = await this.getHistoricalPerformance(masterProductId);
    
    // Calculate decision factors
    const marketDemandScore = this.calculateMarketDemand(marketplaceData);
    const profitabilityScore = this.calculateProfitability(vendorData, marketplaceData);
    const riskScore = this.calculateRiskScore(marketplaceData, historicalData);
    
    // Generate recommendation
    return this.generateRecommendation({
      marketDemandScore,
      profitabilityScore,
      riskScore,
      aiConfig: await this.getAIConfig(tenantId)
    });
  }
  
  private calculateMarketDemand(marketplaceData: MarketplaceAnalysis[]): number {
    // Analyze seller rank, sales velocity, competition
    return marketplaceData.reduce((score, data) => {
      const rankScore = this.normalizeSellerRank(data.sellerRank);
      const velocityScore = this.normalizeSalesVelocity(data.salesVelocity);
      const competitionScore = this.getCompetitionScore(data.competitionLevel);
      return score + (rankScore + velocityScore + competitionScore) / 3;
    }, 0) / marketplaceData.length;
  }
  
  private calculateProfitability(
    vendorData: VendorProductMapping[],
    marketplaceData: MarketplaceAnalysis[]
  ): ProfitabilityAnalysis {
    const warehouseScenario = this.calculateWarehouseProfitability(vendorData, marketplaceData);
    const dropshipScenario = this.calculateDropshipProfitability(vendorData, marketplaceData);
    
    return {
      warehouse: warehouseScenario,
      dropship: dropshipScenario,
      difference: warehouseScenario.totalProfit - dropshipScenario.totalProfit,
      recommendation: warehouseScenario.totalProfit > dropshipScenario.totalProfit ? 'warehouse' : 'dropship'
    };
  }
}

// Integration with Marketplace Discovery
class MarketplaceDiscoveryEngine {
  async discoverAndAnalyze(products: MasterProduct[]): Promise<DiscoveryResult[]> {
    const discoveryResults = await this.discoverProducts(products);
    
    // Add purchasing AI recommendations
    for (const result of discoveryResults) {
      const aiRecommendation = await this.purchasingAI.analyzeProductForPurchase(
        result.masterProductId,
        result.tenantId
      );
      
      result.purchasingRecommendation = aiRecommendation;
    }
    
    return discoveryResults;
  }
}
```

### 4.3 Automated Listing & Inventory Management System
```typescript
// Real-time vendor sync engine (3x daily)
class VendorSyncEngine {
  private readonly SYNC_INTERVAL = 8 * 60 * 60 * 1000; // 8 hours (3x daily)

  async performVendorSync(): Promise<void> {
    const vendors = await this.getActiveVendors();
    
    for (const vendor of vendors) {
      // Get latest vendor data
      const vendorData = await this.getVendorInventory(vendor);
      
      // Process inventory updates
      const inventoryUpdates = await this.processInventoryUpdates(vendorData);
      
      // Process pricing updates
      const pricingUpdates = await this.processPricingUpdates(vendorData);
      
      // Trigger marketplace updates
      await this.triggerMarketplaceUpdates(inventoryUpdates, pricingUpdates);
    }
  }
}

// Weekly new product discovery
class AutomatedListingEngine {
  async runWeeklyDiscovery(): Promise<void> {
    const vendors = await this.getActiveVendors();
    
    for (const vendor of vendors) {
      // Get vendor's latest catalog
      const vendorCatalog = await this.getVendorCatalog(vendor);
      
      // Find new products
      const newProducts = await this.findNewProducts(vendor, vendorCatalog);
      
      // Process new products
      for (const product of newProducts) {
        if (await this.meetsListingCriteria(product)) {
          const marketplaceMatches = await this.discoverMarketplaceMatches(product);
          await this.createListings(product, marketplaceMatches);
        }
      }
    }
  }
}

// Price protection engine
class PriceProtectionEngine {
  async runPriceProtection(): Promise<void> {
    const listings = await this.getActiveListings();
    
    for (const listing of listings) {
      const marketplaceData = await this.getMarketplaceListingData(listing.marketplaceListingId);
      const rules = await this.getPriceProtectionRules(listing.marketplaceId);
      
      // Check for price violations
      const violations = this.checkPriceViolations(listing, marketplaceData, rules);
      
      if (violations.length > 0) {
        const newPrice = this.calculateProtectedPrice(listing, marketplaceData, rules);
        await this.updateListingPrice(listing.id, newPrice);
        await this.createPriceProtectionAlert(listing, violations, newPrice);
      }
    }
  }
}
```

### 4.4 Pricing Rules Engine

### 4.2 Pricing Rules Engine
```typescript
class PricingRulesEngine {
  async calculateListingPrice(
    vendorProduct: VendorProduct, 
    marketplaceMatch: MarketplaceMatch,
    vendorConfig: VendorConfig
  ): Promise<number> {
    let basePrice = vendorProduct.cost;
    
    // Apply tiered markup
    const applicableTier = this.findApplicableMarkupTier(basePrice, vendorConfig.tieredMarkup);
    if (applicableTier) {
      basePrice += (basePrice * applicableTier.markupPercentage / 100);
      basePrice += applicableTier.markupFixed;
    }
    
    // Apply brand rules
    const brandRule = this.findBrandRule(vendorProduct.brand, vendorConfig.brandRules);
    if (brandRule && brandRule.enabled) {
      basePrice += (basePrice * brandRule.markupPercentage / 100);
      basePrice += brandRule.markupFixed;
    }
    
    // Apply category rules
    const categoryRule = this.findCategoryRule(vendorProduct.category, vendorConfig.categoryRules);
    if (categoryRule && categoryRule.enabled) {
      basePrice += (basePrice * categoryRule.markupPercentage / 100);
      basePrice += categoryRule.markupFixed;
    }
    
    // Add shipping and dropship fees
    basePrice += vendorProduct.shippingCost || 0;
    basePrice += vendorProduct.dropshipFee || 0;
    
    // Enforce price constraints
    basePrice = this.enforcePriceConstraints(basePrice, vendorProduct, vendorConfig.priceConstraints);
    
    return basePrice;
  }
  
  private enforcePriceConstraints(
    price: number, 
    vendorProduct: VendorProduct, 
    constraints: PriceConstraints
  ): number {
    let finalPrice = price;
    
    // Never below cost
    if (constraints.neverBelowCost) {
      finalPrice = Math.max(finalPrice, vendorProduct.cost);
    }
    
    // Never below MAP
    if (constraints.neverBelowMAP && vendorProduct.mapPrice) {
      finalPrice = Math.max(finalPrice, vendorProduct.mapPrice);
    }
    
    // Never above MSRP
    if (constraints.neverExceedMSRP && vendorProduct.msrp) {
      finalPrice = Math.min(finalPrice, vendorProduct.msrp);
    }
    
    return finalPrice;
  }
}
```

### 4.2 Vendor Configuration UI
```typescript
// React component for vendor configuration
const VendorConfigurationPage: React.FC = () => {
  const [vendorConfig, setVendorConfig] = useState<VendorConfig>({
    name: '',
    type: 'api',
    credentials: {},
    listingPercentage: 100,
    tieredMarkup: [
      { minCost: 0, maxCost: 50, markupPercentage: 25, markupFixed: 0 },
      { minCost: 50, maxCost: 200, markupPercentage: 20, markupFixed: 0 },
      { minCost: 200, maxCost: 1000, markupPercentage: 15, markupFixed: 0 },
      { minCost: 1000, maxCost: Infinity, markupPercentage: 10, markupFixed: 0 }
    ],
    priceConstraints: {
      neverExceedMSRP: true,
      neverBelowCost: true,
      neverBelowMAP: true
    },
    brandRules: [],
    categoryRules: []
  });
  
  return (
    <div className="vendor-configuration">
      <h1>Vendor Configuration</h1>
      
      {/* Basic vendor info */}
      <section>
        <h2>Basic Information</h2>
        <input 
          value={vendorConfig.name}
          onChange={(e) => setVendorConfig({...vendorConfig, name: e.target.value})}
          placeholder="Vendor Name"
        />
        <select 
          value={vendorConfig.type}
          onChange={(e) => setVendorConfig({...vendorConfig, type: e.target.value as any})}
        >
          <option value="api">API</option>
          <option value="sftp">SFTP</option>
          <option value="edi">EDI</option>
          <option value="webhook">Webhook</option>
        </select>
      </section>
      
      {/* Listing configuration */}
      <section>
        <h2>Listing Configuration</h2>
        <label>
          Listing Percentage:
          <input 
            type="number"
            min="0"
            max="100"
            value={vendorConfig.listingPercentage}
            onChange={(e) => setVendorConfig({...vendorConfig, listingPercentage: Number(e.target.value)})}
          />
          %
        </label>
      </section>
      
      {/* Tiered markup */}
      <section>
        <h2>Tiered Markup</h2>
        {vendorConfig.tieredMarkup.map((tier, index) => (
          <div key={index} className="markup-tier">
            <input 
              type="number"
              placeholder="Min Cost"
              value={tier.minCost}
              onChange={(e) => updateMarkupTier(index, 'minCost', Number(e.target.value))}
            />
            <input 
              type="number"
              placeholder="Max Cost"
              value={tier.maxCost === Infinity ? '' : tier.maxCost}
              onChange={(e) => updateMarkupTier(index, 'maxCost', Number(e.target.value))}
            />
            <input 
              type="number"
              placeholder="Markup %"
              value={tier.markupPercentage}
              onChange={(e) => updateMarkupTier(index, 'markupPercentage', Number(e.target.value))}
            />
            <input 
              type="number"
              placeholder="Fixed Markup"
              value={tier.markupFixed}
              onChange={(e) => updateMarkupTier(index, 'markupFixed', Number(e.target.value))}
            />
          </div>
        ))}
        <button onClick={addMarkupTier}>Add Tier</button>
      </section>
      
      {/* Price constraints */}
      <section>
        <h2>Price Constraints</h2>
        <label>
          <input 
            type="checkbox"
            checked={vendorConfig.priceConstraints.neverExceedMSRP}
            onChange={(e) => setVendorConfig({
              ...vendorConfig, 
              priceConstraints: {
                ...vendorConfig.priceConstraints,
                neverExceedMSRP: e.target.checked
              }
            })}
          />
          Never exceed MSRP
        </label>
        <label>
          <input 
            type="checkbox"
            checked={vendorConfig.priceConstraints.neverBelowCost}
            onChange={(e) => setVendorConfig({
              ...vendorConfig, 
              priceConstraints: {
                ...vendorConfig.priceConstraints,
                neverBelowCost: e.target.checked
              }
            })}
          />
          Never below cost
        </label>
        <label>
          <input 
            type="checkbox"
            checked={vendorConfig.priceConstraints.neverBelowMAP}
            onChange={(e) => setVendorConfig({
              ...vendorConfig, 
              priceConstraints: {
                ...vendorConfig.priceConstraints,
                neverBelowMAP: e.target.checked
              }
            })}
          />
          Never below MAP
        </label>
      </section>
      
      <button onClick={saveVendorConfig}>Save Configuration</button>
    </div>
  );
};
```

---

## 📊 **Phase 5: Analytics & Reporting (Weeks 9-10)**

### 5.1 Discovery Analytics Dashboard
```typescript
class DiscoveryAnalyticsService {
  async generateDiscoveryReport(tenantId: string, dateRange: DateRange): Promise<DiscoveryAnalytics> {
    const discoveries = await this.prisma.marketplaceListing.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      },
      include: {
        product: true,
        marketplace: true
      }
    });
    
    const totalProducts = new Set(discoveries.map(d => d.masterProductId)).size;
    const totalMatches = discoveries.length;
    const averageMatchesPerProduct = totalProducts > 0 ? totalMatches / totalProducts : 0;
    
    const discoveryMethodBreakdown = this.calculateDiscoveryMethodBreakdown(discoveries);
    const opportunityScoreDistribution = this.calculateOpportunityScoreDistribution(discoveries);
    const marketplaceBreakdown = this.calculateMarketplaceBreakdown(discoveries);
    
    return {
      totalProducts,
      totalMatches,
      averageMatchesPerProduct,
      discoveryMethodBreakdown,
      opportunityScoreDistribution,
      marketplaceBreakdown
    };
  }
  
  private calculateDiscoveryMethodBreakdown(discoveries: MarketplaceListing[]): any {
    const breakdown = {
      upcMatch: 0,
      mpnMatch: 0,
      titleSimilarity: 0,
      brandVerification: 0
    };
    
    for (const discovery of discoveries) {
      const method = discovery.discoveryMethod;
      if (method in breakdown) {
        breakdown[method as keyof typeof breakdown]++;
      }
    }
    
    return breakdown;
  }
  
  private calculateOpportunityScoreDistribution(discoveries: MarketplaceListing[]): any {
    const distribution = {
      high: 0, // 0.8-1.0
      medium: 0, // 0.6-0.8
      low: 0 // 0.0-0.6
    };
    
    for (const discovery of discoveries) {
      const score = discovery.opportunityScore || 0;
      if (score >= 0.8) distribution.high++;
      else if (score >= 0.6) distribution.medium++;
      else distribution.low++;
    }
    
    return distribution;
  }
  
  private calculateMarketplaceBreakdown(discoveries: MarketplaceListing[]): any {
    const breakdown = {
      amazon: 0,
      walmart: 0,
      ebay: 0
    };
    
    for (const discovery of discoveries) {
      const marketplaceType = discovery.marketplace.type;
      if (marketplaceType in breakdown) {
        breakdown[marketplaceType as keyof typeof breakdown]++;
      }
    }
    
    return breakdown;
  }
}
```

### 5.2 Performance Metrics Dashboard
```typescript
class PerformanceAnalyticsService {
  async generatePerformanceReport(tenantId: string, dateRange: DateRange): Promise<ListingPerformance> {
    const listings = await this.prisma.marketplaceListing.findMany({
      where: {
        tenantId,
        status: 'active',
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      },
      include: {
        marketplace: true,
        product: true
      }
    });
    
    const totalListings = listings.length;
    const activeListings = listings.filter(l => l.status === 'active').length;
    
    // Calculate revenue and profit (mock data for now)
    const revenue = this.calculateRevenue(listings);
    const profitMargin = this.calculateProfitMargin(listings);
    const conversionRate = this.calculateConversionRate(listings);
    const averageOrderValue = this.calculateAverageOrderValue(listings);
    
    const topPerformingProducts = this.getTopPerformingProducts(listings);
    const marketplacePerformance = this.getMarketplacePerformance(listings);
    
    return {
      totalListings,
      activeListings,
      revenue,
      profitMargin,
      conversionRate,
      averageOrderValue,
      topPerformingProducts,
      marketplacePerformance
    };
  }
}
```

---

## 🚀 **Getting Started with Eco8.co**

### Step 1: Create Eco8.co Tenant
```typescript
// Create tenant
const eco8Tenant = await createTenant({
  name: 'Eco8.co',
  domain: 'eco8.co',
  settings: {
    defaultCurrency: 'USD',
    timezone: 'America/New_York',
    automationEnabled: true,
    maxProducts: 1000000,
    enableAdvancedPricing: true,
    enableOpportunityScoring: true
  }
});
```

### Step 2: Configure CWR Vendor
```typescript
// Configure CWR as primary vendor
const cwrVendor = await createVendor({
  tenantId: eco8Tenant.id,
  name: 'CWR',
  type: 'sftp',
  credentials: {
    host: 'sftp.cwr.com',
    username: 'eco8',
    privateKey: 'path/to/private/key',
    filePaths: {
      catalog: '/catalog/products.csv',
      inventory: '/inventory/stock.csv',
      pricing: '/pricing/prices.csv'
    }
  },
  config: {
    listingPercentage: 100,
    tieredMarkup: [
      { minCost: 0, maxCost: 50, markupPercentage: 25, markupFixed: 0 },
      { minCost: 50, maxCost: 200, markupPercentage: 20, markupFixed: 0 },
      { minCost: 200, maxCost: 1000, markupPercentage: 15, markupFixed: 0 },
      { minCost: 1000, maxCost: Infinity, markupPercentage: 10, markupFixed: 0 }
    ],
    priceConstraints: {
      neverExceedMSRP: true,
      neverBelowCost: true,
      neverBelowMAP: true
    },
    brandRules: [
      { brand: 'Dell', markupPercentage: 15, markupFixed: 0, listingPercentage: 100, enabled: true },
      { brand: 'HP', markupPercentage: 18, markupFixed: 0, listingPercentage: 100, enabled: true }
    ],
    categoryRules: [
      { category: 'Laptops', markupPercentage: 20, markupFixed: 0, listingPercentage: 100, enabled: true },
      { category: 'Desktops', markupPercentage: 15, markupFixed: 0, listingPercentage: 100, enabled: true }
    ]
  }
});
```

### Step 3: Configure Marketplaces
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
    sellerId: 'A10D4VTYI7RMZ2',
    region: 'us-east-1',
    environment: 'production'
  },
  settings: {
    discoveryEnabled: true,
    autoListing: false,
    opportunityScoreThreshold: 0.7,
    maxDiscoveryResults: 5
  }
});

// Configure Walmart
const walmartMarketplace = await createMarketplace({
  tenantId: eco8Tenant.id,
  name: 'Walmart Marketplace',
  type: 'walmart',
  credentials: {
    clientId: 'walmart-client-id',
    clientSecret: 'walmart-client-secret',
    partnerId: 'walmart-partner-id'
  }
});

// Configure eBay
const ebayMarketplace = await createMarketplace({
  tenantId: eco8Tenant.id,
  name: 'eBay',
  type: 'ebay',
  credentials: {
    appId: 'ebay-app-id',
    certId: 'ebay-cert-id',
    devId: 'ebay-dev-id',
    authToken: 'ebay-auth-token'
  }
});
```

### Step 4: Set Up Automation Schedules
```typescript
// Daily vendor sync
await createAutomationSchedule({
  tenantId: eco8Tenant.id,
  name: 'Daily Vendor Sync',
  type: 'vendor_sync',
  schedule: '0 6 * * *', // Daily at 6 AM
  dependencies: [],
  config: {
    vendors: ['cwr'],
    syncTypes: ['catalog', 'inventory', 'pricing']
  }
});

// Weekly marketplace discovery
await createAutomationSchedule({
  tenantId: eco8Tenant.id,
  name: 'Weekly Marketplace Discovery',
  type: 'marketplace_discovery',
  schedule: '0 2 * * 1', // Every Monday at 2 AM
  dependencies: ['daily-vendor-sync'],
  config: {
    marketplaceTypes: ['amazon', 'walmart', 'ebay'],
    discoveryMethods: ['upc_match', 'mpn_match', 'title_similarity', 'brand_verification'],
    confidenceThreshold: 0.6,
    maxMatchesPerProduct: 5
  }
});

// Weekly opportunity analysis
await createAutomationSchedule({
  tenantId: eco8Tenant.id,
  name: 'Weekly Opportunity Analysis',
  type: 'opportunity_analysis',
  schedule: '0 4 * * 1', // Every Monday at 4 AM
  dependencies: ['weekly-marketplace-discovery'],
  config: {
    marketplaceTypes: ['amazon', 'walmart', 'ebay'],
    minOpportunityScore: 0.7,
    maxProductsPerRun: 1000,
    enableAutoListing: false,
    generateReport: true
  }
});
```

---

## 📈 **Expected Results**

### Discovery Performance
- **82 Products → 182+ ASINs**: 2.2x discovery ratio
- **High Confidence Matches**: 85%+ accuracy
- **Opportunity Scoring**: Multi-factor analysis
- **Weekly Analysis**: Automated opportunity discovery

### System Scalability
- **Product Capacity**: 100,000 - 1,000,000 products
- **Vendor Support**: Unlimited vendors via universal connector
- **Marketplace Integration**: Amazon, Walmart, eBay + extensible
- **Automation**: Dependency-managed scheduling

### Business Intelligence
- **Real-time Analytics**: Discovery and performance metrics
- **Opportunity Scoring**: Profit margin, demand, competition analysis
- **Automated Reporting**: Weekly opportunity reports
- **Performance Tracking**: Revenue, conversion, profit metrics

---

**Next Steps**: Begin Phase 1 implementation with database schema updates and vendor configuration system. 