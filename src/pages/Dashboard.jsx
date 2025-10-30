import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({
    attendance: 0,
    leaveBalance: 0,
    pendingApprovals: 0,
    expenses: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const userId = profile?.user_id

      // Fetch attendance count for current month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      const { count: attendanceCount } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('date', startOfMonth.toISOString().split('T')[0])

      // Fetch pending leave requests
      const { count: leaveCount } = await supabase
        .from('leaverequests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'pending')

      // Fetch pending expenses
      const { count: expenseCount } = await supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'pending')

      setStats({
        attendance: attendanceCount || 0,
        leaveBalance: 21, // This should be calculated based on leave requests
        pendingApprovals: leaveCount || 0,
        expenses: expenseCount || 0
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading dashboard...</div>
  }

  return (
    <div>
      <h2 style={{ marginBottom: '30px', color: '#1e293b' }}>Dashboard Overview</h2>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '25px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #3b82f6'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
            Attendance (This Month)
          </h3>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#1e293b' }}>
            {stats.attendance}
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#64748b' }}>days present</p>
        </div>

        <div style={{ 
          background: 'white', 
          padding: '25px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #10b981'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
            Leave Balance
          </h3>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#1e293b' }}>
            {stats.leaveBalance}
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#64748b' }}>days remaining</p>
        </div>

        <div style={{ 
          background: 'white', 
          padding: '25px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #f59e0b'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
            Pending Approvals
          </h3>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#1e293b' }}>
            {stats.pendingApprovals}
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#64748b' }}>leave requests</p>
        </div>

        <div style={{ 
          background: 'white', 
          padding: '25px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #8b5cf6'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
            Pending Expenses
          </h3>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#1e293b' }}>
            {stats.expenses}
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#64748b' }}>awaiting approval</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button style={{
            padding: '12px 24px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: '500'
          }}>
            Clock In
          </button>
          <button style={{
            padding: '12px 24px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: '500'
          }}>
            Request Leave
          </button>
          <button style={{
            padding: '12px 24px',
            background: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: '500'
          }}>
            Submit Expense
          </button>
        </div>
      </div>
    </div>
  )
}
