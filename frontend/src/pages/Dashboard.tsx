import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  type CommercialClient,
  type SolarProject,
  type LandRegistry,
  PROJECT_STATUS_LABELS,
  type ProjectStatus,
} from "../types";
import { getClients, getProjects, getLandRegistries } from "../api/client";

export default function Dashboard() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<CommercialClient[]>([]);
  const [projects, setProjects] = useState<SolarProject[]>([]);
  const [registries, setRegistries] = useState<LandRegistry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getClients(), getProjects(), getLandRegistries()])
      .then(([c, p, r]) => {
        setClients(c.data);
        setProjects(p.data);
        setRegistries(r.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
        Lade Dashboard...
      </div>
    );
  }

  const totalKwp = projects.reduce((sum, p) => sum + p.plannedKwp, 0);
  const operationalProjects = projects.filter(
    (p) => p.status === "OPERATIONAL" || p.status === "COMMISSIONED"
  );
  const operationalKwp = operationalProjects.reduce((sum, p) => sum + p.plannedKwp, 0);
  const pendingRegistries = registries.filter(
    (r) => r.legalStatus === "PENDING" || r.legalStatus === "IN_REVIEW"
  );

  // Status distribution
  const statusCounts: Record<string, number> = {};
  projects.forEach((p) => {
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
  });

  return (
    <>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Übersicht aller Solarprojekte und Gewerbekunden</p>
      </div>
      <div className="page-body">
        {/* KPI Cards */}
        <div className="kpi-grid">
          <div
            className="kpi-card"
            style={{ "--kpi-color": "#f59e0b" } as React.CSSProperties}
          >
            <div className="kpi-icon">☀️</div>
            <div className="kpi-value">{totalKwp.toLocaleString("de-DE")}</div>
            <div className="kpi-label">kWp geplant (gesamt)</div>
          </div>
          <div
            className="kpi-card"
            style={{ "--kpi-color": "#10b981" } as React.CSSProperties}
          >
            <div className="kpi-icon">⚡</div>
            <div className="kpi-value">{operationalKwp.toLocaleString("de-DE")}</div>
            <div className="kpi-label">kWp in Betrieb</div>
          </div>
          <div
            className="kpi-card"
            style={{ "--kpi-color": "#3b82f6" } as React.CSSProperties}
          >
            <div className="kpi-icon">🏢</div>
            <div className="kpi-value">{clients.length}</div>
            <div className="kpi-label">Gewerbekunden</div>
          </div>
          <div
            className="kpi-card"
            style={{ "--kpi-color": "#8b5cf6" } as React.CSSProperties}
          >
            <div className="kpi-icon">📋</div>
            <div className="kpi-value">{projects.length}</div>
            <div className="kpi-label">Solarprojekte</div>
          </div>
          <div
            className="kpi-card"
            style={{ "--kpi-color": "#ef4444" } as React.CSSProperties}
          >
            <div className="kpi-icon">📑</div>
            <div className="kpi-value">{pendingRegistries.length}</div>
            <div className="kpi-label">Offene Grundbuchprüfungen</div>
          </div>
        </div>

        {/* Project Status + Recent Clients */}
        <div className="section-grid">
          {/* Status Overview */}
          <div className="detail-panel">
            <h3>📊 Projektstatus-Verteilung</h3>
            {Object.entries(statusCounts).map(([status, count]) => (
              <div className="detail-row" key={status}>
                <span className="detail-label">
                  <span
                    className={`badge badge-${status.toLowerCase()}`}
                  >
                    <span className="badge-dot" />
                    {PROJECT_STATUS_LABELS[status as ProjectStatus]}
                  </span>
                </span>
                <span className="detail-value">{count} Projekte</span>
              </div>
            ))}
          </div>

          {/* Recent Clients */}
          <div className="table-container">
            <div className="table-header">
              <h3>🏢 Gewerbekunden</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/clients")}>
                Alle anzeigen →
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Firma</th>
                  <th>Stadt</th>
                  <th>Projekte</th>
                </tr>
              </thead>
              <tbody>
                {clients.slice(0, 5).map((client) => (
                  <tr
                    key={client.id}
                    className="clickable-row"
                    onClick={() => navigate(`/clients`)}
                  >
                    <td>{client.companyName}</td>
                    <td>{client.city}</td>
                    <td>{client.projects?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
