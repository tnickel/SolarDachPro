import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import LandRegistryPage from "./pages/LandRegistry";
import MapView from "./pages/MapView";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
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
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/land-registry" element={<LandRegistryPage />} />
            <Route path="/map" element={<MapView />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
