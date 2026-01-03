/**
 * App.jsx - Main Application Component (MVC Pattern)
 * 
 * Architecture Overview:
 * - Models (src/models/): Data access layer - Supabase operations
 * - Views (src/pages/, src/components/): UI components
 * - Controllers (src/controllers/): Business logic hooks
 * - Contexts (src/context/): Global state management
 */
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import AdminShop from './pages/AdminShop';
import DisastersFeed from './pages/DisastersFeed';
import DisasterDetail from './pages/DisasterDetail';
import MedicalCases from './pages/MedicalCases';
import MedicalDetail from './pages/MedicalDetail';
import CreateMission from './pages/CreateMission';
import Profile from './pages/Profile';
import ApplyVolunteer from './pages/ApplyVolunteer';
import VolunteerHub from './pages/VolunteerHub';
import VolunteerFeed from './pages/VolunteerFeed';
import NotFound from './pages/NotFound';
import Donations from './pages/Donations';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAdmin, isVolunteer } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if user has one of them
  if (allowedRoles.length > 0) {
    const hasRole = allowedRoles.some(role => {
      if (role === 'admin') return isAdmin;
      if (role === 'volunteer') return isVolunteer;
      return false;
    });

    if (!hasRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Hidden Admin Route */}
            <Route path="/secret-admin-login" element={<AdminLogin />} />

            {/* Protected Routes wrapped in Layout */}
            <Route element={<Layout />}>
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
                path="/donations"
                element={
                  <ProtectedRoute>
                    <Donations />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/volunteer-application"
                element={
                  <ProtectedRoute>
                    <ApplyVolunteer />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/create-mission"
                element={
                  <ProtectedRoute>
                    <CreateMission />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/volunteer-hub"
                element={
                  <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
                    <VolunteerHub />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/volunteer-feed"
                element={
                  <ProtectedRoute>
                    <VolunteerFeed />
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

              {/* Shop Routes */}
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/:id" element={<ProductDetails />} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
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
            </Route>

            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/shop"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminShop />
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
