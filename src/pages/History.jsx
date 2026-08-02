import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { format } from 'date-fns'
import { Trash2, Edit2, Search, ArrowDownRight, ArrowUpRight, X, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function History() {
  const { role } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({ id: '', name: '', price: '', type: '', category: '' })
  const [updating, setUpdating] = useState(false)

  // 1. Data Fetch Karna (READ)
  const fetchData = async () => {
    setLoading(true)
    
    // Transactions mangwayen
    const { data: txnData } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (txnData) setTransactions(txnData)

    // Categories mangwayen (Edit form ke liye)
    const { data: catData } = await supabase
      .from('categories')
      .select('name, color')
      .order('name')
    
    if (catData) setCategories(catData)
      
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 2. Delete Karna (DELETE)
  const handleDelete = async (id) => {
    if (window.confirm('Kya aap waqai is indraj (transaction) ko hamesha ke liye delete karna chahte hain?')) {
      const { error } = await supabase.from('transactions').delete().eq('id', id)
      if (!error) {
        setTransactions(transactions.filter(t => t.id !== id))
      } else {
        alert('Delete karne mein masla aaya!')
      }
    }
  }

  // 3. Edit Modal Kholna
  const openEditModal = (txn) => {
    setEditForm({
      id: txn.id,
      name: txn.name,
      price: txn.price,
      type: txn.type,
      category: txn.category || 'General'
    })
    setIsEditModalOpen(true)
  }

  // 4. Update Karna (UPDATE)
  const handleUpdate = async (e) => {
    e.preventDefault()
    setUpdating(true)

    const { error } = await supabase
      .from('transactions')
      .update({
        name: editForm.name,
        price: Number(editForm.price),
        type: editForm.type,
        category: editForm.category
      })
      .eq('id', editForm.id)

    if (!error) {
      setIsEditModalOpen(false)
      fetchData() // Naya data load karein
    } else {
      alert('Update fail ho gaya: ' + error.message)
    }
    setUpdating(false)
  }

  // Search Filter
  const filteredTransactions = transactions.filter(txn => 
    txn.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (txn.category && txn.category.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Category ka color dhoondne ka function
  const getCategoryColor = (catName) => {
    const cat = categories.find(c => c.name === catName)
    return cat ? cat.color : 'bg-gray-100 text-gray-700 border-gray-200'
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sabqi Tafseelat (Transactions)</h1>
          <p className="text-gray-500 text-sm mt-1">Tamam aamdani aur kharchay ki mukammal list.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tafseel ya category talash karein..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 bg-white"
            />
          </div>
          <Link to="/add" className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-colors shrink-0" title="Naya Indraj (Create)">
            <Plus size={20} />
          </Link>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-medium">Data laya ja raha hai...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Tareekh (Date)</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Tafseel (Name)</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm text-center">Category</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm text-center">Qisam (Type)</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm text-right">Raqam (Price)</th>
                  {role === 'super_admin' && (
                    <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">Koi indraj nahi mila.</td>
                  </tr>
                ) : (
                  filteredTransactions.map((txn) => (
                    <tr key={txn.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                        {format(new Date(txn.created_at), 'dd MMM yyyy, hh:mm a')}
                      </td>
                      <td className="p-4 font-medium text-gray-800">{txn.name}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${getCategoryColor(txn.category || 'General')}`}>
                          {txn.category || 'General'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {txn.type === 'addition' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                            <ArrowDownRight size={14} /> Aamdani
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-xs font-bold border border-red-100">
                            <ArrowUpRight size={14} /> Kharcha
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right font-black text-gray-800 whitespace-nowrap">
                        Rs. {Number(txn.price).toLocaleString()}
                      </td>
                      
                      {/* ACTION BUTTONS (Sirf Super Admin ke liye) */}
                      {role === 'super_admin' && (
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEditModal(txn)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(txn.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT MODAL OVERLAY */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">Transaction Edit Karein</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Qisam (Type)</label>
                <select value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="addition">Aamdani (+)</option>
                  <option value="subtraction">Kharcha (-)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1">Tafseel (Name)</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required className="w-full px-4 py-2 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Raqam (Price in Rs.)</label>
                <input type="number" step="any" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} required className="w-full px-4 py-2 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold" />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Category</label>
                <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                  {categories.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 mt-6 pt-2">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={updating} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50">
                  {updating ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  )
}