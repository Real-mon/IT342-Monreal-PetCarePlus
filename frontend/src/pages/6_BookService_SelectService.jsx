import './styles/BookServiceChooseSchedule.css'

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosClient from '../api/axiosClient.js'
import { useBookingViewModel } from '../components/useBookingViewModel.js'

export default function BookService_SelectService() {
  const navigate = useNavigate()
  const { provider, service, booking, setProvider, setService, setSchedule, setPet } = useBookingViewModel()
  const [providers, setProviders] = useState([])
  const [servicesByProviderId, setServicesByProviderId] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
    let isMounted = true
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const [providersRes, servicesRes] = await Promise.all([
          axiosClient.get('/api/providers'),
          axiosClient.get('/api/services'),
        ])
        const providerList = providersRes?.data || []
        const serviceList = servicesRes?.data || []

        const map = {}
        for (const s of serviceList) {
          const providerId = s?.provider?.providerId
          if (!providerId) continue
          if (!map[providerId]) map[providerId] = []
          map[providerId].push(s)
        }

        if (!isMounted) return
        setProviders(providerList)
        setServicesByProviderId(map)
      } catch (e) {
        if (!isMounted) return
        if (e?.response?.status === 401) {
          localStorage.clear()
          navigate('/', { replace: true })
          return
        }
        setError(e?.response?.data?.error?.message || e?.response?.data?.message || 'Failed to load providers.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    run()
    return () => {
      isMounted = false
    }
  }, [navigate])

  const selectedProviderId = provider?.providerId || null
  const providerLabel = (p) => p?.businessName || p?.user?.email || `Provider #${p?.providerId}`

  const onSelectProvider = (p) => {
    const next = {
      providerId: p.providerId,
      name: providerLabel(p),
      description: p.description || '',
    }
    setProvider(next)
    setService(null)
    setSchedule(null)
    setPet(null)
    navigate('/book-service/select-service')
  }

  const step2Disabled = !selectedProviderId
  const step3Disabled = !service?.serviceId
  const step4Disabled = !booking?.bookingId

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
              <div className="bsUserName">Juan dela Cruz</div>
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
            <div className="bsSubtitle">Step 1 — Select Service Provider</div>
          </div>

          <div className="bsStepRow">
            <button type="button" className="bsStepBox bsStepActive" disabled>1. Select Provider</button>
            <button
              type="button"
              className="bsStepBox"
              disabled={step2Disabled}
              onClick={() => navigate('/book-service/select-service')}
            >
              2. Select Service
            </button>
            <button
              type="button"
              className="bsStepBox"
              disabled={step3Disabled}
              onClick={() => navigate('/book-service/choose-schedule')}
            >
              3. Select Schedule
            </button>
            <button
              type="button"
              className="bsStepBox"
              disabled={step4Disabled}
              onClick={() => navigate('/book-service/track-status')}
            >
              4. Track Status
            </button>
          </div>

          {provider ? (
            <div className="bsSummaryBar">
              <div className="bsSummaryLeft">
                <div className="bsSummaryLabel">Selected Provider</div>
                <div className="bsSummaryMeta">{provider.name}</div>
              </div>
            </div>
          ) : null}

          {loading ? (
            <div style={{ marginTop: 16, color: '#6b7280', fontWeight: 700 }}>Loading providers…</div>
          ) : error ? (
            <div style={{ marginTop: 16, color: '#b91c1c', fontWeight: 800 }}>{error}</div>
          ) : providers.length === 0 ? (
            <div style={{ marginTop: 16, color: '#6b7280' }}>No service providers found.</div>
          ) : (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 900, marginBottom: 12 }}>Available Providers</div>
              <div className="bsProviderGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {providers.map((p) => {
                  const name = providerLabel(p)
                  const services = servicesByProviderId[p.providerId] || []
                  const serviceNames = Array.from(new Set(services.map((s) => s?.name).filter(Boolean)))
                  return (
                    <div
                      key={p.providerId}
                      style={{
                        border: selectedProviderId === p.providerId ? '2px solid rgba(15, 133, 132, 1)' : '1px solid #e5e7eb',
                        borderRadius: 12,
                        padding: 14,
                        background: '#fff',
                        display: 'flex',
                        gap: 12,
                      }}
                    >
                      <div style={{ width: 120, height: 90, background: '#f3f4f6', borderRadius: 8, border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontWeight: 800, flexShrink: 0 }}>X</div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontWeight: 900, fontSize: 16 }}>{name}</div>
                        <div style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>{p.description || 'Service provider'}</div>
                        <div style={{ color: '#6b7280', fontSize: 13, marginTop: 8 }}>
                          <span style={{ fontWeight: 800 }}>Services:</span>{' '}
                          {serviceNames.length ? serviceNames.slice(0, 4).join(', ') : 'No services configured'}
                          {serviceNames.length > 4 ? ` (+${serviceNames.length - 4} more)` : ''}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
                          <button
                            type="button"
                            onClick={() => onSelectProvider(p)}
                            style={{
                              marginTop: 10,
                              background: 'rgba(15, 133, 132, 1)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 8,
                              padding: '8px 12px',
                              cursor: 'pointer',
                              fontWeight: 800,
                            }}
                          >
                            Select Provider
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
