export default function BrandCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}