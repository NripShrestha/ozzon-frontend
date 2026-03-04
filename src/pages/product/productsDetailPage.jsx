import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, ArrowRight, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

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

  // ── ERROR STATE ──
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

  // Clean features array — filter out any empty strings
  const features = product?.features?.filter((f) => f?.trim()) ?? [];

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

          {/* Breadcrumb */}
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
              {/* ── IMAGE ── */}
              <div className="relative">
                <div className="aspect-square overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800 shadow-2xl">
                  <img
                    src={product.image?.url}
                    alt={product.name}
                    className="h-full w-full object-cover opacity-95"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1609952048180-7b35ea6b083b?w=600&q=80";
                    }}
                  />
                </div>
                {/* Decorative glow */}
                <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-[#ed1b35] opacity-5 blur-3xl rounded-full pointer-events-none" />
              </div>

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

                <h1 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
                  {product.name}
                </h1>

                {product.description && (
                  <p className="text-zinc-400 text-lg mb-6 leading-relaxed">
                    {product.description}
                  </p>
                )}

                {/* Stock badge */}
                {product.stock !== undefined && (
                  <div className="mb-8">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest border ${
                        product.stock > 0
                          ? "bg-green-950/50 border-green-800/50 text-green-400"
                          : "bg-red-950/50 border-red-900/50 text-red-400"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${product.stock > 0 ? "bg-green-400" : "bg-red-400"}`}
                      />
                      {product.stock > 0
                        ? `In Stock — ${product.stock} units`
                        : "Out of Stock"}
                    </span>
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-zinc-800 mb-8" />

                {/* Specifications — parsed grid */}
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

                {/* CTA */}
                {/* <button className="w-full px-6 py-4 bg-[#ed1b35] text-white font-bold rounded hover:bg-[#c81529] transition-colors shadow-lg shadow-[#ed1b35]/20 uppercase tracking-widest text-sm">
                  Inquire Now
                </button> */}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── KEY FEATURES ── */}
      {!loading && features.length > 0 && (
        <section className="py-16 bg-zinc-950 border-t border-zinc-800/60">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {/* Section heading */}
            <div className="mb-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ed1b35] mb-3">
                What Sets It Apart
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-white">
                Key <span className="text-[#ed1b35]">Features</span>
              </h2>
            </div>

            {/* Features grid — 3 columns on lg, 2 on sm, 1 on mobile */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group flex items-center gap-4 bg-zinc-900 border border-zinc-800 hover:border-[#ed1b35]/40 rounded-lg px-5 py-4 transition-all duration-200 hover:bg-zinc-900/80"
                >
                  {/* Checkmark icon */}
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

            {/* Related skeletons */}
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

            {/* Related grid */}
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
