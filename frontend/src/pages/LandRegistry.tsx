import { useEffect, useState } from "react";
import {
  type LandRegistry,
  type LegalReviewStatus,
  LEGAL_STATUS_LABELS,
} from "../types";
import { getLandRegistries, updateLandRegistryStatus } from "../api/client";

const ALL_LEGAL_STATUSES: LegalReviewStatus[] = [
  "PENDING",
  "IN_REVIEW",
  "APPROVED",
  "REJECTED",
  "REQUIRES_CLARIFICATION",
];

export default function LandRegistryPage() {
  const [entries, setEntries] = useState<LandRegistry[]>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal state
  const [editEntry, setEditEntry] = useState<LandRegistry | null>(null);
  const [modalStatus, setModalStatus] = useState<LegalReviewStatus>("PENDING");
  const [modalNotes, setModalNotes] = useState("");

  useEffect(() => {
    loadEntries();
  }, [filterStatus]);

  async function loadEntries() {
    setLoading(true);
    try {
      const res = await getLandRegistries(
        filterStatus ? { legalStatus: filterStatus } : undefined
      );
      setEntries(res.data);
    } finally {
      setLoading(false);
    }
  }

  function openStatusModal(entry: LandRegistry) {
    setEditEntry(entry);
    setModalStatus(entry.legalStatus);
    setModalNotes(entry.legalNotes || "");
  }

  async function handleStatusUpdate() {
    if (!editEntry) return;
    try {
      await updateLandRegistryStatus(editEntry.id, modalStatus, modalNotes || undefined);
      setEditEntry(null);
      loadEntries();
    } catch (err) {
      alert("Fehler: " + (err as Error).message);
    }
  }

  return (
    <>
      <div className="page-header">
        <h2>Grundbuchprüfung</h2>
        <p>Rechtliche Prüfung aller Flurstücke und Gemarkungen</p>
      </div>
      <div className="page-body">
        <div className="table-container">
          <div className="table-header">
            <h3>📑 {entries.length} Einträge</h3>
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
                {ALL_LEGAL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {LEGAL_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner" />
              Lade Grundbucheinträge...
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Gemarkung</th>
                  <th>Flurstück</th>
                  <th>Eigentümer</th>
                  <th>Projekt</th>
                  <th>Status</th>
                  <th>Letzte Prüfung</th>
                  <th>Aktion</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.gemarkung}</td>
                    <td style={{ fontFamily: "monospace" }}>{entry.flurstueck}</td>
                    <td>{entry.ownerName}</td>
                    <td>{entry.project?.projectName || "–"}</td>
                    <td>
                      <span
                        className={`badge badge-${entry.legalStatus.toLowerCase()}`}
                      >
                        <span className="badge-dot" />
                        {LEGAL_STATUS_LABELS[entry.legalStatus]}
                      </span>
                    </td>
                    <td>
                      {entry.lastCheckedAt
                        ? new Date(entry.lastCheckedAt).toLocaleDateString("de-DE")
                        : "–"}
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => openStatusModal(entry)}
                      >
                        Bearbeiten
                      </button>
                    </td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
                      Keine Einträge gefunden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Notes Preview */}
        {entries.some((e) => e.legalNotes) && (
          <div className="detail-panel" style={{ marginTop: 20 }}>
            <h3>📝 Letzte Prüfnotizen</h3>
            {entries
              .filter((e) => e.legalNotes)
              .slice(0, 5)
              .map((entry) => (
                <div className="detail-row" key={entry.id}>
                  <span className="detail-label">
                    {entry.gemarkung} / {entry.flurstueck}
                  </span>
                  <span
                    className="detail-value"
                    style={{ fontSize: "0.8rem", maxWidth: "60%", textAlign: "right" }}
                  >
                    {entry.legalNotes}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Status Edit Modal */}
      {editEntry && (
        <div className="modal-overlay" onClick={() => setEditEntry(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              Grundbuchstatus ändern
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: 20 }}>
              {editEntry.gemarkung} · Flurstück {editEntry.flurstueck}
            </p>

            <div className="modal-field">
              <label>Rechtlicher Status</label>
              <select
                value={modalStatus}
                onChange={(e) =>
                  setModalStatus(e.target.value as LegalReviewStatus)
                }
              >
                {ALL_LEGAL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {LEGAL_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-field">
              <label>Prüfnotizen</label>
              <textarea
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
                placeholder="z.B. Grundbuchauszug liegt vor, keine Belastungen..."
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setEditEntry(null)}
              >
                Abbrechen
              </button>
              <button className="btn btn-primary" onClick={handleStatusUpdate}>
                Status aktualisieren
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
