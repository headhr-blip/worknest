const signUp = async (email, password, profileData) => {
  // Pass all profile data as user metadata
  // The database trigger will automatically create the profile and role
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        employee_id: profileData.employee_id,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone: profileData.phone || '',
        department: profileData.department || '',
        designation: profileData.designation || ''
      }
    }
  })

  if (error) throw error
  
  // No need to manually insert into profiles or userroles
  // The trigger handles everything automatically
  return data
}
