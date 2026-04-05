<<<<<<< HEAD
import './styles/LoginPage.css'

import { useState, useEffect } from 'react'
import axiosClient from '../api/axiosClient.js'
import { Link, useNavigate } from 'react-router-dom'
import happyAnimals from '../assets/images/happyanimals.jpg'
import happyAnimals1 from '../assets/images/happyanimals1.jpg'
import happyAnimals2 from '../assets/images/happyanimals2.jpg'
=======
// This page shows a modern login form with PetCarePlus branding
import { useState } from 'react'
import axiosClient from '../api/axiosClient.js'
import { Link, useNavigate } from 'react-router-dom'
>>>>>>> d8760c58edec9b177ff04d9f26443d213357f003

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
<<<<<<< HEAD
  const [fieldErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [detectedRole, setDetectedRole] = useState(null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const images = [happyAnimals, happyAnimals1, happyAnimals2]
  const navigate = useNavigate()

  const roleLabel = (role) => {
    if (role === 'SERVICE_PROVIDER') return 'Service Provider'
    if (role === 'PET_OWNER') return 'Pet Owner'
    return role
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
=======
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
>>>>>>> d8760c58edec9b177ff04d9f26443d213357f003
    const nextFieldErrors = {}
    if (!email || !password) {
      if (!email) nextFieldErrors.email = 'Email is required'
      if (!password) nextFieldErrors.password = 'Password is required'
<<<<<<< HEAD
=======
      setFieldErrors(nextFieldErrors)
>>>>>>> d8760c58edec9b177ff04d9f26443d213357f003
      setError('All fields are required')
      return
    }
    try {
      setIsSubmitting(true)
      const res = await axiosClient.post('/api/auth/login', { email, password })
<<<<<<< HEAD
      const token = res?.data?.accessToken ?? res?.data?.token
      if (!token) {
        throw new Error('No accessToken returned by server')
      }
      localStorage.setItem('token', token)
      const role = res?.data?.user?.role ?? (() => {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          return payload?.role
        } catch {
          return null
        }
      })()
      if (role === 'SERVICE_PROVIDER') {
        navigate('/provider-dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      const apiErr = err?.response?.data?.error
      const msg = apiErr
        ? [apiErr.message, apiErr.details].filter(Boolean).join(' — ')
        : 'Invalid email or password'
      setError(msg)
=======
      const token = res.data.token
      localStorage.setItem('token', token)
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid email or password')
>>>>>>> d8760c58edec9b177ff04d9f26443d213357f003
    } finally {
      setIsSubmitting(false)
    }
  }
<<<<<<< HEAD
  useEffect(() => {
    const id = setInterval(() => {
      setCarouselIndex((i) => (i + 1) % images.length)
    }, 3000)
    return () => clearInterval(id)
  }, [images.length])
  // Fixed layout; avoid measuring inner elements to keep stable sizing

  useEffect(() => {
    const normalizedEmail = email.trim()
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setDetectedRole(null)
      return
    }

    let cancelled = false
    const timeoutId = setTimeout(async () => {
      try {
        const res = await axiosClient.get('/api/auth/role', { params: { email: normalizedEmail } })
        const role = res?.data?.role ?? null
        if (!cancelled) setDetectedRole(role)
      } catch {
        if (!cancelled) setDetectedRole(null)
      }
    }, 400)

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [email])

  return (
    <div className="loginPageRoot">
      <div className="loginPageGrid">
        <div className="loginLeftPanel">
          <div className="loginImageCard">
            {images.map((src, i) => (
              <img key={i} src={src} alt="Background" className={`loginSlide ${carouselIndex === i ? 'loginSlideActive' : ''}`} />
            ))}
            <div className="loginLogo">PetCare+</div>
            <div className="loginTagline">
              <b>Book Pet Services with Ease</b>
              <div className="loginTaglineSub">Grooming | Veterinary | Wellness</div>
            </div>
            <div className="loginDots">
              <span className={`loginDot ${carouselIndex === 0 ? 'loginDotActive' : ''}`}></span>
              <span className={`loginDot ${carouselIndex === 1 ? 'loginDotActive' : ''}`}></span>
              <span className={`loginDot ${carouselIndex === 2 ? 'loginDotActive' : ''}`}></span>
            </div>
          </div>
        </div>
        <div className="loginRightPanel">
          <div className="loginCard">
            <div className="loginHeader">
              <div className="loginTitle">Welcome Back</div>
              <div className="loginSubtitle">Please sign in to continue</div>
              <hr className="loginDivider" />
            </div>
            {error && <div className="loginError">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="loginField">
                <label className="loginLabel">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="loginInput"
                />
                {fieldErrors.email && <div className="loginFieldError">{fieldErrors.email}</div>}
              </div>
              <div className="loginField">
                <label className="loginLabel">Password</label>
                <div className="loginPasswordWrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="loginInput loginPasswordInput"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="loginToggleBtn"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {fieldErrors.password && <div className="loginFieldError">{fieldErrors.password}</div>}
              </div>
              {detectedRole && (
                <div className="loginRoleHint">
                  You are a <span className="loginRoleName">{roleLabel(detectedRole)}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="loginSubmitBtn"
                style={{ background: isSubmitting ? 'rgba(15, 133, 132, 0.6)' : 'rgba(15, 133, 132, 1)', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
              >
                {isSubmitting ? '⏳ Logging in…' : 'Login'}
              </button>
              <div className="loginRegisterLinkWrap">Dont have an account? 
                <Link to="/register" className="loginRegisterLink">      Register here</Link>
              </div>
            </form>
          </div>
=======

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
>>>>>>> d8760c58edec9b177ff04d9f26443d213357f003
        </div>
      </div>
    </div>
  )
}
