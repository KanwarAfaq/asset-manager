import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Trash2, Plus, AlertCircle, Edit2, X } from 'lucide-react'

export default function ManageCategories() {
  const { role } = useAuth()
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [color, setColor] = useState('bg-gray-100 text-gray-700 border-gray-200')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // NAYA: Edit karne ke liye state
  const [editingId, setEditingId] = useState(null)

  const colorOptions = [
    { label: 'Gray (Default)', value: 'bg-gray-100 text-gray-700 border-gray-200' },
    { label: 'Green', value: 'bg-green-100 text-green-700 border-green-200' },
    { label: 'Blue', value: 'bg-blue-100 text-blue-700 border-blue-200' },
    { label: 'Red', value: 'bg-red-100 text-red-700 border-red-200' },
    { label: 'Amber', value: 'bg-amber-100 text-amber-700 border-amber-200' },
    { label: 'Purple', value: 'bg-purple-100 text-purple-700 border-purple-200' },
    { label: 'Indigo', value: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    { label: 'Pink', value: 'bg-pink-100 text-pink-700 border-pink-200' },
  ]

  if (role !== 'super_admin' && role !== 'admin') {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl">
        Ijazat Nahi (Access Denied). Sirf Super Admin yeh page dekh sakta hai.
      </div>
    )
  }

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*').order('name')
    if (data) setCategories(data)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // NAYA: Edit aur Add dono ka logic handle karega
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    if (editingId) {
      // UPDATE CATEGORY
      const { error } = await supabase.from('categories').update({ name, color }).eq('id', editingId)
      if (error) setError('Update karne mein masla aaya.')
      else resetForm()
    } else {
      // ADD NEW CATEGORY
      const { error } = await supabase.from('categories').insert([{ name, color }])
      if (error) setError('Yeh category pehle se mojood hai ya koi masla aaya hai.')
      else resetForm()
    }
    setLoading(false)
  }

  const resetForm = () => {
    setName('')
    setColor(colorOptions[0].value)
    setEditingId(null)
    fetchCategories()
  }

  const startEdit = (cat) => {
    setEditingId(cat.id)
    setName(cat.name)
    setColor(cat.color)
  }

  const handleDelete = async (id) => {
    if(window.confirm('Kya aap waqai is category ko delete karna chahte hain?')) {
      await supabase.from('categories').delete().eq('id', id)
      fetchCategories()
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Categories Manage Karein</h1>
      
      {/* FORM (ADD / EDIT) */}
      <form onSubmit={handleSubmit} className={`p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-4 items-end transition-colors ${editingId ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
        <div className="flex-1 w-full">
          <label className="block text-sm font-semibold mb-1">{editingId ? 'Category Edit Karein' : 'Naya Naam'}</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Jaise: Fuel" className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-sm font-semibold mb-1">Rang (Color)</label>
          <select value={color} onChange={(e) => setColor(e.target.value)} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {colorOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          {editingId && (
            <button type="button" onClick={resetForm} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2.5 rounded-xl font-medium flex items-center justify-center transition-colors">
              <X size={18} />
            </button>
          )}
          <button type="submit" disabled={loading} className={`flex-1 md:flex-none text-white px-6 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-black'}`}>
            {editingId ? <><Edit2 size={18} /> Update</> : <><Plus size={18} /> Add</>}
          </button>
        </div>
      </form>

      {error && <p className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={16} /> {error}</p>}

      {/* CATEGORIES LIST */}
    {/* CATEGORIES LIST */}
<div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
  <div className="overflow-x-auto"> {/* NAYA: Mobile scroll ke liye yeh line shamil ki */}
    <table className="w-full text-left min-w-[400px]"> {/* min-w-[400px] taake zyada chota na ho */}
      <thead className="bg-gray-50 border-b border-gray-200">
        {/* Table ka baqi code same rahay ga */}
            <tr>
              <th className="p-4 font-semibold text-gray-600">Category</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${cat.color}`}>
                    {cat.name}
                  </span>
                </td>
                <td className="p-4 text-right flex items-center justify-end gap-2">
                  <button onClick={() => startEdit(cat)} className="text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition-colors" title="Edit">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}