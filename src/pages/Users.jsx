import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { ShieldAlert, UserCog, CheckCircle2 } from 'lucide-react'

export default function Users() {
  const { role, user: currentUser } = useAuth()
  const [usersList, setUsersList] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    // Sirf agar user super_admin hai toh fetch karein
    if (role === 'super_admin') {
      fetchUsers()
    }
  }, [role])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('email')

      if (error) throw error
      setUsersList(data)
    } catch (error) {
      setMessage({ text: `Data laane mein masla: ${error.message}`, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingId(userId)
      setMessage({ text: '', type: '' })

      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      // Screen par foran update dikhane ke liye local state change karein
      setUsersList(usersList.map(u => u.id === userId ? { ...u, role: newRole } : u))
      setMessage({ text: 'Ohda (Role) kamyabi se tabdeel ho gaya!', type: 'success' })

      // 3 seconds baad success message gayab kar dein
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (error) {
      setMessage({ text: `Tabdeeli mein masla: ${error.message}`, type: 'error' })
    } finally {
      setUpdatingId(null)
    }
  }

  // Agar user Super Admin nahi hai, toh page mat dikhao
  if (role !== 'super_admin') {
    return (
      <div className="p-8 max-w-md mx-auto text-center mt-12 bg-red-50 rounded-2xl border border-red-200 shadow-sm">
        <ShieldAlert size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-700 mb-2">Ijazat Nahi</h2>
        <p className="text-red-600 font-medium">
          Sirf Super Admin is page ko dekh sakta hai.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UserCog className="text-green-600" />
            Users Manage Karein
          </h1>
          <p className="text-gray-500 text-sm mt-1">Sab users ka ohda (role) tabdeel karein.</p>
        </div>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium transition-all ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' && <CheckCircle2 size={18} />}
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-medium">Data laya ja raha hai...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm font-semibold uppercase tracking-wider">
                  <th className="p-4 pl-6">Email Address</th>
                  <th className="p-4">Mojooda Ohda (Role)</th>
                  <th className="p-4 pr-6 text-right">Ohda Tabdeel Karein</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usersList.map((u) => {
                  const isMe = u.id === currentUser?.id
                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      
                      <td className="p-4 pl-6 font-medium text-gray-800">
                        {u.email}
                        {isMe && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Aap (You)</span>}
                      </td>
                      
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                          u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                          u.role === 'admin' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      
                      <td className="p-4 pr-6 text-right">
                        <select
                          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer disabled:opacity-50"
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={updatingId === u.id || isMe}
                          title={isMe ? "Aap apna ohda khud tabdeel nahi kar sakte" : "Ohda chunein"}
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                        
                        {updatingId === u.id && (
                          <span className="ml-3 text-xs text-gray-500 font-medium animate-pulse">
                            Update ho raha hai...
                          </span>
                        )}
                      </td>
                      
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}