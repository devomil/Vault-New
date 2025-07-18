import { Request, Response } from 'express';
import { ServiceTemplate, ServiceConfig } from '@vault/shared-middleware';
// Order types - will be imported from shared types when available
type CreateOrder = any;
type UpdateOrder = any;
type UpdateOrderStatus = any;
type CreateOrderItem = any;
type UpdateOrderItem = any;
type OrderAnalytics = any;

// Add simple validation for order creation and order item creation
function isValidOrderPayload(payload: any): boolean {
  return payload && typeof payload.customerEmail === 'string' && typeof payload.customerName === 'string' && Array.isArray(payload.items);
}
function isValidOrderItemPayload(payload: any): boolean {
  return payload && typeof payload.sku === 'string' && typeof payload.name === 'string' && typeof payload.quantity === 'number' && typeof payload.price === 'number';
}

export class OrderProcessingService extends ServiceTemplate {
  constructor(config: ServiceConfig) {
    super(config);
  }

  protected setupServiceRoutes(): void {
    // Order management
    this.app.get('/api/v1/orders', (req, res) => this.getOrders(req, res));
    this.app.post('/api/v1/orders', (req, res) => this.createOrder(req, res));
    this.app.get('/api/v1/orders/:id', (req, res) => this.getOrder(req, res));
    this.app.put('/api/v1/orders/:id', (req, res) => this.updateOrder(req, res));
    this.app.delete('/api/v1/orders/:id', (req, res) => this.deleteOrder(req, res));

    // Order status management
    this.app.put('/api/v1/orders/:id/status', (req, res) => this.updateOrderStatus(req, res));

    // Order fulfillment
    this.app.post('/api/v1/orders/:id/fulfill', (req, res) => this.fulfillOrder(req, res));
    this.app.post('/api/v1/orders/:id/ship', (req, res) => this.shipOrder(req, res));
    this.app.post('/api/v1/orders/:id/cancel', (req, res) => this.cancelOrder(req, res));
    this.app.post('/api/v1/orders/:id/refund', (req, res) => this.refundOrder(req, res));

    // Order items
    this.app.get('/api/v1/order-items', (req, res) => this.getOrderItems(req, res));
    this.app.get('/api/v1/orders/:id/items', (req, res) => this.getOrderItemsByOrder(req, res));
    this.app.post('/api/v1/orders/:id/items', (req, res) => this.addOrderItem(req, res));
    this.app.put('/api/v1/order-items/:id', (req, res) => this.updateOrderItem(req, res));
    this.app.delete('/api/v1/order-items/:id', (req, res) => this.deleteOrderItem(req, res));

    // Order analytics
    this.app.get('/api/v1/orders/analytics/summary', (req, res) => this.getOrderAnalytics(req, res));
    this.app.get('/api/v1/orders/analytics/trends', (req, res) => this.getOrderTrends(req, res));
    this.app.get('/api/v1/orders/analytics/performance', (req, res) => this.getOrderPerformance(req, res));

    // Order workflow
    this.app.get('/api/v1/orders/workflow/states', (req, res) => this.getOrderWorkflowStates(req, res));
    this.app.post('/api/v1/orders/:id/workflow/transition', (req, res) => this.transitionOrderWorkflow(req, res));
  }

  protected getServiceDescription(): string {
    return 'Handle order processing, fulfillment, and workflow management';
  }

  protected getServiceEndpoints(): string[] {
    return [
      'GET /api/v1/orders',
      'POST /api/v1/orders',
      'GET /api/v1/orders/:id',
      'PUT /api/v1/orders/:id',
      'DELETE /api/v1/orders/:id',
      'PUT /api/v1/orders/:id/status',
      'POST /api/v1/orders/:id/fulfill',
      'POST /api/v1/orders/:id/ship',
      'POST /api/v1/orders/:id/cancel',
      'POST /api/v1/orders/:id/refund',
      'GET /api/v1/order-items',
      'GET /api/v1/orders/:id/items',
      'POST /api/v1/orders/:id/items',
      'PUT /api/v1/order-items/:id',
      'DELETE /api/v1/order-items/:id',
      'GET /api/v1/orders/analytics/summary',
      'GET /api/v1/orders/analytics/trends',
      'GET /api/v1/orders/analytics/performance',
      'GET /api/v1/orders/workflow/states',
      'POST /api/v1/orders/:id/workflow/transition'
    ];
  }

  // Order Management Methods
  private getOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { status, limit = 50, offset = 0 } = req.query;
      
      const where: any = { tenantId: req.tenantContext.tenantId };
      if (status) {
        where.status = status;
      }

      const orders = await this.prisma.order.findMany({
        where,
        include: { items: true },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
        orderBy: { createdAt: 'desc' }
      });

      const total = await this.prisma.order.count({ where });

      res.json({ 
        data: orders, 
        tenantId: req.tenantContext.tenantId,
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        }
      });
    } catch (error) {
      this.logger.error('Error getting orders', { error });
      res.status(500).json({ error: 'Failed to get orders' });
    }
  };

  private createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const orderData: CreateOrder = req.body;
      if (!isValidOrderPayload(orderData)) {
        res.status(400).json({ error: 'Invalid order data' });
        return;
      }
      
      // Generate unique order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const order = await this.prisma.order.create({
        data: {
          tenantId: req.tenantContext.tenantId,
          orderNumber,
          customerEmail: orderData.customerEmail,
          customerName: orderData.customerName,
          totalAmount: orderData.totalAmount ? parseFloat(orderData.totalAmount.toString()) : null,
          currency: orderData.currency || 'USD',
          shippingAddress: orderData.shippingAddress || {},
          billingAddress: orderData.billingAddress || {},
          status: 'pending'
        }
      });

      // Create order items if provided
      if (orderData.items && Array.isArray(orderData.items)) {
        for (const item of orderData.items) {
          await this.prisma.orderItem.create({
            data: {
              orderId: order.id,
              productId: item.productId,
              sku: item.sku,
              name: item.name,
              quantity: parseInt(item.quantity.toString()),
              price: parseFloat(item.price.toString())
            }
          });
        }
      }

      // Return order with items
      const orderWithItems = await this.prisma.order.findFirst({
        where: { id: order.id },
        include: { items: true }
      });

      res.status(201).json({ data: orderWithItems, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error creating order', { error });
      res.status(500).json({ error: 'Failed to create order' });
    }
  };

  private getOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      const order = await this.prisma.order.findFirst({
        where: { 
          id: id,
          tenantId: req.tenantContext.tenantId 
        },
        include: { items: true }
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

  private updateOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      const updateData: UpdateOrder = req.body;
      
      const order = await this.prisma.order.updateMany({
        where: { 
          id: id,
          tenantId: req.tenantContext.tenantId 
        },
        data: {
          customerEmail: updateData.customerEmail,
          customerName: updateData.customerName,
          totalAmount: updateData.totalAmount ? parseFloat(updateData.totalAmount.toString()) : undefined,
          currency: updateData.currency,
          shippingAddress: updateData.shippingAddress,
          billingAddress: updateData.billingAddress
        }
      });

      res.json({ data: order, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error updating order', { error });
      res.status(500).json({ error: 'Failed to update order' });
    }
  };

  private deleteOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      await this.prisma.order.deleteMany({
        where: { 
          id: id,
          tenantId: req.tenantContext.tenantId 
        }
      });

      res.status(204).send();
    } catch (error) {
      this.logger.error('Error deleting order', { error });
      res.status(500).json({ error: 'Failed to delete order' });
    }
  };

  private updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      const { status }: UpdateOrderStatus = req.body;
      
      const order = await this.prisma.order.updateMany({
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

  // Order Fulfillment Methods
  private fulfillOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      const { trackingNumber, carrier, notes } = req.body;

      // Update order status to fulfilled
      const order = await this.prisma.order.updateMany({
        where: { 
          id: id,
          tenantId: req.tenantContext.tenantId 
        },
        data: { 
          status: 'processing',
          updatedAt: new Date()
        }
      });

      res.json({ 
        data: { 
          order,
          fulfillment: {
            trackingNumber,
            carrier,
            notes,
            fulfilledAt: new Date()
          }
        }, 
        tenantId: req.tenantContext.tenantId 
      });
    } catch (error) {
      this.logger.error('Error fulfilling order', { error });
      res.status(500).json({ error: 'Failed to fulfill order' });
    }
  };

  private shipOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      const { trackingNumber, carrier, notes } = req.body;

      const order = await this.prisma.order.updateMany({
        where: { 
          id: id,
          tenantId: req.tenantContext.tenantId 
        },
        data: { 
          status: 'shipped',
          updatedAt: new Date()
        }
      });

      res.json({ 
        data: { 
          order,
          shipping: {
            trackingNumber,
            carrier,
            notes,
            shippedAt: new Date()
          }
        }, 
        tenantId: req.tenantContext.tenantId 
      });
    } catch (error) {
      this.logger.error('Error shipping order', { error });
      res.status(500).json({ error: 'Failed to ship order' });
    }
  };

  private cancelOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      const { reason } = req.body;

      const order = await this.prisma.order.updateMany({
        where: { 
          id: id,
          tenantId: req.tenantContext.tenantId 
        },
        data: { 
          status: 'cancelled',
          updatedAt: new Date()
        }
      });

      res.json({ 
        data: { 
          order,
          cancellation: {
            reason,
            cancelledAt: new Date()
          }
        }, 
        tenantId: req.tenantContext.tenantId 
      });
    } catch (error) {
      this.logger.error('Error cancelling order', { error });
      res.status(500).json({ error: 'Failed to cancel order' });
    }
  };

  private refundOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      const { amount, reason, refundType = 'full' } = req.body;

      const order = await this.prisma.order.updateMany({
        where: { 
          id: id,
          tenantId: req.tenantContext.tenantId 
        },
        data: { 
          status: refundType === 'full' ? 'refunded' : 'partially_refunded',
          updatedAt: new Date()
        }
      });

      res.json({ 
        data: { 
          order,
          refund: {
            amount,
            reason,
            refundType,
            refundedAt: new Date()
          }
        }, 
        tenantId: req.tenantContext.tenantId 
      });
    } catch (error) {
      this.logger.error('Error refunding order', { error });
      res.status(500).json({ error: 'Failed to refund order' });
    }
  };

  // Order Items Methods
  private getOrderItems = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const orderItems = await this.prisma.orderItem.findMany({
        include: { order: true }
      });

      res.json({ data: orderItems, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error getting order items', { error });
      res.status(500).json({ error: 'Failed to get order items' });
    }
  };

  private getOrderItemsByOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      const orderItems = await this.prisma.orderItem.findMany({
        where: { orderId: id },
        include: { order: true }
      });

      res.json({ data: orderItems, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error getting order items by order', { error });
      res.status(500).json({ error: 'Failed to get order items' });
    }
  };

  private addOrderItem = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      const itemData: CreateOrderItem = req.body;
      if (!isValidOrderItemPayload(itemData)) {
        res.status(400).json({ error: 'Invalid order item data' });
        return;
      }
      
      const orderItem = await this.prisma.orderItem.create({
        data: {
          orderId: id,
          productId: itemData.productId,
          sku: itemData.sku,
          name: itemData.name,
          quantity: parseInt(itemData.quantity.toString()),
          price: parseFloat(itemData.price.toString())
        }
      });

      res.status(201).json({ data: orderItem, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error adding order item', { error });
      res.status(500).json({ error: 'Failed to add order item' });
    }
  };

  private updateOrderItem = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      const updateData: UpdateOrderItem = req.body;
      
      const orderItem = await this.prisma.orderItem.updateMany({
        where: { id: id },
        data: {
          sku: updateData.sku,
          name: updateData.name,
          quantity: updateData.quantity ? parseInt(updateData.quantity.toString()) : undefined,
          price: updateData.price ? parseFloat(updateData.price.toString()) : undefined
        }
      });

      res.json({ data: orderItem, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error updating order item', { error });
      res.status(500).json({ error: 'Failed to update order item' });
    }
  };

  private deleteOrderItem = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      await this.prisma.orderItem.deleteMany({
        where: { id: id }
      });

      res.status(204).send();
    } catch (error) {
      this.logger.error('Error deleting order item', { error });
      res.status(500).json({ error: 'Failed to delete order item' });
    }
  };

  // Order Analytics Methods
  private getOrderAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { startDate, endDate } = req.query;
      
      const where: any = { tenantId: req.tenantContext.tenantId };
      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        };
      }

      const totalOrders = await this.prisma.order.count({ where });
      const totalRevenue = await this.prisma.order.aggregate({
        where: { ...where, totalAmount: { not: null } },
        _sum: { totalAmount: true }
      });

      const ordersByStatus = await this.prisma.order.groupBy({
        by: ['status'],
        where,
        _count: { status: true }
      });

      const analytics: OrderAnalytics = {
        totalOrders,
        totalRevenue: Number(totalRevenue._sum.totalAmount) || 0,
        averageOrderValue: totalOrders > 0 ? Number(totalRevenue._sum.totalAmount || 0) / totalOrders : 0,
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {} as Record<string, number>),
        revenueByPeriod: {},
        topProducts: []
      };

      res.json({ data: analytics, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error getting order analytics', { error });
      res.status(500).json({ error: 'Failed to get order analytics' });
    }
  };

  private getOrderTrends = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { period = 'month' } = req.query;
      
      // Mock trend data - in production this would calculate actual trends
      const trends = {
        period,
        revenueGrowth: 15.5,
        orderGrowth: 12.3,
        averageOrderValue: 125.50,
        topPerformingProducts: [
          { sku: 'PROD-001', name: 'Product A', revenue: 5000, orders: 40 },
          { sku: 'PROD-002', name: 'Product B', revenue: 3500, orders: 28 },
          { sku: 'PROD-003', name: 'Product C', revenue: 2800, orders: 22 }
        ]
      };

      res.json({ data: trends, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error getting order trends', { error });
      res.status(500).json({ error: 'Failed to get order trends' });
    }
  };

  private getOrderPerformance = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      // Mock performance data - in production this would calculate actual performance metrics
      const performance = {
        fulfillmentRate: 98.5,
        averageFulfillmentTime: 2.3, // days
        customerSatisfaction: 4.7, // out of 5
        returnRate: 2.1,
        repeatCustomerRate: 35.2
      };

      res.json({ data: performance, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error getting order performance', { error });
      res.status(500).json({ error: 'Failed to get order performance' });
    }
  };

  // Order Workflow Methods
  private getOrderWorkflowStates = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const workflowStates = [
        { state: 'pending', label: 'Pending', color: 'yellow', transitions: ['confirmed', 'cancelled'] },
        { state: 'confirmed', label: 'Confirmed', color: 'blue', transitions: ['processing', 'cancelled'] },
        { state: 'processing', label: 'Processing', color: 'orange', transitions: ['shipped', 'backordered'] },
        { state: 'shipped', label: 'Shipped', color: 'purple', transitions: ['delivered', 'returned'] },
        { state: 'delivered', label: 'Delivered', color: 'green', transitions: ['refunded'] },
        { state: 'cancelled', label: 'Cancelled', color: 'red', transitions: [] },
        { state: 'refunded', label: 'Refunded', color: 'gray', transitions: [] },
        { state: 'backordered', label: 'Backordered', color: 'yellow', transitions: ['processing', 'cancelled'] },
        { state: 'returned', label: 'Returned', color: 'red', transitions: ['refunded'] }
      ];

      res.json({ data: workflowStates, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error getting workflow states', { error });
      res.status(500).json({ error: 'Failed to get workflow states' });
    }
  };

  private transitionOrderWorkflow = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      const { id } = req.params;
      const { targetState, notes } = req.body;

      const order = await this.prisma.order.updateMany({
        where: { 
          id: id,
          tenantId: req.tenantContext.tenantId 
        },
        data: { 
          status: targetState,
          updatedAt: new Date()
        }
      });

      res.json({ 
        data: { 
          order,
          transition: {
            fromState: 'previous_state', // Would get from current order
            toState: targetState,
            notes,
            transitionedAt: new Date()
          }
        }, 
        tenantId: req.tenantContext.tenantId 
      });
    } catch (error) {
      this.logger.error('Error transitioning order workflow', { error });
      res.status(500).json({ error: 'Failed to transition order workflow' });
    }
  };
} 