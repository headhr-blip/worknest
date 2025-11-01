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
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    
    // Auto-calculate gross and net salary
    if (['basicSalary', 'hra', 'transportAllowance', 'specialAllowance', 'otherAllowances',
         'pfContribution', 'esiContribution', 'professionalTax', 'incomeTaxDeduction'].includes(name)) {
      calculateSalary({ ...formData, [name]: value })
    }
  }

  const calculateSalary = (data) => {
    const basic = parseFloat(data.basicSalary) || 0
    const hra = parseFloat(data.hra) || 0
    const transport = parseFloat(data.transportAllowance) || 0
    const special = parseFloat(data.specialAllowance) || 0
    const other = parseFloat(data.otherAllowances) || 0
    
    const gross = basic + hra + transport + special + other
    
    const pf = parseFloat(data.pfContribution) || 0
    const esi = parseFloat(data.esiContribution) || 0
    const pt = parseFloat(data.professionalTax) || 0
    const tax = parseFloat(data.incomeTaxDeduction) || 0
    
    const net = gross - pf - esi - pt - tax
    
    return { gross, net }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Create auth user
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

      // Update profile with all details including salary
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
            // Salary details
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
            // Bank details
            bank_holder_name: formData.bankHolderName,
            bank_account_number: formData.bankAccountNumber,
            bank_name: formData.bankName,
            bank_ifsc: formData.bankIfsc,
            // Documents
            aadhaar_number: formData.aadhaarNumber,
            pan_number: formData.panNumber,
            created_by: profile.user_id
          })
          .eq('user_id', authData.user.id)

        if (profileError) throw profileError

        // Create initial salary history record
        const { error: salaryError } = await supabase
          .from('salary_history')
          .insert([{
            user_id: authData.user.id,
            basic_salary: parseFloat(formData.basicSalary) || 0,
            hra: parseFloat(formData.hra) || 0,
            transport_allowance: parseFloat(formData.transportAllowance) || 0,
            special_allowance: parseFloat(formData.specialAllowance) || 0,
            other_allowances: parseFloat(formData.otherAllowances) || 0,
            gross_salary: calculateSalary(formData).gross,
            effective_from: formData.joiningDate,
            reason: 'Initial salary on joining',
            changed_by: profile.user_id
          }])

        if (salaryError) throw salaryError
      }

      alert('Employee created successfully with salary details!')
      setShowForm(false)
      resetForm()
      fetchEmployees()
    } catch (error) {
      console.error('Error creating employee:', error)
      alert('Failed to create employee: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '', password: '', firstName: '', lastName: '', phone: '', dateOfBirth: '', gender: '', bloodGroup: '',
      department: '', designation: '', branchId: '', reportingManagerId: '', employmentType: 'permanent',
      joiningDate: new Date().toISOString().split('T')[0],
      basicSalary: '', hra: '', transportAllowance: '', specialAllowance: '', otherAllowances: '',
      pfContribution: '', esiContribution: '', professionalTax: '', incomeTaxDeduction: '',
      paymentFrequency: 'monthly', bankHolderName: '', bankAccountNumber: '', bankName: '', bankIfsc: '',
      aadhaarNumber: '', panNumber: ''
    })
  }

  const { gross, net } = calculateSalary(formData)

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

      {/* Employee Creation Form */}
      {showForm && (
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h3 style={{ marginBottom: '25px', color: '#1e293b' }}>Add New Employee</h3>
          <form onSubmit={handleSubmit}>
            
            {/* Personal Details Section */}
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ marginBottom: '15px', color: '#475569', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                Personal Details
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                    First Name *
                  </label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '14px' }} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                    Last Name *
                  </label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '14px' }} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                    Email *
                  </label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '14px' }} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                    Temporary Password *
                  </label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6"
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '14px' }} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                    Phone
                  </label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '14px' }} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                    Date of Birth
                  </label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '14px' }} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                    Gender
                  </label>
                  <select name="gender" value={formData.gender} onChange={handleChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '14px' }}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                    Blood Group
                  </label>
                  <input type="text" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} placeholder="e.g., O+"
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '14px' }} />
                </div>
              </div>
            </div>

            {/* Employment Details Section - Let me continue in next message due to length... */}
