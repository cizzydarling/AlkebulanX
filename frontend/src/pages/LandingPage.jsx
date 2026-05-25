import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getStoredUser, api } from "../api/client";
import { countryFlag } from "../utils/countryFlags";
import {
  ActionTile,
  PremiumBadge,
  PremiumCard,
  PremiumHero,
  PremiumPanel,
} from "../components/ui/PremiumShell";
import PageWrap from "../components/ui/PageWrap";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const fallbackCorridors = [
  {
    source_country: "Canada",
    destination_country: "Ghana",
    source_currency: "CAD",
    destination_currency: "GHS",
    sample_rate: 8.4,
    providers: ["Flutterwave", "Mobile Money"],
  },
  {
    source_country: "Canada",
    destination_country: "Nigeria",
    source_currency: "CAD",
    destination_currency: "NGN",
    sample_rate: 1100,
    providers: ["Flutterwave", "Bank Transfer"],
  },
  {
    source_country: "Canada",
    destination_country: "Senegal",
    source_currency: "CAD",
    destination_currency: "XOF",
    sample_rate: 445,
    providers: ["Orange Money", "Mobile Money"],
  },
];

export default function LandingPage() {
  const user = getStoredUser();
  const [corridors, setCorridors] = useState([]);
  const [amount, setAmount] = useState("100");
  const [selectedCountry, setSelectedCountry] = useState("Ghana");

  useEffect(() => {
    let cancelled = false;

    async function loadCorridorRates() {
      try {
        const res = await api.get("/rates/corridors");

        if (!cancelled) {
          setCorridors(
            Array.isArray(res.data) ? res.data : res.data?.corridors || []
          );
        }
      } catch (err) {
        console.error("Failed to load corridor rates.", err);

        if (!cancelled) {
          setCorridors([]);
        }
      }
    }

    loadCorridorRates();

    return () => {
      cancelled = true;
    };
  }, []);

  const availableCorridors = corridors.length ? corridors : fallbackCorridors;

  const selectedCorridor = useMemo(() => {
    return (
      availableCorridors.find(
        (item) => item.destination_country === selectedCountry
      ) || availableCorridors[0]
    );
  }, [availableCorridors, selectedCountry]);

  const estimate = useMemo(() => {
    const numericAmount = Number(amount || 0);
    const rate = Number(selectedCorridor?.sample_rate || 0);
    return numericAmount * rate;
  }, [amount, selectedCorridor]);

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      <PageWrap>
        <motion.div variants={fadeUp}>
          <PremiumHero
            eyebrow="AlkebulanX"
            title="Canada to Africa money movement, beautifully controlled."
            description="A premium provider-powered interface for diaspora transfers: save recipients, compare options, create transfer requests, and track every handoff with clarity."
            primaryLabel={user ? "Send money" : "Create account"}
            primaryTo={user ? "/send" : "/register"}
            secondaryLabel={user ? "Dashboard" : "Login"}
            secondaryTo={user ? "/dashboard" : "/login"}
          >
            <PremiumPanel>
              <PremiumBadge tone="gold">Interactive corridor preview</PremiumBadge>

              <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/10 p-5">
                <p className="text-sm text-slate-300">Route</p>

                <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div>
                    <p className="text-xs text-slate-400">From</p>
                    <p className="text-2xl font-black text-white">
                      {countryFlag("Canada")} Canada
                    </p>
                  </div>

                  <p className="text-2xl font-black text-emerald-300">→</p>

                  <div>
                    <p className="text-xs text-slate-400">To</p>
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-lg font-black text-white outline-none"
                    >
                      {availableCorridors.map((item) => (
                        <option
                          key={item.destination_country}
                          value={item.destination_country}
                        >
                          {countryFlag(item.destination_country)}{" "}
                          {item.destination_country}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl bg-white p-4 text-slate-950">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    You send
                  </p>

                  <div className="mt-2 flex items-center gap-3">
                    <span className="font-black text-slate-500">CAD</span>
                    <input
                      type="number"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-transparent text-4xl font-black outline-none"
                    />
                  </div>
                </div>

                <motion.div
                  key={`${selectedCountry}-${amount}`}
                  initial={{ scale: 0.97, opacity: 0.85 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.22 }}
                  className="rounded-2xl bg-gradient-to-br from-emerald-400 to-amber-300 p-4 text-slate-950"
                >
                  <p className="text-xs font-black uppercase tracking-[0.16em] opacity-70">
                    Estimated recipient gets
                  </p>

                  <p className="mt-2 text-4xl font-black">
                    {estimate.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    {selectedCorridor?.destination_currency}
                  </p>

                  <p className="mt-2 text-sm font-black opacity-80">
                    Best preview:{" "}
                    {(selectedCorridor?.providers || [])[0] || "Provider route"}
                  </p>
                </motion.div>
              </div>

              <Link
                to={user ? "/send" : "/register"}
                className="mt-5 flex w-full justify-center rounded-2xl bg-white px-5 py-4 font-black text-slate-950 transition hover:scale-[1.01]"
              >
                Compare this route
              </Link>
            </PremiumPanel>
          </PremiumHero>
        </motion.div>

        <motion.section variants={fadeUp} className="grid gap-4 md:grid-cols-3">
          <ActionTile
            to={user ? "/recipients" : "/register"}
            title="Build your recipient network"
            description="Save family, friends, and business recipients with country, city, payout method, network, and provider preference."
            label="Add recipients"
          />

          <ActionTile
            to={user ? "/send" : "/register"}
            title="Compare provider routes"
            description="View estimated fees, rates, receive amount, delivery time, and available provider options before creating a transfer."
            label="Compare options"
          />

          <ActionTile
            to={user ? "/transfers" : "/register"}
            title="Track every handoff"
            description="Follow transfers from creation to compliance review, provider checkout, processing, and completion."
            label="Track transfers"
          />
        </motion.section>

        <motion.section
          variants={fadeUp}
          className="rounded-[2.5rem] border bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">
                Corridor intelligence
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
                Routes designed for the diaspora.
              </h2>

              <p className="mt-3 max-w-2xl text-slate-600">
                Your MVP corridor engine displays supported routes and sample
                estimates for Canada-to-Africa transfer flows.
              </p>
            </div>

            <Link
              to={user ? "/send" : "/register"}
              className="rounded-2xl bg-slate-950 px-6 py-4 text-center font-black text-white transition hover:bg-emerald-700"
            >
              Compare now
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-5">
            {availableCorridors.map((item) => (
              <button
                key={item.destination_country}
                onClick={() => setSelectedCountry(item.destination_country)}
                className={`group overflow-hidden rounded-[2rem] border p-5 text-center transition hover:-translate-y-1 hover:border-emerald-200 hover:bg-white hover:shadow-xl ${
                  selectedCountry === item.destination_country
                    ? "border-emerald-300 bg-emerald-50"
                    : "bg-slate-50"
                }`}
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                  {countryFlag(item.destination_country)}
                </div>

                <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                  {item.source_currency} → {item.destination_currency}
                </p>

                <p className="mt-2 text-lg font-black text-slate-950">
                  {countryFlag(item.source_country)} {item.source_country}
                </p>

                <p className="text-sm font-semibold text-slate-400">to</p>

                <p className="text-lg font-black text-slate-950">
                  {item.destination_country}
                </p>

                <p className="mt-4 rounded-2xl bg-white px-3 py-2 text-sm font-black text-slate-900">
                  1 {item.source_currency} ≈ {item.sample_rate}{" "}
                  {item.destination_currency}
                </p>

                <p className="mt-3 text-xs leading-5 text-slate-500">
                  {(item.providers || []).join(" • ")}
                </p>
              </button>
            ))}
          </div>

          <p className="mt-5 text-center text-xs text-slate-500">
            Rates shown are sample estimates for MVP testing and are not live
            market rates.
          </p>
        </motion.section>

        <motion.section
          variants={fadeUp}
          className="grid gap-4 lg:grid-cols-[1fr_1fr]"
        >
          <PremiumCard>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-700">
              Trust model
            </p>

            <h2 className="mt-3 text-3xl font-black text-slate-950">
              Provider-powered, not a wallet.
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              AlkebulanX is designed as a payment facilitator/interface. It does
              not hold user balances, operate as a bank, or directly settle
              payouts in the MVP.
            </p>
          </PremiumCard>

          <PremiumCard className="bg-slate-950 text-white">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-300">
              Compliance-aware
            </p>

            <h2 className="mt-3 text-3xl font-black">
              Risk controls built into the flow.
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              Higher-risk transfer reasons can trigger manual review before
              provider checkout, helping the MVP feel more operationally
              credible.
            </p>

            <Link
              to={user ? "/send" : "/register"}
              className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-400 px-6 py-4 font-black text-slate-950"
            >
              {user ? "Start a transfer" : "Start now"}
            </Link>
          </PremiumCard>
        </motion.section>
      </PageWrap>
    </motion.div>
  );
}
