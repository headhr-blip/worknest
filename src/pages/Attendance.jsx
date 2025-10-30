import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function Attendance() {
  const { profile } = useAuth()
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [clockedIn, setClockedIn] = useState(false)
  const [todayRecord, setTodayRecord] = useState(null)

  useEffect(() => {
    fetchAttendance()
  }, [])

  const fetchAttendance = async () => {
    try {
      const userId = profile?.user_id
      const today = new Date().toISOString().split('T')[0]

      // Fetch today's record
      const { data: todayData } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single()

      if (todayData) {
        setTodayRecord(todayData)
        setClockedIn(!!todayData.clock_in && !todayData.clock_out)
      }

      // Fetch all records for this month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .order('date', { ascending: false })

      if (error) throw error
      setAttendanceRecords(data || [])
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClockIn = async () => {
    try {
      const userId = profile?.user_id
      const today = new Date().toISOString().split('T')[0]
      const now = new Date().toISOString()

      const { error } = await supabase
        .from('attendance')
        .insert([{
          user_id: userId,
          date: today,
          clock_in: now,
          status: 'present'
        }])

      if (error) throw error
      
      setClockedIn(true)
      fetchAttendance()
      alert('Clocked in successfully!')
    } catch (error) {
      console.error('Error clocking in:', error)
      alert('Failed to clock in')
    }
  }

  const handleClockOut = async () => {
    try {
      const now = new Date().toISOString()

      const { error } = await supabase
        .from('attendance')
        .update({ clock_out: now })
        .eq('id', todayRecord.id)

      if (error) throw error
      
      setClockedIn(false)
      fetchAttendance()
      alert('Clocked out successfully!')
    } catch (error) {
      console.error('Error clocking out:', error)
      alert('Failed to clock out')
    }
  }

  if (loading) {
    return <div>Loading attendance records...</div>
  }

  return (
    <div>
      <h2 style={{ marginBottom: '30px', color: '#1e293b' }}>Attendance</h2>

      {/* Clock In/Out Section */}
      <div style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '10px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>Today's Attendance</h3>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {!clockedIn && !todayRecord && (
            <button
              onClick={handleClockIn}
              style={{
                padding: '12px 24px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '16px'
              }}
            >
              Clock In
            </button>
          )}
          
          {clockedIn && todayRecord && (
            <>
              <div style={{ 
                padding: '12px 20px', 
                background: '#dcfce7', 
                color: '#16a34a',
                borderRadius: '5px',
                fontWeight: '500'
              }}>
                Clocked In: {new Date(todayRecord.clock_in).toLocaleTimeString()}
              </div>
              <button
                onClick={handleClockOut}
                style={{
                  padding: '12px 24px',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '16px'
                }}
              >
                Clock Out
              </button>
            </>
          )}

          {todayRecord && todayRecord.clock_out && (
            <div style={{ 
              padding: '12px 20px', 
              background: '#dbeafe', 
              color: '#2563eb',
              borderRadius: '5px',
              fontWeight: '500'
            }}>
              Completed: {new Date(todayRecord.clock_in).toLocaleTimeString()} - {new Date(todayRecord.clock_out).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Attendance Records */}
      <div style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '10px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>Attendance History</h3>
        
        {attendanceRecords.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
            No attendance records found
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Clock In</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Clock Out</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record) => (
                <tr key={record.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px' }}>{new Date(record.date).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>
                    {record.clock_in ? new Date(record.clock_in).toLocaleTimeString() : '-'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {record.clock_out ? new Date(record.clock_out).toLocaleTimeString() : '-'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: record.status === 'present' ? '#dcfce7' : '#fee2e2',
                      color: record.status === 'present' ? '#16a34a' : '#dc2626'
                    }}>
                      {record.status}
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
