import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { UploadCloud, CheckCircle2, User as UserIcon } from 'lucide-react'

export default function Settings() {
  const { user } = useAuth()
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  // Database se purana record fetch karein
  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.from('users').select('full_name, avatar_url').eq('id', user.id).single()
      if (data) {
        setFullName(data.full_name || '')
        setAvatarUrl(data.avatar_url || null)
      }
    }
    if (user) fetchProfile()
  }, [user])

  // Image Cloudinary par upload karne ka function
  const uploadToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) throw new Error('Image upload fail ho gayi')
    const data = await response.json()
    return data.secure_url
  }

  // Profile Update karna
  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: '', type: '' })

    try {
      let newAvatarUrl = avatarUrl

      // Agar nayi tasveer select ki gayi hai toh pehle upload karein
      if (imageFile) {
        newAvatarUrl = await uploadToCloudinary(imageFile)
      }

      // Supabase mein user ka data update karein
      const { error } = await supabase
        .from('users')
        .update({ full_name: fullName, avatar_url: newAvatarUrl })
        .eq('id', user.id)

      if (error) throw error

      setAvatarUrl(newAvatarUrl)
      setImageFile(null)
      setMessage({ text: 'Profile kamyabi se update ho gayi!', type: 'success' })
      
      // Page refresh karne ke liye taake Layout mein bhi tasveer change ho jaye
      setTimeout(() => window.location.reload(), 1500)

    } catch (error) {
      setMessage({ text: `Masla aaya: ${error.message}`, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
      
      <form onSubmit={handleUpdate} className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        
        {/* Profile Image Section */}
        <div className="flex flex-col items-center gap-4 pb-6 border-b border-gray-100">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-4 border-white shadow-lg">
            {imageFile ? (
              <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
            ) : avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={40} className="text-gray-400" />
            )}
          </div>
          
          <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <UploadCloud size={16} /> Nayi Tasveer Chunein
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} />
          </label>
        </div>

        {/* Name Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Mukammal Naam (Full Name)</label>
          <input 
            type="text" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jaise: Malik Faizan" 
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.type === 'success' && <CheckCircle2 size={18} />}
            {message.text}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-medium transition-colors shadow-md shadow-blue-200"
        >
          {loading ? 'Update ho raha hai...' : 'Profile Save Karein'}
        </button>
      </form>
    </div>
  )
}