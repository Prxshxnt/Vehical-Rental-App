import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login          from './pages/Login';
import Signup         from './pages/Signup';
import Home           from './pages/Home';
import VehicleDetails from './pages/VehicleDetails';
import BookingPage    from './pages/BookingPage';
import MyBookings     from './pages/MyBookings';
import PaymentPage    from './pages/PaymentPage';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/signup"        element={<Signup />} />
          <Route path="/vehicles/:id"  element={<VehicleDetails />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/book/:vehicleId"  element={<BookingPage />} />
            <Route path="/my-bookings"      element={<MyBookings />} />
            <Route path="/payment/:bookingId" element={<PaymentPage />} />
          </Route>

          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#12121a',
              color: '#f1f1f5',
              border: '1px solid rgba(255,255,255,0.08)',
              fontFamily: 'DM Sans, sans-serif',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#12121a' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#12121a' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
