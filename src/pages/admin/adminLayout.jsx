import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Layers,
  Users,
  ShoppingBag, // NEW — Orders icon
  ChevronRight,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("ozzonToken");
    const stored = localStorage.getItem("ozzonUser");
    if (!token || !stored) {
      navigate("/login");
      return;
    }
    const parsed = JSON.parse(stored);
    if (parsed.role !== "admin") {
      navigate("/");
      return;
    }
    setUser(parsed);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("ozzonToken");
    localStorage.removeItem("ozzonUser");
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/admin" && location.pathname === "/admin") return true;
    if (path !== "/admin" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/products", icon: Package, label: "Products" },
    { to: "/admin/categories", icon: Layers, label: "Categories" },
    { to: "/admin/users", icon: Users, label: "Users" },
    { to: "/admin/orders", icon: ShoppingBag, label: "Orders" }, // NEW
  ];

  if (!user) return null;

  return (
    <div
      className="min-h-screen bg-[#0a0a0a]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111] border-r border-[#1f1f1f] flex flex-col transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-[#1f1f1f] px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl text-[#ffffff] font-black tracking-tighter">
              OZZ<span className="text-[#ed1b35]">ON</span>
            </span>
            <span
              style={{
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#ed1b35",
                background: "rgba(237,27,53,0.1)",
                padding: "2px 6px",
                borderRadius: "3px",
              }}
            >
              Admin
            </span>
          </div>
          <button
            className="lg:hidden text-zinc-400"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* User chip */}
        <div className="mx-3 mt-4 mb-2 rounded-lg bg-[#1a1a1a] border border-[#222] p-3 flex items-center gap-3">
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: "#ed1b35",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: "13px",
              color: "white",
              flexShrink: 0,
            }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                color: "white",
                fontSize: "13px",
                fontWeight: 700,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user.name}
            </div>
            <div
              style={{
                color: "#52525b",
                fontSize: "10px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user.email}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  borderRadius: "7px",
                  padding: "10px 12px",
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                  background: active ? "#ed1b35" : "transparent",
                  color: active ? "white" : "#71717a",
                  transition: "all 0.15s ease",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "#1a1a1a";
                    e.currentTarget.style.color = "white";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#71717a";
                  }
                }}
              >
                <Icon size={16} />
                {label}
                {active && (
                  <div
                    style={{
                      position: "absolute",
                      right: "10px",
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.5)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-[#1f1f1f] p-3 space-y-2">
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: "7px",
              padding: "10px 12px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#71717a",
              background: "#1a1a1a",
              textDecoration: "none",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#71717a";
            }}
          >
            <span>Back to Website</span>
            <ChevronRight size={14} />
          </Link>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              borderRadius: "7px",
              padding: "10px 12px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#71717a",
              background: "none",
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ef4444";
              e.currentTarget.style.background = "rgba(239,68,68,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#71717a";
              e.currentTarget.style.background = "none";
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between h-14 px-4 bg-[#111] border-b border-[#1f1f1f]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-zinc-400"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-black tracking-tighter text-white">
            OZZ<span className="text-[#ed1b35]">ON</span>
          </span>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#ed1b35",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: 900,
              color: "white",
            }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
