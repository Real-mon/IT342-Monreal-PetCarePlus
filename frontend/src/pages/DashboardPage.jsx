// This page shows a welcome message, user email from the JWT, and logout
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function getEmailFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub || payload.email || ''
  } catch {
    return ''
  }
}

export default function DashboardPage() {
  const [email] = useState(() => {
    const token = localStorage.getItem('token')
    return token ? getEmailFromToken(token) : ''
  })
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Welcome to PetCare+</h2>
      <p>{email ? `Logged in as: ${email}` : ''}</p>
      <button onClick={logout} style={{ marginTop: '1rem' }}>Logout</button>
    </div>
  )
}
