import { useState, useEffect, useCallback } from 'react';
import { vehicleApi } from '../api/axios';
import VehicleCard from '../components/VehicleCard';
import toast from 'react-hot-toast';

const FILTERS = [
  { label: 'All',       status: '',            type: '' },
  { label: 'Available', status: 'AVAILABLE',   type: '' },
  { label: '🚗 Cars',   status: 'AVAILABLE',   type: 'CAR' },
  { label: '🏍️ Bikes',  status: 'AVAILABLE',   type: 'BIKE' },
];

export default function Home() {
  const [vehicles, setVehicles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [active,   setActive]   = useState(0);
  const [search,   setSearch]   = useState('');

  const load = useCallback(async (idx) => {
    setLoading(true);
    try {
      const f = FILTERS[idx];
      const params = {};
      if (f.status) params.status = f.status;
      if (f.type)   params.type   = f.type;
      const { data } = await vehicleApi.getAll(params);
      setVehicles(data);
    } catch {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(active); }, [active, load]);

  const displayed = vehicles.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    (v.brand || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* ── Hero ── */}
      <div className="hero">
        <div className="page" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <h1 className="hero-title">
            Rent any vehicle,<br /><em>anywhere in India</em>
          </h1>
          <p className="hero-sub">
            Curated fleet of cars and bikes. Transparent pricing. Instant booking. No hidden fees.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <input
              className="form-input"
              placeholder="Search by name or brand…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: 440, fontSize: '1rem' }}
            />
          </div>
        </div>
      </div>

      {/* ── Vehicles ── */}
      <div className="page">
        <div className="filters-bar">
          {FILTERS.map((f, i) => (
            <button
              key={i}
              className={`filter-chip ${active === i ? 'active' : ''}`}
              onClick={() => setActive(i)}
            >
              {f.label}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
            {displayed.length} vehicle{displayed.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : displayed.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🔍</div>
            <div>No vehicles found</div>
          </div>
        ) : (
          <div className="grid-vehicles">
            {displayed.map(v => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
        )}
      </div>
    </>
  );
}
