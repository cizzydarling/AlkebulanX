import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, getStoredUser, isPremiumUser } from "../api/client";
import StatusBadge from "../components/ui/StatusBadge";
import BrandCard from "../components/ui/BrandCard";
import { countryFlag } from "../utils/countryFlags";
import { ProviderPill } from "../utils/providerMeta.jsx";
import {
  ActionTile,
  MetricTile,
  PremiumBadge,
  PremiumCard,
  PremiumHero,
  PremiumPanel,
} from "../components/ui/PremiumShell";
import PageWrap from "../components/ui/PageWrap";
import PremiumGate from "../components/ui/PremiumGate";

export default function DashboardPage() {
  const user = getStoredUser();
  const [transfers, setTransfers] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const [transfersRes, recipientsRes] = await Promise.all([
          api.get("/transfers"),
          api.get("/recipients"),
        ]);

        if (cancelled) return;

        setTransfers(
          Array.isArray(transfersRes.data)
            ? transfersRes.data
            : transfersRes.data?.transfers || []
        );

        setRecipients(
          Array.isArray(recipientsRes.data)
            ? recipientsRes.data
            : recipientsRes.data?.recipients || []
        );
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setTransfers([]);
          setRecipients([]);
          setError(
            "We could not load your dashboard right now. Please refresh or try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const totalSent = transfers.reduce(
      (sum, transfer) => sum + Number(transfer.send_amount || 0),
      0
    );

    const completed = transfers.filter((t) => t.status === "completed").length;
    const pending = transfers.filter((t) =>
      ["created", "pending_provider", "processing"].includes(t.status)
    ).length;
    const review = transfers.filter(
      (t) => t.compliance_review_status === "manual_review_required"
    ).length;

    return { totalSent, completed, pending, review };
  }, [transfers]);

  const recentTransfers = [...transfers]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 5);

  return (
    <PageWrap>
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isPremiumUser() && (
        <div className="mb-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-400 p-4 text-slate-950">
            <p className="font-bold">Unlock smarter transfers</p>
            <p className="text-sm">
            Get insights, recommendations, and export tools.
            </p>
            <Link to="/pricing" className="mt-2 inline-block font-bold underline">
            Upgrade →
            </Link>
        </div>
      )}

      <PremiumHero
        eyebrow="AlkebulanX Command Center"
        title={`Welcome${user?.first_name ? `, ${user.first_name}` : ""}.`}
        description="Your control room for recipients, provider comparisons, compliance-aware transfer handoffs, and Canada-to-Africa money movement activity."
        primaryLabel="Send money"
        primaryTo="/send"
        secondaryLabel="Add recipient"
        secondaryTo="/recipients"
      >
        <PremiumPanel>
          <PremiumBadge tone="gold">Transfer intent</PremiumBadge>

          <p className="mt-5 text-sm text-slate-300">CAD tracked</p>
          <p className="mt-2 text-5xl font-black text-white">
            ${stats.totalSent.toFixed(2)}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <MetricTile
              label="Recipients"
              value={recipients.length}
              hint="Saved people"
            />
            <MetricTile
              label="Completed"
              value={stats.completed}
              hint="Finished transfers"
              tone="gold"
            />
          </div>
        </PremiumPanel>
      </PremiumHero>

      <section className="grid gap-4 md:grid-cols-4">
        <PremiumCard>
          <p className="text-sm font-bold text-slate-500">Recipients</p>
          <p className="mt-2 text-4xl font-black text-slate-950">
            {recipients.length}
          </p>
        </PremiumCard>

        <PremiumCard>
          <p className="text-sm font-bold text-slate-500">Transfers</p>
          <p className="mt-2 text-4xl font-black text-slate-950">
            {transfers.length}
          </p>
        </PremiumCard>

        <PremiumCard>
          <p className="text-sm font-bold text-slate-500">Pending</p>
          <p className="mt-2 text-4xl font-black text-slate-950">
            {stats.pending}
          </p>
        </PremiumCard>

        <PremiumCard>
          <p className="text-sm font-bold text-slate-500">Review queue</p>
          <p className="mt-2 text-4xl font-black text-slate-950">
            {stats.review}
          </p>
        </PremiumCard>
      </section>

      <PremiumGate fallback={!isPremiumUser()}>
        <BrandCard>
            <h2 className="text-2xl font-bold text-slate-900">
            Transfer insights
            </h2>

            <p className="mt-2 text-sm text-slate-600">
            You saved an estimated $42 this month by choosing better routes.
            </p>

            <p className="mt-2 text-sm text-slate-600">
            Best time to send: Tuesdays (lower fees trend).
            </p>
        </BrandCard>
      </PremiumGate>

      <section className="grid gap-4 md:grid-cols-3">
        <ActionTile
          to="/recipients"
          title="Add a recipient"
          description="Save trusted payout details before creating a transfer."
          label="Step 1"
        />

        <ActionTile
          to="/send"
          title="Compare providers"
          description="View estimated rates, fees, delivery, and payout options."
          label="Step 2"
        />

        <ActionTile
          to="/transfers"
          title="Track transfers"
          description="Follow status updates from creation to completion."
          label="Step 3"
        />
      </section>

      <section className="rounded-[2.5rem] border bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">
              Supported focus corridors
            </p>

            <h2 className="mt-3 text-3xl font-black text-slate-950">
              Built around Canada-to-Africa flows.
            </h2>
          </div>

          <Link
            to="/send"
            className="rounded-2xl bg-slate-950 px-5 py-3 text-center font-black text-white hover:bg-emerald-700"
          >
            Start transfer
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 text-sm">
          {["Ghana", "Nigeria", "Senegal", "Ivory Coast", "Mali"].map(
            (country) => (
              <span
                key={country}
                className="rounded-full border bg-slate-50 px-4 py-2 font-semibold text-slate-700"
              >
                {countryFlag("Canada")} → {countryFlag(country)} {country}
              </span>
            )
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <PremiumCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">
                Activity
              </p>

              <h2 className="mt-2 text-3xl font-black text-slate-950">
                Recent transfers
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Latest payment handoffs and provider updates.
              </p>
            </div>

            <Link
              to="/transfers"
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white hover:bg-emerald-700"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="mt-6 rounded-[2rem] bg-slate-50 p-8 text-center text-slate-600">
              Loading activity...
            </div>
          ) : recentTransfers.length === 0 ? (
            <div className="mt-6 rounded-[2rem] bg-slate-50 p-8 text-center">
              <p className="text-lg font-black text-slate-950">
                No transfers yet
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Add a recipient and start your first transfer.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {recentTransfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className="flex flex-col gap-3 rounded-[1.5rem] border bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-lg font-black text-slate-950">
                      {transfer.send_amount} {transfer.source_currency} →{" "}
                      {transfer.estimated_receive_amount}{" "}
                      {transfer.destination_currency}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                      <ProviderPill provider={transfer.provider} />
                      <span>Transfer #{transfer.id}</span>
                    </div>
                  </div>

                  <StatusBadge status={transfer.status} />
                </div>
              ))}
            </div>
          )}
        </PremiumCard>

        <PremiumCard className="bg-slate-950 text-white">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-300">
            Compliance
          </p>

          <h2 className="mt-2 text-3xl font-black">Review controls</h2>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            Transfers requiring manual review are held before provider checkout.
          </p>

          <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/10 p-5">
            <p className="text-sm text-slate-300">Current review queue</p>
            <p className="mt-2 text-5xl font-black">{stats.review}</p>
          </div>

          {user?.role === "admin" ? (
            <Link
              to="/admin"
              className="mt-5 block rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-400 px-5 py-4 text-center font-black text-slate-950"
            >
              Open admin console
            </Link>
          ) : (
            <p className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-slate-300">
              Admin review tools are only visible to authorized administrators.
            </p>
          )}
        </PremiumCard>
      </section>
    </PageWrap>
  );
}
