// This page uses the same two-column green theme design as the Registration page
import { useState } from 'react'
import axiosClient from '../api/axiosClient.js'
import { Link, useNavigate } from 'react-router-dom'
import happyAnimals from '../assets/images/happyanimals.png'

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
      const token = res?.data?.accessToken ?? res?.data?.token
      if (!token) {
        throw new Error('No accessToken returned by server')
      }
      localStorage.setItem('token', token)
      navigate('/dashboard')
    } catch (err) {
      const apiErr = err?.response?.data?.error
      const msg = apiErr
        ? [apiErr.message, apiErr.details].filter(Boolean).join(' — ')
        : 'Invalid email or password'
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f7f7f7' }}>
      <header style={{ background: '#4CAF50', color: '#fff', height: 64 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0.75rem 1rem', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>PetCarePlus</div>
          <nav style={{ display: 'flex', gap: '1rem', opacity: 0.95 }}>
            <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Home</a>
            <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Services</a>
            <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>About</a>
            <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Contact us</a>
          </nav>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/register" style={{ padding: '0.5rem 0.9rem', borderRadius: 0, background: '#388E3C', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>Register</Link>
            <Link to="/" style={{ padding: '0.5rem 0.9rem', borderRadius: 0, background: '#66BB6A', color: '#fff', textDecoration: 'none' }}>Login</Link>
          </div>
        </div>
      </header>
      <div className="reg-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 'calc(100vh - 64px)' }}>
        <div className="left-panel" style={{ position: 'relative', height: '100%' }}>
          <img src={happyAnimals} alt="Happy animals" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'rgba(76, 175, 80, 0.85)', padding: '1rem 1.25rem', borderRadius: 0, textAlign: 'center', color: '#fff' }}>
              <div style={{ fontSize: 28, fontWeight: 800 }}>PetCare Plus</div>
              <div style={{ marginTop: 6 }}>Welcome back — please sign in</div>
              <div style={{ marginTop: 6, opacity: 0.9, fontSize: 12 }}>Grooming | Veterinary | Wellness</div>
            </div>
          </div>
        </div>
        <div className="right-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', height: '100%' }}>
          <div style={{ width: 520, flexShrink: 0, background: '#fff', borderRadius: 0, boxShadow: '0 8px 16px rgba(0,0,0,0.06)', border: '1px solid #e5e5e5', padding: '1.25rem' }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#4CAF50' }}>Welcome Back</div>
              <div style={{ color: '#6b6b6b', fontSize: 14 }}>Please sign in to continue</div>
              <hr style={{ marginTop: '0.75rem', border: 0, height: 1, background: '#eee' }} />
            </div>
            {error && <div style={{ color: '#d32f2f', background: '#ffebee', borderRadius: 0, padding: '0.5rem 0.75rem', marginBottom: '0.75rem' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 0, border: '1px solid #ddd', background: '#fff', color: '#000' }}
                />
                {fieldErrors.email && <div style={{ color: '#d32f2f', fontSize: 12, marginTop: 4 }}>{fieldErrors.email}</div>}
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{ width: '100%', padding: '0.75rem', paddingRight: '48px', borderRadius: 0, border: '1px solid #ddd', background: '#fff', color: '#000' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
                  background: isSubmitting ? '#A5D6A7' : '#4CAF50',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Logging in…' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .reg-grid { grid-template-columns: 1fr; }
          .left-panel { display: none; }
        }
      `}</style>
    </div>
  )
}
