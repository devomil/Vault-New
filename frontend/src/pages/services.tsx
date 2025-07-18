import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function Services() {
  const services = [
    { name: 'API Gateway', port: 3000, status: 'Online', health: 98, uptime: '99.9%' },
    { name: 'Tenant Management', port: 3009, status: 'Online', health: 95, uptime: '99.8%' },
    { name: 'Order Processing', port: 3001, status: 'Online', health: 92, uptime: '99.7%' },
    { name: 'Inventory Management', port: 3002, status: 'Online', health: 96, uptime: '99.9%' },
    { name: 'Pricing Engine', port: 3003, status: 'Online', health: 94, uptime: '99.6%' },
    { name: 'Product Intelligence', port: 3004, status: 'Online', health: 97, uptime: '99.8%' },
    { name: 'Marketplace Integration', port: 3005, status: 'Online', health: 93, uptime: '99.5%' },
    { name: 'Vendor Integration', port: 3006, status: 'Online', health: 91, uptime: '99.4%' },
    { name: 'Analytics Engine', port: 3007, status: 'Online', health: 89, uptime: '99.3%' },
    { name: 'Accounting System', port: 3008, status: 'Online', health: 90, uptime: '99.2%' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Services</h1>
        <p className="text-gray-600">Monitor and manage your microservices</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.name}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {service.name}
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                  {service.status}
                </span>
              </CardTitle>
              <CardDescription>Port: {service.port}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Health Score:</span>
                  <span className="text-sm font-medium">{service.health}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${service.health}%` }}
                  ></div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Uptime:</span>
                  <span className="text-sm font-medium">{service.uptime}</span>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">View Logs</Button>
                  <Button size="sm" variant="outline">Restart</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 