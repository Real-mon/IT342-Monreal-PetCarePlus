import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosClient from '../api/axiosClient.js'

function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload || {}
  } catch {
    return {}
  }
}

function splitName(fullName) {
  const value = String(fullName || '').trim()
  if (!value) return { firstName: '', lastName: '' }
  const parts = value.split(/\s+/)
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

function joinName(firstName, lastName) {
  return [firstName, lastName].map((v) => String(v || '').trim()).filter(Boolean).join(' ')
}

function extractErrorMessage(err, fallback) {
  return (
    err?.response?.data?.error?.message ||
    err?.response?.data?.message ||
    err?.message ||
    fallback
  )
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')

  const token = useMemo(() => localStorage.getItem('token'), [])
  const tokenPayload = useMemo(() => (token ? decodeToken(token) : {}), [token])
  const role = tokenPayload?.role || ''
  const email = tokenPayload?.sub || ''
  const dashboardPath = role === 'SERVICE_PROVIDER' ? '/provider-dashboard' : '/dashboard'

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [address, setAddress] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [initial, setInitial] = useState(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    const t = localStorage.getItem('token')
    if (!t) {
      navigate('/', { replace: true })
    }
  }, [navigate, email])

  useEffect(() => {
    let isMounted = true
    const run = async () => {
      setLoading(true)
      setError('')
      setSuccess('')
      try {
        const res = await axiosClient.get('/api/profile')
        const data = res?.data || {}
        const { firstName: fn, lastName: ln } = splitName(data.fullName)
        const displayName = String(data.fullName || email || '').trim()
        if (displayName) localStorage.setItem('displayName', displayName)
        if (!isMounted) return
        setFirstName(fn)
        setLastName(ln)
        setContactNumber(data.contactNumber || '')
        setAddress(data.address || '')
        setPhotoUrl(data.photoUrl || '')
        setInitial({
          firstName: fn,
          lastName: ln,
          contactNumber: data.contactNumber || '',
          address: data.address || '',
          photoUrl: data.photoUrl || '',
        })
      } catch (e) {
        if (!isMounted) return
        const status = e?.response?.status
        if (status === 401) {
          localStorage.clear()
          navigate('/', { replace: true })
          return
        }
        setError(extractErrorMessage(e, 'Failed to load profile.'))
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    run()
    return () => {
      isMounted = false
    }
  }, [navigate, email])

  const logout = () => {
    localStorage.clear()
    navigate('/', { replace: true })
  }

  const onChangePhoto = () => {
    const next = window.prompt('Paste image URL:', photoUrl || '')
    if (next === null) return
    setPhotoUrl(String(next).trim())
  }

  const onCancel = () => {
    if (!initial) return
    setFirstName(initial.firstName)
    setLastName(initial.lastName)
    setContactNumber(initial.contactNumber)
    setAddress(initial.address)
    setPhotoUrl(initial.photoUrl)
    setError('')
    setSuccess('')
  }

  const onSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const fullName = joinName(firstName, lastName)
      const res = await axiosClient.put('/api/profile', {
        fullName,
        contactNumber: String(contactNumber || '').trim() || null,
        address: String(address || '').trim() || null,
        photoUrl: String(photoUrl || '').trim() || null,
      })
      const data = res?.data || {}
      const { firstName: fn, lastName: ln } = splitName(data.fullName)
      const displayName = String(data.fullName || email || '').trim()
      if (displayName) localStorage.setItem('displayName', displayName)
      setFirstName(fn)
      setLastName(ln)
      setContactNumber(data.contactNumber || '')
      setAddress(data.address || '')
      setPhotoUrl(data.photoUrl || '')
      setInitial({
        firstName: fn,
        lastName: ln,
        contactNumber: data.contactNumber || '',
        address: data.address || '',
        photoUrl: data.photoUrl || '',
      })
      setSuccess('Profile updated.')
    } catch (e) {
      const status = e?.response?.status
      if (status === 401) {
        localStorage.clear()
        navigate('/', { replace: true })
        return
      }
      setError(extractErrorMessage(e, 'Failed to update profile.'))
    } finally {
      setSaving(false)
    }
  }

  const onUpdatePassword = async () => {
    setPasswordMsg('')
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg('Fill out all password fields.')
      return
    }
    if (newPassword.length < 8) {
      setPasswordMsg('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg('New password and confirm password do not match.')
      return
    }
    setPasswordSaving(true)
    try {
      await axiosClient.put('/api/profile/password', {
        currentPassword,
        newPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordMsg('Password updated.')
    } catch (e) {
      const status = e?.response?.status
      if (status === 401) {
        localStorage.clear()
        navigate('/', { replace: true })
        return
      }
      setPasswordMsg(extractErrorMessage(e, 'Failed to update password.'))
    } finally {
      setPasswordSaving(false)
    }
  }

  const fieldStyle = {
    width: '100%',
    height: 44,
    border: '1px solid #d1d5db',
    borderRadius: 6,
    padding: '0 12px',
    fontWeight: 600,
    outline: 'none',
  }

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
      <div style={{ background: 'rgb(16, 110, 108)', color: '#fff', height: 60, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
        <div style={{ background: 'rgba(0,0,0,0.15)', padding: '8px 12px', fontWeight: 700 }}>PetCare Plus</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button aria-label="Search" style={{ width: 36, height: 36, background: '#222', border: '1px solid #333', color: '#fff', cursor: 'pointer' }}>🔍</button>
          <div style={{ width: 36, height: 36, background: '#222', border: '1px solid #333', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>J</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <aside style={{ width: 200, background: 'rgba(15, 133, 132, 1)', borderRight: '1px solid rgba(0,0,0,0.15)', padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, background: 'rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.9)' }}>X</div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff' }}>{localStorage.getItem('displayName') || '—'}</div>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>{role === 'SERVICE_PROVIDER' ? 'Service Provider' : 'Pet Owner'}</div>
            </div>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column' }}>
            <Link to={dashboardPath} style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff' }}>Dashboard</Link>
            <Link to="/bookings" style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff' }}>My Bookings</Link>
            <Link to="/book-service" style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff' }}>Book Service</Link>
            <Link to="/profile" style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff', borderLeft: '4px solid rgba(255,255,255,0.95)', background: 'rgba(255,255,255,0.12)' }}>Profile</Link>
            <a href="#" onClick={(e) => { e.preventDefault(); logout() }} style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff' }}>Logout</a>
          </nav>
        </aside>

        <main style={{ flex: 1, background: '#fff', padding: 16, overflow: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>My Profile</div>
              <div style={{ color: '#777' }}>View and manage your personal information</div>
            </div>
          </div>

          {loading ? (
            <div style={{ marginTop: 16, color: '#6b7280' }}>Loading…</div>
          ) : (
            <>
              {error ? <div style={{ marginTop: 12, color: '#b91c1c', fontWeight: 700 }}>{error}</div> : null}
              {success ? <div style={{ marginTop: 12, color: '#065f46', fontWeight: 700 }}>{success}</div> : null}

              <div style={{ marginTop: 16, border: '1px solid #e5e7eb', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
                  <div>
                    <button
                      type="button"
                      onClick={onChangePhoto}
                      style={{ border: '1px solid #d1d5db', background: '#fff', padding: '10px 12px', borderRadius: 6, fontWeight: 800, cursor: 'pointer', width: '100%' }}
                    >
                      Change Photo
                    </button>
                    <div style={{ marginTop: 10, width: '100%', aspectRatio: '1 / 1', border: '1px solid #e5e7eb', borderRadius: 10, background: '#f3f4f6', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {photoUrl ? (
                        <img src={photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ color: '#9ca3af', fontWeight: 900 }}>Profile Photo</div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>First Name</div>
                      <input value={firstName} onChange={(e) => setFirstName(e.target.value)} style={fieldStyle} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Last Name</div>
                      <input value={lastName} onChange={(e) => setLastName(e.target.value)} style={fieldStyle} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Email</div>
                      <input value={email} readOnly style={{ ...fieldStyle, background: '#f3f4f6' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Contact Number</div>
                      <input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} style={fieldStyle} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Address</div>
                      <input value={address} onChange={(e) => setAddress(e.target.value)} style={fieldStyle} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Role</div>
                      <input value={role === 'SERVICE_PROVIDER' ? 'Service Provider' : 'Pet Owner'} readOnly style={{ ...fieldStyle, background: '#f3f4f6' }} />
                    </div>

                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', gap: 12, marginTop: 6 }}>
                      <button
                        type="button"
                        onClick={onSave}
                        disabled={saving}
                        style={{ minWidth: 220, background: '#111', color: '#fff', border: 'none', borderRadius: 6, padding: '12px 14px', fontWeight: 900, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={onCancel}
                        style={{ minWidth: 140, background: '#fff', color: '#111', border: '1px solid #d1d5db', borderRadius: 6, padding: '12px 14px', fontWeight: 900, cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 18, borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
                <div style={{ fontWeight: 900, marginBottom: 10 }}>Change Password</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Current Password</div>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={fieldStyle} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>New Password</div>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={fieldStyle} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Confirm Password</div>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={fieldStyle} />
                  </div>
                </div>
                {passwordMsg ? <div style={{ marginTop: 10, color: passwordMsg === 'Password updated.' ? '#065f46' : '#b45309', fontWeight: 800 }}>{passwordMsg}</div> : null}
                <div style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={onUpdatePassword}
                    disabled={passwordSaving}
                    style={{ minWidth: 220, background: '#111', color: '#fff', border: 'none', borderRadius: 6, padding: '12px 14px', fontWeight: 900, cursor: passwordSaving ? 'not-allowed' : 'pointer', opacity: passwordSaving ? 0.6 : 1 }}
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
