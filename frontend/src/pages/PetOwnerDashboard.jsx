// PetOwnerDashboard: Two-panel dashboard layout for pet owners with navbar, stats, table, and actions
import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function PetOwnerDashboard() {
  const navigate = useNavigate()
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) navigate('/', { replace: true })
  }, [navigate])

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  const stats = [
    { value: 3, label: 'Upcoming' },
    { value: 1, label: 'Pending' },
    { value: 12, label: 'Total' },
    { value: 2, label: 'My Pets' },
  ]

  const bookings = [
    { pet: 'Buddy', service: 'Full Grooming', provider: 'Paws & Claws', when: 'Mar 3, 10:00 AM', status: 'Confirmed' },
    { pet: 'Luna', service: 'Vet Check-up', provider: 'PetCare Clinic', when: 'Mar 5, 2:00 PM', status: 'Pending' },
    { pet: 'Buddy', service: 'Teeth Cleaning', provider: 'Healthy Paws', when: 'Mar 10, 9:30 AM', status: 'Confirmed' },
  ]

  const activities = [
    { title: 'Booking confirmed', desc: 'Buddy - Full Grooming', time: '1 min ago' },
    { title: 'Booking submitted', desc: 'Luna - Vet Check-up', time: '4 mins ago' },
    { title: 'Reminder', desc: 'Vaccination due', time: '7 mins ago' },
  ]

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
      {/* Top Navbar */}
      <div style={{ background: '#111', color: '#fff', height: 60, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
        <div style={{ background: '#1b1b1b', padding: '8px 12px', fontWeight: 700 }}>PetCare Plus</div>
        <div style={{ marginLeft: 16, flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', background: '#222', borderRadius: 0 }}>
            <Link to="/dashboard" style={{ padding: '8px 12px', color: '#fff', textDecoration: 'none', background: '#000' }}>Dashboard</Link>
            <Link to="/bookings" style={{ padding: '8px 12px', color: '#ddd', textDecoration: 'none' }}>My Bookings</Link>
            <Link to="/book-service" style={{ padding: '8px 12px', color: '#ddd', textDecoration: 'none' }}>Book Service</Link>
            <Link to="/profile" style={{ padding: '8px 12px', color: '#ddd', textDecoration: 'none' }}>Profile</Link>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button aria-label="Search" style={{ width: 36, height: 36, background: '#222', border: '1px solid #333', color: '#fff', cursor: 'pointer' }}>🔍</button>
          <div style={{ width: 36, height: 36, background: '#222', border: '1px solid #333', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>J</div>
        </div>
      </div>

      {/* Body: Sidebar + Main */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Sidebar */}
        <aside style={{ width: 200, background: '#e9e9e9', borderRight: '1px solid #ddd', padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, background: '#cfcfcf', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#777' }}>X</div>
            <div>
              <div style={{ fontWeight: 700 }}>Juan dela Cruz</div>
              <div style={{ color: '#777', fontSize: 12 }}>Pet Owner</div>
            </div>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column' }}>
            <Link to="/dashboard" style={{ padding: '10px 8px', textDecoration: 'none', color: '#000', borderLeft: '4px solid #222', background: '#ddd' }}>Dashboard</Link>
            <Link to="/bookings" style={{ padding: '10px 8px', textDecoration: 'none', color: '#000' }}>My Bookings</Link>
            <Link to="/book-service" style={{ padding: '10px 8px', textDecoration: 'none', color: '#000' }}>Book Service</Link>
            <Link to="/profile" style={{ padding: '10px 8px', textDecoration: 'none', color: '#000' }}>Profile</Link>
            <a href="#" onClick={(e) => { e.preventDefault(); }} style={{ padding: '10px 8px', textDecoration: 'none', color: '#000' }}>Settings</a>
            <a href="#" onClick={(e) => { e.preventDefault(); logout(); }} style={{ padding: '10px 8px', textDecoration: 'none', color: '#000' }}>Logout</a>
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, background: '#fff', padding: 16, overflow: 'auto' }}>
          {/* Page Title */}
          <div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>Dashboard</div>
            <div style={{ color: '#777' }}>Welcome back, Juan!</div>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 16 }}>
            {stats.map((s, idx) => (
              <div key={idx} style={{ background: '#f0f0f0', padding: '16px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{s.value}</div>
                <div style={{ color: '#777', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Upcoming Bookings Table */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontWeight: 700 }}>Upcoming Bookings</div>
              <button style={{ background: 'transparent', border: '1px solid #ccc', padding: '6px 10px', cursor: 'pointer' }}>View All</button>
            </div>
            <div style={{ border: '1px solid #e5e5e5' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1.2fr 1.2fr 1fr 0.8fr', padding: '10px 8px', background: '#f7f7f7', fontWeight: 600 }}>
                <div>Pet</div>
                <div>Service</div>
                <div>Provider</div>
                <div>Date &amp; Time</div>
                <div>Status</div>
                <div>Action</div>
              </div>
              {bookings.map((b, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1.2fr 1.2fr 1fr 0.8fr', padding: '10px 8px', borderTop: '1px solid #eee' }}>
                  <div>{b.pet}</div>
                  <div>{b.service}</div>
                  <div>{b.provider}</div>
                  <div>{b.when}</div>
                  <div>{b.status}</div>
                  <div><button style={{ background: 'transparent', border: '1px solid #ccc', padding: '4px 8px', cursor: 'pointer' }}>Details</button></div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Two-Column Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.6fr', gap: 16, marginTop: 20 }}>
            {/* Recent Activity */}
            <div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Recent Activity</div>
              <div style={{ border: '1px solid #e5e5e5' }}>
                {activities.map((a, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '10px 8px', borderTop: idx === 0 ? 'none' : '1px solid #eee' }}>
                    <div style={{ width: 36, height: 36, background: '#cfcfcf', marginRight: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#777' }}>■</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{a.title}</div>
                      <div style={{ color: '#777', fontSize: 13 }}>{a.desc}</div>
                    </div>
                    <div style={{ color: '#777', fontSize: 12 }}>{a.time}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <button style={{ width: '100%', background: '#111', color: '#fff', border: 'none', padding: '12px 14px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>Book a Service</span><span>&gt;</span>
              </button>
              <button style={{ width: '100%', background: '#111', color: '#fff', border: 'none', padding: '12px 14px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>View All Bookings</span><span>&gt;</span>
              </button>
              <button style={{ width: '100%', background: '#111', color: '#fff', border: 'none', padding: '12px 14px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>Update Profile</span><span>&gt;</span>
              </button>
              <button style={{ width: '100%', background: '#111', color: '#fff', border: 'none', padding: '12px 14px', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}>
                <span>Notifications</span><span>&gt;</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
