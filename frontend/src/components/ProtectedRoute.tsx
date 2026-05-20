import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, token, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#020617",
        color: "#f8fafc",
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            border: "4px solid #f59e0b",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}></div>
          <p style={{ fontSize: "14px", color: "#94a3b8", letterSpacing: "0.05em" }}>Lade Benutzerprofil...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    // Redirect to login page, preserving the current location so we can redirect back
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="card" style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px",
        margin: "40px auto",
        maxWidth: "500px"
      }}>
        <div style={{
          marginBottom: "20px",
          borderRadius: "50%",
          backgroundColor: "rgba(220, 38, 38, 0.1)",
          padding: "20px",
          color: "#ef4444",
          border: "1px solid rgba(220, 38, 38, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#f8fafc", margin: "0 0 10px 0" }}>Zugriff verweigert</h1>
        <p style={{ color: "#94a3b8", lineHeight: "1.6", margin: "0 0 24px 0" }}>
          Diese Aktion oder dieser Bereich erfordert Administrator-Rechte. Bitte wende dich an den System-Administrator.
        </p>
        <button 
          onClick={() => window.history.back()}
          className="btn btn-secondary"
          style={{ width: "auto", padding: "10px 24px" }}
        >
          Zurueckgehen
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
