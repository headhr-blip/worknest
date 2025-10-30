import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function Loans() {
  const { profile } = useAuth()
  const [loans, setLoans] = useState([])
  const [loanTypes, setLoanTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    loanTypeId: '',
    amount: '',
    tenureMonths: '',
    reason: ''
  })

  useEffect(() => {
    fetchLoanData()
  }, [])

  const fetchLoanData = async () => {
    try {
      const userId = profile?.user_id

      // Fetch loan types
      const { data: types } = await supabase
        .from('loantypes')
        .select('*')
        .eq('is_active', true)

      setLoanTypes(types || [])

      // Fetch user's loans
      const { data: loanData, error } = await supabase
        .from('loans')
        .select('*, loantypes(name)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setLoans(loanData || [])
    } catch (error) {
      console.error('Error fetching loan data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateEMI = (principal, rate, tenure) => {
    const monthlyRate = rate / 100 / 12
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1)
    return emi.toFixed(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const userId = profile?.user_id
      const selectedType = loanTypes.find(t => t.id === formData.loanTypeId)
      const emiAmount = calculateEMI(parseFloat(formData.amount), selectedType.interest_rate, parseInt(formData.tenureMonths))

      const { error } = await supabase
        .from('loans')
        .insert([{
          user_id: userId,
          loan_type_id: formData.loanTypeId,
          amount: parseFloat(formData.amount),
          tenure_months: parseInt(formData.tenureMonths),
          interest_rate: selectedType.interest_rate,
          emi_amount: parseFloat(emiAmount),
          reason: formData.reason,
          status: 'pending'
        }])

      if (error) throw error

      alert('Loan application submitted successfully!')
      setShowForm(false)
      setFormData({ loanTypeId: '', amount: '', tenureMonths: '', reason: '' })
      fetchLoanData()
    } catch (error) {
      console.error('Error submitting loan application:', error)
      alert('Failed to submit loan application')
    }
  }

  if (loading) {
    return <div>Loading loan information...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Loan Management</h2>
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
          {showForm ? 'Cancel' : 'Apply for Loan'}
        </button>
      </div>

      {/* Loan Application Form */}
      {showForm && (
        <div style={{ 
          background: 'white', 
          padding: '25px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>New Loan Application</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                Loan Type *
              </label>
              <select
                value={formData.loanTypeId}
                onChange={(e) => setFormData({ ...formData, loanTypeId: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '5px',
                  fontSize: '14px'
                }}
              >
                <option value="">Select loan type</option>
                {loanTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} (Max: ${type.max_amount}, Rate: {type.interest_rate}%)
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
                  Tenure (Months) *
                </label>
                <input
                  type="number"
                  value={formData.tenureMonths}
                  onChange={(e) => setFormData({ ...formData, tenureMonths: e.target.value })}
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
              Submit Application
            </button>
          </form>
        </div>
      )}

      {/* Loans List */}
      <div style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '10px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>Your Loan Applications</h3>
        
        {loans.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
            No loan applications found
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Type</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Amount</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Tenure</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>EMI</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px' }}>{loan.loantypes?.name}</td>
                  <td style={{ padding: '12px', fontWeight: '500' }}>${loan.amount.toFixed(2)}</td>
                  <td style={{ padding: '12px' }}>{loan.tenure_months} months</td>
                  <td style={{ padding: '12px', fontWeight: '500' }}>${loan.emi_amount.toFixed(2)}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: 
                        loan.status === 'approved' || loan.status === 'active' ? '#dcfce7' :
                        loan.status === 'rejected' ? '#fee2e2' :
                        loan.status === 'completed' ? '#dbeafe' : '#fef3c7',
                      color: 
                        loan.status === 'approved' || loan.status === 'active' ? '#16a34a' :
                        loan.status === 'rejected' ? '#dc2626' :
                        loan.status === 'completed' ? '#2563eb' : '#f59e0b'
                    }}>
                      {loan.status}
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
