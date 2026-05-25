export default function StatusBadge({ status }) {
  const styles = {
    completed: "bg-emerald-100 text-emerald-700",
    failed: "bg-red-100 text-red-700",
    cancelled: "bg-slate-200 text-slate-700",
    pending_provider: "bg-orange-100 text-orange-700",
    processing: "bg-blue-100 text-blue-700",
    created: "bg-slate-100 text-slate-700",
    manual_review_required: "bg-orange-100 text-orange-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {String(status || "unknown").replaceAll("_", " ")}
    </span>
  );
}