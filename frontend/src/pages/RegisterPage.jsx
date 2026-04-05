// This page implements the wireframe: navbar + two-column layout with left image and right registration form
import { useState, useEffect } from 'react'
import './styles/RegisterPage.css'
import axiosClient from '../api/axiosClient.js'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import happyAnimals from '../assets/images/happyanimals.jpg'
import happyAnimals1 from '../assets/images/happyanimals1.jpg'
import happyAnimals2 from '../assets/images/happyanimals2.jpg'

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('PET_OWNER')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const images = [happyAnimals, happyAnimals1, happyAnimals2]
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setFieldErrors({})
    const nextFieldErrors = {}
    if (!firstName || !lastName || !email || !password) {
      if (!firstName) nextFieldErrors.firstName = 'First name is required'
      if (!lastName) nextFieldErrors.lastName = 'Last name is required'
      if (!email) nextFieldErrors.email = 'Email is required'
      if (!password) nextFieldErrors.password = 'Password is required'
      setFieldErrors(nextFieldErrors)
      setError('All fields are required')
      return
    }
    try {
      setIsSubmitting(true)
      await axiosClient.post('/api/auth/register', {
        firstname: firstName,
        lastname: lastName,
        email,
        password,
        role,
      })
      setMessage('Registration successful! Redirecting...')
      setTimeout(() => navigate('/'), 1000)
    } catch (err) {
      const apiErr = err?.response?.data?.error
      const msg = apiErr
        ? [apiErr.message, apiErr.details].filter(Boolean).join(' — ')
        : (err?.response?.data?.message || err?.message || 'Registration failed')
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }
  useEffect(() => {
    const id = setInterval(() => {
      setCarouselIndex((i) => (i + 1) % images.length)
    }, 3000)
    return () => clearInterval(id)
  }, [images.length])

  return (
    <div className="registerPageRoot">
      <div className="registerPageGrid">
        <div className="registerLeftPanel">
          <div className="registerImageCard">
            {images.map((src, i) => (
              <img key={i} src={src} alt="Background" className={`registerSlide ${carouselIndex === i ? 'registerSlideActive' : ''}`} />
            ))}
            <div className="registerLogo">PetCare+</div>
            <div className="loginTagline">
              <b>Book Pet Services with Ease</b>
              <div className="loginTaglineSub">Grooming | Veterinary | Wellness</div>
            </div>
            <div className="registerDots">
              <span className={`registerDot ${carouselIndex === 0 ? 'registerDotActive' : ''}`}></span>
              <span className={`registerDot ${carouselIndex === 1 ? 'registerDotActive' : ''}`}></span>
              <span className={`registerDot ${carouselIndex === 2 ? 'registerDotActive' : ''}`}></span>
            </div>
          </div>
        </div>
        <div className="registerRightPanel">
          <div className="registerCard">
            <div className="registerHeader">
              <div className="registerTitle">Create an account</div>
              <div className="registerSubtitle">
                Create an account to continue.
              </div>
              <hr className="registerDivider" />
            </div>
            {message && <div className="registerSuccess">{message}</div>}
            {error && <div className="registerError">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="registerNameRow">
                <div>
                  <label className="registerLabel">First Name</label>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" className="registerInput" />
                  {fieldErrors.firstName && <div className="registerFieldError">{fieldErrors.firstName}</div>}
                </div>
                <div>
                  <label className="registerLabelTight">Last Name</label>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" className="registerInput" />
                  {fieldErrors.lastName && <div className="registerFieldError">{fieldErrors.lastName}</div>}
                </div>
              </div>
              <div className="registerField">
                <label className="registerLabel">Email Address</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="registerInput" />
                {fieldErrors.email && <div className="registerFieldError">{fieldErrors.email}</div>}
              </div>
              <div className="registerField">
                <label className="registerLabel">Password</label>
                <div className="registerPasswordWrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="registerInput registerPasswordInput"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="registerToggleBtn"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {fieldErrors.password && <div className="registerFieldError">{fieldErrors.password}</div>}
              </div>
              <div className="registerField">
                <div className="registerRoleLabel">Account Type</div>
                <div className="registerRoleToggle">
                  <button
                    type="button"
                    className={`registerRoleBtn ${role === 'PET_OWNER' ? 'registerRoleBtnActive' : ''}`}
                    onClick={() => setRole('PET_OWNER')}
                  >
                    Pet Owner
                  </button>
                  <button
                    type="button"
                    className={`registerRoleBtn ${role === 'SERVICE_PROVIDER' ? 'registerRoleBtnActive' : ''}`}
                    onClick={() => setRole('SERVICE_PROVIDER')}
                  >
                    Service Provider
                  </button>
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="registerPrimaryBtn">
                {isSubmitting ? 'Creating Account…' : 'Create Account'}
              </button>
              <div className="registerBottomLogin">
                Already have an account? <Link to="/" className="registerLink">Log in</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
// This page implements the wireframe: navbar + two-column layout with left image and right registration form
import { useState } from 'react'
import axiosClient from '../api/axiosClient.js'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import happyAnimals from '../assets/images/happyanimals.png'

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('PET_OWNER')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setFieldErrors({})
    const nextFieldErrors = {}
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      if (!firstName) nextFieldErrors.firstName = 'First name is required'
      if (!lastName) nextFieldErrors.lastName = 'Last name is required'
      if (!email) nextFieldErrors.email = 'Email is required'
      if (!password) nextFieldErrors.password = 'Password is required'
      if (!confirmPassword) nextFieldErrors.confirmPassword = 'Please confirm your password'
      setFieldErrors(nextFieldErrors)
      setError('All fields are required')
      return
    }
    if (password !== confirmPassword) {
      setFieldErrors({ ...nextFieldErrors, confirmPassword: 'Passwords do not match' })
      setError('Passwords do not match')
      return
    }
    if (!acceptedTerms) {
      setFieldErrors({ ...nextFieldErrors, acceptedTerms: 'Please accept the terms and conditions' })
      setError('Please accept the terms and conditions')
      return
    }
    try {
      setIsSubmitting(true)
      const name = `${firstName} ${lastName}`.trim()
      const res = await axiosClient.post('/api/auth/register', { name, email, password })
      setMessage(res.data.message || 'Registration successful!')
      setTimeout(() => navigate('/'), 1000)
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed'
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f7f7f7' }}>
      <header style={{ background: '#3a3a3a', color: '#fff', height: 64 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0.75rem 1rem', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>PetCarePlus</div>
          <nav style={{ display: 'flex', gap: '1rem', opacity: 0.95 }}>
            <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Home</a>
            <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Services</a>
            <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>About</a>
            <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Contact us</a>
          </nav>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/register" style={{ padding: '0.5rem 0.9rem', borderRadius: 0, background: '#2a2a2a', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>Register</Link>
            <Link to="/" style={{ padding: '0.5rem 0.9rem', borderRadius: 0, background: '#555', color: '#fff', textDecoration: 'none' }}>Login</Link>
          </div>
        </div>
      </header>
      <div className="reg-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 'calc(100vh - 64px)' }}>
        <div className="left-panel" style={{ position: 'relative', height: '100%' }}>
          <img src={happyAnimals} alt="Happy animals" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'rgba(0,0,0,0.35)', padding: '1rem 1.25rem', borderRadius: 0, textAlign: 'center', color: '#fff' }}>
              <div style={{ fontSize: 28, fontWeight: 800 }}>PetCare Plus</div>
              <div style={{ marginTop: 6 }}>Create your account and start booking pet services today</div>
              <div style={{ marginTop: 6, opacity: 0.9, fontSize: 12 }}>Grooming | Veterinary | Wellness</div>
            </div>
          </div>
        </div>
        <div className="right-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', height: '100%' }}>
          <div style={{ width: '100%', maxWidth: 520, background: '#fff', borderRadius: 0, boxShadow: '0 8px 16px rgba(0,0,0,0.06)', border: '1px solid #e5e5e5', padding: '1.25rem' }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#222' }}>Welcome Back</div>
              <div style={{ color: '#6b6b6b', fontSize: 14 }}>Sign in your account to continue</div>
              <hr style={{ marginTop: '0.75rem', border: 0, height: 1, background: '#eee' }} />
            </div>
            {message && <div style={{ color: '#2e7d32', background: '#e8f5e9', borderRadius: 8, padding: '0.5rem 0.75rem', marginBottom: '0.75rem' }}>{message}</div>}
            {error && <div style={{ color: '#d32f2f', background: '#ffebee', borderRadius: 8, padding: '0.5rem 0.75rem', marginBottom: '0.75rem' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>First Name</label>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" style={{ width: '100%', padding: '0.75rem', borderRadius: 0, border: '1px solid #ddd', background: '#fff' }} />
                  {fieldErrors.firstName && <div style={{ color: '#d32f2f', fontSize: 12, marginTop: 4 }}>{fieldErrors.firstName}</div>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>Last Name</label>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" style={{ width: '100%', padding: '0.75rem', borderRadius: 0, border: '1px solid #ddd', background: '#fff' }} />
                  {fieldErrors.lastName && <div style={{ color: '#d32f2f', fontSize: 12, marginTop: 4 }}>{fieldErrors.lastName}</div>}
                </div>
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>Email Address</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={{ width: '100%', padding: '0.75rem', borderRadius: 0, border: '1px solid #ddd', background: '#fff' }} />
                {fieldErrors.email && <div style={{ color: '#d32f2f', fontSize: 12, marginTop: 4 }}>{fieldErrors.email}</div>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>Password</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      style={{ width: '100%', padding: '0.75rem', paddingRight: '48px', borderRadius: 0, border: '1px solid #ddd', background: '#fff' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {fieldErrors.password && <div style={{ color: '#d32f2f', fontSize: 12, marginTop: 4 }}>{fieldErrors.password}</div>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>Confirm Password</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      style={{ width: '100%', padding: '0.75rem', paddingRight: '48px', borderRadius: 0, border: '1px solid #ddd', background: '#fff' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((s) => !s)}
                      style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {showConfirm ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && <div style={{ color: '#d32f2f', fontSize: 12, marginTop: 4 }}>{fieldErrors.confirmPassword}</div>}
                </div>
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: 14, marginBottom: 6 }}>Role</label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setRole('PET_OWNER')} style={{ flex: 1, padding: '0.75rem', borderRadius: 0, background: role === 'PET_OWNER' ? '#3a3a3a' : '#fff', color: role === 'PET_OWNER' ? '#fff' : '#000', border: '1px solid #3a3a3a' }}>Pet Owner</button>
                  <button type="button" onClick={() => setRole('SERVICE_PROVIDER')} style={{ flex: 1, padding: '0.75rem', borderRadius: 0, background: role === 'SERVICE_PROVIDER' ? '#3a3a3a' : '#fff', color: role === 'SERVICE_PROVIDER' ? '#fff' : '#000', border: '1px solid #3a3a3a' }}>Service Provider</button>
                </div>
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#000' }}>
                  <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
                  I agree to the terms and conditions
                </label>
                {fieldErrors.acceptedTerms && <div style={{ color: '#d32f2f', fontSize: 12, marginTop: 4 }}>{fieldErrors.acceptedTerms}</div>}
              </div>
              <button type="submit" disabled={isSubmitting} style={{ marginTop: '1rem', width: '100%', padding: '0.9rem', borderRadius: 0, background: isSubmitting ? '#6d6d6d' : '#3a3a3a', color: '#fff', border: 'none', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                {isSubmitting ? 'Creating Account…' : 'Create Account'}
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: 14 }}>
              Already have an account? <Link to="/" style={{ color: '#3a3a3a', fontWeight: 600 }}>Login here</Link>
            </div>
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
