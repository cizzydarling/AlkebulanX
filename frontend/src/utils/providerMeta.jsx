function providerMeta(provider) {
  const meta = {
    flutterwave: {
      label: "Flutterwave",
      initials: "FW",
      className: "bg-orange-100 text-orange-700",
    },
    paystack: {
      label: "Paystack",
      initials: "PS",
      className: "bg-blue-100 text-blue-700",
    },
    orange_money: {
      label: "Orange Money",
      initials: "OM",
      className: "bg-amber-100 text-amber-700",
    },
  };

  return (
    meta[provider] || {
      label: provider,
      initials: "?",
      className: "bg-slate-100 text-slate-700",
    }
  );
}

export function ProviderPill({ provider }) {
  const meta = providerMeta(provider);

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${meta.className}`}
      >
        {meta.initials}
      </span>
      {meta.label}
    </span>
  );
}
