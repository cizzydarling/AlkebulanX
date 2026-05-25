export function PremiumHero({
  eyebrow,
  title,
  description,
  primaryLabel,
  primaryTo,
  secondaryLabel,
  secondaryTo,
  children,
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border bg-slate-950 shadow-xl">
      {/* Glow background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
      </div>

      <div className="relative grid gap-6 p-6 text-white md:p-10 lg:grid-cols-[1fr_380px] lg:items-center">
        <div>
          {eyebrow && (
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
              {eyebrow}
            </p>
          )}

          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
            {title}
          </h1>

          {description && (
            <p className="mt-4 max-w-2xl text-lg text-slate-300 leading-relaxed">
              {description}
            </p>
          )}

          {(primaryLabel || secondaryLabel) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {primaryLabel && (
                <a
                  href={primaryTo}
                  className="rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-400 px-6 py-3 font-black text-slate-950 shadow-md transition hover:scale-[1.02]"
                >
                  {primaryLabel}
                </a>
              )}

              {secondaryLabel && (
                <a
                  href={secondaryTo}
                  className="rounded-2xl border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  {secondaryLabel}
                </a>
              )}
            </div>
          )}
        </div>

        {children}
      </div>
    </section>
  );
}

export function PremiumPanel({ children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl shadow-inner">
      {children}
    </div>
  );
}

export function PremiumCard({ children, className = "", ...props }) {
  return (
    <div
      {...props}
      className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md ${className}`}
    >
      {children}
    </div>
  );
}

export function MetricTile({ label, value, hint, tone = "default" }) {
  const toneStyles =
    tone === "gold"
      ? "bg-amber-50 text-amber-700"
      : "bg-slate-50 text-slate-700";

  return (
    <div className={`rounded-2xl p-4 ${toneStyles}`}>
      <p className="text-xs uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
      {hint && <p className="text-xs opacity-70 mt-1">{hint}</p>}
    </div>
  );
}

export function PremiumBadge({ children, tone = "default" }) {
  const toneStyles =
    tone === "gold"
      ? "bg-amber-100 text-amber-700"
      : "bg-emerald-100 text-emerald-700";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${toneStyles}`}
    >
      {children}
    </span>
  );
}

export function ActionTile({ title, description, to, label = "Continue" }) {
  return (
    <a
      href={to}
      className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-emerald-300 transition group-hover:bg-emerald-600 group-hover:text-white">
        →
      </div>

      <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>

      <p className="mt-5 text-sm font-black text-emerald-700">{label}</p>
    </a>
  );
}