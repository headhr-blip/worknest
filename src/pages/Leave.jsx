import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function Leave() {
  const { profile } = useAuth()
  const [leaveRequests, setLeaveRequests] = useState([])
  const [leaveTypes, setLeaveTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: ''
  })

  useEffect(() => {
    fetchLeaveData()
  }, [])

  const fetchLeaveData = async () => {
    try {
      const userId = profile?.user_id

      // Fetch leave types
      const { data: types } = await supabase
        .from('leavetypes')
        .select('*')
        .eq('is_active', true)

      setLeaveTypes(types || [])

      // Fetch user's leave requests
      const { data: requests, error } = await supabase
        .from('leaverequests')
        .select('*, leavetypes(name)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setLeaveRequests(requests || [])
    } catch (error) {
      console.error('Error fetching leave data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const userId = profile?.user_id
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1

      const { error } = await supabase
        .from('leaverequests')
        .insert([{
          user_id: userId,
          leave_type_id: formData.leaveTypeId,
          start_date: formData.startDate,
          end_date: formData.endDate,
          total_days: totalDays,
          reason: formData.reason,
          status: 'pending'
        }])

      if (error) throw error

      alert('Leave request submitted successfully!')
      setShowForm(false)
      setFormData({ leaveTypeId: '', startDate: '', endDate: '', reason: '' })
      fetchLeaveData()
    } catch (error) {
      console.error('Error submitting leave request:', error)
      alert('Failed to submit leave request')
    }
  }

  if (loading) {
    return <div>Loading leave information...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Leave Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '10px 20px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          {showForm ? 'Cancel' : 'Request Leave'}
        </button>
      </div>

      {/* Leave Request Form */}
      {showForm && (
        <div style={{ 
          background: 'white', 
          padding: '25px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>New Leave Request</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                Leave Type *
              </label>
              <select
                value={formData.leaveTypeId}
                onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '5px',
                  fontSize: '14px'
                }}
              >
                <option value="">Select leave type</option>
                {leaveTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} ({type.max_days_per_year} days/year)
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                Reason *
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
                rows="4"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '5px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <button
              type="submit"
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
              Submit Request
            </button>
          </form>
        </div>
      )}

      {/* Leave Requests List */}
      <div style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '10px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>Your Leave Requests</h3>
        
        {leaveRequests.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
            No leave requests found
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Type</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Start Date</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>End Date</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Days</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((request) => (
                <tr key={request.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px' }}>{request.leavetypes?.name}</td>
                  <td style={{ padding: '12px' }}>{new Date(request.start_date).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>{new Date(request.end_date).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>{request.total_days}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: 
                        request.status === 'approved' ? '#dcfce7' :
                        request.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                      color: 
                        request.status === 'approved' ? '#16a34a' :
                        request.status === 'rejected' ? '#dc2626' : '#f59e0b'
                    }}>
                      {request.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
