import { useEffect, useState, type FC } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { storage, STORAGE_CHANGED } from "@/lib/storage";
import { toast } from "@/lib/toast";
import Toaster from "./Toaster";
import * as Icon from "./Icons";

// Items in the dark icon rail on the far left. Each entry is an absolute
// route the rail jumps to.
const RAIL = [
  { to: "/", end: true, icon: Icon.Home, label: "Home" },
  { to: "/events", end: true, icon: Icon.Newspaper, label: "Events" },
  { to: "/calls", end: true, icon: Icon.Bars, label: "Calls" },
  { to: "/settings", end: false, icon: Icon.Cog, label: "Settings" },
];

const Layout: FC = () => {
  const [saved, setSaved] = useState(storage.get);
  const navigate = useNavigate();
  const location = useLocation();

  // Keep `saved` in sync across tabs / token changes.
  useEffect(() => {
    const refresh = (): void => setSaved(storage.get());
    window.addEventListener(STORAGE_CHANGED, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(STORAGE_CHANGED, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  // Auth gate — bounce to /login if no token.
  useEffect(() => {
    if (!saved && location.pathname !== "/login") navigate("/login");
  }, [saved, location.pathname, navigate]);

  const userId = saved?.userId ?? "";
  const initials = userId.slice(0, 1).toUpperCase() || "?";
  const email = userId ? `${userId}@stringee.com` : "";

  const logout = (): void => {
    storage.clear();
    toast.info("Logged out");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-base-200 text-base-content">
      {/* ── Icon rail ───────────────────────────────────────────────── */}
      <aside className="flex flex-col items-center w-16 bg-slate-900 text-white/70 py-4 gap-2 shrink-0">
        <div className="size-10 rounded-md bg-red-500 flex items-center justify-center text-white font-bold mb-3 select-none">
          S
        </div>
        {RAIL.map(({ to, end, icon: I, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={label}
            className={({ isActive }) =>
              `size-10 rounded-md flex items-center justify-center transition-colors ${
                isActive
                  ? "bg-slate-700 text-white"
                  : "hover:bg-slate-700/40 hover:text-white"
              }`
            }
          >
            <I className="size-5" />
          </NavLink>
        ))}
      </aside>

      {/* ── Main column ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-base-100">
        <header className="bg-base-100 border-b border-base-300 px-6 h-16 flex items-center justify-end gap-3 shrink-0">
          {saved && (
            <>
              <div className="text-right leading-tight">
                <div className="text-sm font-semibold text-red-500 uppercase tracking-wide">
                  {userId}
                </div>
                <div className="text-xs text-base-content/60">{email}</div>
              </div>
              <div className="size-9 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-semibold">
                {initials}
              </div>
              <button
                className="btn btn-ghost btn-sm btn-square"
                onClick={logout}
                title="Log out"
              >
                <Icon.SignOut className="size-4" />
              </button>
            </>
          )}
        </header>

        <main className="flex-1 overflow-y-auto bg-base-200">
          <Outlet />
        </main>
      </div>

      <Toaster />
    </div>
  );
};

export default Layout;
