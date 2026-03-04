import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Activity,
  Package,
  Layers,
  Users,
  RefreshCw,
} from "lucide-react";

const BASE = import.meta.env.VITE_API_URL;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("ozzonToken")}`,
});

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("ozzonUser") || "{}");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [dashRes, catRes] = await Promise.all([
        fetch(`${BASE}/api/dashboard`, { headers: authHeaders() }),
        fetch(`${BASE}/api/categories`),
      ]);
      if (!dashRes.ok) throw new Error("Failed to load dashboard");
      const dash = await dashRes.json();
      const cats = await catRes.json();
      setStats(dash.stats);
      setRecentProducts(dash.recentProducts || []);
      setCategories(cats || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statCards = stats
    ? [
        {
          name: "Total Products",
          value: stats.totalProducts,
          icon: Package,
          change: "Live",
        },
        {
          name: "Categories",
          value: stats.totalCategories,
          icon: Layers,
          change: "Live",
        },
        {
          name: "Total Users",
          value: stats.totalUsers,
          icon: Users,
          change: "Live",
        },
      ]
    : [];

  return (
    <>
      {/* Header */}
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
            Dashboard
          </h1>
          <p style={{ color: "#52525b", fontSize: "11px", margin: 0 }}>
            Welcome back, {user.name}
          </p>
        </div>
        <button
          onClick={fetchData}
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
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </header>

      <main style={{ padding: "32px" }}>
        {error && (
          <div
            style={{
              background: "rgba(237,27,53,0.08)",
              border: "1px solid rgba(237,27,53,0.3)",
              borderRadius: "8px",
              padding: "14px 18px",
              marginBottom: "24px",
              color: "#ed1b35",
              fontSize: "13px",
            }}
          >
            {error} — Is your backend running on port 5000?
          </div>
        )}

        {/* Stat Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginBottom: "32px",
          }}
        >
          {loading
            ? [1, 2, 3].map((i) => <SkeletonCard key={i} />)
            : statCards.map((stat) => (
                <div
                  key={stat.name}
                  style={{
                    background: "#111",
                    border: "1px solid #1f1f1f",
                    borderRadius: "10px",
                    padding: "24px",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(237,27,53,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#1f1f1f";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "10px",
                        background: "rgba(237,27,53,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <stat.icon size={20} color="#ed1b35" />
                    </div>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "#22c55e",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <div
                    style={{
                      color: "#71717a",
                      fontSize: "11px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.2em",
                      marginBottom: "4px",
                    }}
                  >
                    {stat.name}
                  </div>
                  <div
                    style={{
                      color: "white",
                      fontSize: "34px",
                      fontWeight: 900,
                      letterSpacing: "-0.02em",
                      fontStyle: "italic",
                    }}
                  >
                    {stat.value}
                  </div>
                </div>
              ))}
        </div>

        {/* Charts Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "32px",
          }}
        >
          {/* Bar chart placeholder */}
          <div
            style={{
              background: "#111",
              border: "1px solid #1f1f1f",
              borderRadius: "10px",
              padding: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <h2
                style={{
                  color: "white",
                  fontWeight: 800,
                  fontSize: "15px",
                  margin: 0,
                }}
              >
                Sales Overview
              </h2>
              <Activity size={16} color="#52525b" />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "6px",
                height: "140px",
              }}
            >
              {[65, 78, 90, 81, 56, 95, 88, 75, 92, 85, 79, 88].map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                  }}
                >
                  <div
                    style={{
                      background:
                        "linear-gradient(to top, #ed1b35, rgba(237,27,53,0.4))",
                      borderRadius: "3px 3px 0 0",
                      height: `${h}%`,
                      transition: "opacity 0.2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.7";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                  />
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "8px",
              }}
            >
              {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"].map(
                (m) => (
                  <span
                    key={m}
                    style={{
                      fontSize: "9px",
                      color: "#3f3f46",
                      fontWeight: 600,
                      flex: 1,
                      textAlign: "center",
                    }}
                  >
                    {m}
                  </span>
                ),
              )}
            </div>
          </div>

          {/* Category distribution */}
          <div
            style={{
              background: "#111",
              border: "1px solid #1f1f1f",
              borderRadius: "10px",
              padding: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <h2
                style={{
                  color: "white",
                  fontWeight: 800,
                  fontSize: "15px",
                  margin: 0,
                }}
              >
                Category Distribution
              </h2>
              <TrendingUp size={16} color="#52525b" />
            </div>
            {loading ? (
              <div style={{ color: "#52525b", fontSize: "13px" }}>Loading…</div>
            ) : categories.length === 0 ? (
              <div style={{ color: "#52525b", fontSize: "13px" }}>
                No categories yet.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {categories.slice(0, 5).map((cat, i) => {
                  const pct = [42, 28, 18, 8, 4][i] || 5;
                  return (
                    <div key={cat._id}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "5px",
                        }}
                      >
                        <span
                          style={{
                            color: "#d4d4d8",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          {cat.name}
                        </span>
                        <span
                          style={{
                            color: "#ed1b35",
                            fontSize: "12px",
                            fontWeight: 700,
                          }}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: "4px",
                          background: "#1f1f1f",
                          borderRadius: "2px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background:
                              "linear-gradient(to right, #ed1b35, #c81529)",
                            borderRadius: "2px",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Products Table */}
        <div
          style={{
            background: "#111",
            border: "1px solid #1f1f1f",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 24px",
              borderBottom: "1px solid #1f1f1f",
            }}
          >
            <h2
              style={{
                color: "white",
                fontWeight: 800,
                fontSize: "15px",
                margin: 0,
              }}
            >
              Recent Products
            </h2>
            <Link
              to="/admin/products"
              style={{
                color: "#ed1b35",
                fontSize: "12px",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <div
              style={{
                padding: "48px",
                textAlign: "center",
                color: "#52525b",
                fontSize: "13px",
              }}
            >
              Loading…
            </div>
          ) : recentProducts.length === 0 ? (
            <div
              style={{
                padding: "48px",
                textAlign: "center",
                color: "#52525b",
                fontSize: "13px",
              }}
            >
              No products yet.{" "}
              <Link to="/admin/products/new" style={{ color: "#ed1b35" }}>
                Add one →
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1f1f1f" }}>
                    {["Product", "Price", "Stock", "Status"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 24px",
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
                  {recentProducts.map((p, i) => (
                    <tr
                      key={p._id}
                      style={{
                        borderBottom:
                          i < recentProducts.length - 1
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
                      <td style={{ padding: "14px 24px" }}>
                        <span
                          style={{
                            color: "white",
                            fontWeight: 600,
                            fontSize: "13px",
                          }}
                        >
                          {p.name}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "14px 24px",
                          color: "#a1a1aa",
                          fontSize: "13px",
                        }}
                      >
                        {p.price ? `₹${p.price.toLocaleString()}` : "—"}
                      </td>
                      <td
                        style={{
                          padding: "14px 24px",
                          color: "#a1a1aa",
                          fontSize: "13px",
                        }}
                      >
                        {p.stock ?? "—"}
                      </td>
                      <td style={{ padding: "14px 24px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            background: "rgba(34,197,94,0.1)",
                            color: "#22c55e",
                            borderRadius: "20px",
                            padding: "3px 10px",
                            fontSize: "11px",
                            fontWeight: 700,
                          }}
                        >
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

const SkeletonCard = () => (
  <div
    style={{
      background: "#111",
      border: "1px solid #1f1f1f",
      borderRadius: "10px",
      padding: "24px",
    }}
  >
    <div
      style={{
        width: "44px",
        height: "44px",
        borderRadius: "10px",
        background: "#1f1f1f",
        marginBottom: "16px",
      }}
    />
    <div
      style={{
        width: "60%",
        height: "10px",
        borderRadius: "4px",
        background: "#1f1f1f",
        marginBottom: "8px",
      }}
    />
    <div
      style={{
        width: "40%",
        height: "28px",
        borderRadius: "4px",
        background: "#1f1f1f",
      }}
    />
  </div>
);
