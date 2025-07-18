import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { Layout } from '@/components/layout'
import { Dashboard } from '@/pages/dashboard'
import { Tenants } from '@/pages/tenants'
import { Services } from '@/pages/services'
import { Settings } from '@/pages/settings'
import { Login } from '@/pages/login'
import { ProtectedRoute } from '@/components/auth/protected-route'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vault-ui-theme">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="tenants" element={<Tenants />} />
          <Route path="services" element={<Services />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </ThemeProvider>
  )
}

export default App 