import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

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

  const stats = [
    { value: '5', label: 'New Requests' },
    { value: '3', label: 'Today' },
    { value: '28', label: 'This Month' },
    { value: '4.8', label: 'Rating' },
  ]

  const requests = [
    { owner: 'Juan Cruz', service: 'Full Grooming', pet: 'Buddy', date: 'Mar 3, 10AM', status: 'Pending', actions: 'PENDING' },
    { owner: 'Maria Santos', service: 'Vet Check-up', pet: 'Kitty', date: 'Mar 4, 2PM', status: 'Pending', actions: 'PENDING' },
    { owner: 'Pedro Reyes', service: 'Nail Trim', pet: 'Max', date: 'Mar 5, 11AM', status: 'Confirmed', actions: 'CONFIRMED' },
  ]

  const schedule = [
    { time: '9:00 AM', client: 'Juan Cruz', service: 'Full Grooming' },
    { time: '11:30 AM', client: 'Pedro Reyes', service: 'Nail Trim' },
    { time: '2:00 PM', client: 'Maria Santos', service: 'Vet Check-up' },
  ]

  const services = [
    { name: 'Full Grooming', meta: 'PHP 500 | 90 min' },
    { name: 'Nail Trim', meta: 'PHP 250 | 30 min' },
    { name: 'Bath & Dry', meta: 'PHP 350 | 60 min' },
  ]

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
      <div style={{ background: '#3a3a3a', color: '#fff', height: 60, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
        <div style={{ background: '#2b2b2b', padding: '8px 12px', fontWeight: 700 }}>PetCare+</div>
        <div style={{ marginLeft: 16, flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', background: '#4a4a4a', borderRadius: 0 }}>
            <Link to="/provider-dashboard" style={{ padding: '8px 12px', color: '#fff', textDecoration: 'none', background: '#000' }}>Dashboard</Link>
            <Link to="/bookings" style={{ padding: '8px 12px', color: '#eee', textDecoration: 'none' }}>My Bookings</Link>
            <Link to="/provider-dashboard#services" style={{ padding: '8px 12px', color: '#eee', textDecoration: 'none' }}>My Services</Link>
            <Link to="/profile" style={{ padding: '8px 12px', color: '#eee', textDecoration: 'none' }}>Profile</Link>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button aria-label="Search" style={{ width: 36, height: 36, background: '#2b2b2b', border: '1px solid #444', color: '#fff', cursor: 'pointer' }}>🔍</button>
          <div style={{ width: 36, height: 36, background: '#2b2b2b', border: '1px solid #444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>J</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <aside className="sp-sidebar" style={{ width: 200, background: '#f5f5f5', borderRight: '1px solid #ddd', padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, background: '#cfcfcf', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#777' }}>■</div>
            <div>
              <div style={{ fontWeight: 700 }}>Juan dela Cruz</div>
              <div style={{ color: '#777', fontSize: 12 }}>Service Provider</div>
            </div>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column' }}>
            <Link to="/provider-dashboard" style={{ padding: '10px 8px', textDecoration: 'none', color: '#000', borderLeft: '4px solid #3a3a3a', background: '#e8e8e8' }}>Dashboard</Link>
            <Link to="/bookings" style={{ padding: '10px 8px', textDecoration: 'none', color: '#000' }}>Bookings</Link>
            <Link to="/provider-dashboard#services" style={{ padding: '10px 8px', textDecoration: 'none', color: '#000' }}>My Services</Link>
            <Link to="/provider-dashboard#schedule" style={{ padding: '10px 8px', textDecoration: 'none', color: '#000' }}>Schedule</Link>
            <Link to="/profile" style={{ padding: '10px 8px', textDecoration: 'none', color: '#000' }}>Profile</Link>
            <a href="#" onClick={(e) => { e.preventDefault(); logout(); }} style={{ padding: '10px 8px', textDecoration: 'none', color: '#000' }}>Logout</a>
          </nav>
        </aside>

        <main style={{ flex: 1, background: '#fff', padding: 16, overflow: 'auto' }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>Provider Dashboard</div>
            <div style={{ color: '#777' }}>Good morning! Here are your bookings.</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 16 }}>
            {stats.map((s, idx) => (
              <div key={idx} style={{ background: '#f5f5f5', padding: '16px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{s.value}</div>
                <div style={{ color: '#777', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontWeight: 700 }}>Booking Requests</div>
              <button style={{ background: 'transparent', border: '1px solid #ccc', padding: '6px 10px', cursor: 'pointer' }}>View All</button>
            </div>
            <div style={{ border: '1px solid #e5e5e5' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr 1.1fr 0.9fr 1fr', padding: '10px 8px', background: '#f7f7f7', fontWeight: 600 }}>
                <div>Pet Owner</div>
                <div>Service</div>
                <div>Pet</div>
                <div>Requested Date</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
              {requests.map((r, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr 1.1fr 0.9fr 1fr', padding: '10px 8px', borderTop: '1px solid #eee' }}>
                  <div>{r.owner}</div>
                  <div>{r.service}</div>
                  <div>{r.pet}</div>
                  <div>{r.date}</div>
                  <div>{r.status}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {r.actions === 'PENDING' ? (
                      <>
                        <button style={{ background: 'transparent', border: '1px solid #ccc', padding: '4px 8px', cursor: 'pointer' }}>Accept</button>
                        <button style={{ background: 'transparent', border: '1px solid #ccc', padding: '4px 8px', cursor: 'pointer' }}>Decline</button>
                      </>
                    ) : (
                      <button style={{ background: 'transparent', border: '1px solid #ccc', padding: '4px 8px', cursor: 'pointer' }}>Update Status</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
            <div id="schedule">
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Today&apos;s Schedule</div>
              <div style={{ border: '1px solid #e5e5e5' }}>
                {schedule.map((s, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', padding: '10px 8px', borderTop: idx === 0 ? 'none' : '1px solid #eee', background: '#f9f9f9' }}>
                    <div style={{ background: '#3a3a3a', color: '#fff', textAlign: 'center', padding: '8px 6px', width: 84, justifySelf: 'start' }}>{s.time}</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{s.client}</div>
                      <div style={{ color: '#777', fontSize: 13 }}>{s.service}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div id="services">
              <div style={{ fontWeight: 700, marginBottom: 8 }}>My Services</div>
              <div style={{ border: '1px solid #e5e5e5' }}>
                {services.map((svc, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '10px 8px', borderTop: idx === 0 ? 'none' : '1px solid #eee', background: '#f9f9f9' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{svc.name}</div>
                      <div style={{ color: '#777', fontSize: 13 }}>{svc.meta}</div>
                    </div>
                    <button style={{ background: 'transparent', border: '1px solid #ccc', padding: '6px 10px', cursor: 'pointer' }}>Edit</button>
                  </div>
                ))}
              </div>
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
