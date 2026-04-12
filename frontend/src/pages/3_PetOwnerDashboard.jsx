// PetOwnerDashboard: Two-panel dashboard layout for pet owners with navbar, stats, table, and actions
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import axiosClient from '../api/axiosClient.js'

export default function PetOwnerDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const primary = 'rgba(15, 133, 132, 1)'
  const [displayName, setDisplayName] = useState(localStorage.getItem('displayName') || '')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [bookings, setBookings] = useState([])
  const [petCount, setPetCount] = useState(0)
  const [toast, setToast] = useState('')
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/', { replace: true })
      return
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload?.role === 'SERVICE_PROVIDER') {
        navigate('/provider-dashboard', { replace: true })
      }
    } catch {
      // ignore decode errors
    }
  }, [navigate])

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  useEffect(() => {
    if (displayName) return
    let isMounted = true
    axiosClient.get('/api/profile').then((res) => {
      const name = String(res?.data?.fullName || '').trim()
      if (!name) return
      localStorage.setItem('displayName', name)
      if (isMounted) setDisplayName(name)
    }).catch(() => {})
    return () => {
      isMounted = false
    }
  }, [displayName])

  useEffect(() => {
    if (location?.state?.bookingCreated) {
      setToast('Booking created successfully.')
      navigate('/dashboard', { replace: true, state: {} })
      return
    }
    if (location?.state?.bookingCancelled) {
      setToast('Booking cancelled.')
      navigate('/dashboard', { replace: true, state: {} })
    }
  }, [location?.state?.bookingCancelled, location?.state?.bookingCreated, navigate])

  useEffect(() => {
    let isMounted = true
    const run = async () => {
      setLoading(true)
      setLoadError('')
      try {
        const [bookingsRes, petsRes] = await Promise.all([
          axiosClient.get('/api/bookings/owner'),
          axiosClient.get('/api/pets'),
        ])
        if (!isMounted) return
        setBookings(bookingsRes?.data || [])
        setPetCount((petsRes?.data || []).length)
      } catch (e) {
        if (!isMounted) return
        if (e?.response?.status === 401) {
          localStorage.clear()
          navigate('/', { replace: true })
          return
        }
        setLoadError(e?.response?.data?.error?.message || e?.response?.data?.message || 'Failed to load dashboard data.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    run()
    return () => {
      isMounted = false
    }
  }, [navigate])

  const pendingCount = bookings.filter((b) => String(b.status).toUpperCase() === 'PENDING').length
  const upcomingCount = bookings.filter((b) => ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(String(b.status).toUpperCase())).length
  const stats = [
    { value: upcomingCount, label: 'Upcoming' },
    { value: pendingCount, label: 'Pending' },
    { value: bookings.length, label: 'Total' },
    { value: petCount, label: 'My Pets' },
  ]

  const activities = [
    { title: 'Booking confirmed', desc: 'Buddy - Full Grooming', time: '1 min ago' },
    { title: 'Booking submitted', desc: 'Luna - Vet Check-up', time: '4 mins ago' },
    { title: 'Reminder', desc: 'Vaccination due', time: '7 mins ago' },
  ]

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
      {/* Top Navbar */}
      <div style={{ background: 'rgb(16, 110, 108)', color: '#fff', height: 60, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
        <div style={{ background: 'rgba(0,0,0,0.15)', padding: '8px 12px', fontWeight: 700 }}>PetCare+</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button aria-label="Search" style={{ width: 36, height: 36, background: '#222', border: '1px solid #333', color: '#fff', cursor: 'pointer' }}>🔍</button>
          <div style={{ width: 36, height: 36, background: '#222', border: '1px solid #333', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>J</div>
        </div>
      </div>

      {/* Body: Sidebar + Main */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Sidebar */}
        <aside style={{ width: 200, background: primary, borderRight: '1px solid rgba(0,0,0,0.15)', padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, background: 'rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.9)' }}>X</div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff' }}>{displayName || '—'}</div>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>Pet Owner</div>
            </div>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column' }}>
            <Link to="/dashboard" style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff', borderLeft: '4px solid rgba(255,255,255,0.95)', background: 'rgba(255,255,255,0.12)' }}>Dashboard</Link>
            <Link to="/bookings" style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff' }}>My Bookings</Link>
            <Link to="/book-service" style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff' }}>Book Service</Link>
            <Link to="/profile" style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff' }}>Profile</Link>
            <a href="#" onClick={(e) => { e.preventDefault(); logout() }} style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff' }}>Logout</a>
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, background: '#fff', padding: 16, overflow: 'auto' }}>
          {/* Page Title */}
          <div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>Dashboard</div>
            <div style={{ color: '#777' }}>Welcome back, Juan!</div>
          </div>

          {toast ? (
            <div style={{ marginTop: 12, color: '#065f46', fontWeight: 800 }}>{toast}</div>
          ) : null}
          {loadError ? (
            <div style={{ marginTop: 12, color: '#b91c1c', fontWeight: 800 }}>{loadError}</div>
          ) : null}

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 16 }}>
            {stats.map((s, idx) => (
              <div key={idx} style={{ background: '#f0f0f0', padding: '16px 12px', textAlign: 'center', color: '#111' }}>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{s.value}</div>
                <div style={{ color: '#777', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Upcoming Bookings Table */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontWeight: 700 }}>Upcoming Bookings</div>
              <button type="button" onClick={() => navigate('/bookings')} style={{ background: 'transparent', border: '1px solid #ccc', padding: '6px 10px', cursor: 'pointer' }}>View All</button>
            </div>
            <div style={{ border: '1px solid #e5e5e5' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1.2fr 1.2fr 1fr 0.8fr', padding: '10px 8px', background: '#f7f7f7', fontWeight: 600, color: '#111', }}>
                <div>Pet</div>
                <div>Service</div>
                <div>Provider</div>
                <div>Date &amp; Time</div>
                <div>Status</div>
                <div>Action</div>
              </div>
              {loading ? (
                <div style={{ padding: '12px 8px', color: '#6b7280' }}>Loading…</div>
              ) : bookings.length === 0 ? (
                <div style={{ padding: '12px 8px', color: '#6b7280' }}>No bookings yet.</div>
              ) : (
                bookings.slice(0, 5).map((b) => {
                  const when = b.scheduleDate && b.startTime ? `${b.scheduleDate} ${String(b.startTime).slice(0, 5)}` : '—'
                  return (
                    <div key={b.bookingId} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1.2fr 1.2fr 1fr 0.8fr', padding: '10px 8px', borderTop: '1px solid #eee', color: '#111' }}>
                      <div>{b.petName || '—'}</div>
                      <div>{b.serviceName || b.serviceId}</div>
                      <div>{b.providerName || b.providerId}</div>
                      <div>{when}</div>
                      <div>{b.status}</div>
                      <div><button type="button" onClick={() => navigate('/bookings')} style={{ background: 'transparent', border: '1px solid #ccc', padding: '4px 8px', cursor: 'pointer', color: '#111' }}>Details</button></div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Bottom Two-Column Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.6fr', gap: 16, marginTop: 20 }}>
            {/* Recent Activity */}
            <div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Recent Activity</div>
              <div style={{ border: '1px solid #e5e5e5' }}>
                {activities.map((a, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '10px 8px', borderTop: idx === 0 ? 'none' : '1px solid #eee', color: '#111' }}>
                    <div style={{ width: 36, height: 36, background: '#cfcfcf', marginRight: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#777' }}>■</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{a.title}</div>
                      <div style={{ color: '#777', fontSize: 13 }}>{a.desc}</div>
                    </div>
                    <div style={{ color: '#777', fontSize: 12 }}>{a.time}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <button type="button" onClick={() => navigate('/book-service')} style={{ width: '100%', background: primary, color: '#fff', border: 'none', padding: '12px 14px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>Book a Service</span><span>&gt;</span>
              </button>
              <button type="button" onClick={() => navigate('/bookings')} style={{ width: '100%', background: primary, color: '#fff', border: 'none', padding: '12px 14px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>View All Bookings</span><span>&gt;</span>
              </button>
              <button type="button" onClick={() => navigate('/profile')} style={{ width: '100%', background: primary, color: '#fff', border: 'none', padding: '12px 14px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>Update Profile</span><span>&gt;</span>
              </button>
              <button type="button" style={{ width: '100%', background: primary, color: '#fff', border: 'none', padding: '12px 14px', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}>
                <span>Notifications</span><span>&gt;</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
// PetOwnerDashboard: Main dashboard page for pet owners after login
