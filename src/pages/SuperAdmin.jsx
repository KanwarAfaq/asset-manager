import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useTransactions } from '@/hooks/useTransactions'
import { format } from 'date-fns'
import { ShieldAlert, Trash2, Edit, X, Save, AlertTriangle } from 'lucide-react'

export default function SuperAdmin() {
  const { role } = useAuth()
  const { allTransactions, refetch, loading } = useTransactions()
  
  // Edit Modal States
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingTxn, setEditingTxn] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', price: '', type: '' })
  const [saving, setSaving] = useState(false)

  // Agar user Super Admin nahi hai, toh page mat dikhao
  if (role !== 'super_admin') {
    return (
      <div className="p-8 max-w-md mx-auto text-center mt-12 bg-red-50 rounded-2xl border border-red-200">
        <ShieldAlert size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-700 mb-2">Ijazat Nahi</h2>
        <p className="text-red-600 font-medium">Sirf Super Admin is panel ko istemal kar sakta hai.</p>
      </div>
    )
  }

  // --- DELETE FUNCTION ---
  const handleDelete = async (id, name) => {
    const confirmDelete = window.confirm(`Kya aap waqai "${name}" ko hamesha ke liye mitana chahte hain? Yeh wapis nahi aayega.`);
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      alert("Record kamyabi se mita diya gaya (Deleted)!");
      refetch(); // Table ko update karo
    } catch (error) {
      alert(`Masla aagaya: ${error.message}`);
    }
  }

  // --- EDIT FUNCTIONS ---
  const openEditModal = (txn) => {
    setEditingTxn(txn)
    setEditForm({ name: txn.name, price: txn.price, type: txn.type })
    setEditModalOpen(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          name: editForm.name,
          price: Number(editForm.price),
          type: editForm.type
        })
        .eq('id', editingTxn.id)

      if (error) throw error;
      
      setEditModalOpen(false)
      refetch() // Table aur Running Balance ko dubara calculate karo
      alert("Record kamyabi se tabdeel ho gaya (Updated)!");
    } catch (error) {
      alert(`Update mein masla: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Data laya ja raha hai...</div>

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-purple-800 flex items-center gap-2">
            <ShieldAlert className="text-purple-600" />
            Super Admin Control Panel
          </h1>
          <p className="text-gray-500 text-sm mt-1">Mukammal ikhtiyar: Yahan se aap har record ko tabdeel (Edit) ya mita (Delete) sakte hain.</p>
        </div>
      </div>

      {/* COMPLETE TABLE (No Date Filter) */}
      <div className="bg-white rounded-2xl border border-purple-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-purple-50 border-b border-purple-100 text-purple-800 text-sm font-semibold uppercase tracking-wider">
                <th className="p-4 pl-6">Tareekh</th>
                <th className="p-4">Tafseel (Name)</th>
                <th className="p-4">Qisam</th>
                <th className="p-4 text-right">Raqam</th>
                <th className="p-4">Indraj (By)</th>
                <th className="p-4 pr-6 text-center">Ikhtiyarat (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-purple-50/50 transition-colors">
                  <td className="p-4 pl-6 text-sm">
                    <div className="font-medium text-gray-800">{format(new Date(txn.created_at), 'dd MMM yyyy')}</div>
                    <div className="text-xs text-gray-500">{format(new Date(txn.created_at), 'hh:mm a')}</div>
                  </td>
                  <td className="p-4 font-medium text-gray-800 max-w-[200px] truncate" title={txn.name}>{txn.name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${txn.type === 'addition' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {txn.type === 'addition' ? 'Aamdani' : 'Kharcha'}
                    </span>
                  </td>
                  <td className={`p-4 text-right font-bold ${txn.type === 'addition' ? 'text-green-600' : 'text-red-600'}`}>
                    Rs. {txn.price.toLocaleString()}
                  </td>
                  <td className="p-4 text-xs font-medium text-gray-600">
                    {txn.users?.email?.split('@')[0]}
                  </td>
                  <td className="p-4 pr-6">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEditModal(txn)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Tabdeel Karein (Edit)">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(txn.id, txn.name)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Mitayen (Delete)">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">Record Tabdeel Karein (Edit)</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tafseel (Name)</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" required />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Raqam (Price)</label>
                <input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Qisam (Type)</label>
                <select value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                  <option value="addition">Aamdani (In)</option>
                  <option value="subtraction">Kharcha (Out)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setEditModalOpen(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">Wapis (Cancel)</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex justify-center items-center gap-2 disabled:opacity-50">
                  <Save size={18} /> {saving ? '...' : 'Mehfooz Karein'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}