import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Truck, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign,
  Filter,
  Search,
  Plus,
  Edit,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Clock,
  Calendar,
  RefreshCw,
  ExternalLink,
  Users,
  Building
} from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  type: 'ingram' | 'td-synnex' | 'dh-distribution';
  status: 'connected' | 'disconnected' | 'error';
  orders: number;
  revenue: number;
  products: number;
  performance: {
    fillRate: number;
    avgLeadTime: number;
    onTimeDelivery: number;
    qualityRating: number;
  };
  lastSync: string;
  nextSync: string;
}

interface Order {
  id: string;
  orderNumber: string;
  vendor: string;
  vendorOrderId: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  totalAmount: number;
  items: Array<{
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  shipping: {
    method: string;
    trackingNumber?: string;
    carrier: string;
  };
}

// Mock data for development
const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'Ingram Micro',
    type: 'ingram',
    status: 'connected',
    orders: 45,
    revenue: 125000,
    products: 89,
    performance: {
      fillRate: 98.5,
      avgLeadTime: 3.2,
      onTimeDelivery: 95.2,
      qualityRating: 4.6
    },
    lastSync: '2024-01-21 14:30',
    nextSync: '2024-01-21 16:30'
  },
  {
    id: '2',
    name: 'TD Synnex',
    type: 'td-synnex',
    status: 'connected',
    orders: 32,
    revenue: 89000,
    products: 67,
    performance: {
      fillRate: 96.8,
      avgLeadTime: 4.1,
      onTimeDelivery: 92.7,
      qualityRating: 4.3
    },
    lastSync: '2024-01-21 13:45',
    nextSync: '2024-01-21 15:45'
  },
  {
    id: '3',
    name: 'DH Distribution',
    type: 'dh-distribution',
    status: 'connected',
    orders: 28,
    revenue: 67000,
    products: 45,
    performance: {
      fillRate: 99.1,
      avgLeadTime: 2.8,
      onTimeDelivery: 97.8,
      qualityRating: 4.7
    },
    lastSync: '2024-01-21 12:15',
    nextSync: '2024-01-21 14:15'
  }
];

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'PO-2024-001',
    vendor: 'Ingram Micro',
    vendorOrderId: 'IM-12345',
    status: 'shipped',
    orderDate: '2024-01-18',
    expectedDelivery: '2024-01-22',
    actualDelivery: '2024-01-21',
    totalAmount: 12500.00,
    items: [
      {
        productId: '1',
        productName: 'Widget Pro X1',
        sku: 'WPX1-001',
        quantity: 25,
        unitPrice: 180.00,
        totalPrice: 4500.00
      },
      {
        productId: '2',
        productName: 'Gadget Plus Pro',
        sku: 'GPP-002',
        quantity: 30,
        unitPrice: 120.00,
        totalPrice: 3600.00
      }
    ],
    shipping: {
      method: 'Ground',
      trackingNumber: '1Z999AA1234567890',
      carrier: 'UPS'
    }
  },
  {
    id: '2',
    orderNumber: 'PO-2024-002',
    vendor: 'TD Synnex',
    vendorOrderId: 'TDS-67890',
    status: 'confirmed',
    orderDate: '2024-01-19',
    expectedDelivery: '2024-01-24',
    totalAmount: 8900.00,
    items: [
      {
        productId: '3',
        productName: 'Tool Master Deluxe',
        sku: 'TMD-003',
        quantity: 50,
        unitPrice: 55.00,
        totalPrice: 2750.00
      }
    ],
    shipping: {
      method: 'Express',
      carrier: 'FedEx'
    }
  },
  {
    id: '3',
    orderNumber: 'PO-2024-003',
    vendor: 'DH Distribution',
    vendorOrderId: 'DH-11111',
    status: 'pending',
    orderDate: '2024-01-20',
    expectedDelivery: '2024-01-25',
    totalAmount: 6700.00,
    items: [
      {
        productId: '4',
        productName: 'Smart Device Pro',
        sku: 'SDP-004',
        quantity: 20,
        unitPrice: 95.00,
        totalPrice: 1900.00
      }
    ],
    shipping: {
      method: 'Standard',
      carrier: 'USPS'
    }
  }
];

const VendorCard = ({ vendor }: { vendor: Vendor }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'disconnected': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'disconnected': return <XCircle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <XCircle className="h-4 w-4" />;
    }
  };

  const getVendorIcon = (type: string) => {
    switch (type) {
      case 'ingram': return <Building className="h-6 w-6 text-blue-600" />;
      case 'td-synnex': return <Truck className="h-6 w-6 text-green-600" />;
      case 'dh-distribution': return <Package className="h-6 w-6 text-purple-600" />;
      default: return <Building className="h-6 w-6 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          {getVendorIcon(vendor.type)}
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.status)}`}>
              {getStatusIcon(vendor.status)}
              <span className="ml-1 capitalize">{vendor.status}</span>
            </div>
          </div>
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Orders</p>
          <p className="text-lg font-bold text-gray-900">{vendor.orders}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Revenue</p>
          <p className="text-lg font-bold text-gray-900">${vendor.revenue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Products</p>
          <p className="text-lg font-bold text-gray-900">{vendor.products}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Fill Rate</p>
          <p className="text-lg font-bold text-green-600">{vendor.performance.fillRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Avg Lead Time</p>
          <p className="text-sm font-bold text-gray-900">{vendor.performance.avgLeadTime} days</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">On-Time Delivery</p>
          <p className="text-sm font-bold text-gray-900">{vendor.performance.onTimeDelivery}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Quality Rating</p>
          <p className="text-sm font-bold text-gray-900">{vendor.performance.qualityRating}/5</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Next Sync</p>
          <p className="text-sm font-bold text-gray-900">{vendor.nextSync}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Last sync: {vendor.lastSync}
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
            <Eye className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderCard = ({ order }: { order: Order }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'shipped': return 'text-green-600 bg-green-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const isDelayed = order.expectedDelivery && new Date(order.expectedDelivery) < new Date() && order.status !== 'delivered';

  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
          <p className="text-sm text-gray-500">Vendor: {order.vendor}</p>
          <p className="text-sm text-gray-500">Vendor ID: {order.vendorOrderId}</p>
        </div>
        <div className="flex items-center space-x-2">
          {isDelayed && (
            <div className="p-1 bg-red-100 rounded-full">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          )}
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
            <span className="ml-1 capitalize">{order.status}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-lg font-bold text-gray-900">${order.totalAmount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Items</p>
          <p className="text-lg font-bold text-gray-900">{order.items.length}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Order Date</p>
          <p className="text-sm font-bold text-gray-900">{order.orderDate}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Expected Delivery</p>
          <p className={`text-sm font-bold ${isDelayed ? 'text-red-600' : 'text-gray-900'}`}>
            {order.expectedDelivery}
          </p>
        </div>
      </div>

      {order.shipping.trackingNumber && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{order.shipping.carrier}</p>
              <p className="text-sm text-gray-600">{order.shipping.method}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Tracking</p>
              <p className="text-sm font-medium text-indigo-600">{order.shipping.trackingNumber}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {order.actualDelivery && `Delivered: ${order.actualDelivery}`}
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
            <Eye className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
            <Edit className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const VendorStats = ({ vendors, orders }: { vendors: Vendor[], orders: Order[] }) => {
  const totalOrders = vendors.reduce((sum, v) => sum + v.orders, 0);
  const totalRevenue = vendors.reduce((sum, v) => sum + v.revenue, 0);
  const avgFillRate = vendors.reduce((sum, v) => sum + v.performance.fillRate, 0) / vendors.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-full">
            <Truck className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 rounded-full">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 rounded-full">
            <BarChart3 className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Avg Fill Rate</p>
            <p className="text-2xl font-bold text-gray-900">{avgFillRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 bg-yellow-100 rounded-full">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Pending Orders</p>
            <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterBar = ({ onSearch, onFilter }: { 
  onSearch: (query: string) => void;
  onFilter: (filters: any) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const vendors = ['all', 'Ingram Micro', 'TD Synnex', 'DH Distribution'];
  const statuses = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleFilter = () => {
    onFilter({
      vendor: selectedVendor,
      status: selectedStatus
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </form>

        {/* Vendor Filter */}
        <select
          value={selectedVendor}
          onChange={(e) => setSelectedVendor(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {vendors.map(vendor => (
            <option key={vendor} value={vendor}>
              {vendor === 'all' ? 'All Vendors' : vendor}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>

        {/* Apply Filters */}
        <button
          onClick={handleFilter}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <Filter className="h-4 w-4 inline mr-2" />
          Apply Filters
        </button>

        {/* Add Order */}
        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
          <Plus className="h-4 w-4 inline mr-2" />
          Add Order
        </button>
      </div>
    </div>
  );
};

export default function VendorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ vendor: 'all', status: 'all' });

  // Mock queries - in real app these would connect to vendor-integration service
  const { data: vendors = mockVendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => Promise.resolve(mockVendors),
    staleTime: 5 * 60 * 1000,
  });

  const { data: orders = mockOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['vendor-orders', searchQuery, filters],
    queryFn: () => Promise.resolve(mockOrders),
    staleTime: 5 * 60 * 1000,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (newFilters: any) => {
    setFilters(newFilters);
  };

  const isLoading = vendorsLoading || ordersLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading vendor data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
        <p className="text-gray-600">Manage vendor relationships and order processing</p>
      </div>

      {/* Stats Overview */}
      <VendorStats vendors={vendors} orders={orders} />

      {/* Vendor Connections */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Vendor Connections</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {vendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar onSearch={handleSearch} onFilter={handleFilter} />

      {/* Orders */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Purchase Orders</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
} 