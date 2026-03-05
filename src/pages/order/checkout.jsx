import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Building2,
  FileText,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Package,
  Loader2,
  X,
} from "lucide-react";
import { getAuth, authFetch } from "../auth/useAuth";

const BASE_URL = import.meta.env.VITE_API_URL;

const fetchCart = async () => {
  const res = await authFetch(`${BASE_URL}/api/cart`);
  if (!res.ok) throw new Error("Failed to fetch cart");
  return res.json();
};

// ── SUCCESS MODAL ──
const SuccessModal = ({ orderId, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl shadow-black/60">
      <div className="flex justify-center mb-6">
        <div className="h-20 w-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-green-400" />
        </div>
      </div>
      <h2 className="text-2xl font-black text-white mb-2">Order Placed!</h2>
      <p className="text-zinc-400 text-sm mb-1">
        Your order has been placed successfully.
      </p>
      <p className="text-zinc-500 text-xs mb-6 leading-relaxed">
        Our team will call you shortly to confirm your order. Please answer the
        call or your order may be cancelled.
      </p>

      {orderId && (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 mb-6 inline-block w-full">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 mb-1">
            Order ID
          </p>
          <p className="text-white font-black text-sm font-mono">
            #{String(orderId).slice(-8).toUpperCase()}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={onClose}
          className="w-full py-3 bg-[#ed1b35] text-white font-bold rounded-lg hover:bg-[#c81529] transition-colors uppercase tracking-widest text-sm"
        >
          View My Orders
        </button>
        <Link
          to="/products"
          className="w-full py-3 border border-zinc-700 text-zinc-400 font-bold rounded-lg hover:border-zinc-500 hover:text-white transition-colors text-sm text-center uppercase tracking-widest"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  </div>
);

export default function CheckoutPage() {
  const navigate = useNavigate();
  const auth = getAuth();

  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successOrderId, setSuccessOrderId] = useState(null);

  const [form, setForm] = useState({
    name: auth?.user?.name || "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!auth) {
      navigate("/login");
      return;
    }
    setCartLoading(true);
    fetchCart()
      .then((data) => {
        setCart(data);
        if (!data?.items?.length) navigate("/cart");
      })
      .catch((e) => setError(e.message))
      .finally(() => setCartLoading(false));
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(form.phone.trim()))
      errs.phone = "Enter a valid 10-digit phone number";
    if (!form.address.trim()) errs.address = "Delivery address is required";
    if (!form.city.trim()) errs.city = "City is required";
    return errs;
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (formErrors[field])
      setFormErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await authFetch(`${BASE_URL}/api/orders`, {
        method: "POST",
        body: JSON.stringify({
          shippingAddress: {
            name: form.name.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            city: form.city.trim(),
          },
          notes: form.notes.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to place order");
      }

      setSuccessOrderId(data._id || data.order?._id);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const items = cart?.items ?? [];
  const totalItems = items.reduce((s, i) => s + (i.quantity || 1), 0);

  // Calculate total — use product.price if available
  const totalPrice = items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * (item.quantity || 1);
  }, 0);
  const hasPrice = totalPrice > 0;

  return (
    <div
      className="bg-[#1a1a1a] text-white min-h-screen"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {successOrderId && (
        <SuccessModal
          orderId={successOrderId}
          onClose={() => navigate("/orders")}
        />
      )}

      {/* TOP BAR */}
      <div className="bg-zinc-950 border-b border-zinc-800/60 py-4">
        <div className="mx-auto max-w-5xl px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={() => navigate("/cart")}
            className="inline-flex items-center gap-2 text-zinc-400 font-semibold hover:text-[#ed1b35] transition-colors text-sm uppercase tracking-widest"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </button>
          <div className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-600">
            <Link to="/" className="hover:text-[#ed1b35] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/cart" className="hover:text-[#ed1b35] transition-colors">
              Cart
            </Link>
            <span>/</span>
            <span className="text-zinc-400">Checkout</span>
          </div>
        </div>
      </div>

      <section className="py-14">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          {/* Heading */}
          <div className="mb-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ed1b35] mb-3">
              Almost There
            </p>
            <h1 className="text-4xl md:text-5xl font-black leading-none">
              Check<span className="text-[#ed1b35]">out</span>
            </h1>
          </div>

          {error && (
            <div className="flex items-center gap-3 text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-5 py-4 mb-8">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-zinc-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {cartLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-[#ed1b35] animate-spin" />
            </div>
          ) : (
            <div className="grid lg:grid-cols-5 gap-8">
              {/* ── DELIVERY FORM ── */}
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h2 className="text-sm font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#ed1b35]" />
                    Delivery Information
                  </h2>

                  <div className="space-y-5">
                    {/* Name */}
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                        <input
                          type="text"
                          value={form.name}
                          onChange={handleChange("name")}
                          placeholder="Your full name"
                          className={`w-full pl-10 pr-4 py-3 bg-zinc-800 border rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#ed1b35] transition-all text-sm ${formErrors.name ? "border-red-500" : "border-zinc-700"}`}
                        />
                      </div>
                      {formErrors.name && (
                        <p className="text-red-400 text-xs mt-1.5">
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={handleChange("phone")}
                          placeholder="98XXXXXXXX"
                          maxLength={10}
                          className={`w-full pl-10 pr-4 py-3 bg-zinc-800 border rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#ed1b35] transition-all text-sm ${formErrors.phone ? "border-red-500" : "border-zinc-700"}`}
                        />
                      </div>
                      {formErrors.phone && (
                        <p className="text-red-400 text-xs mt-1.5">
                          {formErrors.phone}
                        </p>
                      )}
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
                        Delivery Address *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-600" />
                        <textarea
                          value={form.address}
                          onChange={handleChange("address")}
                          placeholder="Street, Tole, Ward No."
                          rows={2}
                          className={`w-full pl-10 pr-4 py-3 bg-zinc-800 border rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#ed1b35] transition-all text-sm resize-none ${formErrors.address ? "border-red-500" : "border-zinc-700"}`}
                        />
                      </div>
                      {formErrors.address && (
                        <p className="text-red-400 text-xs mt-1.5">
                          {formErrors.address}
                        </p>
                      )}
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
                        City *
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                        <input
                          type="text"
                          value={form.city}
                          onChange={handleChange("city")}
                          placeholder="e.g. Kathmandu"
                          className={`w-full pl-10 pr-4 py-3 bg-zinc-800 border rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#ed1b35] transition-all text-sm ${formErrors.city ? "border-red-500" : "border-zinc-700"}`}
                        />
                      </div>
                      {formErrors.city && (
                        <p className="text-red-400 text-xs mt-1.5">
                          {formErrors.city}
                        </p>
                      )}
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
                        Order Notes{" "}
                        <span className="text-zinc-600">(Optional)</span>
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-600" />
                        <textarea
                          value={form.notes}
                          onChange={handleChange("notes")}
                          placeholder="Any special instructions..."
                          rows={2}
                          className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#ed1b35] transition-all text-sm resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h2 className="text-sm font-black uppercase tracking-widest text-white mb-4">
                    Payment Method
                  </h2>
                  <div className="flex items-center gap-4 bg-zinc-800 border border-[#ed1b35]/40 rounded-lg p-4">
                    <div className="h-10 w-10 rounded-lg bg-[#ed1b35]/10 border border-[#ed1b35]/30 flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="h-5 w-5 text-[#ed1b35]" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">
                        Cash on Delivery
                      </p>
                      <p className="text-zinc-500 text-xs">
                        Pay when your order arrives
                      </p>
                    </div>
                    <div className="ml-auto">
                      <div className="h-5 w-5 rounded-full border-2 border-[#ed1b35] flex items-center justify-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#ed1b35]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── ORDER SUMMARY ── */}
              <div className="lg:col-span-2">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sticky top-24">
                  <h2 className="text-sm font-black uppercase tracking-widest text-white mb-5">
                    Order Summary
                  </h2>

                  {/* Items */}
                  <div className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                    {items.map((item) => {
                      const product = item.product;
                      return (
                        <div key={item._id} className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0">
                            {product?.image?.url ? (
                              <img
                                src={product.image.url}
                                alt={product.name}
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
                            <p className="text-white text-xs font-bold truncate">
                              {product?.name ?? "Product"}
                            </p>
                            <p className="text-zinc-500 text-[10px]">
                              Qty: {item.quantity || 1}
                            </p>
                          </div>
                          {product?.price > 0 && (
                            <p className="text-zinc-300 text-xs font-bold flex-shrink-0">
                              Rs.{" "}
                              {(
                                product.price * (item.quantity || 1)
                              ).toLocaleString()}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-zinc-800 pt-4 space-y-2 mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Items</span>
                      <span className="text-white font-bold">{totalItems}</span>
                    </div>
                    {hasPrice && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Subtotal</span>
                          <span className="text-white font-bold">
                            Rs. {totalPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Delivery</span>
                          <span className="text-green-400 font-bold text-xs">
                            FREE
                          </span>
                        </div>
                        <div className="flex justify-between text-base border-t border-zinc-700 pt-3 mt-2">
                          <span className="text-white font-black">Total</span>
                          <span className="text-[#ed1b35] font-black">
                            Rs. {totalPrice.toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Payment</span>
                      <span className="text-zinc-400 font-bold">
                        Cash on Delivery
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full py-4 bg-[#ed1b35] text-white font-black rounded-lg hover:bg-[#c81529] transition-colors shadow-lg shadow-[#ed1b35]/20 uppercase tracking-widest text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Placing Order…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Confirm Order
                      </>
                    )}
                  </button>

                  <p className="text-center text-zinc-600 text-[10px] mt-3 leading-relaxed">
                    By placing this order, our team will call you to confirm
                    before dispatch.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-zinc-900 bg-black text-center mt-8">
        <p className="text-[9px] text-zinc-700 uppercase tracking-[0.6em]">
          OZZON Industrial Excellence 2026
        </p>
      </footer>
    </div>
  );
}
