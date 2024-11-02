import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Registration from './components/Registration';
import VideoQuestion from './components/VideoQuestion';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import DashboardLayout from './components/admin/DashboardLayout';
import ThankYouPage from './components/ThankYouPage';
import ProtectedRoute from './components/admin/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Registration />} />
          <Route path="/questionnaire" element={<VideoQuestion />} />
          <Route path="/thank-you" element={<ThankYouPage videoUrl="https://iframe.mediadelivery.net/embed/331912/b011f995-3f62-4b60-b829-ad6a3090c56f" />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}