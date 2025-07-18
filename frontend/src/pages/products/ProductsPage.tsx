import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  TrendingUp, 
  Package,
  DollarSign,
  BarChart3,
  Star,
  AlertTriangle
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  margin: number;
  stock: number;
  reorderPoint: number;
  performance: {
    revenue: number;
    orders: number;
    growth: number;
    rating: number;
  };
  competitors: Array<{
    name: string;
    price: number;
    rating: number;
  }>;
  status: 'active' | 'inactive' | 'discontinued';
}

// Mock data for development
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Widget Pro X1',
    sku: 'WPX1-001',
    category: 'Electronics',
    price: 299.99,
    cost: 180.00,
    margin: 40.0,
    stock: 45,
    reorderPoint: 20,
    performance: {
      revenue: 25000,
      orders: 150,
      growth: 8.5,
      rating: 4.2
    },
    competitors: [
      { name: 'Competitor A', price: 285.00, rating: 4.0 },
      { name: 'Competitor B', price: 310.00, rating: 4.1 }
    ],
    status: 'active'
  },
  {
    id: '2',
    name: 'Gadget Plus Pro',
    sku: 'GPP-002',
    category: 'Electronics',
    price: 199.99,
    cost: 120.00,
    margin: 40.0,
    stock: 12,
    reorderPoint: 15,
    performance: {
      revenue: 18000,
      orders: 120,
      growth: 12.3,
      rating: 4.5
    },
    competitors: [
      { name: 'Competitor C', price: 185.00, rating: 4.2 },
      { name: 'Competitor D', price: 210.00, rating: 4.3 }
    ],
    status: 'active'
  },
  {
    id: '3',
    name: 'Tool Master Deluxe',
    sku: 'TMD-003',
    category: 'Tools',
    price: 89.99,
    cost: 55.00,
    margin: 38.9,
    stock: 8,
    reorderPoint: 10,
    performance: {
      revenue: 15000,
      orders: 95,
      growth: -1.2,
      rating: 3.8
    },
    competitors: [
      { name: 'Competitor E', price: 95.00, rating: 4.0 },
      { name: 'Competitor F', price: 82.00, rating: 3.7 }
    ],
    status: 'active'
  }
];

const ProductCard = ({ product }: { product: Product }) => {
  const isLowStock = product.stock <= product.reorderPoint;
  const isHighPerformer = product.performance.growth > 10;

  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
          <p className="text-sm text-gray-500">SKU: {product.sku}</p>
          <p className="text-sm text-gray-500">{product.category}</p>
        </div>
        <div className="flex items-center space-x-2">
          {isLowStock && (
            <div className="p-1 bg-red-100 rounded-full">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          )}
          {isHighPerformer && (
            <div className="p-1 bg-green-100 rounded-full">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          )}
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{product.performance.rating}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Price</p>
          <p className="text-lg font-bold text-gray-900">${product.price}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Stock</p>
          <p className={`text-lg font-bold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
            {product.stock} units
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Margin</p>
          <p className="text-lg font-bold text-green-600">{product.margin}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Growth</p>
          <p className={`text-lg font-bold ${product.performance.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.performance.growth >= 0 ? '+' : ''}{product.performance.growth}%
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
            <Eye className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
            <Edit className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Revenue</p>
          <p className="text-lg font-bold text-indigo-600">${product.performance.revenue.toLocaleString()}</p>
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
  const statuses = ['all', 'active', 'inactive', 'discontinued'];

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
              placeholder="Search products..."
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

        {/* Add Product */}
        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
          <Plus className="h-4 w-4 inline mr-2" />
          Add Product
        </button>
      </div>
    </div>
  );
};

const StatsOverview = ({ products }: { products: Product[] }) => {
  const totalRevenue = products.reduce((sum, p) => sum + p.performance.revenue, 0);
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock <= p.reorderPoint).length;
  const avgMargin = products.reduce((sum, p) => sum + p.margin, 0) / products.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
          <div className="p-3 bg-blue-100 rounded-full">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Products</p>
            <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
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
            <p className="text-2xl font-bold text-gray-900">{lowStockProducts}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 rounded-full">
            <BarChart3 className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Avg Margin</p>
            <p className="text-2xl font-bold text-gray-900">{avgMargin.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ category: 'all', status: 'all' });

  // Mock query - in real app this would connect to product-intelligence service
  const { data: products = mockProducts, isLoading } = useQuery({
    queryKey: ['products', searchQuery, filters],
    queryFn: () => Promise.resolve(mockProducts),
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
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-600">Manage your product catalog and track performance</p>
      </div>

      {/* Stats Overview */}
      <StatsOverview products={products} />

      {/* Filter Bar */}
      <FilterBar onSearch={handleSearch} onFilter={handleFilter} />

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
} 