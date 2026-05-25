import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { countryFlag } from "../utils/countryFlags";
import { ProviderPill } from "../utils/providerMeta.jsx";
import {
  FALLBACK_COUNTRY_OPTIONS,
  getCountryConfig,
  loadCountryOptions,
  providerLabel,
} from "../data/countries";
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

export default function SendMoneyPage() {
  const navigate = useNavigate();

  const [countries, setCountries] = useState(FALLBACK_COUNTRY_OPTIONS);
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("family support");
  const [quotes, setQuotes] = useState([]);
  const [loadingRecipients, setLoadingRecipients] = useState(true);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [creatingProvider, setCreatingProvider] = useState(null);
  const [error, setError] = useState("");
  const [previewQuote, setPreviewQuote] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        const loadedCountries = await loadCountryOptions();

        if (cancelled) return;

        setCountries(
          loadedCountries?.length ? loadedCountries : FALLBACK_COUNTRY_OPTIONS
        );

        const recipientsRes = await api.get("/recipients");

        if (cancelled) return;

        setRecipients(
          Array.isArray(recipientsRes.data)
            ? recipientsRes.data
            : recipientsRes.data?.recipients || []
        );
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError("Failed to load recipients. Please refresh or try again.");
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

  const selectedRecipient = useMemo(() => {
    return recipients.find((r) => r.id === Number(selectedRecipientId));
  }, [recipients, selectedRecipientId]);

  const selectedCountry = useMemo(() => {
    if (!selectedRecipient) return null;
    return getCountryConfig(selectedRecipient.country, countries);
  }, [selectedRecipient, countries]);

  const destinationCurrency = selectedCountry?.currency || "GHS";
  const amountNumber = Number(amount || 0);

  const canCompare =
    selectedRecipientId &&
    amountNumber > 0 &&
    !loadingQuotes &&
    recipients.length > 0;

  useEffect(() => {
    const timer = setTimeout(async () => {
      setPreviewQuote(null);

      if (!selectedRecipientId || !amount || Number(amount) <= 0) {
        return;
      }

      setPreviewLoading(true);

      try {
        const res = await api.post("/rates/preview", {
          recipient_id: Number(selectedRecipientId),
          send_amount: Number(amount),
          source_currency: "CAD",
          destination_currency: destinationCurrency,
          reason,
        });

        setPreviewQuote(res.data?.best_quote || null);
      } catch (err) {
        console.error("Preview quote failed.", err);
      } finally {
        setPreviewLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedRecipientId, amount, destinationCurrency, reason]);

  async function getQuotes(e) {
    e.preventDefault();
    setError("");
    setQuotes([]);

    if (!selectedRecipientId) {
      setError("Please select a recipient.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setLoadingQuotes(true);

    try {
      const res = await api.post("/transfers/quote", {
        recipient_id: Number(selectedRecipientId),
        send_amount: Number(amount),
        source_currency: "CAD",
        destination_currency: destinationCurrency,
        reason,
      });

      setQuotes(Array.isArray(res.data?.quotes) ? res.data.quotes : []);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || "Failed to fetch quotes.");
    } finally {
      setLoadingQuotes(false);
    }
  }

  async function createTransfer(provider) {
    setError("");
    setCreatingProvider(provider);

    try {
      const res = await api.post("/transfers", {
        recipient_id: Number(selectedRecipientId),
        send_amount: Number(amount),
        source_currency: "CAD",
        destination_currency: destinationCurrency,
        provider,
        reason,
      });

      const transferId = res.data?.id;
      navigate(`/transfers?created=${transferId || ""}`);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || "Failed to create transfer.");
    } finally {
      setCreatingProvider(null);
    }
  }

  return (
    <PageWrap>
      <PremiumHero
        eyebrow="AlkebulanX Transfer Flow"
        title="Send with precision, compare with confidence."
        description="Choose a trusted recipient, preview the receive amount, compare provider routes, and create a tracked Canada-to-Africa transfer request."
        primaryLabel="Compare providers"
        primaryTo="#transfer-form"
        secondaryLabel="Manage recipients"
        secondaryTo="/recipients"
      >
        <PremiumPanel>
          <PremiumBadge tone="gold">Live estimate</PremiumBadge>

          <p className="mt-5 text-sm text-slate-300">Recipient gets</p>
          <p className="mt-2 text-5xl font-black text-white">
            {previewLoading
              ? "Checking..."
              : previewQuote
              ? `${Number(previewQuote.estimated_receive_amount || 0).toLocaleString(
                  undefined,
                  { maximumFractionDigits: 2 }
                )}`
              : "0.00"}
          </p>

          <p className="mt-2 text-sm font-semibold text-emerald-200">
            {previewQuote?.destination_currency || destinationCurrency}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <MetricTile label="Source" value="CAD" hint="Canada funded" />
            <MetricTile
              label="Route"
              value={selectedRecipient ? destinationCurrency : "—"}
              hint={
                selectedRecipient
                  ? `${countryFlag("Canada")} → ${countryFlag(
                      selectedRecipient.country
                    )}`
                  : "Select recipient"
              }
              tone="gold"
            />
          </div>

          <p className="mt-5 text-sm text-slate-300">
            {previewQuote
              ? `Best option: ${providerLabel(previewQuote.provider)}`
              : "Enter transfer details to generate an estimate."}
          </p>
        </PremiumPanel>
      </PremiumHero>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[460px_1fr]">
        <PremiumCard id="transfer-form">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">
                Step 1 of 3
              </p>

              <h2 className="mt-2 text-3xl font-black text-slate-950">
                Transfer details
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                These details power the quote engine and provider comparison.
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
              CAD → {destinationCurrency}
            </div>
          </div>

          <form onSubmit={getQuotes} className="mt-6 space-y-5">
            <div>
              <label className="text-sm font-black text-slate-700">
                Recipient
              </label>

              <select
                value={selectedRecipientId}
                onChange={(e) => {
                  setSelectedRecipientId(e.target.value);
                  setQuotes([]);
                  setError("");
                }}
                className={inputClass}
                disabled={loadingRecipients}
              >
                <option value="">
                  {loadingRecipients ? "Loading recipients..." : "Choose recipient"}
                </option>

                {recipients.map((recipient) => (
                  <option key={recipient.id} value={recipient.id}>
                    {countryFlag(recipient.country)}{" "}
                    {recipient.nickname || recipient.full_name} —{" "}
                    {recipient.city ? `${recipient.city}, ` : ""}
                    {recipient.country}
                  </option>
                ))}
              </select>

              {recipients.length === 0 && !loadingRecipients && (
                <div className="mt-3 rounded-3xl border border-orange-100 bg-orange-50 p-5 text-sm text-orange-800">
                  <p className="font-black">No recipients yet.</p>
                  <p className="mt-1">
                    Add a recipient before starting a transfer.
                  </p>

                  <Link
                    to="/recipients"
                    className="mt-4 inline-flex rounded-2xl bg-orange-600 px-4 py-2 font-black text-white hover:bg-orange-700"
                  >
                    Add recipient
                  </Link>
                </div>
              )}
            </div>

            {selectedRecipient && (
              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  Selected recipient
                </p>

                <p className="mt-2 text-xl font-black text-slate-950">
                  {selectedRecipient.full_name}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {countryFlag(selectedRecipient.country)}{" "}
                  {selectedRecipient.city ? `${selectedRecipient.city}, ` : ""}
                  {selectedRecipient.country} • {destinationCurrency}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {selectedRecipient.payout_method}
                  {selectedRecipient.mobile_money_network
                    ? ` • ${selectedRecipient.mobile_money_network}`
                    : ""}
                </p>

                {selectedRecipient.provider_preference && (
                  <p className="mt-1 text-sm text-slate-600">
                    Preferred provider:{" "}
                    <span className="font-black text-slate-950">
                      {providerLabel(selectedRecipient.provider_preference)}
                    </span>
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="text-sm font-black text-slate-700">
                Amount in CAD
              </label>

              <div className="mt-2 flex overflow-hidden rounded-2xl border border-slate-200 bg-white transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100">
                <div className="flex items-center border-r bg-slate-50 px-4 text-sm font-black text-slate-600">
                  CAD
                </div>

                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setQuotes([]);
                    setError("");
                  }}
                  placeholder="100.00"
                  className="w-full px-4 py-4 text-3xl font-black text-slate-950 outline-none"
                />
              </div>
            </div>

            {amount && Number(amount) > 0 && (
              <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-emerald-800">
                      Instant estimate
                    </p>

                    {previewLoading ? (
                      <p className="mt-2 text-xl font-black text-slate-950">
                        Checking provider quotes...
                      </p>
                    ) : previewQuote ? (
                      <>
                        <p className="mt-2 text-4xl font-black tracking-tight text-slate-950">
                          {Number(
                            previewQuote.estimated_receive_amount || 0
                          ).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}{" "}
                          {previewQuote.destination_currency}
                        </p>

                        <p className="mt-1 text-sm font-black text-emerald-700">
                          Best option: {providerLabel(previewQuote.provider)}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Final amount is confirmed after comparing providers.
                        </p>
                      </>
                    ) : (
                      <p className="mt-2 text-sm text-slate-600">
                        Select recipient and amount to preview receive estimate.
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl bg-white px-3 py-2 text-xs font-black text-emerald-700">
                    Live
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-black text-slate-700">
                Reason for transfer
              </label>

              <select
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setQuotes([]);
                  setError("");
                }}
                className={inputClass}
              >
                <option value="family support">Family support</option>
                <option value="school fees">School fees</option>
                <option value="medical support">Medical support</option>
                <option value="gift">Gift</option>
                <option value="business investment">Business investment</option>
                <option value="crypto">Crypto</option>
                <option value="unknown">Unknown</option>
              </select>

              {["business investment", "crypto", "unknown"].includes(reason) && (
                <p className="mt-3 rounded-2xl bg-orange-50 px-4 py-3 text-sm text-orange-700">
                  This reason may require manual review before checkout.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canCompare}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-400 px-5 py-4 text-base font-black text-slate-950 shadow-sm transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingQuotes ? "Comparing providers..." : "Compare providers"}
            </button>
          </form>
        </PremiumCard>

        <PremiumCard>
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">
                Step 2 of 3
              </p>

              <h2 className="mt-2 text-3xl font-black text-slate-950">
                Provider options
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Compare delivery time, fees, rate, total cost, and receive
                amount.
              </p>
            </div>

            {selectedRecipient && (
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                <p className="font-black text-slate-950">
                  {countryFlag("Canada")} Canada →{" "}
                  {countryFlag(selectedRecipient.country)}{" "}
                  {selectedRecipient.country}
                </p>
                <p className="text-slate-600">CAD → {destinationCurrency}</p>
              </div>
            )}
          </div>

          {quotes.length === 0 ? (
            <div className="mt-8 rounded-[2rem] bg-slate-50 p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-2xl font-black text-emerald-300 shadow-sm">
                ↗
              </div>

              <p className="mt-5 text-xl font-black text-slate-950">
                No provider comparison yet
              </p>

              <p className="mt-2 text-sm text-slate-600">
                Enter transfer details and click compare providers.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {quotes.map((quote, index) => {
                const isCreating = creatingProvider === quote.provider;

                return (
                  <div
                    key={quote.provider}
                    className={`rounded-[2rem] border p-5 shadow-sm transition ${
                      index === 0
                        ? "border-emerald-200 bg-emerald-50/60"
                        : "bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <ProviderPill provider={quote.provider} />

                          {index === 0 && (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                              Best price
                            </span>
                          )}
                        </div>

                        <p className="mt-4 text-sm font-semibold text-slate-500">
                          Recipient receives
                        </p>

                        <p className="mt-1 text-4xl font-black tracking-tight text-slate-950">
                          {Number(
                            quote.estimated_receive_amount || 0
                          ).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}{" "}
                          {quote.destination_currency}
                        </p>

                        <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                          <div className="rounded-2xl bg-white p-3">
                            <p className="text-xs text-slate-500">Fee</p>
                            <p className="font-black text-slate-950">
                              {quote.fee_amount} CAD
                            </p>
                          </div>

                          <div className="rounded-2xl bg-white p-3">
                            <p className="text-xs text-slate-500">Total</p>
                            <p className="font-black text-slate-950">
                              {quote.total_cost} CAD
                            </p>
                          </div>

                          <div className="rounded-2xl bg-white p-3">
                            <p className="text-xs text-slate-500">Delivery</p>
                            <p className="font-black text-slate-950">
                              {quote.estimated_delivery_time}
                            </p>
                          </div>
                        </div>

                        <p className="mt-3 text-xs text-slate-500">
                          Rate: 1 CAD = {quote.exchange_rate}{" "}
                          {quote.destination_currency}
                        </p>
                      </div>

                      <button
                        onClick={() => createTransfer(quote.provider)}
                        disabled={isCreating || creatingProvider}
                        className="rounded-2xl bg-slate-950 px-5 py-4 font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isCreating ? "Creating..." : "Select provider"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 rounded-[2rem] border bg-slate-50 p-5">
            <p className="text-sm font-black text-slate-950">
              Step 3 of 3: Review and track
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              After selecting a provider, AlkebulanX creates the transfer record
              and sends you to the tracking page.
            </p>
          </div>
        </PremiumCard>
      </div>
    </PageWrap>
  );
}
