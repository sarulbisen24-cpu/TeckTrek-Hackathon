import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from '@/context/AppContext';
import AppLayout from '@/components/AppLayout';
import AuthPage from '@/pages/AuthPage';
import Dashboard from '@/pages/Dashboard';
import SearchParking from '@/pages/SearchParking';
import ParkingDetails from '@/pages/ParkingDetails';
import FindNearby from '@/pages/FindNearby';
import Bookings from '@/pages/Bookings';
import DashboardStats from '@/pages/DashboardStats';
import AdminDashboard from '@/pages/AdminDashboard';
import Profile from '@/pages/Profile';
import Notifications from '@/pages/Notifications';
import About from '@/pages/About';
import type { JSX } from 'react';

function ProtectedRoute({ children, adminOnly = false }: { children: JSX.Element; adminOnly?: boolean }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/" replace />;
  if (adminOnly && currentUser.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }: { children: JSX.Element }) {
  const { currentUser } = useApp();
  if (currentUser) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><AuthPage /></PublicRoute>} />

      {/* Protected app routes with shared layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/search" element={<SearchParking />} />
        <Route path="/parking/:id" element={<ParkingDetails />} />
        <Route path="/nearby" element={<FindNearby />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/dashboard-stats" element={<DashboardStats />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
      </Route>

      {/* Admin-only route */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
