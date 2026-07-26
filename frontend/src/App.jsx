import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import KanbanBoard from './components/KanbanBoard.jsx'

function AppContent() {
  const { user } = useAuth()
  const [showRegister, setShowRegister] = useState(false)

  if (user) return <KanbanBoard />

  return showRegister
    ? <Register onSwitch={() => setShowRegister(false)} />
    : <Login onSwitch={() => setShowRegister(true)} />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
