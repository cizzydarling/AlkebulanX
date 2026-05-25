import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api, getStoredUser } from "../api/client";
import {
  PremiumBadge,
  PremiumCard,
  PremiumHero,
  PremiumPanel,
} from "../components/ui/PremiumShell";
import PageWrap from "../components/ui/PageWrap";

const plans = [
  {
    name: "Free",
    plan: "free",
    price: "$0",
    description: "For getting started with recipient setup and route preview.",
    cta: "Start free",
    features: [
      "Save recipients",
      "Compare sample corridors",
      "Track transfer activity",
      "Provider-powered checkout flow",
    ],
  },
  {
    name: "Premium",
    plan: "premium",
    price: "$9.99",
    period: "/month",
    highlight: true,
    description: "For diaspora users who want smarter transfer planning.",
    cta: "Upgrade to Premium",
    features: [
      "Smart route recommendations",
      "Priority provider comparison",
      "Transfer insights",
      "PDF/export transfer history",
      "Premium support",
    ],
  },
  {
    name: "Business",
    plan: "business",
    price: "$29",
    period: "/month",
    description: "For users managing frequent or business-related transfers.",
    cta: "Start Business",
    features: [
      "Bulk transfer planning",
      "Multiple recipient workflows",
      "Compliance notes",
      "Admin-style reporting",
      "Priority support",
    ],
  },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [loadingPlan, setLoadingPlan] = useState("");
  const [error, setError] = useState("");

  async function startPlan(plan) {
    setError("");

    if (plan === "free") {
      navigate(user ? "/dashboard" : "/register");
      return;
    }

    if (!user) {
      navigate("/register");
      return;
    }

    setLoadingPlan(plan);

    try {
      const res = await api.post(
        `/billing/create-checkout-session?plan=${plan}`
      );

      if (res.data?.checkout_url) {
        window.location.assign(res.data.checkout_url);
      } else {
        setError("Stripe checkout URL was not returned.");
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || "Could not start checkout.");
    } finally {
      setLoadingPlan("");
    }
  }

  return (
    <PageWrap>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <PremiumHero
          eyebrow="Pricing"
          title="Simple plans for smarter Africa-bound money movement."
          description="Core transfers stay free. Upgrade only when you need deeper transfer intelligence, export tools, and priority workflow support."
          primaryLabel="Start free"
          primaryTo={user ? "/dashboard" : "/register"}
          secondaryLabel={user ? "Dashboard" : "Login"}
          secondaryTo={user ? "/dashboard" : "/login"}
        >
          <PremiumPanel>
            <PremiumBadge tone="gold">Launch pricing</PremiumBadge>
            <p className="mt-5 text-sm text-slate-300">Most popular</p>
            <p className="mt-2 text-5xl font-black text-white">Premium</p>
            <p className="mt-2 text-slate-300">
              $9.99/month for smarter planning.
            </p>
          </PremiumPanel>
        </PremiumHero>
      </motion.div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <PremiumCard
            key={plan.name}
            className={
              plan.highlight
                ? "relative border-emerald-300 bg-slate-950 text-white"
                : ""
            }
          >
            {plan.highlight && (
              <div className="absolute right-5 top-5 rounded-full bg-gradient-to-r from-emerald-400 to-amber-300 px-3 py-1 text-xs font-black text-slate-950">
                Best value
              </div>
            )}

            <p
              className={`text-sm font-black uppercase tracking-[0.18em] ${
                plan.highlight ? "text-emerald-300" : "text-emerald-700"
              }`}
            >
              {plan.name}
            </p>

            <div className="mt-5 flex items-end gap-1">
              <p className="text-5xl font-black">{plan.price}</p>
              {plan.period && (
                <p
                  className={
                    plan.highlight ? "text-slate-300" : "text-slate-500"
                  }
                >
                  {plan.period}
                </p>
              )}
            </div>

            <p
              className={`mt-4 min-h-12 text-sm leading-6 ${
                plan.highlight ? "text-slate-300" : "text-slate-600"
              }`}
            >
              {plan.description}
            </p>

            <button
              type="button"
              onClick={() => startPlan(plan.plan)}
              disabled={loadingPlan === plan.plan}
              className={`mt-6 flex w-full justify-center rounded-2xl px-5 py-4 font-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 ${
                plan.highlight
                  ? "bg-gradient-to-r from-emerald-500 to-amber-400 text-slate-950"
                  : "bg-slate-950 text-white hover:bg-emerald-700"
              }`}
            >
              {loadingPlan === plan.plan ? "Opening checkout..." : plan.cta}
            </button>

            <div className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <div key={feature} className="flex gap-3 text-sm">
                  <span className="mt-0.5 text-emerald-500">✓</span>
                  <span
                    className={
                      plan.highlight ? "text-slate-200" : "text-slate-700"
                    }
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </PremiumCard>
        ))}
      </section>

      <PremiumCard>
        <div className="grid gap-6 md:grid-cols-[1fr_320px] md:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-700">
              Monetization note
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-950">
              Core remittance flow stays free.
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              AlkebulanX monetizes transfer intelligence, exports, business
              workflows, and premium support without charging users just to send
              money to family.
            </p>
          </div>

          <Link
            to={user ? "/dashboard" : "/register"}
            className="rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-400 px-6 py-4 text-center font-black text-slate-950"
          >
            {user ? "Go to dashboard" : "Create account"}
          </Link>
        </div>
      </PremiumCard>
    </PageWrap>
  );
}
