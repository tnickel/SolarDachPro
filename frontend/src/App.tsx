import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import LandRegistryPage from "./pages/LandRegistry";
import MapView from "./pages/MapView";
import { Login } from "./pages/Login";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ToastProvider } from "./context/ToastContext";
import "./index.css";

function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>☀️ SolarDach Pro</h1>
          <span>Solar-as-a-Service</span>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section">Navigation</div>
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <span className="nav-icon">📊</span>
            Dashboard
          </NavLink>
          <NavLink to="/clients" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <span className="nav-icon">🏢</span>
            Gewerbekunden
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <span className="nav-icon">☀️</span>
            Solarprojekte
          </NavLink>
          <NavLink to="/land-registry" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <span className="nav-icon">📑</span>
            Grundbuchprüfung
          </NavLink>

          <div className="sidebar-section">Visualisierung</div>
          <NavLink to="/map" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <span className="nav-icon">🗺️</span>
            Kartenansicht
          </NavLink>

          {user && (
            <>
              <div className="sidebar-section">Benutzer</div>
              <div style={{
                padding: "8px 14px",
                fontSize: "0.85rem",
                color: "var(--text-primary)",
                display: "flex",
                flexDirection: "column",
                gap: "4px"
              }}>
                <div style={{ fontWeight: "600", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{user.name}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ 
                    display: "inline-block", 
                    width: "6px", 
                    height: "6px", 
                    borderRadius: "50%", 
                    backgroundColor: user.role === "ADMIN" ? "var(--color-primary)" : "var(--color-success)" 
                  }}></span>
                  {user.role === "ADMIN" ? "Administrator" : "Betrachter"}
                </div>
              </div>
              <button 
                onClick={logout} 
                className="nav-link nav-logout-btn" 
                style={{ 
                  marginTop: "12px", 
                  border: "1px solid rgba(239, 68, 68, 0.2)", 
                  color: "var(--color-danger)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 14px"
                }}
              >
                <span className="nav-icon">🚪</span>
                Abmelden
              </button>
            </>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div style={{
          padding: "16px 20px",
          borderTop: "1px solid var(--border-color)",
          fontSize: "0.72rem",
          color: "var(--text-muted)",
        }}>
          <div>v0.1.0 · Portfolio Demo</div>
          <div style={{ marginTop: 2 }}>Climate-Tech Startup</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/land-registry" element={<ProtectedRoute><LandRegistryPage /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
