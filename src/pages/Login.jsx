import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Mail, KeyRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState(1) // Step 1: Email, Step 2: OTP
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    const { error } = await supabase.auth.signInWithOtp({ email })
    
    if (error) {
      setMessage(`Masla aagaya: ${error.message}`)
    } else {
      setMessage('OTP aapke email par bhej diya gaya hai! (Spam folder check karein)')
      setStep(2)
    }
    setLoading(false)
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email'
    })
    
    if (error) {
      setMessage(`Ghalat OTP: ${error.message}`)
      setLoading(false)
    } else {
      // Login kamyab hone par homepage (dashboard) par bhejo
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Khushamdeed</h1>
          <p className="text-gray-500 mt-2 text-sm">Asset Management System mein login karein</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input 
                  type="email" 
                  placeholder="Apna email darj karein" 
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-800"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-green-200"
              disabled={loading}
            >
              {loading ? 'Intezaar farmayen...' : 'OTP Bhejein (Send OTP)'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">OTP Code</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="6-digit code likhein" 
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-800 tracking-widest text-center font-semibold"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-green-200"
              disabled={loading}
            >
              {loading ? 'Tasdeeq ho rahi hai...' : 'Tasdeeq Karein (Verify)'}
            </button>
            <button 
              type="button"
              className="w-full mt-2 text-sm text-gray-500 hover:text-green-600 font-medium transition-colors" 
              onClick={() => setStep(1)}
            >
              Ghalat email likh di? Wapis jayen
            </button>
          </form>
        )}
        
        {message && (
          <div className={`mt-6 p-4 rounded-xl text-sm font-medium ${message.includes('Masla') || message.includes('Ghalat') ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}