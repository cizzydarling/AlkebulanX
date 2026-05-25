import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../api/client";
import StatusBadge from "../components/ui/StatusBadge";
import { ProviderPill } from "../utils/providerMeta.jsx";
import {
  MetricTile,
  PremiumBadge,
  PremiumCard,
  PremiumHero,
  PremiumPanel,
} from "../components/ui/PremiumShell";
import PageWrap from "../components/ui/PageWrap";

function TransferTimeline({ transfer }) {
  const status = transfer.status;
  const reviewStatus = transfer.compliance_review_status;

  const steps = [
    { key: "created", label: "Created", active: true },
    {
      key: "review",
      label: "Compliance",
      active:
        reviewStatus !== "manual_review_required" &&
        reviewStatus !== "rejected",
      warning: reviewStatus === "manual_review_required",
      failed: reviewStatus === "rejected",
    },
    {
      key: "provider",
      label: "Provider",
      active: ["pending_provider", "processing", "completed"].includes(status),
    },
    {
      key: "completed",
      label: "Completed",
      active: status === "completed",
      failed: status === "failed",
    },
  ];

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-4">
      {steps.map((step) => (
        <div
          key={step.key}
          className={`rounded-2xl border p-3 text-sm ${
            step.failed
              ? "border-red-200 bg-red-50 text-red-700"
              : step.warning
              ? "border-orange-200 bg-orange-50 text-orange-700"
              : step.active
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-slate-50 text-slate-500"
          }`}
        >
          <p className="font-black">{step.label}</p>
          <p className="mt-1 text-xs">
            {step.failed
              ? "Action needed"
              : step.warning
              ? "Under review"
              : step.active
              ? "Done"
              : "Pending"}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function TransfersPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const createdId = params.get("created");

  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutId, setCheckoutId] = useState(null);
  const [error, setError] = useState("");

  const loadTransfers = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError("");

    try {
      const res = await api.get("/transfers");
      setTransfers(Array.isArray(res.data) ? res.data : res.data?.transfers || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load transfers. Please refresh or try again.");
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialTransfers() {
      try {
        const res = await api.get("/transfers");

        if (!cancelled) {
          setTransfers(
            Array.isArray(res.data) ? res.data : res.data?.transfers || []
          );
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError("Failed to load transfers. Please refresh or try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialTransfers();

    const interval = setInterval(() => {
      loadTransfers(false);
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [loadTransfers]);

  async function checkoutTransfer(id) {
    setCheckoutId(id);
    setError("");

    try {
      const res = await api.post(`/transfers/${id}/checkout`);
      const url = res.data.checkout_url;

      await loadTransfers(false);

      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        setError("Checkout was created, but no checkout URL was returned.");
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || "Checkout failed.");
    } finally {
      setCheckoutId(null);
    }
  }

  const sortedTransfers = useMemo(() => {
    return [...transfers].sort(
      (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
    );
  }, [transfers]);

  const stats = useMemo(() => {
    const completed = transfers.filter((t) => t.status === "completed").length;
    const pending = transfers.filter((t) =>
      ["created", "pending_provider", "processing"].includes(t.status)
    ).length;
    const review = transfers.filter(
      (t) => t.compliance_review_status === "manual_review_required"
    ).length;

    return { completed, pending, review };
  }, [transfers]);

  return (
    <PageWrap>
      {createdId && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-800">
          Transfer #{createdId} created successfully. You can now track its status below.
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <PremiumHero
        eyebrow="Transfer Activity"
        title="Track every handoff from quote to completion."
        description="Monitor checkout, compliance review, provider processing, and final transfer status in one premium activity center."
        primaryLabel="New transfer"
        primaryTo="/send"
        secondaryLabel={loading ? "Refreshing..." : "Refresh status"}
        secondaryTo="/transfers"
      >
        <PremiumPanel>
          <PremiumBadge tone="gold">Live tracking</PremiumBadge>

          <p className="mt-5 text-sm text-slate-300">Total transfers</p>
          <p className="mt-2 text-5xl font-black text-white">
            {transfers.length}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <MetricTile label="Pending" value={stats.pending} hint="In motion" />
            <MetricTile
              label="Review"
              value={stats.review}
              hint="Manual checks"
              tone="gold"
            />
          </div>

          <button
            onClick={() => loadTransfers(true)}
            disabled={loading}
            className="mt-5 w-full rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-black text-white transition hover:bg-white/15 disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "Refresh activity"}
          </button>
        </PremiumPanel>
      </PremiumHero>

      {sortedTransfers.length === 0 ? (
        <PremiumCard className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-2xl font-black text-emerald-300">
            ↗
          </div>

          <h2 className="mt-5 text-2xl font-black text-slate-950">
            No transfers yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Create a recipient, compare providers, then start your first tracked
            AlkebulanX transfer.
          </p>

          <Link
            to="/send"
            className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-400 px-6 py-4 font-black text-slate-950"
          >
            Start first transfer
          </Link>
        </PremiumCard>
      ) : (
        <div className="space-y-4">
          {sortedTransfers.map((transfer) => {
            const needsReview =
              transfer.compliance_review_status === "manual_review_required";
            const rejected = transfer.compliance_review_status === "rejected";
            const canPay =
              transfer.status === "created" && !needsReview && !rejected;

            return (
              <PremiumCard key={transfer.id}>
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xl font-black text-slate-950">
                        Transfer #{transfer.id}
                      </p>

                      <StatusBadge status={transfer.status} />

                      {needsReview && (
                        <StatusBadge status="manual_review_required" />
                      )}

                      {rejected && <StatusBadge status="rejected" />}
                    </div>

                    <p className="mt-4 text-4xl font-black tracking-tight text-slate-950">
                      {transfer.send_amount} {transfer.source_currency}
                      <span className="mx-2 text-slate-300">→</span>
                      {transfer.estimated_receive_amount}{" "}
                      {transfer.destination_currency}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                      <ProviderPill provider={transfer.provider} />

                      <span>
                        Fee: {transfer.fee_amount} {transfer.source_currency} •
                        Total: {transfer.total_cost} {transfer.source_currency}
                      </span>
                    </div>

                    {transfer.provider_reference && (
                      <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        Reference:{" "}
                        <span className="font-black text-slate-950">
                          {transfer.provider_reference}
                        </span>
                      </p>
                    )}

                    {transfer.compliance_notes && (
                      <p className="mt-3 rounded-2xl bg-orange-50 px-4 py-3 text-sm text-orange-700">
                        Compliance note: {transfer.compliance_notes}
                      </p>
                    )}

                    <TransferTimeline transfer={transfer} />
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
                    {canPay && (
                      <button
                        onClick={() => checkoutTransfer(transfer.id)}
                        disabled={checkoutId === transfer.id}
                        className="rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-400 px-6 py-4 font-black text-slate-950 transition hover:scale-[1.01] disabled:opacity-60"
                      >
                        {checkoutId === transfer.id ? "Opening..." : "Pay now"}
                      </button>
                    )}

                    {needsReview && (
                      <button
                        disabled
                        className="rounded-2xl bg-orange-100 px-6 py-4 font-black text-orange-700"
                      >
                        Awaiting review
                      </button>
                    )}

                    {transfer.status === "pending_provider" && (
                      <button
                        disabled
                        className="rounded-2xl bg-orange-100 px-6 py-4 font-black text-orange-700"
                      >
                        Awaiting provider
                      </button>
                    )}

                    {transfer.status === "processing" && (
                      <button
                        disabled
                        className="rounded-2xl bg-blue-100 px-6 py-4 font-black text-blue-700"
                      >
                        Processing
                      </button>
                    )}

                    {transfer.status === "completed" && (
                      <button
                        disabled
                        className="rounded-2xl bg-emerald-100 px-6 py-4 font-black text-emerald-700"
                      >
                        Completed
                      </button>
                    )}

                    {transfer.status === "failed" && (
                      <button
                        disabled
                        className="rounded-2xl bg-red-100 px-6 py-4 font-black text-red-700"
                      >
                        Failed
                      </button>
                    )}

                    {rejected && (
                      <button
                        disabled
                        className="rounded-2xl bg-red-100 px-6 py-4 font-black text-red-700"
                      >
                        Rejected
                      </button>
                    )}
                  </div>
                </div>
              </PremiumCard>
            );
          })}
        </div>
      )}
    </PageWrap>
  );
}
