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
  const [role] = useState('PET_OWNER')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [agree, setAgree] = useState(false)
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
    if (!agree) {
      setError('You must agree to the Terms & Conditions')
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
              <div className="registerCheckboxRow">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                <span className="registerAgreeText">
                  I agree to the <a href="#" onClick={(e) => e.preventDefault()} className="registerLink">Terms &amp; Conditions</a>
                </span>
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
