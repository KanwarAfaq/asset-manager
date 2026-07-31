import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { ArrowDownRight, ArrowUpRight, FileText, MessageSquare } from 'lucide-react'
import TransactionNotesModal from '@/components/TransactionNotesModal'

export default function History() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false }) // Sab se naya pehle (Newest first)

      if (error) throw error
      
      setTransactions(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const openNotesModal = (transaction) => {
    setSelectedTransaction(transaction)
    setIsModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 font-medium text-lg">Data laya ja raha hai (Fetching data)...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
        Masla aagaya: {error}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sabqi Tafseelat (Transaction History)</h1>
        <p className="text-gray-500 text-sm mt-1">Tamam aamdani aur kharchon ka record.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm font-semibold uppercase tracking-wider">
                <th className="p-4 pl-6">Tareekh (Date)</th>
                <th className="p-4">Tafseel (Name)</th>
                <th className="p-4">Qisam (Type)</th>
                <th className="p-4 text-right">Raqam (Amount)</th>
                <th className="p-4 text-center">Raseed (Receipt)</th>
                <th className="p-4 pr-6 text-center">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500 font-medium">
                    Abhi tak koi indraj (record) nahi hai.
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => {
                  const isAddition = txn.type === 'addition'
                  
                  return (
                    <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                      {/* Date & Time */}
                      <td className="p-4 pl-6 text-sm text-gray-600 whitespace-nowrap">
                        <div className="font-medium text-gray-800">
                          {format(new Date(txn.created_at), 'dd MMM yyyy')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(txn.created_at), 'hh:mm a')}
                        </div>
                      </td>
                      
                      {/* Name / Asset */}
                      <td className="p-4 font-medium text-gray-800">
                        {txn.name}
                      </td>
                      
                      {/* Type (Addition/Subtraction) */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isAddition ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {isAddition ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                          {isAddition ? 'Aamdani (In)' : 'Kharcha (Out)'}
                        </span>
                      </td>
                      
                      {/* Price / Amount */}
                      <td className={`p-4 text-right font-bold whitespace-nowrap ${
                        isAddition ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isAddition ? '+' : '-'} Rs. {Number(txn.price).toLocaleString()}
                      </td>
                      
                      {/* Receipt Link */}
                      <td className="p-4 text-center">
                        {txn.receipt_url ? (
                          <a 
                            href={txn.receipt_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-xl transition-colors"
                            title="Raseed Dekhain"
                          >
                            <FileText size={18} />
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs font-medium">-</span>
                        )}
                      </td>

                      {/* Notes Button */}
                      <td className="p-4 pr-6 text-center">
                        <button 
                          onClick={() => openNotesModal(txn)}
                          className="inline-flex p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
                          title="Notes Likhain / Dekhain"
                        >
                          <MessageSquare size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Notes Modal Component */}
      <TransactionNotesModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedTransaction}
      />
    </div>
  )
}