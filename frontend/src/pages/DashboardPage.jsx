// This page shows a welcome message, user email from the JWT, and logout
import { useEffect, useState } from 'react'
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
  const [email, setEmail] = useState('')
  const navigate = useNavigate()
  useEffect(() => {
    const token = localStorage.getItem('token')
    setEmail(token ? getEmailFromToken(token) : '')
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Welcome to PetCarePlus!</h2>
      <p>{email ? `Logged in as: ${email}` : ''}</p>
      <button onClick={logout} style={{ marginTop: '1rem' }}>Logout</button>
    </div>
  )
}
