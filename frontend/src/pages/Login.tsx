import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Bitte E-Mail und Passwort eingeben.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Anmeldung fehlgeschlagen. Bitte Anmeldedaten pruefen.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (role: "admin" | "viewer") => {
    setError("");
    setSubmitting(true);
    const demoEmail = role === "admin" ? "admin@solardachpro.de" : "viewer@solardachpro.de";
    const demoPassword = role === "admin" ? "admin12345" : "viewer12345";

    setEmail(demoEmail);
    setPassword(demoPassword);

    try {
      await login(demoEmail, demoPassword);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Demo-Login fehlgeschlagen.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-card">
        <div className="login-header">
          <h1>SolarDach Pro</h1>
          <p>Solar-as-a-Service Management</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">E-Mail Adresse</label>
            <input
              id="email"
              type="email"
              placeholder="name@firma.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Passwort</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={submitting}
          >
            {submitting ? "Melde an..." : "Anmelden"}
          </button>
        </form>

        <div className="demo-login-divider">Demo-Zugang</div>

        <div className="demo-buttons-grid">
          <button
            type="button"
            className="btn btn-ghost btn-demo"
            onClick={() => handleDemoLogin("admin")}
            disabled={submitting}
          >
            Demo Admin
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-demo"
            onClick={() => handleDemoLogin("viewer")}
            disabled={submitting}
          >
            Demo Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
