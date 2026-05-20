import { useEffect, useState } from "react";
import {
  type SolarProject,
  type ProjectStatus,
  type CommercialClient,
  type RoofType,
  PROJECT_STATUS_LABELS,
  ROOF_TYPE_LABELS,
} from "../types";
import { getProjects, updateProjectStatus, getClients, createProject } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const ALL_STATUSES: ProjectStatus[] = [
  "PLANNING",
  "APPROVED",
  "UNDER_CONSTRUCTION",
  "COMMISSIONED",
  "OPERATIONAL",
  "DECOMMISSIONED",
];

export default function Projects() {
  const { isAdmin } = useAuth();
  const { addToast } = useToast();
  
  const [projects, setProjects] = useState<SolarProject[]>([]);
  const [clients, setClients] = useState<CommercialClient[]>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<ProjectStatus>("PLANNING");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProject, setNewProject] = useState<Partial<SolarProject>>({
    projectName: "",
    status: "PLANNING",
    plannedKwp: 0,
    roofType: "FLAT",
    clientId: "",
  });

  useEffect(() => {
    loadProjects();
    if (isAdmin) {
      loadClients();
    }
  }, [filterStatus, isAdmin]);

  async function loadClients() {
    try {
      const res = await getClients();
      setClients(res.data);
      if (res.data.length > 0 && !newProject.clientId) {
        setNewProject((prev) => ({ ...prev, clientId: res.data[0].id }));
      }
    } catch (err) {
      addToast("Gewerbekunden konnten nicht geladen werden.", "error");
    }
  }

  async function loadProjects() {
    setLoading(true);
    try {
      const res = await getProjects(filterStatus ? { status: filterStatus } : undefined);
      setProjects(res.data);
    } catch (err) {
      addToast("Projekte konnten nicht geladen werden.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(id: string) {
    try {
      await updateProjectStatus(id, newStatus);
      setEditingId(null);
      loadProjects();
      addToast("Status erfolgreich geändert", "success");
    } catch (err) {
      addToast("Fehler beim Ändern des Status: " + (err as Error).message, "error");
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newProject.projectName || !newProject.clientId || !newProject.plannedKwp) {
      addToast("Bitte alle Pflichtfelder ausfüllen.", "error");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createProject({
        ...newProject,
        plannedKwp: Number(newProject.plannedKwp),
      });
      addToast("Projekt erfolgreich angelegt!", "success");
      setIsModalOpen(false);
      setNewProject({ 
        projectName: "", 
        status: "PLANNING", 
        plannedKwp: 0, 
        roofType: "FLAT", 
        clientId: clients[0]?.id || "" 
      });
      loadProjects();
    } catch (err) {
      addToast("Fehler beim Anlegen: " + (err as Error).message, "error");
    } finally {
      setIsSubmitting(false);
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
            <div className="table-search" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
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
              {isAdmin && (
                <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
                  + Neues Projekt
                </button>
              )}
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
                      {!isAdmin ? (
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Nur Ansicht</span>
                      ) : editingId === project.id ? (
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

      {/* CREATE PROJECT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <h3>Neues Projekt anlegen</h3>
            <form onSubmit={handleCreateProject} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
              
              <div className="modal-field">
                <label>Projektname *</label>
                <input 
                  type="text" 
                  value={newProject.projectName} 
                  onChange={(e) => setNewProject({ ...newProject, projectName: e.target.value })} 
                  required 
                  placeholder="z.B. Logistikhalle B"
                  style={{
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    padding: "10px 14px",
                    color: "var(--text-primary)",
                    width: "100%",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div className="modal-field">
                <label>Gewerbekunde *</label>
                <select 
                  value={newProject.clientId} 
                  onChange={(e) => setNewProject({ ...newProject, clientId: e.target.value })}
                  required
                  style={{
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    padding: "10px 14px",
                    color: "var(--text-primary)",
                    width: "100%",
                    boxSizing: "border-box"
                  }}
                >
                  <option value="" disabled>Bitte wählen...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: "16px" }}>
                <div className="modal-field" style={{ flex: 1 }}>
                  <label>Geplante Leistung (kWp) *</label>
                  <input 
                    type="number" 
                    min="1"
                    step="0.1"
                    value={newProject.plannedKwp || ""} 
                    onChange={(e) => setNewProject({ ...newProject, plannedKwp: Number(e.target.value) })} 
                    required 
                    style={{
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-md)",
                      padding: "10px 14px",
                      color: "var(--text-primary)",
                      width: "100%",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                <div className="modal-field" style={{ flex: 1 }}>
                  <label>Dachtyp</label>
                  <select 
                    value={newProject.roofType} 
                    onChange={(e) => setNewProject({ ...newProject, roofType: e.target.value as RoofType })}
                    style={{
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-md)",
                      padding: "10px 14px",
                      color: "var(--text-primary)",
                      width: "100%",
                      boxSizing: "border-box"
                    }}
                  >
                    {Object.entries(ROOF_TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: "10px" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
                  Abbrechen
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Speichere..." : "Projekt anlegen"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}
