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

const SERVICE_OPTIONS = [
  { name: 'Full grooming', category: 'GROOMING' },
  { name: 'Basic grooming', category: 'GROOMING' },
  { name: 'Vet Check-up', category: 'VETERINARY' },
  { name: 'Vaccination', category: 'VETERINARY' },
]

export default function MyServicesPage() {
  const navigate = useNavigate()
  const primary = 'rgba(15, 133, 132, 1)'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [services, setServices] = useState([])
  const [displayName, setDisplayName] = useState(localStorage.getItem('displayName') || '')

  const [selectedName, setSelectedName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newDuration, setNewDuration] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editDescription, setEditDescription] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editDuration, setEditDuration] = useState('')

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

  const loadServices = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axiosClient.get('/api/provider/services')
      setServices(res?.data || [])
    } catch (e) {
      if (e?.response?.status === 401) {
        localStorage.clear()
        navigate('/', { replace: true })
        return
      }
      setError(e?.response?.data?.error?.message || e?.response?.data?.message || 'Failed to load services.')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    loadServices()
  }, [loadServices])

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

  const onCreate = async () => {
    if (!selectedName) {
      setError('Select a service option to add.')
      return
    }
    const price = Number(newPrice)
    const durationMinutes = Number(newDuration)
    if (!Number.isFinite(price) || price <= 0) {
      setError('Enter a valid price greater than 0.')
      return
    }
    if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
      setError('Enter a valid duration (minutes) greater than 0.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await axiosClient.post('/api/provider/services', {
        name: selectedName,
        description: newDescription || null,
        price,
        durationMinutes,
      })
      setSelectedName('')
      setNewDescription('')
      setNewPrice('')
      setNewDuration('')
      await loadServices()
    } catch (e) {
      if (e?.response?.status === 401) {
        localStorage.clear()
        navigate('/', { replace: true })
        return
      }
      setError(e?.response?.data?.error?.message || e?.response?.data?.message || 'Failed to add service.')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (s) => {
    setEditingId(s.serviceId)
    setEditDescription(s.description || '')
    setEditPrice(String(s.price ?? ''))
    setEditDuration(String(s.durationMinutes ?? ''))
    setError('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditDescription('')
    setEditPrice('')
    setEditDuration('')
  }

  const saveEdit = async () => {
    const price = Number(editPrice)
    const durationMinutes = Number(editDuration)
    if (!Number.isFinite(price) || price <= 0) {
      setError('Enter a valid price greater than 0.')
      return
    }
    if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
      setError('Enter a valid duration (minutes) greater than 0.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await axiosClient.put(`/api/provider/services/${editingId}`, {
        description: editDescription || null,
        price,
        durationMinutes,
      })
      cancelEdit()
      await loadServices()
    } catch (e) {
      if (e?.response?.status === 401) {
        localStorage.clear()
        navigate('/', { replace: true })
        return
      }
      setError(e?.response?.data?.error?.message || e?.response?.data?.message || 'Failed to update service.')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (id) => {
    const ok = window.confirm('Delete this service?')
    if (!ok) return
    setSaving(true)
    setError('')
    try {
      await axiosClient.delete(`/api/provider/services/${id}`)
      if (editingId === id) cancelEdit()
      await loadServices()
    } catch (e) {
      if (e?.response?.status === 401) {
        localStorage.clear()
        navigate('/', { replace: true })
        return
      }
      setError(e?.response?.data?.error?.message || e?.response?.data?.message || 'Failed to delete service.')
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
            <Link to="/provider-services" style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff', borderLeft: '4px solid rgba(255,255,255,0.95)', background: 'rgba(255,255,255,0.12)' }}>My Services</Link>
            <Link to="/provider-schedule" style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff' }}>Schedule</Link>
            <Link to="/profile" style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff' }}>Profile</Link>
            <a href="#" onClick={(e) => { e.preventDefault(); logout() }} style={{ padding: '10px 8px', textDecoration: 'none', color: '#fff' }}>Logout</a>
          </nav>
        </aside>

        <main style={{ flex: 1, background: '#fff', padding: 16, overflow: 'auto' }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>My Services</div>
            <div style={{ color: '#777' }}>Manage the services you offer.</div>
          </div>

          {error ? <div style={{ marginTop: 12, color: '#b91c1c', fontWeight: 800 }}>{error}</div> : null}

          <div style={{ marginTop: 16, border: '1px solid #e5e5e5', padding: 14 }}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Add a Service</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {SERVICE_OPTIONS.map((opt) => {
                const active = selectedName === opt.name
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => setSelectedName(opt.name)}
                    disabled={saving}
                    style={{
                      border: active ? `2px solid ${primary}` : '1px solid #d1d5db',
                      background: '#fff',
                      padding: 12,
                      textAlign: 'left',
                      cursor: 'pointer',
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>{opt.name}</div>
                    <div style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>{opt.category}</div>
                  </button>
                )
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 0.8fr', gap: 10, marginTop: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Description</div>
                <input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Optional description"
                  disabled={saving}
                  style={{ width: '100%', height: 44, border: '1px solid #d1d5db', padding: '0 12px', outline: 'none' }}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Price (PHP)</div>
                <input
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="e.g. 500"
                  disabled={saving}
                  inputMode="decimal"
                  style={{ width: '100%', height: 44, border: '1px solid #d1d5db', padding: '0 12px', outline: 'none' }}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Duration (mins)</div>
                <input
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  placeholder="e.g. 60"
                  disabled={saving}
                  inputMode="numeric"
                  style={{ width: '100%', height: 44, border: '1px solid #d1d5db', padding: '0 12px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onCreate}
                disabled={saving}
                style={{ background: primary, color: '#fff', border: 'none', padding: '10px 14px', cursor: 'pointer', fontWeight: 800 }}
              >
                Add Service
              </button>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Your Services</div>
            <div style={{ border: '1px solid #e5e5e5' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.7fr 0.7fr 1fr', padding: '10px 8px', background: '#f7f7f7', fontWeight: 700 }}>
                <div>Service</div>
                <div>Price</div>
                <div>Duration</div>
                <div>Actions</div>
              </div>

              {loading ? (
                <div style={{ padding: '12px 8px', color: '#6b7280' }}>Loading…</div>
              ) : services.length === 0 ? (
                <div style={{ padding: '12px 8px', color: '#6b7280' }}>No services added yet.</div>
              ) : (
                services.map((s) => (
                  <div key={s.serviceId} style={{ padding: '10px 8px', borderTop: '1px solid #eee' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.7fr 0.7fr 1fr', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 900 }}>{s.name}</div>
                        <div style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>{s.description || '—'}</div>
                        <div style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>{s.category}</div>
                      </div>
                      <div>PHP {s.price}</div>
                      <div>{s.durationMinutes} min</div>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => startEdit(s)} disabled={saving} style={{ background: 'transparent', border: '1px solid #ccc', padding: '6px 10px', cursor: 'pointer' }}>Edit</button>
                        <button type="button" onClick={() => onDelete(s.serviceId)} disabled={saving} style={{ background: 'transparent', border: '1px solid #ccc', padding: '6px 10px', cursor: 'pointer' }}>Delete</button>
                      </div>
                    </div>

                    {editingId === s.serviceId ? (
                      <div style={{ marginTop: 10, background: '#f9f9f9', border: '1px solid #e5e5e5', padding: 12 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 0.8fr', gap: 10 }}>
                          <div>
                            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Description</div>
                            <input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} disabled={saving} style={{ width: '100%', height: 44, border: '1px solid #d1d5db', padding: '0 12px', outline: 'none' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Price (PHP)</div>
                            <input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} disabled={saving} inputMode="decimal" style={{ width: '100%', height: 44, border: '1px solid #d1d5db', padding: '0 12px', outline: 'none' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Duration (mins)</div>
                            <input value={editDuration} onChange={(e) => setEditDuration(e.target.value)} disabled={saving} inputMode="numeric" style={{ width: '100%', height: 44, border: '1px solid #d1d5db', padding: '0 12px', outline: 'none' }} />
                          </div>
                        </div>
                        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                          <button type="button" onClick={cancelEdit} disabled={saving} style={{ background: '#fff', border: '1px solid #d1d5db', padding: '10px 14px', cursor: 'pointer', fontWeight: 800 }}>Cancel</button>
                          <button type="button" onClick={saveEdit} disabled={saving} style={{ background: primary, color: '#fff', border: 'none', padding: '10px 14px', cursor: 'pointer', fontWeight: 800 }}>Save</button>
                        </div>
                      </div>
                    ) : null}
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
