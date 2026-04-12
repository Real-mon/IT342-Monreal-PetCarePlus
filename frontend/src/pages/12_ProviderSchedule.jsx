import { useCallback, useEffect, useMemo, useState } from 'react'
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

function dateKeyFromDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function monthKey(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function monthLabel(d) {
  return d.toLocaleString(undefined, { month: 'long', year: 'numeric' })
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

function formatTimeLabel(h) {
  const d = new Date(2026, 0, 1, h, 0, 0)
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

const HOURS = [9, 10, 11, 12, 13, 14, 15]

export default function ProviderSchedulePage() {
  const navigate = useNavigate()
  const primary = 'rgba(15, 133, 132, 1)'
  const [displayName, setDisplayName] = useState(localStorage.getItem('displayName') || '')

  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const [selectedDateKey, setSelectedDateKey] = useState('')
  const [selectedServiceId, setSelectedServiceId] = useState('')

  const [services, setServices] = useState([])
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const token = useMemo(() => localStorage.getItem('token'), [])

  useEffect(() => {
    if (!token) {
      navigate('/', { replace: true })
      return
    }
    const { role } = decodeToken(token)
    if (role !== 'SERVICE_PROVIDER') {
      navigate('/', { replace: true })
    }
  }, [navigate, token])

  const logout = () => {
    localStorage.clear()
    navigate('/', { replace: true })
  }

  const monthParam = useMemo(() => monthKey(monthCursor), [monthCursor])

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [servicesRes, scheduleRes] = await Promise.all([
        axiosClient.get('/api/provider/services'),
        axiosClient.get('/api/provider/schedule', { params: { month: monthParam } }),
      ])
      const svc = servicesRes?.data || []
      const sl = scheduleRes?.data || []
      setServices(svc)
      setSlots(sl)
      if (!selectedServiceId && svc.length) {
        setSelectedServiceId(String(svc[0].serviceId))
      }
      if (!selectedDateKey) {
        setSelectedDateKey(dateKeyFromDate(new Date()))
      }
    } catch (e) {
      if (e?.response?.status === 401) {
        localStorage.clear()
        navigate('/', { replace: true })
        return
      }
      setError(e?.response?.data?.error?.message || e?.response?.data?.message || 'Failed to load schedule.')
    } finally {
      setLoading(false)
    }
  }, [monthParam, navigate, selectedDateKey, selectedServiceId])

  useEffect(() => {
    loadAll()
  }, [loadAll])

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

  const slotMap = useMemo(() => {
    const map = new Map()
    for (const s of slots) {
      const key = `${s.date}|${String(s.startTime).slice(0, 5)}`
      map.set(key, s)
    }
    return map
  }, [slots])

  const bookedDates = useMemo(() => {
    const set = new Set()
    for (const s of slots) {
      if (s && s.date && s.isAvailable === false) set.add(s.date)
    }
    return set
  }, [slots])

  const availableDates = useMemo(() => {
    const set = new Set()
    for (const s of slots) {
      if (s && s.date) set.add(s.date)
    }
    return set
  }, [slots])

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

  const openSlot = async (dateKey, startTime) => {
    if (!selectedServiceId) {
      setError('Add at least one service first (My Services), then select a service here.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await axiosClient.post('/api/provider/schedule', {
        date: dateKey,
        startTime,
        serviceId: Number(selectedServiceId),
      })
      await loadAll()
    } catch (e) {
      if (e?.response?.status === 401) {
        localStorage.clear()
        navigate('/', { replace: true })
        return
      }
      setError(e?.response?.data?.error?.message || e?.response?.data?.message || 'Failed to set availability.')
    } finally {
      setSaving(false)
    }
  }

  const closeSlot = async (scheduleId) => {
    setSaving(true)
    setError('')
    try {
      await axiosClient.delete(`/api/provider/schedule/${scheduleId}`)
      await loadAll()
    } catch (e) {
      if (e?.response?.status === 401) {
        localStorage.clear()
        navigate('/', { replace: true })
        return
      }
      setError(e?.response?.data?.error?.message || e?.response?.data?.message || 'Failed to remove availability.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
      <div style={{ background: 'rgb(16, 110, 108)', color: '#fff', height: 60, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
        <div style={{ background: 'rgba(0,0,0,0.15)', padding: '8px 12px', fontWeight: 700 }}>PetCare+</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button aria-label="Search" style={{ width: 36, height: 36, background: '#222', border: '1px solid #333', color: '#fff', cursor: 'pointer' }}>🔍</button>
          <div style={{ width: 36, height: 36, background: '#222', border: '1px solid #333', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>J</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <aside className="sp-sidebar" style={{ width: 200, background: primary, borderRight: '1px solid rgba(0,0,0,0.15)', padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, background: 'rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.9)' }}>■</div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff' }}>{displayName || '—'}</div>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>Service Provider</div>
            </div>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column' }}>
            <Link to="/provider-dashboard" style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff' }}>Dashboard</Link>
            <Link to="/bookings" style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff' }}>Bookings</Link>
            <Link to="/provider-services" style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff' }}>My Services</Link>
            <Link to="/provider-schedule" style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff', borderLeft: '4px solid rgba(255,255,255,0.95)', background: 'rgba(255,255,255,0.12)' }}>Schedule</Link>
            <Link to="/profile" style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff' }}>Profile</Link>
            <a href="#" onClick={(e) => { e.preventDefault(); logout() }} style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff' }}>Logout</a>
          </nav>
        </aside>

        <main style={{ flex: 1, background: '#fff', padding: 16, overflow: 'auto' }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>Schedule</div>
            <div style={{ color: '#777' }}>Set your availability and view booked appointments.</div>
          </div>

          {error ? <div style={{ marginTop: 12, color: '#b91c1c', fontWeight: 800 }}>{error}</div> : null}

          <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 16, marginTop: 16 }}>
            <section style={{ border: '1px solid #e5e5e5', padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <button
                  type="button"
                  disabled={loading || saving}
                  onClick={() => {
                    const d = new Date(monthCursor)
                    d.setMonth(d.getMonth() - 1)
                    setMonthCursor(d)
                  }}
                  style={{ border: '1px solid #d1d5db', background: '#fff', padding: '6px 10px', cursor: 'pointer' }}
                >
                  ‹
                </button>
                <div style={{ fontWeight: 900 }}>{monthLabel(monthCursor)}</div>
                <button
                  type="button"
                  disabled={loading || saving}
                  onClick={() => {
                    const d = new Date(monthCursor)
                    d.setMonth(d.getMonth() + 1)
                    setMonthCursor(d)
                  }}
                  style={{ border: '1px solid #d1d5db', background: '#fff', padding: '6px 10px', cursor: 'pointer' }}
                >
                  ›
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                {weekdayLabels().map((w) => (
                  <div key={w} style={{ fontSize: 12, color: '#111', textAlign: 'center', fontWeight: 800 }}>{w}</div>
                ))}
                {calendarDays.map((d, idx) => {
                  if (!d) return <div key={`e-${idx}`} />
                  const key = dateKeyFromDate(d)
                  const isSelected = key === selectedDateKey
                  const hasAny = availableDates.has(key)
                  const hasBooked = bookedDates.has(key)
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedDateKey(key)}
                      style={{
                        border: isSelected ? `2px solid ${primary}` : '1px solid #e5e7eb',
                        background: '#fff',
                        padding: '10px 0',
                        cursor: 'pointer',
                        position: 'relative',
                        fontWeight: 800,
                        color: '#111827',
                      }}
                    >
                      {d.getDate()}
                      {hasAny ? (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: 6,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 8,
                            height: 8,
                            borderRadius: 999,
                            background: hasBooked ? '#111' : primary,
                          }}
                        />
                      ) : null}
                    </button>
                  )
                })}
              </div>

              <div style={{ display: 'flex', gap: 16, marginTop: 12, color: '#111', fontSize: 12, fontWeight: 800 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: primary, display: 'inline-block' }} />
                  Has availability
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: '#111', display: 'inline-block' }} />
                  Has booking
                </div>
              </div>
            </section>

            <section style={{ border: '1px solid #e5e5e5', padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 900 }}>Date</div>
                  <div style={{ color: '#111', fontSize: 12 }}>{selectedDateKey || 'Select a date'}</div>
                </div>
                <div style={{ minWidth: 220 }}>
                  <div style={{ fontSize: 12, color: '#111', marginBottom: 6, fontWeight: 800 }}>Service for new slots</div>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    disabled={loading || saving || services.length === 0}
                    style={{ width: '100%', height: 42, border: '1px solid #d1d5db', background: '#fff', padding: '0 10px' }}
                  >
                    {services.length === 0 ? <option value="">No services</option> : null}
                    {services.map((s) => (
                      <option key={s.serviceId} value={String(s.serviceId)}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {loading ? (
                <div style={{ marginTop: 12, color: '#111' }}>Loading…</div>
              ) : !selectedDateKey ? (
                <div style={{ marginTop: 12, color: '#111' }}>Select a date on the calendar.</div>
              ) : (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {HOURS.map((h) => {
                    const startTime = `${String(h).padStart(2, '0')}:00`
                    const key = `${selectedDateKey}|${startTime}`
                    const slot = slotMap.get(key)
                    const booked = slot && slot.isAvailable === false
                    const open = slot && slot.isAvailable === true
                    return (
                      <div key={key} style={{ border: '1px solid #e5e7eb', padding: 10, display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 10, alignItems: 'center', background: '#fff' }}>
                        <div style={{ fontWeight: 900, color: '#000' }}>{formatTimeLabel(h)}</div>
                        <div style={{ color: '#111', fontSize: 13 }}>
                          {booked ? (
                            <>
                              <div style={{ fontWeight: 900, color: '#111' }}>Booked</div>
                              <div>Owner: {slot.petOwnerEmail || '—'}</div>
                              <div>Service: {slot.serviceName || '—'} • Status: {slot.bookingStatus || '—'}</div>
                            </>
                          ) : open ? (
                            <>
                              <div style={{ fontWeight: 900, color: primary }}>Open</div>
                              <div>Service: {slot.serviceName || '—'}</div>
                            </>
                          ) : (
                            <div>Closed</div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {booked ? (
                            <button type="button" disabled style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '8px 10px', cursor: 'not-allowed', fontWeight: 800, color: '#9ca3af' }}>
                              Locked
                            </button>
                          ) : open ? (
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => closeSlot(slot.scheduleId)}
                              style={{ background: '#fff', border: '1px solid #d1d5db', padding: '8px 10px', cursor: 'pointer', fontWeight: 800 }}
                            >
                              Close
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => openSlot(selectedDateKey, startTime)}
                              style={{ background: primary, color: '#fff', border: 'none', padding: '8px 10px', cursor: 'pointer', fontWeight: 800 }}
                            >
                              Open
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .sp-sidebar { display: none; }
          main > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
