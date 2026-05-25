import { Link, useSearchParams } from "react-router-dom";
import { PremiumBadge, PremiumCard } from "../components/ui/PremiumShell";
import PageWrap from "../components/ui/PageWrap";

export default function PaymentResultPage() {
  const [params] = useSearchParams();

  const rawStatus = params.get("status") || "pending";
  const status = rawStatus.toLowerCase();
  const txRef = params.get("tx_ref") || params.get("transaction_id") || "";
  const transferId = params.get("transfer_id") || params.get("id") || "";

  const isSuccess = status.includes("success") || status.includes("completed");
  const isFailed =
    status.includes("fail") ||
    status.includes("cancel") ||
    status.includes("error");

  const state = isSuccess ? "success" : isFailed ? "failed" : "pending";

  const content = {
    success: {
      icon: "✓",
      title: "Payment received",
      message:
        "Your provider checkout was successful. AlkebulanX will update the transfer once final provider confirmation is received.",
      badge: "Checkout success",
      glow: "from-emerald-500/25 to-amber-400/10",
      iconStyle: "bg-emerald-100 text-emerald-700",
    },
    failed: {
      icon: "!",
      title: "Payment was not completed",
      message:
        "The provider checkout did not complete successfully. You can return to transfers and try again if the transfer is still eligible.",
      badge: "Checkout failed",
      glow: "from-red-500/20 to-orange-400/10",
      iconStyle: "bg-red-100 text-red-700",
    },
    pending: {
      icon: "…",
      title: "Payment confirmation pending",
      message:
        "AlkebulanX is waiting for the provider to confirm the payment status. This may take a short moment.",
      badge: "Awaiting provider",
      glow: "from-orange-500/20 to-amber-400/10",
      iconStyle: "bg-orange-100 text-orange-700",
    },
  }[state];

  return (
    <PageWrap>
      <section className="relative mx-auto max-w-4xl overflow-hidden rounded-[2.5rem] border bg-slate-950 p-8 text-center text-white shadow-2xl shadow-slate-950/20 md:p-12">
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${content.glow}`}
        />

        <div className="relative z-10">
          <PremiumBadge tone={state === "success" ? "default" : "gold"}>
            {content.badge}
          </PremiumBadge>

          <div
            className={`mx-auto mt-8 flex h-24 w-24 items-center justify-center rounded-full text-5xl font-black ${content.iconStyle}`}
          >
            {content.icon}
          </div>

          <h1 className="mx-auto mt-8 max-w-2xl text-5xl font-black tracking-tight">
            {content.title}
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            {content.message}
          </p>

          <div className="mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-slate-300">Status</p>
              <p className="mt-1 font-black capitalize text-white">
                {rawStatus}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-slate-300">Reference</p>
              <p className="mt-1 break-all font-black text-white">
                {txRef || transferId || "Not provided"}
              </p>
            </div>
          </div>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/transfers"
              className="rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-400 px-6 py-4 font-black text-slate-950 transition hover:scale-[1.02]"
            >
              View transfers
            </Link>

            <Link
              to="/send"
              className="rounded-2xl border border-white/15 bg-white/10 px-6 py-4 font-black text-white backdrop-blur transition hover:bg-white/15"
            >
              Send again
            </Link>
          </div>
        </div>
      </section>

      <PremiumCard className="mx-auto max-w-4xl">
        <p className="font-black text-slate-950">What happens next?</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Your transfer page refreshes provider status automatically. If the
          provider sends delayed confirmation, AlkebulanX will show the latest
          transfer state there.
        </p>
      </PremiumCard>
    </PageWrap>
  );
}