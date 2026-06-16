import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleApi, reviewApi } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/MapView';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  AVAILABLE:   'badge-available',
  BOOKED:      'badge-booked',
  MAINTENANCE: 'badge-maintenance',
};

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicle, setVehicle]   = useState(null);
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [location, setLocation] = useState(null);

  const load = useCallback(async () => {
    try {
      const [vRes, rRes] = await Promise.all([
        vehicleApi.getById(id),
        reviewApi.getForVehicle(id),
      ]);
      setVehicle(vRes.data);
      setReviews(rRes.data);
      setLocation({ lat: vRes.data.locationLat, lng: vRes.data.locationLng });
    } catch {
      toast.error('Vehicle not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  // Poll location every 10 seconds
  useEffect(() => {
    if (!id) return;
    const interval = setInterval(async () => {
      try {
        const { data } = await vehicleApi.getLocation(id);
        setLocation({ lat: data.locationLat, lng: data.locationLng });
      } catch {}
    }, 10000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!vehicle) return null;

  const specs = [
    { icon: '⛽', label: 'Fuel',  value: vehicle.fuelType || '—' },
    { icon: '👥', label: 'Seats', value: vehicle.seats ? `${vehicle.seats} seats` : '—' },
    { icon: '📅', label: 'Year',  value: vehicle.year || '—' },
    { icon: '🏷️', label: 'Brand', value: vehicle.brand || '—' },
  ];

  return (
    <div className="page">
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}>
        ← Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>

        {/* ── Left ── */}
        <div>
          <img
            src={vehicle.imageUrl || 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200'}
            alt={vehicle.name}
            style={{ width: '100%', height: 360, objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }}
          />

          {/* Specs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {specs.map(s => (
              <div key={s.label} className="stat-card" style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '1.5rem' }}>{s.icon}</div>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.25rem' }}>{s.label}</div>
                <div style={{ fontWeight: 600, marginTop: '0.1rem' }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          {vehicle.description && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-body">
                <h3 style={{ fontFamily: 'var(--font-head)', marginBottom: '0.75rem' }}>About this vehicle</h3>
                <p style={{ color: 'var(--text-dim)', lineHeight: 1.7 }}>{vehicle.description}</p>
              </div>
            </div>
          )}

          {/* Map */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-head)', marginBottom: '0.75rem' }}>
              📍 Live Location
            </h3>
            <MapView
              lat={location?.lat || vehicle.locationLat}
              lng={location?.lng || vehicle.locationLng}
              vehicleName={vehicle.name}
            />
          </div>

          {/* Reviews */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-head)', marginBottom: '1rem' }}>
              ⭐ Reviews ({reviews.length})
            </h3>
            {reviews.length === 0 ? (
              <div className="empty" style={{ padding: '2rem' }}>No reviews yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviews.map(r => (
                  <div key={r.id} className="card">
                    <div className="card-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <strong>{r.userName}</strong>
                        <span style={{ color: '#f59e0b' }}>{'⭐'.repeat(r.rating)}</span>
                      </div>
                      <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>{r.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right — Booking card ── */}
        <div>
          <div className="card" style={{ position: 'sticky', top: '90px' }}>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', fontWeight: 800, lineHeight: 1.2 }}>
                    {vehicle.name}
                  </h1>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    {vehicle.type} · {vehicle.brand}
                  </div>
                </div>
                <span className={`badge ${STATUS_BADGE[vehicle.status]}`}>{vehicle.status}</span>
              </div>

              <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', marginBottom: '1.25rem' }}>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>PRICE PER DAY</div>
                <div style={{ fontSize: '2rem', fontFamily: 'var(--font-head)', fontWeight: 800, color: 'var(--accent)' }}>
                  ₹{Number(vehicle.pricePerDay).toLocaleString()}
                </div>
              </div>

              {vehicle.rating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
                  <span style={{ color: '#f59e0b', fontSize: '1rem' }}>⭐</span>
                  <strong style={{ color: 'var(--text)' }}>{Number(vehicle.rating).toFixed(1)}</strong>
                  <span>({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                </div>
              )}

              {vehicle.status === 'AVAILABLE' ? (
                user ? (
                  <button
                    className="btn btn-primary btn-full btn-lg"
                    onClick={() => navigate(`/book/${vehicle.id}`)}
                  >
                    Book This Vehicle
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-full btn-lg"
                    onClick={() => navigate('/login')}
                  >
                    Login to Book
                  </button>
                )
              ) : (
                <button className="btn btn-full btn-lg" disabled>
                  {vehicle.status === 'BOOKED' ? 'Currently Booked' : 'Under Maintenance'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
