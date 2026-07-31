import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useTransactions() {
  const [allTransactions, setAllTransactions] = useState([])
  const [stats, setStats] = useState({ 
    totalAdded: 0, lastAdded: null, 
    totalSubtracted: 0, lastSubtracted: null,
    netBalance: 0 
  })
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    setLoading(true)

    // 1. DATABASE SE TOTALS FETCH KAREIN (Direct View se)
    const { data: summaryData, error: summaryError } = await supabase
      .from('account_summary')
      .select('*')
      .single()

    if (summaryError && summaryError.code !== 'PGRST116') {
      console.error("Summary fetch error:", summaryError)
    }

    // 2. DATABASE SE TRANSACTIONS AUR UNKA RUNNING BALANCE FETCH KAREIN
    const { data: txnsData, error: txnsError } = await supabase
      .from('transactions_with_balances')
      .select('*, users(email, role), transaction_notes(note, created_at, users(email, role))')
      .order('created_at', { ascending: false }) // Seedha newest first laya ja raha hai

    if (txnsError) {
      console.error("Transactions fetch error:", txnsError)
      setLoading(false)
      return
    }

    let lAdd = null;
    let lSub = null;

    // 3. UI KE LIYE SIRF DATA FORMAT KAREIN (Math ab database kar raha hai)
    const processed = txnsData.map(txn => {
      const amt = Number(txn.price);

      // Latest addition aur subtraction nikalne ke liye
      if (txn.type === 'addition' && !lAdd) lAdd = txn;
      if (txn.type === 'subtraction' && !lSub) lSub = txn;

      // Latest note nikalne ka logic
      let latestNote = null;
      if (txn.transaction_notes && txn.transaction_notes.length > 0) {
        const sortedNotes = [...txn.transaction_notes].sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
        const last = sortedNotes[sortedNotes.length - 1];
        latestNote = `${last.note} (${last.users?.email?.split('@')[0]})`;
      }

      // Database ke diye gaye sums ko Frontend variables se map karein
      const newAcc = Number(txn.running_net_balance);
      const prevAcc = txn.type === 'addition' ? newAcc - amt : newAcc + amt;
      
      const newTypeBal = txn.type === 'addition' ? Number(txn.running_addition) : Number(txn.running_subtraction);
      const prevTypeBal = newTypeBal - amt;

      return { 
        ...txn, 
        newAcc, 
        prevAcc, 
        newTypeBal, 
        prevTypeBal, 
        latestNote 
      }
    })

    setAllTransactions(processed)
    
    // Stats ko direct DB Summary se update karein
    setStats({ 
      totalAdded: summaryData ? Number(summaryData.total_added) : 0, 
      lastAdded: lAdd, 
      totalSubtracted: summaryData ? Number(summaryData.total_subtracted) : 0, 
      lastSubtracted: lSub,
      netBalance: summaryData ? Number(summaryData.net_balance) : 0 
    })
    
    setLoading(false)
  }

  useEffect(() => {
    fetchAll()
  }, [])

  return { allTransactions, stats, loading, refetch: fetchAll }
}