import { Request, Response } from 'express';
import { ServiceTemplate, ServiceConfig } from '@vault/shared-middleware';
import { VendorConnectorFactory } from './connector-factory';

export class VendorIntegrationService extends ServiceTemplate {
  constructor(config: ServiceConfig) {
    super(config);
  }

  private convertPrismaVendorToConnectorVendor(vendor: any) {
    return {
      id: vendor.id,
      tenantId: vendor.tenantId,
      vendorId: vendor.vendorId,
      name: vendor.name,
      type: vendor.type as any,
      status: vendor.status as any,
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt,
      apiKey: vendor.apiKey || undefined,
      apiSecret: vendor.apiSecret || undefined,
      settings: vendor.settings as any
    };
  }

  protected setupServiceRoutes(): void {
    // Vendor management
    this.app.get('/api/v1/vendors', (req, res) => this.getVendors(req, res));
    this.app.post('/api/v1/vendors', (req, res) => this.createVendor(req, res));
    
    // Supported vendor types (must come before parameterized routes)
    this.app.get('/api/v1/vendors/supported', (req, res) => this.getSupportedVendorTypes(req, res));
    
    this.app.get('/api/v1/vendors/:id', (req, res) => this.getVendor(req, res));
    this.app.put('/api/v1/vendors/:id', (req, res) => this.updateVendor(req, res));
    this.app.delete('/api/v1/vendors/:id', (req, res) => this.deleteVendor(req, res));

    // Vendor products
    this.app.get('/api/v1/vendor-products', (req, res) => this.getVendorProducts(req, res));
    this.app.post('/api/v1/vendor-products', (req, res) => this.createVendorProduct(req, res));
    this.app.get('/api/v1/vendor-products/:id', (req, res) => this.getVendorProduct(req, res));
    this.app.put('/api/v1/vendor-products/:id', (req, res) => this.updateVendorProduct(req, res));
    this.app.delete('/api/v1/vendor-products/:id', (req, res) => this.deleteVendorProduct(req, res));

    // Purchase orders
    this.app.get('/api/v1/purchase-orders', (req, res) => this.getPurchaseOrders(req, res));
    this.app.post('/api/v1/purchase-orders', (req, res) => this.createPurchaseOrder(req, res));
    this.app.get('/api/v1/purchase-orders/:id', (req, res) => this.getPurchaseOrder(req, res));
    this.app.put('/api/v1/purchase-orders/:id', (req, res) => this.updatePurchaseOrder(req, res));
    this.app.delete('/api/v1/purchase-orders/:id', (req, res) => this.deletePurchaseOrder(req, res));

    // Sync operations
    this.app.post('/api/v1/vendors/:id/sync/products', (req, res) => this.syncVendorProducts(req, res));
    this.app.post('/api/v1/vendors/:id/sync/inventory', (req, res) => this.syncVendorInventory(req, res));
    this.app.post('/api/v1/vendors/:id/sync/pricing', (req, res) => this.syncVendorPricing(req, res));
    this.app.post('/api/v1/vendors/:id/sync/orders', (req, res) => this.syncVendorOrders(req, res));
  }

  protected getServiceDescription(): string {
    return 'Handle vendor/supplier integrations (Ingram Micro, Tech Data, etc.)';
  }

  protected getServiceEndpoints(): string[] {
    return [
      'GET /api/v1/vendors',
      'POST /api/v1/vendors',
      'GET /api/v1/vendors/:id',
      'PUT /api/v1/vendors/:id',
      'DELETE /api/v1/vendors/:id',
      'GET /api/v1/vendors/supported',
      'POST /api/v1/vendors/:id/sync/products',
      'POST /api/v1/vendors/:id/sync/inventory',
      'POST /api/v1/vendors/:id/sync/pricing',
      'POST /api/v1/vendors/:id/sync/orders',
      'GET /api/v1/vendor-products',
      'POST /api/v1/vendor-products',
      'GET /api/v1/vendor-products/:id',
      'PUT /api/v1/vendor-products/:id',
      'DELETE /api/v1/vendor-products/:id',
      'GET /api/v1/purchase-orders',
      'POST /api/v1/purchase-orders',
      'GET /api/v1/purchase-orders/:id',
      'PUT /api/v1/purchase-orders/:id',
      'DELETE /api/v1/purchase-orders/:id'
    ];
  }

  // Vendor Management Methods
  private getVendors = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const vendors = await this.prisma.vendor.findMany({
        where: { tenantId: req.tenantContext.tenantId }
      });

      res.json({ data: vendors, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error getting vendors', { error });
      res.status(500).json({ error: 'Failed to get vendors' });
    }
  };

  private createVendor = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { name, type, credentials, settings } = req.body;
      const vendor = await this.prisma.vendor.create({
        data: {
          tenantId: req.tenantContext.tenantId,
          vendorId: `${name}-${Date.now()}`, // Generate unique vendor ID
          name,
          type,
          apiKey: credentials?.apiKey,
          apiSecret: credentials?.apiSecret,
          settings: settings || {},
          status: 'active'
        }
      });

      res.status(201).json({ data: vendor, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error creating vendor', { error });
      res.status(500).json({ error: 'Failed to create vendor' });
    }
  };

  private getVendor = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Vendor ID is required' });
        return;
      }
      const vendor = await this.prisma.vendor.findFirst({
        where: { 
          id: id,
          tenantId: req.tenantContext.tenantId 
        }
      });

      if (!vendor) {
        res.status(404).json({ error: 'Vendor not found' });
        return;
      }

      res.json({ data: vendor, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error getting vendor', { error });
      res.status(500).json({ error: 'Failed to get vendor' });
    }
  };

  private updateVendor = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Vendor ID is required' });
        return;
      }
      const { name, type, credentials, settings, status } = req.body;
      
      const vendor = await this.prisma.vendor.updateMany({
        where: { 
          id: id,
          tenantId: req.tenantContext.tenantId 
        },
        data: {
          name,
          type,
          apiKey: credentials?.apiKey,
          apiSecret: credentials?.apiSecret,
          settings,
          status
        }
      });

      res.json({ data: vendor, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error updating vendor', { error });
      res.status(500).json({ error: 'Failed to update vendor' });
    }
  };

  private deleteVendor = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Vendor ID is required' });
        return;
      }
      await this.prisma.vendor.deleteMany({
        where: { 
          id: id,
          tenantId: req.tenantContext.tenantId 
        }
      });

      res.status(204).send();
    } catch (error) {
      this.logger.error('Error deleting vendor', { error });
      res.status(500).json({ error: 'Failed to delete vendor' });
    }
  };

  // Vendor Products Methods
  private getVendorProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const vendorProducts = await this.prisma.vendorProduct.findMany({
        include: { vendor: true }
      });

      res.json({ data: vendorProducts, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error getting vendor products', { error });
      res.status(500).json({ error: 'Failed to get vendor products' });
    }
  };

  private createVendorProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { vendorId, sku, name, price, cost, quantity, description, attributes } = req.body;
      const vendorProduct = await this.prisma.vendorProduct.create({
        data: {
          vendorId: vendorId,
          sku,
          name,
          price: price ? parseFloat(price) : null,
          cost: cost ? parseFloat(cost) : null,
          quantity: parseInt(quantity) || 0,
          description,
          attributes: attributes || {},
          status: 'active'
        }
      });

      res.status(201).json({ data: vendorProduct, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error creating vendor product', { error });
      res.status(500).json({ error: 'Failed to create vendor product' });
    }
  };

  private getVendorProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Vendor product ID is required' });
        return;
      }
      const vendorProduct = await this.prisma.vendorProduct.findFirst({
        where: { id: id },
        include: { vendor: true }
      });

      if (!vendorProduct) {
        res.status(404).json({ error: 'Vendor product not found' });
        return;
      }

      res.json({ data: vendorProduct, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error getting vendor product', { error });
      res.status(500).json({ error: 'Failed to get vendor product' });
    }
  };

  private updateVendorProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Vendor product ID is required' });
        return;
      }
      const { sku, name, price, cost, quantity, description, attributes, status } = req.body;
      
      const vendorProduct = await this.prisma.vendorProduct.updateMany({
        where: { id: id },
        data: {
          ...(sku && { sku }),
          ...(name && { name }),
          ...(price && { price: parseFloat(price) }),
          ...(cost && { cost: parseFloat(cost) }),
          ...(quantity && { quantity: parseInt(quantity) }),
          ...(description && { description }),
          ...(attributes && { attributes }),
          ...(status && { status })
        }
      });

      res.json({ data: vendorProduct, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error updating vendor product', { error });
      res.status(500).json({ error: 'Failed to update vendor product' });
    }
  };

  private deleteVendorProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Vendor product ID is required' });
        return;
      }
      await this.prisma.vendorProduct.deleteMany({
        where: { id: id }
      });

      res.status(204).send();
    } catch (error) {
      this.logger.error('Error deleting vendor product', { error });
      res.status(500).json({ error: 'Failed to delete vendor product' });
    }
  };

  // Purchase Orders Methods
  private getPurchaseOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const purchaseOrders = await this.prisma.vendorOrder.findMany({
        include: { vendor: true }
      });

      res.json({ data: purchaseOrders, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error getting purchase orders', { error });
      res.status(500).json({ error: 'Failed to get purchase orders' });
    }
  };

  private createPurchaseOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { vendorId, items, totalAmount, status } = req.body;
      const purchaseOrder = await this.prisma.vendorOrder.create({
        data: {
          vendorId: vendorId,
          orderId: `PO-${Date.now()}`, // Generate unique order ID
          totalAmount: totalAmount ? parseFloat(totalAmount) : null,
          items: items || [],
          status: status || 'pending'
        }
      });

      res.status(201).json({ data: purchaseOrder, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error creating purchase order', { error });
      res.status(500).json({ error: 'Failed to create purchase order' });
    }
  };

  private getPurchaseOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Purchase order ID is required' });
        return;
      }
      const purchaseOrder = await this.prisma.vendorOrder.findFirst({
        where: { id: id },
        include: { vendor: true }
      });

      if (!purchaseOrder) {
        res.status(404).json({ error: 'Purchase order not found' });
        return;
      }

      res.json({ data: purchaseOrder, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error getting purchase order', { error });
      res.status(500).json({ error: 'Failed to get purchase order' });
    }
  };

  private updatePurchaseOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Purchase order ID is required' });
        return;
      }
      const { items, totalAmount, status } = req.body;
      
      const purchaseOrder = await this.prisma.vendorOrder.updateMany({
        where: { id: id },
        data: {
          ...(items && { items }),
          ...(totalAmount && { totalAmount: parseFloat(totalAmount) }),
          ...(status && { status })
        }
      });

      res.json({ data: purchaseOrder, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error updating purchase order', { error });
      res.status(500).json({ error: 'Failed to update purchase order' });
    }
  };

  private deletePurchaseOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Purchase order ID is required' });
        return;
      }
      await this.prisma.vendorOrder.deleteMany({
        where: { id: id }
      });

      res.status(204).send();
    } catch (error) {
      this.logger.error('Error deleting purchase order', { error });
      res.status(500).json({ error: 'Failed to delete purchase order' });
    }
  };

  // Sync Operations Methods
  private getSupportedVendorTypes = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const supportedTypes = VendorConnectorFactory.getSupportedVendorTypes();
      const vendorTypes = supportedTypes.map(type => ({
        type,
        displayName: VendorConnectorFactory.getVendorTypeDisplayName(type),
        description: VendorConnectorFactory.getVendorTypeDescription(type)
      }));

      res.json({ 
        data: vendorTypes, 
        tenantId: req.tenantContext.tenantId 
      });
    } catch (error) {
      this.logger.error('Error getting supported vendor types', { error });
      res.status(500).json({ error: 'Failed to get supported vendor types' });
    }
  };

  private syncVendorProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Vendor ID is required' });
        return;
      }
      const vendor = await this.prisma.vendor.findFirst({
        where: { 
          id: id,
          tenantId: req.tenantContext.tenantId 
        }
      });

      if (!vendor) {
        res.status(404).json({ error: 'Vendor not found' });
        return;
      }

      // Create connector and sync products
      const connector = VendorConnectorFactory.createConnector(
        this.convertPrismaVendorToConnectorVendor(vendor),
        { apiKey: vendor.apiKey || undefined, apiSecret: vendor.apiSecret || undefined },
        vendor.settings as Record<string, any>
      );

      const result = await connector.syncProducts();

      res.json({ 
        data: result, 
        vendorId: vendor.id,
        tenantId: req.tenantContext.tenantId 
      });
    } catch (error) {
      this.logger.error('Error syncing vendor products', { error });
      res.status(500).json({ error: 'Failed to sync vendor products' });
    }
  };

  private syncVendorInventory = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Vendor ID is required' });
        return;
      }
      const vendor = await this.prisma.vendor.findFirst({
        where: { 
          id: id,
          tenantId: req.tenantContext.tenantId 
        }
      });

      if (!vendor) {
        res.status(404).json({ error: 'Vendor not found' });
        return;
      }

      // Create connector and sync inventory
      const connector = VendorConnectorFactory.createConnector(
        this.convertPrismaVendorToConnectorVendor(vendor),
        { apiKey: vendor.apiKey || undefined, apiSecret: vendor.apiSecret || undefined },
        vendor.settings as Record<string, any>
      );

      const result = await connector.syncInventory();

      res.json({ 
        data: result, 
        vendorId: vendor.id,
        tenantId: req.tenantContext.tenantId 
      });
    } catch (error) {
      this.logger.error('Error syncing vendor inventory', { error });
      res.status(500).json({ error: 'Failed to sync vendor inventory' });
    }
  };

  private syncVendorPricing = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Vendor ID is required' });
        return;
      }
      const vendor = await this.prisma.vendor.findFirst({
        where: { 
          id: id,
          tenantId: req.tenantContext.tenantId 
        }
      });

      if (!vendor) {
        res.status(404).json({ error: 'Vendor not found' });
        return;
      }

      // Create connector and sync pricing
      const connector = VendorConnectorFactory.createConnector(
        this.convertPrismaVendorToConnectorVendor(vendor),
        { apiKey: vendor.apiKey || undefined, apiSecret: vendor.apiSecret || undefined },
        vendor.settings as Record<string, any>
      );

      const result = await connector.syncPricing();

      res.json({ 
        data: result, 
        vendorId: vendor.id,
        tenantId: req.tenantContext.tenantId 
      });
    } catch (error) {
      this.logger.error('Error syncing vendor pricing', { error });
      res.status(500).json({ error: 'Failed to sync vendor pricing' });
    }
  };

  private syncVendorOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Vendor ID is required' });
        return;
      }
      const vendor = await this.prisma.vendor.findFirst({
        where: { 
          id: id,
          tenantId: req.tenantContext.tenantId 
        }
      });

      if (!vendor) {
        res.status(404).json({ error: 'Vendor not found' });
        return;
      }

      // Create connector and sync orders
      const connector = VendorConnectorFactory.createConnector(
        this.convertPrismaVendorToConnectorVendor(vendor),
        { apiKey: vendor.apiKey || undefined, apiSecret: vendor.apiSecret || undefined },
        vendor.settings as Record<string, any>
      );

      const result = await connector.syncOrders();

      res.json({ 
        data: result, 
        vendorId: vendor.id,
        tenantId: req.tenantContext.tenantId 
      });
    } catch (error) {
      this.logger.error('Error syncing vendor orders', { error });
      res.status(500).json({ error: 'Failed to sync vendor orders' });
    }
  };
} 