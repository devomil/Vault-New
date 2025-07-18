import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  BarChart3,
  Filter,
  Search,
  Plus,
  Edit,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Percent,
  Zap
} from 'lucide-react';

interface PricingStrategy {
  id: string;
  name: string;
  type: 'cost-plus' | 'competitor-based' | 'value-based' | 'dynamic';
  margin: number;
  minPrice: number;
  maxPrice: number;
  status: 'active' | 'inactive' | 'draft';
  rules: Array<{
    id: string;
    condition: string;
    action: string;
    priority: number;
  }>;
}

interface ProductPricing {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  category: string;
  currentPrice: number;
  cost: number;
  margin: number;
  strategy: string;
  competitors: Array<{
    name: string;
    price: number;
    lastUpdated: string;
    difference: number;
  }>;
  priceHistory: Array<{
    date: string;
    price: number;
    reason: string;
  }>;
  recommendations: Array<{
    type: 'increase' | 'decrease' | 'maintain';
    reason: string;
    confidence: number;
    suggestedPrice: number;
  }>;
}

// Mock data for development
const mockPricingStrategies: PricingStrategy[] = [
  {
    id: '1',
    name: 'Electronics Premium',
    type: 'value-based',
    margin: 35,
    minPrice: 50,
    maxPrice: 500,
    status: 'active',
    rules: [
      { id: '1', condition: 'Competitor price < 90% of ours', action: 'Decrease by 5%', priority: 1 },
      { id: '2', condition: 'Stock level < 10', action: 'Increase by 3%', priority: 2 },
      { id: '3', condition: 'Demand trend > 15%', action: 'Increase by 2%', priority: 3 }
    ]
  },
  {
    id: '2',
    name: 'Tools Competitive',
    type: 'competitor-based',
    margin: 25,
    minPrice: 20,
    maxPrice: 200,
    status: 'active',
    rules: [
      { id: '4', condition: 'Competitor price changes', action: 'Match within 24h', priority: 1 },
      { id: '5', condition: 'Seasonal demand', action: 'Adjust by 10%', priority: 2 }
    ]
  }
];

const mockProductPricing: ProductPricing[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Widget Pro X1',
    sku: 'WPX1-001',
    category: 'Electronics',
    currentPrice: 299.99,
    cost: 180.00,
    margin: 40.0,
    strategy: 'Electronics Premium',
    competitors: [
      { name: 'Competitor A', price: 285.00, lastUpdated: '2024-01-20', difference: -5.0 },
      { name: 'Competitor B', price: 310.00, lastUpdated: '2024-01-19', difference: 3.3 },
      { name: 'Competitor C', price: 275.00, lastUpdated: '2024-01-21', difference: -8.3 }
    ],
    priceHistory: [
      { date: '2024-01-15', price: 295.99, reason: 'Competitor price adjustment' },
      { date: '2024-01-10', price: 299.99, reason: 'Regular pricing update' },
      { date: '2024-01-05', price: 305.99, reason: 'Cost increase' }
    ],
    recommendations: [
      { type: 'decrease', reason: 'Competitor A is 5% lower', confidence: 85, suggestedPrice: 284.99 },
      { type: 'maintain', reason: 'Current margin is optimal', confidence: 70, suggestedPrice: 299.99 }
    ]
  },
  {
    id: '2',
    productId: '2',
    productName: 'Gadget Plus Pro',
    sku: 'GPP-002',
    category: 'Electronics',
    currentPrice: 199.99,
    cost: 120.00,
    margin: 40.0,
    strategy: 'Electronics Premium',
    competitors: [
      { name: 'Competitor D', price: 185.00, lastUpdated: '2024-01-20', difference: -7.5 },
      { name: 'Competitor E', price: 210.00, lastUpdated: '2024-01-18', difference: 5.0 }
    ],
    priceHistory: [
      { date: '2024-01-18', price: 199.99, reason: 'Strategy update' },
      { date: '2024-01-12', price: 195.99, reason: 'Promotional pricing' }
    ],
    recommendations: [
      { type: 'decrease', reason: 'Competitor D is 7.5% lower', confidence: 90, suggestedPrice: 184.99 },
      { type: 'increase', reason: 'High demand trend', confidence: 65, suggestedPrice: 209.99 }
    ]
  }
];

const PricingCard = ({ product }: { product: ProductPricing }) => {
  const avgCompetitorPrice = product.competitors.reduce((sum, c) => sum + c.price, 0) / product.competitors.length;
  const pricePosition = product.currentPrice < avgCompetitorPrice ? 'below' : 'above';
  const topRecommendation = product.recommendations[0];

  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{product.productName}</h3>
          <p className="text-sm text-gray-500">SKU: {product.sku}</p>
          <p className="text-sm text-gray-500">{product.category}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-100 rounded-full">
            <DollarSign className="h-4 w-4 text-indigo-600" />
          </div>
          <span className="text-sm font-medium">{product.strategy}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Current Price</p>
          <p className="text-lg font-bold text-gray-900">${product.currentPrice}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Margin</p>
          <p className="text-lg font-bold text-green-600">{product.margin}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Avg Competitor</p>
          <p className="text-lg font-bold text-gray-900">${avgCompetitorPrice.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Position</p>
          <p className={`text-lg font-bold ${pricePosition === 'below' ? 'text-green-600' : 'text-red-600'}`}>
            {pricePosition === 'below' ? 'Below' : 'Above'} Market
          </p>
        </div>
      </div>

      {/* Top Recommendation */}
      {topRecommendation && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">Top Recommendation</span>
            <span className="text-sm text-gray-500">{topRecommendation.confidence}% confidence</span>
          </div>
          <div className="flex items-center space-x-2">
            {topRecommendation.type === 'increase' && <TrendingUp className="h-4 w-4 text-green-600" />}
            {topRecommendation.type === 'decrease' && <TrendingDown className="h-4 w-4 text-red-600" />}
            {topRecommendation.type === 'maintain' && <CheckCircle className="h-4 w-4 text-blue-600" />}
            <span className="text-sm text-gray-700">{topRecommendation.reason}</span>
          </div>
          <div className="mt-2 flex items-center space-x-4">
            <span className="text-sm text-gray-600">Suggested: ${topRecommendation.suggestedPrice}</span>
            <span className={`text-sm font-medium ${
              topRecommendation.type === 'increase' ? 'text-green-600' : 
              topRecommendation.type === 'decrease' ? 'text-red-600' : 'text-blue-600'
            }`}>
              {topRecommendation.type === 'increase' ? '+' : 
               topRecommendation.type === 'decrease' ? '-' : ''}
              ${Math.abs(topRecommendation.suggestedPrice - product.currentPrice).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
            <Eye className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
            <Edit className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
            <Zap className="h-4 w-4" />
          </button>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Last Updated</p>
          <p className="text-sm font-medium text-gray-900">
            {product.priceHistory[0]?.date || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

const StrategyCard = ({ strategy }: { strategy: PricingStrategy }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{strategy.name}</h3>
          <p className="text-sm text-gray-500 capitalize">{strategy.type.replace('-', ' ')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            strategy.status === 'active' ? 'bg-green-100 text-green-800' :
            strategy.status === 'inactive' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {strategy.status}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Margin</p>
          <p className="text-lg font-bold text-green-600">{strategy.margin}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Min Price</p>
          <p className="text-lg font-bold text-gray-900">${strategy.minPrice}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Max Price</p>
          <p className="text-lg font-bold text-gray-900">${strategy.maxPrice}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium text-gray-900 mb-2">Rules ({strategy.rules.length})</p>
        <div className="space-y-2">
          {strategy.rules.slice(0, 2).map((rule) => (
            <div key={rule.id} className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span className="text-gray-700">{rule.condition}</span>
            </div>
          ))}
          {strategy.rules.length > 2 && (
            <p className="text-sm text-gray-500">+{strategy.rules.length - 2} more rules</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
            <Edit className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
            <Eye className="h-4 w-4" />
          </button>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Priority</p>
          <p className="text-sm font-medium text-gray-900">High</p>
        </div>
      </div>
    </div>
  );
};

const PricingStats = ({ products }: { products: ProductPricing[] }) => {
  const totalProducts = products.length;
  const avgMargin = products.reduce((sum, p) => sum + p.margin, 0) / products.length;
  const productsBelowMarket = products.filter(p => {
    const avgCompetitor = p.competitors.reduce((sum, c) => sum + c.price, 0) / p.competitors.length;
    return p.currentPrice < avgCompetitor;
  }).length;
  const recommendationsCount = products.reduce((sum, p) => sum + p.recommendations.length, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-full">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Products</p>
            <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 rounded-full">
            <Percent className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Avg Margin</p>
            <p className="text-2xl font-bold text-gray-900">{avgMargin.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 bg-yellow-100 rounded-full">
            <TrendingDown className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Below Market</p>
            <p className="text-2xl font-bold text-gray-900">{productsBelowMarket}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 rounded-full">
            <Zap className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Recommendations</p>
            <p className="text-2xl font-bold text-gray-900">{recommendationsCount}</p>
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
  const [selectedStrategy, setSelectedStrategy] = useState('all');

  const categories = ['all', 'Electronics', 'Tools', 'Accessories', 'Software'];
  const strategies = ['all', 'Electronics Premium', 'Tools Competitive'];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleFilter = () => {
    onFilter({
      category: selectedCategory,
      strategy: selectedStrategy
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
              placeholder="Search pricing..."
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

        {/* Strategy Filter */}
        <select
          value={selectedStrategy}
          onChange={(e) => setSelectedStrategy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {strategies.map(strategy => (
            <option key={strategy} value={strategy}>
              {strategy === 'all' ? 'All Strategies' : strategy}
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

        {/* Add Strategy */}
        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
          <Plus className="h-4 w-4 inline mr-2" />
          Add Strategy
        </button>
      </div>
    </div>
  );
};

export default function PricingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ category: 'all', strategy: 'all' });

  // Mock queries - in real app these would connect to pricing-engine service
  const { data: products = mockProductPricing, isLoading: productsLoading } = useQuery({
    queryKey: ['pricing-products', searchQuery, filters],
    queryFn: () => Promise.resolve(mockProductPricing),
    staleTime: 5 * 60 * 1000,
  });

  const { data: strategies = mockPricingStrategies, isLoading: strategiesLoading } = useQuery({
    queryKey: ['pricing-strategies'],
    queryFn: () => Promise.resolve(mockPricingStrategies),
    staleTime: 5 * 60 * 1000,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (newFilters: any) => {
    setFilters(newFilters);
  };

  const isLoading = productsLoading || strategiesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading pricing data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pricing Engine</h1>
        <p className="text-gray-600">Manage pricing strategies and track competitor prices</p>
      </div>

      {/* Stats Overview */}
      <PricingStats products={products} />

      {/* Filter Bar */}
      <FilterBar onSearch={handleSearch} onFilter={handleFilter} />

      {/* Pricing Strategies */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing Strategies</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {strategies.map((strategy) => (
            <StrategyCard key={strategy.id} strategy={strategy} />
          ))}
        </div>
      </div>

      {/* Product Pricing */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Pricing</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((product) => (
            <PricingCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pricing data found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
} 