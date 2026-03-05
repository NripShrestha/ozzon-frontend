import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  ArrowRight,
  CheckCircle,
  ShoppingCart,
  LogIn,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getAuth, authFetch } from "../auth/useAuth";

// ── API CONFIG ──
const BASE_URL = import.meta.env.VITE_API_URL;

const fetchProduct = async (id) => {
  const res = await fetch(`${BASE_URL}/api/products/${id}`);
  if (!res.ok)
    throw new Error(
      res.status === 404 ? "Product not found" : "Failed to fetch product",
    );
  return res.json();
};

const fetchRelated = async (categoryId, excludeId) => {
  const params = new URLSearchParams({ category: categoryId, page: "1" });
  const res = await fetch(`${BASE_URL}/api/products?${params}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.products.filter((p) => p._id !== excludeId).slice(0, 4);
};

const addToCartApi = async (productId, quantity = 1) => {
  const res = await authFetch(`${BASE_URL}/api/cart`, {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
  if (!res.ok) throw new Error("Failed to add to cart");
  return res.json();
};

// ── HELPERS ──
const getCategoryName = (cat) =>
  typeof cat === "object" && cat !== null ? cat.name : "";

const getCategoryId = (cat) =>
  typeof cat === "object" && cat !== null ? cat._id : String(cat);

const parseSpecifications = (raw) => {
  if (!raw?.trim()) return null;
  const lines = raw
    .split(/\n|,(?=[^,]+:)/)
    .map((l) => l.trim())
    .filter(Boolean);
  const pairs = lines
    .map((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return null;
      return {
        label: line.slice(0, idx).trim(),
        value: line.slice(idx + 1).trim(),
      };
    })
    .filter(Boolean);
  return pairs.length > 0 ? pairs : null;
};

// ── SKELETON ──
const DetailSkeleton = () => (
  <div className="animate-pulse">
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
      <div className="aspect-square bg-zinc-800 rounded-lg" />
      <div className="space-y-5 py-4">
        <div className="h-3 w-24 bg-zinc-700 rounded" />
        <div className="h-10 w-3/4 bg-zinc-700 rounded" />
        <div className="h-3 w-28 bg-zinc-800 rounded" />
        <div className="h-4 w-full bg-zinc-800 rounded" />
        <div className="h-4 w-5/6 bg-zinc-800 rounded" />
        <div className="h-4 w-4/6 bg-zinc-800 rounded" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-zinc-800 rounded" />
          ))}
        </div>
        <div className="h-12 w-full bg-zinc-700 rounded mt-2" />
      </div>
    </div>
  </div>
);

// ── IMAGE GALLERY ──
const ImageGallery = ({ product }) => {
  const allImages = [product.image, ...(product.images || [])].filter(Boolean);

  const [activeIndex, setActiveIndex] = useState(0);

  const prev = () =>
    setActiveIndex((i) => (i - 1 + allImages.length) % allImages.length);
  const next = () => setActiveIndex((i) => (i + 1) % allImages.length);

  return (
    <div className="relative">
      {/* Main image */}
      <div className="aspect-square overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800 shadow-2xl relative">
        <img
          src={allImages[activeIndex]?.url}
          alt={product.name}
          className="h-full w-full object-cover opacity-95 transition-opacity duration-300"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1609952048180-7b35ea6b083b?w=600&q=80";
          }}
        />

        {/* Prev / Next arrows — only if multiple images */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 border border-zinc-700 flex items-center justify-center text-white hover:bg-[#ed1b35] hover:border-[#ed1b35] transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 border border-zinc-700 flex items-center justify-center text-white hover:bg-[#ed1b35] hover:border-[#ed1b35] transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeIndex ? "w-5 bg-[#ed1b35]" : "w-1.5 bg-zinc-500"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {allImages.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                i === activeIndex
                  ? "border-[#ed1b35]"
                  : "border-zinc-700 opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={img?.url}
                alt={`View ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1609952048180-7b35ea6b083b?w=600&q=80";
                }}
              />
            </button>
          ))}
        </div>
      )}

      <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-[#ed1b35] opacity-5 blur-3xl rounded-full pointer-events-none" />
    </div>
  );
};

// ── ADD TO CART BUTTON ──
const AddToCartButton = ({ productId }) => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [qty, setQty] = useState(1);

  const handleAdd = async () => {
    if (!auth) {
      navigate("/login");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      await addToCartApi(productId, qty);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (e) {
      setStatus("error");
      setErrorMsg(e.message);
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  if (!auth) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-zinc-500 flex items-center gap-2">
          <LogIn className="h-3.5 w-3.5 text-[#ed1b35]" />
          You must be logged in to add items to your cart.
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#ed1b35] text-white font-bold rounded hover:bg-[#c81529] transition-colors shadow-lg shadow-[#ed1b35]/20 text-sm uppercase tracking-widest"
          >
            <LogIn className="h-4 w-4" />
            Login to Add to Cart
          </Link>
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 px-7 py-3.5 border border-zinc-700 text-zinc-300 font-bold rounded hover:border-[#ed1b35] hover:text-[#ed1b35] transition-all text-sm uppercase tracking-widest"
          >
            <ShoppingCart className="h-4 w-4" />
            View Cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
          Qty
        </span>
        <div className="flex items-center border border-zinc-700 rounded overflow-hidden">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={status === "loading"}
            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors disabled:opacity-40 text-sm font-bold"
          >
            −
          </button>
          <span className="px-5 py-2 text-sm font-black text-white bg-zinc-900 min-w-[48px] text-center">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => q + 1)}
            disabled={status === "loading"}
            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors disabled:opacity-40 text-sm font-bold"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleAdd}
          disabled={status === "loading" || status === "success"}
          className={`inline-flex items-center gap-2.5 px-7 py-3.5 font-bold rounded transition-all shadow-lg text-sm uppercase tracking-widest disabled:cursor-not-allowed ${
            status === "success"
              ? "bg-green-600 text-white shadow-green-900/30"
              : status === "error"
                ? "bg-red-700 text-white shadow-red-900/30"
                : "bg-[#ed1b35] text-white hover:bg-[#c81529] shadow-[#ed1b35]/20"
          }`}
        >
          {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
          {status === "success" && <CheckCircle className="h-4 w-4" />}
          {(status === "idle" || status === "error") && (
            <ShoppingCart className="h-4 w-4" />
          )}
          {status === "idle" && "Add to Cart"}
          {status === "loading" && "Adding…"}
          {status === "success" && "Added to Cart!"}
          {status === "error" && "Failed — Retry"}
        </button>

        <Link
          to="/cart"
          className="inline-flex items-center gap-2 px-7 py-3.5 border border-zinc-700 text-zinc-300 font-bold rounded hover:border-[#ed1b35] hover:text-[#ed1b35] transition-all text-sm uppercase tracking-widest"
        >
          <ShoppingCart className="h-4 w-4" />
          View Cart
        </Link>
      </div>

      {status === "error" && errorMsg && (
        <p className="text-xs text-red-400 flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          {errorMsg}
        </p>
      )}
    </div>
  );
};

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedLoading, setRelatedLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setProduct(null);
    setRelated([]);

    fetchProduct(id)
      .then((p) => {
        setProduct(p);
        const catId = getCategoryId(p.category);
        if (catId) {
          setRelatedLoading(true);
          fetchRelated(catId, p._id)
            .then(setRelated)
            .finally(() => setRelatedLoading(false));
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (!loading && error) {
    return (
      <div
        className="bg-[#1a1a1a] min-h-screen flex items-center justify-center"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-2">
            {error === "Product not found"
              ? "Product Not Found"
              : "Something Went Wrong"}
          </h2>
          <p className="text-zinc-500 mb-6 text-sm">{error}</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-[#ed1b35] font-bold uppercase tracking-widest text-sm hover:gap-3 transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const specPairs = product?.specifications
    ? parseSpecifications(product.specifications)
    : null;
  const features = product?.features?.filter((f) => f?.trim()) ?? [];
  const isInStock = product?.stock !== undefined && product.stock > 0;

  return (
    <div
      className="bg-[#1a1a1a] text-white min-h-screen"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── TOP BAR ── */}
      <div className="bg-zinc-950 border-b border-zinc-800/60 py-4">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-zinc-400 font-semibold hover:text-[#ed1b35] transition-colors text-sm uppercase tracking-widest"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {product && (
            <div className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-600">
              <a href="/" className="hover:text-[#ed1b35] transition-colors">
                Home
              </a>
              <span>/</span>
              <Link
                to="/products"
                className="hover:text-[#ed1b35] transition-colors"
              >
                Products
              </Link>
              <span>/</span>
              <span className="text-zinc-400 truncate max-w-[200px]">
                {product.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── PRODUCT DETAIL ── */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {loading && <DetailSkeleton />}

          {!loading && product && (
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
              {/* ── IMAGE GALLERY ── */}
              <ImageGallery product={product} />

              {/* ── INFO ── */}
              <div className="flex flex-col justify-center">
                {/* Category + brand */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-bold text-[#ed1b35] uppercase tracking-[0.4em]">
                    {getCategoryName(product.category)}
                  </span>
                  {product.brand && (
                    <>
                      <span className="text-zinc-700">·</span>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">
                        {product.brand}
                      </span>
                    </>
                  )}
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                  {product.name}
                </h1>

                {/* ── PRICE ── */}
                {product.price !== undefined && product.price !== null && (
                  <div className="mb-5">
                    <span className="text-3xl font-black text-white">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                {/* ── DESCRIPTION — preserves exact user formatting ── */}
                {product.description && (
                  <div className="text-zinc-400 text-base mb-6 leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </div>
                )}

                {/* Stock badge — Available / Out of Stock */}
                {product.stock !== undefined && (
                  <div className="mb-6">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest border ${
                        isInStock
                          ? "bg-green-950/50 border-green-800/50 text-green-400"
                          : "bg-red-950/50 border-red-900/50 text-red-400"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${isInStock ? "bg-green-400" : "bg-red-400"}`}
                      />
                      {isInStock ? "Available" : "Out of Stock"}
                    </span>
                  </div>
                )}

                {/* ── ADD TO CART ── */}
                <div className="mb-8">
                  <AddToCartButton productId={product._id} />
                </div>

                {/* Divider */}
                <div className="border-t border-zinc-800 mb-8" />

                {/* Specifications */}
                {specPairs && specPairs.length > 0 && (
                  <div className="mb-8">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 mb-4">
                      Specifications
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {specPairs.map((spec, index) => (
                        <div
                          key={index}
                          className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg"
                        >
                          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">
                            {spec.label}
                          </div>
                          <div className="text-base font-black text-white">
                            {spec.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw spec string fallback */}
                {product.specifications && !specPairs && (
                  <div className="mb-8">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 mb-4">
                      Specifications
                    </p>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
                      <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-line">
                        {product.specifications}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── KEY FEATURES ── */}
      {!loading && features.length > 0 && (
        <section className="py-16 bg-zinc-950 border-t border-zinc-800/60">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ed1b35] mb-3">
                What Sets It Apart
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-white">
                Key <span className="text-[#ed1b35]">Features</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group flex items-center gap-4 bg-zinc-900 border border-zinc-800 hover:border-[#ed1b35]/40 rounded-lg px-5 py-4 transition-all duration-200 hover:bg-zinc-900/80"
                >
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#ed1b35]/10 border border-[#ed1b35]/20 group-hover:bg-[#ed1b35]/20 flex items-center justify-center transition-colors">
                    <CheckCircle className="h-4 w-4 text-[#ed1b35]" />
                  </div>
                  <p className="text-zinc-300 font-medium text-sm leading-snug group-hover:text-white transition-colors">
                    {feature}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── RELATED PRODUCTS ── */}
      {(relatedLoading || related.length > 0) && (
        <section className="py-16 bg-zinc-950 border-t border-zinc-800/60 mt-8">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ed1b35] mb-2">
                  More Like This
                </p>
                <h2 className="text-3xl md:text-4xl font-black text-white">
                  Related <span className="text-[#ed1b35]">Products</span>
                </h2>
              </div>
              <Link
                to="/products"
                className="hidden md:inline-flex items-center gap-2 text-zinc-400 font-bold text-sm uppercase tracking-widest hover:text-[#ed1b35] hover:gap-3 transition-all"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {relatedLoading && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden"
                  >
                    <div className="aspect-square bg-zinc-800" />
                    <div className="p-5 space-y-2">
                      <div className="h-4 w-3/4 bg-zinc-700 rounded" />
                      <div className="h-3.5 w-full bg-zinc-800 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!relatedLoading && related.length > 0 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((p) => (
                  <Link
                    key={p._id}
                    to={`/products/${p._id}`}
                    className="group relative bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-[#ed1b35] transition-all duration-300 hover:shadow-lg hover:shadow-[#ed1b35]/10"
                  >
                    <div className="aspect-square overflow-hidden bg-zinc-800">
                      <img
                        src={p.image?.url}
                        alt={p.name}
                        className="h-full w-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1609952048180-7b35ea6b083b?w=600&q=80";
                        }}
                      />
                    </div>
                    <div className="p-5">
                      <span className="text-[10px] font-bold text-[#ed1b35] uppercase tracking-[0.3em]">
                        {typeof p.category === "object" ? p.category.name : ""}
                      </span>
                      <h3 className="text-base font-black text-white mt-1 mb-1 leading-tight">
                        {p.name}
                      </h3>
                      {p.price !== undefined && p.price !== null && (
                        <p className="text-white font-bold text-sm mb-1">
                          ₹{p.price.toLocaleString("en-IN")}
                        </p>
                      )}
                      {p.description && (
                        <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-16 h-16 bg-[#ed1b35] opacity-0 group-hover:opacity-5 rounded-tl-full transition-opacity duration-300" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer className="py-12 border-t border-zinc-900 bg-black text-center">
        <p className="text-[9px] text-zinc-700 uppercase tracking-[0.6em]">
          OZZON Industrial Excellence 2026
        </p>
      </footer>
    </div>
  );
}
