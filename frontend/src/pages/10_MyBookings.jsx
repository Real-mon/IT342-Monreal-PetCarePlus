import { useEffect, useMemo, useState } from 'react'
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

export default function MyBookings() {
  const navigate = useNavigate()
  const topbar = 'rgb(16, 110, 108)'
  const sidebar = 'rgba(15, 133, 132, 1)'

  const [role, setRole] = useState('PET_OWNER')
  const [displayName, setDisplayName] = useState(localStorage.getItem('displayName') || '')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/', { replace: true })
      return
    }
    const payload = decodeToken(token)
    setRole(payload?.role === 'SERVICE_PROVIDER' ? 'SERVICE_PROVIDER' : 'PET_OWNER')
  }, [navigate])

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
        const endpoint = role === 'SERVICE_PROVIDER' ? '/api/bookings/provider' : '/api/bookings/owner'
        const res = await axiosClient.get(endpoint)
        if (!isMounted) return
        setBookings(res?.data || [])
      } catch (e) {
        if (!isMounted) return
        if (e?.response?.status === 401) {
          localStorage.clear()
          navigate('/', { replace: true })
          return
        }
        setError(e?.response?.data?.error?.message || e?.response?.data?.message || 'Failed to load bookings.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    run()
    return () => {
      isMounted = false
    }
  }, [navigate, role])

  const logout = () => {
    localStorage.clear()
    navigate('/', { replace: true })
  }

  const rows = useMemo(() => {
    return (bookings || []).map((b) => {
      const date = b?.scheduleDate || '—'
      const time = b?.startTime && b?.endTime ? `${formatTime(b.startTime)} - ${formatTime(b.endTime)}` : '—'
      return {
        bookingId: b?.bookingId,
        petOwnerId: b?.petOwnerId,
        providerName: b?.providerName || '—',
        serviceName: b?.serviceName || '—',
        date,
        time,
        status: b?.status || '—',
        raw: b,
      }
    })
  }, [bookings])

  const onOpen = (bookingId) => {
    if (role === 'SERVICE_PROVIDER') return
    if (!bookingId) return
    sessionStorage.setItem('currentBookingId', String(bookingId))
    navigate('/book-service/track-status')
  }

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
      <div style={{ background: topbar, color: '#fff', height: 60, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
        <div style={{ background: 'rgba(0,0,0,0.15)', padding: '8px 12px', fontWeight: 700 }}>PetCare+</div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button aria-label="Search" style={{ width: 36, height: 36, background: '#222', border: '1px solid #333', color: '#fff', cursor: 'pointer' }}>🔍</button>
          <div style={{ width: 36, height: 36, background: '#222', border: '1px solid #333', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>J</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <aside style={{ width: 200, background: sidebar, borderRight: '1px solid rgba(0,0,0,0.15)', padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, background: 'rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.9)' }}>X</div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff' }}>{displayName || '—'}</div>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>{role === 'SERVICE_PROVIDER' ? 'Service Provider' : 'Pet Owner'}</div>
            </div>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column' }}>
            {role === 'SERVICE_PROVIDER' ? (
              <>
                <Link to="/provider-dashboard" style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff' }}>Dashboard</Link>
                <Link to="/bookings" style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff', borderLeft: '4px solid rgba(255,255,255,0.95)', background: 'rgba(255,255,255,0.12)' }}>My Bookings</Link>
                <Link to="/provider-services" style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff' }}>My Services</Link>
                <Link to="/provider-schedule" style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff' }}>Schedule</Link>
                <Link to="/profile" style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff' }}>Profile</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff' }}>Dashboard</Link>
                <Link to="/bookings" style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff', borderLeft: '4px solid rgba(255,255,255,0.95)', background: 'rgba(255,255,255,0.12)' }}>My Bookings</Link>
                <Link to="/book-service" style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff' }}>Book Service</Link>
                <Link to="/profile" style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff' }}>Profile</Link>
              </>
            )}
            <a href="#" onClick={(e) => { e.preventDefault(); logout() }} style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff' }}>Logout</a>
          </nav>
        </aside>

        <main style={{ flex: 1, background: '#fff', padding: 16, overflow: 'auto' }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>My Bookings</div>
            <div style={{ color: '#777' }}>View your bookings and track status.</div>
          </div>

          {error ? <div style={{ marginTop: 12, color: '#b91c1c', fontWeight: 800 }}>{error}</div> : null}

          <div style={{ marginTop: 16, border: '1px solid #e5e5e5' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: role === 'SERVICE_PROVIDER' ? '1.2fr 1.4fr 0.9fr 0.9fr 0.9fr' : '1.2fr 1.4fr 0.9fr 0.9fr 0.9fr',
                padding: '10px 8px',
                background: '#f7f7f7',
                fontWeight: 700,
                color: '#111', // ✅ FIX: force dark text
              }}
            >
              <div>{role === 'SERVICE_PROVIDER' ? 'Provider' : 'Provider'}</div>
              <div>Service</div>
              <div>Date</div>
              <div>Time</div>
              <div>Status</div>
            </div>

            {loading ? (
              <div style={{ padding: '12px 8px', color: '#6b7280' }}>Loading…</div>
            ) : rows.length === 0 ? (
              <div style={{ padding: '12px 8px', color: '#6b7280' }}>No bookings yet.</div>
            ) : (
              rows.map((r) => {
                const commonStyle = {
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1.4fr 0.9fr 0.9fr 0.9fr',
                  padding: '10px 8px',
                  borderTop: '1px solid #eee',
                  background: '#fff',
                  textAlign: 'left',
                  color: '#111',
                }
                if (role === 'SERVICE_PROVIDER') {
                  return (
                    <div key={r.bookingId} style={commonStyle}>
                      <div style={{ fontWeight: 800 }}>{r.providerName}</div>
                      <div>{r.serviceName}</div>
                      <div>{r.date}</div>
                      <div>{r.time}</div>
                      <div style={{ fontWeight: 800 }}>{r.status}</div>
                    </div>
                  )
                }
                return (
                  <button
                    key={r.bookingId}
                    type="button"
                    onClick={() => onOpen(r.bookingId)}
                    style={{
                      ...commonStyle,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 800 }}>{r.providerName}</div>
                    <div>{r.serviceName}</div>
                    <div>{r.date}</div>
                    <div>{r.time}</div>
                    <div style={{ fontWeight: 800 }}>{r.status}</div>
                  </button>
                )
              })
            )}
          </div>
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          aside { display: none; }
        }
      `}</style>
    </div>
  )
}
