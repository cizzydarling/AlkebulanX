import { useCallback, useEffect, useMemo, useState } from "react";
import { api, getStoredUser, saveAuth } from "../api/client";
import {
  MetricTile,
  PremiumBadge,
  PremiumCard,
  PremiumHero,
  PremiumPanel,
} from "../components/ui/PremiumShell";
import PageWrap from "../components/ui/PageWrap";

const inputClass =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

export default function ProfilePage() {
  const [user, setUser] = useState(getStoredUser());
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    province: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const completion = useMemo(() => {
    const fields = [
      form.first_name,
      form.last_name,
      form.phone_number,
      form.province,
      user?.email,
    ];

    const completed = fields.filter((value) => String(value || "").trim()).length;
    return Math.round((completed / fields.length) * 100);
  }, [form, user]);

  const syncForm = useCallback((profile) => {
    setForm({
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      phone_number: profile?.phone_number || "",
      province: profile?.province || "",
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const res = await api.get("/auth/me");
        const token = localStorage.getItem("alkebulanx_token");

        if (cancelled) return;

        saveAuth(token, res.data);
        setUser(res.data);
        syncForm(res.data);
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError("Failed to load profile. Please refresh or try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [syncForm]);

  function updateField(field, value) {
    setError("");
    setSuccess("");
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.patch("/auth/me", form);
      const token = localStorage.getItem("alkebulanx_token");

      saveAuth(token, res.data);
      setUser(res.data);
      syncForm(res.data);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageWrap>
      <PremiumHero
        eyebrow="Account Center"
        title="Keep your transfer profile launch-ready."
        description="Your account details help AlkebulanX personalize your dashboard, improve transfer readiness, and prepare for provider-powered workflows."
        primaryLabel="Save profile"
        primaryTo="#profile-form"
        secondaryLabel="Start transfer"
        secondaryTo="/send"
      >
        <PremiumPanel>
          <PremiumBadge tone="gold">Readiness score</PremiumBadge>

          <p className="mt-5 text-sm text-slate-300">Profile completion</p>
          <p className="mt-2 text-5xl font-black text-white">{completion}%</p>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-300"
              style={{ width: `${completion}%` }}
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <MetricTile
              label="Verified"
              value={user?.is_verified ? "Yes" : "No"}
              hint="Account state"
            />
            <MetricTile
              label="Role"
              value={user?.role || "user"}
              hint="Access level"
              tone="gold"
            />
          </div>
        </PremiumPanel>
      </PremiumHero>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-800">
          {success}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <PremiumCard id="profile-form">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">
            Personal details
          </p>

          <h2 className="mt-2 text-3xl font-black text-slate-950">
            Profile information
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Keep your contact details accurate for transfer and compliance
            communication.
          </p>

          {loading ? (
            <p className="mt-6 rounded-2xl bg-slate-50 p-5 text-slate-600">
              Loading profile...
            </p>
          ) : (
            <form onSubmit={saveProfile} className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-black text-slate-700">
                  First name
                </label>
                <input
                  value={form.first_name}
                  onChange={(e) => updateField("first_name", e.target.value)}
                  className={inputClass}
                  placeholder="First name"
                />
              </div>

              <div>
                <label className="text-sm font-black text-slate-700">
                  Last name
                </label>
                <input
                  value={form.last_name}
                  onChange={(e) => updateField("last_name", e.target.value)}
                  className={inputClass}
                  placeholder="Last name"
                />
              </div>

              <div>
                <label className="text-sm font-black text-slate-700">
                  Phone
                </label>
                <input
                  value={form.phone_number}
                  onChange={(e) => updateField("phone_number", e.target.value)}
                  className={inputClass}
                  placeholder="+1 514..."
                />
              </div>

              <div>
                <label className="text-sm font-black text-slate-700">
                  Province
                </label>
                <input
                  value={form.province}
                  onChange={(e) => updateField("province", e.target.value)}
                  className={inputClass}
                  placeholder="Quebec"
                />
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Email</p>
                <p className="mt-1 font-black text-slate-950">
                  {user?.email || "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Role</p>
                <p className="mt-1 font-black capitalize text-slate-950">
                  {user?.role || "user"}
                </p>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-400 px-5 py-4 font-black text-slate-950 shadow-sm transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save profile"}
                </button>
              </div>
            </form>
          )}
        </PremiumCard>

        <aside className="space-y-6">
          <PremiumCard className="bg-slate-950 text-white">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-300">
              Access status
            </p>

            <h2 className="mt-2 text-3xl font-black">Account readiness</h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-sm text-slate-300">KYC status</p>
                <p className="mt-1 font-black text-white">
                  {user?.kyc_status || "not_started"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-sm text-slate-300">Compliance status</p>
                <p className="mt-1 font-black text-white">
                  {user?.compliance_status || "clear"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-sm text-slate-300">Verified</p>
                <p className="mt-1 font-black text-white">
                  {user?.is_verified ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard className="border-orange-100 bg-orange-50">
            <p className="font-black text-orange-800">Provider readiness note</p>
            <p className="mt-2 text-sm leading-6 text-orange-700">
              KYC is displayed for product readiness. In production, identity
              checks should be handled by a licensed KYC or payment provider
              workflow.
            </p>
          </PremiumCard>
        </aside>
      </section>
    </PageWrap>
  );
}
