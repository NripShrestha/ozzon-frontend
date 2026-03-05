import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  X,
  Upload,
  AlertCircle,
  CheckCircle,
  Star,
} from "lucide-react";

const BASE = import.meta.env.VITE_API_URL;

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
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(isEdit);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Each entry: { file?: File, preview: string, public_id?: string, url?: string, isNew: boolean }
  const [imageSlots, setImageSlots] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    price: "",
    stock: "",
    description: "",
    specifications: "",
  });

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
        setFeatures(p.features?.length ? p.features : [""]);

        // Build image slots from existing images
        const slots = [];
        if (p.image?.url) {
          slots.push({
            preview: p.image.url,
            url: p.image.url,
            public_id: p.image.public_id,
            isNew: false,
          });
        }
        if (p.images?.length) {
          p.images.forEach((img) => {
            slots.push({
              preview: img.url,
              url: img.url,
              public_id: img.public_id,
              isNew: false,
            });
          });
        }
        setImageSlots(slots);
      })
      .catch(() => setError("Failed to load product"))
      .finally(() => setFetchingProduct(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Add new images via file picker
  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newSlots = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isNew: true,
    }));
    setImageSlots((prev) => [...prev, ...newSlots]);
    // Reset input so same file can be re-added if needed
    e.target.value = "";
  };

  // Replace an existing slot's image
  const handleImageReplace = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageSlots((prev) =>
      prev.map((slot, i) =>
        i === index
          ? { file, preview: URL.createObjectURL(file), isNew: true }
          : slot,
      ),
    );
    e.target.value = "";
  };

  // Remove an image slot
  const handleImageRemove = (index) => {
    setImageSlots((prev) => prev.filter((_, i) => i !== index));
  };

  // Make a slot the primary (first) image
  const handleSetPrimary = (index) => {
    setImageSlots((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      return [item, ...next];
    });
  };

  // Feature helpers
  const addFeature = () => setFeatures((prev) => [...prev, ""]);
  const removeFeature = (index) =>
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  const updateFeature = (index, value) =>
    setFeatures((prev) => prev.map((f, i) => (i === index ? value : f)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.category) {
      setError("Product name and category are required.");
      return;
    }
    if (!isEdit && imageSlots.length === 0) {
      setError("At least one product image is required.");
      return;
    }
    if (imageSlots.length === 0) {
      setError("At least one product image is required.");
      return;
    }

    setLoading(true);

    try {
      const body = new FormData();

      // Scalar fields
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== "") body.append(k, v);
      });

      // Features
      const cleanFeatures = features.filter((f) => f.trim() !== "");
      body.append("features", JSON.stringify(cleanFeatures));

      // New image files
      imageSlots.forEach((slot) => {
        if (slot.isNew && slot.file) {
          body.append("images", slot.file);
        }
      });

      // Tell backend which existing images to keep (for update)
      if (isEdit) {
        const keepImages = imageSlots
          .filter((slot) => !slot.isNew && slot.url && slot.public_id)
          .map((slot) => ({ url: slot.url, public_id: slot.public_id }));
        body.append("keepImages", JSON.stringify(keepImages));
      }

      const url = isEdit
        ? `${BASE}/api/products/${id}`
        : `${BASE}/api/products`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
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
                <select
                  name="stock"
                  value={
                    formData.stock === ""
                      ? ""
                      : Number(formData.stock) > 0
                        ? "instock"
                        : "outofstock"
                  }
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      stock:
                        e.target.value === "instock"
                          ? Number(prev.stock) > 0
                            ? prev.stock
                            : "1"
                          : "0",
                    }));
                  }}
                  style={{ ...inputStyle, color: "white" }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#ed1b35";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#1f1f1f";
                  }}
                >
                  <option value="">Select availability</option>
                  <option value="instock">Available</option>
                  <option value="outofstock">Out of Stock</option>
                </select>
              </div>

              {/* Show stock quantity input only when available */}
              {formData.stock !== "" && Number(formData.stock) > 0 && (
                <div>
                  <label style={labelStyle}>Stock Quantity</label>
                  <input
                    name="stock"
                    type="number"
                    min="1"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="e.g., 50"
                    style={inputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#ed1b35";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#1f1f1f";
                    }}
                  />
                </div>
              )}

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Detailed product description… (line breaks will be preserved)"
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    lineHeight: 1.6,
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#ed1b35";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#1f1f1f";
                  }}
                />
                <p
                  style={{
                    color: "#3f3f46",
                    fontSize: "10px",
                    marginTop: "5px",
                  }}
                >
                  Line breaks and formatting will be preserved exactly as typed.
                </p>
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <h2
                style={{
                  color: "white",
                  fontWeight: 800,
                  fontSize: "14px",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                Product Images {!isEdit && "*"}
              </h2>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
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
                <Upload size={13} /> Add Images
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageAdd}
                style={{ display: "none" }}
              />
            </div>

            <p
              style={{
                color: "#52525b",
                fontSize: "11px",
                marginBottom: "16px",
              }}
            >
              First image is the primary (cover) image. Drag to reorder by
              removing and re-adding. Click the star to set as primary. Up to 10
              images.
            </p>

            {imageSlots.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: "2px dashed #2a2a2a",
                  borderRadius: "10px",
                  padding: "40px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#ed1b35";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#2a2a2a";
                }}
              >
                <Upload
                  size={28}
                  color="#52525b"
                  style={{ margin: "0 auto 10px" }}
                />
                <div
                  style={{
                    color: "#71717a",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  Click to upload images
                </div>
                <div
                  style={{
                    color: "#3f3f46",
                    fontSize: "11px",
                    marginTop: "4px",
                  }}
                >
                  JPG, PNG, WEBP — up to 10 images
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: "12px",
                }}
              >
                {imageSlots.map((slot, index) => (
                  <div
                    key={index}
                    style={{
                      position: "relative",
                      borderRadius: "10px",
                      overflow: "hidden",
                      border:
                        index === 0 ? "2px solid #ed1b35" : "1px solid #2a2a2a",
                      background: "#0a0a0a",
                    }}
                  >
                    <img
                      src={slot.preview}
                      alt={`Product image ${index + 1}`}
                      style={{
                        width: "100%",
                        aspectRatio: "1",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />

                    {/* Primary badge */}
                    {index === 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "6px",
                          left: "6px",
                          background: "#ed1b35",
                          color: "white",
                          fontSize: "9px",
                          fontWeight: 800,
                          letterSpacing: "0.1em",
                          padding: "2px 7px",
                          borderRadius: "20px",
                          textTransform: "uppercase",
                        }}
                      >
                        Primary
                      </div>
                    )}

                    {/* Action buttons overlay */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        justifyContent: "flex-start",
                        padding: "6px",
                        gap: "4px",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(0,0,0,0.45)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(0,0,0,0)";
                      }}
                    >
                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => handleImageRemove(index)}
                        title="Remove image"
                        style={{
                          width: "26px",
                          height: "26px",
                          borderRadius: "50%",
                          background: "rgba(239,68,68,0.85)",
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

                      {/* Set as primary (only for non-primary images) */}
                      {index !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(index)}
                          title="Set as primary image"
                          style={{
                            width: "26px",
                            height: "26px",
                            borderRadius: "50%",
                            background: "rgba(237,27,53,0.85)",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                          }}
                        >
                          <Star size={11} />
                        </button>
                      )}

                      {/* Replace image */}
                      <label
                        title="Replace image"
                        style={{
                          width: "26px",
                          height: "26px",
                          borderRadius: "50%",
                          background: "rgba(0,0,0,0.7)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                        }}
                      >
                        <Upload size={11} />
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => handleImageReplace(index, e)}
                        />
                      </label>
                    </div>

                    {/* New badge */}
                    {slot.isNew && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "6px",
                          left: "6px",
                          background: "rgba(34,197,94,0.9)",
                          color: "white",
                          fontSize: "9px",
                          fontWeight: 800,
                          padding: "2px 7px",
                          borderRadius: "20px",
                          textTransform: "uppercase",
                        }}
                      >
                        New
                      </div>
                    )}
                  </div>
                ))}

                {/* Add more tile */}
                {imageSlots.length < 10 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      aspectRatio: "1",
                      border: "2px dashed #2a2a2a",
                      borderRadius: "10px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      color: "#52525b",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#ed1b35";
                      e.currentTarget.style.color = "#ed1b35";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#2a2a2a";
                      e.currentTarget.style.color = "#52525b";
                    }}
                  >
                    <Plus size={20} />
                    <span style={{ fontSize: "11px", fontWeight: 700 }}>
                      Add More
                    </span>
                  </div>
                )}
              </div>
            )}

            <p
              style={{ color: "#3f3f46", fontSize: "10px", marginTop: "10px" }}
            >
              {imageSlots.length}/10 images
              {isEdit &&
                " · Images without the 'New' badge are already saved. Only changes will be uploaded."}
            </p>
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
