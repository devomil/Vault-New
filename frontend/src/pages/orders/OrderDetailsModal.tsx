import React, { useState, useEffect } from 'react';
import { 
  X, 
  Package, 
  Truck, 
  Store, 
  Globe,
  Clock,
  CheckCircle,
  Star,
  MapPin,
  Phone,
  Mail,
  User,
  Send,
  RefreshCw,
  Download,
  Printer,
  Settings
} from 'lucide-react';

interface OrderItem {
  sku: string;
  name: string;
  quantity: number;
  price: number;
  available: number;
}

interface VendorOption {
  id: string;
  name: string;
  price: number;
  stock: number;
  leadTime: number;
  rating: number;
  shippingCost: number;
  totalCost: number;
  reliability: number;
  location: string;
  contactInfo: {
    phone: string;
    email: string;
  };
  features: string[];
  lastUpdated: Date;
}

interface OrderDetails {
  id: string;
  marketplace: string;
  customer: string;
  email: string;
  phone: string;
  status: string;
  priority: string;
  orderDate: Date;
  total: number;
  profit: number;
  fulfillmentType: string;
  assignee: string;
  tags: string[];
  risk: string;
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  notes?: string;
}

interface OrderDetailsModalProps {
  order: OrderDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onVendorSelect: (orderId: string, itemId: string, vendorId: string) => void;
  onOrderUpdate: (orderId: string, updates: Partial<OrderDetails>) => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onVendorSelect,
  onOrderUpdate
}) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedVendors, setSelectedVendors] = useState<Record<string, string>>({});
  const [vendorOptions, setVendorOptions] = useState<Record<string, VendorOption[]>>({});
  const [loadingVendors, setLoadingVendors] = useState<Record<string, boolean>>({});
  const [orderNotes, setOrderNotes] = useState('');

  // Mock vendor data - in real app this would come from vendor integration services
  const mockVendors: VendorOption[] = [
    {
      id: 'ingram-1',
      name: 'Ingram Micro',
      price: 180.00,
      stock: 45,
      leadTime: 3,
      rating: 4.6,
      shippingCost: 15.99,
      totalCost: 195.99,
      reliability: 95,
      location: 'Irvine, CA',
      contactInfo: { phone: '1-800-456-8000', email: 'orders@ingrammicro.com' },
      features: ['Next Day Delivery', 'Bulk Discounts', 'Returns Accepted'],
      lastUpdated: new Date()
    },
    {
      id: 'td-1',
      name: 'TD Synnex',
      price: 185.00,
      stock: 12,
      leadTime: 5,
      rating: 4.3,
      shippingCost: 12.99,
      totalCost: 197.99,
      reliability: 88,
      location: 'Fremont, CA',
      contactInfo: { phone: '1-800-456-8001', email: 'orders@tdsynnex.com' },
      features: ['Free Shipping', 'Extended Warranty'],
      lastUpdated: new Date()
    },
    {
      id: 'dh-1',
      name: 'DH Distribution',
      price: 175.00,
      stock: 8,
      leadTime: 2,
      rating: 4.7,
      shippingCost: 18.99,
      totalCost: 193.99,
      reliability: 92,
      location: 'Miami, FL',
      contactInfo: { phone: '1-800-456-8002', email: 'orders@dhdist.com' },
      features: ['Same Day Shipping', 'Premium Support'],
      lastUpdated: new Date()
    }
  ];

  useEffect(() => {
    if (order) {
      setOrderNotes(order.notes || '');
      // Initialize vendor options for each item
      const initialVendorOptions: Record<string, VendorOption[]> = {};
      order.items.forEach(item => {
        initialVendorOptions[item.sku] = mockVendors;
      });
      setVendorOptions(initialVendorOptions);
    }
  }, [order]);

  const handleVendorSelect = (itemSku: string, vendorId: string) => {
    setSelectedVendors(prev => ({
      ...prev,
      [itemSku]: vendorId
    }));
  };

  const handleSendToVendor = async (itemSku: string) => {
    const vendorId = selectedVendors[itemSku];
    if (!vendorId || !order) return;

    // In real app, this would call the vendor integration service
    console.log(`Sending order ${order.id}, item ${itemSku} to vendor ${vendorId}`);
    
    // Simulate API call
    setLoadingVendors(prev => ({ ...prev, [itemSku]: true }));
    
    setTimeout(() => {
      setLoadingVendors(prev => ({ ...prev, [itemSku]: false }));
      // Update order status
      onOrderUpdate(order.id, {
        status: 'Pending Fulfillment',
        notes: `Order sent to vendor ${vendorId} for item ${itemSku}`
      });
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Awaiting Payment': return 'bg-yellow-100 text-yellow-800';
      case 'On Hold': return 'bg-red-100 text-red-800';
      case 'Awaiting Shipment': return 'bg-blue-100 text-blue-800';
      case 'Pending Fulfillment': return 'bg-orange-100 text-orange-800';
      case 'Shipped': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-white';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen || !order) return null;

  const totalVendorCost = order.items.reduce((sum, item) => {
    const vendorId = selectedVendors[item.sku];
    const vendor = vendorOptions[item.sku]?.find(v => v.id === vendorId);
    return sum + (vendor ? vendor.totalCost * item.quantity : 0);
  }, 0);

  const estimatedProfit = order.total - totalVendorCost;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-2xl font-bold">Order Details</h2>
              <p className="text-gray-600">{order.id} • {order.marketplace}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                {order.priority}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded">
              <Printer className="h-4 w-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <Download className="h-4 w-4" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`px-6 py-3 font-medium ${selectedTab === 'overview' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedTab('vendor-selection')}
            className={`px-6 py-3 font-medium ${selectedTab === 'vendor-selection' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
          >
            Vendor Selection
          </button>
          <button
            onClick={() => setSelectedTab('marketplace-details')}
            className={`px-6 py-3 font-medium ${selectedTab === 'marketplace-details' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
          >
            Marketplace Details
          </button>
          <button
            onClick={() => setSelectedTab('fulfillment')}
            className={`px-6 py-3 font-medium ${selectedTab === 'fulfillment' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
          >
            Fulfillment
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {selectedTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Summary */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Order Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Order Total:</span>
                      <span className="float-right font-medium">${order.total.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Profit:</span>
                      <span className="float-right font-medium text-green-600">${order.profit.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Profit Margin:</span>
                      <span className="float-right font-medium">
                        {order.total > 0 ? ((order.profit / order.total) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Items:</span>
                      <span className="float-right font-medium">{order.items.length}</span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${item.price.toFixed(2)} each</p>
                            <p className="text-sm text-gray-600">${(item.price * item.quantity).toFixed(2)} total</p>
                            <p className={`text-xs ${item.available < item.quantity ? 'text-red-600' : 'text-green-600'}`}>
                              {item.available} available
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Customer & Shipping */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{order.customer}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{order.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{order.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Shipping Address</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{order.shippingAddress.street}</span>
                    </div>
                    <div className="ml-6">
                      <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</div>
                      <div>{order.shippingAddress.country}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Order Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Assignee:</span>
                      <span>{order.assignee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk Level:</span>
                      <span className={`px-2 py-1 rounded text-xs ${getRiskColor(order.risk)}`}>
                        {order.risk}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fulfillment:</span>
                      <span>{order.fulfillmentType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Order Date:</span>
                      <span>{order.orderDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {order.tags.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {order.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {order.notes && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Notes</h3>
                    <p className="text-sm text-gray-600">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedTab === 'vendor-selection' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Vendor Selection & Integration</h3>
                <div className="flex items-center space-x-2">
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Vendor Data
                  </button>
                </div>
              </div>

              {/* Profit Analysis */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold mb-3">Profit Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Order Total:</span>
                    <span className="float-right font-medium">${order.total.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Vendor Cost:</span>
                    <span className="float-right font-medium">${totalVendorCost.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Estimated Profit:</span>
                    <span className={`float-right font-bold ${estimatedProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${estimatedProfit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vendor Options for Each Item */}
              <div className="space-y-6">
                {order.items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-gray-600">SKU: {item.sku} • Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${item.price.toFixed(2)} each</p>
                        <p className="text-sm text-gray-600">${(item.price * item.quantity).toFixed(2)} total</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {vendorOptions[item.sku]?.map((vendor) => (
                        <div
                          key={vendor.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedVendors[item.sku] === vendor.id
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleVendorSelect(item.sku, vendor.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{vendor.name}</h5>
                            {selectedVendors[item.sku] === vendor.id && (
                              <CheckCircle className="h-5 w-5 text-indigo-600" />
                            )}
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Price:</span>
                              <span className="font-medium">${vendor.price.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Stock:</span>
                              <span className={vendor.stock < item.quantity ? 'text-red-600' : 'text-green-600'}>
                                {vendor.stock} units
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Lead Time:</span>
                              <span>{vendor.leadTime} days</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Shipping:</span>
                              <span>${vendor.shippingCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-medium border-t pt-2">
                              <span>Total Cost:</span>
                              <span>${vendor.totalCost.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm">{vendor.rating}</span>
                            </div>
                            <span className="text-xs text-gray-500">{vendor.location}</span>
                          </div>

                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span>Reliability:</span>
                              <span>{vendor.reliability}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                              <div
                                className="bg-green-600 h-1 rounded-full"
                                style={{ width: `${vendor.reliability}%` }}
                              ></div>
                            </div>
                          </div>

                          {vendor.features.length > 0 && (
                            <div className="mt-3">
                              <div className="flex flex-wrap gap-1">
                                {vendor.features.map((feature, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {selectedVendors[item.sku] && (
                      <div className="mt-4 flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div>
                          <p className="font-medium text-green-800">
                            Selected: {vendorOptions[item.sku]?.find(v => v.id === selectedVendors[item.sku])?.name}
                          </p>
                          <p className="text-sm text-green-600">
                            Total cost: ${(vendorOptions[item.sku]?.find(v => v.id === selectedVendors[item.sku])?.totalCost || 0) * item.quantity}
                          </p>
                        </div>
                        <button
                          onClick={() => handleSendToVendor(item.sku)}
                          disabled={loadingVendors[item.sku]}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                        >
                          {loadingVendors[item.sku] ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4 mr-2" />
                          )}
                          Send to Vendor
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'marketplace-details' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Marketplace Integration Details</h3>
                <div className="flex items-center space-x-2">
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    <Globe className="h-4 w-4 mr-2" />
                    View on {order.marketplace}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Marketplace Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Marketplace:</span>
                      <span className="flex items-center">
                        {order.marketplace === 'Amazon' && <Globe className="h-4 w-4 text-orange-500 mr-2" />}
                        {order.marketplace === 'eBay' && <Store className="h-4 w-4 text-blue-500 mr-2" />}
                        {order.marketplace === 'Walmart' && <Package className="h-4 w-4 text-green-500 mr-2" />}
                        {order.marketplace}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Order ID:</span>
                      <span className="font-mono">{order.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Order Date:</span>
                      <span>{order.orderDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Integration Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Order Sync:</span>
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Synced
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Inventory Check:</span>
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Pricing Sync:</span>
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Updated
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last Updated:</span>
                      <span>{new Date().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'fulfillment' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Fulfillment Options</h3>
                <div className="flex items-center space-x-2">
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Fulfillment
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="border rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Warehouse Fulfillment</h4>
                      <p className="text-sm text-gray-600">Ship from our warehouse</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Available:</span>
                      <span className="text-green-600">Yes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lead Time:</span>
                      <span>1-2 days</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Select Warehouse
                  </button>
                </div>

                <div className="border rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Store className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Store Fulfillment</h4>
                      <p className="text-sm text-gray-600">Ship from retail store</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Available:</span>
                      <span className="text-green-600">Yes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lead Time:</span>
                      <span>Same day</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    Select Store
                  </button>
                </div>

                <div className="border rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Truck className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Drop Ship</h4>
                      <p className="text-sm text-gray-600">Ship directly from vendor</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Available:</span>
                      <span className="text-green-600">Yes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lead Time:</span>
                      <span>3-5 days</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                    Select Drop Ship
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Fulfillment Notes</h4>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Add fulfillment notes..."
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={3}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => onOrderUpdate(order.id, { notes: orderNotes })}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal; 