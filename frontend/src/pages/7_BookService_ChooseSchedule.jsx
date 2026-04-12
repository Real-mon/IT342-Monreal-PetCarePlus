import './styles/BookServiceChooseSchedule.css'

import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosClient from '../api/axiosClient.js'
import { useBookingViewModel } from '../components/useBookingViewModel.js'

function formatDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function monthLabel(date) {
  return date.toLocaleString(undefined, { month: 'long', year: 'numeric' })
}

function weekdayLabels() {
  const base = new Date(2026, 2, 1)
  const labels = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    labels.push(d.toLocaleString(undefined, { weekday: 'short' }))
  }
  return labels
}

function formatTime(timeStr) {
  if (!timeStr) return ''
  const [hh, mm] = String(timeStr).split(':').map(Number)
  if (Number.isNaN(hh) || Number.isNaN(mm)) return timeStr
  const d = new Date(2026, 0, 1, hh, mm, 0)
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export default function BookService_ChooseSchedule() {
  const navigate = useNavigate()
  const { provider, service, bookingId, setService, setSchedule, setPet, setBookingId } = useBookingViewModel()
  const providerId = provider?.providerId

  const [services, setServices] = useState([])
  const [servicesLoading, setServicesLoading] = useState(true)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [creatingBooking, setCreatingBooking] = useState(false)
  const [error, setError] = useState('')
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const [selectedServiceId, setSelectedServiceId] = useState(service?.serviceId || null)
  const [selectedDateKey, setSelectedDateKey] = useState('')
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedScheduleId, setSelectedScheduleId] = useState(null)

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
    if (!providerId) {
      navigate('/book-service', { replace: true })
    }
  }, [navigate, providerId])

  useEffect(() => {
    let isMounted = true
    const run = async () => {
      if (!providerId) return
      setServicesLoading(true)
      setError('')
      try {
        const res = await axiosClient.get(`/api/providers/${providerId}/services`)
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
        if (isMounted) setServicesLoading(false)
      }
    }
    run()
    return () => {
      isMounted = false
    }
  }, [navigate, providerId])

  useEffect(() => {
    let isMounted = true
    const run = async () => {
      if (!providerId || !selectedServiceId || !selectedDateKey) {
        setAvailableSlots([])
        return
      }
      setSlotsLoading(true)
      setError('')
      try {
        const res = await axiosClient.get(`/api/providers/${providerId}/availability`, {
          params: { serviceId: selectedServiceId, date: selectedDateKey },
        })
        if (!isMounted) return
        setAvailableSlots(res?.data || [])
      } catch (e) {
        if (!isMounted) return
        if (e?.response?.status === 401) {
          localStorage.clear()
          navigate('/', { replace: true })
          return
        }
        setError(e?.response?.data?.error?.message || e?.response?.data?.message || 'Failed to load available slots.')
      } finally {
        if (isMounted) setSlotsLoading(false)
      }
    }
    run()
    return () => {
      isMounted = false
    }
  }, [navigate, providerId, selectedServiceId, selectedDateKey])

  const calendarDays = useMemo(() => {
    const year = monthCursor.getFullYear()
    const month = monthCursor.getMonth()
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)
    const startDow = first.getDay()
    const daysInMonth = last.getDate()
    const cells = []
    for (let i = 0; i < startDow; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [monthCursor])

  const selectedDateObj = useMemo(() => {
    if (!selectedDateKey) return null
    const [y, m, d] = selectedDateKey.split('-').map(Number)
    return new Date(y, m - 1, d)
  }, [selectedDateKey])

  const slotByStart = useMemo(() => {
    const map = new Map()
    for (const s of availableSlots) {
      const start = String(s?.startTime || '').slice(0, 5)
      if (!start) continue
      map.set(start, s)
    }
    return map
  }, [availableSlots])

  const timeStarts = useMemo(() => {
    const out = []
    for (let hour = 9; hour <= 16; hour++) {
      out.push(`${String(hour).padStart(2, '0')}:00`)
    }
    return out
  }, [])

  const onSelectService = (s) => {
    setService({
      serviceId: s.serviceId,
      name: s.name,
      category: s.category,
      description: s.description || '',
      price: s.price,
      durationMinutes: s.durationMinutes,
    })
    setSelectedServiceId(s.serviceId)
    setSelectedDateKey('')
    setSelectedScheduleId(null)
    setAvailableSlots([])
    setSchedule(null)
    setPet(null)
    setBookingId(null)
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
            <div className="bsSubtitle">Step 2 — Select Schedule</div>
          </div>

          <div className="bsStepRow">
            <button type="button" className="bsStepBox" onClick={() => navigate('/book-service')}>1. Select Provider</button>
            <button type="button" className="bsStepBox bsStepActive" disabled>2. Select Schedule</button>
            <button type="button" className="bsStepBox" disabled={!bookingId} onClick={() => navigate('/book-service/confirm-booking')}>3. Confirm Booking</button>
            <button type="button" className="bsStepBox" disabled>4. Track Status</button>
          </div>

          <div className="bsSummaryBar">
            <div className="bsSummaryLeft">
              <div className="bsSummaryLabel">Selected</div>
              <div className="bsSummaryMeta">Provider: {provider?.name || '—'}</div>
              <div className="bsSummaryMeta">Service: {service?.name || '—'}</div>
            </div>
            <button
              type="button"
              className="bsSummaryBtn"
              onClick={() => navigate('/book-service')}
            >
              Change
            </button>
          </div>

          {error ? (
            <div style={{ marginTop: 14, color: '#b91c1c', fontWeight: 800 }}>{error}</div>
          ) : null}

          {!providerId ? (
            <div style={{ marginTop: 16, color: '#6b7280' }}>Select a provider first.</div>
          ) : servicesLoading ? (
            <div style={{ marginTop: 16, color: '#6b7280', fontWeight: 700 }}>Loading…</div>
          ) : error ? (
            <div style={{ marginTop: 16, color: '#6b7280' }} />
          ) : services.length === 0 ? (
            <div style={{ marginTop: 16, color: '#6b7280' }}>No services found for this provider.</div>
          ) : (
            <div style={{ marginTop: 16 }}>
              <div className="bsPanel" style={{ marginBottom: 16 }}>
                <div className="bsPanelTitle">Select Service</div>
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
              </div>

              {!selectedServiceId ? null : slotsLoading ? (
                <div style={{ color: '#6b7280', fontWeight: 700 }}>Loading available slots…</div>
              ) : (
                <div className="bsScheduleGrid">
                  <section className="bsPanel">
                    <div className="bsPanelTitle">Select Date</div>
                    <div className="bsCalendarHeader">
                      <button
                        type="button"
                        className="bsCalNavBtn"
                        onClick={() => {
                          const d = new Date(monthCursor)
                          d.setMonth(d.getMonth() - 1)
                          setMonthCursor(d)
                        }}
                      >
                        ‹
                      </button>
                      <div className="bsCalMonth">{monthLabel(monthCursor)}</div>
                      <button
                        type="button"
                        className="bsCalNavBtn"
                        onClick={() => {
                          const d = new Date(monthCursor)
                          d.setMonth(d.getMonth() + 1)
                          setMonthCursor(d)
                        }}
                      >
                        ›
                      </button>
                    </div>

                    <div className="bsCalendarGrid">
                      {weekdayLabels().map((w) => (
                        <div key={w} className="bsCalDow">{w}</div>
                      ))}
                      {calendarDays.map((d, idx) => {
                        if (!d) return <div key={`e-${idx}`} />
                        const key = formatDateKey(d)
                        const today = startOfDay(new Date())
                        const isPast = startOfDay(d) < today
                        const isAvailable = !isPast
                        const isSelected = key === selectedDateKey
                        const cls = [
                          'bsDayBtn',
                          isAvailable ? 'bsDayAvailable' : '',
                          isSelected ? 'bsDaySelected' : '',
                        ].filter(Boolean).join(' ')
                        return (
                          <button
                            key={key}
                            type="button"
                            className={cls}
                            disabled={!isAvailable}
                            onClick={() => {
                              setSelectedDateKey(key)
                              setSelectedScheduleId(null)
                              setSchedule(null)
                              setBookingId(null)
                              setError('')
                            }}
                          >
                            {d.getDate()}
                          </button>
                        )
                      })}
                    </div>

                    <div className="bsLegend">
                      <span><span className="bsLegendDot bsLegendAvail" />Available</span>
                      <span><span className="bsLegendDot bsLegendUnavail" />Unavailable</span>
                    </div>
                  </section>

                  <section className="bsPanel">
                    <div className="bsSlotsHeader">
                      <div className="bsPanelTitle" style={{ marginBottom: 0 }}>Available Time Slots</div>
                      <div className="bsSlotsDate">
                        {selectedDateObj ? selectedDateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select a date'}
                      </div>
                    </div>

                    {selectedDateKey ? (
                      timeStarts.map((t) => {
                        const slot = slotByStart.get(t)
                        const isSelected = selectedScheduleId === slot?.scheduleId
                        const cls = ['bsSlotBtn', isSelected ? 'bsSlotSelected' : ''].filter(Boolean).join(' ')
                        return (
                          <button
                            key={t}
                            type="button"
                            className={cls}
                            disabled={!slot || creatingBooking}
                            onClick={async () => {
                              if (!slot || !providerId || !selectedServiceId) return
                              setCreatingBooking(true)
                              setError('')
                              try {
                                const res = await axiosClient.post('/api/bookings', {
                                  serviceId: selectedServiceId,
                                  scheduleId: slot.scheduleId,
                                  petId: null,
                                })
                                const created = res?.data || {}
                                if (!created.bookingId) {
                                  setError('Booking created but no booking ID returned.')
                                  return
                                }
                                setSchedule({
                                  scheduleId: slot.scheduleId,
                                  date: slot.date,
                                  startTime: slot.startTime,
                                  endTime: slot.endTime,
                                })
                                setBookingId(created.bookingId)
                                setPet(null)
                                navigate('/book-service/confirm-booking')
                              } catch (e) {
                                if (e?.response?.status === 401) {
                                  localStorage.clear()
                                  navigate('/', { replace: true })
                                  return
                                }
                                setError(e?.response?.data?.error?.message || e?.response?.data?.message || 'Failed to lock time slot.')
                              } finally {
                                setCreatingBooking(false)
                              }
                            }}
                          >
                            {formatTime(t)}
                          </button>
                        )
                      })
                    ) : (
                      <div className="bsSmallText" style={{ marginTop: 10 }}>Pick a date to see times.</div>
                    )}

                    <div className="bsFooterRow">
                      <button type="button" className="bsBackBtn" onClick={() => navigate('/book-service')}>← Back</button>
                      <button type="button" className="bsNextBtn" disabled={!bookingId} onClick={() => navigate('/book-service/confirm-booking')}>
                        Next: Confirm →
                      </button>
                    </div>
                  </section>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
