# Purchasing AI System
## Warehouse Stock vs. Dropshipping Decision Engine

### Overview
The Purchasing AI system analyzes marketplace data, vendor costs, and business metrics to provide intelligent recommendations on whether to purchase products for warehouse stock or continue dropshipping. This system integrates with the marketplace discovery engine and vendor overlap management to provide data-driven purchasing decisions.

---

## 🎯 **AI Decision Factors**

### Primary Decision Metrics
1. **Market Demand Indicators**
   - Seller Rank (Amazon, Walmart, eBay)
   - Sales Velocity
   - Market Competition Level
   - Seasonal Trends

2. **Profitability Analysis**
   - Profit Margins (Warehouse vs. Dropship)
   - Volume Discounts Available
   - Shipping Cost Optimization
   - Storage Cost Impact

3. **Operational Considerations**
   - Listing Restrictions
   - Fulfillment Requirements
   - Lead Time Impact
   - Quality Control Needs

4. **Risk Assessment**
   - Market Volatility
   - Vendor Reliability
   - Product Lifecycle Stage
   - Competition Changes

---

## 🏗️ **System Architecture**

### Core Components
1. **Marketplace Data Analyzer** - Processes seller rank, restrictions, competition
2. **Profitability Calculator** - Compares warehouse vs. dropship scenarios
3. **Risk Assessment Engine** - Evaluates market and operational risks
4. **Decision Recommendation Engine** - AI-powered recommendation system
5. **Learning System** - Improves recommendations based on outcomes

---

## 📊 **Database Schema Extensions**

### Purchasing AI Tables
```sql
-- AI decision history and recommendations
CREATE TABLE purchasing_ai_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  master_product_id UUID REFERENCES master_products(id),
  decision_type VARCHAR(50) NOT NULL, -- 'warehouse_stock', 'dropship', 'hybrid'
  confidence_score DECIMAL(3,2), -- 0.00-1.00
  reasoning JSONB, -- Detailed reasoning for decision
  expected_profit_warehouse DECIMAL(10,2),
  expected_profit_dropship DECIMAL(10,2),
  recommended_quantity INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Marketplace data for AI analysis
CREATE TABLE marketplace_product_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  master_product_id UUID REFERENCES master_products(id),
  marketplace_id UUID REFERENCES marketplaces(id),
  marketplace_listing_id VARCHAR(100), -- ASIN, Item ID, etc.
  seller_rank INTEGER,
  sales_velocity DECIMAL(10,2), -- Units sold per day
  competition_level VARCHAR(20), -- 'low', 'medium', 'high'
  listing_restrictions JSONB, -- Any restrictions or requirements
  fulfillment_requirements JSONB, -- FBA, FBM, etc.
  price_volatility DECIMAL(5,2), -- Price change percentage
  market_demand_score DECIMAL(3,2), -- 0.00-1.00
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- AI learning and feedback system
CREATE TABLE purchasing_ai_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  decision_id UUID REFERENCES purchasing_ai_decisions(id),
  actual_outcome VARCHAR(50), -- 'profitable', 'break_even', 'loss'
  actual_profit DECIMAL(10,2),
  actual_quantity_sold INTEGER,
  feedback_rating INTEGER, -- 1-5 stars
  feedback_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI configuration and thresholds
CREATE TABLE purchasing_ai_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  config_type VARCHAR(50) NOT NULL, -- 'thresholds', 'weights', 'rules'
  config_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🧠 **AI Decision Engine**

### Core Decision Algorithm
```typescript
class PurchasingAIDecisionEngine {
  async analyzeProductForPurchase(
    masterProductId: string,
    tenantId: string
  ): Promise<PurchaseRecommendation> {
    // Gather all relevant data
    const marketplaceData = await this.getMarketplaceAnalysis(masterProductId);
    const vendorData = await this.getVendorData(masterProductId);
    const historicalData = await this.getHistoricalPerformance(masterProductId);
    const aiConfig = await this.getAIConfig(tenantId);

    // Calculate key metrics
    const marketDemandScore = this.calculateMarketDemand(marketplaceData);
    const profitabilityScore = this.calculateProfitability(vendorData, marketplaceData);
    const riskScore = this.calculateRiskScore(marketplaceData, historicalData);
    const operationalScore = this.calculateOperationalScore(vendorData, marketplaceData);

    // Generate recommendation
    const recommendation = this.generateRecommendation({
      marketDemandScore,
      profitabilityScore,
      riskScore,
      operationalScore,
      aiConfig
    });

    // Store decision for learning
    await this.storeDecision(masterProductId, tenantId, recommendation);

    return recommendation;
  }

  private calculateMarketDemand(marketplaceData: MarketplaceAnalysis[]): number {
    let totalScore = 0;
    let weightSum = 0;

    for (const data of marketplaceData) {
      // Seller rank scoring (lower rank = higher demand)
      const rankScore = this.normalizeSellerRank(data.sellerRank);
      
      // Sales velocity scoring
      const velocityScore = this.normalizeSalesVelocity(data.salesVelocity);
      
      // Competition scoring (lower competition = higher demand)
      const competitionScore = this.getCompetitionScore(data.competitionLevel);
      
      // Market demand score
      const marketScore = data.marketDemandScore;

      // Weighted average
      const weight = this.getMarketplaceWeight(data.marketplaceId);
      totalScore += (rankScore + velocityScore + competitionScore + marketScore) * weight;
      weightSum += weight;
    }

    return totalScore / weightSum;
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

  private calculateWarehouseProfitability(
    vendorData: VendorProductMapping[],
    marketplaceData: MarketplaceAnalysis[]
  ): ProfitabilityScenario {
    // Get optimal vendor for bulk purchase
    const optimalVendor = this.findOptimalWarehouseVendor(vendorData);
    
    // Calculate bulk pricing
    const bulkCost = this.calculateBulkCost(optimalVendor);
    const shippingCost = this.calculateWarehouseShippingCost();
    const storageCost = this.calculateStorageCost();
    const handlingCost = this.calculateHandlingCost();
    
    // Calculate selling price based on marketplace data
    const sellingPrice = this.calculateOptimalSellingPrice(marketplaceData);
    
    // Calculate profit
    const totalCost = bulkCost + shippingCost + storageCost + handlingCost;
    const profitPerUnit = sellingPrice - totalCost;
    
    // Estimate sales volume
    const estimatedVolume = this.estimateSalesVolume(marketplaceData);
    const totalProfit = profitPerUnit * estimatedVolume;

    return {
      costPerUnit: totalCost,
      sellingPrice,
      profitPerUnit,
      estimatedVolume,
      totalProfit,
      paybackPeriod: this.calculatePaybackPeriod(totalCost * estimatedVolume, totalProfit)
    };
  }

  private calculateDropshipProfitability(
    vendorData: VendorProductMapping[],
    marketplaceData: MarketplaceAnalysis[]
  ): ProfitabilityScenario {
    // Use dropship vendor (usually higher cost)
    const dropshipVendor = this.findDropshipVendor(vendorData);
    
    const dropshipCost = dropshipVendor.vendorCost;
    const dropshipFee = dropshipVendor.dropshipFee || 0;
    const sellingPrice = this.calculateOptimalSellingPrice(marketplaceData);
    
    const totalCost = dropshipCost + dropshipFee;
    const profitPerUnit = sellingPrice - totalCost;
    
    const estimatedVolume = this.estimateSalesVolume(marketplaceData);
    const totalProfit = profitPerUnit * estimatedVolume;

    return {
      costPerUnit: totalCost,
      sellingPrice,
      profitPerUnit,
      estimatedVolume,
      totalProfit,
      paybackPeriod: 0 // No upfront investment
    };
  }

  private calculateRiskScore(
    marketplaceData: MarketplaceAnalysis[],
    historicalData: any[]
  ): number {
    let riskScore = 0;
    
    // Price volatility risk
    const avgVolatility = marketplaceData.reduce((sum, data) => sum + data.priceVolatility, 0) / marketplaceData.length;
    riskScore += avgVolatility * 0.3;
    
    // Competition risk
    const highCompetitionCount = marketplaceData.filter(data => data.competitionLevel === 'high').length;
    riskScore += (highCompetitionCount / marketplaceData.length) * 0.2;
    
    // Listing restrictions risk
    const hasRestrictions = marketplaceData.some(data => data.listingRestrictions && Object.keys(data.listingRestrictions).length > 0);
    riskScore += hasRestrictions ? 0.2 : 0;
    
    // Historical performance risk
    if (historicalData.length > 0) {
      const avgHistoricalProfit = historicalData.reduce((sum, data) => sum + data.actualProfit, 0) / historicalData.length;
      riskScore += avgHistoricalProfit < 0 ? 0.3 : 0;
    }
    
    return Math.min(riskScore, 1.0);
  }

  private generateRecommendation(analysis: DecisionAnalysis): PurchaseRecommendation {
    const { marketDemandScore, profitabilityScore, riskScore, operationalScore, aiConfig } = analysis;
    
    // Calculate confidence score
    const confidenceScore = this.calculateConfidenceScore(analysis);
    
    // Apply AI thresholds
    const thresholds = aiConfig.thresholds;
    
    let decision: 'warehouse_stock' | 'dropship' | 'hybrid' = 'dropship';
    let reasoning: string[] = [];
    
    // Market demand check
    if (marketDemandScore >= thresholds.marketDemand) {
      reasoning.push(`Strong market demand (${(marketDemandScore * 100).toFixed(1)}%)`);
    } else {
      reasoning.push(`Weak market demand (${(marketDemandScore * 100).toFixed(1)}%)`);
    }
    
    // Profitability check
    if (profitabilityScore.warehouse.totalProfit > profitabilityScore.dropship.totalProfit * thresholds.profitabilityMultiplier) {
      reasoning.push(`Warehouse profit $${profitabilityScore.warehouse.totalProfit.toFixed(2)} vs dropship $${profitabilityScore.dropship.totalProfit.toFixed(2)}`);
      decision = 'warehouse_stock';
    } else {
      reasoning.push(`Dropship more profitable: $${profitabilityScore.dropship.totalProfit.toFixed(2)} vs warehouse $${profitabilityScore.warehouse.totalProfit.toFixed(2)}`);
    }
    
    // Risk check
    if (riskScore > thresholds.maxRisk) {
      reasoning.push(`High risk score (${(riskScore * 100).toFixed(1)}%) - consider dropship`);
      if (decision === 'warehouse_stock') {
        decision = 'hybrid';
      }
    }
    
    // Operational check
    if (operationalScore < thresholds.minOperational) {
      reasoning.push(`Operational challenges - recommend dropship`);
      decision = 'dropship';
    }
    
    return {
      decision,
      confidenceScore,
      reasoning: reasoning.join('; '),
      profitabilityAnalysis: profitabilityScore,
      recommendedQuantity: this.calculateRecommendedQuantity(analysis),
      expectedROI: this.calculateExpectedROI(analysis),
      paybackPeriod: profitabilityScore.warehouse.paybackPeriod
    };
  }
}
```

---

## 📊 **Marketplace Data Integration**

### Amazon SP-API Integration
```typescript
class AmazonMarketplaceAnalyzer {
  async analyzeProduct(masterProduct: MasterProduct): Promise<MarketplaceAnalysis[]> {
    const analyses: MarketplaceAnalysis[] = [];
    
    // Get all ASINs for this product
    const asins = await this.getProductASINs(masterProduct);
    
    for (const asin of asins) {
      // Get competitive pricing data
      const competitivePricing = await this.getCompetitivePricing(asin);
      
      // Get sales rank data
      const salesRank = await this.getSalesRank(asin);
      
      // Get listing restrictions
      const restrictions = await this.getListingRestrictions(asin);
      
      // Calculate sales velocity (estimated)
      const salesVelocity = this.estimateSalesVelocity(salesRank, competitivePricing);
      
      // Determine competition level
      const competitionLevel = this.analyzeCompetition(competitivePricing);
      
      // Calculate market demand score
      const marketDemandScore = this.calculateMarketDemandScore(salesRank, salesVelocity, competitionLevel);
      
      analyses.push({
        marketplaceId: 'amazon',
        marketplaceListingId: asin,
        sellerRank: salesRank,
        salesVelocity,
        competitionLevel,
        listingRestrictions: restrictions,
        fulfillmentRequirements: this.getFulfillmentRequirements(asin),
        priceVolatility: this.calculatePriceVolatility(competitivePricing),
        marketDemandScore
      });
    }
    
    return analyses;
  }

  private estimateSalesVelocity(salesRank: number, competitivePricing: any): number {
    // Amazon sales rank to velocity estimation
    // Lower rank = higher sales velocity
    if (salesRank <= 1000) return 50; // Very high velocity
    if (salesRank <= 5000) return 25; // High velocity
    if (salesRank <= 10000) return 10; // Medium velocity
    if (salesRank <= 50000) return 5; // Low velocity
    return 1; // Very low velocity
  }

  private analyzeCompetition(competitivePricing: any): 'low' | 'medium' | 'high' {
    const sellerCount = competitivePricing.sellers?.length || 0;
    const priceSpread = this.calculatePriceSpread(competitivePricing);
    
    if (sellerCount <= 5 && priceSpread < 0.1) return 'low';
    if (sellerCount <= 15 && priceSpread < 0.2) return 'medium';
    return 'high';
  }
}
```

---

## 🎛️ **AI Configuration Interface**

### User Configuration Dashboard
```typescript
interface PurchasingAIConfig {
  thresholds: {
    marketDemand: number; // 0.0-1.0
    profitabilityMultiplier: number; // How much more profitable warehouse must be
    maxRisk: number; // 0.0-1.0
    minOperational: number; // 0.0-1.0
  };
  weights: {
    marketDemand: number;
    profitability: number;
    risk: number;
    operational: number;
  };
  rules: {
    maxWarehouseInvestment: number; // Maximum $ to invest in warehouse stock
    minROI: number; // Minimum ROI percentage
    maxPaybackPeriod: number; // Maximum payback period in months
    preferredVendors: string[]; // Preferred vendors for warehouse stock
  };
}

const PurchasingAIConfigPage: React.FC = () => {
  const [config, setConfig] = useState<PurchasingAIConfig>({
    thresholds: {
      marketDemand: 0.7,
      profitabilityMultiplier: 1.5,
      maxRisk: 0.6,
      minOperational: 0.8
    },
    weights: {
      marketDemand: 0.3,
      profitability: 0.4,
      risk: 0.2,
      operational: 0.1
    },
    rules: {
      maxWarehouseInvestment: 10000,
      minROI: 25,
      maxPaybackPeriod: 6,
      preferredVendors: []
    }
  });

  return (
    <div className="purchasing-ai-config">
      <h1>Purchasing AI Configuration</h1>
      
      {/* Decision Thresholds */}
      <section className="thresholds">
        <h2>Decision Thresholds</h2>
        <div className="threshold-item">
          <label>Minimum Market Demand Score:</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.thresholds.marketDemand}
            onChange={(e) => updateThreshold('marketDemand', Number(e.target.value))}
          />
          <span>{(config.thresholds.marketDemand * 100).toFixed(0)}%</span>
        </div>
        
        <div className="threshold-item">
          <label>Profitability Multiplier (Warehouse vs Dropship):</label>
          <input
            type="number"
            min="1"
            max="5"
            step="0.1"
            value={config.thresholds.profitabilityMultiplier}
            onChange={(e) => updateThreshold('profitabilityMultiplier', Number(e.target.value))}
          />
          <span>x more profitable</span>
        </div>
        
        <div className="threshold-item">
          <label>Maximum Risk Score:</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.thresholds.maxRisk}
            onChange={(e) => updateThreshold('maxRisk', Number(e.target.value))}
          />
          <span>{(config.thresholds.maxRisk * 100).toFixed(0)}%</span>
        </div>
      </section>

      {/* Investment Rules */}
      <section className="investment-rules">
        <h2>Investment Rules</h2>
        <div className="rule-item">
          <label>Maximum Warehouse Investment:</label>
          <input
            type="number"
            value={config.rules.maxWarehouseInvestment}
            onChange={(e) => updateRule('maxWarehouseInvestment', Number(e.target.value))}
          />
          <span>$</span>
        </div>
        
        <div className="rule-item">
          <label>Minimum ROI:</label>
          <input
            type="number"
            value={config.rules.minROI}
            onChange={(e) => updateRule('minROI', Number(e.target.value))}
          />
          <span>%</span>
        </div>
        
        <div className="rule-item">
          <label>Maximum Payback Period:</label>
          <input
            type="number"
            value={config.rules.maxPaybackPeriod}
            onChange={(e) => updateRule('maxPaybackPeriod', Number(e.target.value))}
          />
          <span>months</span>
        </div>
      </section>

      <button onClick={saveConfig}>Save Configuration</button>
    </div>
  );
};
```

---

## 📈 **AI Recommendations Dashboard**

### Product Analysis Dashboard
```typescript
const PurchasingAIDashboard: React.FC = () => {
  const [recommendations, setRecommendations] = useState<PurchaseRecommendation[]>([]);
  const [filters, setFilters] = useState({
    decision: 'all',
    confidence: 0,
    minROI: 0
  });

  return (
    <div className="purchasing-ai-dashboard">
      <h1>Purchasing AI Recommendations</h1>
      
      {/* Filters */}
      <div className="filters">
        <select
          value={filters.decision}
          onChange={(e) => setFilters({...filters, decision: e.target.value})}
        >
          <option value="all">All Decisions</option>
          <option value="warehouse_stock">Warehouse Stock</option>
          <option value="dropship">Dropship</option>
          <option value="hybrid">Hybrid</option>
        </select>
        
        <input
          type="range"
          min="0"
          max="100"
          value={filters.confidence}
          onChange={(e) => setFilters({...filters, confidence: Number(e.target.value)})}
        />
        <span>Min Confidence: {filters.confidence}%</span>
      </div>

      {/* Recommendations List */}
      <div className="recommendations-list">
        {recommendations.map(rec => (
          <div key={rec.id} className={`recommendation-card ${rec.decision}`}>
            <div className="product-info">
              <h3>{rec.productName}</h3>
              <p>{rec.productSku}</p>
            </div>
            
            <div className="decision-info">
              <div className={`decision-badge ${rec.decision}`}>
                {rec.decision.replace('_', ' ').toUpperCase()}
              </div>
              <div className="confidence">
                Confidence: {(rec.confidenceScore * 100).toFixed(1)}%
              </div>
            </div>
            
            <div className="profitability">
              <div className="profit-item">
                <span>Warehouse Profit:</span>
                <span className={rec.profitabilityAnalysis.warehouse.totalProfit > 0 ? 'positive' : 'negative'}>
                  ${rec.profitabilityAnalysis.warehouse.totalProfit.toFixed(2)}
                </span>
              </div>
              <div className="profit-item">
                <span>Dropship Profit:</span>
                <span className={rec.profitabilityAnalysis.dropship.totalProfit > 0 ? 'positive' : 'negative'}>
                  ${rec.profitabilityAnalysis.dropship.totalProfit.toFixed(2)}
                </span>
              </div>
              <div className="profit-item">
                <span>ROI:</span>
                <span className={rec.expectedROI > 0 ? 'positive' : 'negative'}>
                  {rec.expectedROI.toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="reasoning">
              <strong>Reasoning:</strong> {rec.reasoning}
            </div>
            
            <div className="actions">
              <button onClick={() => acceptRecommendation(rec.id)}>
                Accept Recommendation
              </button>
              <button onClick={() => viewDetails(rec.id)}>
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 🔄 **Integration with Existing Systems**

### Integration Points
```typescript
// Integration with Marketplace Discovery Engine
class MarketplaceDiscoveryEngine {
  async discoverAndAnalyze(products: MasterProduct[]): Promise<DiscoveryResult[]> {
    const discoveryResults = await this.discoverProducts(products);
    
    // Enhance with AI purchasing recommendations
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

// Integration with Vendor Overlap Management
class VendorOverlapManager {
  async getOptimalSourcing(masterProductId: string, quantity: number): Promise<SourcingResult> {
    // Get AI recommendation first
    const aiRecommendation = await this.purchasingAI.analyzeProductForPurchase(masterProductId);
    
    // If AI recommends warehouse stock, use bulk vendor
    if (aiRecommendation.decision === 'warehouse_stock') {
      return this.getBulkSourcing(masterProductId, quantity);
    }
    
    // If AI recommends dropship, use dropship vendors
    return this.getDropshipSourcing(masterProductId, quantity);
  }
}
```

---

## 📊 **Example AI Recommendations**

### Scenario 1: High-Demand Product
```typescript
const highDemandRecommendation: PurchaseRecommendation = {
  decision: 'warehouse_stock',
  confidenceScore: 0.89,
  reasoning: 'Strong market demand (85%); Warehouse profit $2,450 vs dropship $1,200; Low risk score (25%)',
  profitabilityAnalysis: {
    warehouse: {
      costPerUnit: 15.99,
      sellingPrice: 29.99,
      profitPerUnit: 14.00,
      estimatedVolume: 175,
      totalProfit: 2450,
      paybackPeriod: 2.5
    },
    dropship: {
      costPerUnit: 22.99,
      sellingPrice: 29.99,
      profitPerUnit: 7.00,
      estimatedVolume: 175,
      totalProfit: 1225,
      paybackPeriod: 0
    }
  },
  recommendedQuantity: 200,
  expectedROI: 45.2,
  paybackPeriod: 2.5
};
```

### Scenario 2: Low-Demand Product
```typescript
const lowDemandRecommendation: PurchaseRecommendation = {
  decision: 'dropship',
  confidenceScore: 0.72,
  reasoning: 'Weak market demand (35%); Dropship more profitable: $180 vs warehouse $120; High risk score (65%)',
  profitabilityAnalysis: {
    warehouse: {
      costPerUnit: 18.99,
      sellingPrice: 24.99,
      profitPerUnit: 6.00,
      estimatedVolume: 20,
      totalProfit: 120,
      paybackPeriod: 8.2
    },
    dropship: {
      costPerUnit: 20.99,
      sellingPrice: 24.99,
      profitPerUnit: 4.00,
      estimatedVolume: 45,
      totalProfit: 180,
      paybackPeriod: 0
    }
  },
  recommendedQuantity: 0,
  expectedROI: 12.5,
  paybackPeriod: 0
};
```

---

## 🔧 **Implementation Roadmap**

### Phase 1: Foundation (Week 1)
- [ ] Extend database schema for AI decisions and marketplace analysis
- [ ] Create basic AI decision engine
- [ ] Implement marketplace data collection

### Phase 2: AI Logic (Week 2)
- [ ] Build profitability calculation engine
- [ ] Implement risk assessment algorithms
- [ ] Create decision recommendation system

### Phase 3: Integration (Week 3)
- [ ] Integrate with marketplace discovery engine
- [ ] Connect with vendor overlap management
- [ ] Build AI configuration interface

### Phase 4: Learning & Optimization (Week 4)
- [ ] Implement feedback and learning system
- [ ] Add AI performance analytics
- [ ] Create recommendation dashboard

---

**Key Benefits:**
1. **Data-Driven Decisions**: Use marketplace data to make informed purchasing decisions
2. **Profit Optimization**: Compare warehouse vs. dropship profitability
3. **Risk Management**: Assess market and operational risks
4. **Learning System**: Improve recommendations based on outcomes
5. **Integration**: Seamlessly works with existing sourcing rules

---

**Last Updated**: 2025-07-18  
**Version**: 1.0  
**Status**: Planning Phase 