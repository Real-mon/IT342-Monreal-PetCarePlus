import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosClient from '../api/axiosClient.js'

function formatTime(timeStr) {
  if (!timeStr) return ''
  const [hh, mm] = String(timeStr).split(':').map(Number)
  if (Number.isNaN(hh) || Number.isNaN(mm)) return String(timeStr)
  const d = new Date(2026, 0, 1, hh, mm, 0)
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload || {}
  } catch {
    return {}
  }
}

export default function ServiceProviderDashboard() {
  const navigate = useNavigate()
  const primary = 'rgba(15, 133, 132, 1)'
  const [displayName, setDisplayName] = useState(localStorage.getItem('displayName') || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bookings, setBookings] = useState([])
  const [services, setServices] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/', { replace: true })
      return
    }
    const { role } = decodeToken(token)
    if (role !== 'SERVICE_PROVIDER') {
      navigate('/', { replace: true })
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
    let isMounted = true
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const [bookingsRes, servicesRes] = await Promise.all([
          axiosClient.get('/api/bookings/provider'),
          axiosClient.get('/api/provider/services'),
        ])
        if (!isMounted) return
        setBookings(bookingsRes?.data || [])
        setServices(servicesRes?.data || [])
      } catch (e) {
        if (!isMounted) return
        if (e?.response?.status === 401) {
          localStorage.clear()
          navigate('/', { replace: true })
          return
        }
        setError(e?.response?.data?.error?.message || e?.response?.data?.message || 'Failed to load dashboard data.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    run()
    return () => {
      isMounted = false
    }
  }, [navigate])

  const todayKey = (() => {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  })()

  const pendingCount = bookings.filter((b) => String(b?.status || '').toUpperCase() === 'PENDING').length
  const todayCount = bookings.filter((b) => String(b?.scheduleDate || '') === todayKey).length
  const totalCount = bookings.length
  const serviceCount = services.length
  const stats = [
    { value: String(pendingCount), label: 'Pending Requests' },
    { value: String(todayCount), label: 'Today' },
    { value: String(totalCount), label: 'Total Bookings' },
    { value: String(serviceCount), label: 'Services' },
  ]

  const todaysSchedule = bookings
    .filter((b) => String(b?.scheduleDate || '') === todayKey)
    .slice()
    .sort((a, b) => String(a?.startTime || '').localeCompare(String(b?.startTime || '')))

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
      
      {/* Navbar */}
      <div style={{ background: 'rgb(16, 110, 108)', color: '#fff', height: 60, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
        <div style={{ background: 'rgba(0,0,0,0.15)', padding: '8px 12px', fontWeight: 700 }}>PetCare+</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ width: 36, height: 36, background: '#222', border: '1px solid #333', color: '#fff' }}>🔍</button>
          <div style={{ width: 36, height: 36, background: '#222', border: '1px solid #333', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>J</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex' }}>
        
        {/* Sidebar */}
        <aside className="sp-sidebar" style={{ width: 200, background: primary, padding: 12 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, background: 'rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>■</div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff' }}>{displayName || '—'}</div>
              <div style={{ color: '#fff', fontSize: 12 }}>Service Provider</div>
            </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column' }}>
            <Link to="/provider-dashboard" style={{ padding: '10px 8px', color: '#fff' }}>Dashboard</Link>
            <Link to="/bookings" style={{ padding: '10px 8px', color: '#fff' }}>Bookings</Link>
            <Link to="/provider-services" style={{ padding: '10px 8px', color: '#fff' }}>My Services</Link>
            <Link to="/provider-schedule" style={{ padding: '10px 8px', color: '#fff' }}>Schedule</Link>
            <Link to="/profile" style={{ padding: '10px 8px', color: '#fff' }}>Profile</Link>
            <a href="#" onClick={(e) => { e.preventDefault(); logout() }} style={{ padding: '10px 8px', color: '#fff' }}>Logout</a>
          </nav>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, background: '#fff', padding: 16, color: '#111' }}>
          
          <div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>Provider Dashboard</div>
            <div style={{ color: '#555' }}>Good morning! Here are your bookings.</div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 16 }}>
            {stats.map((s, idx) => (
              <div key={idx} style={{ background: '#f5f5f5', padding: 16, textAlign: 'center', color: '#111' }}>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{s.value}</div>
                <div style={{ color: '#666' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Booking Table */}
          <div style={{ marginTop: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: '#111' }}>Booking Requests</div>

            <div style={{ border: '1px solid #e5e5e5' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.2fr 0.9fr 0.9fr 0.8fr', padding: 10, background: '#f7f7f7', color: '#111', fontWeight: 700 }}>
                <div>Pet Owner</div>
                <div>Service</div>
                <div>Date</div>
                <div>Time</div>
                <div>Status</div>
              </div>

              {loading ? (
                <div style={{ padding: 10, color: '#6b7280' }}>Loading…</div>
              ) : error ? (
                <div style={{ padding: 10, color: '#b91c1c', fontWeight: 800 }}>{error}</div>
              ) : bookings.length === 0 ? (
                <div style={{ padding: 10, color: '#6b7280' }}>No bookings assigned yet.</div>
              ) : (
                bookings.map((b) => (
                  <div key={b.bookingId} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.2fr 0.9fr 0.9fr 0.8fr', padding: 10, borderTop: '1px solid #eee', color: '#111' }}>
                    <div>{b.petOwnerName || b.petOwnerEmail || b.petOwnerId || '—'}</div>
                    <div>{b.serviceName || '—'}</div>
                    <div>{b.scheduleDate || '—'}</div>
                    <div>{b.startTime && b.endTime ? `${formatTime(b.startTime)} - ${formatTime(b.endTime)}` : '—'}</div>
                    <div style={{ fontWeight: 800 }}>{b.status || '—'}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom Sections */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>

            {/* Schedule */}
            <div>
              <div style={{ fontWeight: 700, marginBottom: 8, color: '#111' }}>Today's Schedule</div>
              {loading ? (
                <div style={{ padding: 10, border: '1px solid #eee', color: '#6b7280' }}>Loading…</div>
              ) : todaysSchedule.length === 0 ? (
                <div style={{ padding: 10, border: '1px solid #eee', color: '#6b7280' }}>No bookings scheduled for today.</div>
              ) : (
                todaysSchedule.map((s) => (
                  <div key={s.bookingId} style={{ padding: 10, border: '1px solid #eee', marginBottom: 5, color: '#111' }}>
                    <strong>{formatTime(s.startTime)}</strong> - {s.petOwnerName || s.petOwnerEmail || s.petOwnerId || '—'} ({s.serviceName || '—'}) • {s.status || '—'}
                  </div>
                ))
              )}
            </div>

            {/* Services */}
            <div>
              <div style={{ fontWeight: 700, marginBottom: 8, color: '#111' }}>My Services</div>
              {loading ? (
                <div style={{ padding: 10, border: '1px solid #eee', color: '#6b7280' }}>Loading…</div>
              ) : services.length === 0 ? (
                <div style={{ padding: 10, border: '1px solid #eee', color: '#6b7280' }}>No services added yet.</div>
              ) : (
                services.map((svc) => (
                  <div key={svc.serviceId} style={{ padding: 10, border: '1px solid #eee', marginBottom: 5, color: '#111' }}>
                    <strong>{svc.name}</strong> - PHP {svc.price} | {svc.durationMinutes} min
                  </div>
                ))
              )}
            </div>

          </div>
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sp-sidebar { display: none; }
        }
      `}</style>
    </div>
  )
}
