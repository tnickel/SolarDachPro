import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { type SolarProject, PROJECT_STATUS_LABELS, type ProjectStatus } from "../types";
import { getProjects } from "../api/client";

// Custom marker icons by status
function createIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 28px; height: 28px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
      font-size: 12px;
    ">☀️</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

const STATUS_COLORS: Record<ProjectStatus, string> = {
  PLANNING: "#3b82f6",
  APPROVED: "#8b5cf6",
  UNDER_CONSTRUCTION: "#f59e0b",
  COMMISSIONED: "#10b981",
  OPERATIONAL: "#10b981",
  DECOMMISSIONED: "#64748b",
};

export default function MapView() {
  const [projects, setProjects] = useState<SolarProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects()
      .then((res) => setProjects(res.data))
      .finally(() => setLoading(false));
  }, []);

  // Filter projects with valid coordinates
  const geoProjects = projects.filter(
    (p) => p.latitude != null && p.longitude != null
  );

  // Center of Germany as default
  const defaultCenter: [number, number] = [51.1657, 10.4515];
  const center: [number, number] =
    geoProjects.length > 0
      ? [geoProjects[0].latitude!, geoProjects[0].longitude!]
      : defaultCenter;

  if (loading) {
    return (
      <>
        <div className="page-header">
          <h2>Kartenansicht</h2>
          <p>Standorte aller Solarprojekte</p>
        </div>
        <div className="page-body">
          <div className="loading-spinner">
            <div className="spinner" />
            Lade Karte...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <h2>Kartenansicht</h2>
        <p>{geoProjects.length} Standorte auf der Karte</p>
      </div>
      <div className="page-body" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)" }}>
        {/* Legend */}
        <div style={{
          display: "flex",
          gap: 16,
          marginBottom: 12,
          flexWrap: "wrap",
        }}>
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div
              key={status}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: color,
                }}
              />
              {PROJECT_STATUS_LABELS[status as ProjectStatus]}
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="map-container" style={{ flex: 1 }}>
          <MapContainer center={center} zoom={6} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {geoProjects.map((project) => (
              <Marker
                key={project.id}
                position={[project.latitude!, project.longitude!]}
                icon={createIcon(STATUS_COLORS[project.status])}
              >
                <Popup>
                  <div className="map-popup">
                    <h4>{project.projectName}</h4>
                    <p>
                      <strong>Kunde:</strong> {project.client?.companyName || "–"}
                    </p>
                    <p>
                      <strong>Leistung:</strong>{" "}
                      <span className="popup-kwp">{project.plannedKwp} kWp</span>
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {PROJECT_STATUS_LABELS[project.status]}
                    </p>
                    {project.roofAreaSqm && (
                      <p>
                        <strong>Fläche:</strong>{" "}
                        {project.roofAreaSqm.toLocaleString("de-DE")} m²
                      </p>
                    )}
                    {project.estimatedYieldKwh && (
                      <p>
                        <strong>Ertrag:</strong>{" "}
                        {(project.estimatedYieldKwh / 1000).toLocaleString("de-DE")} MWh/a
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </>
  );
}
