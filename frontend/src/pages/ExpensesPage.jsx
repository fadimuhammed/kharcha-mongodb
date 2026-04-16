import { useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import ExpenseModal from '../components/ExpenseModal';

const CATS = ['All','Food','Transport','Housing','Health','Shopping','Entertainment','Utilities','Other'];

const CAT_COLORS = {
  Food:'#1D9E75', Transport:'#378ADD', Housing:'#7F77DD',
  Health:'#D85A30', Shopping:'#D4537E', Entertainment:'#BA7517',
  Utilities:'#639922', Other:'#888780',
};

export default function ExpensesPage() {
  const [filterCat,   setFilterCat]   = useState('All');
  const [filterMonth, setFilterMonth] = useState('All');
  const [showAdd,     setShowAdd]     = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [deleting,    setDeleting]    = useState(null);
  const [delBusy,     setDelBusy]     = useState(false);

  const { expenses, summary, loading, error, addExpense, updateExpense, deleteExpense } = useExpenses({
    category: filterCat,
    month:    filterMonth,
  });

  const allMonths = [...new Set((summary?.monthly || []).map(m => m.month))].sort().reverse();
  const total     = expenses.reduce((s, e) => s + e.amount, 0);

  const confirmDelete = async () => {
    if (!deleting) return;
    setDelBusy(true);
    try {
      await deleteExpense(deleting);
      setDeleting(null);
    } finally {
      setDelBusy(false);
    }
  };

  if (loading) return <p style={{ color:'var(--text-2)', padding:'2rem' }}>Loading…</p>;
  if (error)   return <p style={{ color:'var(--red)',    padding:'2rem' }}>{error}</p>;

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:8 }}>
        <h1 style={{ fontSize:20, fontWeight:700 }}>Expenses</h1>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Add expense</button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom:12 }}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ flex:1, minWidth:130 }}>
            {CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ flex:1, minWidth:150 }}>
            <option value="All">All months</option>
            {allMonths.map(m => (
              <option key={m} value={m}>
                {new Date(m + '-01').toLocaleString('default', { month:'long', year:'numeric' })}
              </option>
            ))}
          </select>
          {(filterCat !== 'All' || filterMonth !== 'All') && (
            <button onClick={() => { setFilterCat('All'); setFilterMonth('All'); }} style={{ fontSize:12, color:'var(--text-2)', whiteSpace:'nowrap' }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
          <p style={{ fontSize:13, color:'var(--text-2)' }}>{expenses.length} {expenses.length === 1 ? 'entry' : 'entries'}</p>
          <p style={{ fontSize:13, fontWeight:700 }}>Total: ₹{total.toLocaleString('en-IN')}</p>
        </div>

        {expenses.length === 0 && (
          <p style={{ color:'var(--text-3)', textAlign:'center', padding:'2rem', fontSize:13 }}>
            No expenses found. Try adjusting the filters.
          </p>
        )}

        {expenses.map(e => {
          const eid = e._id || e.id;
          return (
            <div key={eid} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)', gap:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
                <div style={{ width:9, height:9, borderRadius:'50%', background: CAT_COLORS[e.category] || '#888', flexShrink:0 }} />
                <div style={{ minWidth:0 }}>
                  <p style={{ fontWeight:500, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.description}</p>
                  <p style={{ fontSize:11, color:'var(--text-3)' }}>{e.date}</p>
                </div>
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                <span className="tag" style={{ background:(CAT_COLORS[e.category] || '#888')+'22', color: CAT_COLORS[e.category] || '#888' }}>
                  {e.category}
                </span>
                <span style={{ fontWeight:700, fontSize:14, minWidth:72, textAlign:'right' }}>
                  ₹{e.amount.toLocaleString('en-IN')}
                </span>
                <button onClick={() => setEditing(e)} style={{ padding:'3px 9px', fontSize:12, color:'var(--text-2)' }}>Edit</button>
                <button onClick={() => setDeleting(eid)} className="btn-danger" style={{ padding:'3px 9px', fontSize:12 }}>×</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add modal */}
      {showAdd && <ExpenseModal onSave={addExpense} onClose={() => setShowAdd(false)} />}

      {/* Edit modal */}
      {editing && (
        <ExpenseModal
          initial={{ description: editing.description, amount: editing.amount, category: editing.category, date: editing.date }}
          onSave={(payload) => updateExpense(editing._id || editing.id, payload)}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Delete confirm */}
      {deleting && (
        <div onClick={() => setDeleting(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:'1rem' }}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ maxWidth:340, textAlign:'center' }}>
            <p style={{ fontWeight:600, marginBottom:8, fontSize:15 }}>Delete this expense?</p>
            <p style={{ fontSize:13, color:'var(--text-2)', marginBottom:18 }}>This cannot be undone.</p>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setDeleting(null)} style={{ flex:1 }}>Cancel</button>
              <button onClick={confirmDelete} className="btn-danger" style={{ flex:1 }} disabled={delBusy}>
                {delBusy ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
