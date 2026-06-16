import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleApi, bookingApi } from '../api/axios';
import toast from 'react-hot-toast';

function today() {
  return new Date().toISOString().split('T')[0];
}

function addDays(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function daysBetween(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(0, Math.round((e - s) / (1000 * 60 * 60 * 24)));
}

export default function BookingPage() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();

  const [vehicle,   setVehicle]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [submitting,setSubmitting]= useState(false);

  const [startDate, setStartDate] = useState(today());
  const [endDate,   setEndDate]   = useState(addDays(today(), 1));
  const [notes,     setNotes]     = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await vehicleApi.getById(vehicleId);
      if (data.status !== 'AVAILABLE') {
        toast.error('Vehicle is no longer available');
        navigate(`/vehicles/${vehicleId}`);
        return;
      }
      setVehicle(data);
    } catch {
      toast.error('Could not load vehicle');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [vehicleId, navigate]);

  useEffect(() => { load(); }, [load]);

  const days  = daysBetween(startDate, endDate);
  const total = vehicle ? (days * parseFloat(vehicle.pricePerDay)).toFixed(2) : 0;

  const handleStartChange = (val) => {
    setStartDate(val);
    if (val >= endDate) setEndDate(addDays(val, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (days <= 0) { toast.error('End date must be after start date'); return; }
    setSubmitting(true);
    try {
      const { data } = await bookingApi.create({
        vehicleId: parseInt(vehicleId),
        startDate,
        endDate,
        notes,
      });
      toast.success('Booking created! Proceed to payment.');
      navigate(`/payment/${data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Dates may conflict.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!vehicle) return null;

  return (
    <div className="page" style={{ maxWidth: 800 }}>
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}>
        ← Back
      </button>

      <h1 className="section-title">Book Your Vehicle</h1>
      <p className="section-sub">Select your rental dates and confirm your booking</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>

        {/* ── Left: Form ── */}
        <form onSubmit={handleSubmit}>
          {/* Vehicle Summary */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-body" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <img
                src={vehicle.imageUrl}
                alt={vehicle.name}
                style={{ width: 90, height: 70, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}
              />
              <div>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.1rem' }}>
                  {vehicle.name}
                </div>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  {vehicle.brand} · {vehicle.type} · {vehicle.fuelType}
                </div>
                <div style={{ color: 'var(--accent)', fontWeight: 700, marginTop: '0.25rem' }}>
                  ₹{Number(vehicle.pricePerDay).toLocaleString()} / day
                </div>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-body">
              <h3 style={{ fontFamily: 'var(--font-head)', marginBottom: '1.25rem' }}>
                📅 Select Dates
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Start Date</label>
                  <input
                    className="form-input"
                    type="date"
                    value={startDate}
                    min={today()}
                    onChange={e => handleStartChange(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">End Date</label>
                  <input
                    className="form-input"
                    type="date"
                    value={endDate}
                    min={addDays(startDate, 1)}
                    onChange={e => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {days > 0 && (
                <div style={{
                  marginTop: '1rem', padding: '0.75rem', borderRadius: 'var(--radius)',
                  background: 'var(--accent-dim)', border: '1px solid var(--accent)',
                  color: 'var(--accent)', fontSize: '0.875rem', fontWeight: 600,
                }}>
                  📆 {days} day{days !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-body">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Special Requests (optional)</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Any special requests or notes…"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={submitting || days <= 0}
          >
            {submitting ? 'Processing…' : 'Confirm Booking →'}
          </button>
        </form>

        {/* ── Right: Price Summary ── */}
        <div>
          <div className="card" style={{ position: 'sticky', top: '90px' }}>
            <div className="card-body">
              <h3 style={{ fontFamily: 'var(--font-head)', marginBottom: '1.25rem' }}>
                💰 Price Breakdown
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <PriceLine
                  label={`₹${Number(vehicle.pricePerDay).toLocaleString()} × ${days} day${days !== 1 ? 's' : ''}`}
                  value={`₹${(parseFloat(vehicle.pricePerDay) * days).toFixed(2)}`}
                />
                <PriceLine label="Service fee" value="₹0" dim />
                <PriceLine label="Taxes"       value="Included" dim />
              </div>

              <hr className="divider" />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.1rem' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.75rem', color: 'var(--accent)' }}>
                  ₹{days > 0 ? Number(total).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}
                </span>
              </div>

              <div style={{
                marginTop: '1rem', padding: '0.75rem', borderRadius: 'var(--radius)',
                background: 'var(--bg-elevated)', fontSize: '0.75rem', color: 'var(--text-dim)'
              }}>
                💳 Payment will be collected on the next step
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PriceLine({ label, value, dim }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
      <span style={{ color: dim ? 'var(--text-dim)' : 'var(--text)' }}>{label}</span>
      <span style={{ color: dim ? 'var(--text-dim)' : 'var(--text)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}
