import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function BulkEmployeeUpload() {
  const { profile } = useAuth()
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState(null)

  const downloadTemplate = () => {
    const headers = [
      'first_name',
      'last_name',
      'email',
      'password',
      'phone',
      'date_of_birth',
      'gender',
      'blood_group',
      'department',
      'designation',
      'employment_type',
      'joining_date',
      'basic_salary',
      'hra',
      'transport_allowance',
      'special_allowance',
      'other_allowances',
      'pf_contribution',
      'esi_contribution',
      'professional_tax',
      'income_tax_deduction',
      'payment_frequency',
      'bank_holder_name',
      'bank_account_number',
      'bank_name',
      'bank_ifsc',
      'aadhaar_number',
      'pan_number'
    ]

    const sampleData = [
      'John',
      'Doe',
      'john.doe@example.com',
      'Welcome@123',
      '9876543210',
      '1990-01-15',
      'Male',
      'O+',
      'IT',
      'Software Engineer',
      'permanent',
      '2025-01-01',
      '50000',
      '20000',
      '3000',
      '5000',
      '2000',
      '1800',
      '750',
      '200',
      '5000',
      'monthly',
      'John Doe',
      '1234567890123456',
      'HDFC Bank',
      'HDFC0001234',
      '1234-5678-9012',
      'ABCDE1234F'
    ]

    const csvContent = [
      headers.join(','),
      sampleData.join(','),
      headers.map(() => '').join(',')
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'employee_bulk_upload_template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile)
        setResults(null)
      } else {
        alert('Please upload a CSV file')
        e.target.value = null
      }
    }
  }

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim())
    const data = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      if (values.length === headers.length) {
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || ''
        })
        if (row.email && row.email !== 'john.doe@example.com' && row.email.includes('@')) {
          data.push(row)
        }
      }
    }

    return data
  }

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file')
      return
    }

    setUploading(true)
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const text = e.target.result
        const employees = parseCSV(text)

        if (employees.length === 0) {
          alert('No valid employee data found in the file')
          setUploading(false)
          return
        }

        const uploadResults = {
          total: employees.length,
          success: 0,
          failed: 0,
          errors: []
        }

        for (const emp of employees) {
          try {
            // Step 1: Create auth user using regular signup (works with anon key)
            const { data: authData, error: authError } = await supabase.auth.signUp({
              email: emp.email,
              password: emp.password || 'Welcome@123',
              options: {
                data: {
                  first_name: emp.first_name,
                  last_name: emp.last_name
                },
                emailRedirectTo: window.location.origin
              }
            })

            if (authError) throw new Error(`Auth error: ${authError.message}`)

            if (authData.user) {
              // Small delay to let trigger complete
              await new Promise(resolve => setTimeout(resolve, 1000))

              // Step 2: Update profile with complete details
              const { error: profileError } = await supabase
                .from('profiles')
                .update({
                  first_name: emp.first_name,
                  last_name: emp.last_name,
                  email: emp.email,
                  phone: emp.phone || '',
                  date_of_birth: emp.date_of_birth || null,
                  gender: emp.gender || null,
                  blood_group: emp.blood_group || null,
                  department: emp.department,
                  designation: emp.designation,
                  employment_type: emp.employment_type || 'permanent',
                  joining_date: emp.joining_date || new Date().toISOString().split('T')[0],
                  basic_salary: parseFloat(emp.basic_salary) || 0,
                  hra: parseFloat(emp.hra) || 0,
                  transport_allowance: parseFloat(emp.transport_allowance) || 0,
                  special_allowance: parseFloat(emp.special_allowance) || 0,
                  other_allowances: parseFloat(emp.other_allowances) || 0,
                  pf_contribution: parseFloat(emp.pf_contribution) || 0,
                  esi_contribution: parseFloat(emp.esi_contribution) || 0,
                  professional_tax: parseFloat(emp.professional_tax) || 0,
                  income_tax_deduction: parseFloat(emp.income_tax_deduction) || 0,
                  payment_frequency: emp.payment_frequency || 'monthly',
                  bank_holder_name: emp.bank_holder_name || '',
                  bank_account_number: emp.bank_account_number || '',
                  bank_name: emp.bank_name || '',
                  bank_ifsc: emp.bank_ifsc || '',
                  aadhaar_number: emp.aadhaar_number || '',
                  pan_number: emp.pan_number || '',
                  is_active: true,
                  created_by: profile.user_id
                })
                .eq('user_id', authData.user.id)

              if (profileError) {
                console.warn('Profile update warning:', profileError)
                // Don't fail if profile update has issues
              }

              // Step 3: Create salary history
              const grossSalary = (parseFloat(emp.basic_salary) || 0) +
                                (parseFloat(emp.hra) || 0) +
                                (parseFloat(emp.transport_allowance) || 0) +
                                (parseFloat(emp.special_allowance) || 0) +
                                (parseFloat(emp.other_allowances) || 0)

              const { error: salaryError } = await supabase
                .from('salary_history')
                .insert([{
                  user_id: authData.user.id,
                  basic_salary: parseFloat(emp.basic_salary) || 0,
                  hra: parseFloat(emp.hra) || 0,
                  transport_allowance: parseFloat(emp.transport_allowance) || 0,
                  special_allowance: parseFloat(emp.special_allowance) || 0,
                  other_allowances: parseFloat(emp.other_allowances) || 0,
                  gross_salary: grossSalary,
                  effective_from: emp.joining_date || new Date().toISOString().split('T')[0],
                  reason: 'Initial salary on joining (bulk upload)',
                  changed_by: profile.user_id
                }])

              if (salaryError) {
                console.warn('Salary history warning:', salaryError)
              }

              uploadResults.success++
            }
          } catch (error) {
            uploadResults.failed++
            uploadResults.errors.push({
              email: emp.email,
              name: `${emp.first_name} ${emp.last_name}`,
              error: error.message
            })
          }
        }

        setResults(uploadResults)
        setFile(null)
        if (document.getElementById('fileInput')) {
          document.getElementById('fileInput').value = null
        }
        
        if (uploadResults.success > 0) {
          alert(`Successfully uploaded ${uploadResults.success} out of ${uploadResults.total} employees!`)
        }
      } catch (error) {
        console.error('Error processing file:', error)
        alert('Error processing file: ' + error.message)
      } finally {
        setUploading(false)
      }
    }

    reader.readAsText(file)
  }

  return (
    <div>
      <h2 style={{ marginBottom: '30px', color: '#1e293b' }}>Bulk Employee Upload</h2>

      {/* Instructions Card */}
      <div style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '10px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginBottom: '15px', color: '#1e293b' }}>📋 Instructions</h3>
        <ol style={{ marginLeft: '20px', lineHeight: '1.8', color: '#475569' }}>
          <li>Download the CSV template by clicking the button below</li>
          <li>Open the template in Excel or Google Sheets</li>
          <li>Fill in employee details (one employee per row)</li>
          <li>Remove the sample data row before uploading</li>
          <li>Save the file as CSV format</li>
          <li>Upload the completed file using the upload section below</li>
        </ol>
        
        <div style={{ marginTop: '20px', padding: '15px', background: '#fef3c7', borderRadius: '5px', borderLeft: '4px solid #f59e0b' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#92400e' }}>
            <strong>⚠️ Important:</strong> Make sure all email addresses are unique and valid. Required fields are: first_name, last_name, email, department, designation, and basic_salary. Default password will be "Welcome@123" if not specified.
          </p>
        </div>

        <div style={{ marginTop: '15px', padding: '15px', background: '#dbeafe', borderRadius: '5px', borderLeft: '4px solid #3b82f6' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#1e40af' }}>
            <strong>ℹ️ Note:</strong> Employees will receive a confirmation email. They must verify their email before logging in. Email confirmation can be disabled in Supabase Authentication settings for faster onboarding.
          </p>
        </div>
      </div>

      {/* Download Template */}
      <div style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '10px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginBottom: '15px', color: '#1e293b' }}>1. Download Template</h3>
        <p style={{ marginBottom: '15px', color: '#64748b', fontSize: '14px' }}>
          Download the pre-formatted CSV template with all required fields and a sample data row.
        </p>
        <button
          onClick={downloadTemplate}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          📥 Download CSV Template
        </button>
      </div>

      {/* Upload File */}
      <div style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '10px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginBottom: '15px', color: '#1e293b' }}>2. Upload Completed File</h3>
        <p style={{ marginBottom: '15px', color: '#64748b', fontSize: '14px' }}>
          Select your completed CSV file with employee data.
        </p>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            id="fileInput"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={{
              padding: '10px',
              border: '2px dashed #e2e8f0',
              borderRadius: '5px',
              cursor: 'pointer',
              flex: 1,
              minWidth: '250px'
            }}
          />
          
          {file && (
            <div style={{ 
              padding: '10px 15px', 
              background: '#dcfce7', 
              borderRadius: '5px',
              color: '#16a34a',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              ✓ {file.name}
            </div>
          )}
        </div>

        {file && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{
              marginTop: '15px',
              padding: '12px 24px',
              background: uploading ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            {uploading ? '⏳ Processing... This may take a few minutes' : '🚀 Upload Employees'}
          </button>
        )}
      </div>

      {/* Results */}
      {results && (
        <div style={{ 
          background: 'white', 
          padding: '25px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>📊 Upload Results</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>TOTAL</p>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#1e293b' }}>{results.total}</p>
            </div>
            <div style={{ padding: '20px', background: '#dcfce7', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#166534', fontWeight: '600' }}>SUCCESS</p>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#16a34a' }}>{results.success}</p>
            </div>
            <div style={{ padding: '20px', background: '#fee2e2', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#991b1b', fontWeight: '600' }}>FAILED</p>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#dc2626' }}>{results.failed}</p>
            </div>
          </div>

          {results.errors.length > 0 && (
            <div>
              <h4 style={{ marginBottom: '10px', color: '#dc2626' }}>❌ Failed Uploads</h4>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {results.errors.map((err, idx) => (
                  <div key={idx} style={{ 
                    padding: '10px', 
                    background: '#fef2f2', 
                    borderRadius: '5px',
                    marginBottom: '8px',
                    fontSize: '13px'
                  }}>
                    <strong>{err.name}</strong> ({err.email})<br />
                    <span style={{ color: '#dc2626' }}>Error: {err.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.success > 0 && (
            <div style={{ marginTop: '20px', padding: '15px', background: '#dcfce7', borderRadius: '5px' }}>
              <p style={{ margin: 0, color: '#166534', fontWeight: '500' }}>
                ✅ Successfully created {results.success} employee account(s)! 
                {results.success > 0 && ' Employees will receive confirmation emails. Check the Employee Management page to view them once they verify their emails.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
