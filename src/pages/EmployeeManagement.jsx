{/* Employment Details Section */}
<div style={{ marginBottom: '30px' }}>
  <h4 style={{ marginBottom: '15px', color: '#475569', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
    Employment Details
  </h4>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
    <div>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Department *</label>
      <input type="text" name="department" value={formData.department} onChange={handleChange} required
        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '14px' }} />
    </div>
    
    <div>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Designation *</label>
      <input type="text" name="designation" value={formData.designation} onChange={handleChange} required
        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '14px' }} />
    </div>
    
    <div>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Employment Type *</label>
      <select name="employmentType" value={formData.employmentType} onChange={handleChange} required
        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '14px' }}>
        <option value="permanent">Permanent</option>
        <option value="contract">Contract</option>
        <option value="intern">Intern</option>
      </select>
    </div>
    
    <div>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Joining Date *</label>
      <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} required
        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '14px' }} />
    </div>
  </div>
</div>

{/* Salary Details Section - NEW */}
<div style={{ marginBottom: '30px' }}>
  <h4 style={{ marginBottom: '15px', color: '#475569', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
    💰 Salary & Compensation Details
  </h4>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
    <div>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Basic Salary *</label>
      <input type="number" step="0.01" name="basicSalary" value={formData.basicSalary} onChange={handleChange} required
        placeholder="e.g., 50000"
        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '14px' }} />
    </div>
    
    <div>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>HRA (House Rent Allowance)</label>
      <input type="number" step="0.01" name="hra" value={formData.hra} onChange={handleChange}
        placeholder="e.g., 20000"
        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '14px' }} />
    </div>
    
    <div>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Transport Allowance</label>
      <input type="number" step="0.01" name="transportAllowance" value={formData.transportAllowance} onChange={handleChange}
        placeholder="e.g., 3000"
        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '14px' }} />
    </div>
    
    <div>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Special Allowance</label>
      <input type="number" step="0.01" name="specialAllowance" value={formData.specialAllowance} onChange={handleChange}
        placeholder="e.g., 5000"
        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '14px' }} />
    </div>
    
    <div>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Other Allowances</label>
      <input type="number" step="0.01" name="otherAllowances" value={formData.otherAllowances} onChange={handleChange}
        placeholder="e.g., 2000"
        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '14px' }} />
    </div>
    
    <div>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Payment Frequency</label>
      <select name="paymentFrequency" value={formData.paymentFrequency} onChange={handleChange}
        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '14px' }}>
        <option value="monthly">Monthly</option>
        <option value="weekly">Weekly</option>
        <option value="biweekly">Bi-Weekly</option>
      </select>
    </div>
  </div>
  
  {/* Salary Summary */}
  <div style={{ marginTop: '20px', padding: '15px', background: '#f8fafc', borderRadius: '5px', border: '1px solid #e2e8f0' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', textAlign: 'center' }}>
      <div>
        <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>GROSS SALARY</p>
        <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>₹{gross.toLocaleString()}</p>
      </div>
      <div>
        <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>DEDUCTIONS</p>
        <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#dc2626' }}>
          ₹{(parseFloat(formData.pfContribution || 0) + parseFloat(formData.esiContribution || 0) + 
             parseFloat(formData.professionalTax || 0) + parseFloat(formData.incomeTaxDeduction || 0)).toLocaleString()}
        </p>
      </div>
      <div>
        <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>NET SALARY</p>
        <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>₹{net.toLocaleString()}</p>
      </div>
    </div>
  </div>
</div>

{/* Deductions Section - NEW */}
<div style={{ marginBottom: '30px' }}>
  <h4 style={{ marginBottom: '15px', color: '#475569', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
    📉 Deductions
  </h4>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
    <div>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>PF Contribution</label>
      <input type="number" step="0.01" name="pfContribution" value={formData.pfContribution} onChange={handleChange}
        placeholder="e.g., 1800"
        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '14px' }} />
    </div>
    
    <div>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>ESI Contribution</label>
      <input type="number" step="0.01" name="esiContribution" value={formData.esiContribution} onChange={handleChange}
        placeholder="e.g., 750"
        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '14px' }} />
    </div>
    
    <div>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Professional Tax</label>
      <input type="number" step="0.01" name="professionalTax" value={formData.professionalTax} onChange={handleChange}
        placeholder="e.g., 200"
        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '14px' }} />
    </div>
    
    <div>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Income Tax (TDS)</label>
      <input type="number" step="0.01" name="incomeTaxDeduction" value={formData.incomeTaxDeduction} onChange={handleChange}
        placeholder="e.g., 5000"
        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '14px' }} />
    </div>
  </div>
</div>

{/* Bank Details Section - NEW */}
<div style={{ marginBottom: '30px' }}>
  <h4 style={{ marginBottom: '15px', color: '#475569', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
    🏦 Bank Account Details
  </h4>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
    <div>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Account Holder Name</label>
      <input type="text" name="bankHolderName" value={formData.bankHolderName} onChange={handleChange}
        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '14px' }} />
    </div>
    
    <div>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Account Number</label>
      <input type="text" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange}
        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '14px' }} />
    </div>
    
    <div>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Bank Name</label>
      <input type="text" name="bankName" value={formData.bankName} onChange={handleChange}
        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '14px' }} />
    </div>
    
    <div>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>IFSC Code</label>
      <input type="text" name="bankIfsc" value={formData.bankIfsc} onChange={handleChange}
        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '14px' }} />
    </div>
  </div>
</div>

{/* Document Details Section - NEW */}
<div style={{ marginBottom: '30px' }}>
  <h4 style={{ marginBottom: '15px', color: '#475569', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
    📄 Document Details
  </h4>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
    <div>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Aadhaar Number</label>
      <input type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange}
        placeholder="XXXX-XXXX-XXXX"
        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '14px' }} />
    </div>
    
    <div>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>PAN Number</label>
      <input type="text" name="panNumber" value={formData.panNumber} onChange={handleChange}
        placeholder="ABCDE1234F"
        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '14px' }} />
    </div>
  </div>
</div>

{/* Submit Button */}
<div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
  <button type="button" onClick={() => setShowForm(false)}
    style={{ padding: '12px 30px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '500' }}>
    Cancel
  </button>
  <button type="submit"
    style={{ padding: '12px 30px', background: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '500' }}>
    Create Employee
  </button>
</div>
