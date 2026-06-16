import { useNavigate } from 'react-router-dom';

const STATUS_BADGE = {
  AVAILABLE:   'badge-available',
  BOOKED:      'badge-booked',
  MAINTENANCE: 'badge-maintenance',
};

const TYPE_ICON = { CAR: '🚗', BIKE: '🏍️' };

export default function VehicleCard({ vehicle }) {
  const navigate = useNavigate();

  return (
    <div className="vehicle-card" onClick={() => navigate(`/vehicles/${vehicle.id}`)}>
      <img
        src={vehicle.imageUrl || 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800'}
        alt={vehicle.name}
        className="vehicle-card-image"
        loading="lazy"
      />
      <div className="vehicle-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <div>
            <div className="vehicle-name">{vehicle.name}</div>
            <div className="vehicle-meta">
              {TYPE_ICON[vehicle.type]} {vehicle.type} &nbsp;·&nbsp; {vehicle.fuelType || 'Petrol'}
              {vehicle.seats && <>&nbsp;·&nbsp; {vehicle.seats} seats</>}
            </div>
          </div>
          <span className={`badge ${STATUS_BADGE[vehicle.status]}`}>
            {vehicle.status}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="vehicle-price">
            ₹{Number(vehicle.pricePerDay).toLocaleString()}
            <span> /day</span>
          </div>
          {vehicle.rating > 0 && (
            <div style={{ color: '#f59e0b', fontSize: '0.85rem' }}>
              ⭐ {Number(vehicle.rating).toFixed(1)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
