import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, saveAuth } from "../api/client";

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    province: "",
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
      const res = await api.post("/auth/register", form);
      saveAuth(res.data.access_token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Registration failed. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border bg-white shadow-sm lg:grid-cols-[1fr_520px]">
      <section className="bg-slate-950 p-8 text-white md:p-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
          AlkebulanX
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
          Create your money movement account.
        </h1>

        <p className="mt-4 text-slate-300">
          Set up your profile, save trusted recipients, compare provider
          options, and track Canada-to-Africa transfer requests.
        </p>

        <div className="mt-8 grid gap-3 text-sm text-slate-300">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            Start with a free account
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            Add recipients before sending
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            Compare provider-powered checkout options
          </div>
        </div>
      </section>

      <section className="p-8 md:p-10">
        <h2 className="text-3xl font-black text-slate-900">
          Create account
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Your profile helps personalize the dashboard and prepare transfer
          workflows.
        </p>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
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

          <div className="grid gap-4 md:grid-cols-2">
            <input
              placeholder="First name"
              value={form.first_name}
              onChange={(e) => updateField("first_name", e.target.value)}
              className={inputClass}
            />

            <input
              placeholder="Last name"
              value={form.last_name}
              onChange={(e) => updateField("last_name", e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              placeholder="Phone number"
              value={form.phone_number}
              onChange={(e) => updateField("phone_number", e.target.value)}
              className={inputClass}
            />

            <input
              placeholder="Province"
              value={form.province}
              onChange={(e) => updateField("province", e.target.value)}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-emerald-600 px-5 py-4 font-black text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-black text-emerald-700">
            Login
          </Link>
        </p>
      </section>
    </div>
  );
}