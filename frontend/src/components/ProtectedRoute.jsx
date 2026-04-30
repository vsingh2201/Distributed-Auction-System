import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from './Navbar'

export default function ProtectedRoute({ children }) {
  const { userId } = useAuth()
  if (!userId) return <Navigate to="/" replace />
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}
