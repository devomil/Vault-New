import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Tenants', href: '/tenants', icon: '🏢' },
  { name: 'Services', href: '/services', icon: '⚙️' },
  { name: 'Settings', href: '/settings', icon: '🔧' },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">Vault Admin</h1>
      </div>
      <nav className="px-4 pb-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link key={item.name} to={item.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className="w-full justify-start mb-2"
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Button>
            </Link>
          )
        })}
      </nav>
    </div>
  )
} 