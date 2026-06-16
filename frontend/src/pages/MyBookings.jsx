import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi, reviewApi } from '../api/axios';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  PENDING:   'badge-pending',
  CONFIRMED: 'badge-confirmed',
  COMPLETED: 'badge-completed',
  CANCELLED: 'badge-cancelled',
};

const STATUS_ICON = {
  PENDING:   '⏳',
  CONFIRMED: '✅',
  COMPLETED: '🏁',
  CANCELLED: '❌',
};

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings,  setBookings]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [reviewModal, setReviewModal] = useState(null); // { bookingId, vehicleId }
  const [review, setReview] = useState({ rating: 5, comment: '' });

  const load = useCallback(async () => {
    try {
      const { data } = await bookingApi.getMyBookings();
      setBookings(data);
    } catch {
      toast.error('Could not load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await bookingApi.cancel(id);
      toast.success('Booking cancelled');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await reviewApi.add({
        vehicleId: reviewModal.vehicleId,
        bookingId: reviewModal.bookingId,
        rating:  review.rating,
        comment: review.comment,
      });
      toast.success('Review submitted! 🌟');
      setReviewModal(null);
      setReview({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    }
  };

  const tabs   = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
  const shown  = activeTab === 'ALL' ? bookings : bookings.filter(b => b.status === activeTab);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div className="page">
      <h1 className="section-title">My Bookings</h1>
      <p className="section-sub">Track all your rentals in one place</p>

      {/* Tab Filter */}
      <div className="filters-bar">
        {tabs.map(t => (
          <button
            key={t}
            className={`filter-chip ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t === 'ALL' ? 'All' : `${STATUS_ICON[t]} ${t}`}
            <span style={{ marginLeft: '0.35rem', opacity: 0.7 }}>
              ({t === 'ALL' ? bookings.length : bookings.filter(b => b.status === t).length})
            </span>
          </button>
        ))}
      </div>

      {/* Booking Cards */}
      {shown.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📋</div>
          <div style={{ marginBottom: '1rem' }}>No bookings found</div>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Browse Vehicles</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {shown.map(b => (
            <BookingCard
              key={b.id}
              booking={b}
              onCancel={handleCancel}
              onPay={() => navigate(`/payment/${b.id}`)}
              onReview={() => setReviewModal({ bookingId: b.id, vehicleId: b.vehicleId })}
            />
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }}
          onClick={() => setReviewModal(null)}
        >
          <div className="card" style={{ width: '100%', maxWidth: 420, margin: '1rem' }}
            onClick={e => e.stopPropagation()}>
            <div className="card-body">
              <h3 style={{ fontFamily: 'var(--font-head)', marginBottom: '1rem' }}>Leave a Review ⭐</h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setReview(r => ({ ...r, rating: n }))}
                        style={{
                          fontSize: '1.5rem', background: 'none', border: 'none',
                          cursor: 'pointer', opacity: n <= review.rating ? 1 : 0.3,
                          transition: 'opacity 0.15s',
                        }}
                      >⭐</button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Comment</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    placeholder="Share your experience…"
                    value={review.comment}
                    onChange={e => setReview(r => ({ ...r, comment: e.target.value }))}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit</button>
                  <button type="button" className="btn btn-ghost" onClick={() => setReviewModal(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking: b, onCancel, onPay, onReview }) {
  const nights = Math.round(
    (new Date(b.endDate) - new Date(b.startDate)) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="card">
      <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '1.25rem', alignItems: 'start' }}>
        {/* Vehicle thumb */}
        <img
          src={b.vehicleImageUrl || 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=200'}
          alt={b.vehicleName}
          style={{ width: 80, height: 65, objectFit: 'cover', borderRadius: 10 }}
        />

        {/* Details */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700 }}>{b.vehicleName}</span>
            <span className={`badge ${STATUS_BADGE[b.status]}`}>{b.status}</span>
          </div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
            📅 {b.startDate} → {b.endDate} &nbsp;·&nbsp; {nights} night{nights !== 1 ? 's' : ''}
          </div>
          {b.notes && (
            <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '0.25rem', fontStyle: 'italic' }}>
              "{b.notes}"
            </div>
          )}
        </div>

        {/* Right */}
        <div style={{ textAlign: 'right', minWidth: 140 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--accent)' }}>
            ₹{Number(b.totalPrice).toLocaleString()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
            {b.status === 'PENDING' && (
              <>
                <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }} onClick={onPay}>
                  💳 Pay Now
                </button>
                <button className="btn btn-danger" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }} onClick={() => onCancel(b.id)}>
                  Cancel
                </button>
              </>
            )}
            {b.status === 'COMPLETED' && (
              <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }} onClick={onReview}>
                ⭐ Review
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
