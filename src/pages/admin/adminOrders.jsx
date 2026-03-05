import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  Eye,
  Phone,
  MapPin,
  User,
  Building2,
  X,
  Filter,
} from "lucide-react";

const BASE = import.meta.env.VITE_API_URL;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("ozzonToken")}`,
});

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.1)",
    border: "rgba(96,165,250,0.3)",
    icon: CheckCircle2,
  },
  processing: {
    label: "Processing",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.1)",
    border: "rgba(167,139,250,0.3)",
    icon: RefreshCw,
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "#fb923c",
    bg: "rgba(251,146,60,0.1)",
    border: "rgba(251,146,60,0.3)",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.1)",
    border: "rgba(74,222,128,0.3)",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "#f87171",
    bg: "rgba(248,113,113,0.1)",
    border: "rgba(248,113,113,0.3)",
    icon: XCircle,
  },
};

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "processing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 10px",
        borderRadius: "20px",
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.color,
        fontSize: "11px",
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
};

// Portal dropdown — renders at document.body so it's never clipped by overflow:hidden parents
const StatusDropdown = ({ orderId, currentStatus, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });
  const btnRef = useRef(null);

  const openMenu = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.right + window.scrollX,
      width: rect.width,
    });
    setOpen(true);
  }, []);

  // Close on scroll so menu doesn't float away from button
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    return () => window.removeEventListener("scroll", close, true);
  }, [open]);

  const handleSelect = async (newStatus) => {
    if (newStatus === currentStatus) {
      setOpen(false);
      return;
    }
    setLoading(true);
    setOpen(false);
    try {
      const res = await fetch(`${BASE}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Update failed");
      onUpdate(orderId, newStatus);
    } catch (e) {
      alert("Failed to update status: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={open ? () => setOpen(false) : openMenu}
        disabled={loading}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: "6px 12px",
          background: "#1a1a1a",
          border: "1px solid #2a2a2a",
          borderRadius: "6px",
          color: "#a1a1aa",
          fontSize: "11px",
          fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          transition: "all 0.15s",
          opacity: loading ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.borderColor = "#ed1b35";
            e.currentTarget.style.color = "white";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#2a2a2a";
          e.currentTarget.style.color = "#a1a1aa";
        }}
      >
        {loading ? "Updating…" : "Update"}
        <ChevronDown
          size={11}
          style={{
            transition: "transform 0.15s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {open &&
        createPortal(
          <>
            {/* Invisible backdrop to catch outside clicks */}
            <div
              style={{ position: "fixed", inset: 0, zIndex: 9998 }}
              onClick={() => setOpen(false)}
            />
            {/* The menu itself, anchored to button via getBoundingClientRect */}
            <div
              style={{
                position: "absolute",
                top: menuPos.top,
                left: menuPos.left,
                transform: "translateX(-100%)",
                zIndex: 9999,
                background: "#1a1a1a",
                border: "1px solid #2a2a2a",
                borderRadius: "10px",
                overflow: "hidden",
                minWidth: "170px",
                boxShadow:
                  "0 16px 48px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4)",
                animation: "dropIn 0.12s ease-out",
              }}
            >
              {STATUS_OPTIONS.map((s) => {
                const cfg = STATUS_CONFIG[s];
                const active = s === currentStatus;
                return (
                  <button
                    key={s}
                    onClick={() => handleSelect(s)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      width: "100%",
                      padding: "10px 14px",
                      background: active ? "rgba(237,27,53,0.08)" : "none",
                      border: "none",
                      borderLeft: active
                        ? "2px solid #ed1b35"
                        : "2px solid transparent",
                      color: active ? cfg.color : "#a1a1aa",
                      fontSize: "12px",
                      fontWeight: active ? 700 : 500,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.1s, color 0.1s",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.04)";
                        e.currentTarget.style.color = "white";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "none";
                        e.currentTarget.style.color = "#a1a1aa";
                      }
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: cfg.color,
                        flexShrink: 0,
                        boxShadow: active ? `0 0 6px ${cfg.color}` : "none",
                      }}
                    />
                    {cfg.label}
                    {active && (
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: "10px",
                          color: "#ed1b35",
                          fontWeight: 800,
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>,
          document.body,
        )}

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateX(-100%) translateY(-6px); }
          to   { opacity: 1; transform: translateX(-100%) translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

// Order detail modal
const OrderModal = ({ order, onClose, onUpdate }) => {
  if (!order) return null;
  const items = order.orderItems || order.items || [];
  const shipping = order.shippingAddress || {};
  const status = order.orderStatus || order.status || "pending";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#111",
          border: "1px solid #2a2a2a",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "560px",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid #1f1f1f",
          }}
        >
          <div>
            <p
              style={{
                color: "#ed1b35",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                marginBottom: "2px",
              }}
            >
              Order Details
            </p>
            <h2
              style={{
                color: "white",
                fontWeight: 900,
                fontSize: "16px",
                margin: 0,
              }}
            >
              #{String(order._id).slice(-8).toUpperCase()}
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <StatusBadge status={status} />
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "#52525b",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {/* Info grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            {/* Delivery */}
            <div
              style={{
                background: "#1a1a1a",
                border: "1px solid #2a2a2a",
                borderRadius: "10px",
                padding: "14px",
              }}
            >
              <p
                style={{
                  color: "#ed1b35",
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                }}
              >
                Delivery Info
              </p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {shipping.name && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <User size={11} color="#52525b" />
                    <span style={{ color: "#d4d4d8", fontSize: "12px" }}>
                      {shipping.name}
                    </span>
                  </div>
                )}
                {shipping.phone && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Phone size={11} color="#52525b" />
                    <span style={{ color: "#d4d4d8", fontSize: "12px" }}>
                      {shipping.phone}
                    </span>
                  </div>
                )}
                {shipping.address && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "6px",
                    }}
                  >
                    <MapPin
                      size={11}
                      color="#52525b"
                      style={{ marginTop: "2px" }}
                    />
                    <span style={{ color: "#d4d4d8", fontSize: "12px" }}>
                      {shipping.address}
                    </span>
                  </div>
                )}
                {shipping.city && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Building2 size={11} color="#52525b" />
                    <span style={{ color: "#d4d4d8", fontSize: "12px" }}>
                      {shipping.city}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div
              style={{
                background: "#1a1a1a",
                border: "1px solid #2a2a2a",
                borderRadius: "10px",
                padding: "14px",
              }}
            >
              <p
                style={{
                  color: "#ed1b35",
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                }}
              >
                Payment Info
              </p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#71717a", fontSize: "12px" }}>
                    Method
                  </span>
                  <span
                    style={{
                      color: "#d4d4d8",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    COD
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#71717a", fontSize: "12px" }}>
                    Status
                  </span>
                  <span
                    style={{
                      color: status === "delivered" ? "#4ade80" : "#f59e0b",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    {status === "delivered" ? "Paid" : "Unpaid"}
                  </span>
                </div>
                {order.totalPrice > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderTop: "1px solid #2a2a2a",
                      paddingTop: "8px",
                      marginTop: "4px",
                    }}
                  >
                    <span
                      style={{
                        color: "white",
                        fontSize: "13px",
                        fontWeight: 800,
                      }}
                    >
                      Total
                    </span>
                    <span
                      style={{
                        color: "#ed1b35",
                        fontSize: "13px",
                        fontWeight: 900,
                      }}
                    >
                      Rs. {order.totalPrice.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          <div
            style={{
              background: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: "10px",
              overflow: "hidden",
              marginBottom: "16px",
            }}
          >
            <p
              style={{
                color: "#ed1b35",
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                padding: "12px 14px",
                borderBottom: "1px solid #2a2a2a",
              }}
            >
              Order Items
            </p>
            {items.map((item, idx) => {
              const name = item.name || item.product?.name || "Product";
              const price = item.price || item.product?.price;
              const imgUrl = item.image || item.product?.image?.url;

              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 14px",
                    borderBottom:
                      idx < items.length - 1 ? "1px solid #1f1f1f" : "none",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "6px",
                      overflow: "hidden",
                      background: "#222",
                      flexShrink: 0,
                    }}
                  >
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Package size={16} color="#52525b" />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        color: "white",
                        fontSize: "12px",
                        fontWeight: 700,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        margin: 0,
                      }}
                    >
                      {name}
                    </p>
                    <p
                      style={{ color: "#52525b", fontSize: "11px", margin: 0 }}
                    >
                      Qty: {item.quantity || 1}
                    </p>
                  </div>
                  {price > 0 && (
                    <span
                      style={{
                        color: "#a1a1aa",
                        fontSize: "12px",
                        flexShrink: 0,
                      }}
                    >
                      Rs. {(price * (item.quantity || 1)).toLocaleString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Update Status */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: "10px",
              padding: "14px",
            }}
          >
            <div>
              <p
                style={{
                  color: "#71717a",
                  fontSize: "11px",
                  marginBottom: "6px",
                  margin: "0 0 6px",
                }}
              >
                Current Status
              </p>
              <StatusBadge status={status} />
            </div>
            <StatusDropdown
              orderId={order._id}
              currentStatus={status}
              onUpdate={(id, newStatus) => {
                onUpdate(id, newStatus);
                onClose();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/api/orders`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o._id === orderId
          ? { ...o, orderStatus: newStatus, status: newStatus }
          : o,
      ),
    );
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-NP", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((o) => (o.orderStatus || o.status) === filter);

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = orders.filter((o) => (o.orderStatus || o.status) === s).length;
    return acc;
  }, {});

  return (
    <>
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={handleStatusUpdate}
        />
      )}

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
            Orders
          </h1>
          <p style={{ color: "#52525b", fontSize: "11px", margin: 0 }}>
            {orders.length} total orders
          </p>
        </div>
        <button
          onClick={fetchOrders}
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
            {error}
          </div>
        )}

        {/* Stat chips */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "24px",
          }}
        >
          <button
            onClick={() => setFilter("all")}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: `1px solid ${filter === "all" ? "#ed1b35" : "#2a2a2a"}`,
              background: filter === "all" ? "rgba(237,27,53,0.1)" : "#1a1a1a",
              color: filter === "all" ? "#ed1b35" : "#71717a",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Filter size={11} />
            All
            <span
              style={{
                background: filter === "all" ? "#ed1b35" : "#2a2a2a",
                color: "white",
                borderRadius: "10px",
                padding: "1px 6px",
                fontSize: "10px",
              }}
            >
              {orders.length}
            </span>
          </button>

          {STATUS_OPTIONS.map((s) => {
            const cfg = STATUS_CONFIG[s];
            const active = filter === s;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  border: `1px solid ${active ? cfg.color : "#2a2a2a"}`,
                  background: active ? cfg.bg : "#1a1a1a",
                  color: active ? cfg.color : "#71717a",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {cfg.label}
                <span
                  style={{
                    background: active ? cfg.color : "#2a2a2a",
                    color: active ? "#000" : "white",
                    borderRadius: "10px",
                    padding: "1px 6px",
                    fontSize: "10px",
                    fontWeight: 800,
                  }}
                >
                  {counts[s] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Orders Table */}
        <div
          style={{
            background: "#111",
            border: "1px solid #1f1f1f",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <div
              style={{
                padding: "48px",
                textAlign: "center",
                color: "#52525b",
                fontSize: "13px",
              }}
            >
              Loading orders…
            </div>
          ) : filteredOrders.length === 0 ? (
            <div
              style={{
                padding: "48px",
                textAlign: "center",
                color: "#52525b",
                fontSize: "13px",
              }}
            >
              No orders found.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1f1f1f" }}>
                    {[
                      "Order ID",
                      "Customer",
                      "Items",
                      "Total",
                      "Status",
                      "Date",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "#52525b",
                          textTransform: "uppercase",
                          letterSpacing: "0.15em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, i) => {
                    const status =
                      order.orderStatus || order.status || "pending";
                    const shipping = order.shippingAddress || {};
                    const items = order.orderItems || order.items || [];
                    const itemCount = items.reduce(
                      (s, item) => s + (item.quantity || 1),
                      0,
                    );

                    return (
                      <tr
                        key={order._id}
                        style={{
                          borderBottom:
                            i < filteredOrders.length - 1
                              ? "1px solid #1a1a1a"
                              : "none",
                          transition: "background 0.1s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(255,255,255,0.02)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              color: "white",
                              fontWeight: 800,
                              fontSize: "12px",
                              fontFamily: "monospace",
                            }}
                          >
                            #{String(order._id).slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div>
                            <p
                              style={{
                                color: "white",
                                fontSize: "12px",
                                fontWeight: 600,
                                margin: 0,
                              }}
                            >
                              {shipping.name || "—"}
                            </p>
                            {shipping.phone && (
                              <p
                                style={{
                                  color: "#52525b",
                                  fontSize: "11px",
                                  margin: 0,
                                }}
                              >
                                {shipping.phone}
                              </p>
                            )}
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "14px 16px",
                            color: "#a1a1aa",
                            fontSize: "12px",
                          }}
                        >
                          {itemCount} item{itemCount !== 1 ? "s" : ""}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              color:
                                order.totalPrice > 0 ? "#ed1b35" : "#52525b",
                              fontWeight: 800,
                              fontSize: "13px",
                            }}
                          >
                            {order.totalPrice > 0
                              ? `Rs. ${order.totalPrice.toLocaleString()}`
                              : "—"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <StatusBadge status={status} />
                        </td>
                        <td
                          style={{
                            padding: "14px 16px",
                            color: "#71717a",
                            fontSize: "11px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatDate(order.createdAt)}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <button
                              onClick={() => setSelectedOrder(order)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "6px 12px",
                                background: "#1a1a1a",
                                border: "1px solid #2a2a2a",
                                borderRadius: "6px",
                                color: "#a1a1aa",
                                fontSize: "11px",
                                fontWeight: 700,
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
                              <Eye size={11} />
                              View
                            </button>
                            <StatusDropdown
                              orderId={order._id}
                              currentStatus={status}
                              onUpdate={handleStatusUpdate}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
