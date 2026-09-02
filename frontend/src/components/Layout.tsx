import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/", label: "Dashboard", icon: "▦" },
    { to: "/agreements/new", label: "New Agreement", icon: "＋" },
    { to: "/agreements", label: "Agreements", icon: "▤" },
    { to: "/vehicles", label: "Vehicles", icon: "🚗" },
    ...(isAdmin ? [{ to: "/users", label: "Users", icon: "👥" }] : []),
  ];

  return (
    <div className="app-layout">
      {/* Mobile header */}
      <div className="mobile-header">
        <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰
        </button>
        <div className="mobile-brand">
          <div className="logo">KC</div>
          <div>
            <b>Kota Caz</b>
            <small>Self Drive</small>
          </div>
        </div>
        <div className="mobile-user">
          <span className="user-role-badge">{user?.role}</span>
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="logo">KC</div>
          <div>
            <b>Kota Caz</b>
            <small>Self Drive</small>
          </div>
        </div>
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {item.icon} {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="user-info">
            <div className="user-avatar">{user?.fullName?.charAt(0) || "U"}</div>
            <div className="user-details">
              <span className="user-name">{user?.fullName}</span>
              <span className="user-role-badge">{user?.role}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
          <div className="side-note">
            E-Agreement System<br />
            <small>MongoDB / React</small>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
