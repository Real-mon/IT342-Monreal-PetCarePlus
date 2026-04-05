// This file defines app routes for login, registration, and protected pages
import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/2_LoginPage.jsx'
import RegisterPage from './pages/1_RegisterPage.jsx'
import PetOwnerDashboard from './pages/3_PetOwnerDashboard.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import ProfilePage from './pages/5_ProfilePage.jsx'
import BookService_SelectService from './pages/6_BookService_SelectService.jsx'
import BookService_ChooseSchedule from './pages/7_BookService_ChooseSchedule.jsx'
import MyBookings from './pages/10_MyBookings.jsx'
import ServiceProviderDashboard from './pages/4_ServiceProviderDashboard.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/provider-dashboard"
        element={
          <ProtectedRoute>
            <ServiceProviderDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <PetOwnerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/book-service"
        element={
          <ProtectedRoute>
            <BookService_SelectService />
          </ProtectedRoute>
        }
      />
      <Route
        path="/book-service/choose-schedule"
        element={
          <ProtectedRoute>
            <BookService_ChooseSchedule />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
