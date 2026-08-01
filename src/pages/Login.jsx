import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Mail, Lock, User, ImagePlus, ArrowRight, KeyRound } from 'lucide-react'

export default function Login() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('login') 
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [profilePic, setProfilePic] = useState(null)
  const [otp, setOtp] = useState('')

  // NAYA CODE: Agar user login ho jaye (jaise OTP verify hone ke baad), toh seedha Dashboard par bhej dein
  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  const uploadAvatar = async (file) => {
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', uploadPreset)

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData })
      if (!res.ok) throw new Error("Image upload failed")
      const data = await res.json()
      return data.secure_url
    } catch (error) {
      console.error("Cloudinary Error:", error)
      throw new Error("Tasveer upload nahi ho saki.")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: '', type: '' })

    const cleanEmail = email.trim()
    const cleanPassword = password.trim()
    const cleanOtp = otp.trim()

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ 
          email: cleanEmail, 
          password: cleanPassword 
        })
        if (error) throw error
        // Login hotay hi upar wala useEffect khud dashboard par le jayega
      } 
      
      else if (mode === 'register') {
        let avatarUrl = null
        if (profilePic) {
          avatarUrl = await uploadAvatar(profilePic)
        }
        
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail, 
          password: cleanPassword, 
          options: { data: { full_name: fullName, avatar_url: avatarUrl } }
        })
        
        if (error) throw error
        
        if (data.session) {
          // Agar seedha login ho gaya
          setMessage({ text: 'Account ban gaya!', type: 'success' })
        } else {
          setMessage({ text: 'Aapke email par 6-digit code bheja gaya hai.', type: 'success' })
          setMode('verify-signup')
        }
      } 
      
      else if (mode === 'verify-signup') {
        const { error } = await supabase.auth.verifyOtp({ 
          email: cleanEmail, 
          token: cleanOtp, 
          type: 'signup'
        })
        if (error) throw error
        // OTP verify hotay hi useEffect aapko automatically '/' (Dashboard) par le jayega
      } 
      
      else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail)
        if (error) throw error
        setMessage({ text: 'Password reset code aapke email par bheja gaya hai.', type: 'success' })
        setMode('verify-forgot')
      } 
      
      else if (mode === 'verify-forgot') {
        const { error } = await supabase.auth.verifyOtp({ 
          email: cleanEmail, 
          token: cleanOtp, 
          type: 'recovery'
        })
        if (error) throw error
        setMessage({ text: 'Code theek hai. Naya password likhein.', type: 'success' })
        setMode('reset-pass')
        setPassword('') 
      } 
      
      else if (mode === 'reset-pass') {
        const { error } = await supabase.auth.updateUser({ password: cleanPassword })
        if (error) throw error
        setMessage({ text: 'Password theek ho gaya! Ab login karein.', type: 'success' })
        setMode('login')
      }

    } catch (error) {
      console.error("Supabase Error:", error)
      setMessage({ text: error.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4 shadow-sm">
            <Lock className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {mode === 'login' ? 'Khushamdeed' : 
             mode === 'register' ? 'Naya Account' : 
             mode === 'forgot' ? 'Password Reset' : 
             mode === 'reset-pass' ? 'Naya Password' : 'OTP Tasdeeq'}
          </h2>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-gray-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* NAME */}
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pura Naam</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all bg-gray-50" placeholder="Ali Khan" />
                </div>
              </div>
            )}

            {/* EMAIL */}
            {['login', 'register', 'forgot'].includes(mode) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all bg-gray-50" placeholder="aap@email.com" />
                </div>
              </div>
            )}

            {/* PASSWORD */}
            {['login', 'register', 'reset-pass'].includes(mode) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {mode === 'reset-pass' ? 'Naya Password' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all bg-gray-50" placeholder="••••••••" minLength="6" />
                </div>
                {mode === 'login' && (
                  <div className="flex justify-end mt-1">
                    <button type="button" onClick={() => setMode('forgot')} className="text-xs text-green-600 hover:text-green-500 font-medium">Forgot password?</button>
                  </div>
                )}
              </div>
            )}

            {/* OTP */}
            {['verify-signup', 'verify-forgot'].includes(mode) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">6-Digit OTP Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input type="text" required value={otp} onChange={e => setOtp(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all bg-gray-50 tracking-widest font-semibold" placeholder="123456" />
                </div>
              </div>
            )}

            {/* PROFILE PIC */}
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Tasveer (Optional)</label>
                <label className="flex items-center gap-3 w-full px-4 py-2.5 bg-gray-50 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <ImagePlus className="text-gray-400 w-5 h-5" />
                  <span className="text-sm text-gray-500 truncate">{profilePic ? profilePic.name : 'Tasveer chunein...'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setProfilePic(e.target.files[0])} />
                </label>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50">
              {loading ? 'Intezaar...' : 'Aagay Barhein'}
              {!loading && <ArrowRight className="w-4 h-4" /> }
            </button>
          </form>

          {message.text && (
            <div className={`mt-5 p-3 text-sm font-medium rounded-xl border ${message.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
              {message.text}
            </div>
          )}

          {/* BOTTOM LINKS */}
          <div className="mt-6 text-center text-sm">
            {mode === 'login' && (
              <p className="text-gray-600">Account nahi hai? <button onClick={() => setMode('register')} className="font-bold text-green-600 hover:text-green-500">Naya banayen</button></p>
            )}
            {mode !== 'login' && (
              <p className="text-gray-600">Wapis jana hai? <button onClick={() => { setMode('login'); setMessage({text:'', type:''}) }} className="font-bold text-green-600 hover:text-green-500">Login karein</button></p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}