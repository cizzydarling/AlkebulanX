import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import {
  FALLBACK_COUNTRY_OPTIONS,
  getCountryConfig,
  loadCountryOptions,
  providerLabel,
} from "../data/countries";
import { countryFlag } from "../utils/countryFlags";
import { detectPhoneMeta } from "../utils/phoneUtils";
import {
  MetricTile,
  PremiumBadge,
  PremiumCard,
  PremiumHero,
  PremiumPanel,
} from "../components/ui/PremiumShell";
import PageWrap from "../components/ui/PageWrap";

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

const emptyForm = (country) => ({
  nickname: "",
  full_name: "",
  phone_number: "",
  country: country.name,
  city: country.cities?.[0] || "",
  payout_method: "mobile_money",
  provider_preference: "",
  mobile_money_network: country.networks?.[0] || "",
  relationship_to_sender: "",
});

export default function RecipientsPage() {
  const [countries, setCountries] = useState(FALLBACK_COUNTRY_OPTIONS);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRecipients, setLoadingRecipients] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const defaultCountry = countries[0] || FALLBACK_COUNTRY_OPTIONS[0];

  const [form, setForm] = useState(() => emptyForm(FALLBACK_COUNTRY_OPTIONS[0]));

  const selectedCountry = useMemo(
    () => getCountryConfig(form.country, countries),
    [form.country, countries]
  );

  const selectedEditCountry = useMemo(
    () => getCountryConfig(editForm.country, countries),
    [editForm.country, countries]
  );

  async function loadRecipients(showError = true) {
    try {
      const res = await api.get("/recipients");
      setRecipients(
        Array.isArray(res.data) ? res.data : res.data?.recipients || []
      );
    } catch (err) {
      console.error(err);
      if (showError) setError("Failed to load recipients.");
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        const loadedCountries = await loadCountryOptions();
        const safeCountries = loadedCountries?.length
          ? loadedCountries
          : FALLBACK_COUNTRY_OPTIONS;

        if (cancelled) return;

        setCountries(safeCountries);
        setForm(emptyForm(safeCountries[0]));

        const res = await api.get("/recipients");

        if (cancelled) return;

        setRecipients(
          Array.isArray(res.data) ? res.data : res.data?.recipients || []
        );
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError("Failed to load recipient setup data.");
        }
      } finally {
        if (!cancelled) {
          setLoadingRecipients(false);
        }
      }
    }

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateField(field, value) {
    setError("");
    setSuccess("");

    setForm((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "country") {
        const config = getCountryConfig(value, countries);
        next.city = config?.cities?.[0] || "";
        next.mobile_money_network =
          next.payout_method === "mobile_money" ? config?.networks?.[0] || "" : "";
        next.provider_preference = "";
      }

      if (field === "payout_method" && value === "bank_account") {
        next.mobile_money_network = "";
      }

      if (field === "payout_method" && value === "mobile_money") {
        const config = getCountryConfig(next.country, countries);
        next.mobile_money_network = config?.networks?.[0] || "";
      }

      return next;
    });
  }

  function updateEditField(field, value) {
    setError("");
    setSuccess("");

    setEditForm((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "country") {
        const config = getCountryConfig(value, countries);
        next.city = config?.cities?.[0] || "";
        next.mobile_money_network =
          next.payout_method === "mobile_money" ? config?.networks?.[0] || "" : "";
        next.provider_preference = "";
      }

      if (field === "payout_method" && value === "bank_account") {
        next.mobile_money_network = "";
      }

      if (field === "payout_method" && value === "mobile_money") {
        const config = getCountryConfig(next.country, countries);
        next.mobile_money_network = config?.networks?.[0] || "";
      }

      return next;
    });
  }

  async function createRecipient(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/recipients", form);
      setForm(emptyForm(countries[0] || FALLBACK_COUNTRY_OPTIONS[0]));
      setSuccess("Recipient saved successfully.");
      await loadRecipients(false);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || "Failed to create recipient.");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(recipient) {
    setEditingId(recipient.id);
    setError("");
    setSuccess("");

    const countryConfig =
      getCountryConfig(recipient.country, countries) || defaultCountry;

    setEditForm({
      nickname: recipient.nickname || "",
      full_name: recipient.full_name || "",
      phone_number: recipient.phone_number || "",
      country: recipient.country || countryConfig.name,
      city: recipient.city || countryConfig.cities?.[0] || "",
      payout_method: recipient.payout_method || "mobile_money",
      provider_preference: recipient.provider_preference || "",
      mobile_money_network:
        recipient.mobile_money_network || countryConfig.networks?.[0] || "",
      relationship_to_sender: recipient.relationship_to_sender || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveEdit(id) {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.patch(`/recipients/${id}`, editForm);
      setEditingId(null);
      setEditForm({});
      setSuccess("Recipient updated successfully.");
      await loadRecipients(false);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || "Failed to update recipient.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteRecipient(id) {
    if (!confirm("Delete this recipient?")) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/recipients/${id}`);
      setSuccess("Recipient deleted.");
      await loadRecipients(false);
    } catch (err) {
      console.error(err);
      setError("Failed to delete recipient.");
    }
  }

  return (
    <PageWrap>
      <PremiumHero
        eyebrow="Recipient Network"
        title="Your trusted payout circle, beautifully organized."
        description="Save family, friends, and business recipients with country, payout method, network, and provider preferences before you send."
        primaryLabel="Send money"
        primaryTo="/send"
        secondaryLabel="Add recipient"
        secondaryTo="#recipient-form"
      >
        <PremiumPanel>
          <PremiumBadge tone="gold">Payout readiness</PremiumBadge>

          <p className="mt-5 text-sm text-slate-300">Saved recipients</p>
          <p className="mt-2 text-5xl font-black text-white">
            {recipients.length}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <MetricTile
              label="Countries"
              value={countries.length}
              hint="Supported setup"
            />
            <MetricTile
              label="Default"
              value={defaultCountry?.currency || "CAD"}
              hint={defaultCountry?.name || "Country"}
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

      <div className="grid gap-6 lg:grid-cols-[460px_1fr]">
        <PremiumCard id="recipient-form">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">
            Add recipient
          </p>

          <h2 className="mt-2 text-3xl font-black text-slate-950">
            Recipient details
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            These details help AlkebulanX route payout options correctly.
          </p>

          <form onSubmit={createRecipient} className="mt-6 space-y-4">
            <input
              placeholder="Nickname e.g. Mom"
              value={form.nickname}
              onChange={(e) => updateField("nickname", e.target.value)}
              className={inputClass}
            />

            <input
              placeholder="Full legal name"
              value={form.full_name}
              onChange={(e) => updateField("full_name", e.target.value)}
              className={inputClass}
              required
            />

            <input
              placeholder="Phone number"
              value={form.phone_number}
              onChange={(e) => {
                const value = e.target.value;
                updateField("phone_number", value);

                const detected = detectPhoneMeta(value);

                if (detected.country) {
                  updateField("country", detected.country);
                }

                if (detected.network) {
                  updateField("mobile_money_network", detected.network);
                }
              }}
              className={inputClass}
              required
            />

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-black text-slate-700">
                  Country
                </label>
                <select
                  value={form.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  className={`${inputClass} mt-2`}
                >
                  {countries.map((country) => (
                    <option key={country.name} value={country.name}>
                      {countryFlag(country.name)} {country.name} ({country.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-black text-slate-700">
                  City
                </label>
                <select
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className={`${inputClass} mt-2`}
                >
                  {(selectedCountry?.cities || []).map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-black text-slate-700">
                Payout method
              </label>
              <select
                value={form.payout_method}
                onChange={(e) => updateField("payout_method", e.target.value)}
                className={`${inputClass} mt-2`}
              >
                <option value="mobile_money">Mobile money</option>
                <option value="bank_account">Bank account</option>
              </select>
            </div>

            {form.payout_method === "mobile_money" && (
              <div>
                <label className="text-sm font-black text-slate-700">
                  Mobile money network
                </label>
                <select
                  value={form.mobile_money_network}
                  onChange={(e) =>
                    updateField("mobile_money_network", e.target.value)
                  }
                  className={`${inputClass} mt-2`}
                >
                  {(selectedCountry?.networks || []).map((network) => (
                    <option key={network} value={network}>
                      {network}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-sm font-black text-slate-700">
                Preferred provider
              </label>
              <select
                value={form.provider_preference}
                onChange={(e) =>
                  updateField("provider_preference", e.target.value)
                }
                className={`${inputClass} mt-2`}
              >
                <option value="">Best available provider</option>
                {(selectedCountry?.providers || []).map((provider) => (
                  <option key={provider} value={provider}>
                    {providerLabel(provider)}
                  </option>
                ))}
              </select>
            </div>

            <input
              placeholder="Relationship e.g. parent, sibling, friend"
              value={form.relationship_to_sender}
              onChange={(e) =>
                updateField("relationship_to_sender", e.target.value)
              }
              className={inputClass}
            />

            <button
              type="submit"
              disabled={loading || loadingRecipients}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-400 px-5 py-4 font-black text-slate-950 shadow-sm transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save recipient"}
            </button>
          </form>
        </PremiumCard>

        <PremiumCard>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">
                Saved people
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">
                Recipient list
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Your trusted recipients for supported corridors.
              </p>
            </div>

            <Link
              to="/send"
              className="rounded-2xl bg-slate-950 px-5 py-3 text-center font-black text-white hover:bg-emerald-700"
            >
              Send money
            </Link>
          </div>

          {loadingRecipients ? (
            <div className="mt-6 rounded-[2rem] bg-slate-50 p-8 text-center text-slate-600">
              Loading recipients...
            </div>
          ) : recipients.length === 0 ? (
            <div className="mt-6 rounded-[2rem] bg-slate-50 p-8 text-center">
              <p className="text-lg font-black text-slate-950">
                No recipients yet
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Add your first recipient to start comparing providers.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {recipients.map((recipient) => {
                const isEditing = editingId === recipient.id;
                const config = getCountryConfig(recipient.country, countries);

                return (
                  <div
                    key={recipient.id}
                    className="rounded-[2rem] border p-5 transition hover:border-emerald-200 hover:bg-emerald-50/30"
                  >
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <input
                            placeholder="Nickname"
                            value={editForm.nickname || ""}
                            onChange={(e) =>
                              updateEditField("nickname", e.target.value)
                            }
                            className={inputClass}
                          />

                          <input
                            placeholder="Full name"
                            value={editForm.full_name || ""}
                            onChange={(e) =>
                              updateEditField("full_name", e.target.value)
                            }
                            className={inputClass}
                          />
                        </div>

                        <input
                          placeholder="Phone number"
                          value={editForm.phone_number || ""}
                          onChange={(e) =>
                            updateEditField("phone_number", e.target.value)
                          }
                          className={inputClass}
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                          <select
                            value={editForm.country || ""}
                            onChange={(e) =>
                              updateEditField("country", e.target.value)
                            }
                            className={inputClass}
                          >
                            {countries.map((country) => (
                              <option key={country.name} value={country.name}>
                                {countryFlag(country.name)} {country.name} (
                                {country.currency})
                              </option>
                            ))}
                          </select>

                          <select
                            value={editForm.city || ""}
                            onChange={(e) =>
                              updateEditField("city", e.target.value)
                            }
                            className={inputClass}
                          >
                            {(selectedEditCountry?.cities || []).map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </select>
                        </div>

                        <select
                          value={editForm.payout_method || "mobile_money"}
                          onChange={(e) =>
                            updateEditField("payout_method", e.target.value)
                          }
                          className={inputClass}
                        >
                          <option value="mobile_money">Mobile money</option>
                          <option value="bank_account">Bank account</option>
                        </select>

                        {editForm.payout_method === "mobile_money" && (
                          <select
                            value={editForm.mobile_money_network || ""}
                            onChange={(e) =>
                              updateEditField(
                                "mobile_money_network",
                                e.target.value
                              )
                            }
                            className={inputClass}
                          >
                            {(selectedEditCountry?.networks || []).map(
                              (network) => (
                                <option key={network} value={network}>
                                  {network}
                                </option>
                              )
                            )}
                          </select>
                        )}

                        <select
                          value={editForm.provider_preference || ""}
                          onChange={(e) =>
                            updateEditField(
                              "provider_preference",
                              e.target.value
                            )
                          }
                          className={inputClass}
                        >
                          <option value="">Best available provider</option>
                          {(selectedEditCountry?.providers || []).map(
                            (provider) => (
                              <option key={provider} value={provider}>
                                {providerLabel(provider)}
                              </option>
                            )
                          )}
                        </select>

                        <input
                          placeholder="Relationship"
                          value={editForm.relationship_to_sender || ""}
                          onChange={(e) =>
                            updateEditField(
                              "relationship_to_sender",
                              e.target.value
                            )
                          }
                          className={inputClass}
                        />

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => saveEdit(recipient.id)}
                            disabled={loading}
                            className="rounded-2xl bg-emerald-600 px-4 py-2 font-black text-white hover:bg-emerald-700 disabled:opacity-60"
                          >
                            Save changes
                          </button>

                          <button
                            onClick={cancelEdit}
                            className="rounded-2xl border px-4 py-2 font-black text-slate-700 hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-2xl shadow-sm">
                              {countryFlag(recipient.country)}
                            </div>

                            <div>
                              <p className="text-xl font-black text-slate-950">
                                {recipient.nickname || recipient.full_name}
                              </p>
                              <p className="text-sm text-slate-500">
                                {recipient.full_name}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                            <div className="rounded-2xl bg-slate-50 p-3">
                              <p className="text-xs text-slate-500">Location</p>
                              <p className="font-black text-slate-950">
                                {recipient.city || "City not set"},{" "}
                                {recipient.country}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-3">
                              <p className="text-xs text-slate-500">Currency</p>
                              <p className="font-black text-slate-950">
                                {config?.currency || "N/A"}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-3">
                              <p className="text-xs text-slate-500">Payout</p>
                              <p className="font-black text-slate-950">
                                {recipient.payout_method}
                                {recipient.mobile_money_network
                                  ? ` • ${recipient.mobile_money_network}`
                                  : ""}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-3">
                              <p className="text-xs text-slate-500">Provider</p>
                              <p className="font-black text-slate-950">
                                {recipient.provider_preference
                                  ? providerLabel(recipient.provider_preference)
                                  : "Best available"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(recipient)}
                            className="rounded-2xl border px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => deleteRecipient(recipient.id)}
                            className="rounded-2xl border border-red-200 px-4 py-2 text-sm font-black text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </PremiumCard>
      </div>
    </PageWrap>
  );
}
