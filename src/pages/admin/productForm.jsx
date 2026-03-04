import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  X,
  Upload,
  AlertCircle,
  CheckCircle,
  Image,
} from "lucide-react";

const BASE = "http://localhost:5000";

const authHeaders = () => ({
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

const labelStyle = {
  display: "block",
  fontSize: "10px",
  fontWeight: 700,
  color: "#a1a1aa",
  letterSpacing: "0.25em",
  textTransform: "uppercase",
  marginBottom: "7px",
};

const sectionStyle = {
  background: "#111",
  border: "1px solid #1f1f1f",
  borderRadius: "10px",
  padding: "24px",
  marginBottom: "20px",
};

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(isEdit);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    price: "",
    stock: "",
    description: "",
    specifications: "",
  });

  // Features managed separately as an array
  const [features, setFeatures] = useState([""]);

  // Fetch categories
  useEffect(() => {
    fetch(`${BASE}/api/categories`)
      .then((r) => r.json())
      .then((data) => setCategories(data || []))
      .catch(() => {});
  }, []);

  // Fetch product if editing
  useEffect(() => {
    if (!isEdit) return;
    setFetchingProduct(true);
    fetch(`${BASE}/api/products/${id}`)
      .then((r) => r.json())
      .then((p) => {
        setFormData({
          name: p.name || "",
          category: p.category?._id || p.category || "",
          brand: p.brand || "",
          price: p.price?.toString() || "",
          stock: p.stock?.toString() || "",
          description: p.description || "",
          specifications: p.specifications || "",
        });
        // Populate features — default to one empty row if none
        setFeatures(p.features?.length ? p.features : [""]);
        if (p.image?.url) setImagePreview(p.image.url);
      })
      .catch(() => setError("Failed to load product"))
      .finally(() => setFetchingProduct(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ── Feature helpers ──────────────────────────────────────────
  const addFeature = () => setFeatures((prev) => [...prev, ""]);

  const removeFeature = (index) =>
    setFeatures((prev) => prev.filter((_, i) => i !== index));

  const updateFeature = (index, value) =>
    setFeatures((prev) => prev.map((f, i) => (i === index ? value : f)));

  // ────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.category) {
      setError("Product name and category are required.");
      return;
    }
    if (!isEdit && !imageFile) {
      setError("Product image is required.");
      return;
    }

    setLoading(true);

    try {
      const body = new FormData();

      // Append scalar fields
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== "") body.append(k, v);
      });

      // Append image if changed
      if (imageFile) body.append("image", imageFile);

      // Append features as a JSON string so the backend receives a clean array
      const cleanFeatures = features.filter((f) => f.trim() !== "");
      body.append("features", JSON.stringify(cleanFeatures));

      const url = isEdit
        ? `${BASE}/api/products/${id}`
        : `${BASE}/api/products`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: authHeaders(), // no Content-Type — browser sets multipart boundary
        body,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save product");

      setSuccess(`Product ${isEdit ? "updated" : "created"} successfully!`);
      setTimeout(() => navigate("/admin/products"), 1500);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProduct) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "300px",
          color: "#52525b",
          fontSize: "14px",
        }}
      >
        Loading product…
      </div>
    );
  }

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
          gap: "14px",
          height: "64px",
          padding: "0 32px",
          background: "#111",
          borderBottom: "1px solid #1f1f1f",
        }}
      >
        <button
          onClick={() => navigate("/admin/products")}
          style={{
            padding: "8px",
            borderRadius: "7px",
            background: "#1a1a1a",
            border: "1px solid #2a2a2a",
            color: "#71717a",
            cursor: "pointer",
            display: "flex",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#71717a";
          }}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1
            style={{
              color: "white",
              fontWeight: 900,
              fontSize: "20px",
              margin: 0,
            }}
          >
            {isEdit ? "Edit Product" : "Add New Product"}
          </h1>
          <p style={{ color: "#52525b", fontSize: "11px", margin: 0 }}>
            {isEdit ? "Update product details" : "Fill in the details below"}
          </p>
        </div>
      </header>

      <main style={{ padding: "32px", maxWidth: "800px" }}>
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
          </div>
        )}
        {success && (
          <div
            style={{
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.3)",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#22c55e",
              fontSize: "13px",
            }}
          >
            <CheckCircle size={14} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ── Basic Info ── */}
          <div style={sectionStyle}>
            <h2
              style={{
                color: "white",
                fontWeight: 800,
                fontSize: "14px",
                marginBottom: "20px",
                letterSpacing: "-0.01em",
              }}
            >
              Basic Information
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Product Name *</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., OZZON PowerMax 75Ah"
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
                <label style={labelStyle}>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  style={{
                    ...inputStyle,
                    color: formData.category ? "white" : "#52525b",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#ed1b35";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#1f1f1f";
                  }}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Brand</label>
                <input
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g., OZZON"
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
                <label style={labelStyle}>Price (₹)</label>
                <input
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0"
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
                <label style={labelStyle}>Stock</label>
                <input
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  style={inputStyle}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#ed1b35";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#1f1f1f";
                  }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Detailed product description…"
                  style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#ed1b35";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#1f1f1f";
                  }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Specifications</label>
                <textarea
                  name="specifications"
                  value={formData.specifications}
                  onChange={handleChange}
                  rows={3}
                  placeholder="e.g., Voltage: 12V, Capacity: 75Ah, CCA: 680A…"
                  style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#ed1b35";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#1f1f1f";
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── Key Features ── */}
          <div style={sectionStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2
                  style={{
                    color: "white",
                    fontWeight: 800,
                    fontSize: "14px",
                    margin: 0,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Key Features
                </h2>
                <p
                  style={{
                    color: "#52525b",
                    fontSize: "11px",
                    marginTop: "3px",
                  }}
                >
                  Displayed as checkmarks on the product page
                </p>
              </div>
              <button
                type="button"
                onClick={addFeature}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  background: "rgba(237,27,53,0.1)",
                  border: "1px solid rgba(237,27,53,0.3)",
                  borderRadius: "7px",
                  color: "#ed1b35",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  letterSpacing: "0.05em",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#ed1b35";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(237,27,53,0.1)";
                  e.currentTarget.style.color = "#ed1b35";
                }}
              >
                <Plus size={13} /> Add Feature
              </button>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {features.map((feature, index) => (
                <div
                  key={index}
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  {/* Bullet indicator */}
                  <div
                    style={{
                      flexShrink: 0,
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: feature.trim()
                        ? "rgba(237,27,53,0.15)"
                        : "#1a1a1a",
                      border: `1px solid ${feature.trim() ? "rgba(237,27,53,0.4)" : "#2a2a2a"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                    }}
                  >
                    <CheckCircle
                      size={13}
                      color={feature.trim() ? "#ed1b35" : "#3f3f46"}
                    />
                  </div>

                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder={`Feature ${index + 1} — e.g., Full synthetic formula`}
                    style={{ ...inputStyle, flex: 1 }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#ed1b35";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#1f1f1f";
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    disabled={features.length === 1}
                    style={{
                      flexShrink: 0,
                      padding: "8px",
                      borderRadius: "6px",
                      background: "none",
                      border: "1px solid #1f1f1f",
                      color: "#3f3f46",
                      cursor: features.length === 1 ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      transition: "all 0.15s",
                      opacity: features.length === 1 ? 0.4 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (features.length > 1) {
                        e.currentTarget.style.background =
                          "rgba(239,68,68,0.1)";
                        e.currentTarget.style.borderColor =
                          "rgba(239,68,68,0.3)";
                        e.currentTarget.style.color = "#ef4444";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "none";
                      e.currentTarget.style.borderColor = "#1f1f1f";
                      e.currentTarget.style.color = "#3f3f46";
                    }}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Feature count badge */}
            {features.filter((f) => f.trim()).length > 0 && (
              <div
                style={{
                  marginTop: "14px",
                  fontSize: "11px",
                  color: "#52525b",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#ed1b35",
                  }}
                />
                {features.filter((f) => f.trim()).length} feature
                {features.filter((f) => f.trim()).length !== 1 ? "s" : ""} will
                be saved
              </div>
            )}
          </div>

          {/* ── Image Upload ── */}
          <div style={sectionStyle}>
            <h2
              style={{
                color: "white",
                fontWeight: 800,
                fontSize: "14px",
                marginBottom: "20px",
                letterSpacing: "-0.01em",
              }}
            >
              Product Image {!isEdit && "*"}
            </h2>
            <div
              style={{
                display: "flex",
                gap: "20px",
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              {/* Upload area */}
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  width: "180px",
                  height: "160px",
                  border: `2px dashed ${imageFile ? "#ed1b35" : "#2a2a2a"}`,
                  borderRadius: "10px",
                  cursor: "pointer",
                  background: imageFile ? "rgba(237,27,53,0.05)" : "#0a0a0a",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#ed1b35";
                }}
                onMouseLeave={(e) => {
                  if (!imageFile) e.currentTarget.style.borderColor = "#2a2a2a";
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
                <Upload size={24} color={imageFile ? "#ed1b35" : "#52525b"} />
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      color: imageFile ? "#ed1b35" : "#71717a",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {imageFile
                      ? imageFile.name.slice(0, 18) + "…"
                      : "Click to upload"}
                  </div>
                  <div
                    style={{
                      color: "#3f3f46",
                      fontSize: "10px",
                      marginTop: "3px",
                    }}
                  >
                    JPG, PNG, WEBP
                  </div>
                </div>
              </label>

              {/* Preview */}
              {imagePreview && (
                <div style={{ position: "relative" }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: "180px",
                      height: "160px",
                      objectFit: "cover",
                      borderRadius: "10px",
                      border: "1px solid #2a2a2a",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                    }}
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.7)",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                    }}
                  >
                    <X size={12} />
                  </button>
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "10px",
                      color: "#52525b",
                      textAlign: "center",
                    }}
                  >
                    {isEdit && !imageFile ? "Current image" : "New image"}
                  </div>
                </div>
              )}

              {!imagePreview && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#3f3f46",
                  }}
                >
                  <Image size={16} />
                  <span style={{ fontSize: "12px" }}>No image selected</span>
                </div>
              )}
            </div>
            {isEdit && (
              <p
                style={{
                  color: "#52525b",
                  fontSize: "11px",
                  marginTop: "12px",
                }}
              >
                Leave empty to keep the existing image. Uploading a new image
                will replace and delete the old one from Cloudinary.
              </p>
            )}
          </div>

          {/* ── Submit ── */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="submit"
              disabled={loading || !!success}
              style={{
                padding: "12px 28px",
                background: loading || success ? "#3f0d14" : "#ed1b35",
                border: "none",
                borderRadius: "7px",
                color: "white",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: loading || success ? "not-allowed" : "pointer",
                boxShadow:
                  loading || success
                    ? "none"
                    : "0 6px 20px rgba(237,27,53,0.25)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!loading && !success)
                  e.currentTarget.style.background = "#c81529";
              }}
              onMouseLeave={(e) => {
                if (!loading && !success)
                  e.currentTarget.style.background = "#ed1b35";
              }}
            >
              {loading
                ? "Saving…"
                : success
                  ? "✓ Saved!"
                  : isEdit
                    ? "Update Product"
                    : "Create Product"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              style={{
                padding: "12px 24px",
                background: "#1a1a1a",
                border: "1px solid #2a2a2a",
                borderRadius: "7px",
                color: "#a1a1aa",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#a1a1aa";
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
