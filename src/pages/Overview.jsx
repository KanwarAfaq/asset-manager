import { useState, useEffect } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { supabase } from '@/lib/supabase'
import { ArrowDownRight, ArrowUpRight, Users, ShieldAlert, Trophy } from 'lucide-react'

export default function Overview() {
  const { allTransactions, stats, loading } = useTransactions()
  const [usersCount, setUsersCount] = useState({ admins: 0, members: 0 })

  // Users ki tadad nikalne ka logic
  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from('users').select('role')
      if (data) {
        const admins = data.filter(u => u.role === 'admin' || u.role === 'super_admin').length
        const members = data.filter(u => u.role === 'member').length
        setUsersCount({ admins, members })
      }
    }
    fetchUsers()
  }, [])

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Dashboard load ho raha hai...</div>
  }

  // Sab se bari amount (Biggest Transaction) nikalne ka logic
  const highestTxn = allTransactions.length > 0 
    ? allTransactions.reduce((max, txn) => Number(txn.price) > Number(max.price) ? txn : max, allTransactions[0])
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Aapke system ka mukammal khulasa.</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Aamdani */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <ArrowDownRight size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Kul Aamdani</p>
            <p className="text-2xl font-black text-gray-800">Rs. {stats.totalAdded?.toLocaleString()}</p>
          </div>
        </div>

        {/* Total Kharcha */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
            <ArrowUpRight size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Kul Kharcha</p>
            <p className="text-2xl font-black text-gray-800">Rs. {stats.totalSubtracted?.toLocaleString()}</p>
          </div>
        </div>

        {/* Total Admins */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Kul Admins</p>
            <p className="text-2xl font-black text-gray-800">{usersCount.admins}</p>
          </div>
        </div>

        {/* Total Members */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Kul Members</p>
            <p className="text-2xl font-black text-gray-800">{usersCount.members}</p>
          </div>
        </div>
      </div>

      {/* Biggest Transaction Highlight */}
      {highestTxn && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-yellow-400">
              <Trophy size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Sab Se Bari Transaction</p>
              <h3 className="text-xl font-bold">{highestTxn.name}</h3>
              <p className="text-xs text-gray-400 mt-1">
                Qisam: <span className={highestTxn.type === 'addition' ? 'text-green-400' : 'text-red-400'}>
                  {highestTxn.type === 'addition' ? 'Aamdani' : 'Kharcha'}
                </span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block px-3 py-1 mb-2 text-xs font-bold bg-white/20 rounded-full border border-white/10">
              Category: {highestTxn.category || 'General'}
            </div>
            <p className="text-3xl font-black text-white">Rs. {Number(highestTxn.price).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  )
}