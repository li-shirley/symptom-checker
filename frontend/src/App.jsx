// App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from './hooks/useAuth.js';

import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import SymptomHistory from './pages/SymptomHistory.jsx';

import Navbar from "./components/Navbar.jsx";

// ProtectedRoute reads auth context internally
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      // todo: make it a cute loading widget
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  return children;
};

const App = () => {
  const { user } = useAuthContext();

  return (
    <div data-theme="pastel">
      <Navbar />

      <Routes>
        {/* Home */}
        <Route path="/" element={<HomePage />} />

        {/* Login & Signup */}
        <Route
          path="/login"
          element={user ? <Navigate to="/history" /> : <LoginPage />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/history" /> : <SignupPage />}
        />

        {/* Protected: Symptom History */}
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <SymptomHistory />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;
