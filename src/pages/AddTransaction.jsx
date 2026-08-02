import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, CheckCircle2, ArrowDownRight, ArrowUpRight } from 'lucide-react'

export default function AddTransaction() {
  const { user, role } = useAuth()
  const navigate = useNavigate()
  
  const [type, setType] = useState('addition') 
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [receiptFile, setReceiptFile] = useState(null)
  
  // NAYA: Database se categories mangwane ka state
  const [category, setCategory] = useState('')
  const [categoriesList, setCategoriesList] = useState([])
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  // Database se categories fetch karna
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('name').order('name')
      if (data && data.length > 0) {
        setCategoriesList(data)
        setCategory(data[0].name) // Pehli category ko default set kar dein
      }
    }
    fetchCategories()
  }, [])

  if (role === 'member') {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl border border-red-200">
        <h2 className="text-xl font-bold">Ijazat Nahi (Access Denied)</h2>
        <p>Sirf Admins naya indraj kar sakte hain.</p>
      </div>
    )
  }

  const uploadToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )
    
    if (!response.ok) throw new Error('Image upload fail ho gayi')
    const data = await response.json()
    return data.secure_url 
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: '', type: '' })

    try {
      let receipt_url = null

      if (receiptFile) {
        receipt_url = await uploadToCloudinary(receiptFile)
      }

      const { error } = await supabase
        .from('transactions')
        .insert([
          {
            type: type,
            name: name,
            price: Number(price),
            category: category, 
            receipt_url: receipt_url,
            created_by: user.id
          }
        ])

      if (error) throw error

      setMessage({ text: 'Zabardast! Data mehfooz ho gaya.', type: 'success' })
      
      setName('')
      setPrice('')
      if(categoriesList.length > 0) setCategory(categoriesList[0].name)
      setReceiptFile(null)
      
      setTimeout(() => navigate('/'), 1500)

    } catch (error) {
      setMessage({ text: `Masla aagaya: ${error.message}`, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Naya Indraj (Add Record)</h1>
        <p className="text-gray-500 text-sm mt-1">Koi naya asset shamil karein ya kharcha likhein.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Indraj ki Qisam (Type)</label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`relative flex flex-col items-center p-4 cursor-pointer rounded-xl border-2 transition-all ${
                type === 'addition' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-200 hover:bg-gray-50 text-gray-500'
              }`}>
                <input type="radio" name="type" value="addition" className="sr-only" checked={type === 'addition'} onChange={(e) => setType(e.target.value)} />
                <ArrowDownRight size={24} className="mb-2" />
                <span className="font-bold">Aamdani (In)</span>
              </label>

              <label className={`relative flex flex-col items-center p-4 cursor-pointer rounded-xl border-2 transition-all ${
                type === 'subtraction' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:border-red-200 hover:bg-gray-50 text-gray-500'
              }`}>
                <input type="radio" name="type" value="subtraction" className="sr-only" checked={type === 'subtraction'} onChange={(e) => setType(e.target.value)} />
                <ArrowUpRight size={24} className="mb-2" />
                <span className="font-bold">Kharcha (Out)</span>
              </label>
            </div>
          </div>

          {/* Name/Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tafseel (Name/Asset)</label>
            <input 
              type="text" 
              placeholder="Jaise: Office ke liye naya AC" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Raqam (Price in Rs.)</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-gray-500 font-medium">Rs.</span>
              <input 
                type="number" 
                placeholder="0" 
                min="0"
                step="any"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 font-semibold"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
          </div>

          {/* NAYA: Dynamic Category Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Category (Qisam)</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 appearance-none cursor-pointer"
            >
              {categoriesList.map((cat) => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Raseed (Receipt Image) <span className="text-gray-400 font-normal">- Ikhitiyari (Optional)</span></label>
            <label className="flex items-center gap-3 w-full px-4 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <UploadCloud size={20} className="text-blue-500" />
              <span className="text-gray-600 text-sm truncate">
                {receiptFile ? receiptFile.name : 'Tasveer chunein (Choose image)...'}
              </span>
              <input 
                type="file" 
                accept="image/*"
                className="hidden" 
                onChange={(e) => setReceiptFile(e.target.files[0])}
              />
            </label>
          </div>

          {/* Messages */}
          {message.text && (
            <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {message.type === 'success' && <CheckCircle2 size={18} />}
              {message.text}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className={`w-full text-white font-medium py-3.5 rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
              type === 'addition' ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'
            }`}
            disabled={loading}
          >
            {loading ? 'Data mehfooz ho raha hai...' : 'Mehfooz Karein (Save)'}
          </button>

        </form>
      </div>
    </div>
  )
}