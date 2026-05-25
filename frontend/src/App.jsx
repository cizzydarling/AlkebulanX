import { useState } from "react";
import {
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { getStoredUser, logout } from "./api/client";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SendMoneyPage from "./pages/SendMoneyPage";
import RecipientsPage from "./pages/RecipientsPage";
import TransfersPage from "./pages/TransfersPage";
import AdminPage from "./pages/AdminPage";
import PaymentResultPage from "./pages/PaymentResultPage";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import ProfilePage from "./pages/ProfilePage";
import PricingPage from "./pages/PricingPage";

function Layout({ children }) {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName =
    user?.first_name ||
    user?.firstName ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "User";

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate("/login");
  }

  const navLinkClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-black transition ${
      isActive
        ? "bg-white text-slate-950 shadow-sm"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `rounded-2xl px-4 py-3 text-sm font-black transition ${
      isActive
        ? "bg-emerald-100 text-emerald-800"
        : "text-slate-700 hover:bg-slate-100"
    }`;

  const userLinks = (
    <>
      <NavLink to="/dashboard" onClick={() => setMenuOpen(false)} className={navLinkClass}>
        Dashboard
      </NavLink>
      <NavLink to="/send" onClick={() => setMenuOpen(false)} className={navLinkClass}>
        Send
      </NavLink>
      <NavLink to="/recipients" onClick={() => setMenuOpen(false)} className={navLinkClass}>
        Recipients
      </NavLink>
      <NavLink to="/transfers" onClick={() => setMenuOpen(false)} className={navLinkClass}>
        Transfers
      </NavLink>
      <NavLink to="/profile" onClick={() => setMenuOpen(false)} className={navLinkClass}>
        Account
      </NavLink>

      {user?.role === "admin" && (
        <NavLink to="/admin" onClick={() => setMenuOpen(false)} className={navLinkClass}>
          Admin
        </NavLink>
      )}
    </>
  );

  const mobileUserLinks = (
    <>
      <NavLink to="/dashboard" onClick={() => setMenuOpen(false)} className={mobileNavLinkClass}>
        Dashboard
      </NavLink>
      <NavLink to="/send" onClick={() => setMenuOpen(false)} className={mobileNavLinkClass}>
        Send
      </NavLink>
      <NavLink to="/recipients" onClick={() => setMenuOpen(false)} className={mobileNavLinkClass}>
        Recipients
      </NavLink>
      <NavLink to="/transfers" onClick={() => setMenuOpen(false)} className={mobileNavLinkClass}>
        Transfers
      </NavLink>
      <NavLink to="/profile" onClick={() => setMenuOpen(false)} className={mobileNavLinkClass}>
        Account
      </NavLink>

      {user?.role === "admin" && (
        <NavLink to="/admin" onClick={() => setMenuOpen(false)} className={mobileNavLinkClass}>
          Admin
        </NavLink>
      )}
    </>
  );

  const guestLinks = (
    <>
      <NavLink to="/login" onClick={() => setMenuOpen(false)} className={navLinkClass}>
        Login
      </NavLink>

      <Link
        to="/register"
        onClick={() => setMenuOpen(false)}
        className="rounded-full bg-gradient-to-r from-emerald-400 to-amber-300 px-5 py-2 text-sm font-black text-slate-950 shadow-lg shadow-emerald-950/20 transition hover:scale-[1.03]"
      >
        Register
      </Link>
    </>
  );

  const mobileGuestLinks = (
    <>
      <NavLink to="/login" onClick={() => setMenuOpen(false)} className={mobileNavLinkClass}>
        Login
      </NavLink>

      <Link
        to="/register"
        onClick={() => setMenuOpen(false)}
        className="rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-400 px-4 py-3 text-center text-sm font-black text-slate-950"
      >
        Register
      </Link>
    </>
  );

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#f6faf8]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_24%),linear-gradient(180deg,#f8fafc,#eef7f4)]" />

      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/90 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(16,185,129,0.28),transparent_30%),radial-gradient(circle_at_90%_0%,rgba(245,158,11,0.20),transparent_28%)]" />

            <div className="relative flex items-center justify-between px-4 py-3 sm:px-5">
              <Link to="/" className="group flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-amber-300 to-orange-500 text-sm font-black text-slate-950 shadow-lg shadow-emerald-950/30 transition group-hover:scale-105">
                  AX
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-300 ring-4 ring-slate-950" />
                </div>

                <div>
                  <p className="text-2xl font-black leading-none tracking-tight text-white">
                    AlkebulanX
                  </p>
                  <p className="mt-1 hidden text-xs font-semibold text-slate-400 sm:block">
                    Africa-first money movement
                  </p>
                </div>
              </Link>

              <div className="hidden items-center gap-4 md:flex">
                <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
                  {user ? userLinks : guestLinks}
                </nav>

                {user && (
                  <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-4 lg:flex">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-amber-300 text-xs font-black text-slate-950">
                      {String(displayName).slice(0, 1).toUpperCase()}
                    </div>
                    <div className="leading-tight">
                      <p className="text-xs text-slate-400">Signed in</p>
                      <p className="text-sm font-black text-white">{displayName}</p>
                    </div>
                  </div>
                )}

                {user && (
                  <button
                    onClick={handleLogout}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-slate-200 transition hover:bg-red-500/15 hover:text-red-200"
                  >
                    Logout
                  </button>
                )}
              </div>

              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-black text-white shadow-sm md:hidden"
              >
                {menuOpen ? "Close" : "Menu"}
              </button>
            </div>
          </div>

          {menuOpen && (
            <nav className="mt-3 flex flex-col gap-2 rounded-[2rem] border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur md:hidden">
              {user && (
                <div className="mb-2 rounded-2xl bg-slate-950 p-4 text-sm text-slate-300">
                  Signed in as{" "}
                  <span className="font-black text-white">{displayName}</span>
                </div>
              )}

              {user ? mobileUserLinks : mobileGuestLinks}

              {user && (
                <button
                  onClick={handleLogout}
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700"
                >
                  Logout
                </button>
              )}
            </nav>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
        {children}
      </main>

      <footer className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 text-sm text-slate-600 shadow-sm backdrop-blur">
          <p className="font-black text-slate-950">AlkebulanX</p>
          <p className="mt-2 max-w-4xl leading-6">
            AlkebulanX is a provider-powered payment interface. It does not hold
            user balances, operate as a bank, or directly settle payouts in the MVP.
          </p>
        </div>
      </footer>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AuthPage({ children }) {
  const user = getStoredUser();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><LandingPage /></Layout>} />
      <Route path="/pricing" element={<Layout><PricingPage /></Layout>} />
      <Route path="/login" element={<AuthPage><LoginPage /></AuthPage>} />
      <Route path="/register" element={<AuthPage><RegisterPage /></AuthPage>} />

      <Route
        path="/dashboard"
        element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>}
      />

      <Route
        path="/profile"
        element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>}
      />

      <Route
        path="/send"
        element={<ProtectedRoute><Layout><SendMoneyPage /></Layout></ProtectedRoute>}
      />

      <Route
        path="/recipients"
        element={<ProtectedRoute><Layout><RecipientsPage /></Layout></ProtectedRoute>}
      />

      <Route
        path="/transfers"
        element={<ProtectedRoute><Layout><TransfersPage /></Layout></ProtectedRoute>}
      />

      <Route
        path="/admin"
        element={<ProtectedRoute><Layout><AdminPage /></Layout></ProtectedRoute>}
      />

      <Route
        path="/payment-result"
        element={<ProtectedRoute><Layout><PaymentResultPage /></Layout></ProtectedRoute>}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
