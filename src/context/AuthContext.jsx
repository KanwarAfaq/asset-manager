import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchUserRole(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchUserRole(session.user.id)
      else {
        setRole(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

 const fetchUserRole = async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('role, full_name, avatar_url')
      .eq('id', userId)
      .maybeSingle() //[cite: 2]
    
    if (data) {
      setRole(data.role) //[cite: 2]
      // Hum extra data user object mein daal rahe hain
      setUser(prev => ({ ...prev, dbData: data })) //[cite: 2]
    } else {
      // NAYA: Fallback agar user public table mein na mile
      setRole('member')
    }
    setLoading(false) //[cite: 2]
  }

  const logout = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ user, role, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)