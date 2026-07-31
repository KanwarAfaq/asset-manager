import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { X, Send, User } from 'lucide-react'
import { format } from 'date-fns'

export default function TransactionNotesModal({ isOpen, onClose, transaction }) {
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Jab modal khule, toh notes fetch karo
  useEffect(() => {
    if (isOpen && transaction) {
      fetchNotes()
    }
  }, [isOpen, transaction])

  const fetchNotes = async () => {
    setLoading(true)
    // Hum notes ke sath user ka email bhi fetch kar rahe hain `users(email)` use karke
    const { data, error } = await supabase
      .from('transaction_notes')
      .select('*, users(email)')
      .eq('transaction_id', transaction.id)
      .order('created_at', { ascending: true }) // Purane notes pehle
    
    if (!error && data) {
      setNotes(data)
    }
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
      .select('*, users(email)')
      .single()

    if (!error && data) {
      setNotes([...notes, data]) // Naya note foran list mein shamil karein
      setNewNote('')
    }
    setSubmitting(false)
  }

  // Agar modal band hai, toh kuch mat dikhao
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm font-sans">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Notes / Tabsaray</h3>
            <p className="text-sm text-gray-500 font-medium truncate max-w-[250px] md:max-w-[350px]">
              {transaction?.name}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notes List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {loading ? (
            <div className="text-center text-gray-500 py-8 text-sm font-medium">Notes laya ja raha hai...</div>
          ) : notes.length === 0 ? (
            <div className="text-center text-gray-500 py-8 text-sm font-medium">Koi note majood nahi. Pehla tabsara karein!</div>
          ) : (
            notes.map((note) => {
              const isMe = note.user_id === user.id
              return (
                <div key={note.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                    isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{note.note}</p>
                  </div>
                  <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <User size={10} />
                    <span className="font-medium">{isMe ? 'Aap (You)' : note.users?.email?.split('@')[0]}</span>
                    <span>•</span>
                    <span>{format(new Date(note.created_at), 'dd MMM, hh:mm a')}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Note Input Area */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Apna note likhein..."
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={!newNote.trim() || submitting}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-200"
            >
              <Send size={18} className={submitting ? 'opacity-50' : ''} />
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}