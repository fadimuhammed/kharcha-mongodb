import { useState, useEffect } from 'react';

const CATS = ['Food','Transport','Housing','Health','Shopping','Entertainment','Utilities','Other'];

export default function ExpenseModal({ initial, onSave, onClose }) {
  const editing = !!initial;
  const [form, setForm] = useState({
    description: '',
    amount:      '',
    category:    'Food',
    date:        new Date().toISOString().slice(0, 10),
    ...initial,
  });
  const [err,  setErr]  = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.description.trim())                          return setErr('Description is required');
    if (!form.amount || isNaN(form.amount) || +form.amount <= 0) return setErr('Enter a valid amount');
    setBusy(true);
    try {
      await onSave({ ...form, amount: +form.amount });
      onClose();
    } catch (ex) {
      setErr(ex.response?.data?.error || 'Failed to save');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}
    >
      <div className="card" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 400 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>{editing ? 'Edit expense' : 'Add expense'}</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 22, color: 'var(--text-3)', padding: '0 4px', lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Description</label>
            <input value={form.description} onChange={set('description')} placeholder="e.g. Morning coffee" required />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Amount (₹)</label>
            <input type="number" value={form.amount} onChange={set('amount')} placeholder="0" min="1" step="0.01" required />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Category</label>
            <select value={form.category} onChange={set('category')}>
              {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Date</label>
            <input type="date" value={form.date} onChange={set('date')} required />
          </div>

          {err && <p style={{ color: 'var(--red)', fontSize: 12 }}>{err}</p>}

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={busy}>
              {busy ? 'Saving…' : editing ? 'Update' : 'Add expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
