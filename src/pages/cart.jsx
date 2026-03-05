import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  AlertCircle,
  ArrowRight,
  Package,
} from "lucide-react";
import { getAuth, authFetch } from "./auth/useAuth";

const BASE_URL = import.meta.env.VITE_API_URL;

// ── API HELPERS ──
const fetchCart = async (token) => {
  const res = await authFetch(`${BASE_URL}/api/cart`);
  if (!res.ok) throw new Error("Failed to fetch cart");
  return res.json();
};

const removeItem = async (productId) => {
  const res = await authFetch(`${BASE_URL}/api/cart/${productId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove item");
  return res.json();
};

const clearCartApi = async () => {
  const res = await authFetch(`${BASE_URL}/api/cart`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to clear cart");
  return res.json();
};

const updateQuantity = async (productId, quantity) => {
  // Remove then re-add with new quantity by using addToCart
  // Backend: if item exists, it ADDS quantity. So we remove first then add with exact qty.
  await removeItem(productId);
  if (quantity > 0) {
    const res = await authFetch(`${BASE_URL}/api/cart`, {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
    if (!res.ok) throw new Error("Failed to update quantity");
    return res.json();
  }
};

// ── SKELETON ──
const CartItemSkeleton = () => (
  <div className="animate-pulse flex gap-5 bg-zinc-900 border border-zinc-800 rounded-lg p-5">
    <div className="h-24 w-24 flex-shrink-0 bg-zinc-800 rounded-lg" />
    <div className="flex-1 space-y-3 py-1">
      <div className="h-3 w-20 bg-zinc-700 rounded" />
      <div className="h-5 w-2/3 bg-zinc-700 rounded" />
      <div className="h-3 w-1/3 bg-zinc-800 rounded" />
    </div>
  </div>
);

export default function CartPage() {
  const navigate = useNavigate();
  const auth = getAuth();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // productId being acted on
  const [clearLoading, setClearLoading] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!auth) {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    if (!auth) return;
    setLoading(true);
    fetchCart()
      .then(setCart)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId) => {
    setActionLoading(productId);
    try {
      const updated = await removeItem(productId);
      // Re-fetch to get populated product data
      const fresh = await fetchCart();
      setCart(fresh);
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleQtyChange = async (productId, newQty) => {
    if (newQty < 1) {
      await handleRemove(productId);
      return;
    }
    setActionLoading(productId);
    try {
      await updateQuantity(productId, newQty);
      const fresh = await fetchCart();
      setCart(fresh);
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleClear = async () => {
    setClearLoading(true);
    try {
      await clearCartApi();
      setCart({ items: [] });
    } catch (e) {
      setError(e.message);
    } finally {
      setClearLoading(false);
    }
  };

  const items = cart?.items ?? [];
  const isEmpty = !loading && items.length === 0;

  // Count total items
  const totalItems = items.reduce((sum, i) => sum + (i.quantity || 1), 0);

  return (
    <div
      className="bg-[#1a1a1a] text-white min-h-screen"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── TOP BAR ── */}
      <div className="bg-zinc-950 border-b border-zinc-800/60 py-4">
        <div className="mx-auto max-w-5xl px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-zinc-400 font-semibold hover:text-[#ed1b35] transition-colors text-sm uppercase tracking-widest"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-600">
            <Link to="/" className="hover:text-[#ed1b35] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-zinc-400">Cart</span>
          </div>
        </div>
      </div>

      <section className="py-14">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          {/* Heading */}
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ed1b35] mb-3">
                Your Selection
              </p>
              <h1 className="text-4xl md:text-5xl font-black leading-none">
                My <span className="text-[#ed1b35]">Cart</span>
              </h1>
            </div>
            {!loading && !isEmpty && (
              <button
                onClick={handleClear}
                disabled={clearLoading}
                className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-red-400 uppercase tracking-widest font-bold transition-colors disabled:opacity-40"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {clearLoading ? "Clearing…" : "Clear All"}
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-5 py-4 mb-8">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <CartItemSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="h-20 w-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                <ShoppingCart className="h-9 w-9 text-zinc-600" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">
                Your cart is empty
              </h3>
              <p className="text-zinc-500 text-sm mb-8">
                Explore our products and add something to your cart.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#ed1b35] text-white font-bold rounded hover:bg-[#c81529] transition-colors shadow-lg shadow-[#ed1b35]/20 uppercase tracking-widest text-sm"
              >
                Browse Products <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Cart Items */}
          {!loading && items.length > 0 && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Items list */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => {
                  const product = item.product;
                  const isActing =
                    actionLoading === (product?._id ?? item.product);
                  const qty = item.quantity || 1;

                  return (
                    <div
                      key={item._id}
                      className={`flex gap-5 bg-zinc-900 border rounded-lg p-5 transition-all duration-200 ${
                        isActing
                          ? "border-zinc-700 opacity-60"
                          : "border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      {/* Product image */}
                      <Link
                        to={`/products/${product?._id}`}
                        className="flex-shrink-0"
                      >
                        <div className="h-24 w-24 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700">
                          {product?.image?.url ? (
                            <img
                              src={product.image.url}
                              alt={product?.name}
                              className="h-full w-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "https://images.unsplash.com/photo-1609952048180-7b35ea6b083b?w=300&q=80";
                              }}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="h-8 w-8 text-zinc-600" />
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        {product?.category && (
                          <span className="text-[10px] font-bold text-[#ed1b35] uppercase tracking-[0.3em]">
                            {typeof product.category === "object"
                              ? product.category.name
                              : product.category}
                          </span>
                        )}
                        <Link to={`/products/${product?._id}`}>
                          <h3 className="text-base font-black text-white mt-1 mb-1 leading-tight hover:text-[#ed1b35] transition-colors truncate">
                            {product?.name ?? "Unknown Product"}
                          </h3>
                        </Link>
                        {product?.brand && (
                          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">
                            {product.brand}
                          </p>
                        )}

                        {/* Qty + Remove row */}
                        <div className="flex items-center gap-4 mt-3">
                          {/* Quantity control */}
                          <div className="flex items-center border border-zinc-700 rounded overflow-hidden">
                            <button
                              onClick={() =>
                                handleQtyChange(product?._id, qty - 1)
                              }
                              disabled={isActing}
                              className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors disabled:opacity-40"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-4 py-1.5 text-sm font-bold text-white bg-zinc-900 min-w-[40px] text-center">
                              {isActing ? "…" : qty}
                            </span>
                            <button
                              onClick={() =>
                                handleQtyChange(product?._id, qty + 1)
                              }
                              disabled={isActing}
                              className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors disabled:opacity-40"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Remove button */}
                          <button
                            onClick={() => handleRemove(product?._id)}
                            disabled={isActing}
                            className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-red-400 font-bold uppercase tracking-widest transition-colors disabled:opacity-40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary panel */}
              <div className="lg:col-span-1">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 sticky top-24">
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 mb-5">
                    Summary
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Items</span>
                      <span className="font-bold text-white">{totalItems}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Unique products</span>
                      <span className="font-bold text-white">
                        {items.length}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-zinc-800 pt-5 mb-6">
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      To place an order or enquire about pricing, please contact
                      us directly.
                    </p>
                  </div>

                  <a
                    href="/#contact"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#ed1b35] text-white font-bold rounded hover:bg-[#c81529] transition-colors shadow-lg shadow-[#ed1b35]/20 uppercase tracking-widest text-sm"
                  >
                    Enquire Now <ArrowRight className="h-4 w-4" />
                  </a>

                  <Link
                    to="/products"
                    className="mt-3 w-full flex items-center justify-center gap-2 px-6 py-3 border border-zinc-700 text-zinc-400 font-bold rounded hover:border-[#ed1b35] hover:text-[#ed1b35] transition-colors text-sm uppercase tracking-widest"
                  >
                    Continue Browsing
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 border-t border-zinc-900 bg-black text-center mt-8">
        <p className="text-[9px] text-zinc-700 uppercase tracking-[0.6em]">
          OZZON Industrial Excellence 2026
        </p>
      </footer>
    </div>
  );
}
