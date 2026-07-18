"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Leaf, LoaderCircle, ShieldCheck, X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || "https://agrisence-backend.onrender.com/api";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isLogin = mode === "login";

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const fieldError = useMemo(() => {
    if (!form.email && !form.password) {
      return "";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return "Enter a valid email address.";
    }
    if (form.password.length < 6) {
      return "Password must be at least 6 characters.";
    }
    if (!isLogin && form.name.trim().length < 2) {
      return "Name must be at least 2 characters.";
    }
    if (!isLogin && form.password !== form.confirmPassword) {
      return "Passwords do not match.";
    }
    return "";
  }, [form, isLogin]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const reset = () => {
    setForm(initialForm);
    setError("");
    setLoading(false);
  };

  const toggleMode = (nextMode) => {
    setMode(nextMode);
    reset();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (fieldError) {
      setError(fieldError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? `${API_URL}/auth/login` : `${API_URL}/auth/signup`;
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : { name: form.name.trim(), email: form.email, password: form.password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Authentication failed.");
      }

      const storage = remember ? window.localStorage : window.sessionStorage;
      storage.setItem("token", data.token);
      storage.setItem("user", JSON.stringify(data.user));

      onSuccess(data.user, data.token);
      onClose();
      reset();
    } catch (submitError) {
      setError(submitError.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/18 backdrop-blur-sm"
          aria-label="Close dialog"
        />

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          className="panel relative z-10 w-full max-w-xl rounded-[2.2rem] p-6 sm:p-8"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-slate-100/78 text-slate-900"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="eyebrow">
            <Leaf className="h-3.5 w-3.5 text-emerald-500" />
            Save your conversations
          </div>

          <h2 className="section-title mt-5 text-[2rem]">{isLogin ? "Welcome back" : "Create your AgriSense account"}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Use one account for saved assistant sessions and community participation across the platform.
          </p>

          <div className="mt-6 inline-flex rounded-full border border-emerald-100 bg-slate-100/76 p-1">
            {["login", "signup"].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleMode(value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  mode === value
                    ? "bg-[linear-gradient(90deg,rgba(214,231,204,0.96),rgba(243,247,239,0.96))] text-slate-950"
                    : "text-slate-500"
                }`}
              >
                {value === "login" ? "Login" : "Sign up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {!isLogin && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} className="field-input" placeholder="Muhammad Awais" />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="field-input" placeholder="farmer@example.com" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} className="field-input" placeholder="********" />
            </div>

            {!isLogin && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Confirm password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="field-input"
                  placeholder="********"
                />
              </div>
            )}

            <label className="flex items-center gap-3 text-sm text-slate-600">
              <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="h-4 w-4 rounded border-slate-300" />
              <span>Keep me signed in on this device</span>
            </label>

            {(error || fieldError) && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error || fieldError}
              </div>
            )}

            <button type="submit" disabled={loading} className="button-primary w-full justify-center disabled:opacity-60">
              {loading ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : isLogin ? (
                "Log in"
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <div className="mt-6 rounded-[1.4rem] border border-emerald-100 bg-[linear-gradient(135deg,rgba(235,245,226,0.78),rgba(243,247,239,0.76))] px-4 py-4 text-sm text-slate-600">
            <div className="flex items-center gap-2 font-medium text-slate-950">
              <ShieldCheck className="h-4 w-4 text-lime-500" />
              Local account workflow
            </div>
            <p className="mt-2 leading-7">
              Authentication, saved sessions, and community posting all route through the repository&apos;s Node backend.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
