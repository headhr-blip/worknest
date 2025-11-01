import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Layout() {
  const { profile, user, signOut } = useAuth()
  const navigate = useNavigate()
  const [userRoles, setUserRoles] = useState([])

  useEffect(() => {
    fetchUserRoles()
  }, [user])

  const fetchUserRoles = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('userroles')
        .select('role')
        .eq('user_id', user.id)

      if (error) throw error
      setUserRoles(data.map(r => r.role))
    } catch (error) {
      console.error('Error fetching roles:', error)
    }
  }

  const hasRole = (roles) => {
    return roles.some(role => userRoles.includes(role))
  }

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
                📊 Dashboard
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
                ⏰ Attendance
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
                🏖️ Leave
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
                💰 Expenses
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
                🏦 Loans
              </NavLink>
            </li>

            {/* Manager/HR Section */}
            {hasRole(['manager', 'team_lead', 'hr', 'hr_head', 'branch_hr', 'super_admin', 'admin']) && (
              <>
                <li style={{ marginTop: '30px', marginBottom: '10px', padding: '10px', color: '#94a3b8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                  Management
                </li>
                <li style={{ marginBottom: '10px' }}>
                  <NavLink to="/approvals" style={({ isActive }) => ({ 
                    color: isActive ? '#60a5fa' : 'white', 
                    textDecoration: 'none',
                    display: 'block',
                    padding: '10px',
                    borderRadius: '5px',
                    background: isActive ? '#334155' : 'transparent'
                  })}>
                    ✅ Approvals
                  </NavLink>
                </li>
              </>
            )}

            {/* Admin Section */}
            {hasRole(['hr', 'hr_head', 'branch_hr', 'super_admin', 'admin']) && (
              <>
                <li style={{ marginTop: '30px', marginBottom: '10px', padding: '10px', color: '#94a3b8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                  Administration
                </li>
                <li style={{ marginBottom: '10px' }}>
                  <NavLink to="/employees" style={({ isActive }) => ({ 
                    color: isActive ? '#60a5fa' : 'white', 
                    textDecoration: 'none',
                    display: 'block',
                    padding: '10px',
                    borderRadius: '5px',
                    background: isActive ? '#334155' : 'transparent'
                  })}>
                    👥 Employees
                  </NavLink>
                </li>
                <li style={{ marginBottom: '10px' }}>
                  <NavLink to="/documents" style={({ isActive }) => ({ 
                    color: isActive ? '#60a5fa' : 'white', 
                    textDecoration: 'none',
                    display: 'block',
                    padding: '10px',
                    borderRadius: '5px',
                    background: isActive ? '#334155' : 'transparent'
                  })}>
                    📄 Documents
                  </NavLink>
                </li>
              </>
            )}

            {/* Super Admin Only */}
            {hasRole(['super_admin']) && (
              <li style={{ marginBottom: '10px' }}>
                <NavLink to="/roles" style={({ isActive }) => ({ 
                  color: isActive ? '#60a5fa' : 'white', 
                  textDecoration: 'none',
                  display: 'block',
                  padding: '10px',
                  borderRadius: '5px',
                  background: isActive ? '#334155' : 'transparent'
                })}>
                  🔐 Role Management
                </NavLink>
              </li>
            )}
            
            <li style={{ marginTop: '30px', marginBottom: '10px' }}>
              <NavLink to="/profile" style={({ isActive }) => ({ 
                color: isActive ? '#60a5fa' : 'white', 
                textDecoration: 'none',
                display: 'block',
                padding: '10px',
                borderRadius: '5px',
                background: isActive ? '#334155' : 'transparent'
              })}>
                👤 Profile
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: 0 }}>Welcome, {profile?.first_name || 'User'}!</h1>
            <div>
              {userRoles.length > 0 && (
                <span style={{ 
                  padding: '6px 12px', 
                  background: '#3b82f6', 
                  color: 'white', 
                  borderRadius: '12px', 
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {userRoles.join(', ').toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '30px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
