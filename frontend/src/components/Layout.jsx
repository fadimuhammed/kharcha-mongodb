import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/',         label: 'Dashboard' },
  { to: '/expenses', label: 'Expenses'  },
  { to: '/ai',       label: 'AI Advisor'},
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1020, margin: '0 auto', padding: '0 1.25rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
                <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
              </svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: '-0.3px' }}>Kharcha</span>
          </div>

          <nav style={{ display: 'flex', gap: 2 }}>
            {NAV.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'}
                style={({ isActive }) => ({
                  padding: '5px 14px', borderRadius: 8, fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color:      isActive ? 'var(--teal)' : 'var(--text-2)',
                  background: isActive ? 'var(--teal-pale)' : 'transparent',
                  textDecoration: 'none', transition: 'all .15s',
                })}>
                {label}
              </NavLink>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Hi, {user?.name?.split(' ')[0]}</span>
            <button onClick={() => { logout(); navigate('/login'); }}
              style={{ fontSize: 12, padding: '4px 10px', color: 'var(--text-2)' }}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: 1020, margin: '0 auto', width: '100%', padding: '1.5rem 1.25rem' }}>
        {children}
      </main>
    </div>
  );
}
