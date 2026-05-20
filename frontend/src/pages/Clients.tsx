import { useEffect, useState } from "react";
import { type CommercialClient } from "../types";
import { getClients } from "../api/client";

export default function Clients() {
  const [clients, setClients] = useState<CommercialClient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients(query?: string) {
    setLoading(true);
    try {
      const res = await getClients(query);
      setClients(res.data);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadClients(search || undefined);
  }

  return (
    <>
      <div className="page-header">
        <h2>Gewerbekunden</h2>
        <p>Alle Firmenkunden mit Dachpachtverträgen</p>
      </div>
      <div className="page-body">
        <div className="table-container">
          <div className="table-header">
            <h3>🏢 {clients.length} Kunden</h3>
            <form className="table-search" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Suche nach Firma, Kontakt, E-Mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Suchen
              </button>
            </form>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner" />
              Lade Kunden...
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Firma</th>
                  <th>Ansprechpartner</th>
                  <th>E-Mail</th>
                  <th>Stadt</th>
                  <th>Steuernr.</th>
                  <th>Projekte</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td>{client.companyName}</td>
                    <td>{client.contactPerson}</td>
                    <td style={{ color: "var(--color-primary-light)" }}>{client.email}</td>
                    <td>{client.city}</td>
                    <td>{client.taxId || "–"}</td>
                    <td>
                      <span
                        className="badge badge-planning"
                        style={{ cursor: "default" }}
                      >
                        {client.projects?.length || 0} Projekte
                      </span>
                    </td>
                  </tr>
                ))}
                {clients.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>
                      Keine Kunden gefunden.
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
