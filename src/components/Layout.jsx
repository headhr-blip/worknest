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

  const menuItemStyle = (isActive) => ({
    color: isActive ? '#60a5fa' : 'white',
    textDecoration: 'none',
    display: 'block',
    padding: '10px 15px',
    borderRadius: '5px',
    background: isActive ? '#334155' : 'transparent',
    transition: 'all 0.2s',
    fontSize: '14px'
  })

  const sectionHeaderStyle = {
    marginTop: '30px',
    marginBottom: '10px',
    padding: '10px 15px',
    color: '#94a3b8',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '260px', 
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        color: 'white', 
        padding: '20px 0',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto'
      }}>
        {/* Logo/Brand */}
        <div style={{ 
          padding: '0 20px 20px 20px', 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '20px'
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '24px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            WorkNest
          </h2>
          <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>
            HR Management System
          </p>
        </div>

        <nav style={{ padding: '0 10px' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {/* Employee Section */}
            <li style={{ marginBottom: '5px' }}>
              <NavLink to="/dashboard" style={({ isActive }) => menuItemStyle(isActive)}>
                📊 Dashboard
              </NavLink>
            </li>
            
            <li style={{ marginBottom: '5px' }}>
              <NavLink to="/attendance" style={({ isActive }) => menuItemStyle(isActive)}>
                ⏰ Attendance
              </NavLink>
            </li>
            
            <li style={{ marginBottom: '5px' }}>
              <NavLink to="/leave" style={({ isActive }) => menuItemStyle(isActive)}>
                🏖️ Leave
              </NavLink>
            </li>
            
            <li style={{ marginBottom: '5px' }}>
              <NavLink to="/expenses" style={({ isActive }) => menuItemStyle(isActive)}>
                💰 Expenses
              </NavLink>
            </li>
            
            <li style={{ marginBottom: '5px' }}>
              <NavLink to="/loans" style={({ isActive }) => menuItemStyle(isActive)}>
                🏦 Loans
              </NavLink>
            </li>

            {/* Manager/HR Section */}
            {hasRole(['manager', 'team_lead', 'hr', 'hr_head', 'branch_hr', 'super_admin', 'admin']) && (
              <>
                <li style={sectionHeaderStyle}>
                  Management
                </li>
                <li style={{ marginBottom: '5px' }}>
                  <NavLink to="/approvals" style={({ isActive }) => menuItemStyle(isActive)}>
                    ✅ Approvals
                  </NavLink>
                </li>
              </>
            )}

            {/* Admin Section */}
            {hasRole(['hr', 'hr_head', 'branch_hr', 'super_admin', 'admin']) && (
              <>
                <li style={sectionHeaderStyle}>
                  Administration
                </li>
                <li style={{ marginBottom: '5px' }}>
                  <NavLink to="/employees" style={({ isActive }) => menuItemStyle(isActive)}>
                    👥 Employees
                  </NavLink>
                </li>
                <li style={{ marginBottom: '5px' }}>
                  <NavLink to="/bulk-upload" style={({ isActive }) => menuItemStyle(isActive)}>
                    📤 Bulk Upload
                  </NavLink>
                </li>
                <li style={{ marginBottom: '5px' }}>
                  <NavLink to="/payroll" style={({ isActive }) => menuItemStyle(isActive)}>
                    💵 Payroll
                  </NavLink>
                </li>
                <li style={{ marginBottom: '5px' }}>
                  <NavLink to="/documents" style={({ isActive }) => menuItemStyle(isActive)}>
                    📄 Documents
                  </NavLink>
                </li>
              </>
            )}

            {/* Super Admin Only */}
            {hasRole(['super_admin']) && (
              <>
                <li style={sectionHeaderStyle}>
                  System Administration
                </li>
                <li style={{ marginBottom: '5px' }}>
                  <NavLink to="/roles" style={({ isActive }) => menuItemStyle(isActive)}>
                    🔐 Role Management
                  </NavLink>
                </li>
              </>
            )}
            
            {/* Profile Section */}
            <li style={sectionHeaderStyle}>
              Account
            </li>
            <li style={{ marginBottom: '5px' }}>
              <NavLink to="/profile" style={({ isActive }) => menuItemStyle(isActive)}>
                👤 My Profile
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Sign Out Button */}
        <div style={{ padding: '20px', position: 'absolute', bottom: '0', width: '260px', background: 'rgba(0,0,0,0.2)' }}>
          <button 
            onClick={handleSignOut}
            style={{ 
              width: '100%', 
              padding: '12px', 
              background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
              color: 'white', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{ 
          background: 'white', 
          padding: '20px 30px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#1e293b' }}>
                Welcome, {profile?.first_name || 'User'}!
              </h1>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                {profile?.employee_id && `Employee ID: ${profile.employee_id}`}
                {profile?.designation && ` • ${profile.designation}`}
                {profile?.department && ` • ${profile.department}`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {/* Role Badges */}
              {userRoles.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {userRoles.map((role) => (
                    <span 
                      key={role}
                      style={{ 
                        padding: '6px 12px', 
                        background: role === 'super_admin' ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' :
                                   role.includes('hr') ? 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)' :
                                   role === 'manager' ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)' :
                                   'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                        color: 'white', 
                        borderRadius: '20px', 
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    >
                      {role.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Current Time */}
              <div style={{ 
                padding: '8px 16px', 
                background: '#f1f5f9', 
                borderRadius: '8px',
                fontSize: '12px',
                color: '#64748b',
                fontWeight: '500'
              }}>
                {new Date().toLocaleDateString('en-IN', { 
                  weekday: 'short', 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ 
          flex: 1,
          padding: '30px',
          overflowY: 'auto'
        }}>
          <Outlet />
        </main>

        {/* Footer */}
        <footer style={{ 
          background: 'white', 
          padding: '15px 30px', 
          borderTop: '1px solid #e2e8f0',
          textAlign: 'center',
          fontSize: '12px',
          color: '#64748b'
        }}>
          <p style={{ margin: 0 }}>
            © 2025 WorkNest HRMS. All rights reserved. | Version 1.0
          </p>
        </footer>
      </div>
    </div>
  )
}
