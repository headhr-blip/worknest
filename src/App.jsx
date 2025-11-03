import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Attendance from './pages/Attendance'
import Leave from './pages/Leave'
import Expenses from './pages/Expenses'
import Loans from './pages/Loans'
import Profile from './pages/Profile'
import EmployeeManagement from './pages/EmployeeManagement'
import DocumentManagement from './pages/DocumentManagement'
import RoleManagement from './pages/RoleManagement'
import Approvals from './pages/Approvals'
import PayrollManagement from './pages/PayrollManagement'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="leave" element={<Leave />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="loans" element={<Loans />} />
            <Route path="profile" element={<Profile />} />
            <Route path="employees" element={<EmployeeManagement />} />
            <Route path="documents" element={<DocumentManagement />} />
            <Route path="roles" element={<RoleManagement />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="payroll" element={<PayrollManagement />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
