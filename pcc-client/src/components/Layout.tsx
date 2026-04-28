import { useEffect, useState, type FC } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { decodeToken, formatTime } from "@/lib/jwt";
import { storage, STORAGE_CHANGED } from "@/lib/storage";
import { toast } from "@/lib/toast";
import Toaster from "./Toaster";

const remaining = (expEpoch: number): string => {
  const secs = Math.max(0, Math.floor((expEpoch - Date.now()) / 1000));
  if (secs === 0) return "expired";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

// Layout = navbar + auth gate. If no PCC token, push to /login.
const Layout: FC = () => {
  const [saved, setSaved] = useState(storage.get);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const refresh = (): void => setSaved(storage.get());
    window.addEventListener(STORAGE_CHANGED, refresh);
    window.addEventListener("storage", refresh);
    const tick = setInterval(refresh, 1000);
    return () => {
      window.removeEventListener(STORAGE_CHANGED, refresh);
      window.removeEventListener("storage", refresh);
      clearInterval(tick);
    };
  }, []);

  useEffect(() => {
    if (!saved && location.pathname !== "/login") navigate("/login");
  }, [saved, location.pathname, navigate]);

  const info = saved ? decodeToken(saved.token) : null;
  const expMs = info?.exp ? info.exp * 1000 : 0;
  const expired = expMs > 0 && expMs < Date.now();

  const logout = (): void => {
    storage.clear();
    toast.info("Logged out");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <div className="navbar bg-base-100 border-b border-base-300 px-4 shadow-sm gap-3">
        <div className="flex-1">
          <span className="text-lg font-semibold tracking-tight">
            Stringee PCC
          </span>
        </div>
        {saved && info && (
          <div className="flex items-center gap-2 text-xs">
            <span className="badge badge-primary badge-sm">PCC</span>
            <span className="font-mono">{saved.userId}</span>
            <span className={expired ? "text-error" : "text-base-content/60"}>
              exp {formatTime(info.exp)} · {expired ? "expired" : remaining(expMs)}
            </span>
            <button className="btn btn-ghost btn-xs" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </div>
      <Outlet />
      <Toaster />
    </div>
  );
};

export default Layout;
