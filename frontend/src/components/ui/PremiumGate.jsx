import { Link } from "react-router-dom";

export default function PremiumGate({
  children,
  fallback,
  title = "Upgrade to Premium",
  description = "Unlock advanced transfer intelligence and insights.",
}) {
  if (!fallback) return children;

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-40 blur-[2px]">
        {children}
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="max-w-sm rounded-2xl border bg-white p-6 text-center shadow-xl">
          <p className="text-sm font-semibold text-emerald-700">
            Premium feature
          </p>

          <h3 className="mt-2 text-xl font-black text-slate-900">
            {title}
          </h3>

          <p className="mt-2 text-sm text-slate-600">
            {description}
          </p>

          <Link
            to="/pricing"
            className="mt-4 inline-flex rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            View plans
          </Link>
        </div>
      </div>
    </div>
  );
}