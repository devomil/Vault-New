import { Request, Response } from 'express';
import { ServiceTemplate, ServiceConfig } from '@vault/shared-middleware';

export class InventoryManagementService extends ServiceTemplate {
  constructor(config: ServiceConfig) {
    super(config);
  }

  protected setupServiceRoutes(): void {
    // Inventory management
    this.app.get('/api/v1/inventory', (req, res) => this.getInventory(req, res));
    this.app.get('/api/v1/inventory/:productId', (req, res) => this.getInventoryByProduct(req, res));
    this.app.put('/api/v1/inventory/:productId', (req, res) => this.updateInventory(req, res));
    this.app.post('/api/v1/inventory/:productId/adjust', (req, res) => this.adjustInventory(req, res));

    // Inventory alerts
    this.app.get('/api/v1/inventory/alerts', (req, res) => this.getInventoryAlerts(req, res));
    this.app.get('/api/v1/inventory/low-stock', (req, res) => this.getLowStockItems(req, res));

    // Inventory reservation
    this.app.post('/api/v1/inventory/reserve', (req, res) => this.reserveInventory(req, res));
    this.app.post('/api/v1/inventory/release', (req, res) => this.releaseInventory(req, res));

    // Inventory movements
    this.app.get('/api/v1/inventory/movements', (req, res) => this.getInventoryMovements(req, res));
    this.app.post('/api/v1/inventory/movements', (req, res) => this.createInventoryMovement(req, res));
  }

  protected getServiceDescription(): string {
    return 'Handle inventory tracking and management';
  }

  protected getServiceEndpoints(): string[] {
    return [
      'GET /api/v1/inventory',
      'GET /api/v1/inventory/:productId',
      'PUT /api/v1/inventory/:productId',
      'POST /api/v1/inventory/:productId/adjust',
      'GET /api/v1/inventory/alerts',
      'GET /api/v1/inventory/low-stock',
      'POST /api/v1/inventory/reserve',
      'POST /api/v1/inventory/release',
      'GET /api/v1/inventory/movements',
      'POST /api/v1/inventory/movements'
    ];
  }

  // Inventory Management Methods
  private getInventory = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const inventory = await this.prisma.inventory.findMany({
        where: { tenantId: req.tenantContext.tenantId },
        include: { product: true }
      });

      res.json({ data: inventory, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error getting inventory', { error });
      res.status(500).json({ error: 'Failed to get inventory' });
    }
  };

  private getInventoryByProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { productId } = req.params;
      const inventory = await this.prisma.inventory.findFirst({
        where: { 
          productId: productId,
          tenantId: req.tenantContext.tenantId 
        },
        include: { product: true }
      });

      if (!inventory) {
        res.status(404).json({ error: 'Inventory not found for product' });
        return;
      }

      res.json({ data: inventory, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error getting inventory by product', { error });
      res.status(500).json({ error: 'Failed to get inventory' });
    }
  };

  private updateInventory = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { productId } = req.params;
      const { quantity, reserved, lowStockThreshold, reorderPoint, safetyStock } = req.body;
      
      const inventory = await this.prisma.inventory.updateMany({
        where: { 
          productId: productId,
          tenantId: req.tenantContext.tenantId 
        },
        data: {
          quantity: quantity ? parseInt(quantity) : undefined,
          reserved: reserved ? parseInt(reserved) : undefined,
          available: quantity && reserved ? parseInt(quantity) - parseInt(reserved) : undefined,
          lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : undefined,
          reorderPoint: reorderPoint ? parseInt(reorderPoint) : undefined,
          safetyStock: safetyStock ? parseInt(safetyStock) : undefined
        }
      });

      res.json({ data: inventory, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error updating inventory', { error });
      res.status(500).json({ error: 'Failed to update inventory' });
    }
  };

  private adjustInventory = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { productId } = req.params;
      const { adjustment, reason, reference } = req.body;

      // Get current inventory
      const currentInventory = await this.prisma.inventory.findFirst({
        where: { 
          productId: productId,
          tenantId: req.tenantContext.tenantId 
        }
      });

      if (!currentInventory) {
        res.status(404).json({ error: 'Inventory not found for product' });
        return;
      }

      const adjustmentAmount = parseInt(adjustment);
      const newQuantity = currentInventory.quantity + adjustmentAmount;

      // Update inventory
      const updatedInventory = await this.prisma.inventory.updateMany({
        where: { 
          productId: productId,
          tenantId: req.tenantContext.tenantId 
        },
        data: {
          quantity: newQuantity,
          available: newQuantity - currentInventory.reserved
        }
      });

      // Log inventory movement
      await this.logInventoryMovement({
        productId,
        tenantId: req.tenantContext.tenantId,
        type: adjustmentAmount > 0 ? 'in' : 'out',
        quantity: Math.abs(adjustmentAmount),
        reason,
        reference,
        previousQuantity: currentInventory.quantity,
        newQuantity
      });

      res.json({ 
        data: { 
          updatedInventory, 
          adjustment: adjustmentAmount,
          previousQuantity: currentInventory.quantity,
          newQuantity
        }, 
        tenantId: req.tenantContext.tenantId 
      });
    } catch (error) {
      this.logger.error('Error adjusting inventory', { error });
      res.status(500).json({ error: 'Failed to adjust inventory' });
    }
  };

  // Inventory Alerts Methods
  private getInventoryAlerts = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const alerts = await this.prisma.inventory.findMany({
        where: { 
          tenantId: req.tenantContext.tenantId,
          quantity: {
            lte: this.prisma.inventory.fields.reorderPoint
          }
        },
        include: { product: true }
      });

      const alertData = alerts.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        currentQuantity: item.quantity,
        reorderPoint: item.reorderPoint,
        safetyStock: item.safetyStock,
        alertType: item.quantity <= item.safetyStock ? 'critical' : 'warning'
      }));

      res.json({ data: alertData, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error getting inventory alerts', { error });
      res.status(500).json({ error: 'Failed to get inventory alerts' });
    }
  };

  private getLowStockItems = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const lowStockItems = await this.prisma.inventory.findMany({
        where: { 
          tenantId: req.tenantContext.tenantId,
          quantity: {
            lte: this.prisma.inventory.fields.lowStockThreshold
          }
        },
        include: { product: true }
      });

      res.json({ data: lowStockItems, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error getting low stock items', { error });
      res.status(500).json({ error: 'Failed to get low stock items' });
    }
  };

  // Inventory Reservation Methods
  private reserveInventory = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { productId, quantity, orderId, expiresAt } = req.body;

      // Get current inventory
      const currentInventory = await this.prisma.inventory.findFirst({
        where: { 
          productId: productId,
          tenantId: req.tenantContext.tenantId 
        }
      });

      if (!currentInventory) {
        res.status(404).json({ error: 'Inventory not found for product' });
        return;
      }

      const availableQuantity = currentInventory.quantity - currentInventory.reserved;
      
      if (availableQuantity < parseInt(quantity)) {
        res.status(400).json({ 
          error: 'Insufficient available inventory',
          available: availableQuantity,
          requested: parseInt(quantity)
        });
        return;
      }

      // Update reserved quantity
      const newReserved = currentInventory.reserved + parseInt(quantity);
      const updatedInventory = await this.prisma.inventory.updateMany({
        where: { 
          productId: productId,
          tenantId: req.tenantContext.tenantId 
        },
        data: {
          reserved: newReserved,
          available: currentInventory.quantity - newReserved
        }
      });

      res.json({ 
        data: { 
          updatedInventory,
          reservedQuantity: parseInt(quantity),
          orderId,
          expiresAt
        }, 
        tenantId: req.tenantContext.tenantId 
      });
    } catch (error) {
      this.logger.error('Error reserving inventory', { error });
      res.status(500).json({ error: 'Failed to reserve inventory' });
    }
  };

  private releaseInventory = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { productId, quantity, orderId } = req.body;

      // Get current inventory
      const currentInventory = await this.prisma.inventory.findFirst({
        where: { 
          productId: productId,
          tenantId: req.tenantContext.tenantId 
        }
      });

      if (!currentInventory) {
        res.status(404).json({ error: 'Inventory not found for product' });
        return;
      }

      const releaseQuantity = parseInt(quantity);
      const newReserved = Math.max(0, currentInventory.reserved - releaseQuantity);
      
      const updatedInventory = await this.prisma.inventory.updateMany({
        where: { 
          productId: productId,
          tenantId: req.tenantContext.tenantId 
        },
        data: {
          reserved: newReserved,
          available: currentInventory.quantity - newReserved
        }
      });

      res.json({ 
        data: { 
          updatedInventory,
          releasedQuantity: releaseQuantity,
          orderId
        }, 
        tenantId: req.tenantContext.tenantId 
      });
    } catch (error) {
      this.logger.error('Error releasing inventory', { error });
      res.status(500).json({ error: 'Failed to release inventory' });
    }
  };

  // Inventory Movements Methods
  private getInventoryMovements = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { productId } = req.query;

      // This would typically query an inventory_movements table
      // For now, return mock data
      const movements = [
        {
          id: '1',
          productId,
          type: 'in',
          quantity: 100,
          reason: 'Purchase order received',
          reference: 'PO-12345',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          productId,
          type: 'out',
          quantity: 25,
          reason: 'Order fulfillment',
          reference: 'ORD-67890',
          timestamp: new Date(Date.now() - 86400000).toISOString()
        }
      ];

      res.json({ data: movements, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error getting inventory movements', { error });
      res.status(500).json({ error: 'Failed to get inventory movements' });
    }
  };

  private createInventoryMovement = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { productId, type, quantity, reason, reference } = req.body;

      // This would typically create a record in an inventory_movements table
      const movement = {
        id: `mov-${Date.now()}`,
        productId,
        type,
        quantity: parseInt(quantity),
        reason,
        reference,
        timestamp: new Date().toISOString()
      };

      res.status(201).json({ data: movement, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error creating inventory movement', { error });
      res.status(500).json({ error: 'Failed to create inventory movement' });
    }
  };

  // Helper method for logging inventory movements
  private async logInventoryMovement(data: {
    productId: string;
    tenantId: string;
    type: string;
    quantity: number;
    reason: string;
    reference: string;
    previousQuantity: number;
    newQuantity: number;
  }): Promise<void> {
    try {
      // This would typically log to an inventory_movements table
      this.logger.info('Inventory movement logged', data);
    } catch (error) {
      this.logger.error('Error logging inventory movement', { error, data });
    }
  }
} 