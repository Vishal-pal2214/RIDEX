import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

function Map() {
  const position = [28.6139, 77.2090]; // Delhi

  return (
    <MapContainer center={position} zoom={13} style={{ height: "400px", width: "100%" }}>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>Delhi 🚗</Popup>
      </Marker>
    </MapContainer>
  );
}

export default Map;