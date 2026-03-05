import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import { getAuth, authFetch } from "../auth/useAuth";

const BASE_URL = import.meta.env.VITE_API_URL;

const STATUS_CONFIG = {
  pending: {
    label: "Pending Confirmation",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/30",
    icon: Clock,
    dot: "bg-yellow-400",
  },
  confirmed: {
    label: "Confirmed",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/30",
    icon: CheckCircle2,
    dot: "bg-blue-400",
  },
  processing: {
    label: "Processing",
    color: "text-purple-400",
    bg: "bg-purple-400/10 border-purple-400/30",
    icon: RefreshCw,
    dot: "bg-purple-400",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "text-orange-400",
    bg: "bg-orange-400/10 border-orange-400/30",
    icon: Truck,
    dot: "bg-orange-400",
  },
  delivered: {
    label: "Delivered",
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/30",
    icon: CheckCircle2,
    dot: "bg-green-400",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/30",
    icon: XCircle,
    dot: "bg-red-400",
  },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${cfg.bg} ${cfg.color}`}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
};

const OrderSkeleton = () => (
  <div className="animate-pulse bg-zinc-900 border border-zinc-800 rounded-xl p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="space-y-2">
        <div className="h-3 w-28 bg-zinc-700 rounded" />
        <div className="h-4 w-20 bg-zinc-800 rounded" />
      </div>
      <div className="h-6 w-24 bg-zinc-700 rounded-full" />
    </div>
    <div className="h-3 w-full bg-zinc-800 rounded mb-2" />
    <div className="h-3 w-2/3 bg-zinc-800 rounded" />
  </div>
);

export default function OrdersPage() {
  const navigate = useNavigate();
  const auth = getAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!auth) {
      navigate("/login");
      return;
    }
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`${BASE_URL}/api/orders/my`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-NP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div
      className="bg-[#1a1a1a] text-white min-h-screen"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* TOP BAR */}
      <div className="bg-zinc-950 border-b border-zinc-800/60 py-4">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-zinc-400 font-semibold hover:text-[#ed1b35] transition-colors text-sm uppercase tracking-widest"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </button>
          <div className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-600">
            <Link to="/" className="hover:text-[#ed1b35] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-zinc-400">My Orders</span>
          </div>
        </div>
      </div>

      <section className="py-14">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          {/* Heading */}
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ed1b35] mb-3">
                Order History
              </p>
              <h1 className="text-4xl md:text-5xl font-black leading-none">
                My <span className="text-[#ed1b35]">Orders</span>
              </h1>
            </div>
            <button
              onClick={loadOrders}
              disabled={loading}
              className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-white uppercase tracking-widest font-bold transition-colors disabled:opacity-40 border border-zinc-700 hover:border-zinc-500 px-4 py-2 rounded-lg"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-5 py-4 mb-8">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <OrderSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && orders.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="h-20 w-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                <ShoppingBag className="h-9 w-9 text-zinc-600" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">
                No orders yet
              </h3>
              <p className="text-zinc-500 text-sm mb-8">
                Place your first order to get started.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#ed1b35] text-white font-bold rounded-lg hover:bg-[#c81529] transition-colors shadow-lg shadow-[#ed1b35]/20 uppercase tracking-widest text-sm"
              >
                Shop Now
              </Link>
            </div>
          )}

          {/* Orders List */}
          {!loading && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = order.orderStatus || order.status || "pending";
                const itemCount = (
                  order.orderItems ||
                  order.items ||
                  []
                ).reduce((s, i) => s + (i.quantity || 1), 0);

                return (
                  <Link
                    key={order._id}
                    to={`/orders/${order._id}`}
                    className="block bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-6 transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 mb-1">
                          Order ID
                        </p>
                        <p className="text-white font-black text-sm font-mono">
                          #{String(order._id).slice(-8).toUpperCase()}
                        </p>
                      </div>
                      <StatusBadge status={status} />
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mb-3">
                      <div>
                        <span className="text-zinc-500">Date: </span>
                        <span className="text-zinc-300 font-medium">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Items: </span>
                        <span className="text-zinc-300 font-medium">
                          {itemCount}
                        </span>
                      </div>
                      {order.totalPrice > 0 && (
                        <div>
                          <span className="text-zinc-500">Total: </span>
                          <span className="text-[#ed1b35] font-bold">
                            Rs. {order.totalPrice.toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-zinc-500">Payment: </span>
                        <span className="text-zinc-300 font-medium">
                          Cash on Delivery
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[#ed1b35] text-xs font-bold uppercase tracking-widest group-hover:gap-3 transition-all">
                      View Details
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <footer className="py-12 border-t border-zinc-900 bg-black text-center mt-8">
        <p className="text-[9px] text-zinc-700 uppercase tracking-[0.6em]">
          OZZON Industrial Excellence 2026
        </p>
      </footer>
    </div>
  );
}
