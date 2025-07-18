import { Request, Response } from 'express';
import { ServiceTemplate, ServiceConfig } from '@vault/shared-middleware';
import { z } from 'zod';
import { MarketplaceConnectorFactory, MarketplaceType } from './connector-factory';
import { MarketplaceCredentials, MarketplaceSettings, ProductListing, InventoryUpdate, PriceUpdate } from './marketplace-connector';

// Validation schemas
const MarketplaceCreateSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['amazon', 'walmart', 'ebay']),
  credentials: z.object({
    apiKey: z.string().optional(),
    apiSecret: z.string().optional(),
    accessToken: z.string().optional(),
    refreshToken: z.string().optional(),
    sellerId: z.string().optional(),
    marketplaceId: z.string().optional(),
    region: z.string().optional()
  }).optional(),
  settings: z.object({
    autoSync: z.boolean().optional(),
    syncInterval: z.number().optional(),
    priceUpdateThreshold: z.number().optional(),
    inventoryUpdateThreshold: z.number().optional(),
    errorRetryAttempts: z.number().optional(),
    timeout: z.number().optional()
  }).optional()
});

const ListingCreateSchema = z.object({
  marketplaceId: z.string(),
  productId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  price: z.number().positive(),
  currency: z.string().default('USD'),
  quantity: z.number().int().min(0),
  attributes: z.record(z.any()).optional()
});

const InventoryUpdateSchema = z.object({
  sku: z.string().min(1),
  quantity: z.number().int().min(0),
  externalId: z.string().optional()
});

const PriceUpdateSchema = z.object({
  sku: z.string().min(1),
  price: z.number().positive(),
  currency: z.string().default('USD'),
  externalId: z.string().optional()
});

export class MarketplaceIntegrationService extends ServiceTemplate {
  constructor(config: ServiceConfig) {
    super(config);
    
    // Set up the connector factory logger
    MarketplaceConnectorFactory.setLogger(this.logger);
  }

  protected setupServiceRoutes(): void {
    // Marketplace management
    this.app.get('/api/v1/marketplaces', (req, res) => this.getMarketplaces(req, res));
    this.app.post('/api/v1/marketplaces', (req, res) => this.createMarketplace(req, res));
    
    // Marketplace info (must come before parameterized routes)
    this.app.get('/api/v1/marketplaces/supported', (req, res) => this.getSupportedMarketplaces(req, res));
    
    // Parameterized marketplace routes
    this.app.get('/api/v1/marketplaces/:id', (req, res) => this.getMarketplace(req, res));
    this.app.put('/api/v1/marketplaces/:id', (req, res) => this.updateMarketplace(req, res));
    this.app.delete('/api/v1/marketplaces/:id', (req, res) => this.deleteMarketplace(req, res));
    this.app.post('/api/v1/marketplaces/:id/test', (req, res) => this.testMarketplaceConnection(req, res));

    // Product listings
    this.app.get('/api/v1/listings', (req, res) => this.getListings(req, res));
    this.app.post('/api/v1/listings', (req, res) => this.createListing(req, res));
    this.app.get('/api/v1/listings/:id', (req, res) => this.getListing(req, res));
    this.app.put('/api/v1/listings/:id', (req, res) => this.updateListing(req, res));
    this.app.delete('/api/v1/listings/:id', (req, res) => this.deleteListing(req, res));

    // Marketplace orders
    this.app.get('/api/v1/orders', (req, res) => this.getOrders(req, res));
    this.app.get('/api/v1/orders/:id', (req, res) => this.getOrder(req, res));
    this.app.put('/api/v1/orders/:id/status', (req, res) => this.updateOrderStatus(req, res));

    // Sync operations
    this.app.post('/api/v1/sync/inventory', (req, res) => this.syncInventory(req, res));
    this.app.post('/api/v1/sync/pricing', (req, res) => this.syncPricing(req, res));
    this.app.post('/api/v1/sync/listings', (req, res) => this.syncListings(req, res));
    this.app.post('/api/v1/sync/orders', (req, res) => this.syncOrders(req, res));
  }

  protected getServiceDescription(): string {
    return 'Handle marketplace API integrations (Amazon, Walmart, eBay, etc.)';
  }

  protected getServiceEndpoints(): string[] {
    return [
      'GET /api/v1/marketplaces',
      'POST /api/v1/marketplaces',
      'GET /api/v1/marketplaces/:id',
      'PUT /api/v1/marketplaces/:id',
      'DELETE /api/v1/marketplaces/:id',
      'POST /api/v1/marketplaces/:id/test',
      'GET /api/v1/listings',
      'POST /api/v1/listings',
      'GET /api/v1/listings/:id',
      'PUT /api/v1/listings/:id',
      'DELETE /api/v1/listings/:id',
      'GET /api/v1/orders',
      'GET /api/v1/orders/:id',
      'PUT /api/v1/orders/:id/status',
      'POST /api/v1/sync/inventory',
      'POST /api/v1/sync/pricing',
      'POST /api/v1/sync/listings',
      'POST /api/v1/sync/orders',
      'GET /api/v1/marketplaces/supported'
    ];
  }

  // Marketplace Management Methods
  private getMarketplaces = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const marketplaces = await this.prisma.marketplace.findMany({
        where: { tenantId: req.tenantContext.tenantId }
      });

      res.json({ data: marketplaces, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error getting marketplaces', { error });
      res.status(500).json({ error: 'Failed to get marketplaces' });
    }
  };

  private createMarketplace = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const validation = MarketplaceCreateSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: 'Invalid request data', details: validation.error });
        return;
      }

      const { name, type, credentials, settings } = validation.data;

      // Validate credentials for the marketplace type
      const credentialValidation = MarketplaceConnectorFactory.validateCredentials(type, credentials || {});
      if (!credentialValidation.valid) {
        res.status(400).json({ error: 'Invalid credentials', details: credentialValidation.errors });
        return;
      }

      const marketplace = await this.prisma.marketplace.create({
        data: {
          tenantId: req.tenantContext.tenantId,
          marketplaceId: `${type}-${Date.now()}`,
          name,
          type,
          apiKey: credentials?.apiKey,
          apiSecret: credentials?.apiSecret,
          accessToken: credentials?.accessToken,
          refreshToken: credentials?.refreshToken,
          settings: settings || {},
          status: 'active'
        }
      });

      res.status(201).json({ data: marketplace, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error creating marketplace', { error });
      res.status(500).json({ error: 'Failed to create marketplace' });
    }
  };

  private getMarketplace = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      const marketplace = await this.prisma.marketplace.findFirst({
        where: { 
          id: id,
          tenantId: req.tenantContext.tenantId 
        }
      });

      if (!marketplace) {
        res.status(404).json({ error: 'Marketplace not found' });
        return;
      }

      res.json({ data: marketplace, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error getting marketplace', { error });
      res.status(500).json({ error: 'Failed to get marketplace' });
    }
  };

  private updateMarketplace = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      const { name, type, credentials, settings, status } = req.body;
      
      const marketplace = await this.prisma.marketplace.updateMany({
        where: { 
          id: id,
          tenantId: req.tenantContext.tenantId 
        },
        data: {
          name,
          type,
          apiKey: credentials?.apiKey,
          apiSecret: credentials?.apiSecret,
          accessToken: credentials?.accessToken,
          refreshToken: credentials?.refreshToken,
          settings,
          status
        }
      });

      res.json({ data: marketplace, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error updating marketplace', { error });
      res.status(500).json({ error: 'Failed to update marketplace' });
    }
  };

  private deleteMarketplace = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      await this.prisma.marketplace.deleteMany({
        where: { 
          id: id,
          tenantId: req.tenantContext.tenantId 
        }
      });

      res.status(204).send();
    } catch (error) {
      this.logger.error('Error deleting marketplace', { error });
      res.status(500).json({ error: 'Failed to delete marketplace' });
    }
  };

  private testMarketplaceConnection = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      const marketplace = await this.prisma.marketplace.findFirst({
        where: { 
          id: id,
          tenantId: req.tenantContext.tenantId 
        }
      });

      if (!marketplace) {
        res.status(404).json({ error: 'Marketplace not found' });
        return;
      }

      // Create connector and test connection
      const credentials: MarketplaceCredentials = {
        apiKey: marketplace.apiKey || undefined,
        apiSecret: marketplace.apiSecret || undefined,
        accessToken: marketplace.accessToken || undefined,
        refreshToken: marketplace.refreshToken || undefined
      };

      const settings: MarketplaceSettings = marketplace.settings as MarketplaceSettings || {};
      const connector = MarketplaceConnectorFactory.createConnector(
        marketplace.type as MarketplaceType,
        credentials,
        settings
      );

      const isAuthenticated = await connector.authenticate();
      const marketplaceInfo = await connector.getMarketplaceInfo();

      res.json({
        success: isAuthenticated,
        data: {
          authenticated: isAuthenticated,
          marketplaceInfo,
          timestamp: new Date()
        }
      });
    } catch (error) {
      this.logger.error('Error testing marketplace connection', { error });
      res.status(500).json({ error: 'Failed to test marketplace connection' });
    }
  };

  // Product Listings Methods
  private getListings = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const listings = await this.prisma.marketplaceListing.findMany({
        where: { tenantId: req.tenantContext.tenantId },
        include: { marketplace: true }
      });

      res.json({ data: listings, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error getting listings', { error });
      res.status(500).json({ error: 'Failed to get listings' });
    }
  };

  private createListing = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const validation = ListingCreateSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: 'Invalid request data', details: validation.error });
        return;
      }

      const { marketplaceId, productId, title, description, price, currency, quantity, attributes } = validation.data;

      // Verify marketplace exists
      const marketplace = await this.prisma.marketplace.findFirst({
        where: { 
          id: marketplaceId,
          tenantId: req.tenantContext.tenantId 
        }
      });

      if (!marketplace) {
        res.status(404).json({ error: 'Marketplace not found' });
        return;
      }

      // Create listing in database
      const listing = await this.prisma.marketplaceListing.create({
        data: {
          tenantId: req.tenantContext.tenantId,
          marketplaceId,
          productId,
          externalId: `TEMP-${Date.now()}`,
          title,
          description,
          price,
          currency,
          quantity,
          attributes,
          status: 'pending'
        }
      });

      res.status(201).json({ data: listing, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error creating listing', { error });
      res.status(500).json({ error: 'Failed to create listing' });
    }
  };

  private getListing = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      const listing = await this.prisma.marketplaceListing.findFirst({
        where: { 
          id: id,
          tenantId: req.tenantContext.tenantId 
        },
        include: { marketplace: true, product: true }
      });

      if (!listing) {
        res.status(404).json({ error: 'Listing not found' });
        return;
      }

      res.json({ data: listing, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error getting listing', { error });
      res.status(500).json({ error: 'Failed to get listing' });
    }
  };

  private updateListing = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      const { title, description, price, quantity, status } = req.body;
      
      const listing = await this.prisma.marketplaceListing.updateMany({
        where: { 
          id: id,
          tenantId: req.tenantContext.tenantId 
        },
        data: {
          title,
          description,
          price,
          quantity,
          status
        }
      });

      res.json({ data: listing, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error updating listing', { error });
      res.status(500).json({ error: 'Failed to update listing' });
    }
  };

  private deleteListing = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      await this.prisma.marketplaceListing.deleteMany({
        where: { 
          id: id,
          tenantId: req.tenantContext.tenantId 
        }
      });

      res.status(204).send();
    } catch (error) {
      this.logger.error('Error deleting listing', { error });
      res.status(500).json({ error: 'Failed to delete listing' });
    }
  };

  // Marketplace Orders Methods
  private getOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const orders = await this.prisma.marketplaceOrder.findMany({
        where: { tenantId: req.tenantContext.tenantId },
        include: { marketplace: true }
      });

      res.json({ data: orders, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error getting orders', { error });
      res.status(500).json({ error: 'Failed to get orders' });
    }
  };

  private getOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      const order = await this.prisma.marketplaceOrder.findFirst({
        where: { 
          id: id,
          tenantId: req.tenantContext.tenantId 
        },
        include: { marketplace: true }
      });

      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      res.json({ data: order, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error getting order', { error });
      res.status(500).json({ error: 'Failed to get order' });
    }
  };

  private updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      const { status } = req.body;
      
      const order = await this.prisma.marketplaceOrder.updateMany({
        where: { 
          id: id,
          tenantId: req.tenantContext.tenantId 
        },
        data: { status }
      });

      res.json({ data: order, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error updating order status', { error });
      res.status(500).json({ error: 'Failed to update order status' });
    }
  };

  // Sync Operations
  private syncInventory = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const validation = z.object({
        marketplaceId: z.string(),
        updates: z.array(InventoryUpdateSchema)
      }).safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({ error: 'Invalid request data', details: validation.error });
        return;
      }

      const { marketplaceId, updates } = validation.data;

      // Get marketplace
      const marketplace = await this.prisma.marketplace.findFirst({
        where: { 
          id: marketplaceId,
          tenantId: req.tenantContext.tenantId 
        }
      });

      if (!marketplace) {
        res.status(404).json({ error: 'Marketplace not found' });
        return;
      }

      // Create connector and sync inventory
      const credentials: MarketplaceCredentials = {
        apiKey: marketplace.apiKey || undefined,
        apiSecret: marketplace.apiSecret || undefined,
        accessToken: marketplace.accessToken || undefined,
        refreshToken: marketplace.refreshToken || undefined
      };

      const settings: MarketplaceSettings = marketplace.settings as MarketplaceSettings || {};
      const connector = MarketplaceConnectorFactory.createConnector(
        marketplace.type as MarketplaceType,
        credentials,
        settings
      );

      // Ensure updates have required fields
      const inventoryUpdates: InventoryUpdate[] = updates.map(update => ({
        sku: update.sku,
        quantity: update.quantity,
        externalId: update.externalId
      }));

      const result = await connector.updateInventory(inventoryUpdates);

      res.json({
        success: result.success,
        data: result,
        marketplaceId,
        tenantId: req.tenantContext.tenantId
      });
    } catch (error) {
      this.logger.error('Error syncing inventory', { error });
      res.status(500).json({ error: 'Failed to sync inventory' });
    }
  };

  private syncPricing = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const validation = z.object({
        marketplaceId: z.string(),
        updates: z.array(PriceUpdateSchema)
      }).safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({ error: 'Invalid request data', details: validation.error });
        return;
      }

      const { marketplaceId, updates } = validation.data;

      // Get marketplace
      const marketplace = await this.prisma.marketplace.findFirst({
        where: { 
          id: marketplaceId,
          tenantId: req.tenantContext.tenantId 
        }
      });

      if (!marketplace) {
        res.status(404).json({ error: 'Marketplace not found' });
        return;
      }

      // Create connector and sync pricing
      const credentials: MarketplaceCredentials = {
        apiKey: marketplace.apiKey || undefined,
        apiSecret: marketplace.apiSecret || undefined,
        accessToken: marketplace.accessToken || undefined,
        refreshToken: marketplace.refreshToken || undefined
      };

      const settings: MarketplaceSettings = marketplace.settings as MarketplaceSettings || {};
      const connector = MarketplaceConnectorFactory.createConnector(
        marketplace.type as MarketplaceType,
        credentials,
        settings
      );

      // Ensure updates have required fields
      const priceUpdates: PriceUpdate[] = updates.map(update => ({
        sku: update.sku,
        price: update.price,
        currency: update.currency,
        externalId: update.externalId
      }));

      const result = await connector.updatePricing(priceUpdates);

      res.json({
        success: result.success,
        data: result,
        marketplaceId,
        tenantId: req.tenantContext.tenantId
      });
    } catch (error) {
      this.logger.error('Error syncing pricing', { error });
      res.status(500).json({ error: 'Failed to sync pricing' });
    }
  };

  private syncListings = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { marketplaceId } = req.body;

      // Get marketplace
      const marketplace = await this.prisma.marketplace.findFirst({
        where: { 
          id: marketplaceId,
          tenantId: req.tenantContext.tenantId 
        }
      });

      if (!marketplace) {
        res.status(404).json({ error: 'Marketplace not found' });
        return;
      }

      // Create connector and get listings
      const credentials: MarketplaceCredentials = {
        apiKey: marketplace.apiKey || undefined,
        apiSecret: marketplace.apiSecret || undefined,
        accessToken: marketplace.accessToken || undefined,
        refreshToken: marketplace.refreshToken || undefined
      };

      const settings: MarketplaceSettings = marketplace.settings as MarketplaceSettings || {};
      const connector = MarketplaceConnectorFactory.createConnector(
        marketplace.type as MarketplaceType,
        credentials,
        settings
      );

      const listings = await connector.getListings();

      res.json({
        success: true,
        data: listings,
        marketplaceId,
        tenantId: req.tenantContext.tenantId
      });
    } catch (error) {
      this.logger.error('Error syncing listings', { error });
      res.status(500).json({ error: 'Failed to sync listings' });
    }
  };

  private syncOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { marketplaceId, startDate, endDate } = req.body;

      // Get marketplace
      const marketplace = await this.prisma.marketplace.findFirst({
        where: { 
          id: marketplaceId,
          tenantId: req.tenantContext.tenantId 
        }
      });

      if (!marketplace) {
        res.status(404).json({ error: 'Marketplace not found' });
        return;
      }

      // Create connector and get orders
      const credentials: MarketplaceCredentials = {
        apiKey: marketplace.apiKey || undefined,
        apiSecret: marketplace.apiSecret || undefined,
        accessToken: marketplace.accessToken || undefined,
        refreshToken: marketplace.refreshToken || undefined
      };

      const settings: MarketplaceSettings = marketplace.settings as MarketplaceSettings || {};
      const connector = MarketplaceConnectorFactory.createConnector(
        marketplace.type as MarketplaceType,
        credentials,
        settings
      );

      const orders = await connector.getOrders(
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );

      res.json({
        success: true,
        data: orders,
        marketplaceId,
        tenantId: req.tenantContext.tenantId
      });
    } catch (error) {
      this.logger.error('Error syncing orders', { error });
      res.status(500).json({ error: 'Failed to sync orders' });
    }
  };

  // Marketplace Info
  private getSupportedMarketplaces = async (req: Request, res: Response): Promise<void> => {
    try {
      const supported = MarketplaceConnectorFactory.getSupportedMarketplaces();
      const marketplaces = supported.map(type => ({
        type,
        ...MarketplaceConnectorFactory.getMarketplaceInfo(type)
      }));

      res.json({ data: marketplaces });
    } catch (error) {
      this.logger.error('Error getting supported marketplaces', { error });
      res.status(500).json({ error: 'Failed to get supported marketplaces' });
    }
  };
} 