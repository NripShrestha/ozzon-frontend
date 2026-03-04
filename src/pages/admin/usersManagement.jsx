import { useState, useEffect } from "react";
import {
  Search,
  Users,
  AlertCircle,
  X,
  RefreshCw,
  Mail,
  Shield,
  User,
} from "lucide-react";

const BASE = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("ozzonToken")}`,
});

// NOTE: The backend doesn't expose a GET /api/users route yet.
// This component calls /api/dashboard to get total count and displays a placeholder
// table with the current logged-in user. Add a GET /api/users route (admin-protected)
// to your backend to enable full user listing.

export default function UsersManagement() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const currentUser = JSON.parse(localStorage.getItem("ozzonUser") || "{}");

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/api/dashboard`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load user stats");
      const data = await res.json();
      setStats(data.stats);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Seed with current admin user while full /api/users endpoint is pending
  const users = [
    {
      _id: currentUser._id,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      createdAt: new Date().toISOString(),
    },
  ];

  const filtered = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleBadge = (role) => {
    const map = {
      admin: { bg: "rgba(237,27,53,0.1)", color: "#ed1b35" },
      user: { bg: "rgba(59,130,246,0.1)", color: "#3b82f6" },
    };
    return map[role] || { bg: "#1f1f1f", color: "#71717a" };
  };

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
          padding: "0 32px",
          background: "#111",
          borderBottom: "1px solid #1f1f1f",
        }}
      >
        <div>
          <h1
            style={{
              color: "white",
              fontWeight: 900,
              fontSize: "20px",
              margin: 0,
            }}
          >
            Users
          </h1>
          <p style={{ color: "#52525b", fontSize: "11px", margin: 0 }}>
            {stats ? `${stats.totalUsers} registered users` : "Loading…"}
          </p>
        </div>
        <button
          onClick={fetchStats}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "7px",
            padding: "8px 14px",
            color: "#a1a1aa",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#ed1b35";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#2a2a2a";
            e.currentTarget.style.color = "#a1a1aa";
          }}
        >
          <RefreshCw
            size={13}
            style={{ animation: loading ? "spin 1s linear infinite" : "none" }}
          />
          Refresh
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </button>
      </header>

      <main style={{ padding: "32px" }}>
        {error && (
          <div
            style={{
              background: "rgba(237,27,53,0.08)",
              border: "1px solid rgba(237,27,53,0.3)",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#ed1b35",
              fontSize: "13px",
            }}
          >
            <AlertCircle size={14} /> {error}
            <button
              onClick={() => setError("")}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#ed1b35",
              }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Stats row */}
        {stats && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            {[
              {
                label: "Total Users",
                value: stats.totalUsers,
                icon: Users,
                color: "#3b82f6",
              },
              {
                label: "Total Products",
                value: stats.totalProducts,
                icon: null,
                color: "#22c55e",
              },
              {
                label: "Categories",
                value: stats.totalCategories,
                icon: null,
                color: "#f97316",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                style={{
                  background: "#111",
                  border: "1px solid #1f1f1f",
                  borderRadius: "10px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    color: "#52525b",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    marginBottom: "6px",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    color: color,
                    fontSize: "30px",
                    fontWeight: 900,
                    fontStyle: "italic",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Backend notice */}
        <div
          style={{
            background: "rgba(59,130,246,0.06)",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: "8px",
            padding: "14px 18px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
          }}
        >
          <Shield
            size={15}
            color="#3b82f6"
            style={{ flexShrink: 0, marginTop: "1px" }}
          />
          <div>
            <div
              style={{
                color: "#93c5fd",
                fontSize: "12px",
                fontWeight: 700,
                marginBottom: "3px",
              }}
            >
              Backend route needed
            </div>
            <div
              style={{ color: "#60a5fa", fontSize: "12px", lineHeight: 1.5 }}
            >
              To list all users, add a protected{" "}
              <code
                style={{
                  background: "rgba(59,130,246,0.15)",
                  padding: "1px 5px",
                  borderRadius: "3px",
                }}
              >
                GET /api/users
              </code>{" "}
              route to your backend. Currently showing your admin account from
              localStorage.
            </div>
          </div>
        </div>

        {/* Filters */}
        <div
          style={{
            background: "#111",
            border: "1px solid #1f1f1f",
            borderRadius: "10px",
            padding: "18px 20px",
            marginBottom: "16px",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "12px",
          }}
        >
          <div style={{ position: "relative" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#52525b",
              }}
            />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                background: "#0a0a0a",
                border: "1px solid #1f1f1f",
                borderRadius: "7px",
                padding: "9px 12px 9px 34px",
                color: "white",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#ed1b35";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#1f1f1f";
              }}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              background: "#0a0a0a",
              border: "1px solid #1f1f1f",
              borderRadius: "7px",
              padding: "9px 12px",
              color: "white",
              fontSize: "13px",
              outline: "none",
            }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        {/* Table */}
        <div
          style={{
            background: "#111",
            border: "1px solid #1f1f1f",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1f1f1f" }}>
                  {["User", "Email", "Role", "User ID"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 20px",
                        textAlign: "left",
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "#52525b",
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        padding: "48px",
                        textAlign: "center",
                        color: "#52525b",
                        fontSize: "13px",
                      }}
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u, i) => {
                    const badge = roleBadge(u.role);
                    return (
                      <tr
                        key={u._id}
                        style={{
                          borderBottom:
                            i < filtered.length - 1
                              ? "1px solid #1a1a1a"
                              : "none",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(255,255,255,0.02)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <td style={{ padding: "14px 20px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <div
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "50%",
                                background: "#ed1b35",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 900,
                                fontSize: "14px",
                                color: "white",
                                flexShrink: 0,
                              }}
                            >
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <span
                              style={{
                                color: "white",
                                fontWeight: 600,
                                fontSize: "13px",
                              }}
                            >
                              {u.name}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "7px",
                              color: "#a1a1aa",
                              fontSize: "13px",
                            }}
                          >
                            <Mail size={12} color="#52525b" />
                            {u.email}
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span
                            style={{
                              background: badge.bg,
                              color: badge.color,
                              borderRadius: "20px",
                              padding: "3px 10px",
                              fontSize: "11px",
                              fontWeight: 700,
                              textTransform: "capitalize",
                            }}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span
                            style={{
                              color: "#3f3f46",
                              fontSize: "11px",
                              fontFamily: "monospace",
                            }}
                          >
                            {u._id}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginTop: "14px", fontSize: "11px", color: "#3f3f46" }}>
          Showing {filtered.length} user(s) · Full listing requires{" "}
          <code style={{ color: "#52525b" }}>GET /api/users</code> backend route
        </div>
      </main>
    </>
  );
}
