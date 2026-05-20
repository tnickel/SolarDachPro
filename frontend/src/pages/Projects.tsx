import { useEffect, useState } from "react";
import {
  type SolarProject,
  type ProjectStatus,
  PROJECT_STATUS_LABELS,
  ROOF_TYPE_LABELS,
} from "../types";
import { getProjects, updateProjectStatus } from "../api/client";

const ALL_STATUSES: ProjectStatus[] = [
  "PLANNING",
  "APPROVED",
  "UNDER_CONSTRUCTION",
  "COMMISSIONED",
  "OPERATIONAL",
  "DECOMMISSIONED",
];

export default function Projects() {
  const [projects, setProjects] = useState<SolarProject[]>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<ProjectStatus>("PLANNING");

  useEffect(() => {
    loadProjects();
  }, [filterStatus]);

  async function loadProjects() {
    setLoading(true);
    try {
      const res = await getProjects(filterStatus ? { status: filterStatus } : undefined);
      setProjects(res.data);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(id: string) {
    try {
      await updateProjectStatus(id, newStatus);
      setEditingId(null);
      loadProjects();
    } catch (err) {
      alert("Fehler: " + (err as Error).message);
    }
  }

  return (
    <>
      <div className="page-header">
        <h2>Solarprojekte</h2>
        <p>Alle gewerblichen Dach-Solaranlagen im Überblick</p>
      </div>
      <div className="page-body">
        <div className="table-container">
          <div className="table-header">
            <h3>☀️ {projects.length} Projekte</h3>
            <div className="table-search">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  padding: "8px 14px",
                  color: "var(--text-primary)",
                  fontSize: "0.85rem",
                  fontFamily: "inherit",
                  outline: "none",
                }}
              >
                <option value="">Alle Status</option>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {PROJECT_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner" />
              Lade Projekte...
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Projektname</th>
                  <th>Kunde</th>
                  <th>Status</th>
                  <th>kWp</th>
                  <th>Dachtyp</th>
                  <th>Fläche m²</th>
                  <th>Aktion</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>{project.projectName}</td>
                    <td>{project.client?.companyName || "–"}</td>
                    <td>
                      <span className={`badge badge-${project.status.toLowerCase()}`}>
                        <span className="badge-dot" />
                        {PROJECT_STATUS_LABELS[project.status]}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--color-primary-light)" }}>
                      {project.plannedKwp}
                    </td>
                    <td>{ROOF_TYPE_LABELS[project.roofType]}</td>
                    <td>{project.roofAreaSqm?.toLocaleString("de-DE") || "–"}</td>
                    <td>
                      {editingId === project.id ? (
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value as ProjectStatus)}
                            style={{
                              background: "var(--bg-input)",
                              border: "1px solid var(--border-color)",
                              borderRadius: "var(--radius-sm)",
                              padding: "4px 8px",
                              color: "var(--text-primary)",
                              fontSize: "0.75rem",
                              fontFamily: "inherit",
                            }}
                          >
                            {ALL_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {PROJECT_STATUS_LABELS[s]}
                              </option>
                            ))}
                          </select>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleStatusUpdate(project.id)}
                          >
                            ✓
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setEditingId(null)}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            setEditingId(project.id);
                            setNewStatus(project.status);
                          }}
                        >
                          Status ändern
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
                      Keine Projekte gefunden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
