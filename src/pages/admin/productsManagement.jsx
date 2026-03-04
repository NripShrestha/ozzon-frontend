import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const BASE = "http://localhost:5000";
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("ozzonToken")}`,
});

export default function ProductsManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const searchTimeout = useRef(null);

  const fetchProducts = async (
    q = searchQuery,
    cat = selectedCategory,
    pg = page,
  ) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: pg });
      if (q) params.set("keyword", q);
      if (cat) params.set("category", cat);
      const res = await fetch(`${BASE}/api/products?${params}`);
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${BASE}/api/categories`);
      const data = await res.json();
      setCategories(data || []);
    } catch (_) {}
  };

  useEffect(() => {
    fetchCategories();
  }, []);
  useEffect(() => {
    fetchProducts();
  }, [page]);

  const handleSearch = (val) => {
    setSearchQuery(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      fetchProducts(val, selectedCategory, 1);
    }, 400);
  };

  const handleCategoryChange = (val) => {
    setSelectedCategory(val);
    setPage(1);
    fetchProducts(searchQuery, val, 1);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`${BASE}/api/products/${deleteId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Delete failed");
      setDeleteId(null);
      fetchProducts();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  };

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
            Products
          </h1>
          <p style={{ color: "#52525b", fontSize: "11px", margin: 0 }}>
            {total} total products
          </p>
        </div>
        <Link
          to="/admin/products/new"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "#ed1b35",
            borderRadius: "7px",
            padding: "9px 16px",
            color: "white",
            fontSize: "12px",
            fontWeight: 700,
            textDecoration: "none",
            letterSpacing: "0.05em",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#c81529";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#ed1b35";
          }}
        >
          <Plus size={14} /> Add Product
        </Link>
      </header>

      <main style={{ padding: "32px" }}>
        {error && (
          <div
            style={{
              background: "rgba(237,27,53,0.08)",
              border: "1px solid rgba(237,27,53,0.3)",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#ed1b35",
              fontSize: "13px",
            }}
          >
            <AlertCircle size={14} /> {error}
            <button
              onClick={() => setError("")}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#ed1b35",
              }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Filters */}
        <div
          style={{
            background: "#111",
            border: "1px solid #1f1f1f",
            borderRadius: "10px",
            padding: "20px 24px",
            marginBottom: "20px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px",
          }}
        >
          <div style={{ position: "relative" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#52525b",
              }}
            />
            <input
              type="text"
              placeholder="Search products…"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: "100%",
                background: "#0a0a0a",
                border: "1px solid #1f1f1f",
                borderRadius: "7px",
                padding: "10px 12px 10px 36px",
                color: "white",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#ed1b35";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#1f1f1f";
              }}
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            style={{
              background: "#0a0a0a",
              border: "1px solid #1f1f1f",
              borderRadius: "7px",
              padding: "10px 12px",
              color: selectedCategory ? "white" : "#52525b",
              fontSize: "13px",
              outline: "none",
            }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
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
                padding: "60px",
                textAlign: "center",
                color: "#52525b",
                fontSize: "13px",
              }}
            >
              <RefreshCw
                size={20}
                style={{
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 12px",
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              Loading products…
            </div>
          ) : products.length === 0 ? (
            <div
              style={{
                padding: "60px",
                textAlign: "center",
                color: "#52525b",
                fontSize: "14px",
              }}
            >
              No products found.{" "}
              <Link
                to="/admin/products/new"
                style={{
                  color: "#ed1b35",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                Add one →
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1f1f1f" }}>
                    {[
                      "Product",
                      "Category",
                      "Brand",
                      "Price",
                      "Stock",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 20px",
                          textAlign: h === "Actions" ? "right" : "left",
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
                  {products.map((product, i) => (
                    <tr
                      key={product._id}
                      style={{
                        borderBottom:
                          i < products.length - 1
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
                      <td style={{ padding: "14px 20px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <img
                            src={product.image?.url}
                            alt={product.name}
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "7px",
                              objectFit: "cover",
                              background: "#1a1a1a",
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                          <div>
                            <div
                              style={{
                                color: "white",
                                fontWeight: 600,
                                fontSize: "13px",
                              }}
                            >
                              {product.name}
                            </div>
                            <div
                              style={{
                                color: "#52525b",
                                fontSize: "11px",
                                marginTop: "2px",
                                maxWidth: "200px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span
                          style={{
                            background: "rgba(237,27,53,0.1)",
                            color: "#ed1b35",
                            borderRadius: "20px",
                            padding: "3px 10px",
                            fontSize: "11px",
                            fontWeight: 700,
                          }}
                        >
                          {product.category?.name || "—"}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          color: "#a1a1aa",
                          fontSize: "13px",
                        }}
                      >
                        {product.brand || "—"}
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          color: "#a1a1aa",
                          fontSize: "13px",
                        }}
                      >
                        {product.price
                          ? `₹${product.price.toLocaleString()}`
                          : "—"}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span
                          style={{
                            color: product.stock > 0 ? "#22c55e" : "#ef4444",
                            fontSize: "13px",
                            fontWeight: 600,
                          }}
                        >
                          {product.stock ?? "—"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: "4px",
                          }}
                        >
                          <Link
                            to={`/admin/products/edit/${product._id}`}
                            style={{
                              padding: "7px",
                              borderRadius: "6px",
                              color: "#71717a",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              transition: "all 0.15s",
                              textDecoration: "none",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#1f1f1f";
                              e.currentTarget.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "none";
                              e.currentTarget.style.color = "#71717a";
                            }}
                          >
                            <Edit size={14} />
                          </Link>
                          <button
                            onClick={() => setDeleteId(product._id)}
                            style={{
                              padding: "7px",
                              borderRadius: "6px",
                              color: "#71717a",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              transition: "all 0.15s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "rgba(239,68,68,0.1)";
                              e.currentTarget.style.color = "#ef4444";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "none";
                              e.currentTarget.style.color = "#71717a";
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "20px",
            }}
          >
            <span style={{ color: "#52525b", fontSize: "12px" }}>
              Showing {products.length} of {total} products
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    background: page === p ? "#ed1b35" : "#1a1a1a",
                    border: `1px solid ${page === p ? "#ed1b35" : "#2a2a2a"}`,
                    color: page === p ? "white" : "#71717a",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#111",
              border: "1px solid #2a2a2a",
              borderRadius: "12px",
              padding: "28px",
              maxWidth: "400px",
              width: "100%",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <Trash2 size={20} color="#ef4444" />
            </div>
            <h3
              style={{
                color: "white",
                fontWeight: 800,
                fontSize: "17px",
                marginBottom: "8px",
              }}
            >
              Delete Product?
            </h3>
            <p
              style={{
                color: "#71717a",
                fontSize: "13px",
                marginBottom: "24px",
                lineHeight: 1.6,
              }}
            >
              This will permanently delete the product and remove its image from
              Cloudinary. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: "11px",
                  background: "#ef4444",
                  border: "none",
                  borderRadius: "7px",
                  color: "white",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  opacity: deleting ? 0.7 : 1,
                }}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button
                onClick={() => setDeleteId(null)}
                style={{
                  flex: 1,
                  padding: "11px",
                  background: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  borderRadius: "7px",
                  color: "white",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
