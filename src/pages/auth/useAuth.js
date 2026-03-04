// src/hooks/useAuth.js
// Shared auth utilities — import anywhere

/**
 * Get the current logged-in user from localStorage
 * Returns { token, user } or null if not logged in
 */
export const getAuth = () => {
  const token = localStorage.getItem("ozzonToken");
  const user = JSON.parse(localStorage.getItem("ozzonUser") || "null");
  if (!token || !user) return null;
  return { token, user };
};

/**
 * Clear auth and redirect to login
 */
export const logout = (redirectTo = "/login") => {
  localStorage.removeItem("ozzonToken");
  localStorage.removeItem("ozzonUser");
  window.location.href = redirectTo;
};

/**
 * Authenticated fetch wrapper
 * Automatically attaches Bearer token and handles 401
 */
export const authFetch = async (url, options = {}) => {
  const auth = getAuth();

  const headers = {
    "Content-Type": "application/json",
    ...(auth ? { Authorization: `Bearer ${auth.token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });

  // Auto logout on expired / invalid token
  if (res.status === 401) {
    logout();
    throw new Error("Session expired. Please log in again.");
  }

  return res;
};

/**
 * React hook to protect pages
 * Usage: call inside any page component
 *
 * const { user } = useRequireAuth();                  // any logged-in user
 * const { user } = useRequireAuth({ adminOnly: true }); // admin only
 */
import { useEffect, useState } from "react";

export const useRequireAuth = ({ adminOnly = false } = {}) => {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    if (!auth) {
      window.location.href = "/login";
      return;
    }

    if (adminOnly && auth.user.role !== "admin") {
      window.location.href = "/";
      return;
    }

    setUser(auth.user);
    setChecking(false);
  }, [adminOnly]);

  return { user, checking };
};
