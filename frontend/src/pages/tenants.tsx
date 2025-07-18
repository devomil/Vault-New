import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function Tenants() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tenants</h1>
          <p className="text-gray-600">Manage your multi-tenant organization</p>
        </div>
        <Button>Add New Tenant</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { id: 1, name: 'Acme Corp', status: 'Active', users: 25, plan: 'Enterprise' },
          { id: 2, name: 'TechStart Inc', status: 'Active', users: 12, plan: 'Professional' },
          { id: 3, name: 'Global Solutions', status: 'Suspended', users: 8, plan: 'Basic' },
          { id: 4, name: 'Innovation Labs', status: 'Active', users: 15, plan: 'Professional' },
          { id: 5, name: 'Future Systems', status: 'Active', users: 32, plan: 'Enterprise' },
          { id: 6, name: 'Digital Dynamics', status: 'Active', users: 18, plan: 'Professional' },
        ].map((tenant) => (
          <Card key={tenant.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {tenant.name}
                <span className={`text-xs px-2 py-1 rounded-full ${
                  tenant.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {tenant.status}
                </span>
              </CardTitle>
              <CardDescription>Plan: {tenant.plan}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Users:</span>
                  <span className="text-sm font-medium">{tenant.users}</span>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">Edit</Button>
                  <Button size="sm" variant="outline">View Details</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 