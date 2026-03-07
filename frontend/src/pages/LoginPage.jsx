// This page shows a modern login form with PetCarePlus branding
import { useState } from 'react'
import axiosClient from '../api/axiosClient.js'
import { Link, useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    const nextFieldErrors = {}
    if (!email || !password) {
      if (!email) nextFieldErrors.email = 'Email is required'
      if (!password) nextFieldErrors.password = 'Password is required'
      setFieldErrors(nextFieldErrors)
      setError('All fields are required')
      return
    }
    try {
      setIsSubmitting(true)
      const res = await axiosClient.post('/api/auth/login', { email, password })
      const token = res.data.token
      localStorage.setItem('token', token)
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'linear-gradient(135deg, #e8f5e9 0%, #f1fff3 100%)' }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 0, boxShadow: '0 10px 20px rgba(0,0,0,0.08)', padding: '1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#2e7d32' }}>🐾 PetCarePlus</div>
          <div style={{ color: '#4f6b50', fontSize: 14 }}>Welcome back — please sign in</div>
        </div>
        {error && <div style={{ color: '#d32f2f', background: '#ffebee', borderRadius: 0, padding: '0.5rem 0.75rem', marginBottom: '0.75rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', padding: '0.75rem', borderRadius: 0, border: '1px solid #c8e6c9', outline: 'none' }}
            />
            {fieldErrors.email && <div style={{ color: '#d32f2f', fontSize: 12, marginTop: 4 }}>{fieldErrors.email}</div>}
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>Password</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{ flex: 1, padding: '0.75rem', borderRadius: 0, border: '1px solid #c8e6c9', outline: 'none' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                style={{ padding: '0.75rem', borderRadius: 0, border: '1px solid #c8e6c9', background: '#f5fff6', cursor: 'pointer' }}
                aria-label="Toggle password visibility"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {fieldErrors.password && <div style={{ color: '#d32f2f', fontSize: 12, marginTop: 4 }}>{fieldErrors.password}</div>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: '0.5rem',
              width: '100%',
              padding: '0.9rem',
              borderRadius: 0,
              border: 'none',
              background: isSubmitting ? '#9ccc65' : '#2e7d32',
              color: '#fff',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Logging in…' : 'Login'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: 14 }}>
          Don&apos;t have an account? <Link to="/register" style={{ color: '#2e7d32', fontWeight: 600 }}>Register here</Link>
        </div>
      </div>
    </div>
  )
}
