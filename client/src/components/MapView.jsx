import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { supabase } from "../utils/supabaseClient";
import "leaflet/dist/leaflet.css";

// Force Leaflet to resize properly inside flex/tab layout
function ForceMapResize() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 300); // Slight delay ensures DOM is ready
  }, [map]);
  return null;
}

// Status-based marker color
const getMarkerIcon = (status) =>
  new L.Icon({
    iconUrl:
      status === "resolved"
        ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
        : status === "monitoring"
        ? "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
        : "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

export default function MapView() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from("ranger_reports")
        .select(
          "id, ranger_name, ranger_id, latitude, longitude, status, condition, image_url, created_at"
        );

      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      const validReports = data
        .filter(
          (r) =>
            r.latitude !== null &&
            r.longitude !== null &&
            !isNaN(parseFloat(r.latitude)) &&
            !isNaN(parseFloat(r.longitude))
        )
        .map((r) => ({
          ...r,
          latitude: parseFloat(r.latitude),
          longitude: parseFloat(r.longitude),
        }));

      console.log("📍 Reports to render:", validReports);
      setReports(validReports);
    };

    fetchReports();
  }, []);

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-md">
      <MapContainer
        center={[33.9617, -116.5017]} // Coachella Valley
        zoom={11}
        scrollWheelZoom
        className="w-full h-full z-10"
        key={reports.length} // force re-render if needed
      >
        <ForceMapResize />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Fallback test marker if needed */}
        {/* <Marker position={[33.7225, -116.3756]} icon={getMarkerIcon("monitoring")}>
          <Popup>This is a test marker in Coachella Valley</Popup>
        </Marker> */}

        {reports.map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={getMarkerIcon(report.status?.toLowerCase() || "new")}
          >
            <Popup minWidth={260}>
              <div className="text-sm space-y-1">
                <p>
                  <strong>Name:</strong> {report.ranger_name}
                </p>
                <p>
                  <strong>ID:</strong> {report.ranger_id}
                </p>
                <p>
                  <strong>Condition:</strong> {report.condition}
                </p>
                <p>
                  <strong>Status:</strong> {report.status || "New"}
                </p>
                <p>
                  <strong>Latitude:</strong> {report.latitude}
                </p>
                <p>
                  <strong>Longitude:</strong> {report.longitude}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {new Date(report.created_at).toLocaleString()}
                </p>
                {report.image_url && (
                  <img
                    src={report.image_url}
                    alt="Report"
                    className="mt-2 w-full h-32 object-cover rounded border"
                  />
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
