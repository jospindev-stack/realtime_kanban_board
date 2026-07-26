import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('kanban_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('kanban_token') ?? null)

  const login = useCallback((userData, jwt) => {
    localStorage.setItem('kanban_user', JSON.stringify(userData))
    localStorage.setItem('kanban_token', jwt)
    setUser(userData)
    setToken(jwt)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('kanban_user')
    localStorage.removeItem('kanban_token')
    setUser(null)
    setToken(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
