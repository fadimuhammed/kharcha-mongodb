import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from './context/AuthContext';
import Layout        from './components/Layout';
import LoginPage     from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ExpensesPage  from './pages/ExpensesPage';
import AiPage        from './pages/AiPage';

function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={
          <Protected>
            <Layout>
              <Routes>
                <Route path="/"         element={<DashboardPage />} />
                <Route path="/expenses" element={<ExpensesPage />}  />
                <Route path="/ai"       element={<AiPage />}        />
                <Route path="*"         element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </Protected>
        } />
      </Routes>
    </HashRouter>
  );
}
