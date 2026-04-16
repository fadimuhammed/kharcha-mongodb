import { useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend,
} from 'chart.js';
import { useExpenses } from '../hooks/useExpenses';
import ExpenseModal from '../components/ExpenseModal';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const CAT_COLORS = {
  Food:'#1D9E75', Transport:'#378ADD', Housing:'#7F77DD',
  Health:'#D85A30', Shopping:'#D4537E', Entertainment:'#BA7517',
  Utilities:'#639922', Other:'#888780',
};
const ALL_CATS = Object.keys(CAT_COLORS);

function StatCard({ label, value, sub, color, raw }) {
  return (
    <div style={{ background:'#f3f4f6', borderRadius:10, padding:'0.9rem 1rem', flex:1, minWidth:130 }}>
      <p style={{ fontSize:12, color:'var(--text-2)', marginBottom:4 }}>{label}</p>
      <p style={{ fontSize:22, fontWeight:700, color: color || 'var(--text)', letterSpacing:'-0.5px' }}>
        {raw ?? ('₹' + Number(value || 0).toLocaleString('en-IN'))}
      </p>
      {sub && <p style={{ fontSize:11, color:'var(--text-3)', marginTop:2 }}>{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { expenses, summary, loading, error, addExpense } = useExpenses();
  const [showAdd, setShowAdd] = useState(false);

  if (loading) return <p style={{ color:'var(--text-2)', padding:'2rem' }}>Loading…</p>;
  if (error)   return <p style={{ color:'var(--red)',   padding:'2rem' }}>{error}</p>;

  const thisMonth  = new Date().toISOString().slice(0, 7);
  const monthTotal = expenses.filter(e => e.date.startsWith(thisMonth)).reduce((s, e) => s + e.amount, 0);
  const allTotal   = expenses.reduce((s, e) => s + e.amount, 0);
  const topCat     = summary?.byCategory?.[0]?.category || '—';
  const topAmt     = summary?.byCategory?.[0]?.total    || 0;

  // Bar chart — last 6 months stacked by category
  const months = (summary?.monthly || []).slice(-6);
  const mbc    = summary?.monthlyByCategory || [];

  const barData = {
    labels: months.map(m => {
      const [y, mo] = m.month.split('-');
      return new Date(+y, +mo - 1).toLocaleString('default', { month: 'short' });
    }),
    datasets: ALL_CATS.map(cat => ({
      label:           cat,
      data:            months.map(m => mbc.find(r => r.month === m.month && r.category === cat)?.total || 0),
      backgroundColor: CAT_COLORS[cat],
      borderRadius:    3,
      borderSkipped:   false,
    })),
  };

  const barOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ₹${ctx.parsed.y.toLocaleString('en-IN')}` } },
    },
    scales: {
      x: { stacked: true, grid: { display: false },                   ticks: { color: '#9ca3af' } },
      y: { stacked: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#9ca3af', callback: v => '₹' + v.toLocaleString('en-IN') } },
    },
  };

  // Donut chart
  const byCat = summary?.byCategory || [];
  const donutData = {
    labels:   byCat.map(c => c.category),
    datasets: [{ data: byCat.map(c => c.total), backgroundColor: byCat.map(c => CAT_COLORS[c.category] || '#888'), borderWidth: 0, hoverOffset: 4 }],
  };
  const donutOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 10, padding: 8, color: '#6b7280' } },
      tooltip: { callbacks: { label: ctx => `₹${ctx.parsed.toLocaleString('en-IN')}` } },
    },
    cutout: '65%',
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h1 style={{ fontSize:20, fontWeight:700 }}>Dashboard</h1>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Add expense</button>
      </div>

      {/* Stat cards */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <StatCard label="This month"    value={monthTotal} sub={thisMonth}                           color="var(--teal)" />
        <StatCard label="All time"      value={allTotal}   sub={`${expenses.length} transactions`} />
        <StatCard label="Top category"  raw={topCat}       sub={`₹${topAmt.toLocaleString('en-IN')}`} />
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
        <div className="card">
          <p style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Monthly spending</p>
          <div style={{ height:220 }}>
            {months.length > 0
              ? <Bar data={barData} options={barOpts} />
              : <p style={{ color:'var(--text-3)', fontSize:13 }}>No data yet</p>}
          </div>
        </div>
        <div className="card">
          <p style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>By category</p>
          <div style={{ height:220 }}>
            {byCat.length > 0
              ? <Doughnut data={donutData} options={donutOpts} />
              : <p style={{ color:'var(--text-3)', fontSize:13 }}>No data yet</p>}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card">
        <p style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Recent transactions</p>
        {expenses.length === 0 && (
          <p style={{ color:'var(--text-3)', fontSize:13, textAlign:'center', padding:'1.5rem' }}>
            No expenses yet — add your first one!
          </p>
        )}
        {expenses.slice(0, 8).map(e => (
          <div key={e._id || e.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background: CAT_COLORS[e.category] || '#888', flexShrink:0 }} />
              <div>
                <p style={{ fontWeight:500, fontSize:13 }}>{e.description}</p>
                <p style={{ fontSize:11, color:'var(--text-3)' }}>{e.date} · {e.category}</p>
              </div>
            </div>
            <span style={{ fontWeight:700, color:'var(--red)', fontSize:14 }}>
              −₹{e.amount.toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>

      {showAdd && <ExpenseModal onSave={addExpense} onClose={() => setShowAdd(false)} />}
    </div>
  );
}
