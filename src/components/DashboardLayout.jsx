import { useAuth } from '@/context/AuthContext'
import { Link, useLocation } from 'react-router-dom'
import { Home, PlusCircle, Users, LogOut } from 'lucide-react'

export default function DashboardLayout({ children }) {
  const { user, role, logout } = useAuth()
  const location = useLocation()

  // Yeh check karega ke konsa page abhi khula hua hai taake us button ka color change ho
  const isActive = (path) => location.pathname === path

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm hidden md:flex">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-green-700 tracking-tight">Khata App</h2>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-gray-500">Ohda (Role):</span>
            <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full capitalize">
              {role || 'Intezaar...'}
            </span>
          </div>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {/* Sab ke liye (Everyone) */}
          <Link 
            to="/" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
              isActive('/') 
                ? 'bg-green-50 text-green-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Home size={20} className={isActive('/') ? 'text-green-600' : 'text-gray-400'} />
            Tafseelat (History)
          </Link>

          {/* Sirf Admin aur Super Admin ke liye */}
          {(role === 'admin' || role === 'super_admin') && (
            <Link 
              to="/add" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
                isActive('/add') 
                  ? 'bg-green-50 text-green-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <PlusCircle size={20} className={isActive('/add') ? 'text-green-600' : 'text-gray-400'} />
              Naya Indraj (Add)
            </Link>
          )}

          {/* Sirf Super Admin ke liye */}
          {role === 'super_admin' && (
            <Link 
              to="/users" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
                isActive('/users') 
                  ? 'bg-green-50 text-green-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Users size={20} className={isActive('/users') ? 'text-green-600' : 'text-gray-400'} />
              Users Manage Karein
            </Link>
          )}
        </nav>

        {/* Sidebar Footer (Logout) */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-500 mb-3 truncate px-2 font-medium" title={user?.email}>
            {user?.email}
          </p>
          <button 
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full bg-white border border-red-200 hover:bg-red-50 text-red-600 py-2.5 rounded-xl transition-colors font-medium shadow-sm"
          >
            <LogOut size={18} />
            Kharij Hon (Logout)
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Mobile Header (Shows only on small screens) */}
        <div className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold text-green-700">Khata App</h2>
          <button onClick={logout} className="text-red-600 text-sm font-medium">Logout</button>
        </div>
        
        {/* Page Content */}
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}