import './styles/LoginPage.css'
import { useState, useEffect } from 'react'
import axiosClient from '../api/axiosClient.js'
import { Link, useNavigate } from 'react-router-dom'
import happyAnimals from '../assets/images/happyanimals.jpg'
import happyAnimals1 from '../assets/images/happyanimals1.jpg'
import happyAnimals2 from '../assets/images/happyanimals2.jpg'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
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
        </div>
      </div>
    </div>
  )
}
