import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const WorldMap = ({ circuits, onCircuitSelect, selectedCircuit }) => {
  const handleMarkerClick = (circuit) => {
    console.log('Circuit clicked:', circuit.displayName);
    onCircuitSelect(circuit);
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {circuits.map(circuit => (
          <Marker
            key={circuit.circuitId}
            position={[circuit.lat, circuit.lng]}
            eventHandlers={{
              click: () => handleMarkerClick(circuit),
            }}
          >
            <Popup>
              <div>
                <h3>{circuit.displayName}</h3>
                <p>{circuit.location}, {circuit.country}</p>
                <p>{circuit.raceCount} races hosted</p>
                <button onClick={() => handleMarkerClick(circuit)}>
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default WorldMap;