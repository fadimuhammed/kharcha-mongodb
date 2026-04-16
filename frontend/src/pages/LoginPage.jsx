import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', name: '', password: '' });
  const [err,  setErr]  = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (mode === 'register' && !form.name.trim()) return setErr('Full name is required');
    setBusy(true);
    try {
      if (mode === 'login') await login(form.username, form.password);
      else                  await register(form.username, form.name, form.password);
      navigate('/');
    } catch (ex) {
      setErr(ex.response?.data?.error || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 54, height: 54, borderRadius: 14, background: 'var(--teal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' }}>Kharcha</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 13, marginTop: 4 }}>Track your expenses, own your money</p>
        </div>

        {/* Tab */}
        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 18, overflow: 'hidden' }}>
          {['login', 'register'].map((m) => (
            <button key={m} type="button"
              onClick={() => { setMode(m); setErr(''); }}
              style={{ flex: 1, borderRadius: 0, border: 'none', padding: '9px 0',
                background: mode === m ? 'var(--teal)' : 'transparent',
                color:      mode === m ? '#fff' : 'var(--text-2)',
                fontWeight: mode === m ? 600 : 400 }}>
              {m === 'login' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        <form className="card" onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Username</label>
            <input value={form.username} onChange={set('username')} placeholder="alice" required autoFocus />
          </div>

          {mode === 'register' && (
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Full name</label>
              <input value={form.name} onChange={set('name')} placeholder="Alice Chen" />
            </div>
          )}

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Password</label>
            <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required minLength={6} />
          </div>

          {err && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: -4 }}>{err}</p>}

          <button type="submit" className="btn-primary" style={{ marginTop: 2 }} disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>

          {mode === 'login' && (
            <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center' }}>
              Demo accounts: alice / alice123 &nbsp;·&nbsp; bob / bob456
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
