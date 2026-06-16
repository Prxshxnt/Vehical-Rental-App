import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

const containerStyle = { width: '100%', height: '100%' };

export default function MapView({ lat, lng, vehicleName }) {
  const center = { lat: lat || 28.6139, lng: lng || 77.2090 };

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_KEY,
  });

  if (!GOOGLE_MAPS_KEY) {
    return (
      <div className="map-container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-elevated)', color: 'var(--text-dim)', flexDirection: 'column', gap: '0.5rem'
      }}>
        <div style={{ fontSize: '2rem' }}>📍</div>
        <div style={{ fontSize: '0.85rem' }}>
          Location: {lat?.toFixed(4)}, {lng?.toFixed(4)}
        </div>
        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>
          Add VITE_GOOGLE_MAPS_KEY to enable map
        </div>
      </div>
    );
  }

  if (!isLoaded) return (
    <div className="map-container loading">
      <div className="spinner" />
    </div>
  );

  return (
    <div className="map-container">
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={14}
        options={{
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#1a1a26' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#242424' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
          ]
        }}
      >
        <Marker position={center} title={vehicleName} />
      </GoogleMap>
    </div>
  );
}
