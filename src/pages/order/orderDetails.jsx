import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  RefreshCw,
  AlertCircle,
  User,
  Building2,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { getAuth, authFetch } from "../auth/useAuth";

const BASE_URL = import.meta.env.VITE_API_URL;

const STATUS_CONFIG = {
  pending: {
    label: "Pending Confirmation",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/20",
    icon: Clock,
    desc: "Your order is awaiting confirmation. Our team will call you shortly.",
  },
  confirmed: {
    label: "Confirmed",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
    icon: CheckCircle2,
    desc: "Your order has been confirmed and will be prepared soon.",
  },
  processing: {
    label: "Processing",
    color: "text-purple-400",
    bg: "bg-purple-400/10 border-purple-400/20",
    icon: RefreshCw,
    desc: "Your order is being prepared for delivery.",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "text-orange-400",
    bg: "bg-orange-400/10 border-orange-400/20",
    icon: Truck,
    desc: "Your order is on its way! Expected delivery soon.",
  },
  delivered: {
    label: "Delivered",
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
    icon: CheckCircle2,
    desc: "Your order has been delivered successfully. Thank you!",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/20",
    icon: XCircle,
    desc: "This order has been cancelled.",
  },
};

const STEPS = [
  "pending",
  "confirmed",
  "processing",
  "out_for_delivery",
  "delivered",
];

const StatusTracker = ({ status }) => {
  if (status === "cancelled") return null;
  const currentIdx = STEPS.indexOf(status);

  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-2">
      {STEPS.map((step, idx) => {
        const cfg = STATUS_CONFIG[step];
        const done = idx <= currentIdx;
        const active = idx === currentIdx;

        return (
          <div key={step} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  done
                    ? "bg-[#ed1b35] border-[#ed1b35]"
                    : "bg-zinc-800 border-zinc-700"
                } ${active ? "ring-2 ring-[#ed1b35]/30 ring-offset-2 ring-offset-zinc-900" : ""}`}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4 text-white" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-zinc-600" />
                )}
              </div>
              <span
                className={`text-[9px] font-bold uppercase tracking-wide whitespace-nowrap ${
                  done ? "text-zinc-300" : "text-zinc-600"
                } ${active ? "text-white" : ""}`}
              >
                {cfg.label.split(" ")[0]}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-8 md:w-12 mt-[-18px] mx-1 rounded ${
                  idx < currentIdx ? "bg-[#ed1b35]" : "bg-zinc-700"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Cancel confirmation modal
const CancelModal = ({ onConfirm, onClose, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 max-w-sm w-full text-center">
      <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
        <XCircle className="h-8 w-8 text-red-400" />
      </div>
      <h3 className="text-xl font-black text-white mb-2">Cancel Order?</h3>
      <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
        Are you sure you want to cancel this order? This action cannot be
        undone.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 py-3 border border-zinc-700 text-zinc-400 font-bold rounded-lg hover:border-zinc-500 hover:text-white transition-colors text-sm"
        >
          Keep Order
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Yes, Cancel
        </button>
      </div>
    </div>
  </div>
);

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (!auth) {
      navigate("/login");
      return;
    }
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`${BASE_URL}/api/orders/${id}`);
      if (!res.ok) throw new Error("Order not found");
      const data = await res.json();
      setOrder(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      const res = await authFetch(`${BASE_URL}/api/orders/${id}/cancel`, {
        method: "PUT",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cannot cancel order");
      setOrder((prev) => ({
        ...prev,
        orderStatus: "cancelled",
        status: "cancelled",
      }));
      setShowCancelModal(false);
    } catch (e) {
      setError(e.message);
      setShowCancelModal(false);
    } finally {
      setCancelLoading(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-NP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const status = order?.orderStatus || order?.status || "pending";
  const canCancel = status === "pending";
  const items = order?.orderItems || order?.items || [];
  const shipping = order?.shippingAddress || {};

  return (
    <div
      className="bg-[#1a1a1a] text-white min-h-screen"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {showCancelModal && (
        <CancelModal
          onConfirm={handleCancel}
          onClose={() => setShowCancelModal(false)}
          loading={cancelLoading}
        />
      )}

      {/* TOP BAR */}
      <div className="bg-zinc-950 border-b border-zinc-800/60 py-4">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={() => navigate("/orders")}
            className="inline-flex items-center gap-2 text-zinc-400 font-semibold hover:text-[#ed1b35] transition-colors text-sm uppercase tracking-widest"
          >
            <ArrowLeft className="h-4 w-4" />
            My Orders
          </button>
          <div className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-600">
            <Link to="/" className="hover:text-[#ed1b35] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              to="/orders"
              className="hover:text-[#ed1b35] transition-colors"
            >
              Orders
            </Link>
            <span>/</span>
            <span className="text-zinc-400">Detail</span>
          </div>
        </div>
      </div>

      <section className="py-14">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-[#ed1b35] animate-spin" />
            </div>
          )}

          {error && !loading && (
            <div className="flex items-center gap-3 text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-5 py-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && order && (
            <>
              {/* Header */}
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ed1b35] mb-2">
                    Order Details
                  </p>
                  <h1 className="text-3xl font-black">
                    #
                    <span className="text-[#ed1b35]">
                      {String(order._id).slice(-8).toUpperCase()}
                    </span>
                  </h1>
                  <p className="text-zinc-500 text-xs mt-1">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                {canCancel && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-red-900/50 text-red-400 hover:border-red-400 hover:bg-red-400/5 rounded-lg transition-colors text-sm font-bold uppercase tracking-widest"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel Order
                  </button>
                )}
              </div>

              {/* Status Card */}
              {STATUS_CONFIG[status] && (
                <div
                  className={`border rounded-xl p-5 mb-6 ${STATUS_CONFIG[status].bg}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {(() => {
                      const Icon = STATUS_CONFIG[status].icon;
                      return (
                        <Icon
                          className={`h-5 w-5 ${STATUS_CONFIG[status].color}`}
                        />
                      );
                    })()}
                    <span
                      className={`font-black text-sm ${STATUS_CONFIG[status].color}`}
                    >
                      {STATUS_CONFIG[status].label}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-xs leading-relaxed mb-4">
                    {STATUS_CONFIG[status].desc}
                  </p>
                  <StatusTracker status={status} />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Delivery Info */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4 flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-[#ed1b35]" />
                    Delivery Info
                  </h3>
                  <div className="space-y-3 text-sm">
                    {shipping.name && (
                      <div className="flex items-center gap-2 text-zinc-300">
                        <User className="h-3.5 w-3.5 text-zinc-600 flex-shrink-0" />
                        {shipping.name}
                      </div>
                    )}
                    {shipping.phone && (
                      <div className="flex items-center gap-2 text-zinc-300">
                        <Phone className="h-3.5 w-3.5 text-zinc-600 flex-shrink-0" />
                        {shipping.phone}
                      </div>
                    )}
                    {shipping.address && (
                      <div className="flex items-start gap-2 text-zinc-300">
                        <MapPin className="h-3.5 w-3.5 text-zinc-600 flex-shrink-0 mt-0.5" />
                        {shipping.address}
                      </div>
                    )}
                    {shipping.city && (
                      <div className="flex items-center gap-2 text-zinc-300">
                        <Building2 className="h-3.5 w-3.5 text-zinc-600 flex-shrink-0" />
                        {shipping.city}
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Info */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4 flex items-center gap-2">
                    <ShoppingBag className="h-3.5 w-3.5 text-[#ed1b35]" />
                    Order Info
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Payment</span>
                      <span className="text-zinc-300 font-medium">
                        Cash on Delivery
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Payment Status</span>
                      <span
                        className={`font-bold text-xs ${
                          status === "delivered"
                            ? "text-green-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {status === "delivered" ? "Paid" : "Unpaid"}
                      </span>
                    </div>
                    {order.totalPrice > 0 && (
                      <div className="flex justify-between border-t border-zinc-800 pt-3">
                        <span className="text-white font-black">Total</span>
                        <span className="text-[#ed1b35] font-black">
                          Rs. {order.totalPrice.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-800">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <Package className="h-3.5 w-3.5 text-[#ed1b35]" />
                    Order Items
                  </h3>
                </div>
                <div className="divide-y divide-zinc-800">
                  {items.map((item, idx) => {
                    const product = item.product || item;
                    const imgUrl = item.image || product?.image?.url;
                    const name = item.name || product?.name || "Product";
                    const price = item.price || product?.price;

                    return (
                      <div key={idx} className="flex items-center gap-4 p-5">
                        <div className="h-14 w-14 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-zinc-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-sm truncate">
                            {name}
                          </p>
                          <p className="text-zinc-500 text-xs">
                            Qty: {item.quantity || 1}
                          </p>
                        </div>
                        {price > 0 && (
                          <div className="text-right flex-shrink-0">
                            <p className="text-zinc-400 text-xs">
                              Rs. {price.toLocaleString()} ×{" "}
                              {item.quantity || 1}
                            </p>
                            <p className="text-white font-bold text-sm">
                              Rs.{" "}
                              {(price * (item.quantity || 1)).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {order.totalPrice > 0 && (
                  <div className="px-5 py-4 border-t border-zinc-800 flex justify-between items-center">
                    <span className="text-zinc-400 font-bold text-sm">
                      Total
                    </span>
                    <span className="text-[#ed1b35] font-black text-lg">
                      Rs. {order.totalPrice.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </>
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
