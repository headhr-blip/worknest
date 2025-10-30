import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function Profile() {
  const { profile, user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    department: '',
    designation: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        phone: profile.phone || '',
        department: profile.department || '',
        designation: profile.designation || '',
        address: profile.address || '',
        emergencyContactName: profile.emergency_contact_name || '',
        emergencyContactPhone: profile.emergency_contact_phone || ''
      })
    }
  }, [profile])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          department: formData.department,
          designation: formData.designation,
          address: formData.address,
          emergency_contact_name: formData.emergencyContactName,
          emergency_contact_phone: formData.emergencyContactPhone
        })
        .eq('user_id', user.id)

      if (error) throw error

      alert('Profile updated successfully!')
      setEditing(false)
      window.location.reload() // Refresh to show updated data
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!profile) {
    return <div>Loading profile...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>My Profile</h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
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
            Edit Profile
          </button>
        )}
      </div>

      <div style={{ 
        background: 'white', 
        padding: '30px', 
        borderRadius: '10px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {!editing ? (
          <div>
            {/* Profile Display */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ marginBottom: '20px', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                Personal Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>
                    Employee ID
                  </label>
                  <p style={{ margin: 0, color: '#1e293b', fontWeight: '500' }}>
                    {profile.employee_id}
                  </p>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>
                    Email
                  </label>
                  <p style={{ margin: 0, color: '#1e293b', fontWeight: '500' }}>
                    {profile.email}
                  </p>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>
                    First Name
                  </label>
                  <p style={{ margin: 0, color: '#1e293b', fontWeight: '500' }}>
                    {profile.first_name}
                  </p>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>
                    Last Name
                  </label>
                  <p style={{ margin: 0, color: '#1e293b', fontWeight: '500' }}>
                    {profile.last_name}
                  </p>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>
                    Phone
                  </label>
                  <p style={{ margin: 0, color: '#1e293b', fontWeight: '500' }}>
                    {profile.phone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>
                    Department
                  </label>
                  <p style={{ margin: 0, color: '#1e293b', fontWeight: '500' }}>
                    {profile.department || 'Not assigned'}
                  </p>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>
                    Designation
                  </label>
                  <p style={{ margin: 0, color: '#1e293b', fontWeight: '500' }}>
                    {profile.designation || 'Not assigned'}
                  </p>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>
                    Hire Date
                  </label>
                  <p style={{ margin: 0, color: '#1e293b', fontWeight: '500' }}>
                    {profile.hire_date ? new Date(profile.hire_date).toLocaleDateString() : 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ marginBottom: '20px', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                Contact Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>
                    Address
                  </label>
                  <p style={{ margin: 0, color: '#1e293b', fontWeight: '500' }}>
                    {profile.address || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ marginBottom: '20px', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                Emergency Contact
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>
                    Contact Name
                  </label>
                  <p style={{ margin: 0, color: '#1e293b', fontWeight: '500' }}>
                    {profile.emergency_contact_name || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>
                    Contact Phone
                  </label>
                  <p style={{ margin: 0, color: '#1e293b', fontWeight: '500' }}>
                    {profile.emergency_contact_phone || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Profile Edit Form */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ marginBottom: '20px', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                Personal Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
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
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
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
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
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
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '5px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Designation
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
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
            </div>

            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ marginBottom: '20px', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                Contact Information
              </h3>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
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
            </div>

            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ marginBottom: '20px', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                Emergency Contact
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Contact Name
                  </label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
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
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
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
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px 24px',
                  background: loading ? '#94a3b8' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '500'
                }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={loading}
                style={{
                  padding: '10px 24px',
                  background: 'white',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '5px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
