import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import Login from '@/pages/Login'
import DashboardLayout from './components/DashboardLayout'
import History from './pages/History'
import AddTransaction from './pages/AddTransaction'
import Users from './pages/Users'
import CategoryHistory from './pages/CategoryHistory'
import SuperAdmin from './pages/SuperAdmin'
// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
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
  
  return <DashboardLayout>{children}</DashboardLayout>
}

// --- Placeholder Pages (Inko hum agle steps mein mukammal karenge) ---

const HistoryPage = () => (
  <div>
    <h1 className="text-2xl font-bold text-gray-800 mb-6">Sabqi Tafseelat (All Transactions)</h1>
    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center">
      <p className="text-gray-500">Yahan hum database se assets aur receipts fetch karke table banayenge...</p>
    </div>
  </div>
)


const UsersPage = () => (
  <div>
    <h1 className="text-2xl font-bold text-gray-800 mb-6">Users Manage Karein (Super Admin)</h1>
    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center">
      <p className="text-gray-500">Yahan Super Admin logon ka role (Admin/Member) change kar sakega...</p>
    </div>
  </div>
)

// --- Main App ---

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
          <Route path="/added" element={<ProtectedRoute><CategoryHistory type="addition" /></ProtectedRoute>} />
          <Route path="/subtracted" element={<ProtectedRoute><CategoryHistory type="subtraction" /></ProtectedRoute>} />
          <Route path="/super-admin" element={<ProtectedRoute><SuperAdmin /></ProtectedRoute>} />
          <Route path="/add" element={<ProtectedRoute><AddTransaction /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}