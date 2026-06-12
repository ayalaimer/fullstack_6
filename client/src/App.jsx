import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage    from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AppPage      from './pages/AppPage'
import ProfilePage  from './pages/ProfilePage'
import AdminPage    from './pages/AdminPage'

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  if (currentUser.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function DefaultRedirect() {
  const { currentUser } = useAuth()
  if (currentUser) return <Navigate to={`/users/${currentUser.username}/todos`} replace />
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/users/:username/todos"
            element={<ProtectedRoute><AppPage view="todos" /></ProtectedRoute>}
          />
          <Route
            path="/users/:username/posts"
            element={<ProtectedRoute><AppPage view="posts" /></ProtectedRoute>}
          />
          <Route
            path="/users/:username/albums"
            element={<ProtectedRoute><AppPage view="albums" /></ProtectedRoute>}
          />
          <Route
            path="/users/:username/profile"
            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
          />
          <Route
            path="/admin"
            element={<AdminRoute><AdminPage /></AdminRoute>}
          />
          <Route path="*" element={<DefaultRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
