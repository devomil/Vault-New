import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Warehouse, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Package,
  Truck,
  Clock,
  DollarSign,
  BarChart3,
  Filter,
  Search,
  Plus,
  RefreshCw
} from 'lucide-react';

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  reorderPoint: number;
  maxStock: number;
  unitCost: number;
  totalValue: number;
  supplier: string;
  leadTime: number;
  lastRestocked: string;
  nextRestockDate: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstocked';
  forecast: {
    demand: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    confidence: number;
  };
}

// Mock data for development
const mockInventory: InventoryItem[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Widget Pro X1',
    sku: 'WPX1-001',
    category: 'Electronics',
    currentStock: 45,
    reorderPoint: 20,
    maxStock: 100,
    unitCost: 180.00,
    totalValue: 8100.00,
    supplier: 'Tech Supplies Inc',
    leadTime: 7,
    lastRestocked: '2024-01-15',
    nextRestockDate: '2024-01-22',
    status: 'in-stock',
    forecast: {
      demand: 15,
      trend: 'increasing',
      confidence: 85
    }
  },
  {
    id: '2',
    productId: '2',
    productName: 'Gadget Plus Pro',
    sku: 'GPP-002',
    category: 'Electronics',
    currentStock: 12,
    reorderPoint: 15,
    maxStock: 80,
    unitCost: 120.00,
    totalValue: 1440.00,
    supplier: 'Gadget World',
    leadTime: 5,
    lastRestocked: '2024-01-18',
    nextRestockDate: '2024-01-23',
    status: 'low-stock',
    forecast: {
      demand: 8,
      trend: 'stable',
      confidence: 75
    }
  },
  {
    id: '3',
    productId: '3',
    productName: 'Tool Master Deluxe',
    sku: 'TMD-003',
    category: 'Tools',
    currentStock: 8,
    reorderPoint: 10,
    maxStock: 50,
    unitCost: 55.00,
    totalValue: 440.00,
    supplier: 'Tool Supply Co',
    leadTime: 3,
    lastRestocked: '2024-01-20',
    nextRestockDate: '2024-01-23',
    status: 'low-stock',
    forecast: {
      demand: 5,
      trend: 'decreasing',
      confidence: 60
    }
  },
  {
    id: '4',
    productId: '4',
    productName: 'Smart Device Pro',
    sku: 'SDP-004',
    category: 'Electronics',
    currentStock: 0,
    reorderPoint: 5,
    maxStock: 60,
    unitCost: 95.00,
    totalValue: 0.00,
    supplier: 'Smart Tech Ltd',
    leadTime: 10,
    lastRestocked: '2024-01-10',
    nextRestockDate: '2024-01-25',
    status: 'out-of-stock',
    forecast: {
      demand: 12,
      trend: 'increasing',
      confidence: 90
    }
  }
];

const InventoryCard = ({ item }: { item: InventoryItem }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'border-green-500 bg-green-50';
      case 'low-stock': return 'border-yellow-500 bg-yellow-50';
      case 'out-of-stock': return 'border-red-500 bg-red-50';
      case 'overstocked': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-stock': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'low-stock': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'out-of-stock': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'overstocked': return <TrendingDown className="h-4 w-4 text-blue-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const stockPercentage = (item.currentStock / item.maxStock) * 100;
  const daysUntilReorder = Math.ceil((item.reorderPoint - item.currentStock) / item.forecast.demand);

  return (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${getStatusColor(item.status)}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{item.productName}</h3>
          <p className="text-sm text-gray-500">SKU: {item.sku}</p>
          <p className="text-sm text-gray-500">{item.category}</p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(item.status)}
          <span className="text-sm font-medium capitalize">{item.status.replace('-', ' ')}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Current Stock</p>
          <p className={`text-lg font-bold ${item.status === 'low-stock' || item.status === 'out-of-stock' ? 'text-red-600' : 'text-gray-900'}`}>
            {item.currentStock} units
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Reorder Point</p>
          <p className="text-lg font-bold text-gray-900">{item.reorderPoint} units</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Value</p>
          <p className="text-lg font-bold text-indigo-600">${item.totalValue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Unit Cost</p>
          <p className="text-lg font-bold text-gray-900">${item.unitCost}</p>
        </div>
      </div>

      {/* Stock Level Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Stock Level</span>
          <span>{stockPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              stockPercentage > 50 ? 'bg-green-500' : 
              stockPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(stockPercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Supplier</p>
          <p className="text-sm font-medium text-gray-900">{item.supplier}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Lead Time</p>
          <p className="text-sm font-medium text-gray-900">{item.leadTime} days</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {item.status === 'low-stock' && (
            <span className="text-yellow-600 font-medium">
              Reorder in ~{daysUntilReorder} days
            </span>
          )}
          {item.status === 'out-of-stock' && (
            <span className="text-red-600 font-medium">
              Restock on {item.nextRestockDate}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
            <Truck className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const InventoryStats = ({ inventory }: { inventory: InventoryItem[] }) => {
  const totalItems = inventory.length;
  const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockItems = inventory.filter(item => item.status === 'low-stock').length;
  const outOfStockItems = inventory.filter(item => item.status === 'out-of-stock').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-full">
            <Warehouse className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Items</p>
            <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 rounded-full">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Value</p>
            <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 bg-yellow-100 rounded-full">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Low Stock</p>
            <p className="text-2xl font-bold text-gray-900">{lowStockItems}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Out of Stock</p>
            <p className="text-2xl font-bold text-gray-900">{outOfStockItems}</p>
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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const categories = ['all', 'Electronics', 'Tools', 'Accessories', 'Software'];
  const statuses = ['all', 'in-stock', 'low-stock', 'out-of-stock', 'overstocked'];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleFilter = () => {
    onFilter({
      category: selectedCategory,
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
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </form>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
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
              {status === 'all' ? 'All Status' : status.replace('-', ' ')}
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

        {/* Add Item */}
        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
          <Plus className="h-4 w-4 inline mr-2" />
          Add Item
        </button>
      </div>
    </div>
  );
};

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ category: 'all', status: 'all' });

  // Mock query - in real app this would connect to inventory-management service
  const { data: inventory = mockInventory, isLoading } = useQuery({
    queryKey: ['inventory', searchQuery, filters],
    queryFn: () => Promise.resolve(mockInventory),
    staleTime: 5 * 60 * 1000,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (newFilters: any) => {
    setFilters(newFilters);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading inventory...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-600">Monitor stock levels, track suppliers, and manage reorders</p>
      </div>

      {/* Stats Overview */}
      <InventoryStats inventory={inventory} />

      {/* Filter Bar */}
      <FilterBar onSearch={handleSearch} onFilter={handleFilter} />

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {inventory.map((item) => (
          <InventoryCard key={item.id} item={item} />
        ))}
      </div>

      {inventory.length === 0 && (
        <div className="text-center py-12">
          <Warehouse className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
} 