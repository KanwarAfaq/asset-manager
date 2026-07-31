import { useState } from 'react'
import { format } from 'date-fns'
import { FileText, ArrowRight, User } from 'lucide-react'
import TransactionNotesModal from '@/components/TransactionNotesModal'
import { useTransactions } from '@/hooks/useTransactions'

export default function CategoryHistory({ type }) { 
  const { allTransactions, loading } = useTransactions()
  const [filter, setFilter] = useState('weekly')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  const isAdd = type === 'addition'

  const filteredData = allTransactions.filter(txn => {
    if (txn.type !== type) return false
    const d = new Date(txn.created_at)
    const now = new Date()

    if (filter === 'weekly') {
      const weekAgo = new Date(); weekAgo.setDate(now.getDate() - 7)
      return d >= weekAgo
    }
    if (filter === 'monthly') {
      const monthAgo = new Date(); monthAgo.setDate(now.getDate() - 30)
      return d >= monthAgo
    }
    if (filter === 'custom' && startDate && endDate) {
      return d >= new Date(startDate) && d <= new Date(endDate + 'T23:59:59')
    }
    return true
  })

  // NAYA: Calculate Total for the current view
  const currentTotal = filteredData.reduce((sum, txn) => sum + Number(txn.price), 0);

  if (loading) return <div className="p-8 text-center text-gray-500">Data laya ja raha hai...</div>

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isAdd ? 'text-green-700' : 'text-red-700'}`}>
            {isAdd ? 'Aamdani ki Tafseel (Added History)' : 'Kharchay ki Tafseel (Subtracted History)'}
          </h1>
          {/* NAYA: Show Total Amount Header */}
          <p className="text-lg font-semibold text-gray-600 mt-2">
            Is arsay ki kul raqam: <span className={`font-bold ${isAdd ? 'text-green-600' : 'text-red-600'}`}>Rs. {currentTotal.toLocaleString()}</span>
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none">
            <option value="weekly">Pichla Hafta (Weekly)</option>
            <option value="monthly">Pichla Mahina (Monthly)</option>
            <option value="custom">Makhsoos Tareekh (Custom)</option>
          </select>
          {filter === 'custom' && (
            <div className="flex items-center gap-2">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
              <span className="text-gray-400">se</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm font-semibold uppercase tracking-wider">
                <th className="p-4 pl-6">Tareekh</th>
                <th className="p-4">Tafseel</th>
                <th className="p-4 text-right">Raqam</th>
                <th className="p-4 text-center">Is Qisam Ka Baqaya</th>
                <th className="p-4">Indraj Karne Wala</th>
                <th className="p-4 text-center">Raseed</th>
                <th className="p-4 pr-6 text-center w-48">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">Is waqt ka koi record nahi.</td></tr>
              ) : (
                filteredData.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50">
                    <td className="p-4 pl-6 text-sm whitespace-nowrap">
                      <div className="font-medium text-gray-800">{format(new Date(txn.created_at), 'dd MMM yyyy')}</div>
                      <div className="text-xs text-gray-500">{format(new Date(txn.created_at), 'hh:mm a')}</div>
                    </td>
                    <td className="p-4 font-medium text-gray-800">{txn.name}</td>
                    <td className={`p-4 text-right font-bold whitespace-nowrap ${isAdd ? 'text-green-600' : 'text-red-600'}`}>
                      Rs. {txn.price.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2 text-sm font-semibold bg-gray-50 py-1.5 rounded-lg border border-gray-100">
                        <span className="text-gray-400">{txn.prevTypeBal}</span>
                        <ArrowRight size={14} className="text-gray-300" />
                        <span className={isAdd ? 'text-green-600' : 'text-red-600'}>{txn.newTypeBal}</span>
                      </div>
                    </td>

                    {/* NAYA: Added By Column */}
                    <td className="p-4 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <User size={14} className="text-gray-400" />
                        <span className="font-medium truncate max-w-[120px]" title={txn.users?.email}>
                          {txn.users?.email?.split('@')[0]}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        {txn.users?.role?.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      {txn.receipt_url ? (
                        <a href={txn.receipt_url} target="_blank" rel="noreferrer" className="inline-flex p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl">
                          <FileText size={18} />
                        </a>
                      ) : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="p-4 pr-6 text-center">
                      {txn.latestNote ? (
                        <div onClick={() => { setSelectedTransaction(txn); setIsModalOpen(true) }} className="text-purple-600 font-semibold cursor-pointer hover:underline text-sm truncate max-w-[150px] mx-auto">
                          {txn.latestNote}
                        </div>
                      ) : (
                        <button onClick={() => { setSelectedTransaction(txn); setIsModalOpen(true) }} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-500 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap">
                          + Note Likhain
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <TransactionNotesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} transaction={selectedTransaction} />
    </div>
  )
}