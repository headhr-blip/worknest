import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function DocumentManagement() {
  const { profile } = useAuth()
  const [employees, setEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    documentType: '',
    documentName: '',
    file: null
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    if (selectedEmployee) {
      fetchDocuments()
    }
  }, [selectedEmployee])

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, employee_id, first_name, last_name, email')
        .eq('is_active', true)
        .order('first_name')

      if (error) throw error
      setEmployees(data || [])
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_documents')
        .select('*, profiles!employee_documents_uploaded_by_fkey(first_name, last_name)')
        .eq('user_id', selectedEmployee)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
    }
  }

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.file || !selectedEmployee) {
      alert('Please select an employee and upload a file')
      return
    }

    setUploading(true)

    try {
      // Upload file to Supabase Storage
      const fileExt = formData.file.name.split('.').pop()
      const fileName = `${selectedEmployee}/${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee-documents')
        .upload(fileName, formData.file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('employee-documents')
        .getPublicUrl(fileName)

      // Save document record to database
      const { error: dbError } = await supabase
        .from('employee_documents')
        .insert([{
          user_id: selectedEmployee,
          document_type: formData.documentType,
          document_name: formData.documentName,
          file_url: publicUrl,
          file_size: formData.file.size,
          uploaded_by: profile.user_id
        }])

      if (dbError) throw dbError

      alert('Document uploaded successfully!')
      setFormData({ documentType: '', documentName: '', file: null })
      fetchDocuments()
    } catch (error) {
      console.error('Error uploading document:', error)
      alert('Failed to upload document: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const verifyDocument = async (documentId) => {
    try {
      const { error } = await supabase
        .from('employee_documents')
        .update({
          verified: true,
          verified_by: profile.user_id,
          verified_at: new Date().toISOString()
        })
        .eq('id', documentId)

      if (error) throw error

      alert('Document verified successfully!')
      fetchDocuments()
    } catch (error) {
      console.error('Error verifying document:', error)
      alert('Failed to verify document')
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h2 style={{ marginBottom: '30px', color: '#1e293b' }}>Document Management</h2>

      {/* Employee Selection */}
      <div style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '10px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>
          Select Employee
        </label>
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #e2e8f0',
            borderRadius: '5px',
            fontSize: '14px'
          }}
        >
          <option value="">Choose an employee...</option>
          {employees.map((emp) => (
            <option key={emp.user_id} value={emp.user_id}>
              {emp.employee_id} - {emp.first_name} {emp.last_name} ({emp.email})
            </option>
          ))}
        </select>
      </div>

      {selectedEmployee && (
        <>
          {/* Upload Form */}
          <div style={{ 
            background: 'white', 
            padding: '25px', 
            borderRadius: '10px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '30px'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>Upload New Document</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Document Type *
                </label>
                <select
                  value={formData.documentType}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select type...</option>
                  <option value="aadhaar">Aadhaar Card</option>
                  <option value="pan">PAN Card</option>
                  <option value="passport">Passport</option>
                  <option value="driving_license">Driving License</option>
                  <option value="education_certificate">Education Certificate</option>
                  <option value="experience_letter">Experience Letter</option>
                  <option value="bank_details">Bank Account Details</option>
                  <option value="photo">Photograph</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Document Name *
                </label>
                <input
                  type="text"
                  value={formData.documentName}
                  onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
                  required
                  placeholder="e.g., Aadhaar Card - Front Side"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Upload File *
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>
                  Accepted formats: PDF, JPG, PNG (Max 5MB)
                </p>
              </div>

              <button
                type="submit"
                disabled={uploading}
                style={{
                  padding: '10px 24px',
                  background: uploading ? '#94a3b8' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontWeight: '500'
                }}
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </form>
          </div>

          {/* Documents List */}
          <div style={{ 
            background: 'white', 
            padding: '25px', 
            borderRadius: '10px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>Employee Documents</h3>
            
            {documents.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                No documents uploaded yet
              </p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Type</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Uploaded By</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px' }}>{doc.document_type}</td>
                      <td style={{ padding: '12px' }}>{doc.document_name}</td>
                      <td style={{ padding: '12px' }}>
                        {doc.profiles?.first_name} {doc.profiles?.last_name}
                      </td>
                      <td style={{ padding: '12px' }}>{new Date(doc.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          background: doc.verified ? '#dcfce7' : '#fef3c7',
                          color: doc.verified ? '#16a34a' : '#f59e0b'
                        }}>
                          {doc.verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <a 
                          href={doc.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: '#3b82f6', marginRight: '15px', textDecoration: 'none' }}
                        >
                          View
                        </a>
                        {!doc.verified && (
                          <button
                            onClick={() => verifyDocument(doc.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#10b981',
                              cursor: 'pointer',
                              fontWeight: '500'
                            }}
                          >
                            Verify
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
