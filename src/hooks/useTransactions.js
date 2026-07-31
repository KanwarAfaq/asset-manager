import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useTransactions() {
  const [allTransactions, setAllTransactions] = useState([])
  const [stats, setStats] = useState({ 
    totalAdded: 0, lastAdded: null, 
    totalSubtracted: 0, lastSubtracted: null,
    netBalance: 0 // NAYA: Net Balance ke liye
  })
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    setLoading(true)
    // NAYA: 'users' table se Indraj karne wale ki tafseel bhi fetch kar rahe hain
    const { data, error } = await supabase
      .from('transactions')
      .select('*, users(email, role), transaction_notes(note, created_at, users(email, role))')
      .order('created_at', { ascending: true })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    let accountBal = 0;
    let runAdd = 0;
    let runSub = 0;
    let tAdd = 0;
    let tSub = 0;
    let lAdd = null;
    let lSub = null;

    const processed = data.map(txn => {
      const prevAcc = accountBal;
      const prevAdd = runAdd;
      const prevSub = runSub;
      const amt = Number(txn.price);

      // Latest note nikalne ka logic
      let latestNote = null;
      if (txn.transaction_notes && txn.transaction_notes.length > 0) {
        const sortedNotes = [...txn.transaction_notes].sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
        const last = sortedNotes[sortedNotes.length - 1];
        // Note ke sath likhne wale ka naam bhi dikhaenge
        latestNote = `${last.note} (${last.users?.email?.split('@')[0]})`;
      }

      if (txn.type === 'addition') {
        accountBal += amt;
        runAdd += amt;
        tAdd += amt;
        lAdd = txn;
        return { ...txn, prevAcc, newAcc: accountBal, prevTypeBal: prevAdd, newTypeBal: runAdd, latestNote }
      } else {
        accountBal -= amt;
        runSub += amt;
        tSub += amt;
        lSub = txn;
        return { ...txn, prevAcc, newAcc: accountBal, prevTypeBal: prevSub, newTypeBal: runSub, latestNote }
      }
    })

    setAllTransactions(processed.reverse())
    setStats({ 
      totalAdded: tAdd, 
      lastAdded: lAdd, 
      totalSubtracted: tSub, 
      lastSubtracted: lSub,
      netBalance: tAdd - tSub // Calculate Total Balance
    })
    setLoading(false)
  }

  useEffect(() => {
    fetchAll()
  }, [])

  return { allTransactions, stats, loading, refetch: fetchAll }
}