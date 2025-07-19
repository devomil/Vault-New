import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, Building2, BarChart3, Package, ShoppingCart, Warehouse, DollarSign, TrendingUp, Store, Truck, Settings, User, Activity, Shield, TestTube } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Inventory', href: '/inventory', icon: Warehouse },
  { name: 'Pricing', href: '/pricing', icon: DollarSign },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  { name: 'Marketplace', href: '/marketplace', icon: Store },
  { name: 'Vendors', href: '/vendors', icon: Truck },
  { name: 'Integration Test', href: '/integration-test', icon: TestTube },
  { name: 'Performance', href: '/performance', icon: Activity },
  { name: 'Security', href: '/security', icon: Shield },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Profile', href: '/profile', icon: User },
];

export const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const { tenant } = useAuth();

  return (
    <>
      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          open ? 'block' : 'hidden'
        }`}
        onClick={() => setOpen(false)}
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
      </div>

      {/* Sidebar */}
      <div
        className={`w-64 bg-white shadow-lg flex-shrink-0 lg:block ${
          open ? 'block' : 'hidden'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-indigo-600" />
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-gray-900">
                  Vault Modernization
                </h1>
                <p className="text-sm text-gray-500">Demo Company</p>
              </div>
            </div>
            <button
              type="button"
              className="lg:hidden rounded-md p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                  onClick={() => setOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <div className="text-xs text-gray-500">
              <p>Version 1.0.0</p>
              <p>© 2024 Vault Modernization</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 