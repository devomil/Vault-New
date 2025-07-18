import { Request, Response } from 'express';
import { ServiceTemplate, ServiceConfig } from '@vault/shared-middleware';

export class PricingEngineService extends ServiceTemplate {
  constructor(config: ServiceConfig) {
    super(config);
  }

  protected setupServiceRoutes(): void {
    // Pricing rules management
    this.app.get('/api/v1/pricing-rules', (req, res) => this.getPricingRules(req, res));
    this.app.post('/api/v1/pricing-rules', (req, res) => this.createPricingRule(req, res));
    this.app.get('/api/v1/pricing-rules/:id', (req, res) => this.getPricingRule(req, res));
    this.app.put('/api/v1/pricing-rules/:id', (req, res) => this.updatePricingRule(req, res));
    this.app.delete('/api/v1/pricing-rules/:id', (req, res) => this.deletePricingRule(req, res));

    // Price calculations
    this.app.post('/api/v1/calculate-price', (req, res) => this.calculatePrice(req, res));
    this.app.post('/api/v1/calculate-bulk-price', (req, res) => this.calculateBulkPrice(req, res));
    this.app.get('/api/v1/price-history', (req, res) => this.getPriceHistory(req, res));
    this.app.post('/api/v1/price-optimization', (req, res) => this.optimizePricing(req, res));
    this.app.get('/api/v1/optimization-recommendations', (req, res) => this.getOptimizationRecommendations(req, res));

    // Competitive analysis
    this.app.post('/api/v1/competitive-analysis', (req, res) => this.analyzeCompetitivePricing(req, res));
    this.app.get('/api/v1/market-insights', (req, res) => this.getMarketInsights(req, res));
  }

  protected getServiceDescription(): string {
    return 'Handle pricing calculations and rules';
  }

  protected getServiceEndpoints(): string[] {
    return [
      'GET /api/v1/pricing-rules',
      'POST /api/v1/pricing-rules',
      'GET /api/v1/pricing-rules/:id',
      'PUT /api/v1/pricing-rules/:id',
      'DELETE /api/v1/pricing-rules/:id',
      'POST /api/v1/calculate-price',
      'POST /api/v1/calculate-bulk-price',
      'GET /api/v1/price-history',
      'POST /api/v1/price-optimization',
      'GET /api/v1/optimization-recommendations',
      'POST /api/v1/competitive-analysis',
      'GET /api/v1/market-insights'
    ];
  }

  // Pricing Rules Methods
  private getPricingRules = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const pricingRules = await this.prisma.pricingRule.findMany({
        where: { tenantId: req.tenantContext.tenantId },
        orderBy: { priority: 'desc' }
      });

      res.json({ data: pricingRules, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error getting pricing rules', { error });
      res.status(500).json({ error: 'Failed to get pricing rules' });
    }
  };

  private createPricingRule = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { name, type, conditions, actions, priority } = req.body;
      // Input validation
      if (!name || typeof name !== 'string' || name.trim() === '') {
        res.status(400).json({ error: 'Invalid or missing name' });
        return;
      }
      if (!type || typeof type !== 'string' || !['percentage', 'fixed'].includes(type)) {
        res.status(400).json({ error: 'Invalid or missing type' });
        return;
      }
      // Optionally validate conditions/actions/priority as needed

      const pricingRule = await this.prisma.pricingRule.create({
        data: {
          tenantId: req.tenantContext.tenantId,
          name,
          type,
          conditions: conditions || {},
          actions: actions || {},
          priority: priority || 0,
          status: 'active'
        }
      });

      res.status(201).json({ data: pricingRule, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error creating pricing rule', { error });
      res.status(500).json({ error: 'Failed to create pricing rule' });
    }
  };

  private getPricingRule = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      const pricingRule = await this.prisma.pricingRule.findFirst({
        where: { 
          id: id,
          tenantId: req.tenantContext.tenantId 
        }
      });

      if (!pricingRule) {
        res.status(404).json({ error: 'Pricing rule not found' });
        return;
      }

      res.json({ data: pricingRule, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error getting pricing rule', { error });
      res.status(500).json({ error: 'Failed to get pricing rule' });
    }
  };

  private updatePricingRule = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      const { name, type, conditions, actions, priority, status } = req.body;
      
      const pricingRule = await this.prisma.pricingRule.updateMany({
        where: { 
          id: id,
          tenantId: req.tenantContext.tenantId 
        },
        data: {
          name,
          type,
          conditions,
          actions,
          priority,
          status
        }
      });

      res.json({ data: pricingRule, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error updating pricing rule', { error });
      res.status(500).json({ error: 'Failed to update pricing rule' });
    }
  };

  private deletePricingRule = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      await this.prisma.pricingRule.deleteMany({
        where: { 
          id: id,
          tenantId: req.tenantContext.tenantId 
        }
      });

      res.status(204).send();
    } catch (error) {
      this.logger.error('Error deleting pricing rule', { error });
      res.status(500).json({ error: 'Failed to delete pricing rule' });
    }
  };

  // Price Calculation Methods
  private calculatePrice = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { productId, basePrice, quantity, customerType, marketplace } = req.body;

      // Get applicable pricing rules
      const pricingRules = await this.prisma.pricingRule.findMany({
        where: { 
          tenantId: req.tenantContext.tenantId,
          status: 'active'
        },
        orderBy: { priority: 'desc' }
      });

      let finalPrice = parseFloat(basePrice);
      let appliedRules: any[] = [];

      // Apply pricing rules
      for (const rule of pricingRules) {
        const conditions = rule.conditions as any;
        const actions = rule.actions as any;

        // Check if rule conditions are met
        let conditionsMet = true;
        
        if (conditions.productId && conditions.productId !== productId) {
          conditionsMet = false;
        }
        
        if (conditions.customerType && conditions.customerType !== customerType) {
          conditionsMet = false;
        }
        
        if (conditions.marketplace && conditions.marketplace !== marketplace) {
          conditionsMet = false;
        }

        if (conditionsMet) {
          // Apply rule actions
          if (actions.markupPercentage) {
            const markup = finalPrice * (actions.markupPercentage / 100);
            finalPrice += markup;
          }
          
          if (actions.discountPercentage) {
            const discount = finalPrice * (actions.discountPercentage / 100);
            finalPrice -= discount;
          }
          
          if (actions.fixedAmount) {
            finalPrice += parseFloat(actions.fixedAmount);
          }

          appliedRules.push({
            ruleId: rule.id,
            ruleName: rule.name,
            ruleType: rule.type,
            originalPrice: parseFloat(basePrice),
            newPrice: finalPrice
          });
        }
      }

      // Apply quantity discount if applicable
      if (quantity > 1) {
        const quantityDiscount = Math.min(quantity * 0.05, 0.20); // 5% per item, max 20%
        finalPrice *= (1 - quantityDiscount);
      }

      res.json({
        data: {
          productId,
          basePrice: parseFloat(basePrice),
          finalPrice: Math.round(finalPrice * 100) / 100,
          quantity,
          appliedRules,
          calculationTimestamp: new Date().toISOString()
        },
        tenantId: req.tenantContext.tenantId
      });
    } catch (error) {
      this.logger.error('Error calculating price', { error });
      res.status(500).json({ error: 'Failed to calculate price' });
    }
  };

  private getPriceHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { productId, startDate: _startDate, endDate: _endDate } = req.query;

      // This would typically query a price history table
      // For now, return mock data
      const priceHistory = [
        {
          productId,
          price: 99.99,
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          reason: 'Base price'
        },
        {
          productId,
          price: 89.99,
          timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          reason: 'Promotional discount'
        }
      ];

      res.json({ data: priceHistory, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error getting price history', { error });
      res.status(500).json({ error: 'Failed to get price history' });
    }
  };

  private optimizePricing = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { productId, currentPrice, targetMargin, competitorPrices } = req.body;

      // Simple pricing optimization algorithm
      let optimizedPrice = parseFloat(currentPrice);
      
      if (competitorPrices && Array.isArray(competitorPrices)) {
        const avgCompetitorPrice = competitorPrices.reduce((sum: number, price: number) => sum + price, 0) / competitorPrices.length;
        
        // Price competitively but maintain margin
        if (avgCompetitorPrice < optimizedPrice) {
          optimizedPrice = avgCompetitorPrice * 0.95; // 5% below average
        }
      }

      // Ensure minimum margin
      if (targetMargin) {
        const minPrice = optimizedPrice / (1 - targetMargin / 100);
        if (optimizedPrice < minPrice) {
          optimizedPrice = minPrice;
        }
      }

      res.json({
        data: {
          productId,
          currentPrice: parseFloat(currentPrice),
          optimizedPrice: Math.round(optimizedPrice * 100) / 100,
          recommendation: optimizedPrice < parseFloat(currentPrice) ? 'decrease' : 'increase',
          reasoning: 'Based on competitor analysis and margin requirements'
        },
        tenantId: req.tenantContext.tenantId
      });
    } catch (error) {
      this.logger.error('Error optimizing pricing', { error });
      res.status(500).json({ error: 'Failed to optimize pricing' });
    }
  };

  // Additional methods for missing endpoints
  private calculateBulkPrice = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { items, customerType } = req.body;

      let totalBasePrice = 0;
      let totalFinalPrice = 0;
      const processedItems: any[] = [];

      for (const item of items) {
        const { productId, basePrice, quantity } = item;
        const itemTotal = basePrice * quantity;
        totalBasePrice += itemTotal;

        // Apply bulk discount
        let finalPrice = basePrice;
        if (quantity >= 10) {
          finalPrice *= 0.85; // 15% discount for bulk
        } else if (quantity >= 5) {
          finalPrice *= 0.90; // 10% discount for medium bulk
        }

        const itemFinalTotal = finalPrice * quantity;
        totalFinalPrice += itemFinalTotal;

        processedItems.push({
          productId,
          basePrice,
          quantity,
          finalPrice: Math.round(finalPrice * 100) / 100,
          itemTotal: Math.round(itemFinalTotal * 100) / 100
        });
      }

      const totalDiscount = totalBasePrice - totalFinalPrice;

      res.json({
        data: {
          totalBasePrice: Math.round(totalBasePrice * 100) / 100,
          totalFinalPrice: Math.round(totalFinalPrice * 100) / 100,
          totalDiscount: Math.round(totalDiscount * 100) / 100,
          items: processedItems,
          customerType
        },
        tenantId: req.tenantContext.tenantId
      });
    } catch (error) {
      this.logger.error('Error calculating bulk price', { error });
      res.status(500).json({ error: 'Failed to calculate bulk price' });
    }
  };

  private getOptimizationRecommendations = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      // Mock optimization recommendations
      const recommendations = [
        {
          productId: 'prod-1',
          currentPrice: 99.99,
          recommendedPrice: 89.99,
          confidence: 0.85,
          reasoning: 'Competitor prices are 10% lower on average'
        },
        {
          productId: 'prod-2',
          currentPrice: 149.99,
          recommendedPrice: 159.99,
          confidence: 0.72,
          reasoning: 'High demand and limited supply justify price increase'
        },
        {
          productId: 'prod-3',
          currentPrice: 79.99,
          recommendedPrice: 79.99,
          confidence: 0.95,
          reasoning: 'Current price is optimal based on market analysis'
        }
      ];

      res.json({
        data: {
          recommendations,
          summary: {
            totalProducts: recommendations.length,
            priceIncreases: recommendations.filter(r => r.recommendedPrice > r.currentPrice).length,
            priceDecreases: recommendations.filter(r => r.recommendedPrice < r.currentPrice).length,
            noChange: recommendations.filter(r => r.recommendedPrice === r.currentPrice).length
          }
        },
        tenantId: req.tenantContext.tenantId
      });
    } catch (error) {
      this.logger.error('Error getting optimization recommendations', { error });
      res.status(500).json({ error: 'Failed to get optimization recommendations' });
    }
  };

  private analyzeCompetitivePricing = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { productId, competitors } = req.body;

      // Mock competitive analysis
      const competitorPrices = competitors.map((c: any) => c.price);
      const averageCompetitorPrice = competitorPrices.reduce((sum: number, price: number) => sum + price, 0) / competitorPrices.length;
      const minPrice = Math.min(...competitorPrices);
      const maxPrice = Math.max(...competitorPrices);

      // Assume current price is 100 for demo
      const currentPrice = 100;
      let marketPosition = 'competitive';
      let priceRecommendation = currentPrice;

      if (currentPrice > averageCompetitorPrice * 1.1) {
        marketPosition = 'premium';
        priceRecommendation = averageCompetitorPrice * 0.95;
      } else if (currentPrice < averageCompetitorPrice * 0.9) {
        marketPosition = 'budget';
        priceRecommendation = averageCompetitorPrice * 0.98;
      }

      const competitiveAdvantage = averageCompetitorPrice - currentPrice;

      res.json({
        data: {
          productId,
          marketPosition,
          priceRecommendation: Math.round(priceRecommendation * 100) / 100,
          competitiveAdvantage: Math.round(competitiveAdvantage * 100) / 100,
          analysis: {
            averageCompetitorPrice: Math.round(averageCompetitorPrice * 100) / 100,
            priceRange: {
              min: Math.round(minPrice * 100) / 100,
              max: Math.round(maxPrice * 100) / 100
            },
            competitorCount: competitors.length
          }
        },
        tenantId: req.tenantContext.tenantId
      });
    } catch (error) {
      this.logger.error('Error analyzing competitive pricing', { error });
      res.status(500).json({ error: 'Failed to analyze competitive pricing' });
    }
  };

  private getMarketInsights = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { category } = req.query;

      // Mock market insights
      const insights = [
        {
          insight: 'Demand for electronics is increasing by 15% month-over-month',
          confidence: 0.88,
          impact: 'positive'
        },
        {
          insight: 'Competitor pricing in this category is trending downward',
          confidence: 0.75,
          impact: 'negative'
        },
        {
          insight: 'Seasonal promotions are expected to boost sales by 25%',
          confidence: 0.92,
          impact: 'positive'
        }
      ];

      res.json({
        data: {
          category: category as string,
          insights,
          trends: {
            priceTrend: 'decreasing',
            demandTrend: 'increasing',
            marketSize: 'growing'
          },
          lastUpdated: new Date().toISOString()
        },
        tenantId: req.tenantContext.tenantId
      });
    } catch (error) {
      this.logger.error('Error getting market insights', { error });
      res.status(500).json({ error: 'Failed to get market insights' });
    }
  };
} 