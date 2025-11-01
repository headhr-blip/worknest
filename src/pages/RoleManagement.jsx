import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function RoleManagement() {
  const { profile } = useAuth()
  const [employees, setEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [currentRoles, setCurrentRoles] = useState([])
  const [newRole, setNewRole] = useState('')
  const [loading, setLoading] = useState(true)

  const availableRoles = [
    { value: 'super_admin', label: 'Super Admin', description: 'Full system access' },
    { value: 'hr_head', label: 'HR Head', description: 'Full HR module access' },
    { value: 'hr', label: 'HR', description: 'HR operations access' },
    { value: 'branch_hr', label: 'Branch HR', description: 'Branch-level HR access' },
    { value: 'manager', label: 'Manager', description: 'Team management & approvals' },
    { value: 'team_lead', label: 'Team Lead', description: 'Team coordination' },
    { value: 'admin', label: 'Admin', description: 'Administrative access' },
    { value: 'employee', label: 'Employee', description: 'Basic employee access' }
  ]

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    if (selectedEmployee) {
      fetchEmployeeRoles()
    }
  }, [selectedEmployee])

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, employee_id, first_name, last_name, email, department')
        .eq('is_active', true)
        .order('first_name')

      if (error) throw error
      setEmployees(data || [])
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployeeRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('userroles')
        .select('*')
        .eq('user_id', selectedEmployee)

      if (error) throw error
      setCurrentRoles(data || [])
    } catch (error) {
      console.error('Error fetching roles:', error)
    }
  }

  const addRole = async () => {
    if (!newRole || !selectedEmployee) {
      alert('Please select a role')
      return
    }

    try {
      const { error } = await supabase
        .from('userroles')
        .insert([{
          user_id: selectedEmployee,
          role: newRole,
          created_by: profile.user_id
        }])

      if (error) throw error

      alert('Role added successfully!')
      setNewRole('')
      fetchEmployeeRoles()
    } catch (error) {
      console.error('Error adding role:', error)
      alert('Failed to add role: ' + error.message)
    }
  }

  const removeRole = async (roleId) => {
    if (!confirm('Are you sure you want to remove this role?')) return

    try {
      const { error } = await supabase
        .from('userroles')
        .delete()
        .eq('id', roleId)

      if (error) throw error

      alert('Role removed successfully!')
      fetchEmployeeRoles()
    } catch (error) {
      console.error('Error removing role:', error)
      alert('Failed to remove role')
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h2 style={{ marginBottom: '30px', color: '#1e293b' }}>Role Management</h2>

      {/* Employee Selection */}
      <div style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '10px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>
          Select Employee
        </label>
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #e2e8f0',
            borderRadius: '5px',
            fontSize: '14px'
          }}
        >
          <option value="">Choose an employee...</option>
          {employees.map((emp) => (
            <option key={emp.user_id} value={emp.user_id}>
              {emp.employee_id} - {emp.first_name} {emp.last_name} - {emp.department}
            </option>
          ))}
        </select>
      </div>

      {selectedEmployee && (
        <>
          {/* Add Role */}
          <div style={{ 
            background: 'white', 
            padding: '25px', 
            borderRadius: '10px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '30px'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>Add New Role</h3>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Select Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Choose a role...</option>
                  {availableRoles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label} - {role.description}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={addRole}
                style={{
                  padding: '10px 24px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Add Role
              </button>
            </div>
          </div>

          {/* Current Roles */}
          <div style={{ 
            background: 'white', 
            padding: '25px', 
            borderRadius: '10px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>Current Roles</h3>
            
            {currentRoles.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                No roles assigned yet
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {currentRoles.map((roleItem) => {
                  const roleInfo = availableRoles.find(r => r.value === roleItem.role)
                  return (
                    <div 
                      key={roleItem.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '15px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '5px'
                      }}
                    >
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>
                          {roleInfo?.label || roleItem.role}
                        </h4>
                        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                          {roleInfo?.description || 'Custom role'}
                        </p>
                        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                          Assigned on: {new Date(roleItem.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => removeRole(roleItem.id)}
                        style={{
                          padding: '8px 16px',
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
