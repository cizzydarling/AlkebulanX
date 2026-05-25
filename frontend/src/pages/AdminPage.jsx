import { useEffect, useState } from "react";
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

export default function AdminPage() {
  const [reviewTransfers, setReviewTransfers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    setLoading(true);
    setError("");

    try {
      const [reviewRes, logsRes] = await Promise.all([
        api.get("/admin/transfers/review"),
        api.get("/admin/audit-logs?limit=50"),
      ]);

      setReviewTransfers(
        Array.isArray(reviewRes.data)
          ? reviewRes.data
          : reviewRes.data?.transfers || []
      );

      setAuditLogs(
        Array.isArray(logsRes.data) ? logsRes.data : logsRes.data?.logs || []
      );
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  }

  async function approveTransfer(id) {
    setActionId(id);
    setError("");
    setSuccess("");

    try {
      await api.post(`/admin/transfers/${id}/approve`, {
        note: "Approved from admin UI.",
      });

      setSuccess(`Transfer #${id} approved.`);
      await loadAdminData();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || "Approval failed.");
    } finally {
      setActionId(null);
    }
  }

  async function rejectTransfer(id) {
    const note = prompt("Reason for rejection?") || "Rejected from admin UI.";

    setActionId(id);
    setError("");
    setSuccess("");

    try {
      await api.post(`/admin/transfers/${id}/reject`, { note });
      setSuccess(`Transfer #${id} rejected.`);
      await loadAdminData();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || "Rejection failed.");
    } finally {
      setActionId(null);
    }
  }

  return (
    <PageWrap>
      <PremiumHero
        eyebrow="Admin Console"
        title="Compliance operations with control and clarity."
        description="Review flagged transfers, approve or reject manual-review cases, and monitor platform audit activity from one operational command center."
        primaryLabel={loading ? "Refreshing..." : "Refresh data"}
        primaryTo="#review-queue"
        secondaryLabel="Audit logs"
        secondaryTo="#audit-logs"
      >
        <PremiumPanel>
          <PremiumBadge tone="gold">Operations</PremiumBadge>

          <p className="mt-5 text-sm text-slate-300">Manual review queue</p>
          <p className="mt-2 text-5xl font-black text-white">
            {reviewTransfers.length}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <MetricTile
              label="Audit logs"
              value={auditLogs.length}
              hint="Recent events"
            />
            <MetricTile
              label="Status"
              value={loading ? "Live" : "Ready"}
              hint="Console state"
              tone="gold"
            />
          </div>

          <button
            onClick={loadAdminData}
            disabled={loading}
            className="mt-5 w-full rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-black text-white transition hover:bg-white/15 disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "Refresh console"}
          </button>
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

      <PremiumCard id="review-queue">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-700">
              Review queue
            </p>

            <h2 className="mt-2 text-3xl font-black text-slate-950">
              Compliance review
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Transfers held before provider checkout.
            </p>
          </div>

          <button
            onClick={loadAdminData}
            disabled={loading}
            className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {reviewTransfers.length === 0 ? (
          <div className="mt-6 rounded-[2rem] bg-slate-50 p-8 text-center">
            <p className="text-lg font-black text-slate-950">
              No transfers require manual review
            </p>
            <p className="mt-2 text-sm text-slate-600">
              New flagged transfers will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {reviewTransfers.map((transfer) => (
              <div key={transfer.id} className="rounded-[2rem] border p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xl font-black text-slate-950">
                        Transfer #{transfer.id}
                      </p>

                      <StatusBadge status={transfer.status} />
                      <StatusBadge status="manual_review_required" />
                    </div>

                    <p className="mt-3 text-3xl font-black text-slate-950">
                      {transfer.send_amount} {transfer.source_currency} →{" "}
                      {transfer.estimated_receive_amount}{" "}
                      {transfer.destination_currency}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                      <ProviderPill provider={transfer.provider} />
                      <span>Status: {transfer.status}</span>
                    </div>

                    <p className="mt-4 rounded-2xl bg-orange-50 px-4 py-3 text-sm text-orange-700">
                      Review reason:{" "}
                      {transfer.compliance_notes || "Manual review required"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
                    <button
                      onClick={() => approveTransfer(transfer.id)}
                      disabled={actionId === transfer.id}
                      className="rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-400 px-6 py-4 font-black text-slate-950 disabled:opacity-60"
                    >
                      {actionId === transfer.id ? "Working..." : "Approve"}
                    </button>

                    <button
                      onClick={() => rejectTransfer(transfer.id)}
                      disabled={actionId === transfer.id}
                      className="rounded-2xl border border-red-200 px-6 py-4 font-black text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PremiumCard>

      <PremiumCard id="audit-logs">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">
          Audit trail
        </p>

        <h2 className="mt-2 text-3xl font-black text-slate-950">Audit logs</h2>

        {auditLogs.length === 0 ? (
          <div className="mt-6 rounded-[2rem] bg-slate-50 p-8 text-center text-slate-600">
            No audit logs yet.
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Entity</th>
                    <th className="px-4 py-3">Details</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-4 py-3 text-slate-500">{log.id}</td>
                      <td className="px-4 py-3 font-black text-slate-950">
                        {log.action}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {log.user_id || "System"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {log.entity_type || "-"}{" "}
                        {log.entity_id ? `#${log.entity_id}` : ""}
                      </td>
                      <td className="max-w-md truncate px-4 py-3 text-slate-500">
                        {typeof log.details === "string"
                          ? log.details
                          : JSON.stringify(log.details || {})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </PremiumCard>
    </PageWrap>
  );
}