import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import Login from '@/pages/Login'
import DashboardLayout from './components/DashboardLayout'
import SuperAdminLayout from './layouts/SuperAdminLayout' 
import History from './pages/History'
import AddTransaction from './pages/AddTransaction'
import Users from './pages/Users'
import CategoryHistory from './pages/CategoryHistory'
import SuperAdmin from './pages/SuperAdmin'
import Reports from './pages/Reports'
import ManageCategories from './pages/ManageCategories'
import Overview from './pages/Overview' // NAYA: Overview Page
import Settings from './pages/Settings' // NAYA: Settings Placeholder

const ProtectedRoute = () => {
  const { user, loading, role } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600 font-medium">Intezaar farmayen (Loading)...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (role === 'super_admin') {
    return <SuperAdminLayout />
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            {/* FIXED ROUTES */}
            <Route path="/" element={<Overview />} /> {/* Home ab Overview hai */}
            <Route path="/transactions" element={<History />} /> {/* History list yahan aayegi */}
            <Route path="/reports" element={<Reports />} />
            <Route path="/categories" element={<ManageCategories />} />
            <Route path="/team" element={<Users />} />
            <Route path="/settings" element={<Settings />} /> 
            
            {/* OTHER ROUTES */}
            <Route path="/added" element={<CategoryHistory type="addition" />} />
            <Route path="/subtracted" element={<CategoryHistory type="subtraction" />} />
            <Route path="/super-admin" element={<SuperAdmin />} />
            <Route path="/add" element={<AddTransaction />} />
          </Route>
          
        </Routes>
      </Router>
    </AuthProvider>
  )
}