import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Store, 
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
  ShoppingCart,
  Globe,
  Zap,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface Marketplace {
  id: string;
  name: string;
  type: 'amazon' | 'ebay' | 'walmart';
  status: 'connected' | 'disconnected' | 'error';
  revenue: number;
  orders: number;
  products: number;
  growth: number;
  lastSync: string;
  performance: {
    conversionRate: number;
    avgOrderValue: number;
    customerRating: number;
  };
}

interface Listing {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  marketplace: string;
  marketplaceId: string;
  price: number;
  status: 'active' | 'inactive' | 'pending' | 'error';
  inventory: number;
  views: number;
  sales: number;
  revenue: number;
  lastUpdated: string;
  performance: {
    rank: number;
    rating: number;
    reviews: number;
  };
}

// Mock data for development
const mockMarketplaces: Marketplace[] = [
  {
    id: '1',
    name: 'Amazon',
    type: 'amazon',
    status: 'connected',
    revenue: 75000,
    orders: 450,
    products: 45,
    growth: 12.5,
    lastSync: '2024-01-21 14:30',
    performance: {
      conversionRate: 3.2,
      avgOrderValue: 166.67,
      customerRating: 4.5
    }
  },
  {
    id: '2',
    name: 'eBay',
    type: 'ebay',
    status: 'connected',
    revenue: 35000,
    orders: 280,
    products: 38,
    growth: 8.3,
    lastSync: '2024-01-21 13:45',
    performance: {
      conversionRate: 2.8,
      avgOrderValue: 125.00,
      customerRating: 4.2
    }
  },
  {
    id: '3',
    name: 'Walmart',
    type: 'walmart',
    status: 'connected',
    revenue: 15000,
    orders: 95,
    products: 22,
    growth: 15.7,
    lastSync: '2024-01-21 12:15',
    performance: {
      conversionRate: 4.1,
      avgOrderValue: 157.89,
      customerRating: 4.7
    }
  }
];

const mockListings: Listing[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Widget Pro X1',
    sku: 'WPX1-001',
    marketplace: 'Amazon',
    marketplaceId: 'B08ABC123',
    price: 299.99,
    status: 'active',
    inventory: 45,
    views: 1250,
    sales: 150,
    revenue: 44998.50,
    lastUpdated: '2024-01-21 14:30',
    performance: {
      rank: 3,
      rating: 4.2,
      reviews: 89
    }
  },
  {
    id: '2',
    productId: '1',
    productName: 'Widget Pro X1',
    sku: 'WPX1-001',
    marketplace: 'eBay',
    marketplaceId: '123456789',
    price: 285.00,
    status: 'active',
    inventory: 45,
    views: 890,
    sales: 120,
    revenue: 34200.00,
    lastUpdated: '2024-01-21 13:45',
    performance: {
      rank: 5,
      rating: 4.0,
      reviews: 67
    }
  },
  {
    id: '3',
    productId: '2',
    productName: 'Gadget Plus Pro',
    sku: 'GPP-002',
    marketplace: 'Amazon',
    marketplaceId: 'B08DEF456',
    price: 199.99,
    status: 'active',
    inventory: 12,
    views: 980,
    sales: 120,
    revenue: 23998.80,
    lastUpdated: '2024-01-21 14:30',
    performance: {
      rank: 7,
      rating: 4.5,
      reviews: 156
    }
  },
  {
    id: '4',
    productId: '3',
    productName: 'Tool Master Deluxe',
    sku: 'TMD-003',
    marketplace: 'Walmart',
    marketplaceId: 'WM123456',
    price: 89.99,
    status: 'active',
    inventory: 8,
    views: 650,
    sales: 95,
    revenue: 8549.05,
    lastUpdated: '2024-01-21 12:15',
    performance: {
      rank: 12,
      rating: 3.8,
      reviews: 34
    }
  }
];

const MarketplaceCard = ({ marketplace }: { marketplace: Marketplace }) => {
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

  const getMarketplaceIcon = (type: string) => {
    switch (type) {
      case 'amazon': return <Globe className="h-6 w-6 text-orange-600" />;
      case 'ebay': return <ShoppingCart className="h-6 w-6 text-blue-600" />;
      case 'walmart': return <Store className="h-6 w-6 text-blue-500" />;
      default: return <Store className="h-6 w-6 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          {getMarketplaceIcon(marketplace.type)}
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">{marketplace.name}</h3>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(marketplace.status)}`}>
              {getStatusIcon(marketplace.status)}
              <span className="ml-1 capitalize">{marketplace.status}</span>
            </div>
          </div>
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Revenue</p>
          <p className="text-lg font-bold text-gray-900">${marketplace.revenue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Orders</p>
          <p className="text-lg font-bold text-gray-900">{marketplace.orders}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Products</p>
          <p className="text-lg font-bold text-gray-900">{marketplace.products}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Growth</p>
          <p className={`text-lg font-bold ${marketplace.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {marketplace.growth >= 0 ? '+' : ''}{marketplace.growth}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Conv. Rate</p>
          <p className="text-sm font-bold text-gray-900">{marketplace.performance.conversionRate}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Avg Order</p>
          <p className="text-sm font-bold text-gray-900">${marketplace.performance.avgOrderValue}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Rating</p>
          <p className="text-sm font-bold text-gray-900">{marketplace.performance.customerRating}/5</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Last sync: {marketplace.lastSync}
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

const ListingCard = ({ listing }: { listing: Listing }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <XCircle className="h-4 w-4" />;
      case 'pending': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <XCircle className="h-4 w-4" />;
    }
  };

  const getMarketplaceIcon = (marketplace: string) => {
    switch (marketplace.toLowerCase()) {
      case 'amazon': return <Globe className="h-4 w-4 text-orange-600" />;
      case 'ebay': return <ShoppingCart className="h-4 w-4 text-blue-600" />;
      case 'walmart': return <Store className="h-4 w-4 text-blue-500" />;
      default: return <Store className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{listing.productName}</h3>
          <p className="text-sm text-gray-500">SKU: {listing.sku}</p>
          <div className="flex items-center mt-1">
            {getMarketplaceIcon(listing.marketplace)}
            <span className="ml-1 text-sm text-gray-600">{listing.marketplace}</span>
            <span className="ml-2 text-xs text-gray-400">#{listing.marketplaceId}</span>
          </div>
        </div>
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
          {getStatusIcon(listing.status)}
          <span className="ml-1 capitalize">{listing.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Price</p>
          <p className="text-lg font-bold text-gray-900">${listing.price}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Inventory</p>
          <p className={`text-lg font-bold ${listing.inventory < 10 ? 'text-red-600' : 'text-gray-900'}`}>
            {listing.inventory} units
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Views</p>
          <p className="text-lg font-bold text-gray-900">{listing.views.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Sales</p>
          <p className="text-lg font-bold text-gray-900">{listing.sales}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Revenue</p>
          <p className="text-sm font-bold text-indigo-600">${listing.revenue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Rank</p>
          <p className="text-sm font-bold text-gray-900">#{listing.performance.rank}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Rating</p>
          <p className="text-sm font-bold text-gray-900">{listing.performance.rating}/5</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Updated: {listing.lastUpdated}
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

const MarketplaceStats = ({ marketplaces, listings }: { marketplaces: Marketplace[], listings: Listing[] }) => {
  const totalRevenue = marketplaces.reduce((sum, m) => sum + m.revenue, 0);
  const totalOrders = marketplaces.reduce((sum, m) => sum + m.orders, 0);
  const totalProducts = marketplaces.reduce((sum, m) => sum + m.products, 0);
  const activeListings = listings.filter(l => l.status === 'active').length;

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
            <ShoppingCart className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 rounded-full">
            <Package className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Active Listings</p>
            <p className="text-2xl font-bold text-gray-900">{activeListings}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 bg-orange-100 rounded-full">
            <Store className="h-6 w-6 text-orange-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Marketplaces</p>
            <p className="text-2xl font-bold text-gray-900">{marketplaces.length}</p>
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
  const [selectedMarketplace, setSelectedMarketplace] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const marketplaces = ['all', 'Amazon', 'eBay', 'Walmart'];
  const statuses = ['all', 'active', 'inactive', 'pending', 'error'];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleFilter = () => {
    onFilter({
      marketplace: selectedMarketplace,
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
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </form>

        {/* Marketplace Filter */}
        <select
          value={selectedMarketplace}
          onChange={(e) => setSelectedMarketplace(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {marketplaces.map(marketplace => (
            <option key={marketplace} value={marketplace}>
              {marketplace === 'all' ? 'All Marketplaces' : marketplace}
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

        {/* Add Listing */}
        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
          <Plus className="h-4 w-4 inline mr-2" />
          Add Listing
        </button>
      </div>
    </div>
  );
};

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ marketplace: 'all', status: 'all' });

  // Mock queries - in real app these would connect to marketplace-integration service
  const { data: marketplaces = mockMarketplaces, isLoading: marketplacesLoading } = useQuery({
    queryKey: ['marketplaces'],
    queryFn: () => Promise.resolve(mockMarketplaces),
    staleTime: 5 * 60 * 1000,
  });

  const { data: listings = mockListings, isLoading: listingsLoading } = useQuery({
    queryKey: ['listings', searchQuery, filters],
    queryFn: () => Promise.resolve(mockListings),
    staleTime: 5 * 60 * 1000,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (newFilters: any) => {
    setFilters(newFilters);
  };

  const isLoading = marketplacesLoading || listingsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading marketplace data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketplace Integration</h1>
        <p className="text-gray-600">Manage your multi-marketplace presence and listings</p>
      </div>

      {/* Stats Overview */}
      <MarketplaceStats marketplaces={marketplaces} listings={listings} />

      {/* Marketplace Connections */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Marketplace Connections</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {marketplaces.map((marketplace) => (
            <MarketplaceCard key={marketplace.id} marketplace={marketplace} />
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar onSearch={handleSearch} onFilter={handleFilter} />

      {/* Listings */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Listings</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>

      {listings.length === 0 && (
        <div className="text-center py-12">
          <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
} 