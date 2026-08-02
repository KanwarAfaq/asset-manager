import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Receipt, PieChart, Users, Tags, Settings as SettingsIcon, LogOut, Menu, Bell, Search } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase' // NAYA

export default function SuperAdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const { user, role, logOut } = useAuth()
  
  // NAYA: Real Profile State
  const [profile, setProfile] = useState({ full_name: '', avatar_url: '' })

  // NAYA: Database se real naam aur tasveer mangwayen
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase.from('users').select('full_name, avatar_url').eq('id', user.id).single()
        if (data) setProfile(data)
      }
    }
    fetchProfile()
  }, [user])

  const menuItems = [
    { name: 'Overview', icon: LayoutDashboard, path: '/' },
    { name: 'Transactions', icon: Receipt, path: '/transactions' },
    { name: 'Reports', icon: PieChart, path: '/reports' },
    { name: 'Categories', icon: Tags, path: '/categories' },
    { name: 'Team Members', icon: Users, path: '/team' },
    { name: 'Settings', icon: SettingsIcon, path: '/settings' },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      
      <aside className={`bg-white border-r border-gray-200 transition-all duration-300 z-20 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20 md:w-64 -ml-64 md:ml-0'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <span className={`text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate ${!isSidebarOpen && 'md:hidden'}`}>
            AssetPro.
          </span>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="md:hidden text-gray-500">
            <Menu size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link key={item.name} to={item.path} className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                <item.icon size={20} className={isActive ? 'text-white' : 'text-gray-400'} />
                <span className={`${!isSidebarOpen && 'hidden md:block'}`}>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* NAYA: Real Profile Area in Sidebar */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
            
            {/* Tasveer dikhane ka logic */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.email?.charAt(0).toUpperCase()
              )}
            </div>
            
            {/* Naam dikhane ka logic */}
            <div className={`overflow-hidden ${!isSidebarOpen && 'hidden md:block'}`}>
              <p className="text-sm font-bold text-gray-800 truncate">
                {profile.full_name ? profile.full_name : (role === 'super_admin' ? 'Super Admin' : 'Admin')}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          
          <button onClick={logOut} className={`w-full mt-2 flex items-center gap-3 px-3 py-2 text-red-500 font-medium hover:bg-red-50 rounded-xl transition-colors ${!isSidebarOpen && 'justify-center md:justify-start'}`}>
            <LogOut size={20} />
            <span className={`${!isSidebarOpen && 'hidden md:block'}`}>Log Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 md:px-8 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center bg-gray-100 px-4 py-2 rounded-full w-64">
              <Search size={16} className="text-gray-400 mr-2" />
              <input type="text" placeholder="Search records..." className="bg-transparent text-sm outline-none w-full" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}