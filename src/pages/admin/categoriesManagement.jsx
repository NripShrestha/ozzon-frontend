import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Layers,
  AlertCircle,
  X,
  RefreshCw,
} from "lucide-react";

const BASE = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("ozzonToken")}`,
});

const inputStyle = {
  width: "100%",
  background: "#0a0a0a",
  border: "1px solid #1f1f1f",
  borderRadius: "7px",
  padding: "10px 14px",
  color: "white",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

export default function CategoriesManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/api/categories`);
      if (!res.ok) throw new Error("Failed to load categories");
      const data = await res.json();
      setCategories(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openModal = (cat = null) => {
    setEditingCat(cat);
    setForm(
      cat
        ? { name: cat.name, description: cat.description || "" }
        : { name: "", description: "" },
    );
    setModalOpen(true);
    setError("");
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCat(null);
    setForm({ name: "", description: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Category name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      let res;
      if (editingCat) {
        // Backend doesn't have PUT /categories/:id but we can use the available create (or add one)
        // For now, we simulate optimistic local update until backend supports PATCH
        setCategories((prev) =>
          prev.map((c) =>
            c._id === editingCat._id
              ? { ...c, name: form.name, description: form.description }
              : c,
          ),
        );
        closeModal();
        setSaving(false);
        return;
      }
      res = await fetch(`${BASE}/api/categories`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          name: form.name,
          description: form.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save category");
      setCategories((prev) => [data, ...prev]);
      closeModal();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/api/categories/${deleteId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      setCategories((prev) => prev.filter((c) => c._id !== deleteId));
      setDeleteId(null);
    } catch (e) {
      setError(e.message);
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  const catInitial = (name) => name?.charAt(0).toUpperCase() || "?";
  const catColors = [
    "#ed1b35",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
  ];
  const catColor = (i) => catColors[i % catColors.length];

  return (
    <>
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
            Categories
          </h1>
          <p style={{ color: "#52525b", fontSize: "11px", margin: 0 }}>
            {categories.length} total categories
          </p>
        </div>
        <button
          onClick={() => openModal()}
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
            border: "none",
            cursor: "pointer",
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
          <Plus size={14} /> Add Category
        </button>
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

        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  background: "#111",
                  border: "1px solid #1f1f1f",
                  borderRadius: "10px",
                  padding: "24px",
                  height: "130px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      background: "#1f1f1f",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        width: "60%",
                        height: "10px",
                        borderRadius: "4px",
                        background: "#1f1f1f",
                        marginBottom: "6px",
                      }}
                    />
                    <div
                      style={{
                        width: "40%",
                        height: "8px",
                        borderRadius: "4px",
                        background: "#1a1a1a",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              color: "#52525b",
            }}
          >
            <Layers size={40} style={{ margin: "0 auto 16px", opacity: 0.4 }} />
            <p style={{ fontSize: "15px", marginBottom: "16px" }}>
              No categories yet.
            </p>
            <button
              onClick={() => openModal()}
              style={{
                padding: "10px 20px",
                background: "#ed1b35",
                border: "none",
                borderRadius: "7px",
                color: "white",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Add First Category
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            {categories.map((cat, i) => (
              <div
                key={cat._id}
                style={{
                  background: "#111",
                  border: "1px solid #1f1f1f",
                  borderRadius: "10px",
                  padding: "22px",
                  transition: "border-color 0.2s, transform 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = catColor(i) + "66";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#1f1f1f";
                  e.currentTarget.style.transform = "none";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      background: catColor(i) + "20",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      fontWeight: 900,
                      color: catColor(i),
                    }}
                  >
                    {catInitial(cat.name)}
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      onClick={() => openModal(cat)}
                      style={{
                        padding: "6px",
                        borderRadius: "6px",
                        background: "none",
                        border: "none",
                        color: "#52525b",
                        cursor: "pointer",
                        display: "flex",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#1f1f1f";
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "none";
                        e.currentTarget.style.color = "#52525b";
                      }}
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteId(cat._id)}
                      style={{
                        padding: "6px",
                        borderRadius: "6px",
                        background: "none",
                        border: "none",
                        color: "#52525b",
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
                        e.currentTarget.style.color = "#52525b";
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <h3
                  style={{
                    color: "white",
                    fontWeight: 700,
                    fontSize: "15px",
                    marginBottom: "4px",
                  }}
                >
                  {cat.name}
                </h3>
                {cat.description && (
                  <p
                    style={{
                      color: "#52525b",
                      fontSize: "12px",
                      lineHeight: 1.5,
                      marginBottom: "12px",
                    }}
                  >
                    {cat.description}
                  </p>
                )}
                <div
                  style={{
                    paddingTop: "12px",
                    borderTop: "1px solid #1a1a1a",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#3f3f46",
                      fontFamily: "monospace",
                    }}
                  >
                    {cat._id?.slice(-8)}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      color: catColor(i),
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            background: "rgba(0,0,0,0.85)",
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
              maxWidth: "420px",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "22px",
              }}
            >
              <h2
                style={{
                  color: "white",
                  fontWeight: 800,
                  fontSize: "17px",
                  margin: 0,
                }}
              >
                {editingCat ? "Edit Category" : "New Category"}
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background: "none",
                  border: "none",
                  color: "#52525b",
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div
                style={{
                  background: "rgba(237,27,53,0.08)",
                  border: "1px solid rgba(237,27,53,0.2)",
                  borderRadius: "6px",
                  padding: "10px 14px",
                  marginBottom: "16px",
                  color: "#ed1b35",
                  fontSize: "12px",
                }}
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#a1a1aa",
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    marginBottom: "7px",
                  }}
                >
                  Category Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g., Car Batteries"
                  style={inputStyle}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#ed1b35";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#1f1f1f";
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#a1a1aa",
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    marginBottom: "7px",
                  }}
                >
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Brief description…"
                  style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#ed1b35";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#1f1f1f";
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: "11px",
                    background: "#ed1b35",
                    border: "none",
                    borderRadius: "7px",
                    color: "white",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? "Saving…" : editingCat ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
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
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            background: "rgba(0,0,0,0.85)",
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
              maxWidth: "380px",
              width: "100%",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <Trash2 size={18} color="#ef4444" />
            </div>
            <h3
              style={{
                color: "white",
                fontWeight: 800,
                fontSize: "16px",
                marginBottom: "8px",
              }}
            >
              Delete Category?
            </h3>
            <p
              style={{
                color: "#71717a",
                fontSize: "13px",
                marginBottom: "22px",
                lineHeight: 1.6,
              }}
            >
              This will permanently remove the category. Products in this
              category will lose their category association.
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
                  cursor: deleting ? "not-allowed" : "pointer",
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
