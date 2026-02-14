import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from './hooks/useAuthContext.js';

import HomePage from './pages/HomePage.jsx';
import SymptomCheck from './pages/SymptomCheck.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import SymptomHistory from './pages/SymptomHistory.jsx';
import UserAccount from './pages/UserAccount.jsx'
import ChangePassword from './pages/ChangePassword.jsx'

import Navbar from './components/Navbar.jsx';

const FullPageLoader = ({ text = "Loading..." }) => (
  <div className="h-screen flex flex-col items-center justify-center gap-4">
    <span className="loading loading-spinner loading-lg text-primary"></span>
    <p className="text-sm opacity-70">{text}</p>
  </div>
);

// ProtectedRoute reads auth context internally
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthContext();

  if (loading) return <FullPageLoader />;

  if (!user) return <Navigate to="/login" replace />;

  return children;
};

const App = () => {
  const { user, loading } = useAuthContext();

  return (
    <div data-theme="lemonade">
      <Navbar />

      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/check-symptoms" element={<SymptomCheck />} />

        <Route
          path="/login"
          element={
            loading ? (
              <FullPageLoader />
            ) : user ? (
              <Navigate to="/history" replace />
            ) : (
              <LoginPage />
            )
          }
        />

        <Route
          path="/signup"
          element={
            loading ? (
              <FullPageLoader />
            ) : user ? (
              <Navigate to="/history" replace />
            ) : (
              <SignupPage />
            )
          }
        />

        {/* Protected */}
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <SymptomHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <UserAccount />
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
