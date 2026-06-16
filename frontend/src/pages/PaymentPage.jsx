import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingApi, paymentApi } from '../api/axios';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'UPI',         label: 'UPI',          icon: '📱', desc: 'Pay via any UPI app' },
  { id: 'CARD',        label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, RuPay' },
  { id: 'NET_BANKING', label: 'Net Banking',   icon: '🏦', desc: 'All major banks supported' },
  { id: 'WALLET',      label: 'Wallet',        icon: '👜', desc: 'Paytm, PhonePe, Amazon Pay' },
];

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking,  setBooking]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [method,   setMethod]   = useState('UPI');
  const [paying,   setPaying]   = useState(false);
  const [result,   setResult]   = useState(null); // { status, transactionId }

  const load = useCallback(async () => {
    try {
      const { data } = await bookingApi.getById(bookingId);
      if (data.status === 'CONFIRMED' || data.status === 'COMPLETED') {
        toast('This booking is already paid.', { icon: 'ℹ️' });
      }
      setBooking(data);
    } catch {
      toast.error('Booking not found');
      navigate('/my-bookings');
    } finally {
      setLoading(false);
    }
  }, [bookingId, navigate]);

  useEffect(() => { load(); }, [load]);

  const handlePay = async () => {
    setPaying(true);
    // Simulate a brief processing delay for UX realism
    await new Promise(r => setTimeout(r, 1800));
    try {
      const { data } = await paymentApi.process({
        bookingId: parseInt(bookingId),
        paymentMethod: method,
      });
      setResult({ status: data.paymentStatus, transactionId: data.transactionId });
      if (data.paymentStatus === 'SUCCESS') {
        toast.success('Payment successful! 🎉');
      } else {
        toast.error('Payment failed. Please try again.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment error');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!booking) return null;

  const nights = Math.round(
    (new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24)
  );

  // ── Result screen ──────────────────────────────────────────
  if (result) {
    const success = result.status === 'SUCCESS';
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: 440, width: '100%', margin: '1rem', textAlign: 'center' }}>
          <div className="card-body" style={{ padding: '3rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
              {success ? '🎉' : '❌'}
            </div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.75rem', marginBottom: '0.5rem' }}>
              {success ? 'Payment Successful!' : 'Payment Failed'}
            </h2>
            <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
              {success
                ? 'Your booking is confirmed. Enjoy your ride!'
                : 'Your payment could not be processed. Please try again.'}
            </p>

            {success && result.transactionId && (
              <div style={{
                padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)',
                marginBottom: '1.5rem', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-dim)',
              }}>
                TXN: {result.transactionId}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              {!success && (
                <button className="btn btn-primary" onClick={() => setResult(null)}>
                  Try Again
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => navigate('/my-bookings')}>
                My Bookings
              </button>
              {success && (
                <button className="btn btn-ghost" onClick={() => navigate('/')}>
                  Browse More
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Payment form ───────────────────────────────────────────
  return (
    <div className="page" style={{ maxWidth: 800 }}>
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}>
        ← Back
      </button>

      <h1 className="section-title">Complete Payment</h1>
      <p className="section-sub">Choose your preferred payment method</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>

        {/* ── Left: method picker ── */}
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-body">
              <h3 style={{ fontFamily: 'var(--font-head)', marginBottom: '1.25rem' }}>
                Select Payment Method
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {PAYMENT_METHODS.map(pm => (
                  <label
                    key={pm.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '1rem', borderRadius: 'var(--radius)', cursor: 'pointer',
                      border: `1px solid ${method === pm.id ? 'var(--accent)' : 'var(--border)'}`,
                      background: method === pm.id ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <input
                      type="radio" name="method" value={pm.id}
                      checked={method === pm.id}
                      onChange={() => setMethod(pm.id)}
                      style={{ accentColor: 'var(--accent)' }}
                    />
                    <span style={{ fontSize: '1.5rem' }}>{pm.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{pm.label}</div>
                      <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{pm.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Simulated input */}
          {method === 'UPI' && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-body">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">UPI ID</label>
                  <input className="form-input" placeholder="yourname@upi" defaultValue="demo@upi" />
                </div>
              </div>
            </div>
          )}
          {method === 'CARD' && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input className="form-input" placeholder="1234 5678 9012 3456" defaultValue="4111 1111 1111 1111" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Expiry</label>
                    <input className="form-input" placeholder="MM/YY" defaultValue="12/26" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">CVV</label>
                    <input className="form-input" placeholder="•••" defaultValue="123" type="password" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{
            padding: '0.75rem 1rem', borderRadius: 'var(--radius)',
            background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)',
            fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '1.25rem',
          }}>
            🔒 This is a <strong style={{ color: 'var(--text)' }}>payment simulation</strong>. No real transaction will occur.
            Success rate ~90%.
          </div>

          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={handlePay}
            disabled={paying}
          >
            {paying ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Processing…
              </span>
            ) : (
              `Pay ₹${Number(booking.totalPrice).toLocaleString()}`
            )}
          </button>
        </div>

        {/* ── Right: order summary ── */}
        <div>
          <div className="card" style={{ position: 'sticky', top: 90 }}>
            <div className="card-body">
              <h3 style={{ fontFamily: 'var(--font-head)', marginBottom: '1.25rem' }}>
                Order Summary
              </h3>

              <img
                src={booking.vehicleImageUrl || 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400'}
                alt={booking.vehicleName}
                style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 10, marginBottom: '1rem' }}
              />

              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, marginBottom: '0.25rem' }}>
                {booking.vehicleName}
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                {booking.startDate} → {booking.endDate} · {nights} night{nights !== 1 ? 's' : ''}
              </div>

              <hr className="divider" />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-dim)' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--accent)' }}>
                  ₹{Number(booking.totalPrice).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
