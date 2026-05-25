import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, saveAuth } from "../api/client";

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field, value) {
    setError("");
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", form);
      saveAuth(res.data.access_token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.detail || "Login failed. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border bg-white shadow-sm lg:grid-cols-[1fr_420px]">
      <section className="bg-slate-950 p-8 text-white md:p-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
          AlkebulanX
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
          Welcome back.
        </h1>

        <p className="mt-4 text-slate-300">
          Sign in to manage recipients, compare provider options, and track
          Canada-to-Africa transfer handoffs.
        </p>

        <div className="mt-8 space-y-3 text-sm text-slate-300">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            Provider-powered checkout
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            Compliance-aware transfer review
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            Saved recipient network
          </div>
        </div>
      </section>

      <section className="p-8 md:p-10">
        <h2 className="text-3xl font-black text-slate-900">Login</h2>
        <p className="mt-2 text-sm text-slate-600">
          Continue to your AlkebulanX dashboard.
        </p>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            className={inputClass}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            className={inputClass}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-600 px-5 py-4 font-black text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          New to AlkebulanX?{" "}
          <Link to="/register" className="font-black text-emerald-700">
            Create an account
          </Link>
        </p>
      </section>
    </div>
  );
}