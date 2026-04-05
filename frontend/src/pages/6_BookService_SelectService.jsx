import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function BookService_SelectService() {
  const navigate = useNavigate()
  const [category, setCategory] = useState('GROOMING')

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

  const providers = useMemo(() => {
    if (category === 'VETERINARY') {
      return [
        { name: 'PetCare Veterinary Center', desc: 'General and specialized vet care', priceLoc: 'PHP 300 - PHP 900 | Cebu City', rating: '★★★★★ (4.8)' },
        { name: 'Healthy Paws Veterinary Clinic', desc: 'Vaccinations, checkups and more', priceLoc: 'PHP 300 - PHP 800 | Cebu City', rating: '★★★★★ (4.8)' },
        { name: 'Cebu Animal Hospital', desc: 'Emergency and wellness services', priceLoc: 'PHP 400 - PHP 950 | Cebu City', rating: '★★★★★ (4.8)' },
        { name: 'Prime Pet Wellness Clinic', desc: 'Preventive care and diagnostics', priceLoc: 'PHP 350 - PHP 850 | Cebu City', rating: '★★★★★ (4.8)' },
      ]
    }
    return [
      { name: 'Paws & Claws Salon', desc: 'Grooming services for all breeds', priceLoc: 'PHP 300 - PHP 800 | Cebu City', rating: '★★★★★ (4.8)' },
      { name: 'Happy Tails Grooming', desc: 'Premium spa and styling services', priceLoc: 'PHP 400 - PHP 900 | Cebu City', rating: '★★★★★ (4.8)' },
      { name: 'PetCare Veterinary', desc: 'General and specialized vet care', priceLoc: 'PHP 300 - PHP 800 | Cebu City', rating: '★★★★★ (4.8)' },
      { name: 'Healthy Paws Clinic', desc: 'Vaccinations, checkups and more', priceLoc: 'PHP 300 - PHP 800 | Cebu City', rating: '★★★★★ (4.8)' },
    ]
  }, [category])

  const onSelectProvider = (providerName) => {
    const selectedCategory = category === 'VETERINARY' ? 'Veterinary' : 'Grooming'
    navigate('/book-service/choose-schedule', {
      state: {
        providerName,
        category: selectedCategory,
      },
    })
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

      <div className="bsBody" style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <aside className="bsSidebar" style={{ width: 200, background: '#e9e9e9', borderRight: '1px solid #ddd', padding: 12 }}>
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
            <div style={{ color: '#777' }}>Step 1 — Select a Service</div>
          </div>

          <div className="bsStepRow" style={{ marginTop: 16, display: 'flex', gap: 12, position: 'relative', alignItems: 'center' }}>
            <div className="bsStepBox bsStepActive" style={{ flex: 1, padding: '10px 12px', textAlign: 'center', borderRadius: 6, background: '#1f2937', color: '#fff', zIndex: 1, fontWeight: 600 }}>1. Select Service</div>
            <div className="bsStepBox" style={{ flex: 1, padding: '10px 12px', textAlign: 'center', borderRadius: 6, background: '#fff', color: '#6b7280', border: '1px solid #d1d5db', zIndex: 1, fontWeight: 600 }}>2. Choose Schedule</div>
            <div className="bsStepBox" style={{ flex: 1, padding: '10px 12px', textAlign: 'center', borderRadius: 6, background: '#fff', color: '#6b7280', border: '1px solid #d1d5db', zIndex: 1, fontWeight: 600 }}>3. Confirm Booking</div>
            <div className="bsStepBox" style={{ flex: 1, padding: '10px 12px', textAlign: 'center', borderRadius: 6, background: '#fff', color: '#6b7280', border: '1px solid #d1d5db', zIndex: 1, fontWeight: 600 }}>4. Track Status</div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Service Category</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setCategory('GROOMING')}
                style={{
                  padding: '10px 14px',
                  borderRadius: 9999,
                  border: category === 'GROOMING' ? '1px solid rgba(15, 133, 132, 1)' : '1px solid #d1d5db',
                  background: category === 'GROOMING' ? 'rgba(15, 133, 132, 1)' : '#fff',
                  color: category === 'GROOMING' ? '#fff' : '#6b7280',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Grooming
              </button>
              <button
                type="button"
                onClick={() => setCategory('VETERINARY')}
                style={{
                  padding: '10px 14px',
                  borderRadius: 9999,
                  border: category === 'VETERINARY' ? '1px solid rgba(15, 133, 132, 1)' : '1px solid #d1d5db',
                  background: category === 'VETERINARY' ? 'rgba(15, 133, 132, 1)' : '#fff',
                  color: category === 'VETERINARY' ? '#fff' : '#6b7280',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Veterinary
              </button>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ fontWeight: 800, marginBottom: 12 }}>Available Providers</div>
            <div className="bsProviderGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {providers.map((p) => (
                <div key={p.name} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 14, background: '#fff', display: 'flex', gap: 12 }}>
                  <div style={{ width: 120, height: 90, background: '#f3f4f6', borderRadius: 8, border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontWeight: 800, flexShrink: 0 }}>X</div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{p.name}</div>
                    <div style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>{p.desc}</div>
                    <div style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>{p.priceLoc}</div>
                    <div style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>{p.rating}</div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
                      <button
                        type="button"
                        onClick={() => onSelectProvider(p.name)}
                        style={{
                          marginTop: 10,
                          background: 'rgba(15, 133, 132, 1)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          padding: '8px 12px',
                          cursor: 'pointer',
                          fontWeight: 700,
                        }}
                      >
                        Select Provider
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <style>{`
            .bsStepRow::before {
              content: '';
              position: absolute;
              left: 12px;
              right: 12px;
              top: 50%;
              height: 2px;
              background: #d1d5db;
              transform: translateY(-50%);
              z-index: 0;
            }
            .bsStepBox { min-width: 0; }
            .bsProviderGrid button:hover { background: rgba(15, 133, 132, 0.9); }
            @media (max-width: 768px) {
              .bsSidebar { display: none; }
              .bsProviderGrid { grid-template-columns: 1fr !important; }
              .bsStepRow { flex-direction: column; }
              .bsStepRow::before { display: none; }
            }
          `}</style>
        </main>
      </div>
    </div>
  )
}
// BookService_SelectService: Step 1 — Pet owner selects the type of pet service to book
