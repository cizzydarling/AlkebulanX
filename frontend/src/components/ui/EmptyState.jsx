export default function EmptyState({
  title = "Nothing here yet",
  message = "Once you create something, it will appear here.",
  action,
}) {
  return (
    <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <p className="mt-2 text-slate-600">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}