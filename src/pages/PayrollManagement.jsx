import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function PayrollManagement() {
  const { profile } = useAuth()
  const [employees, setEmployees] = useState([])
  const [payrolls, setPayrolls] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)) // YYYY-MM format
  const [loading, setLoading] = useState(true)
  const [showProcessForm, setShowProcessForm] = useState(false)
  const [processingAll, setProcessingAll] = useState(false)

  useEffect(() => {
    fetchEmployees()
    fetchPayrolls()
  }, [selectedMonth])

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .order('employee_id')

      if (error) throw error
      setEmployees(data || [])
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPayrolls = async () => {
    try {
      const [year, month] = selectedMonth.split('-')
      
      const { data, error } = await supabase
        .from('payroll')
        .select('*, profiles(employee_id, first_name, last_name, department)')
        .eq('month', parseInt(month))
        .eq('year', parseInt(year))
        .order('created_at', { ascending: false })

      if (error) throw error
      setPayrolls(data || [])
    } catch (error) {
      console.error('Error fetching payrolls:', error)
    }
  }

  const calculatePayroll = (employee) => {
    const basic = parseFloat(employee.basic_salary) || 0
    const hra = parseFloat(employee.hra) || 0
    const transport = parseFloat(employee.transport_allowance) || 0
    const special = parseFloat(employee.special_allowance) || 0
    const other = parseFloat(employee.other_allowances) || 0
    
    const grossSalary = basic + hra + transport + special + other
    
    const pf = parseFloat(employee.pf_contribution) || 0
    const esi = parseFloat(employee.esi_contribution) || 0
    const pt = parseFloat(employee.professional_tax) || 0
    const tax = parseFloat(employee.income_tax_deduction) || 0
    
    const totalDeductions = pf + esi + pt + tax
    const netSalary = grossSalary - totalDeductions
    
    return {
      basic,
      hra,
      transport,
      special,
      other,
      grossSalary,
      pf,
      esi,
      pt,
      tax,
      totalDeductions,
      netSalary
    }
  }

  const processPayroll = async (employee) => {
    try {
      const [year, month] = selectedMonth.split('-')
      const payroll = calculatePayroll(employee)
      
      // Check if payroll already exists for this employee and month
      const { data: existing } = await supabase
        .from('payroll')
        .select('id')
        .eq('user_id', employee.user_id)
        .eq('month', parseInt(month))
        .eq('year', parseInt(year))
        .single()

      if (existing) {
        alert(`Payroll already processed for ${employee.first_name} ${employee.last_name} for ${selectedMonth}`)
        return
      }

      const { error } = await supabase
        .from('payroll')
        .insert([{
          user_id: employee.user_id,
          month: parseInt(month),
          year: parseInt(year),
          basic_salary: payroll.basic,
          hra: payroll.hra,
          transport_allowance: payroll.transport,
          special_allowance: payroll.special,
          gross_salary: payroll.grossSalary,
          pf_deduction: payroll.pf,
          esi_deduction: payroll.esi,
          professional_tax: payroll.pt,
          income_tax_deduction: payroll.tax,
          total_deductions: payroll.totalDeductions,
          net_salary: payroll.netSalary,
          status: 'processed',
          processed_by: profile.user_id,
          payment_method: 'bank_transfer'
        }])

      if (error) throw error

      alert(`Payroll processed successfully for ${employee.first_name} ${employee.last_name}`)
      fetchPayrolls()
    } catch (error) {
      console.error('Error processing payroll:', error)
      alert('Failed to process payroll: ' + error.message)
    }
  }

  const processAllPayrolls = async () => {
    if (!confirm(`Process payroll for all ${employees.length} employees for ${selectedMonth}?`)) return
    
    setProcessingAll(true)
    let successCount = 0
    let errorCount = 0

    for (const employee of employees) {
      try {
        await processPayroll(employee)
        successCount++
      } catch (error) {
        errorCount++
        console.error(`Failed for ${employee.first_name}:`, error)
      }
    }

    setProcessingAll(false)
    alert(`Payroll processing complete!\nSuccess: ${successCount}\nFailed: ${errorCount}`)
    fetchPayrolls()
  }

  const markAsPaid = async (payrollId, transactionId) => {
    try {
      const { error } = await supabase
        .from('payroll')
        .update({
          status: 'paid',
          payment_date: new Date().toISOString(),
          transaction_id: transactionId,
          paid_by: profile.user_id
        })
        .eq('id', payrollId)

      if (error) throw error

      alert('Marked as paid successfully!')
      fetchPayrolls()
    } catch (error) {
      console.error('Error marking as paid:', error)
      alert('Failed to update payment status')
    }
  }

  const handleMarkPaid = (payrollId) => {
    const transactionId = prompt('Enter transaction ID/reference number:')
    if (transactionId) {
      markAsPaid(payrollId, transactionId)
    }
  }

  if (loading) {
    return <div>Loading payroll data...</div>
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Payroll Management</h2>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              padding: '10px',
              border: '1px solid #e2e8f0',
              borderRadius: '5px',
              fontSize: '14px'
            }}
          />
          <button
            onClick={() => setShowProcessForm(!showProcessForm)}
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
            {showProcessForm ? 'View Processed' : 'Process Payroll'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '4px solid #3b82f6' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>TOTAL EMPLOYEES</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#1e293b' }}>{employees.length}</p>
        </div>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '4px solid #10b981' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>PROCESSED</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#1e293b' }}>{payrolls.length}</p>
        </div>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '4px solid #f59e0b' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>PENDING</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#1e293b' }}>
            {employees.length - payrolls.length}
          </p>
        </div>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '4px solid #8b5cf6' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>TOTAL PAYOUT</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#1e293b' }}>
            ₹{payrolls.reduce((sum, p) => sum + parseFloat(p.net_salary || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Process Payroll Section */}
      {showProcessForm ? (
        <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#1e293b' }}>Process Payroll for {selectedMonth}</h3>
            <button
              onClick={processAllPayrolls}
              disabled={processingAll}
              style={{
                padding: '10px 20px',
                background: processingAll ? '#94a3b8' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: processingAll ? 'not-allowed' : 'pointer',
                fontWeight: '500'
              }}
            >
              {processingAll ? 'Processing...' : 'Process All Employees'}
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Employee</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#64748b', fontWeight: '500' }}>Basic</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#64748b', fontWeight: '500' }}>Allowances</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#64748b', fontWeight: '500' }}>Gross</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#64748b', fontWeight: '500' }}>Deductions</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#64748b', fontWeight: '500' }}>Net</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontWeight: '500' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const payroll = calculatePayroll(emp)
                  const isProcessed = payrolls.some(p => p.user_id === emp.user_id)
                  
                  return (
                    <tr key={emp.user_id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: '500' }}>{emp.first_name} {emp.last_name}</p>
                          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>{emp.employee_id}</p>
                        </div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>₹{payroll.basic.toLocaleString()}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        ₹{(payroll.hra + payroll.transport + payroll.special + payroll.other).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: '500' }}>₹{payroll.grossSalary.toLocaleString()}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#dc2626' }}>₹{payroll.totalDeductions.toLocaleString()}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>
                        ₹{payroll.netSalary.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {isProcessed ? (
                          <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', background: '#dcfce7', color: '#16a34a' }}>
                            Processed
                          </span>
                        ) : (
                          <button
                            onClick={() => processPayroll(emp)}
                            style={{
                              padding: '6px 16px',
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}
                          >
                            Process
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Processed Payrolls List */
        <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>Processed Payrolls - {selectedMonth}</h3>
          
          {payrolls.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
              No payrolls processed for this month yet
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Employee</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Department</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: '#64748b', fontWeight: '500' }}>Gross Salary</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: '#64748b', fontWeight: '500' }}>Deductions</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: '#64748b', fontWeight: '500' }}>Net Salary</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontWeight: '500' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontWeight: '500' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payrolls.map((payroll) => (
                    <tr key={payroll.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: '500' }}>
                            {payroll.profiles.first_name} {payroll.profiles.last_name}
                          </p>
                          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                            {payroll.profiles.employee_id}
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>{payroll.profiles.department}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>₹{parseFloat(payroll.gross_salary).toLocaleString()}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#dc2626' }}>
                        ₹{parseFloat(payroll.total_deductions).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>
                        ₹{parseFloat(payroll.net_salary).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          background: payroll.status === 'paid' ? '#dbeafe' : '#fef3c7',
                          color: payroll.status === 'paid' ? '#2563eb' : '#f59e0b'
                        }}>
                          {payroll.status === 'paid' ? 'Paid' : 'Processed'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {payroll.status !== 'paid' && (
                          <button
                            onClick={() => handleMarkPaid(payroll.id)}
                            style={{
                              padding: '6px 16px',
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500',
                              marginRight: '5px'
                            }}
                          >
                            Mark as Paid
                          </button>
                        )}
                        <button
                          onClick={() => alert('Payslip generation coming soon!')}
                          style={{
                            padding: '6px 16px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          View Payslip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
