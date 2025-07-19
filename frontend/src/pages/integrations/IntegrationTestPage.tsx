import React, { useState } from 'react';
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Settings,
  Database,
  Globe,
  Truck,
  ShoppingCart,
  CreditCard,
  Key,
  Eye,
  EyeOff,
  RefreshCw,
  Play,
  Download,
  Upload,
  FileText,
  Wifi,
  Server,
  Lock,
  Unlock,
  Zap,
  Clock,
  BarChart3,
  Activity,
  Shield,
  Users,
  Building,
  Plus,
  Trash2,
  Edit,
  Save,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { integrationAPI } from '../../services/api';

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
  errors?: string[];
  timestamp: string;
  duration: number;
}

interface ConnectionTest {
  id: string;
  name: string;
  type: 'marketplace' | 'vendor';
  status: 'idle' | 'testing' | 'success' | 'error';
  result?: TestResult;
}

interface MarketplaceCredentials {
  type: 'amazon' | 'ebay' | 'walmart';
  clientId?: string;
  clientSecret?: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  marketplaceId?: string;
  sellerId?: string;
  endpoint?: string;
}

interface VendorCredentials {
  type: 'api' | 'sftp' | 'edi' | 'webhook';
  name: string;
  description: string;
  authentication: 'oauth2' | 'api_key' | 'basic' | 'sftp_key' | 'edi';
  apiKey?: string;
  apiSecret?: string;
  username?: string;
  password?: string;
  endpoint?: string;
  sftpHost?: string;
  sftpPort?: number;
  sftpUsername?: string;
  sftpPassword?: string;
  sftpPrivateKey?: string;
  sftpInventoryPath?: string;
  sftpCatalogPath?: string;
  ediPartnerId?: string;
  ediSenderId?: string;
  ediReceiverId?: string;
}

const IntegrationTestPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'vendor'>('marketplace');
  const [marketplaceCredentials, setMarketplaceCredentials] = useState<MarketplaceCredentials>({
    type: 'amazon'
  });
  const [vendorCredentials, setVendorCredentials] = useState<VendorCredentials>({
    type: 'api',
    name: '',
    description: '',
    authentication: 'api_key'
  });
  const [testResults, setTestResults] = useState<ConnectionTest[]>([]);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isTesting, setIsTesting] = useState(false);

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleMarketplaceTest = async () => {
    setIsTesting(true);
    const testId = `marketplace-${Date.now()}`;
    
    // Add test to results
    const newTest: ConnectionTest = {
      id: testId,
      name: `${marketplaceCredentials.type.toUpperCase()} Marketplace`,
      type: 'marketplace',
      status: 'testing',
      result: {
        success: false,
        message: 'Testing connection...',
        timestamp: new Date().toISOString(),
        duration: 0
      }
    };
    
    setTestResults(prev => [...prev, newTest]);

    try {
      const startTime = Date.now();
      
            // Test SP-API connection for Amazon
      if (marketplaceCredentials.type === 'amazon') {
        const response = await integrationAPI.testSPAPIConnection({
          clientId: marketplaceCredentials.clientId || '',
          clientSecret: marketplaceCredentials.clientSecret || '',
          refreshToken: marketplaceCredentials.refreshToken || '',
          marketplaceId: marketplaceCredentials.marketplaceId || '',
          sellerId: marketplaceCredentials.sellerId || '',
          region: 'us-east-1',
          environment: 'sandbox'
        });
        
        const result = response.data;
        const duration = Date.now() - startTime;

        const updatedTest: ConnectionTest = {
          ...newTest,
          status: result.success ? 'success' : 'error',
          result: {
            success: result.success,
            message: result.message || 'Connection test completed',
            details: result.data,
            errors: result.error ? [result.error] : undefined,
            timestamp: new Date().toISOString(),
            duration
          }
        };

        setTestResults(prev => 
          prev.map(test => test.id === testId ? updatedTest : test)
        );
      } else {
        // For other marketplaces, use mock response for now
        const duration = Date.now() - startTime;
        const updatedTest: ConnectionTest = {
          ...newTest,
          status: 'error',
          result: {
            success: false,
            message: 'Marketplace type not yet implemented',
            errors: ['Only Amazon SP-API is currently supported'],
            timestamp: new Date().toISOString(),
            duration
          }
        };

        setTestResults(prev => 
          prev.map(test => test.id === testId ? updatedTest : test)
        );
      }

    } catch (error) {
      const duration = Date.now() - Date.now();
      const updatedTest: ConnectionTest = {
        ...newTest,
        status: 'error',
        result: {
          success: false,
          message: 'Connection test failed',
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          timestamp: new Date().toISOString(),
          duration
        }
      };

      setTestResults(prev => 
        prev.map(test => test.id === testId ? updatedTest : test)
      );
    } finally {
      setIsTesting(false);
    }
  };

  const handleVendorTest = async () => {
    setIsTesting(true);
    const testId = `vendor-${Date.now()}`;
    
    const newTest: ConnectionTest = {
      id: testId,
      name: vendorCredentials.name || 'Custom Vendor',
      type: 'vendor',
      status: 'testing',
      result: {
        success: false,
        message: 'Testing connection...',
        timestamp: new Date().toISOString(),
        duration: 0
      }
    };
    
    setTestResults(prev => [...prev, newTest]);

    try {
      const startTime = Date.now();
      
      // Simulate API call to test vendor connection
      const response = await fetch('/api/integration-test/vendor/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credentials: vendorCredentials
        })
      });

      const result = await response.json();
      const duration = Date.now() - startTime;

      const updatedTest: ConnectionTest = {
        ...newTest,
        status: result.success ? 'success' : 'error',
        result: {
          success: result.success,
          message: result.message,
          details: result.details,
          errors: result.errors,
          timestamp: new Date().toISOString(),
          duration
        }
      };

      setTestResults(prev => 
        prev.map(test => test.id === testId ? updatedTest : test)
      );

    } catch (error) {
      const duration = Date.now() - Date.now();
      const updatedTest: ConnectionTest = {
        ...newTest,
        status: 'error',
        result: {
          success: false,
          message: 'Connection test failed',
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          timestamp: new Date().toISOString(),
          duration
        }
      };

      setTestResults(prev => 
        prev.map(test => test.id === testId ? updatedTest : test)
      );
    } finally {
      setIsTesting(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'testing':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'testing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integration Testing</h1>
          <p className="text-gray-600 mt-2">
            Test real marketplace and vendor connections with your credentials
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={clearResults}
            disabled={testResults.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Results
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'marketplace'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ShoppingCart className="w-4 h-4 inline mr-2" />
            Marketplace Integration
          </button>
          <button
            onClick={() => setActiveTab('vendor')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'vendor'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Truck className="w-4 h-4 inline mr-2" />
            Vendor Integration
          </button>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {activeTab === 'marketplace' ? 'Marketplace Credentials' : 'Vendor Configuration'}
              </h2>
              <Settings className="w-5 h-5 text-gray-400" />
            </div>

            {activeTab === 'marketplace' ? (
              <div className="space-y-4">
                {/* Marketplace Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marketplace Type
                  </label>
                  <select
                    value={marketplaceCredentials.type}
                    onChange={(e) => setMarketplaceCredentials(prev => ({
                      ...prev,
                      type: e.target.value as 'amazon' | 'ebay' | 'walmart'
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="amazon">Amazon Seller Central</option>
                    <option value="ebay">eBay Trading API</option>
                    <option value="walmart">Walmart Marketplace</option>
                  </select>
                </div>

                {/* Amazon Credentials */}
                {marketplaceCredentials.type === 'amazon' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client ID
                      </label>
                      <input
                        type="text"
                        value={marketplaceCredentials.clientId || ''}
                        onChange={(e) => setMarketplaceCredentials(prev => ({
                          ...prev,
                          clientId: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter Amazon Client ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client Secret
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.clientSecret ? 'text' : 'password'}
                          value={marketplaceCredentials.clientSecret || ''}
                          onChange={(e) => setMarketplaceCredentials(prev => ({
                            ...prev,
                            clientSecret: e.target.value
                          }))}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter Amazon Client Secret"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('clientSecret')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPasswords.clientSecret ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Refresh Token
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.refreshToken ? 'text' : 'password'}
                          value={marketplaceCredentials.refreshToken || ''}
                          onChange={(e) => setMarketplaceCredentials(prev => ({
                            ...prev,
                            refreshToken: e.target.value
                          }))}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter Amazon Refresh Token"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('refreshToken')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPasswords.refreshToken ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Marketplace ID
                      </label>
                      <input
                        type="text"
                        value={marketplaceCredentials.marketplaceId || ''}
                        onChange={(e) => setMarketplaceCredentials(prev => ({
                          ...prev,
                          marketplaceId: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., ATVPDKIKX0DER"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seller ID
                      </label>
                      <input
                        type="text"
                        value={marketplaceCredentials.sellerId || ''}
                        onChange={(e) => setMarketplaceCredentials(prev => ({
                          ...prev,
                          sellerId: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter Seller ID"
                      />
                    </div>
                  </div>
                )}

                {/* eBay Credentials */}
                {marketplaceCredentials.type === 'ebay' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key
                      </label>
                      <input
                        type="text"
                        value={marketplaceCredentials.apiKey || ''}
                        onChange={(e) => setMarketplaceCredentials(prev => ({
                          ...prev,
                          apiKey: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter eBay API Key"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Secret
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.apiSecret ? 'text' : 'password'}
                          value={marketplaceCredentials.apiSecret || ''}
                          onChange={(e) => setMarketplaceCredentials(prev => ({
                            ...prev,
                            apiSecret: e.target.value
                          }))}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter eBay API Secret"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('apiSecret')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPasswords.apiSecret ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Walmart Credentials */}
                {marketplaceCredentials.type === 'walmart' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client ID
                      </label>
                      <input
                        type="text"
                        value={marketplaceCredentials.clientId || ''}
                        onChange={(e) => setMarketplaceCredentials(prev => ({
                          ...prev,
                          clientId: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter Walmart Client ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client Secret
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.clientSecret ? 'text' : 'password'}
                          value={marketplaceCredentials.clientSecret || ''}
                          onChange={(e) => setMarketplaceCredentials(prev => ({
                            ...prev,
                            clientSecret: e.target.value
                          }))}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter Walmart Client Secret"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('clientSecret')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPasswords.clientSecret ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleMarketplaceTest}
                  disabled={isTesting}
                  className="w-full"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Test Marketplace Connection
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Vendor Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Integration Type
                  </label>
                  <select
                    value={vendorCredentials.type}
                    onChange={(e) => setVendorCredentials(prev => ({
                      ...prev,
                      type: e.target.value as 'api' | 'sftp' | 'edi' | 'webhook'
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="api">REST API</option>
                    <option value="sftp">SFTP File Transfer</option>
                    <option value="edi">EDI X12</option>
                    <option value="webhook">Webhook</option>
                  </select>
                </div>

                {/* Vendor Basic Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor Name
                  </label>
                  <input
                    type="text"
                    value={vendorCredentials.name}
                    onChange={(e) => setVendorCredentials(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter vendor name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={vendorCredentials.description}
                    onChange={(e) => setVendorCredentials(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of the vendor"
                    rows={3}
                  />
                </div>

                {/* Authentication Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Authentication Type
                  </label>
                  <select
                    value={vendorCredentials.authentication}
                    onChange={(e) => setVendorCredentials(prev => ({
                      ...prev,
                      authentication: e.target.value as 'oauth2' | 'api_key' | 'basic' | 'sftp_key' | 'edi'
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="api_key">API Key</option>
                    <option value="oauth2">OAuth 2.0</option>
                    <option value="basic">Basic Auth</option>
                    <option value="sftp_key">SFTP Key</option>
                    <option value="edi">EDI</option>
                  </select>
                </div>

                {/* API Credentials */}
                {vendorCredentials.type === 'api' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Endpoint
                      </label>
                      <input
                        type="url"
                        value={vendorCredentials.endpoint || ''}
                        onChange={(e) => setVendorCredentials(prev => ({
                          ...prev,
                          endpoint: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://api.vendor.com/v1"
                      />
                    </div>
                    {vendorCredentials.authentication === 'api_key' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          API Key
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.apiKey ? 'text' : 'password'}
                            value={vendorCredentials.apiKey || ''}
                            onChange={(e) => setVendorCredentials(prev => ({
                              ...prev,
                              apiKey: e.target.value
                            }))}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter API Key"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('apiKey')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPasswords.apiKey ? (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                    {vendorCredentials.authentication === 'basic' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                          </label>
                          <input
                            type="text"
                            value={vendorCredentials.username || ''}
                            onChange={(e) => setVendorCredentials(prev => ({
                              ...prev,
                              username: e.target.value
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter username"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.password ? 'text' : 'password'}
                              value={vendorCredentials.password || ''}
                              onChange={(e) => setVendorCredentials(prev => ({
                                ...prev,
                                password: e.target.value
                              }))}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter password"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('password')}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showPasswords.password ? (
                                <EyeOff className="w-4 h-4 text-gray-400" />
                              ) : (
                                <Eye className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* SFTP Credentials */}
                {vendorCredentials.type === 'sftp' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SFTP Host
                      </label>
                      <input
                        type="text"
                        value={vendorCredentials.sftpHost || ''}
                        onChange={(e) => setVendorCredentials(prev => ({
                          ...prev,
                          sftpHost: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="sftp.vendor.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SFTP Port
                      </label>
                      <input
                        type="number"
                        value={vendorCredentials.sftpPort || 22}
                        onChange={(e) => setVendorCredentials(prev => ({
                          ...prev,
                          sftpPort: parseInt(e.target.value)
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="22"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={vendorCredentials.sftpUsername || ''}
                        onChange={(e) => setVendorCredentials(prev => ({
                          ...prev,
                          sftpUsername: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter SFTP username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.sftpPassword ? 'text' : 'password'}
                          value={vendorCredentials.sftpPassword || ''}
                          onChange={(e) => setVendorCredentials(prev => ({
                            ...prev,
                            sftpPassword: e.target.value
                          }))}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter SFTP password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('sftpPassword')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPasswords.sftpPassword ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {/* File Locations */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Inventory File Location
                      </label>
                      <input
                        type="text"
                        value={vendorCredentials.sftpInventoryPath || ''}
                        onChange={(e) => setVendorCredentials(prev => ({
                          ...prev,
                          sftpInventoryPath: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="/path/to/inventory.csv"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catalog File Location
                      </label>
                      <input
                        type="text"
                        value={vendorCredentials.sftpCatalogPath || ''}
                        onChange={(e) => setVendorCredentials(prev => ({
                          ...prev,
                          sftpCatalogPath: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="/path/to/catalog.csv"
                      />
                    </div>
                  </div>
                )}

                {/* EDI Credentials */}
                {vendorCredentials.type === 'edi' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Partner ID
                      </label>
                      <input
                        type="text"
                        value={vendorCredentials.ediPartnerId || ''}
                        onChange={(e) => setVendorCredentials(prev => ({
                          ...prev,
                          ediPartnerId: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter EDI partner ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sender ID
                      </label>
                      <input
                        type="text"
                        value={vendorCredentials.ediSenderId || ''}
                        onChange={(e) => setVendorCredentials(prev => ({
                          ...prev,
                          ediSenderId: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter sender ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Receiver ID
                      </label>
                      <input
                        type="text"
                        value={vendorCredentials.ediReceiverId || ''}
                        onChange={(e) => setVendorCredentials(prev => ({
                          ...prev,
                          ediReceiverId: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter receiver ID"
                      />
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleVendorTest}
                  disabled={isTesting}
                  className="w-full"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Test Vendor Connection
                    </>
                  )}
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Test Results</h2>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>

            {testResults.length === 0 ? (
              <div className="text-center py-8">
                <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No test results yet. Run a connection test to see results here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {testResults.map((test) => (
                  <div
                    key={test.id}
                    className="border border-gray-200 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <h3 className="font-medium text-gray-900">{test.name}</h3>
                          <p className="text-sm text-gray-500">
                            {test.type === 'marketplace' ? 'Marketplace' : 'Vendor'} Integration
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(test.status)}>
                        {test.status}
                      </Badge>
                    </div>

                    {test.result && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-700">{test.result.message}</p>
                        
                        {test.result.duration > 0 && (
                          <p className="text-xs text-gray-500">
                            Duration: {test.result.duration}ms
                          </p>
                        )}

                        {test.result.errors && test.result.errors.length > 0 && (
                          <div className="bg-red-50 border border-red-200 rounded-md p-3">
                            <h4 className="text-sm font-medium text-red-800 mb-2">Errors:</h4>
                            <ul className="text-sm text-red-700 space-y-1">
                              {test.result.errors.map((error, index) => (
                                <li key={index}>• {error}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {test.result.details && (
                          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                            <h4 className="text-sm font-medium text-blue-800 mb-2">Details:</h4>
                            <pre className="text-xs text-blue-700 whitespace-pre-wrap">
                              {JSON.stringify(test.result.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IntegrationTestPage; 