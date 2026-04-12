import './styles/BookServiceChooseSchedule.css'

import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosClient from '../api/axiosClient.js'
import { useBookingViewModel } from '../components/useBookingViewModel.js'

function formatTime(timeStr) {
  if (!timeStr) return ''
  const [hh, mm] = String(timeStr).split(':').map(Number)
  if (Number.isNaN(hh) || Number.isNaN(mm)) return String(timeStr)
  const d = new Date(2026, 0, 1, hh, mm, 0)
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export default function BookService_TrackStatus() {
  const navigate = useNavigate()
  const { booking, setBooking, reset } = useBookingViewModel()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
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
      setLoading(true)
      setError('')
      try {
        if (booking?.bookingId) {
          setLoading(false)
          return
        }
        const id = sessionStorage.getItem('currentBookingId')
        if (!id) {
          setLoading(false)
          return
        }
        const res = await axiosClient.get(`/api/bookings/${id}`)
        if (!isMounted) return
        if (res?.data) setBooking(res.data)
      } catch (e) {
        if (!isMounted) return
        if (e?.response?.status === 401) {
          localStorage.clear()
          navigate('/', { replace: true })
          return
        }
        setError(e?.response?.data?.error?.message || e?.response?.data?.message || 'Failed to load booking.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    run()
    return () => {
      isMounted = false
    }
  }, [booking?.bookingId, navigate, setBooking])

  const timeRangeLabel = useMemo(() => {
    if (!booking?.startTime || !booking?.endTime) return '—'
    return `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`
  }, [booking?.startTime, booking?.endTime])

  const onCancel = async () => {
    const id = booking?.bookingId
    if (!id) return
    setSubmitting(true)
    setError('')
    try {
      await axiosClient.delete(`/api/bookings/${id}`)
      sessionStorage.removeItem('currentBookingId')
      reset()
      navigate('/dashboard', { replace: true, state: { bookingCancelled: true } })
    } catch (e) {
      if (e?.response?.status === 401) {
        localStorage.clear()
        navigate('/', { replace: true })
        return
      }
      setError(e?.response?.data?.error?.message || e?.response?.data?.message || 'Failed to cancel booking.')
    } finally {
      setSubmitting(false)
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
            <div className="bsSubtitle">Step 4 — Track Status</div>
          </div>

          <div className="bsStepRow">
            <button type="button" className="bsStepBox" disabled>1. Select Provider</button>
            <button type="button" className="bsStepBox" disabled>2. Select Service</button>
            <button type="button" className="bsStepBox" disabled>3. Select Schedule</button>
            <button type="button" className="bsStepBox bsStepActive" disabled>4. Track Status</button>
          </div>

          {error ? <div style={{ marginTop: 14, color: '#b91c1c', fontWeight: 800 }}>{error}</div> : null}

          <div className="bsTrackGrid">
            <section className="bsPanel">
              <div className="bsPanelTitle">Current Status</div>
              {loading ? (
                <div style={{ color: '#6b7280', fontWeight: 700 }}>Loading…</div>
              ) : !booking?.bookingId ? (
                <div style={{ color: '#6b7280' }}>No booking selected.</div>
              ) : (
                <div style={{ fontWeight: 900 }}>{booking.status || '—'}</div>
              )}
            </section>

            <section className="bsPanel">
              <div className="bsPanelTitle">Booking Details</div>
              <table className="bsDataTable">
                <tbody>
                  <tr>
                    <td className="bsDataLabel">Booking ID</td>
                    <td className="bsDataValue">{booking?.bookingId || '—'}</td>
                  </tr>
                  <tr>
                    <td className="bsDataLabel">Provider</td>
                    <td className="bsDataValue">{booking?.providerName || '—'}</td>
                  </tr>
                  <tr>
                    <td className="bsDataLabel">Service</td>
                    <td className="bsDataValue">{booking?.serviceName || '—'}</td>
                  </tr>
                  <tr>
                    <td className="bsDataLabel">Date</td>
                    <td className="bsDataValue">{booking?.scheduleDate || '—'}</td>
                  </tr>
                  <tr>
                    <td className="bsDataLabel">Time</td>
                    <td className="bsDataValue">{timeRangeLabel}</td>
                  </tr>
                  <tr>
                    <td className="bsDataLabel">Status</td>
                    <td className="bsDataValue">{booking?.status || '—'}</td>
                  </tr>
                </tbody>
              </table>

              <div className="bsFooterRow">
                <button type="button" className="bsBackBtn" disabled>← Back</button>
                <button type="button" className="bsNextBtn" disabled={!booking?.bookingId || submitting} onClick={onCancel}>
                  Cancel Booking
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
