import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Building2, 
  Settings, 
  User,
  Bell
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Inventory', href: '/inventory', icon: BarChart3 },
  { name: 'Pricing', href: '/pricing', icon: DollarSign },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  { name: 'Marketplace', href: '/marketplace', icon: Building2 },
  { name: 'Vendors', href: '/vendors', icon: Building2 },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Profile', href: '/profile', icon: User },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">Vault Modernization</h1>
            <p className="text-xs text-gray-500">Demo Company</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          const Icon = item.icon
          return (
            <Link key={item.name} to={item.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className="w-full justify-start mb-1 h-10"
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* User Info and Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 mb-3">
          <Bell className="h-4 w-4 text-gray-400" />
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">Demo Admin</span>
        </div>
        <div className="text-xs text-gray-500 space-y-1">
          <p>Version 1.0.0</p>
          <p>© 2024 Vault Modernization</p>
        </div>
      </div>
    </div>
  )
} 