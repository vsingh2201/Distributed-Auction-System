import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import CataloguePage from './pages/CataloguePage'
import BidPage from './pages/BidPage'
import UploadItemPage from './pages/UploadItemPage'
import PayPage from './pages/PayPage'
import PaymentPage from './pages/PaymentPage'
import ReceiptPage from './pages/ReceiptPage'

export default function App() {
  return (
    <Routes>
      <Route path="/"                element={<LoginPage />} />
      <Route path="/signup"          element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/catalogue"  element={<ProtectedRoute><CataloguePage /></ProtectedRoute>} />
      <Route path="/bid"        element={<ProtectedRoute><BidPage /></ProtectedRoute>} />
      <Route path="/upload-item" element={<ProtectedRoute><UploadItemPage /></ProtectedRoute>} />
      <Route path="/pay"        element={<ProtectedRoute><PayPage /></ProtectedRoute>} />
      <Route path="/payment"    element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
      <Route path="/receipt"    element={<ProtectedRoute><ReceiptPage /></ProtectedRoute>} />
      <Route path="*"           element={<Navigate to="/" replace />} />
    </Routes>
  )
}
