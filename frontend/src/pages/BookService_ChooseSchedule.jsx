import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function BookService_ChooseSchedule() {
  const navigate = useNavigate()
  const location = useLocation()
  const providerName = location?.state?.providerName
  const category = location?.state?.category

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

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
      <div style={{ background: '#111', color: '#fff', height: 60, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
        <div style={{ background: '#1b1b1b', padding: '8px 12px', fontWeight: 700 }}>PetCare Plus</div>
        <div style={{ marginLeft: 16, flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', background: '#222', borderRadius: 0 }}>
            <Link to="/dashboard" style={{ padding: '8px 12px', color: '#ddd', textDecoration: 'none' }}>Dashboard</Link>
            <Link to="/bookings" style={{ padding: '8px 12px', color: '#ddd', textDecoration: 'none' }}>My Bookings</Link>
            <Link to="/book-service" style={{ padding: '8px 12px', color: '#fff', textDecoration: 'none', background: '#000' }}>Book Service</Link>
            <Link to="/profile" style={{ padding: '8px 12px', color: '#ddd', textDecoration: 'none' }}>Profile</Link>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button aria-label="Search" style={{ width: 36, height: 36, background: '#222', border: '1px solid #333', color: '#fff', cursor: 'pointer' }}>🔍</button>
          <div style={{ width: 36, height: 36, background: '#222', border: '1px solid #333', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>J</div>
        </div>
      </div>

      <div className="bsBody2" style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <aside className="bsSidebar2" style={{ width: 200, background: '#e9e9e9', borderRight: '1px solid #ddd', padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, background: '#cfcfcf', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#777' }}>X</div>
            <div>
              <div style={{ fontWeight: 700 }}>Juan dela Cruz</div>
              <div style={{ color: '#777', fontSize: 12 }}>Pet Owner</div>
            </div>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column' }}>
            <Link to="/dashboard" style={{ padding: '10px 8px', textDecoration: 'none', color: '#000' }}>Dashboard</Link>
            <Link to="/bookings" style={{ padding: '10px 8px', textDecoration: 'none', color: '#000' }}>My Bookings</Link>
            <Link to="/book-service" style={{ padding: '10px 8px', textDecoration: 'none', color: '#000', borderLeft: '4px solid #222', background: '#ddd' }}>Book Service</Link>
            <Link to="/profile" style={{ padding: '10px 8px', textDecoration: 'none', color: '#000' }}>Profile</Link>
            <a href="#" onClick={(e) => { e.preventDefault() }} style={{ padding: '10px 8px', textDecoration: 'none', color: '#000' }}>Settings</a>
            <a href="#" onClick={(e) => { e.preventDefault(); logout() }} style={{ padding: '10px 8px', textDecoration: 'none', color: '#000' }}>Logout</a>
          </nav>
        </aside>

        <main style={{ flex: 1, background: '#fff', padding: 16, overflow: 'auto' }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>Book a Service</div>
            <div style={{ color: '#777' }}>Step 2 — Choose Schedule</div>
          </div>
          <div style={{ marginTop: 16, border: '1px solid #e5e7eb', borderRadius: 12, padding: 14 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Selected Provider</div>
            <div style={{ color: '#6b7280' }}>{providerName || 'No provider selected'}</div>
            <div style={{ color: '#6b7280', marginTop: 4 }}>{category ? `Category: ${category}` : ''}</div>
          </div>

          <style>{`
            @media (max-width: 768px) {
              .bsSidebar2 { display: none; }
            }
          `}</style>
        </main>
      </div>
    </div>
  )
}
