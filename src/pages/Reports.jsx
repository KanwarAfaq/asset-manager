import { useState, useMemo, useEffect } from 'react'
import { format } from 'date-fns'
import { Printer, Calendar, ArrowRight } from 'lucide-react'
import { useTransactions } from '@/hooks/useTransactions'
import { supabase } from '@/lib/supabase'

export default function Reports() {
  const { allTransactions, loading } = useTransactions()
  
  const date = new Date()
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(firstDay)
  const [endDate, setEndDate] = useState(lastDay)

  // NAYA: Database se categories aur unke colors mangwane ka state
  const [dbCategories, setDbCategories] = useState([])

  useEffect(() => {
    const fetchCats = async () => {
      const { data } = await supabase.from('categories').select('name, color')
      if (data) setDbCategories(data)
    }
    fetchCats()
  }, [])

  // NAYA: Yeh function ab database se color dhoondega
  const getCategoryBadge = (categoryName) => {
    const cat = categoryName || 'General';
    const foundCategory = dbCategories.find(c => c.name === cat);
    const badgeStyle = foundCategory ? foundCategory.color : 'bg-gray-100 text-gray-700 border-gray-200';

    return (
      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${badgeStyle} print:border-gray-400 print:text-black print:bg-transparent`}>
        {cat}
      </span>
    )
  }

  const reportData = useMemo(() => {
    const filtered = allTransactions.filter(txn => {
      const d = new Date(txn.created_at)
      const start = new Date(startDate)
      const end = new Date(endDate + 'T23:59:59')
      return d >= start && d <= end
    })

    const totalIn = filtered.reduce((sum, txn) => txn.type === 'addition' ? sum + Number(txn.price) : sum, 0)
    const totalOut = filtered.reduce((sum, txn) => txn.type === 'subtraction' ? sum + Number(txn.price) : sum, 0)
    const net = totalIn - totalOut

    return { transactions: filtered, totalIn, totalOut, net }
  }, [allTransactions, startDate, endDate])

  if (loading) return <div className="p-8 text-center text-gray-500">Data laya ja raha hai...</div>

  return (
    <div className="max-w-5xl mx-auto bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-gray-100">
      
      <div className="print:hidden mb-8 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Print Report</h1>
          <p className="text-gray-500 text-sm">Tareekh muntakhib karein aur mukammal hisaab print karein.</p>
        </div>

        <div className="flex flex-col md:flex-row items-end gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Shuru ki Tareekh (Start Date)</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Khatam ki Tareekh (End Date)</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button 
            onClick={() => window.print()} 
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-colors"
          >
            <Printer size={18} /> Print Nikalein
          </button>
        </div>
      </div>

      <div className="print:block text-black">
        
        <div className="text-center mb-6 pb-6 border-b-2 border-gray-800">
          <h1 className="text-3xl font-black uppercase tracking-widest mb-2">Hisaab Report</h1>
          <div className="flex items-center justify-center gap-2 text-gray-600 font-medium">
            <Calendar size={16} />
            <span>{format(new Date(startDate), 'dd MMM yyyy')}</span>
            <ArrowRight size={14} />
            <span>{format(new Date(endDate), 'dd MMM yyyy')}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 border-2 border-gray-300 rounded-xl text-center bg-gray-50 print:bg-transparent">
            <p className="text-sm font-bold text-gray-500 uppercase mb-1">Kul Aamdani</p>
            <p className="text-2xl font-black text-green-600 print:text-black">Rs. {reportData.totalIn.toLocaleString()}</p>
          </div>
          <div className="p-4 border-2 border-gray-300 rounded-xl text-center bg-gray-50 print:bg-transparent">
            <p className="text-sm font-bold text-gray-500 uppercase mb-1">Kul Kharcha</p>
            <p className="text-2xl font-black text-red-600 print:text-black">Rs. {reportData.totalOut.toLocaleString()}</p>
          </div>
          <div className="p-4 border-2 border-black rounded-xl text-center bg-gray-100 print:bg-transparent">
            <p className="text-sm font-bold text-gray-800 uppercase mb-1">Baqaya (Net Balance)</p>
            <p className="text-2xl font-black">Rs. {reportData.net.toLocaleString()}</p>
          </div>
        </div>

        <table className="w-full text-left border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100 print:bg-gray-200">
              <th className="p-3 border border-gray-300 font-bold text-sm">Tareekh</th>
              <th className="p-3 border border-gray-300 font-bold text-sm">Tafseel</th>
              <th className="p-3 border border-gray-300 font-bold text-sm text-center">Category</th>
              <th className="p-3 border border-gray-300 font-bold text-sm text-center">Qisam</th>
              <th className="p-3 border border-gray-300 font-bold text-sm text-right">Raqam</th>
            </tr>
          </thead>
          <tbody>
            {reportData.transactions.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500 font-medium border border-gray-300">
                  Muntakhib kardah tareekh mein koi record nahi.
                </td>
              </tr>
            ) : (
              reportData.transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-gray-300">
                  <td className="p-3 border border-gray-300 text-sm whitespace-nowrap">
                    {format(new Date(txn.created_at), 'dd MMM yyyy, hh:mm a')}
                  </td>
                  <td className="p-3 border border-gray-300 font-medium text-sm">{txn.name}</td>
                  
                  {/* Category ka Column aur Badge */}
                  <td className="p-3 border border-gray-300 text-center">
                    {getCategoryBadge(txn.category)}
                  </td>
                  
                  <td className="p-3 border border-gray-300 text-center text-sm font-medium">
                    {txn.type === 'addition' ? (
                      <span className="text-green-600 print:text-black">Aamdani (+)</span>
                    ) : (
                      <span className="text-red-600 print:text-black">Kharcha (-)</span>
                    )}
                  </td>
                  <td className="p-3 border border-gray-300 text-right font-bold text-sm">
                    Rs. {Number(txn.price).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="mt-8 text-center text-xs text-gray-400 print:block hidden">
          Printed on: {format(new Date(), 'dd MMM yyyy, hh:mm a')} - Asset Manager App
        </div>

      </div>
    </div>
  )
}