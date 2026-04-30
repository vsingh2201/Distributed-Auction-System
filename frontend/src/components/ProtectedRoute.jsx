import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { userId } = useAuth()
  return userId ? children : <Navigate to="/" replace />
}
