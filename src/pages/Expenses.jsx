import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function Expenses() {
  const { profile } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchExpenseData()
  }, [])

  const fetchExpenseData = async () => {
    try {
      const userId = profile?.user_id

      // Fetch expense categories
      const { data: cats } = await supabase
        .from('expensecategories')
        .select('*')
        .eq('is_active', true)

      setCategories(cats || [])

      // Fetch user's expenses
      const { data: expenseData, error } = await supabase
        .from('expenses')
        .select('*, expensecategories(name)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setExpenses(expenseData || [])
    } catch (error) {
      console.error('Error fetching expense data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const userId = profile?.user_id

      const { error } = await supabase
        .from('expenses')
        .insert([{
          user_id: userId,
          category_id: formData.categoryId,
          amount: parseFloat(formData.amount),
          description: formData.description,
          expense_date: formData.expenseDate,
          status: 'pending'
        }])

      if (error) throw error

      alert('Expense submitted successfully!')
      setShowForm(false)
      setFormData({ categoryId: '', amount: '', description: '', expenseDate: new Date().toISOString().split('T')[0] })
      fetchExpenseData()
    } catch (error) {
      console.error('Error submitting expense:', error)
      alert('Failed to submit expense')
    }
  }

  if (loading) {
    return <div>Loading expenses...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Expense Management</h2>
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
          {showForm ? 'Cancel' : 'Submit Expense'}
        </button>
      </div>

      {/* Expense Form */}
      {showForm && (
        <div style={{ 
          background: 'white', 
          padding: '25px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>New Expense</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '5px',
                  fontSize: '14px'
                }}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} (Max: ${cat.max_amount})
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
                  Expense Date *
                </label>
                <input
                  type="date"
                  value={formData.expenseDate}
                  onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
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
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              Submit Expense
            </button>
          </form>
        </div>
      )}

      {/* Expenses List */}
      <div style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '10px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>Your Expenses</h3>
        
        {expenses.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
            No expenses found
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Category</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Amount</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Description</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px' }}>{expense.expensecategories?.name}</td>
                  <td style={{ padding: '12px', fontWeight: '500' }}>${expense.amount.toFixed(2)}</td>
                  <td style={{ padding: '12px' }}>{new Date(expense.expense_date).toLocaleDateString()}</td>
                  <td style={{ padding: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {expense.description}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: 
                        expense.status === 'approved' ? '#dcfce7' :
                        expense.status === 'rejected' ? '#fee2e2' :
                        expense.status === 'reimbursed' ? '#dbeafe' : '#fef3c7',
                      color: 
                        expense.status === 'approved' ? '#16a34a' :
                        expense.status === 'rejected' ? '#dc2626' :
                        expense.status === 'reimbursed' ? '#2563eb' : '#f59e0b'
                    }}>
                      {expense.status}
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
