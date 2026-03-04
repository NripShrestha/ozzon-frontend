import React, { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Zap,
  User,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import logo from "../../assets/Logo.png";


const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const passwordStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = passwordStrength(form.password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"][
    strength
  ];
  const strengthColor = [
    "",
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#10b981",
  ][strength];

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError("All fields are required.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed. Please try again.");
      } else {
        // Store token + user
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
        // Redirect after 1.5s
        setTimeout(() => {
          window.location.href = data.role === "admin" ? "/admin" : "/";
        }, 1500);
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
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-100px",
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle, rgba(237,27,53,0.15) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "30%",
            right: "-80px",
            width: "300px",
            height: "300px",
            background:
              "radial-gradient(circle, rgba(237,27,53,0.08) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Vertical line accent */}
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
            Join The Network
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
            Power Your
            <br />
            <span style={{ color: "#ed1b35" }}>Business.</span>
          </h2>
          <p
            style={{
              marginTop: "20px",
              color: "#71717a",
              fontSize: "15px",
              lineHeight: 1.7,
              maxWidth: "360px",
            }}
          >
            Create your OZZON account to access exclusive product ranges, dealer
            pricing, and our full automotive solutions catalog.
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "40px" }}>
          {[
            // ["10M+", "Batteries Sold"],
            // ["15+", "Years Experience"],
            // ["50K+", "Partners"],
          ].map(([num, label]) => (
            <div key={label}>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: 900,
                  color: "white",
                  fontStyle: "italic",
                }}
              >
                {num}
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#52525b",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  marginTop: "2px",
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL (Form) ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative"
        style={{
          background: "#111111",
          transition: "opacity 0.6s ease, transform 0.6s ease",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(24px)",
        }}
      >
        {/* Top border accent */}
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

        <div style={{ width: "100%", maxWidth: "420px" }}>
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
            Create Account
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
            Register
          </h1>
          <p
            style={{ color: "#52525b", fontSize: "13px", marginBottom: "36px" }}
          >
            Already have an account?{" "}
            <a
              href="/login"
              style={{
                color: "#ed1b35",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Sign in
            </a>
          </p>

          {/* Success state */}
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
                Account created! Redirecting…
              </span>
            </div>
          )}

          {/* Error state */}
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
            {/* Full Name */}
            <InputField
              label="Full Name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              onFocus={() => setFocused("name")}
              onBlur={() => setFocused("")}
              focused={focused === "name"}
              icon={<User size={15} />}
            />

            {/* Email */}
            <InputField
              label="Email Address"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={handleChange}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused("")}
              focused={focused === "email"}
              icon={<Mail size={15} />}
            />

            {/* Password */}
            <div>
              <InputField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
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
              {/* Strength bar */}
              {form.password && (
                <div style={{ marginTop: "8px" }}>
                  <div
                    style={{ display: "flex", gap: "4px", marginBottom: "4px" }}
                  >
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: "3px",
                          borderRadius: "2px",
                          background: i <= strength ? strengthColor : "#27272a",
                          transition: "background 0.3s ease",
                        }}
                      />
                    ))}
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      color: strengthColor,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    {strengthLabel}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <InputField
              label="Confirm Password"
              name="confirm"
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat password"
              value={form.confirm}
              onChange={handleChange}
              onFocus={() => setFocused("confirm")}
              onBlur={() => setFocused("")}
              focused={focused === "confirm"}
              icon={<Lock size={15} />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    color: "#52525b",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                  }}
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
              matchIndicator={
                form.confirm &&
                (form.confirm === form.password ? (
                  <CheckCircle size={14} color="#22c55e" />
                ) : (
                  <AlertCircle size={14} color="#ef4444" />
                ))
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
                  <LoadingSpinner />
                  Creating Account…
                </>
              ) : success ? (
                <>
                  <CheckCircle size={16} />
                  Account Created!
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p
            style={{
              marginTop: "28px",
              fontSize: "11px",
              color: "#3f3f46",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            By registering, you agree to OZZON's{" "}
            <a
              href="/terms"
              style={{ color: "#52525b", textDecoration: "underline" }}
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              style={{ color: "#52525b", textDecoration: "underline" }}
            >
              Privacy Policy
            </a>
            .
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
  matchIndicator,
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
      {matchIndicator && (
        <span style={{ marginLeft: "8px", display: "flex" }}>
          {matchIndicator}
        </span>
      )}
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

export default Register;
