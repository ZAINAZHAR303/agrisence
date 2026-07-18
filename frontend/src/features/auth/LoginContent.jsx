"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Leaf, LoaderCircle, ShieldCheck } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || "https://agrisence-backend.onrender.com/api";

const initialForm = {
  mode: "login",
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function LoginContent() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isLogin = form.mode === "login";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const switchMode = (mode) => {
    setForm((current) => ({
      ...current,
      mode,
      password: "",
      confirmPassword: "",
    }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!isLogin && form.name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    if (!isLogin && form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
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

      window.localStorage.setItem("token", data.token);
      window.localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/assistant");
    } catch (submitError) {
      setError(submitError.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-dark pt-6">
      <div className="page-wrap pb-16">
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="panel rounded-[2.4rem] p-8 md:p-10">
            <div className="eyebrow">
              <Leaf className="h-3.5 w-3.5 text-emerald-500" />
              account access
            </div>
            <h1 className="section-title mt-6 max-w-2xl">
              Sign in to save assistant history and participate in the field network.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-600">
              This account flow connects the assistant, saved conversations, and community posting to the local
              backend.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                ["Saved chats", "Assistant sessions stay attached to your account."],
                ["Community posting", "Create, like, and comment on field reports."],
                ["Single identity", "One login across the product surface."],
              ].map(([title, body]) => (
                <div key={title} className="rounded-[1.6rem] border border-emerald-100 bg-slate-100/74 p-5">
                  <div className="font-display text-xl text-slate-950">{title}</div>
                  <div className="mt-3 text-sm leading-7 text-slate-600">{body}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[1.7rem] border border-emerald-100 bg-[linear-gradient(135deg,rgba(235,245,226,0.78),rgba(243,247,239,0.76))] p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-950">
                <ShieldCheck className="h-4 w-4 text-lime-500" />
                Local environment
              </div>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
                The frontend expects the authentication API on `http://localhost:5000/api` unless environment variables
                override it.
              </p>
            </div>
          </div>

          <div className="panel rounded-[2.4rem] p-8">
            <div className="inline-flex rounded-full border border-emerald-100 bg-slate-100/76 p-1">
              {["login", "signup"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => switchMode(mode)}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    form.mode === mode
                      ? "bg-[linear-gradient(90deg,rgba(214,231,204,0.96),rgba(243,247,239,0.96))] text-slate-950"
                      : "text-slate-500"
                  }`}
                >
                  {mode === "login" ? "Login" : "Sign up"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {!isLogin && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} className="field-input" placeholder="Sajid Ali" />
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

              {error && <div className="rounded-[1.3rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

              <button type="submit" disabled={loading} className="button-primary w-full justify-center disabled:opacity-60">
                {loading ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : isLogin ? (
                  "Login"
                ) : (
                  "Create account"
                )}
              </button>
            </form>

            <div className="mt-6 text-sm text-slate-500">
              Prefer to explore first?{" "}
              <Link href="/assistant" className="font-medium text-slate-950">
                Open assistant
              </Link>
              {" "}or{" "}
              <Link href="/disease-detection" className="font-medium text-slate-950">
                scan a leaf
              </Link>
              .
            </div>

            <Link href="/social" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-slate-950">
              Go to community
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
