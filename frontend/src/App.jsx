import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Strategies from './pages/Strategies'
import StrategyDetail from './pages/StrategyDetail'
import CreateStrategy from './pages/CreateStrategy'
import DataUpload from './pages/DataUpload'
import Datasets from './pages/Datasets'
import Backtests from './pages/Backtests'
import BacktestDetail from './pages/BacktestDetail'
import Layout from './components/Layout'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth)
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  return <Layout>{children}</Layout>
}

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth)
  
  if (token) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/strategies" element={
        <ProtectedRoute>
          <Strategies />
        </ProtectedRoute>
      } />
      <Route path="/strategies/create" element={
        <ProtectedRoute>
          <CreateStrategy />
        </ProtectedRoute>
      } />
      <Route path="/strategies/:id" element={
        <ProtectedRoute>
          <StrategyDetail />
        </ProtectedRoute>
      } />
      <Route path="/data/upload" element={
        <ProtectedRoute>
          <DataUpload />
        </ProtectedRoute>
      } />
      <Route path="/data" element={
        <ProtectedRoute>
          <Datasets />
        </ProtectedRoute>
      } />
      <Route path="/backtests" element={
        <ProtectedRoute>
          <Backtests />
        </ProtectedRoute>
      } />
      <Route path="/backtests/:id" element={
        <ProtectedRoute>
          <BacktestDetail />
        </ProtectedRoute>
      } />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
