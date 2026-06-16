import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { adminApi, vehicleApi } from '../api/axios';
import toast from 'react-hot-toast';

const COLORS = ['#f97316', '#6366f1', '#22c55e', '#ef4444', '#f59e0b'];

const STATUS_BADGE = {
  PENDING:   'badge-pending',
  CONFIRMED: 'badge-confirmed',
  COMPLETED: 'badge-completed',
  CANCELLED: 'badge-cancelled',
};

const TABS = ['Overview', 'Bookings', 'Users', 'Vehicles'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab,       setTab]      = useState('Overview');
  const [analytics, setAnalytics]= useState(null);
  const [bookings,  setBookings] = useState([]);
  const [users,     setUsers]    = useState([]);
  const [vehicles,  setVehicles] = useState([]);
  const [loading,   setLoading]  = useState(true);

  // Vehicle add form
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [vForm, setVForm] = useState({
    name: '', type: 'CAR', brand: '', model: '', year: '',
    pricePerDay: '', seats: '', fuelType: '', imageUrl: '', description: '',
    locationLat: '', locationLng: '',
  });
  const [saving, setSaving] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, bRes, uRes, vRes] = await Promise.all([
        adminApi.getAnalytics(),
        adminApi.getAllBookings(),
        adminApi.getAllUsers(),
        vehicleApi.getAll(),
      ]);
      setAnalytics(aRes.data);
      setBookings(bRes.data);
      setUsers(uRes.data);
      setVehicles(vRes.data);
    } catch {
      toast.error('Could not load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('Delete this vehicle permanently?')) return;
    try {
      await vehicleApi.delete(id);
      toast.success('Vehicle deleted');
      loadAll();
    } catch { toast.error('Delete failed'); }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await vehicleApi.create({
        ...vForm,
        year:         vForm.year         ? parseInt(vForm.year)             : null,
        pricePerDay:  vForm.pricePerDay  ? parseFloat(vForm.pricePerDay)    : 0,
        seats:        vForm.seats        ? parseInt(vForm.seats)            : null,
        locationLat:  vForm.locationLat  ? parseFloat(vForm.locationLat)   : null,
        locationLng:  vForm.locationLng  ? parseFloat(vForm.locationLng)   : null,
      });
      toast.success('Vehicle added!');
      setShowAddVehicle(false);
      setVForm({ name:'', type:'CAR', brand:'', model:'', year:'', pricePerDay:'', seats:'', fuelType:'', imageUrl:'', description:'', locationLat:'', locationLng:'' });
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add vehicle');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  // ── Chart data ─────────────────────────────────────────────
  const bookingStatusData = analytics ? [
    { name: 'Pending',   value: analytics.pendingBookings   || 0 },
    { name: 'Confirmed', value: analytics.confirmedBookings || 0 },
    { name: 'Completed', value: analytics.completedBookings || 0 },
  ].filter(d => d.value > 0) : [];

  const vehicleStatusData = analytics ? [
    { name: 'Available',    value: analytics.availableVehicles || 0 },
    { name: 'Booked',       value: analytics.bookedVehicles    || 0 },
  ].filter(d => d.value > 0) : [];

  const paymentData = analytics ? [
    { name: 'Success', value: analytics.successfulPayments || 0 },
    { name: 'Failed',  value: analytics.failedPayments     || 0 },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="page">
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="section-title">Admin Dashboard</h1>
          <p style={{ color: 'var(--text-dim)' }}>Manage your fleet, bookings, and users</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={loadAll}>↺ Refresh</button>
          <button className="btn btn-primary" onClick={() => { setTab('Vehicles'); setShowAddVehicle(true); }}>
            + Add Vehicle
          </button>
        </div>
      </div>

      {/* ── Tab Nav ── */}
      <div className="filters-bar" style={{ marginBottom: '2rem' }}>
        {TABS.map(t => (
          <button key={t} className={`filter-chip ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'Overview' && '📊 '}
            {t === 'Bookings' && '📋 '}
            {t === 'Users'    && '👥 '}
            {t === 'Vehicles' && '🚗 '}
            {t}
          </button>
        ))}
      </div>

      {/* ══════════════ OVERVIEW ══════════════ */}
      {tab === 'Overview' && (
        <>
          {/* Stat cards */}
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            <StatCard icon="👥" label="Total Users"    value={analytics?.totalUsers    ?? 0} color="var(--accent2)" />
            <StatCard icon="🚗" label="Total Vehicles" value={analytics?.totalVehicles ?? 0} color="var(--accent)" />
            <StatCard icon="📋" label="Total Bookings" value={analytics?.totalBookings ?? 0} color="var(--success)" />
            <StatCard icon="✅" label="Payments OK"    value={analytics?.successfulPayments ?? 0} color="var(--warning)" />
          </div>

          <div className="grid-3" style={{ marginBottom: '2rem' }}>
            {/* Booking Status chart */}
            <div className="card">
              <div className="card-body">
                <h3 style={{ fontFamily: 'var(--font-head)', marginBottom: '1.25rem' }}>Booking Status</h3>
                {bookingStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={bookingStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                        {bookingStatusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f1f1f5' }} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </div>
            </div>

            {/* Vehicle Status chart */}
            <div className="card">
              <div className="card-body">
                <h3 style={{ fontFamily: 'var(--font-head)', marginBottom: '1.25rem' }}>Fleet Status</h3>
                {vehicleStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={vehicleStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                        {vehicleStatusData.map((_, i) => <Cell key={i} fill={COLORS[i + 1]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f1f1f5' }} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </div>
            </div>

            {/* Payment chart */}
            <div className="card">
              <div className="card-body">
                <h3 style={{ fontFamily: 'var(--font-head)', marginBottom: '1.25rem' }}>Payments</h3>
                {paymentData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={paymentData} barSize={48}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: '#8b8b9e', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#8b8b9e', fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f1f1f5' }} />
                      <Bar dataKey="value" radius={[6,6,0,0]}>
                        {paymentData.map((_, i) => <Cell key={i} fill={i === 0 ? '#22c55e' : '#ef4444'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </div>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid-4">
            <MiniStat label="Available"  value={analytics?.availableVehicles ?? 0} color="var(--success)" />
            <MiniStat label="Booked Now" value={analytics?.bookedVehicles    ?? 0} color="var(--accent)" />
            <MiniStat label="Pending Pay" value={analytics?.pendingBookings   ?? 0} color="var(--warning)" />
            <MiniStat label="Confirmed"  value={analytics?.confirmedBookings  ?? 0} color="var(--accent2)" />
          </div>
        </>
      )}

      {/* ══════════════ BOOKINGS ══════════════ */}
      {tab === 'Bookings' && (
        <>
          <h2 style={{ fontFamily: 'var(--font-head)', marginBottom: '1rem' }}>
            All Bookings ({bookings.length})
          </h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>User</th><th>Vehicle</th>
                  <th>Dates</th><th>Total</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td style={{ color: 'var(--text-dim)' }}>#{b.id}</td>
                    <td>{b.userName}</td>
                    <td>{b.vehicleName}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      {b.startDate} → {b.endDate}
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{Number(b.totalPrice).toLocaleString()}</td>
                    <td><span className={`badge ${STATUS_BADGE[b.status]}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ══════════════ USERS ══════════════ */}
      {tab === 'Users' && (
        <>
          <h2 style={{ fontFamily: 'var(--font-head)', marginBottom: '1rem' }}>
            All Users ({users.length})
          </h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--text-dim)' }}>#{u.id}</td>
                    <td>{u.name}</td>
                    <td style={{ color: 'var(--text-dim)' }}>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'ADMIN' ? 'badge-booked' : 'badge-confirmed'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                      {u.createdAt ? u.createdAt.split('T')[0] : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ══════════════ VEHICLES ══════════════ */}
      {tab === 'Vehicles' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'var(--font-head)' }}>Fleet ({vehicles.length})</h2>
            <button className="btn btn-primary" onClick={() => setShowAddVehicle(v => !v)}>
              {showAddVehicle ? '✕ Close Form' : '+ Add Vehicle'}
            </button>
          </div>

          {/* Add Vehicle Form */}
          {showAddVehicle && (
            <div className="card" style={{ marginBottom: '2rem' }}>
              <div className="card-body">
                <h3 style={{ fontFamily: 'var(--font-head)', marginBottom: '1.25rem' }}>New Vehicle</h3>
                <form onSubmit={handleAddVehicle}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
                    {[
                      { name: 'name',         label: 'Vehicle Name', required: true },
                      { name: 'brand',        label: 'Brand' },
                      { name: 'model',        label: 'Model' },
                      { name: 'year',         label: 'Year',         type: 'number' },
                      { name: 'pricePerDay',  label: 'Price/Day (₹)', type: 'number', required: true },
                      { name: 'seats',        label: 'Seats',        type: 'number' },
                      { name: 'fuelType',     label: 'Fuel Type' },
                      { name: 'locationLat',  label: 'Latitude',     type: 'number' },
                      { name: 'locationLng',  label: 'Longitude',    type: 'number' },
                    ].map(f => (
                      <div className="form-group" key={f.name} style={{ marginBottom: 0 }}>
                        <label className="form-label">{f.label}</label>
                        <input
                          className="form-input" type={f.type || 'text'}
                          value={vForm[f.name]} required={f.required}
                          onChange={e => setVForm(v => ({ ...v, [f.name]: e.target.value }))}
                        />
                      </div>
                    ))}

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Type</label>
                      <select className="form-input form-select" value={vForm.type}
                        onChange={e => setVForm(v => ({ ...v, type: e.target.value }))}>
                        <option value="CAR">CAR</option>
                        <option value="BIKE">BIKE</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label className="form-label">Image URL</label>
                    <input className="form-input" type="url" value={vForm.imageUrl}
                      onChange={e => setVForm(v => ({ ...v, imageUrl: e.target.value }))}
                      placeholder="https://…"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-input" rows={3} value={vForm.description}
                      onChange={e => setVForm(v => ({ ...v, description: e.target.value }))}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Saving…' : 'Add Vehicle'}
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowAddVehicle(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Vehicle Table */}
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Name</th><th>Type</th><th>Price/Day</th><th>Status</th><th>Rating</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {vehicles.map(v => (
                  <tr key={v.id}>
                    <td style={{ color: 'var(--text-dim)' }}>#{v.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={v.imageUrl} alt={v.name}
                          style={{ width: 44, height: 36, objectFit: 'cover', borderRadius: 6 }}
                          onError={e => e.target.style.display = 'none'}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{v.name}</div>
                          <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{v.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge badge-${v.type.toLowerCase()}`}>{v.type}</span></td>
                    <td style={{ fontWeight: 600 }}>₹{Number(v.pricePerDay).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${
                        v.status === 'AVAILABLE' ? 'badge-available' :
                        v.status === 'BOOKED'    ? 'badge-booked'    : 'badge-maintenance'
                      }`}>{v.status}</span>
                    </td>
                    <td style={{ color: '#f59e0b' }}>{v.rating > 0 ? `⭐ ${Number(v.rating).toFixed(1)}` : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => navigate(`/vehicles/${v.id}`)}
                        >View</button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => handleDeleteVehicle(v.id)}
                        >Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '1rem',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <span style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.5rem', color }}>
        {value}
      </span>
    </div>
  );
}

function EmptyChart() {
  return (
    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
      No data yet
    </div>
  );
}
