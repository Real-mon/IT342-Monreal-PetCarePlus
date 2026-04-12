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

export default function BookService_ConfirmBooking() {
  const navigate = useNavigate()
  const { provider, service, schedule, setSchedule, setBooking } = useBookingViewModel()
  const providerId = provider?.providerId
  const serviceId = service?.serviceId
  const [displayName, setDisplayName] = useState(localStorage.getItem('displayName') || '')

  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedDateKey, setSelectedDateKey] = useState(schedule?.date || '')
  const [selectedScheduleId, setSelectedScheduleId] = useState(schedule?.scheduleId || null)
  const [scheduleByDate, setScheduleByDate] = useState({})
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
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
      if (!providerId || !serviceId) {
        setLoading(false)
        setScheduleByDate({})
        return
      }
      setLoading(true)
      setError('')
      try {
        const res = await axiosClient.get(`/api/providers/${providerId}/availability`, {
          params: { serviceId },
        })
        const list = res?.data || []
        const map = {}
        for (const s of list) {
          const dateKey = s?.date
          if (!dateKey) continue
          if (!map[dateKey]) map[dateKey] = []
          map[dateKey].push(s)
        }
        for (const key of Object.keys(map)) {
          map[key].sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)))
        }
        if (!isMounted) return
        setScheduleByDate(map)
      } catch (e) {
        if (!isMounted) return
        if (e?.response?.status === 401) {
          localStorage.clear()
          navigate('/', { replace: true })
          return
        }
        setError(e?.response?.data?.error?.message || e?.response?.data?.message || 'Failed to load schedules.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    run()
    return () => {
      isMounted = false
    }
  }, [navigate, providerId, serviceId])

  const availableDateKeys = useMemo(() => new Set(Object.keys(scheduleByDate)), [scheduleByDate])
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

  const slotsForSelectedDate = useMemo(() => scheduleByDate[selectedDateKey] || [], [scheduleByDate, selectedDateKey])
  const slotByStartTime = useMemo(() => {
    const map = new Map()
    for (const s of slotsForSelectedDate) {
      const k = String(s?.startTime || '').slice(0, 5)
      if (!k) continue
      map.set(k, s)
    }
    return map
  }, [slotsForSelectedDate])

  const confirmBooking = async () => {
    if (!providerId || !serviceId || !selectedDateKey || !selectedScheduleId) return
    setVerifying(true)
    setError('')
    try {
      const res = await axiosClient.get(`/api/providers/${providerId}/availability`, {
        params: { serviceId, date: selectedDateKey },
      })
      const list = res?.data || []
      const match = list.find((s) => s?.scheduleId === selectedScheduleId)
      if (!match) {
        setError('That time slot was just booked. Please pick another slot.')
        setSelectedScheduleId(null)
        return
      }
      setSchedule({
        scheduleId: match.scheduleId,
        date: match.date,
        startTime: match.startTime,
        endTime: match.endTime,
      })
      const created = await axiosClient.post('/api/bookings', {
        serviceId,
        scheduleId: match.scheduleId,
      })
      const booking = created?.data || null
      if (booking?.bookingId) sessionStorage.setItem('currentBookingId', String(booking.bookingId))
      if (booking) setBooking(booking)
      navigate('/book-service/track-status')
    } catch (e) {
      if (e?.response?.status === 401) {
        localStorage.clear()
        navigate('/', { replace: true })
        return
      }
      setError(e?.response?.data?.error?.message || e?.response?.data?.message || 'Failed to validate schedule.')
    } finally {
      setVerifying(false)
    }
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
            <div className="bsSubtitle">Step 3 — Select Schedule &amp; Confirm</div>
          </div>

          <div className="bsStepRow">
            <button type="button" className="bsStepBox" onClick={() => navigate('/book-service')}>1. Select Provider</button>
            <button type="button" className="bsStepBox" disabled={!providerId} onClick={() => navigate('/book-service/select-service')}>2. Select Service</button>
            <button type="button" className="bsStepBox bsStepActive" disabled>3. Select Schedule</button>
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
              onClick={() => navigate('/book-service/select-service')}
            >
              Change
            </button>
          </div>

          {!providerId || !serviceId ? (
            <div style={{ marginTop: 16, color: '#6b7280' }}>Select a provider and service first.</div>
          ) : loading ? (
            <div style={{ marginTop: 16, color: '#6b7280', fontWeight: 700 }}>Loading available slots…</div>
          ) : error ? (
            <div style={{ marginTop: 16, color: '#b91c1c', fontWeight: 800 }}>{error}</div>
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
                  <>
                    {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'].map((start) => {
                      const slot = slotByStartTime.get(start)
                      const isSelected = slot && selectedScheduleId === slot.scheduleId
                      const cls = ['bsSlotBtn', isSelected ? 'bsSlotSelected' : ''].filter(Boolean).join(' ')
                      const hour = Number(start.slice(0, 2))
                      const end = `${String(hour + 1).padStart(2, '0')}:00`
                      return (
                        <button
                          key={start}
                          type="button"
                          className={cls}
                          disabled={!slot}
                          onClick={() => slot && setSelectedScheduleId(slot.scheduleId)}
                        >
                          {formatTime(start)} - {formatTime(end)}
                          {!slot ? ' (Unavailable)' : ''}
                        </button>
                      )
                    })}
                    {!availableDateKeys.has(selectedDateKey) ? (
                      <div className="bsSmallText" style={{ marginTop: 10 }}>No available slots for this date.</div>
                    ) : null}
                  </>
                ) : (
                  <div className="bsSmallText" style={{ marginTop: 10 }}>Pick a date to see times.</div>
                )}

                <div className="bsFooterRow">
                  <button type="button" className="bsBackBtn" onClick={() => navigate('/book-service/select-service')}>← Back</button>
                  <button
                    type="button"
                    className="bsNextBtn"
                    disabled={!selectedDateKey || !selectedScheduleId || verifying}
                    onClick={confirmBooking}
                  >
                    Confirm Booking →
                  </button>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
