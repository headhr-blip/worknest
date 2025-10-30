import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Layout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', background: '#1e293b', color: 'white', padding: '20px' }}>
        <h2 style={{ marginBottom: '30px' }}>WorkNest</h2>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '10px' }}>
              <NavLink to="/dashboard" style={({ isActive }) => ({ 
                color: isActive ? '#60a5fa' : 'white', 
                textDecoration: 'none',
                display: 'block',
                padding: '10px',
                borderRadius: '5px',
                background: isActive ? '#334155' : 'transparent'
              })}>
                Dashboard
              </NavLink>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <NavLink to="/attendance" style={({ isActive }) => ({ 
                color: isActive ? '#60a5fa' : 'white', 
                textDecoration: 'none',
                display: 'block',
                padding: '10px',
                borderRadius: '5px',
                background: isActive ? '#334155' : 'transparent'
              })}>
                Attendance
              </NavLink>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <NavLink to="/leave" style={({ isActive }) => ({ 
                color: isActive ? '#60a5fa' : 'white', 
                textDecoration: 'none',
                display: 'block',
                padding: '10px',
                borderRadius: '5px',
                background: isActive ? '#334155' : 'transparent'
              })}>
                Leave
              </NavLink>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <NavLink to="/expenses" style={({ isActive }) => ({ 
                color: isActive ? '#60a5fa' : 'white', 
                textDecoration: 'none',
                display: 'block',
                padding: '10px',
                borderRadius: '5px',
                background: isActive ? '#334155' : 'transparent'
              })}>
                Expenses
              </NavLink>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <NavLink to="/loans" style={({ isActive }) => ({ 
                color: isActive ? '#60a5fa' : 'white', 
                textDecoration: 'none',
                display: 'block',
                padding: '10px',
                borderRadius: '5px',
                background: isActive ? '#334155' : 'transparent'
              })}>
                Loans
              </NavLink>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <NavLink to="/profile" style={({ isActive }) => ({ 
                color: isActive ? '#60a5fa' : 'white', 
                textDecoration: 'none',
                display: 'block',
                padding: '10px',
                borderRadius: '5px',
                background: isActive ? '#334155' : 'transparent'
              })}>
                Profile
              </NavLink>
            </li>
          </ul>
        </nav>
        <button 
          onClick={handleSignOut}
          style={{ 
            marginTop: '50px', 
            width: '100%', 
            padding: '10px', 
            background: '#dc2626', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer' 
          }}
        >
          Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, background: '#f1f5f9' }}>
        {/* Header */}
        <header style={{ background: 'white', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h1 style={{ margin: 0 }}>Welcome, {profile?.first_name || 'User'}!</h1>
        </header>

        {/* Page Content */}
        <main style={{ padding: '30px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
