import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import DisastersFeed from './pages/DisastersFeed';
import DisasterDetail from './pages/DisasterDetail';
import MedicalCases from './pages/MedicalCases';
import MedicalDetail from './pages/MedicalDetail';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Hidden Admin Route */}
          <Route path="/secret-admin-login" element={<AdminLogin />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/disasters"
            element={
              <ProtectedRoute>
                <DisastersFeed />
              </ProtectedRoute>
            }
          />

          <Route
            path="/disasters/:id"
            element={
              <ProtectedRoute>
                <DisasterDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Medical Routes */}
          <Route
            path="/medical"
            element={
              <ProtectedRoute>
                <MedicalCases />
              </ProtectedRoute>
            }
          />

          <Route
            path="/medical/:id"
            element={
              <ProtectedRoute>
                <MedicalDetail />
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
