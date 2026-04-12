import './styles/BookServiceChooseSchedule.css'

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosClient from '../api/axiosClient.js'
import { useBookingViewModel } from '../components/useBookingViewModel.js'

export default function BookService_SelectServiceType() {
  const navigate = useNavigate()
  const { provider, service, booking, setService, setSchedule, setPet } = useBookingViewModel()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [displayName, setDisplayName] = useState(localStorage.getItem('displayName') || '')

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
      navigate('/', { replace: true })
    }
  }, [navigate])

  const logout = () => {
    localStorage.clear()
    navigate('/', { replace: true })
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
      if (!provider?.providerId) {
        setLoading(false)
        setServices([])
        return
      }
      setLoading(true)
      setError('')
      try {
        const res = await axiosClient.get(`/api/providers/${provider.providerId}/services`)
        if (!isMounted) return
        setServices(res?.data || [])
      } catch (e) {
        if (!isMounted) return
        if (e?.response?.status === 401) {
          localStorage.clear()
          navigate('/', { replace: true })
          return
        }
        setError(e?.response?.data?.error?.message || e?.response?.data?.message || 'Failed to load services.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    run()
    return () => {
      isMounted = false
    }
  }, [navigate, provider?.providerId])

  const selectedServiceId = service?.serviceId || null
  const onSelectService = (s) => {
    setService({
      serviceId: s.serviceId,
      name: s.name,
      category: s.category,
      description: s.description || '',
      price: s.price,
      durationMinutes: s.durationMinutes,
    })
    setSchedule(null)
    setPet(null)
    navigate('/book-service/choose-schedule')
  }

  return (
    <div className="bsLayout">
      <header className="bsTopbar">
        <div className="bsBrand">PetCare Plus</div>
        <div className="bsTopNavWrap">
          <nav className="bsTopNav">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/bookings">My Bookings</Link>
            <Link to="/book-service" className="bsTopNavActive">Book Service</Link>
            <Link to="/profile">Profile</Link>
          </nav>
        </div>
        <div className="bsTopActions">
          <button className="bsIconBtn" aria-label="Search">🔍</button>
          <div className="bsAvatar">J</div>
        </div>
      </header>

      <div className="bsBody">
        <aside className="bsSidebar">
          <div className="bsUserCard">
            <div className="bsUserPic">X</div>
            <div>
              <div className="bsUserName">{displayName || '—'}</div>
              <div className="bsUserRole">Pet Owner</div>
            </div>
          </div>
          <nav className="bsSideNav">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/bookings">My Bookings</Link>
            <Link to="/book-service" className="bsSideNavActive">Book Service</Link>
            <Link to="/profile">Profile</Link>
            <a href="#" onClick={(e) => { e.preventDefault(); logout() }}>Logout</a>
          </nav>
        </aside>

        <main className="bsMain">
          <div>
            <div className="bsTitle">Book a Service</div>
            <div className="bsSubtitle">Step 2 — Select Service Type</div>
          </div>

          <div className="bsStepRow">
            <button type="button" className="bsStepBox" onClick={() => navigate('/book-service')}>1. Select Provider</button>
            <button type="button" className="bsStepBox bsStepActive" disabled>2. Select Service</button>
            <button type="button" className="bsStepBox" disabled={!selectedServiceId} onClick={() => navigate('/book-service/choose-schedule')}>3. Select Schedule</button>
            <button type="button" className="bsStepBox" disabled={!booking?.bookingId} onClick={() => navigate('/book-service/track-status')}>4. Track Status</button>
          </div>

          <div className="bsSummaryBar">
            <div className="bsSummaryLeft">
              <div className="bsSummaryLabel">Selected Provider</div>
              <div className="bsSummaryMeta">{provider?.name || 'No provider selected'}</div>
              {provider?.description ? <div className="bsSummaryMeta">{provider.description}</div> : null}
            </div>
            <button type="button" className="bsSummaryBtn" onClick={() => navigate('/book-service')}>Change</button>
          </div>

          {!provider?.providerId ? (
            <div style={{ marginTop: 16, color: '#6b7280' }}>Select a provider first.</div>
          ) : loading ? (
            <div style={{ marginTop: 16, color: '#6b7280', fontWeight: 700 }}>Loading services…</div>
          ) : error ? (
            <div style={{ marginTop: 16, color: '#b91c1c', fontWeight: 800 }}>{error}</div>
          ) : services.length === 0 ? (
            <div style={{ marginTop: 16, color: '#6b7280' }}>No services found for this provider.</div>
          ) : (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 900, marginBottom: 12 }}>Choose a Service</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {services.map((s) => (
                  <button
                    key={s.serviceId}
                    type="button"
                    onClick={() => onSelectService(s)}
                    className="bsStepBox"
                    style={{
                      textAlign: 'left',
                      border: selectedServiceId === s.serviceId ? '2px solid rgba(15, 133, 132, 1)' : undefined,
                      padding: 14,
                    }}
                  >
                    <div style={{ fontWeight: 900, color: '#111827' }}>{s.name}</div>
                    <div style={{ marginTop: 6, color: '#6b7280', fontSize: 13 }}>{s.description || 'Service'}</div>
                    <div style={{ marginTop: 10, color: '#111827', fontWeight: 800, fontSize: 13 }}>
                      {s.category} • {s.durationMinutes} mins • PHP {s.price}
                    </div>
                  </button>
                ))}
              </div>

              <div className="bsFooterRow">
                <button type="button" className="bsBackBtn" onClick={() => navigate('/book-service')}>← Back</button>
                <button type="button" className="bsNextBtn" disabled={!selectedServiceId} onClick={() => navigate('/book-service/choose-schedule')}>
                  Next: Schedule →
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
