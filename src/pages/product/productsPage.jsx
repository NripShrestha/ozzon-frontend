import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  AlertCircle,
  Search,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { useState, useEffect } from "react";

// ── API CONFIG ──
const BASE_URL = "http://localhost:5000";

const fetchCategories = async () => {
  const res = await fetch(`${BASE_URL}/api/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
};

const fetchProducts = async (page, category, keyword) => {
  const params = new URLSearchParams({ page: String(page) });
  if (category && category !== "all") params.set("category", category);
  if (keyword.trim()) params.set("keyword", keyword.trim());
  const res = await fetch(`${BASE_URL}/api/products?${params}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
};

const getCategoryName = (cat) => {
  if (typeof cat === "object" && cat !== null) return cat.name;
  return "";
};

// ── SKELETONS ──
const ProductCardSkeleton = () => (
  <div className="animate-pulse bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
    <div className="aspect-square bg-zinc-800" />
    <div className="p-6 space-y-3">
      <div className="h-2.5 w-20 bg-zinc-700 rounded" />
      <div className="h-5 w-3/4 bg-zinc-700 rounded" />
      <div className="h-3.5 w-full bg-zinc-800 rounded" />
      <div className="h-3.5 w-5/6 bg-zinc-800 rounded" />
      <div className="h-3.5 w-24 bg-zinc-700 rounded mt-5" />
    </div>
  </div>
);

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "all";
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [searchInput, setSearchInput] = useState(
    searchParams.get("keyword") || "",
  );
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
  const [productsError, setProductsError] = useState(null);

  useEffect(() => {
    setCategoriesLoading(true);
    fetchCategories()
      .then(setCategories)
      .catch((e) => setCategoriesError(e.message))
      .finally(() => setCategoriesLoading(false));
  }, []);

  useEffect(() => {
    setProductsLoading(true);
    setProductsError(null);
    fetchProducts(page, selectedCategory, keyword)
      .then(({ products, pages, total }) => {
        setProducts(products);
        setTotalPages(pages);
        setTotal(total);
      })
      .catch((e) => setProductsError(e.message))
      .finally(() => setProductsLoading(false));
  }, [page, selectedCategory, keyword]);

  const handleCategoryChange = (catId) => {
    setPage(1);
    setSidebarOpen(false);
    if (catId === "all") {
      const next = new URLSearchParams(searchParams);
      next.delete("category");
      setSearchParams(next);
    } else {
      setSearchParams({ category: catId });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setKeyword(searchInput);
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) next.set("keyword", searchInput.trim());
    else next.delete("keyword");
    setSearchParams(next);
  };

  const clearSearch = () => {
    setSearchInput("");
    setKeyword("");
    setPage(1);
    const next = new URLSearchParams(searchParams);
    next.delete("keyword");
    setSearchParams(next);
  };

  const activeCategoryName =
    selectedCategory === "all"
      ? "All Products"
      : (categories.find((c) => c._id === selectedCategory)?.name ?? "");

  return (
    <div
      className="bg-[#1a1a1a] text-white min-h-screen"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── PAGE HEADER ── */}
      <section className="bg-zinc-950 border-b border-zinc-800/60 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-600 mb-6">
            <Link to="/" className="hover:text-[#ed1b35] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-zinc-400">Products</span>
            {activeCategoryName && activeCategoryName !== "All Products" && (
              <>
                <span>/</span>
                <span className="text-[#ed1b35]">{activeCategoryName}</span>
              </>
            )}
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ed1b35] mb-3">
            Our Range
          </p>
          <h1 className="text-5xl md:text-6xl font-black mb-4 leading-none">
            All <span className="text-[#ed1b35]">Products</span>
          </h1>
          <p className="text-zinc-400 text-lg mb-10">
            Complete range of automotive power and lubrication solutions
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-3 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-11 pr-10 py-3 bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 rounded focus:outline-none focus:border-[#ed1b35] text-sm transition-colors"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#ed1b35] text-white font-bold rounded hover:bg-[#c81529] transition-colors text-sm uppercase tracking-widest"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* ── BODY ── */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile filter toggle */}
            <div className="lg:hidden flex items-center gap-3 mb-1">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded text-sm font-bold uppercase tracking-widest hover:border-[#ed1b35] transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filter
                {selectedCategory !== "all" && (
                  <span className="h-2 w-2 rounded-full bg-[#ed1b35]" />
                )}
              </button>
              {!productsLoading && (
                <span className="text-zinc-500 text-sm">{total} products</span>
              )}
            </div>

            {/* ── SIDEBAR ── */}
            <aside
              className={`lg:w-52 flex-shrink-0 ${sidebarOpen ? "block" : "hidden"} lg:block`}
            >
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 sticky top-24">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 mb-4">
                  Categories
                </p>

                {categoriesError && (
                  <div className="flex items-center gap-2 text-red-400 text-xs mb-3">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>Failed to load</span>
                  </div>
                )}

                <div className="space-y-1">
                  <button
                    onClick={() => handleCategoryChange("all")}
                    className={`w-full text-left px-3 py-2.5 rounded text-sm font-semibold transition-all ${
                      selectedCategory === "all"
                        ? "bg-[#ed1b35] text-white"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    }`}
                  >
                    All Products
                  </button>

                  {categoriesLoading &&
                    [...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse h-9 bg-zinc-800 rounded"
                      />
                    ))}

                  {!categoriesLoading &&
                    categories.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => handleCategoryChange(cat._id)}
                        className={`w-full text-left px-3 py-2.5 rounded text-sm font-semibold transition-all ${
                          selectedCategory === cat._id
                            ? "bg-[#ed1b35] text-white"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                </div>
              </div>
            </aside>

            {/* ── PRODUCTS GRID ── */}
            <div className="flex-1 min-w-0">
              {/* Result bar */}
              <div className="hidden lg:flex mb-6 items-center gap-3 min-h-[24px]">
                {!productsLoading && !productsError && (
                  <p className="text-zinc-500 text-sm">
                    Showing{" "}
                    <span className="font-bold text-white">
                      {products.length}
                    </span>{" "}
                    of <span className="font-bold text-white">{total}</span>{" "}
                    products
                  </p>
                )}
                {keyword && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ed1b35]/10 border border-[#ed1b35]/20 text-[#ed1b35] text-xs font-bold rounded-full">
                    "{keyword}"
                    <button onClick={clearSearch} className="hover:opacity-70">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>

              {/* Error */}
              {productsError && (
                <div className="flex flex-col items-center justify-center gap-3 text-red-400 py-24">
                  <AlertCircle className="h-8 w-8" />
                  <p className="font-bold">Could not load products</p>
                  <p className="text-sm text-zinc-500">{productsError}</p>
                </div>
              )}

              {/* Loading skeletons */}
              {productsLoading && !productsError && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              )}

              {/* Empty */}
              {!productsLoading && !productsError && products.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="h-16 w-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                    <Search className="h-7 w-7 text-zinc-600" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    No products found
                  </h3>
                  <p className="text-zinc-500 text-sm mb-5">
                    Try a different search or category.
                  </p>
                  <button
                    onClick={() => {
                      clearSearch();
                      handleCategoryChange("all");
                    }}
                    className="text-[#ed1b35] font-bold text-sm uppercase tracking-widest hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}

              {/* Products grid */}
              {!productsLoading && !productsError && products.length > 0 && (
                <>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {products.map((product) => (
                      <Link
                        key={product._id}
                        to={`/products/${product._id}`}
                        className="group relative bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-[#ed1b35] transition-all duration-300 hover:shadow-lg hover:shadow-[#ed1b35]/10"
                      >
                        <div className="aspect-square overflow-hidden bg-zinc-800">
                          <img
                            src={product.image?.url}
                            alt={product.name}
                            className="h-full w-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://images.unsplash.com/photo-1609952048180-7b35ea6b083b?w=600&q=80";
                            }}
                          />
                        </div>
                        <div className="p-6">
                          <span className="text-[10px] font-bold text-[#ed1b35] uppercase tracking-[0.3em]">
                            {getCategoryName(product.category)}
                          </span>
                          <h3 className="text-lg font-black text-white mt-2 mb-2 leading-tight">
                            {product.name}
                          </h3>
                          {product.description && (
                            <p className="text-zinc-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                              {product.description}
                            </p>
                          )}
                          <span className="inline-flex items-center gap-2 text-[#ed1b35] font-bold text-sm uppercase tracking-widest group-hover:gap-3 transition-all">
                            View Details <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                        <div className="absolute bottom-0 right-0 w-20 h-20 bg-[#ed1b35] opacity-0 group-hover:opacity-5 rounded-tl-full transition-opacity duration-300" />
                      </Link>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded border border-zinc-700 text-sm font-bold text-zinc-400 hover:border-[#ed1b35] hover:text-[#ed1b35] disabled:opacity-30 disabled:cursor-not-allowed transition-colors uppercase tracking-widest"
                      >
                        Prev
                      </button>

                      {[...Array(totalPages)].map((_, i) => {
                        const p = i + 1;
                        const show =
                          p === 1 ||
                          p === totalPages ||
                          Math.abs(p - page) <= 1;
                        const ellipsisBefore = p === page - 2 && page > 3;
                        const ellipsisAfter =
                          p === page + 2 && page < totalPages - 2;
                        if (ellipsisBefore || ellipsisAfter)
                          return (
                            <span
                              key={p}
                              className="text-zinc-600 px-1 text-sm"
                            >
                              …
                            </span>
                          );
                        if (!show) return null;
                        return (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-9 h-9 rounded text-sm font-bold transition-all ${
                              p === page
                                ? "bg-[#ed1b35] text-white"
                                : "border border-zinc-700 text-zinc-400 hover:border-[#ed1b35] hover:text-[#ed1b35]"
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}

                      <button
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                        className="px-4 py-2 rounded border border-zinc-700 text-sm font-bold text-zinc-400 hover:border-[#ed1b35] hover:text-[#ed1b35] disabled:opacity-30 disabled:cursor-not-allowed transition-colors uppercase tracking-widest"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
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
