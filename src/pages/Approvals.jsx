import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function Approvals() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState('leave')
  const [pendingLeave, setPendingLeave] = useState([])
  const [pendingExpenses, setPendingExpenses] = useState([])
  const [pendingLoans, setPendingLoans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingApprovals()
  }, [activeTab])

  const fetchPendingApprovals = async () => {
    try {
      if (activeTab === 'leave') {
        const { data, error } = await supabase
          .from('leaverequests')
          .select('*, profiles(first_name, last_name, employee_id), leavetypes(name)')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })

        if (error) throw error
        setPendingLeave(data || [])
      } else if (activeTab === 'expenses') {
        const { data, error } = await supabase
          .from('expenses')
          .select('*, profiles(first_name, last_name, employee_id), expensecategories(name)')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })

        if (error) throw error
        setPendingExpenses(data || [])
      } else if (activeTab === 'loans') {
        const { data, error } = await supabase
          .from('loans')
          .select('*, profiles(first_name, last_name, employee_id), loantypes(name)')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })

        if (error) throw error
        setPendingLoans(data || [])
      }
    } catch (error) {
      console.error('Error fetching approvals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (type, id, status, comments = '') => {
    try {
      let table = type === 'leave' ? 'leaverequests' : type === 'expense' ? 'expenses' : 'loans'
      
      const updateData = {
        status: status,
        approved_by: profile.user_id,
        approved_at: new Date().toISOString()
      }

      if (comments) {
        updateData.comments = comments
      }

      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', id)

      if (error) throw error

      alert(`${type} ${status} successfully!`)
      fetchPendingApprovals()
    } catch (error) {
      console.error('Error updating approval:', error)
      alert('Failed to process approval')
    }
  }

  const promptApproval = (type, id, action) => {
    const comments = prompt(`Enter comments for ${action}:`)
    if (comments !== null) {
      handleApproval(type, id, action, comments)
    }
  }

  if (loading) {
    return <div>Loading approvals...</div>
  }

  return (
    <div>
      <h2 style={{ marginBottom: '30px', color: '#1e293b' }}>Pending Approvals</h2>

      {/* Tabs */}
      <div style={{ 
        background: 'white', 
        padding: '0', 
        borderRadius: '10px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '30px',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
          <button
            onClick={() => setActiveTab('leave')}
            style={{
              flex: 1,
              padding: '15px',
              background: activeTab === 'leave' ? '#3b82f6' : 'transparent',
              color: activeTab === 'leave' ? 'white' : '#64748b',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            Leave Requests ({pendingLeave.length})
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            style={{
              flex: 1,
              padding: '15px',
              background: activeTab === 'expenses' ? '#3b82f6' : 'transparent',
              color: activeTab === 'expenses' ? 'white' : '#64748b',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            Expenses ({pendingExpenses.length})
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            style={{
              flex: 1,
              padding: '15px',
              background: activeTab === 'loans' ? '#3b82f6' : 'transparent',
              color: activeTab === 'loans' ? 'white' : '#64748b',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            Loans ({pendingLoans.length})
          </button>
        </div>

        <div style={{ padding: '25px' }}>
          {/* Leave Approvals */}
          {activeTab === 'leave' && (
            <>
              {pendingLeave.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                  No pending leave requests
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {pendingLeave.map((leave) => (
                    <div 
                      key={leave.id}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '20px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <div>
                          <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>
                            {leave.profiles.first_name} {leave.profiles.last_name}
                          </h4>
                          <p style={{ margin: '0', fontSize: '14px', color: '#64748b' }}>
                            {leave.profiles.employee_id}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: '#fef3c7',
                            color: '#f59e0b'
                          }}>
                            Pending
                          </span>
                        </div>
                      </div>

                      <div style={{ marginBottom: '15px' }}>
                        <p style={{ margin: '5px 0', fontSize: '14px' }}>
                          <strong>Leave Type:</strong> {leave.leavetypes.name}
                        </p>
                        <p style={{ margin: '5px 0', fontSize: '14px' }}>
                          <strong>Duration:</strong> {new Date(leave.start_date).toLocaleDateString()} to {new Date(leave.end_date).toLocaleDateString()} ({leave.total_days} days)
                        </p>
                        <p style={{ margin: '5px 0', fontSize: '14px' }}>
                          <strong>Reason:</strong> {leave.reason}
                        </p>
                        <p style={{ margin: '5px 0', fontSize: '12px', color: '#64748b' }}>
                          Applied on: {new Date(leave.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => promptApproval('leave', leave.id, 'approved')}
                          style={{
                            padding: '8px 20px',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => promptApproval('leave', leave.id, 'rejected')}
                          style={{
                            padding: '8px 20px',
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Expense Approvals */}
          {activeTab === 'expenses' && (
            <>
              {pendingExpenses.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                  No pending expense claims
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {pendingExpenses.map((expense) => (
                    <div 
                      key={expense.id}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '20px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <div>
                          <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>
                            {expense.profiles.first_name} {expense.profiles.last_name}
                          </h4>
                          <p style={{ margin: '0', fontSize: '14px', color: '#64748b' }}>
                            {expense.profiles.employee_id}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <h3 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>
                            ${expense.amount.toFixed(2)}
                          </h3>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: '#fef3c7',
                            color: '#f59e0b'
                          }}>
                            Pending
                          </span>
                        </div>
                      </div>

                      <div style={{ marginBottom: '15px' }}>
                        <p style={{ margin: '5px 0', fontSize: '14px' }}>
                          <strong>Category:</strong> {expense.expensecategories.name}
                        </p>
                        <p style={{ margin: '5px 0', fontSize: '14px' }}>
                          <strong>Date:</strong> {new Date(expense.expense_date).toLocaleDateString()}
                        </p>
                        <p style={{ margin: '5px 0', fontSize: '14px' }}>
                          <strong>Description:</strong> {expense.description}
                        </p>
                        {expense.receipt_url && (
                          <p style={{ margin: '5px 0', fontSize: '14px' }}>
                            <a href={expense.receipt_url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>
                              View Receipt
                            </a>
                          </p>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => promptApproval('expense', expense.id, 'approved')}
                          style={{
                            padding: '8px 20px',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => promptApproval('expense', expense.id, 'rejected')}
                          style={{
                            padding: '8px 20px',
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Loan Approvals */}
          {activeTab === 'loans' && (
            <>
              {pendingLoans.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                  No pending loan applications
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {pendingLoans.map((loan) => (
                    <div 
                      key={loan.id}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '20px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <div>
                          <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>
                            {loan.profiles.first_name} {loan.profiles.last_name}
                          </h4>
                          <p style={{ margin: '0', fontSize: '14px', color: '#64748b' }}>
                            {loan.profiles.employee_id}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <h3 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>
                            ${loan.amount.toFixed(2)}
                          </h3>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: '#fef3c7',
                            color: '#f59e0b'
                          }}>
                            Pending
                          </span>
                        </div>
                      </div>

                      <div style={{ marginBottom: '15px' }}>
                        <p style={{ margin: '5px 0', fontSize: '14px' }}>
                          <strong>Loan Type:</strong> {loan.loantypes.name}
                        </p>
                        <p style={{ margin: '5px 0', fontSize: '14px' }}>
                          <strong>Tenure:</strong> {loan.tenure_months} months
                        </p>
                        <p style={{ margin: '5px 0', fontSize: '14px' }}>
                          <strong>Interest Rate:</strong> {loan.interest_rate}%
                        </p>
                        <p style={{ margin: '5px 0', fontSize: '14px' }}>
                          <strong>EMI:</strong> ${loan.emi_amount.toFixed(2)}/month
                        </p>
                        <p style={{ margin: '5px 0', fontSize: '14px' }}>
                          <strong>Reason:</strong> {loan.reason}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => promptApproval('loan', loan.id, 'approved')}
                          style={{
                            padding: '8px 20px',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => promptApproval('loan', loan.id, 'rejected')}
                          style={{
                            padding: '8px 20px',
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
