import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [userId,    setUserId]    = useState(() => localStorage.getItem('userId'))
  const [userName,  setUserName]  = useState(() => localStorage.getItem('userName'))
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail'))

  function login(user) {
    localStorage.setItem('userId',    String(user.id))
    localStorage.setItem('userName',  user.username || '')
    localStorage.setItem('userEmail', user.email    || '')
    setUserId(String(user.id))
    setUserName(user.username || '')
    setUserEmail(user.email   || '')
  }

  function logout() {
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    setUserId(null)
    setUserName(null)
    setUserEmail(null)
  }

  return (
    <AuthContext.Provider value={{ userId, userName, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
