import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { X, Send, User as UserIcon } from 'lucide-react'
import { format } from 'date-fns'

export default function TransactionNotesModal({ isOpen, onClose, transaction }) {
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  

  useEffect(() => {
    if (isOpen && transaction) {
      fetchNotes()
    }
  }, [isOpen, transaction])

  const fetchNotes = async () => {
    setLoading(true)
    // NAYA: users table se email ke sath 'role' bhi fetch karein
    const { data, error } = await supabase
      .from('transaction_notes')
      .select('*, users(email, role)')
      .eq('transaction_id', transaction.id)
      .order('created_at', { ascending: true })
    
    if (!error && data) setNotes(data)
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newNote.trim()) return

    setSubmitting(true)
    const { data, error } = await supabase
      .from('transaction_notes')
      .insert([{
        transaction_id: transaction.id,
        user_id: user.id,
        note: newNote.trim()
      }])
      .select('*, users(email, role)')
      .single()

    if (!error && data) {
      setNotes([...notes, data]) 
      setNewNote('')
    }
    setSubmitting(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Notes / Tabsaray</h3>
            <p className="text-sm text-gray-500 font-medium truncate max-w-[250px] md:max-w-[350px]">
              {transaction?.name}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gray-50/50">
          {loading ? (
            <div className="text-center text-gray-500 py-8 text-sm font-medium">Notes laya ja raha hai...</div>
          ) : notes.length === 0 ? (
            <div className="text-center text-gray-500 py-8 text-sm font-medium">Koi note majood nahi. Pehla tabsara karein!</div>
          ) : (
            notes.map((note) => {
              const isMe = note.user_id === user.id
              const roleName = note.users?.role?.replace('_', ' ') || 'member'
              const userName = note.users?.email?.split('@')[0] || 'Unknown'
              
              return (
                <div key={note.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  
                  {/* NAYA: Detailed Name & Role Tag above the message */}
                  <div className={`flex items-center gap-1.5 mb-1 text-xs font-semibold ${isMe ? 'flex-row-reverse text-blue-700' : 'text-gray-600'}`}>
                    <UserIcon size={12} />
                    <span>{isMe ? 'Aap (You)' : userName}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide text-white ${
                      roleName === 'super admin' ? 'bg-purple-500' : 
                      roleName === 'admin' ? 'bg-green-500' : 'bg-gray-400'
                    }`}>
                      {roleName}
                    </span>
                  </div>

                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${
                    isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{note.note}</p>
                  </div>
                  
                  {/* NAYA: Exact Date and Time below the message */}
                  <div className="mt-1 text-[11px] text-gray-400 font-medium">
                    {format(new Date(note.created_at), 'dd MMM yyyy, hh:mm a')}
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-white">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Apna note likhein..."
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={!newNote.trim() || submitting}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 shadow-sm"
            >
              <Send size={18} />
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}