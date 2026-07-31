import { useState } from 'react'
import { format } from 'date-fns'
import { ArrowDownRight, ArrowUpRight, FileText, ArrowRight, User, AlertTriangle, CheckCircle2 } from 'lucide-react'
import TransactionNotesModal from '@/components/TransactionNotesModal'
import { useTransactions } from '@/hooks/useTransactions'

export default function History() {
  const { allTransactions, stats, loading } = useTransactions()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  const openNotesModal = (transaction) => {
    setSelectedTransaction(transaction)
    setIsModalOpen(true)
  }

  const lastWeekTransactions = allTransactions.filter(txn => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return new Date(txn.created_at) >= weekAgo
  })

  if (loading) return <div className="p-8 text-center text-gray-500">Data laya ja raha hai...</div>

  const isLoss = stats.netBalance < 0;

  return (
    <div>
      {/* 1. NAYA: NET BALANCE BANNER (Blinking if in Loss) */}
      <div className={`mb-8 p-6 rounded-2xl shadow-lg flex items-center justify-center gap-4 text-white transition-all transform hover:scale-[1.01] ${
        isLoss ? 'bg-red-600 animate-pulse border-4 border-red-800' : 'bg-gradient-to-r from-green-500 to-green-600'
      }`}>
        {isLoss ? <AlertTriangle size={48} /> : <CheckCircle2 size={48} />}
        <div>
          <h2 className="text-lg font-semibold opacity-90">
            {isLoss ? 'Khatre ki Ghanti (Net Loss)' : 'Mojooda Raqam (Net Available Balance)'}
          </h2>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Rs. {Math.abs(stats.netBalance).toLocaleString()} {isLoss && '- (Minus)'}
          </h1>
        </div>
      </div>

      {/* 2. TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-green-50 border border-green-200 p-6 rounded-2xl shadow-sm">
          <h3 className="text-green-800 font-bold text-lg mb-1">Kul Aamdani (Total Added)</h3>
          <p className="text-3xl font-black text-green-700 mb-4">Rs. {stats.totalAdded.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl shadow-sm">
          <h3 className="text-red-800 font-bold text-lg mb-1">Kul Kharcha (Total Subtracted)</h3>
          <p className="text-3xl font-black text-red-700 mb-4">Rs. {stats.totalSubtracted.toLocaleString()}</p>
        </div>
      </div>

      {/* 3. TABLE with Added By Column */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Pichlay 7 Din (Last Week History)</h2>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm font-semibold uppercase tracking-wider">
                <th className="p-4 pl-6">Tareekh (Date)</th>
                <th className="p-4">Tafseel (Name)</th>
                <th className="p-4 text-right">Raqam</th>
                <th className="p-4 text-center">Baqaya</th>
                <th className="p-4">Indraj Karne Wala (By)</th>
                <th className="p-4 text-center">Raseed</th>
                <th className="p-4 pr-6 text-center w-48">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lastWeekTransactions.map((txn) => {
                const isAddition = txn.type === 'addition'
                return (
                  <tr key={txn.id} className="hover:bg-gray-50">
                    <td className="p-4 pl-6 text-sm whitespace-nowrap">
                      <div className="font-medium text-gray-800">{format(new Date(txn.created_at), 'dd MMM yyyy')}</div>
                      <div className="text-xs text-gray-500">{format(new Date(txn.created_at), 'hh:mm a')}</div>
                    </td>
                    <td className="p-4 font-medium text-gray-800">{txn.name}</td>
                    <td className={`p-4 text-right font-bold whitespace-nowrap ${isAddition ? 'text-green-600' : 'text-red-600'}`}>
                      {isAddition ? '+' : '-'} Rs. {txn.price.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2 text-sm font-semibold bg-gray-50 py-1.5 rounded-lg border border-gray-100">
                        <span className="text-gray-400">{txn.prevAcc}</span>
                        <ArrowRight size={14} className="text-gray-300" />
                        <span className="text-blue-600">{txn.newAcc}</span>
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
                        <div onClick={() => openNotesModal(txn)} className="text-purple-600 font-semibold cursor-pointer hover:underline text-sm truncate max-w-[150px] mx-auto">
                          {txn.latestNote}
                        </div>
                      ) : (
                        <button onClick={() => openNotesModal(txn)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-500 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap">
                          + Note Likhain
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <TransactionNotesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} transaction={selectedTransaction} />
    </div>
  )
}