// This file defines app routes for login, registration, and protected pages
import './App.css'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import LoginPage from './pages/2_LoginPage.jsx'
import RegisterPage from './pages/1_RegisterPage.jsx'
import PetOwnerDashboard from './pages/3_PetOwnerDashboard.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { BookingViewModelProvider } from './components/BookingViewModel.jsx'
import ProfilePage from './pages/5_ProfilePage.jsx'
import BookService_SelectService from './pages/6_BookService_SelectService.jsx'
import BookService_SelectServiceType from './pages/7_BookService_SelectServiceType.jsx'
import BookService_ConfirmBooking from './pages/8_BookService_ConfirmBooking.jsx'
import BookService_TrackStatus from './pages/9_BookService_TrackStatus.jsx'
import MyBookings from './pages/10_MyBookings.jsx'
import ServiceProviderDashboard from './pages/4_ServiceProviderDashboard.jsx'
import MyServicesPage from './pages/11_MyServices.jsx'
import ProviderSchedulePage from './pages/12_ProviderSchedule.jsx'

function BookServiceFlow() {
  return (
    <BookingViewModelProvider>
      <Outlet />
    </BookingViewModelProvider>
  )
}

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
        path="/provider-services"
        element={
          <ProtectedRoute>
            <MyServicesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider-schedule"
        element={
          <ProtectedRoute>
            <ProviderSchedulePage />
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
            <BookServiceFlow />
          </ProtectedRoute>
        }
      >
        <Route index element={<BookService_SelectService />} />
        <Route path="select-service" element={<BookService_SelectServiceType />} />
        <Route path="choose-schedule" element={<BookService_ConfirmBooking />} />
        <Route path="track-status" element={<BookService_TrackStatus />} />
        <Route path="confirm-booking" element={<Navigate to="/book-service/track-status" replace />} />
      </Route>
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
