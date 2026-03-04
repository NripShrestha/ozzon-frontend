import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  Battery,
} from "lucide-react";

import logo from "../../assets/Logo.png";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // If already logged in, redirect
    const token = localStorage.getItem("ozzonToken");
    const user = JSON.parse(localStorage.getItem("ozzonUser") || "null");
    if (token && user) {
      window.location.href = user.role === "admin" ? "/admin" : "/";
    }
    setTimeout(() => setMounted(true), 50);
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid credentials.");
      } else {
        localStorage.setItem("ozzonToken", data.token);
        localStorage.setItem(
          "ozzonUser",
          JSON.stringify({
            _id: data._id,
            name: data.name,
            email: data.email,
            role: data.role,
          }),
        );
        setSuccess(true);
        setTimeout(() => {
          window.location.href = data.role === "admin" ? "/admin" : "/";
        }, 1200);
      }
    } catch (err) {
      setError("Cannot connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-[#0d0d0d] flex"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── LEFT PANEL ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] relative overflow-hidden p-14"
        style={{
          background:
            "linear-gradient(135deg, #0d0d0d 0%, #1a0a0a 50%, #1a0a0a 100%)",
        }}
      >
        {/* Glow effects */}
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "480px",
            height: "480px",
            background:
              "radial-gradient(circle, rgba(237,27,53,0.15) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "-60px",
            width: "280px",
            height: "280px",
            background:
              "radial-gradient(circle, rgba(237,27,53,0.07) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "1px",
            background:
              "linear-gradient(to bottom, transparent, rgba(237,27,53,0.5), transparent)",
          }}
        />

        {/* Logo */}
        <div>
          {logo ? (
            <img
              src={logo}
              alt="OZZON"
              style={{ height: "48px", objectFit: "contain" }}
            />
          ) : (
            <span
              style={{
                fontSize: "28px",
                fontWeight: 900,
                letterSpacing: "-0.05em",
                color: "white",
              }}
            >
              OZZ<span style={{ color: "#ed1b35" }}>ON</span>
            </span>
          )}
        </div>

        {/* Main copy */}
        <div>
          <p
            style={{
              color: "#ed1b35",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              marginBottom: "20px",
            }}
          >
            Welcome Back
          </p>
          <h2
            style={{
              fontSize: "clamp(40px, 4vw, 60px)",
              fontWeight: 900,
              lineHeight: 1.05,
              color: "white",
              textTransform: "uppercase",
              letterSpacing: "-0.03em",
              fontStyle: "italic",
            }}
          >
            Fuel Your
            <br />
            <span style={{ color: "#ed1b35" }}>Drive.</span>
          </h2>
        </div>

        {/* Feature list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {[].map((item) => (
            <div
              key={item}
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  background: "#ed1b35",
                  borderRadius: "50%",
                  flexShrink: 0,
                }}
              />
              <span style={{ color: "#71717a", fontSize: "13px" }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative"
        style={{
          background: "#111111",
          transition: "opacity 0.6s ease, transform 0.6s ease",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(24px)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "15%",
            right: "15%",
            height: "1px",
            background:
              "linear-gradient(to right, transparent, rgba(237,27,53,0.6), transparent)",
          }}
        />

        <div style={{ width: "100%", maxWidth: "400px" }}>
          {/* Mobile logo */}
          <div
            className="lg:hidden"
            style={{ marginBottom: "40px", textAlign: "center" }}
          >
            {logo ? (
              <img
                src={logo}
                alt="OZZON"
                style={{
                  height: "36px",
                  objectFit: "contain",
                  margin: "0 auto",
                }}
              />
            ) : (
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: 900,
                  letterSpacing: "-0.05em",
                  color: "white",
                }}
              >
                OZZ<span style={{ color: "#ed1b35" }}>ON</span>
              </span>
            )}
          </div>

          <p
            style={{
              color: "#ed1b35",
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Sign In
          </p>
          <h1
            style={{
              color: "white",
              fontSize: "32px",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              marginBottom: "8px",
            }}
          >
            Welcome Back
          </h1>
          <p
            style={{ color: "#52525b", fontSize: "13px", marginBottom: "36px" }}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{
                color: "#ed1b35",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Create one
            </Link>
          </p>

          {/* Success */}
          {success && (
            <div
              style={{
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.3)",
                borderRadius: "8px",
                padding: "14px 16px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <CheckCircle size={16} color="#22c55e" />
              <span
                style={{ color: "#22c55e", fontSize: "13px", fontWeight: 600 }}
              >
                Login successful! Redirecting…
              </span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              style={{
                background: "rgba(237,27,53,0.08)",
                border: "1px solid rgba(237,27,53,0.3)",
                borderRadius: "8px",
                padding: "14px 16px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <AlertCircle size={16} color="#ed1b35" />
              <span style={{ color: "#ed1b35", fontSize: "13px" }}>
                {error}
              </span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            {/* Email */}
            <InputField
              label="Email Address"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={handleChange}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused("")}
              focused={focused === "email"}
              icon={<Mail size={15} />}
            />

            {/* Password */}
            <InputField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused("")}
              focused={focused === "password"}
              icon={<Lock size={15} />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    color: "#52525b",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              style={{
                marginTop: "8px",
                width: "100%",
                padding: "14px",
                background: loading || success ? "#3f0d14" : "#ed1b35",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: 700,
                fontSize: "12px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                cursor: loading || success ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s ease",
                boxShadow:
                  loading || success
                    ? "none"
                    : "0 8px 24px rgba(237,27,53,0.25)",
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
              {loading ? (
                <>
                  <LoadingSpinner /> Signing In…
                </>
              ) : success ? (
                <>
                  <CheckCircle size={16} /> Signed In!
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "28px 0",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "#1f1f1f" }} />
            <span
              style={{
                color: "#3f3f46",
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
              }}
            >
              or
            </span>
            <div style={{ flex: 1, height: "1px", background: "#1f1f1f" }} />
          </div>

          <Link
            to="/register"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              width: "100%",
              padding: "13px",
              background: "transparent",
              color: "white",
              border: "1px solid #27272a",
              borderRadius: "6px",
              fontWeight: 700,
              fontSize: "12px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              textDecoration: "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#ed1b35";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(237,27,53,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#27272a";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <Battery size={14} color="#ed1b35" />
            Create New Account
          </Link>

          <p
            style={{
              marginTop: "28px",
              fontSize: "11px",
              color: "#27272a",
              textAlign: "center",
            }}
          >
            OZZON Industrial Excellence · Secure Login
          </p>
        </div>
      </div>
    </div>
  );
};

/* ─── Reusable Input Field ─── */
const InputField = ({
  label,
  name,
  type,
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  focused,
  icon,
  rightElement,
}) => (
  <div>
    <label
      style={{
        display: "block",
        fontSize: "10px",
        fontWeight: 700,
        color: "#a1a1aa",
        letterSpacing: "0.3em",
        textTransform: "uppercase",
        marginBottom: "8px",
      }}
    >
      {label}
    </label>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "#1a1a1a",
        border: `1px solid ${focused ? "#ed1b35" : "#27272a"}`,
        borderRadius: "6px",
        padding: "0 14px",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        boxShadow: focused ? "0 0 0 3px rgba(237,27,53,0.1)" : "none",
      }}
    >
      <span
        style={{
          color: focused ? "#ed1b35" : "#3f3f46",
          marginRight: "10px",
          display: "flex",
          transition: "color 0.2s",
        }}
      >
        {icon}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete="off"
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          color: "white",
          fontSize: "14px",
          padding: "13px 0",
        }}
      />
      {rightElement && (
        <span style={{ marginLeft: "8px", display: "flex" }}>
          {rightElement}
        </span>
      )}
    </div>
  </div>
);

/* ─── Spinner ─── */
const LoadingSpinner = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    style={{ animation: "spin 0.8s linear infinite" }}
  >
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <circle
      cx="8"
      cy="8"
      r="6"
      stroke="rgba(255,255,255,0.2)"
      strokeWidth="2"
    />
    <path
      d="M8 2 A6 6 0 0 1 14 8"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default Login;
