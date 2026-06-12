import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  function login({ user, token }) {
    localStorage.setItem('user',  JSON.stringify(user))
    localStorage.setItem('token', token)
    setCurrentUser(user)
  }

  function logout() {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setCurrentUser(null)
  }

  function updateCurrentUser(updatedUser) {
    const merged = { ...currentUser, ...updatedUser }
    localStorage.setItem('user', JSON.stringify(merged))
    setCurrentUser(merged)
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
