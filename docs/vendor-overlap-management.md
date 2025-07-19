# Vendor Overlap Management System
## Intelligent Multi-Vendor Product Sourcing

### Overview
This document outlines the system for handling product overlap between vendors, including intelligent sourcing algorithms, pricing optimization, and automated vendor selection based on cost, availability, and business rules.

---

## 🏗️ System Architecture

### Core Components
1. **Product Matching Engine** - Identifies overlapping products across vendors
2. **Vendor Ranking System** - Scores vendors based on multiple criteria
3. **Intelligent Sourcing Engine** - Automatically selects optimal vendor
4. **Pricing Optimization** - Calculates best pricing strategy
5. **Inventory Aggregation** - Combines stock levels across vendors
6. **Business Rules Engine** - Applies vendor preferences and constraints

---

## 📊 Database Schema

### Product Matching Tables
```sql
-- Master product catalog with vendor mappings
CREATE TABLE master_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Vendor product mappings with detailed pricing
CREATE TABLE vendor_product_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  master_product_id UUID REFERENCES master_products(id),
  vendor_id UUID REFERENCES vendors(id),
  vendor_sku VARCHAR(100),
  vendor_cost DECIMAL(10,2),
  vendor_price DECIMAL(10,2),
  vendor_quantity INTEGER,
  dropship_fee DECIMAL(10,2),
  shipping_cost DECIMAL(10,2),
  handling_fee DECIMAL(10,2),
  markup_percentage DECIMAL(5,2),
  listing_percentage DECIMAL(5,2) DEFAULT 100.0,
  brand_rules JSONB,
  category_rules JSONB,
  vendor_priority INTEGER DEFAULT 0, -- Higher number = higher priority
  vendor_rating DECIMAL(3,2), -- Vendor performance rating
  lead_time_days INTEGER, -- Days to fulfill
  minimum_order_quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vendor sourcing rules
CREATE TABLE vendor_sourcing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'cost_based', 'availability_based', 'rating_based', 'custom'
  conditions JSONB, -- Rule conditions
  vendor_priorities JSONB, -- Vendor priority mapping
  enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Rule execution priority
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vendor performance tracking
CREATE TABLE vendor_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  vendor_id UUID REFERENCES vendors(id),
  metric_type VARCHAR(50) NOT NULL, -- 'fulfillment_rate', 'lead_time', 'price_accuracy', 'quality'
  metric_value DECIMAL(5,2),
  sample_size INTEGER,
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔍 Product Matching Engine

### Matching Algorithm
```typescript
interface ProductMatch {
  masterProductId: string;
  vendorProducts: VendorProductMatch[];
  confidence: number;
  matchType: 'exact' | 'fuzzy' | 'manual';
}

interface VendorProductMatch {
  vendorId: string;
  vendorSku: string;
  vendorCost: number;
  vendorPrice: number;
  vendorQuantity: number;
  dropshipFee: number;
  shippingCost: number;
  handlingFee: number;
  leadTimeDays: number;
  vendorRating: number;
  lastUpdated: Date;
}

class ProductMatchingEngine {
  async findOverlappingProducts(tenantId: string): Promise<ProductMatch[]> {
    const masterProducts = await this.prisma.masterProduct.findMany({
      where: { tenantId },
      include: {
        vendorProductMappings: {
          include: { vendor: true }
        }
      }
    });

    const overlappingProducts: ProductMatch[] = [];

    for (const masterProduct of masterProducts) {
      if (masterProduct.vendorProductMappings.length > 1) {
        const vendorProducts = masterProduct.vendorProductMappings.map(mapping => ({
          vendorId: mapping.vendorId,
          vendorSku: mapping.vendorSku,
          vendorCost: mapping.vendorCost,
          vendorPrice: mapping.vendorPrice,
          vendorQuantity: mapping.vendorQuantity,
          dropshipFee: mapping.dropshipFee || 0,
          shippingCost: mapping.shippingCost || 0,
          handlingFee: mapping.handlingFee || 0,
          leadTimeDays: mapping.leadTimeDays || 1,
          vendorRating: mapping.vendorRating || 0.5,
          lastUpdated: mapping.updatedAt
        }));

        overlappingProducts.push({
          masterProductId: masterProduct.id,
          vendorProducts,
          confidence: this.calculateMatchConfidence(masterProduct),
          matchType: 'exact'
        });
      }
    }

    return overlappingProducts;
  }

  private calculateMatchConfidence(masterProduct: MasterProduct): number {
    // Calculate confidence based on matching criteria
    let confidence = 0;
    
    if (masterProduct.upc) confidence += 0.4;
    if (masterProduct.manufacturerPartNumber) confidence += 0.3;
    if (masterProduct.brand) confidence += 0.2;
    if (masterProduct.title) confidence += 0.1;
    
    return Math.min(1, confidence);
  }
}
```

---

## 🎯 Vendor Ranking System

### Multi-Factor Vendor Scoring
```typescript
interface VendorScore {
  vendorId: string;
  totalScore: number;
  costScore: number;
  availabilityScore: number;
  performanceScore: number;
  leadTimeScore: number;
  qualityScore: number;
  businessRulesScore: number;
}

class VendorRankingEngine {
  async rankVendorsForProduct(
    masterProductId: string, 
    quantity: number
  ): Promise<VendorScore[]> {
    const vendorMappings = await this.prisma.vendorProductMapping.findMany({
      where: { masterProductId },
      include: { vendor: true }
    });

    const vendorScores: VendorScore[] = [];

    for (const mapping of vendorMappings) {
      const costScore = this.calculateCostScore(mapping, quantity);
      const availabilityScore = this.calculateAvailabilityScore(mapping, quantity);
      const performanceScore = this.calculatePerformanceScore(mapping.vendorId);
      const leadTimeScore = this.calculateLeadTimeScore(mapping.leadTimeDays);
      const qualityScore = this.calculateQualityScore(mapping.vendorId);
      const businessRulesScore = this.calculateBusinessRulesScore(mapping);

      const totalScore = this.calculateWeightedScore({
        costScore,
        availabilityScore,
        performanceScore,
        leadTimeScore,
        qualityScore,
        businessRulesScore
      });

      vendorScores.push({
        vendorId: mapping.vendorId,
        totalScore,
        costScore,
        availabilityScore,
        performanceScore,
        leadTimeScore,
        qualityScore,
        businessRulesScore
      });
    }

    return vendorScores.sort((a, b) => b.totalScore - a.totalScore);
  }

  private calculateCostScore(mapping: VendorProductMapping, quantity: number): number {
    const totalCost = mapping.vendorCost + mapping.dropshipFee + mapping.shippingCost + mapping.handlingFee;
    const totalPrice = totalCost * (1 + mapping.markupPercentage / 100);
    
    // Lower cost = higher score (inverted)
    const maxExpectedCost = mapping.vendorCost * 2; // Assume max 2x cost
    const costScore = Math.max(0, (maxExpectedCost - totalPrice) / maxExpectedCost);
    
    return costScore;
  }

  private calculateAvailabilityScore(mapping: VendorProductMapping, quantity: number): number {
    if (mapping.vendorQuantity >= quantity) {
      return 1.0; // Full availability
    } else if (mapping.vendorQuantity > 0) {
      return mapping.vendorQuantity / quantity; // Partial availability
    } else {
      return 0.0; // No availability
    }
  }

  private calculatePerformanceScore(vendorId: string): number {
    // Get vendor performance metrics
    const performance = await this.getVendorPerformance(vendorId);
    return performance.fulfillmentRate * 0.4 + performance.quality * 0.3 + performance.priceAccuracy * 0.3;
  }

  private calculateLeadTimeScore(leadTimeDays: number): number {
    // Shorter lead time = higher score
    const maxLeadTime = 14; // Assume max 14 days
    return Math.max(0, (maxLeadTime - leadTimeDays) / maxLeadTime);
  }

  private calculateQualityScore(vendorId: string): number {
    // Get quality metrics from vendor performance
    const performance = await this.getVendorPerformance(vendorId);
    return performance.quality || 0.5; // Default to 0.5 if no data
  }

  private calculateBusinessRulesScore(mapping: VendorProductMapping): number {
    // Apply business rules (vendor preferences, brand restrictions, etc.)
    let score = 1.0;
    
    // Check vendor priority
    if (mapping.vendorPriority > 0) {
      score += mapping.vendorPriority * 0.1; // Boost for preferred vendors
    }
    
    // Check brand rules
    if (mapping.brandRules) {
      const brandRule = this.findBrandRule(mapping.brandRules);
      if (brandRule && brandRule.enabled) {
        score += 0.2; // Boost for preferred brands
      }
    }
    
    return Math.min(1.5, score); // Cap at 1.5
  }

  private calculateWeightedScore(scores: Partial<VendorScore>): number {
    const weights = {
      costScore: 0.35,
      availabilityScore: 0.25,
      performanceScore: 0.20,
      leadTimeScore: 0.10,
      qualityScore: 0.05,
      businessRulesScore: 0.05
    };

    return Object.entries(weights).reduce((total, [key, weight]) => {
      return total + (scores[key as keyof VendorScore] || 0) * weight;
    }, 0);
  }
}
```

---

## 🧠 Intelligent Sourcing Engine

### Automated Vendor Selection
```typescript
interface SourcingDecision {
  masterProductId: string;
  selectedVendorId: string;
  selectedVendorSku: string;
  quantity: number;
  totalCost: number;
  leadTimeDays: number;
  confidence: number;
  reasoning: string;
  fallbackVendors: string[];
}

class IntelligentSourcingEngine {
  async selectOptimalVendor(
    masterProductId: string, 
    quantity: number,
    urgency: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<SourcingDecision> {
    const rankingEngine = new VendorRankingEngine();
    const vendorScores = await rankingEngine.rankVendorsForProduct(masterProductId, quantity);
    
    if (vendorScores.length === 0) {
      throw new Error(`No vendors available for product: ${masterProductId}`);
    }

    // Get vendor mappings for detailed analysis
    const vendorMappings = await this.prisma.vendorProductMapping.findMany({
      where: { masterProductId }
    });

    // Apply urgency-based adjustments
    const adjustedScores = this.applyUrgencyAdjustments(vendorScores, urgency);
    
    // Select primary vendor
    const primaryVendor = adjustedScores[0];
    const primaryMapping = vendorMappings.find(m => m.vendorId === primaryVendor.vendorId);
    
    if (!primaryMapping) {
      throw new Error(`Vendor mapping not found for: ${primaryVendor.vendorId}`);
    }

    // Calculate total cost
    const totalCost = this.calculateTotalCost(primaryMapping, quantity);
    
    // Select fallback vendors
    const fallbackVendors = adjustedScores.slice(1, 3).map(v => v.vendorId);

    return {
      masterProductId,
      selectedVendorId: primaryVendor.vendorId,
      selectedVendorSku: primaryMapping.vendorSku,
      quantity,
      totalCost,
      leadTimeDays: primaryMapping.leadTimeDays || 1,
      confidence: primaryVendor.totalScore,
      reasoning: this.generateReasoning(primaryVendor, urgency),
      fallbackVendors
    };
  }

  private applyUrgencyAdjustments(vendorScores: VendorScore[], urgency: string): VendorScore[] {
    const adjustedScores = vendorScores.map(score => {
      let adjustedScore = { ...score };
      
      switch (urgency) {
        case 'high':
          // Prioritize availability and lead time
          adjustedScore.availabilityScore *= 1.5;
          adjustedScore.leadTimeScore *= 1.3;
          adjustedScore.costScore *= 0.8; // Less emphasis on cost
          break;
        case 'low':
          // Prioritize cost and quality
          adjustedScore.costScore *= 1.3;
          adjustedScore.qualityScore *= 1.2;
          adjustedScore.leadTimeScore *= 0.7; // Less emphasis on speed
          break;
        default: // medium
          // Balanced approach
          break;
      }
      
      // Recalculate total score
      adjustedScore.totalScore = this.calculateWeightedScore(adjustedScore);
      return adjustedScore;
    });

    return adjustedScores.sort((a, b) => b.totalScore - a.totalScore);
  }

  private calculateTotalCost(mapping: VendorProductMapping, quantity: number): number {
    const unitCost = mapping.vendorCost + mapping.dropshipFee + mapping.shippingCost + mapping.handlingFee;
    const markupAmount = unitCost * (mapping.markupPercentage / 100);
    return (unitCost + markupAmount) * quantity;
  }

  private generateReasoning(vendorScore: VendorScore, urgency: string): string {
    const reasons: string[] = [];
    
    if (vendorScore.costScore > 0.8) reasons.push('Best cost efficiency');
    if (vendorScore.availabilityScore > 0.8) reasons.push('High availability');
    if (vendorScore.performanceScore > 0.8) reasons.push('Excellent performance history');
    if (vendorScore.leadTimeScore > 0.8) reasons.push('Fast lead time');
    
    if (urgency === 'high') {
      reasons.push('Selected for urgent fulfillment');
    } else if (urgency === 'low') {
      reasons.push('Selected for cost optimization');
    }
    
    return reasons.join(', ');
  }
}
```

---

## 💰 Pricing Optimization

### Multi-Vendor Pricing Strategy
```typescript
interface PricingStrategy {
  strategy: 'lowest_cost' | 'best_value' | 'premium' | 'competitive';
  basePrice: number;
  finalPrice: number;
  margin: number;
  vendorBreakdown: VendorPricingBreakdown[];
}

interface VendorPricingBreakdown {
  vendorId: string;
  vendorName: string;
  cost: number;
  markup: number;
  totalPrice: number;
  quantity: number;
  percentage: number;
}

class PricingOptimizationEngine {
  async calculateOptimalPricing(
    masterProductId: string,
    quantity: number,
    strategy: 'lowest_cost' | 'best_value' | 'premium' | 'competitive' = 'best_value'
  ): Promise<PricingStrategy> {
    const vendorMappings = await this.prisma.vendorProductMapping.findMany({
      where: { masterProductId },
      include: { vendor: true }
    });

    const vendorBreakdowns: VendorPricingBreakdown[] = [];
    let totalCost = 0;
    let totalQuantity = 0;

    // Calculate pricing for each vendor
    for (const mapping of vendorMappings) {
      const unitCost = mapping.vendorCost + mapping.dropshipFee + mapping.shippingCost + mapping.handlingFee;
      const markupAmount = unitCost * (mapping.markupPercentage / 100);
      const totalPrice = unitCost + markupAmount;
      
      const availableQuantity = Math.min(mapping.vendorQuantity, quantity);
      const vendorCost = totalPrice * availableQuantity;
      
      vendorBreakdowns.push({
        vendorId: mapping.vendorId,
        vendorName: mapping.vendor.name,
        cost: unitCost,
        markup: markupAmount,
        totalPrice,
        quantity: availableQuantity,
        percentage: (availableQuantity / quantity) * 100
      });
      
      totalCost += vendorCost;
      totalQuantity += availableQuantity;
    }

    // Sort by strategy
    switch (strategy) {
      case 'lowest_cost':
        vendorBreakdowns.sort((a, b) => a.totalPrice - b.totalPrice);
        break;
      case 'premium':
        vendorBreakdowns.sort((a, b) => b.totalPrice - a.totalPrice);
        break;
      case 'competitive':
        vendorBreakdowns.sort((a, b) => this.calculateCompetitiveScore(a) - this.calculateCompetitiveScore(b));
        break;
      default: // best_value
        vendorBreakdowns.sort((a, b) => this.calculateValueScore(b) - this.calculateValueScore(a));
    }

    // Calculate final pricing
    const basePrice = totalCost / totalQuantity;
    const finalPrice = this.applyPricingStrategy(basePrice, strategy);
    const margin = ((finalPrice - basePrice) / finalPrice) * 100;

    return {
      strategy,
      basePrice,
      finalPrice,
      margin,
      vendorBreakdown: vendorBreakdowns
    };
  }

  private calculateValueScore(breakdown: VendorPricingBreakdown): number {
    // Value = quality / price ratio
    const quality = 0.8; // Assume quality score
    return quality / breakdown.totalPrice;
  }

  private calculateCompetitiveScore(breakdown: VendorPricingBreakdown): number {
    // Competitive score based on market positioning
    const marketPrice = breakdown.totalPrice * 1.2; // Assume 20% market premium
    return marketPrice - breakdown.totalPrice;
  }

  private applyPricingStrategy(basePrice: number, strategy: string): number {
    switch (strategy) {
      case 'lowest_cost':
        return basePrice * 1.05; // 5% markup
      case 'best_value':
        return basePrice * 1.15; // 15% markup
      case 'premium':
        return basePrice * 1.25; // 25% markup
      case 'competitive':
        return basePrice * 1.10; // 10% markup
      default:
        return basePrice * 1.15;
    }
  }
}
```

---

## 📊 Example: MPN 123456 Scenario

### Scenario Analysis
```typescript
// Example: MPN 123456 across 3 vendors
const scenario = {
  masterProduct: {
    id: 'prod-123',
    manufacturerPartNumber: '123456',
    title: 'Sample Product',
    brand: 'Sample Brand'
  },
  vendorProducts: [
    {
      vendorId: 'cwr',
      vendorName: 'CWR',
      vendorSku: 'CWR-123456',
      vendorCost: 8.99,
      vendorQuantity: 20,
      dropshipFee: 0,
      shippingCost: 0,
      handlingFee: 0,
      leadTimeDays: 2,
      vendorRating: 0.85
    },
    {
      vendorId: 'td-synnex',
      vendorName: 'TD Synnex',
      vendorSku: 'TDS-123456',
      vendorCost: 6.99,
      vendorQuantity: 10,
      dropshipFee: 0,
      shippingCost: 0,
      handlingFee: 0,
      leadTimeDays: 3,
      vendorRating: 0.90
    },
    {
      vendorId: 'ingram-micro',
      vendorName: 'Ingram Micro',
      vendorSku: 'ING-123456',
      vendorCost: 4.99,
      vendorQuantity: 50,
      dropshipFee: 0,
      shippingCost: 0,
      handlingFee: 5.00,
      leadTimeDays: 1,
      vendorRating: 0.95
    }
  ]
};

// Vendor ranking results
const vendorRankings = [
  {
    vendorId: 'ingram-micro',
    totalScore: 0.92,
    costScore: 0.95, // Lowest cost + handling fee = $9.99
    availabilityScore: 1.0, // 50 in stock
    performanceScore: 0.95,
    leadTimeScore: 1.0, // 1 day
    qualityScore: 0.95,
    businessRulesScore: 1.0
  },
  {
    vendorId: 'td-synnex',
    totalScore: 0.78,
    costScore: 0.85, // $6.99
    availabilityScore: 0.5, // 10 in stock
    performanceScore: 0.90,
    leadTimeScore: 0.8, // 3 days
    qualityScore: 0.90,
    businessRulesScore: 1.0
  },
  {
    vendorId: 'cwr',
    totalScore: 0.65,
    costScore: 0.60, // $8.99 (highest cost)
    availabilityScore: 1.0, // 20 in stock
    performanceScore: 0.85,
    leadTimeScore: 0.9, // 2 days
    qualityScore: 0.85,
    businessRulesScore: 1.0
  }
];

// Optimal sourcing decision
const sourcingDecision = {
  masterProductId: 'prod-123',
  selectedVendorId: 'ingram-micro',
  selectedVendorSku: 'ING-123456',
  quantity: 15,
  totalCost: 149.85, // (4.99 + 5.00) * 15
  leadTimeDays: 1,
  confidence: 0.92,
  reasoning: 'Best cost efficiency, High availability, Fast lead time, Excellent performance history',
  fallbackVendors: ['td-synnex', 'cwr']
};
```

---

## 🎛️ User-Configurable Sourcing Rules

### User Sourcing Rule Interface
```typescript
interface UserSourcingRule {
  id: string;
  name: string;
  description: string;
  ruleType: SourcingRuleType;
  enabled: boolean;
  priority: number;
  vendorAllocations: VendorAllocationRule[];
  productFilters: ProductSourcingFilter[];
}

interface VendorAllocationRule {
  vendorId: string;
  vendorName: string;
  allocationType: 'percentage' | 'quantity' | 'remaining';
  allocationValue: number; // Percentage or quantity
  priorityOrder: number;
  minQuantity: number;
  maxQuantity?: number;
  inventoryLimitPercentage: number; // Max % of vendor's inventory to use
}
```

### Example: Lowest Cost with 20% Inventory Limit
```typescript
const lowestCostWithLimitRule: UserSourcingRule = {
  name: "Lowest Cost with 20% Inventory Limit",
  description: "Use lowest cost vendor, but only 20% of their available inventory",
  ruleType: SourcingRuleType.INVENTORY_LIMIT,
  enabled: true,
  priority: 1,
  vendorAllocations: [
    {
      vendorId: 'ingram-micro',
      vendorName: 'Ingram Micro',
      allocationType: 'remaining',
      allocationValue: 0,
      priorityOrder: 1,
      minQuantity: 1,
      inventoryLimitPercentage: 20 // Only use 20% of their inventory
    }
  ]
};

// Result for MPN 123456 scenario:
// Ingram Micro: 50 units × 20% = 10 units × $9.99 = $99.90
// TD Synnex: 10 units × $6.99 = $69.90
// CWR: 5 units × $8.99 = $44.95
// Total: 25 units for $214.75
```

## 🎛️ UI Configuration

### Vendor Overlap Management Interface
```typescript
const VendorOverlapPage: React.FC = () => {
  const [overlappingProducts, setOverlappingProducts] = useState<ProductMatch[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductMatch | null>(null);
  const [sourcingStrategy, setSourcingStrategy] = useState<'auto' | 'manual'>('auto');

  return (
    <div className="vendor-overlap-management">
      <h1>Vendor Overlap Management</h1>
      
      {/* Product List */}
      <div className="product-list">
        <h2>Products with Multiple Vendors</h2>
        {overlappingProducts.map(product => (
          <div key={product.masterProductId} className="product-item">
            <h3>{product.title}</h3>
            <p>MPN: {product.manufacturerPartNumber}</p>
            <p>Vendors: {product.vendorProducts.length}</p>
            <button onClick={() => setSelectedProduct(product)}>
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Vendor Comparison */}
      {selectedProduct && (
        <div className="vendor-comparison">
          <h2>Vendor Comparison</h2>
          <table>
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Cost</th>
                <th>Stock</th>
                <th>Lead Time</th>
                <th>Rating</th>
                <th>Total Cost</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {selectedProduct.vendorProducts.map(vendor => (
                <tr key={vendor.vendorId}>
                  <td>{vendor.vendorName}</td>
                  <td>${vendor.vendorCost}</td>
                  <td>{vendor.vendorQuantity}</td>
                  <td>{vendor.leadTimeDays} days</td>
                  <td>{vendor.vendorRating}</td>
                  <td>${vendor.vendorCost + vendor.handlingFee}</td>
                  <td>
                    <button onClick={() => selectVendor(vendor.vendorId)}>
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sourcing Rules */}
      <div className="sourcing-rules">
        <h2>Sourcing Rules</h2>
        <div className="rule-config">
          <label>
            <input 
              type="radio" 
              value="auto" 
              checked={sourcingStrategy === 'auto'}
              onChange={(e) => setSourcingStrategy(e.target.value as any)}
            />
            Automatic Sourcing
          </label>
          <label>
            <input 
              type="radio" 
              value="manual" 
              checked={sourcingStrategy === 'manual'}
              onChange={(e) => setSourcingStrategy(e.target.value as any)}
            />
            Manual Selection
          </label>
        </div>
      </div>
    </div>
  );
};
```

---

## 🔧 Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Extend database schema for vendor overlap
- [ ] Create product matching engine
- [ ] Implement basic vendor ranking

### Phase 2: Intelligence (Week 2)
- [ ] Build intelligent sourcing engine
- [ ] Create pricing optimization
- [ ] Implement business rules engine

### Phase 3: Automation (Week 3)
- [ ] Add automated vendor selection
- [ ] Create fallback mechanisms
- [ ] Implement performance tracking

### Phase 4: UI & Analytics (Week 4)
- [ ] Build vendor overlap management UI
- [ ] Create comparison dashboards
- [ ] Implement analytics and reporting

---

**Key Benefits:**
1. **Cost Optimization** - Automatically selects lowest cost vendor
2. **Availability Management** - Handles stock shortages with fallbacks
3. **Performance Tracking** - Monitors vendor performance over time
4. **Business Rules** - Applies vendor preferences and constraints
5. **Real-time Updates** - Adapts to changing vendor conditions

---

**Last Updated**: 2025-07-18  
**Version**: 1.0  
**Status**: Planning Phase 