import { useAuth } from '@/context/AuthContext'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, ArrowDownRight, ArrowUpRight, Users, ShieldAlert, LogOut, User, PlusCircle } from 'lucide-react'

export default function DashboardLayout({ children }) {
  const { user, role, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Profile data from context
  const fullName = user?.dbData?.full_name || user?.email?.split('@')[0]
  const avatarUrl = user?.dbData?.avatar_url

  return (
    <div className="flex h-screen bg-gray-50 font-sans pb-16 md:pb-0 overflow-hidden">
      
      {/* ======================================= */}
      {/* DESKTOP SIDEBAR                         */}
      {/* ======================================= */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shadow-sm z-20">
        
        {/* Profile Header */}
        <div className="p-6 border-b border-gray-100 flex items-center gap-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-200" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <User size={24} />
            </div>
          )}
          <div className="overflow-hidden">
            <h2 className="text-sm font-bold text-gray-800 truncate">{fullName}</h2>
            <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {role || 'member'}
            </span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${isActive('/') ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Home size={20} className={isActive('/') ? 'text-green-600' : 'text-gray-400'} /> Dashboard
          </Link>
          <Link to="/added" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${isActive('/added') ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <ArrowDownRight size={20} className={isActive('/added') ? 'text-green-600' : 'text-gray-400'} /> Aamdani
          </Link>
          <Link to="/subtracted" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${isActive('/subtracted') ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <ArrowUpRight size={20} className={isActive('/subtracted') ? 'text-red-600' : 'text-gray-400'} /> Kharcha
          </Link>

          {/* NAYA: ADMIN KO ADD BUTTON DIKHAYEN */}
          {(role === 'admin' || role === 'super_admin') && (
            <Link to="/add" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${isActive('/add') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <PlusCircle size={20} className={isActive('/add') ? 'text-blue-600' : 'text-gray-400'} /> Naya Indraj
            </Link>
          )}

          {role === 'super_admin' && (
            <>
              <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Admin Controls</div>
              <Link to="/users" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${isActive('/users') ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Users size={20} className={isActive('/users') ? 'text-purple-600' : 'text-gray-400'} /> Manage Users
              </Link>
              <Link to="/super-admin" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${isActive('/super-admin') ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                <ShieldAlert size={20} className={isActive('/super-admin') ? 'text-purple-600' : 'text-gray-400'} /> App Settings
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full bg-white border border-red-200 hover:bg-red-50 text-red-600 py-2.5 rounded-xl font-medium shadow-sm transition-colors">
            <LogOut size={18} /> Kharij Hon
          </button>
        </div>
      </aside>

      {/* ======================================= */}
      {/* MAIN CONTENT AREA                       */}
      {/* ======================================= */}
      <main className="flex-1 overflow-y-auto relative bg-gray-50/50 w-full">
        {/* Mobile Top Header */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"><User size={16} className="text-green-600"/></div>
            )}
            <div>
              <h2 className="text-sm font-bold text-gray-800">{fullName}</h2>
              <p className="text-[10px] text-gray-500 uppercase">{role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-red-500 p-2"><LogOut size={20}/></button>
        </div>
        
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* ======================================= */}
      {/* MOBILE BOTTOM NAVIGATION                */}
      {/* ======================================= */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center z-20 pb-safe">
        
        <Link to="/" className={`flex flex-col items-center justify-center w-full py-3 ${isActive('/') ? 'text-green-600' : 'text-gray-400'}`}>
          <Home size={22} className={isActive('/') ? 'fill-green-100' : ''} />
          <span className="text-[10px] font-medium mt-1">Home</span>
        </Link>

        {/* NAYA: MOBILE PAR ADMIN KO ADD BUTTON DIKHAYEN */}
        {(role === 'admin' || role === 'super_admin') && (
          <Link to="/add" className={`flex flex-col items-center justify-center w-full py-3 ${isActive('/add') ? 'text-blue-600' : 'text-gray-400'}`}>
            <PlusCircle size={22} />
            <span className="text-[10px] font-medium mt-1">Add</span>
          </Link>
        )}
        
        <Link to="/added" className={`flex flex-col items-center justify-center w-full py-3 ${isActive('/added') ? 'text-green-600' : 'text-gray-400'}`}>
          <ArrowDownRight size={22} />
          <span className="text-[10px] font-medium mt-1">Aamdani</span>
        </Link>
        
        <Link to="/subtracted" className={`flex flex-col items-center justify-center w-full py-3 ${isActive('/subtracted') ? 'text-red-600' : 'text-gray-400'}`}>
          <ArrowUpRight size={22} />
          <span className="text-[10px] font-medium mt-1">Kharcha</span>
        </Link>

        {role === 'super_admin' && (
          <Link to="/super-admin" className={`flex flex-col items-center justify-center w-full py-3 ${isActive('/super-admin') || isActive('/users') ? 'text-purple-600' : 'text-gray-400'}`}>
            <ShieldAlert size={22} />
            <span className="text-[10px] font-medium mt-1">Admin</span>
          </Link>
        )}
      </div>

    </div>
  )
}