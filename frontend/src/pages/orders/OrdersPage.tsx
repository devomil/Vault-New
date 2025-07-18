import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  Upload, 
  RefreshCw, 
  Package, 
  Truck, 
  Store, 
  Globe,
  X,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Eye,
  Printer,
  Tag,
  User,
  DollarSign,
  TrendingUp,
  Settings,
  ArrowUpDown
} from 'lucide-react';
import OrderDetailsModal from './OrderDetailsModal';

// Simple inline components to avoid import issues
const Card = ({ children, className = '', ...props }: any) => (
  <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '', ...props }: any) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '', ...props }: any) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '', ...props }: any) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

const Button = ({ children, variant = 'default', size = 'default', className = '', ...props }: any) => {
  const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variantClasses: Record<string, string> = {
    default: 'bg-indigo-600 text-white hover:bg-indigo-700',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50',
    ghost: 'hover:bg-gray-100',
  };

  const sizeClasses: Record<string, string> = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.default} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, variant = 'default', className = '', ...props }: any) => {
  const variantClasses: Record<string, string> = {
    default: 'bg-indigo-100 text-indigo-800',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 bg-white text-gray-700',
  };

  return (
    <div
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant] || variantClasses.default} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const Input = ({ className = '', ...props }: any) => (
  <input
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${className}`}
    {...props}
  />
);

const Select = ({ children, value, onValueChange, className = '', ...props }: any) => (
  <select
    value={value}
    onChange={(e) => onValueChange?.(e.target.value)}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${className}`}
    {...props}
  >
    {children}
  </select>
);

const Checkbox = ({ checked, onCheckedChange, className = '', ...props }: any) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={(e) => onCheckedChange?.(e.target.checked)}
    className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ${className}`}
    {...props}
  />
);

// Enhanced mock data for high-volume scenarios
const mockOrders = [
  // Amazon Orders (200 orders)
  ...Array.from({ length: 200 }, (_, i) => ({
    id: `AMZ-${String(i + 1).padStart(6, '0')}`,
    marketplace: 'Amazon',
    customer: `Customer ${i + 1}`,
    email: `customer${i + 1}@example.com`,
    phone: `+1-555-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    status: ['Awaiting Payment', 'On Hold', 'Awaiting Shipment', 'Pending Fulfillment', 'Shipped', 'Cancelled'][Math.floor(Math.random() * 6)],
    priority: ['Low', 'Medium', 'High', 'Urgent'][Math.floor(Math.random() * 4)],
    orderDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    total: Math.floor(Math.random() * 1000) + 50,
    fulfillmentType: ['Warehouse', 'Store', 'Drop Ship'][Math.floor(Math.random() * 3)],
    assignee: ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Lisa Chen'][Math.floor(Math.random() * 4)],
    tags: ['VIP', 'New Customer', 'Returning', 'High Value'].slice(0, Math.floor(Math.random() * 3) + 1),
    profit: Math.floor(Math.random() * 200) + 20,
    risk: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
    shippingAddress: {
      street: `${Math.floor(Math.random() * 9999) + 1} Main St`,
      city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
      state: ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
      zip: String(Math.floor(Math.random() * 90000) + 10000),
      country: 'USA'
    },
    items: [
      {
        sku: `AMZ-SKU-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`,
        name: `Product ${Math.floor(Math.random() * 100) + 1}`,
        quantity: Math.floor(Math.random() * 3) + 1,
        price: Math.floor(Math.random() * 100) + 10,
        available: Math.floor(Math.random() * 50) + 10
      }
    ]
  })),
  
  // eBay Orders (100 orders)
  ...Array.from({ length: 100 }, (_, i) => ({
    id: `EBAY-${String(i + 1).padStart(6, '0')}`,
    marketplace: 'eBay',
    customer: `eBay Customer ${i + 1}`,
    email: `ebay${i + 1}@example.com`,
    phone: `+1-555-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    status: ['Awaiting Payment', 'On Hold', 'Awaiting Shipment', 'Pending Fulfillment', 'Shipped', 'Cancelled'][Math.floor(Math.random() * 6)],
    priority: ['Low', 'Medium', 'High', 'Urgent'][Math.floor(Math.random() * 4)],
    orderDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    total: Math.floor(Math.random() * 800) + 30,
    fulfillmentType: ['Warehouse', 'Store', 'Drop Ship'][Math.floor(Math.random() * 3)],
    assignee: ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Lisa Chen'][Math.floor(Math.random() * 4)],
    tags: ['VIP', 'New Customer', 'Returning', 'High Value'].slice(0, Math.floor(Math.random() * 3) + 1),
    profit: Math.floor(Math.random() * 150) + 15,
    risk: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
    shippingAddress: {
      street: `${Math.floor(Math.random() * 9999) + 1} Oak Ave`,
      city: ['Miami', 'Seattle', 'Denver', 'Atlanta', 'Boston'][Math.floor(Math.random() * 5)],
      state: ['FL', 'WA', 'CO', 'GA', 'MA'][Math.floor(Math.random() * 5)],
      zip: String(Math.floor(Math.random() * 90000) + 10000),
      country: 'USA'
    },
    items: [
      {
        sku: `EBAY-SKU-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`,
        name: `eBay Product ${Math.floor(Math.random() * 100) + 1}`,
        quantity: Math.floor(Math.random() * 2) + 1,
        price: Math.floor(Math.random() * 80) + 8,
        available: Math.floor(Math.random() * 30) + 5
      }
    ]
  })),
  
  // Walmart Orders (300 orders)
  ...Array.from({ length: 300 }, (_, i) => ({
    id: `WMT-${String(i + 1).padStart(6, '0')}`,
    marketplace: 'Walmart',
    customer: `Walmart Customer ${i + 1}`,
    email: `walmart${i + 1}@example.com`,
    phone: `+1-555-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    status: ['Awaiting Payment', 'On Hold', 'Awaiting Shipment', 'Pending Fulfillment', 'Shipped', 'Cancelled'][Math.floor(Math.random() * 6)],
    priority: ['Low', 'Medium', 'High', 'Urgent'][Math.floor(Math.random() * 4)],
    orderDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    total: Math.floor(Math.random() * 1200) + 40,
    fulfillmentType: ['Warehouse', 'Store', 'Drop Ship'][Math.floor(Math.random() * 3)],
    assignee: ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Lisa Chen'][Math.floor(Math.random() * 4)],
    tags: ['VIP', 'New Customer', 'Returning', 'High Value'].slice(0, Math.floor(Math.random() * 3) + 1),
    profit: Math.floor(Math.random() * 250) + 25,
    risk: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
    shippingAddress: {
      street: `${Math.floor(Math.random() * 9999) + 1} Pine St`,
      city: ['Dallas', 'San Francisco', 'Philadelphia', 'Detroit', 'Portland'][Math.floor(Math.random() * 5)],
      state: ['TX', 'CA', 'PA', 'MI', 'OR'][Math.floor(Math.random() * 5)],
      zip: String(Math.floor(Math.random() * 90000) + 10000),
      country: 'USA'
    },
    items: [
      {
        sku: `WMT-SKU-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`,
        name: `Walmart Product ${Math.floor(Math.random() * 100) + 1}`,
        quantity: Math.floor(Math.random() * 4) + 1,
        price: Math.floor(Math.random() * 120) + 12,
        available: Math.floor(Math.random() * 60) + 15
      }
    ]
  }))
];

const OrdersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedFulfillment, setSelectedFulfillment] = useState<string>('all');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<string>('orderDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<any>(null);

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let filtered = mockOrders.filter(order => {
      const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMarketplace = selectedMarketplace === 'all' || order.marketplace === selectedMarketplace;
      const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || order.priority === selectedPriority;
      const matchesFulfillment = selectedFulfillment === 'all' || order.fulfillmentType === selectedFulfillment;
      
      return matchesSearch && matchesMarketplace && matchesStatus && matchesPriority && matchesFulfillment;
    });

    // Sort orders
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'orderDate':
          aValue = a.orderDate;
          bValue = b.orderDate;
          break;
        case 'total':
          aValue = a.total;
          bValue = b.total;
          break;
        case 'priority':
          const priorityOrder = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
          break;
        case 'profit':
          aValue = a.profit;
          bValue = b.profit;
          break;
        default:
          aValue = a.orderDate;
          bValue = b.orderDate;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [searchTerm, selectedMarketplace, selectedStatus, selectedPriority, selectedFulfillment, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredOrders.length;
    const totalValue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalProfit = filteredOrders.reduce((sum, order) => sum + order.profit, 0);
    const avgOrderValue = total > 0 ? totalValue / total : 0;
    
    const byMarketplace = {
      Amazon: filteredOrders.filter(o => o.marketplace === 'Amazon').length,
      eBay: filteredOrders.filter(o => o.marketplace === 'eBay').length,
      Walmart: filteredOrders.filter(o => o.marketplace === 'Walmart').length
    };
    
    const byStatus = {
      'Awaiting Payment': filteredOrders.filter(o => o.status === 'Awaiting Payment').length,
      'On Hold': filteredOrders.filter(o => o.status === 'On Hold').length,
      'Awaiting Shipment': filteredOrders.filter(o => o.status === 'Awaiting Shipment').length,
      'Pending Fulfillment': filteredOrders.filter(o => o.status === 'Pending Fulfillment').length,
      'Shipped': filteredOrders.filter(o => o.status === 'Shipped').length,
      'Cancelled': filteredOrders.filter(o => o.status === 'Cancelled').length
    };

    return { total, totalValue, totalProfit, avgOrderValue, byMarketplace, byStatus };
  }, [filteredOrders]);

  const toggleOrderSelection = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const toggleAllOrders = () => {
    if (selectedOrders.size === paginatedOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(paginatedOrders.map(o => o.id)));
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
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

  const openOrderDetailsModal = (order: any) => {
    setSelectedOrderForDetails(order);
    setIsOrderDetailsModalOpen(true);
  };

  const closeOrderDetailsModal = () => {
    setIsOrderDetailsModalOpen(false);
    setSelectedOrderForDetails(null);
  };

  const handleVendorSelect = (orderId: string, itemId: string, vendorId: string) => {
    console.log(`Vendor selected for order ${orderId}, item ${itemId}: ${vendorId}`);
    // In real app, this would update the order with selected vendor
  };

  const handleOrderUpdate = (orderId: string, updates: any) => {
    console.log(`Order ${orderId} updated:`, updates);
    // In real app, this would update the order in the database
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
          <p className="text-muted-foreground">
            Efficient order processing across all channels with omnichannel fulfillment
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.byMarketplace.Amazon} Amazon • {stats.byMarketplace.eBay} eBay • {stats.byMarketplace.Walmart} Walmart
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg: ${stats.avgOrderValue.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Margin: {stats.totalValue > 0 ? ((stats.totalProfit / stats.totalValue) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Awaiting Shipment</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byStatus['Awaiting Shipment']}</div>
            <p className="text-xs text-muted-foreground">
              {stats.byStatus['Pending Fulfillment']} pending fulfillment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Order Filters</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedOrders(new Set())}>
                Clear Selection ({selectedOrders.size})
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Save Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders, customers, emails..."
                  value={searchTerm}
                  onChange={(e: any) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedMarketplace} onValueChange={setSelectedMarketplace}>
              <option value="all">All Marketplaces</option>
              <option value="Amazon">Amazon</option>
              <option value="eBay">eBay</option>
              <option value="Walmart">Walmart</option>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <option value="all">All Statuses</option>
              <option value="Awaiting Payment">Awaiting Payment</option>
              <option value="On Hold">On Hold</option>
              <option value="Awaiting Shipment">Awaiting Shipment</option>
              <option value="Pending Fulfillment">Pending Fulfillment</option>
              <option value="Shipped">Shipped</option>
              <option value="Cancelled">Cancelled</option>
            </Select>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <option value="all">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </Select>
            <Select value={selectedFulfillment} onValueChange={setSelectedFulfillment}>
              <option value="all">All Types</option>
              <option value="Warehouse">Warehouse</option>
              <option value="Store">Store</option>
              <option value="Drop Ship">Drop Ship</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedOrders.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">
                  {selectedOrders.size} order{selectedOrders.size !== 1 ? 's' : ''} selected
                </span>
                <Button variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Labels
                </Button>
                <Button variant="outline" size="sm">
                  <Truck className="h-4 w-4 mr-2" />
                  Bulk Ship
                </Button>
                <Button variant="outline" size="sm">
                  <Tag className="h-4 w-4 mr-2" />
                  Add Tags
                </Button>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Assign
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedOrders(new Set())}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Orders ({filteredOrders.length.toLocaleString()})</CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <option value="orderDate">Order Date</option>
                <option value="total">Total Value</option>
                <option value="priority">Priority</option>
                <option value="profit">Profit</option>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
              <Select value={pageSize.toString()} onValueChange={(value: any) => setPageSize(Number(value))}>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 rounded-lg font-medium text-sm">
              <div className="col-span-1">
                <Checkbox
                  checked={selectedOrders.size === paginatedOrders.length && paginatedOrders.length > 0}
                  onCheckedChange={toggleAllOrders}
                />
              </div>
              <div className="col-span-2">Order ID</div>
              <div className="col-span-2">Customer</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Priority</div>
              <div className="col-span-1">Total</div>
              <div className="col-span-1">Profit</div>
              <div className="col-span-1">Marketplace</div>
              <div className="col-span-1">Fulfillment</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Orders */}
            {paginatedOrders.map((order) => (
              <div key={order.id} className="space-y-2">
                {/* Main Order Row */}
                <div className="grid grid-cols-12 gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="col-span-1">
                    <Checkbox
                      checked={selectedOrders.has(order.id)}
                      onCheckedChange={() => toggleOrderSelection(order.id)}
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="font-medium">{order.id}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.orderDate.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="font-medium">{order.customer}</div>
                    <div className="text-sm text-muted-foreground">{order.email}</div>
                  </div>
                  <div className="col-span-1">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="col-span-1">
                    <Badge className={getPriorityColor(order.priority)}>
                      {order.priority}
                    </Badge>
                  </div>
                  <div className="col-span-1">
                    <div className="font-medium">${order.total}</div>
                    <div className="text-sm text-muted-foreground">{order.items.length} items</div>
                  </div>
                  <div className="col-span-1">
                    <div className="font-medium text-green-600">${order.profit}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.total > 0 ? ((order.profit / order.total) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                  <div className="col-span-1">
                    <div className="flex items-center space-x-1">
                      {order.marketplace === 'Amazon' && <Globe className="h-4 w-4 text-orange-500" />}
                      {order.marketplace === 'eBay' && <Store className="h-4 w-4 text-blue-500" />}
                      {order.marketplace === 'Walmart' && <Package className="h-4 w-4 text-green-500" />}
                      <span className="text-sm">{order.marketplace}</span>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <Badge variant="outline">
                      {order.fulfillmentType}
                    </Badge>
                  </div>
                  <div className="col-span-1">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleOrderExpansion(order.id)}
                      >
                        {expandedOrders.has(order.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openOrderDetailsModal(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded Order Details */}
                {expandedOrders.has(order.id) && (
                  <div className="ml-8 p-4 border-l-2 border-muted bg-muted/20 rounded-r-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Order Details */}
                      <div className="space-y-3">
                        <h4 className="font-medium">Order Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Assignee:</span>
                            <span>{order.assignee}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Risk Level:</span>
                            <Badge className={getRiskColor(order.risk)}>
                              {order.risk}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tags:</span>
                            <div className="flex space-x-1">
                              {order.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="space-y-3">
                        <h4 className="font-medium">Shipping Address</h4>
                        <div className="text-sm space-y-1">
                          <div>{order.shippingAddress.street}</div>
                          <div>
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                          </div>
                          <div>{order.shippingAddress.country}</div>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-3">
                        <h4 className="font-medium">Items ({order.items.length})</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="text-sm p-2 bg-background rounded border">
                              <div className="flex justify-between">
                                <span className="font-medium">{item.sku}</span>
                                <span>Qty: {item.quantity}</span>
                              </div>
                              <div className="text-muted-foreground">{item.name}</div>
                              <div className="flex justify-between text-xs">
                                <span>${item.price} each</span>
                                <span className={item.available < item.quantity ? 'text-red-600' : 'text-green-600'}>
                                  {item.available} available
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex items-center space-x-2">
                      <Button size="sm" onClick={() => openOrderDetailsModal(order)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Printer className="h-4 w-4 mr-2" />
                        Print Label
                      </Button>
                      <Button size="sm" variant="outline">
                        <Truck className="h-4 w-4 mr-2" />
                        Ship Now
                      </Button>
                      <Button size="sm" variant="outline">
                        <Tag className="h-4 w-4 mr-2" />
                        Add Tags
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, filteredOrders.length)} of {filteredOrders.length} orders
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {selectedOrderForDetails && (
        <OrderDetailsModal
          order={selectedOrderForDetails}
          isOpen={isOrderDetailsModalOpen}
          onClose={closeOrderDetailsModal}
          onVendorSelect={handleVendorSelect}
          onOrderUpdate={handleOrderUpdate}
        />
      )}
    </div>
  );
};

export default OrdersPage; 