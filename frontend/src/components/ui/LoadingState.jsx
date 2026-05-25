export default function LoadingState({ message = "Loading..." }) {
  return (
    <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
      <p className="font-semibold text-slate-900">{message}</p>
      <p className="mt-2 text-sm text-slate-500">Please wait.</p>
    </div>
  );
}