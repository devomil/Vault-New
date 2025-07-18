import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { Bell, User } from 'lucide-react'

export function Layout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-2">
          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-4">
              <button className="p-1.5 text-gray-400 hover:text-gray-600">
                <Bell className="h-4 w-4" />
              </button>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Demo Admin</span>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
} 