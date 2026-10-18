import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom modern SVG DivIcons to ensure reliable rendering without external png assets
const createCustomIcon = (type, title) => {
  let color = '#2563eb'; // blue for live/agent
  let pulseHtml = '';
  let iconSvg = '';

  if (type === 'pickup') {
    color = '#16a34a'; // green
    iconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    `;
  } else if (type === 'drop') {
    color = '#dc2626'; // red
    iconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    `;
  } else {
    // Current / Agent / Truck
    color = '#2563eb'; // blue
    pulseHtml = `<span class="absolute -inset-2 rounded-full bg-blue-500 opacity-40 animate-ping"></span>`;
    iconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
        <path d="M15 18H9"/>
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14v10"/>
        <circle cx="17" cy="18" r="2"/>
        <circle cx="7" cy="18" r="2"/>
      </svg>
    `;
  }

  const html = `
    <div class="relative flex items-center justify-center cursor-pointer group">
      ${pulseHtml}
      <div style="background-color: ${color};" class="w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-transform duration-200 group-hover:scale-110">
        ${iconSvg}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

// Component to dynamically fit map bounds to all active coordinates
const MapBoundsAdjuster = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    const validPoints = points.filter(
      (p) => p && typeof p[0] === 'number' && typeof p[1] === 'number' && !isNaN(p[0]) && !isNaN(p[1])
    );

    if (validPoints.length === 0) return;

    if (validPoints.length === 1) {
      map.setView(validPoints[0], 13);
    } else {
      const bounds = L.latLngBounds(validPoints);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [map, points]);

  return null;
};

// Map click listener component (e.g., when picking coordinates in PlaceOrder)
const MapClickHandler = ({ onMapClick }) => {
  const map = useMap();

  useEffect(() => {
    if (!onMapClick) return;

    const handleClick = (e) => {
      onMapClick(e.latlng);
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);

  return null;
};

const LiveMap = ({
  center = [20.5937, 78.9629],
  zoom = 5,
  pickup = null, // { lat, lng, address }
  drop = null, // { lat, lng, address }
  currentLocation = null, // { lat, lng, text }
  markers = [], // optional array of custom markers: [{ lat, lng, type, title, subtitle }]
  onMapClick = null,
  showRoute = true,
  height = '100%',
}) => {
  // Aggregate markers
  const allMarkers = [...markers];

  if (pickup?.lat && pickup?.lng) {
    allMarkers.push({
      lat: Number(pickup.lat),
      lng: Number(pickup.lng),
      type: 'pickup',
      title: 'Pickup Location',
      subtitle: pickup.address || 'Sender Location',
    });
  }

  if (drop?.lat && drop?.lng) {
    allMarkers.push({
      lat: Number(drop.lat),
      lng: Number(drop.lng),
      type: 'drop',
      title: 'Drop Location',
      subtitle: drop.address || 'Destination Address',
    });
  }

  if (currentLocation?.lat && currentLocation?.lng) {
    allMarkers.push({
      lat: Number(currentLocation.lat),
      lng: Number(currentLocation.lng),
      type: 'current',
      title: 'Live Agent Location',
      subtitle: currentLocation.text || 'In Transit',
    });
  }

  // Route path coordinates
  const polylinePoints = [];
  if (pickup?.lat && pickup?.lng) {
    polylinePoints.push([Number(pickup.lat), Number(pickup.lng)]);
  }
  if (currentLocation?.lat && currentLocation?.lng) {
    polylinePoints.push([Number(currentLocation.lat), Number(currentLocation.lng)]);
  }
  if (drop?.lat && drop?.lng) {
    polylinePoints.push([Number(drop.lat), Number(drop.lng)]);
  }

  const allPoints = allMarkers.map((m) => [m.lat, m.lng]);

  const mapCenter = allPoints.length > 0 ? allPoints[0] : center;

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {showRoute && polylinePoints.length >= 2 && (
          <Polyline
            positions={polylinePoints}
            color="#2563eb"
            weight={4}
            opacity={0.7}
            dashArray="8, 8"
          />
        )}

        {allMarkers.map((marker, index) => (
          <Marker
            key={`${marker.type || 'marker'}-${marker.lat}-${marker.lng}-${index}`}
            position={[marker.lat, marker.lng]}
            icon={createCustomIcon(marker.type, marker.title)}
          >
            <Popup>
              <div className="p-1">
                <span
                  className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    marker.type === 'pickup'
                      ? 'bg-emerald-100 text-emerald-800'
                      : marker.type === 'drop'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {marker.type === 'pickup'
                    ? 'Pickup'
                    : marker.type === 'drop'
                    ? 'Destination'
                    : 'Current GPS'}
                </span>
                <p className="mt-1 text-sm font-semibold text-slate-900">{marker.title}</p>
                {marker.subtitle && (
                  <p className="mt-0.5 text-xs text-slate-600 line-clamp-2">{marker.subtitle}</p>
                )}
                <p className="mt-1 text-[10px] text-slate-400">
                  {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {allPoints.length > 0 && <MapBoundsAdjuster points={allPoints} />}
        {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
