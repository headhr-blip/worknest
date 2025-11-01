import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function EmployeeManagement() {
  const { profile } = useAuth()
  const [employees, setEmployees] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    // Personal Details
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    // Employment Details
    department: '',
    designation: '',
    branchId: '',
    reportingManagerId: '',
    employmentType: 'permanent',
    joiningDate: new Date().toISOString().split('T')[0],
    // Salary Details
    basicSalary: '',
    hra: '',
    transportAllowance: '',
    specialAllowance: '',
    otherAllowances: '',
    pfContribution: '',
    esiContribution: '',
    professionalTax: '',
    incomeTaxDeduction: '',
    paymentFrequency: 'monthly',
    // Bank Details
    bankHolderName: '',
    bankAccountNumber: '',
    bankName: '',
    bankIfsc: '',
    // Documents
    aadhaarNumber: '',
    panNumber: ''
  })

  useEffect(() => {
    fetchEmployees()
    fetchBranches()
  }, [])

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, branches(name)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEmployees(data || [])
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('is_active', true)

      if (error) throw error
      setBranches(data || [])
    } catch (error) {
      console.error('Error fetching branches:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const calculateSalary = () => {
    const basic = parseFloat(formData.basicSalary) || 0
    const hra = parseFloat(formData.hra) || 0
    const transport = parseFloat(formData.transportAllowance) || 0
    const special = parseFloat(formData.specialAllowance) || 0
    const other = parseFloat(formData.otherAllowances) || 0
    const gross = basic + hra + transport + special + other
    
    const pf = parseFloat(formData.pfContribution) || 0
    const esi = parseFloat(formData.esiContribution) || 0
    const pt = parseFloat(formData.professionalTax) || 0
    const tax = parseFloat(formData.incomeTaxDeduction) || 0
    const deductions = pf + esi + pt + tax
    const net = gross - deductions
    
    return { gross, deductions, net }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            date_of_birth: formData.dateOfBirth || null,
            gender: formData.gender || null,
            blood_group: formData.bloodGroup || null,
            department: formData.department,
            designation: formData.designation,
            branch_id: formData.branchId || null,
            reporting_manager_id: formData.reportingManagerId || null,
            employment_type: formData.employmentType,
            joining_date: formData.joiningDate,
            basic_salary: parseFloat(formData.basicSalary) || 0,
            hra: parseFloat(formData.hra) || 0,
            transport_allowance: parseFloat(formData.transportAllowance) || 0,
            special_allowance: parseFloat(formData.specialAllowance) || 0,
            other_allowances: parseFloat(formData.otherAllowances) || 0,
            pf_contribution: parseFloat(formData.pfContribution) || 0,
            esi_contribution: parseFloat(formData.esiContribution) || 0,
            professional_tax: parseFloat(formData.professionalTax) || 0,
            income_tax_deduction: parseFloat(formData.incomeTaxDeduction) || 0,
            payment_frequency: formData.paymentFrequency,
            bank_holder_name: formData.bankHolderName,
            bank_account_number: formData.bankAccountNumber,
            bank_name: formData.bankName,
            bank_ifsc: formData.bankIfsc,
            aadhaar_number: formData.aadhaarNumber,
            pan_number: formData.panNumber,
            created_by: profile.user_id
          })
          .eq('user_id', authData.user.id)

        if (profileError) throw profileError

        const { gross } = calculateSalary()
        const { error: salaryError } = await supabase
          .from('salary_history')
          .insert([{
            user_id: authData.user.id,
            basic_salary: parseFloat(formData.basicSalary) || 0,
            hra: parseFloat(formData.hra) || 0,
            transport_allowance: parseFloat(formData.transportAllowance) || 0,
            special_allowance: parseFloat(formData.specialAllowance) || 0,
            other_allowances: parseFloat(formData.otherAllowances) || 0,
            gross_salary: gross,
            effective_from: formData.joiningDate,
            reason: 'Initial salary on joining',
            changed_by: profile.user_id
          }])

        if (salaryError) console.error('Salary history error:', salaryError)
      }

      alert('Employee created successfully!')
      setShowForm(false)
      setFormData({
        email: '', password: '', firstName: '', lastName: '', phone: '', dateOfBirth: '', gender: '', bloodGroup: '',
        department: '', designation: '', branchId: '', reportingManagerId: '', employmentType: 'permanent',
        joiningDate: new Date().toISOString().split('T')[0],
        basicSalary: '', hra: '', transportAllowance: '', specialAllowance: '', otherAllowances: '',
        pfContribution: '', esiContribution: '', professionalTax: '', incomeTaxDeduction: '',
        paymentFrequency: 'monthly', bankHolderName: '', bankAccountNumber: '', bankName: '', bankIfsc: '',
        aadhaarNumber: '', panNumber: ''
      })
      fetchEmployees()
    } catch (error) {
      console.error('Error creating employee:', error)
      alert('Failed to create employee: ' + error.message)
    }
  }

  const { gross, deductions, net } = calculateSalary()

  if (loading) {
    return <div>Loading employees...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Employee Management</h2>
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
          {showForm ? 'Cancel' : 'Add New Employee'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '25px', color: '#1e293b' }}>Add New Employee</h3>
          <form onSubmit={handleSubmit}>
            
            {/* Personal Details */}
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ marginBottom: '15px', color: '#475569', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                Personal Details
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>First Name *</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Last Name *</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Password *</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6"
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Date of Birth</label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Blood Group</label>
                  <input type="text" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} placeholder="e.g., O+"
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }} />
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ marginBottom: '15px', color: '#475569', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                Employment Details
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Department *</label>
                  <input type="text" name="department" value={formData.department} onChange={handleChange} required
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Designation *</label>
                  <input type="text" name="designation" value={formData.designation} onChange={handleChange} required
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Employment Type *</label>
                  <select name="employmentType" value={formData.employmentType} onChange={handleChange} required
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }}>
                    <option value="permanent">Permanent</option>
                    <option value="contract">Contract</option>
                    <option value="intern">Intern</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Joining Date *</label>
                  <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} required
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }} />
                </div>
              </div>
            </div>

            {/* Salary Details */}
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ marginBottom: '15px', color: '#475569', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                💰 Salary & Compensation
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Basic Salary *</label>
                  <input type="number" step="0.01" name="basicSalary" value={formData.basicSalary} onChange={handleChange} required
                    placeholder="e.g., 50000" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>HRA</label>
                  <input type="number" step="0.01" name="hra" value={formData.hra} onChange={handleChange}
                    placeholder="e.g., 20000" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Transport Allowance</label>
                  <input type="number" step="0.01" name="transportAllowance" value={formData.transportAllowance} onChange={handleChange}
                    placeholder="e.g., 3000" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Special Allowance</label>
                  <input type="number" step="0.01" name="specialAllowance" value={formData.specialAllowance} onChange={handleChange}
                    placeholder="e.g., 5000" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Other Allowances</label>
                  <input type="number" step="0.01" name="otherAllowances" value={formData.otherAllowances} onChange={handleChange}
                    placeholder="e.g., 2000" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Payment Frequency</label>
                  <select name="paymentFrequency" value={formData.paymentFrequency} onChange={handleChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }}>
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-Weekly</option>
                  </select>
                </div>
              </div>
              
              {/* Salary Summary */}
              <div style={{ marginTop: '20px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', textAlign: 'center' }}>
                  <div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>GROSS SALARY</p>
                    <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>₹{gross.toLocaleString()}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>DEDUCTIONS</p>
                    <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>₹{deductions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>NET SALARY</p>
                    <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>₹{net.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ marginBottom: '15px', color: '#475569', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                📉 Deductions
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>PF Contribution</label>
                  <input type="number" step="0.01" name="pfContribution" value={formData.pfContribution} onChange={handleChange}
                    placeholder="e.g., 1800" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>ESI Contribution</label>
                  <input type="number" step="0.01" name="esiContribution" value={formData.esiContribution} onChange={handleChange}
                    placeholder="e.g., 750" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Professional Tax</label>
                  <input type="number" step="0.01" name="professionalTax" value={formData.professionalTax} onChange={handleChange}
                    placeholder="e.g., 200" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Income Tax (TDS)</label>
                  <input type="number" step="0.01" name="incomeTaxDeduction" value={formData.incomeTaxDeduction} onChange={handleChange}
                    placeholder="e.g., 5000" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }} />
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ marginBottom: '15px', color: '#475569', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                🏦 Bank Account Details
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Account Holder Name</label>
                  <input type="text" name="bankHolderName" value={formData.bankHolderName} onChange={handleChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Account Number</label>
                  <input type="text" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Bank Name</label>
                  <input type="text" name="bankName" value={formData.bankName} onChange={handleChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>IFSC Code</label>
                  <input type="text" name="bankIfsc" value={formData.bankIfsc} onChange={handleChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }} />
                </div>
              </div>
            </div>

            {/* Document Details */}
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ marginBottom: '15px', color: '#475569', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                📄 Document Details
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Aadhaar Number</label>
                  <input type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange}
                    placeholder="XXXX-XXXX-XXXX" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>PAN Number</label>
                  <input type="text" name="panNumber" value={formData.panNumber} onChange={handleChange}
                    placeholder="ABCDE1234F" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }} />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '30px' }}>
              <button type="button" onClick={() => setShowForm(false)}
                style={{ padding: '12px 30px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '500' }}>
                Cancel
              </button>
              <button type="submit"
                style={{ padding: '12px 30px', background: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '500' }}>
                Create Employee
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Employee List */}
      <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>All Employees</h3>
        
        {employees.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No employees found</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Employee ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Department</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Designation</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Salary</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px' }}>{employee.employee_id}</td>
                    <td style={{ padding: '12px' }}>{employee.first_name} {employee.last_name}</td>
                    <td style={{ padding: '12px' }}>{employee.email}</td>
                    <td style={{ padding: '12px' }}>{employee.department || '-'}</td>
                    <td style={{ padding: '12px' }}>{employee.designation || '-'}</td>
                    <td style={{ padding: '12px', fontWeight: '500' }}>
                      {employee.net_salary ? `₹${parseFloat(employee.net_salary).toLocaleString()}` : '-'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: employee.is_active ? '#dcfce7' : '#fee2e2',
                        color: employee.is_active ? '#16a34a' : '#dc2626'
                      }}>
                        {employee.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
