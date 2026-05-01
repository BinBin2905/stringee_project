import { type FC } from "react";
import { NavLink, Outlet } from "react-router";
import * as Icon from "./Icons";

// Sidebar entries — order matches the Stringee dashboard reference UI.
// `to` is relative to the parent /settings route.
const ITEMS = [
  { to: "numbers", label: "Number", icon: Icon.Phone },
  { to: "blacklist", label: "Blacklist number", icon: Icon.NoEntry },
  { to: "ivr-tree", label: "IVR Tree", icon: Icon.Sitemap },
  { to: "agents", label: "Agent", icon: Icon.UserPlus },
  { to: "groups", label: "Group", icon: Icon.IdCard },
  { to: "queues", label: "Queue", icon: Icon.Layers },
  { to: "greeting", label: "Greeting file", icon: Icon.Music },
  { to: "business-hour", label: "Business hour", icon: Icon.AlarmClock },
  { to: "call-settings", label: "Call settings", icon: Icon.Cog },
  { to: "button-call", label: "Button Call settings", icon: Icon.Briefcase },
  { to: "sip", label: "Sip Account", icon: Icon.Briefcase },
];

const SettingsLayout: FC = () => (
  <div className="flex h-full bg-base-100">
    {/* ── Sidebar ──────────────────────────────────────────────────── */}
    <aside className="w-64 bg-base-100 border-r border-base-300 px-3 py-5 shrink-0 overflow-y-auto">
      <h2 className="px-3 mb-3 text-base font-bold text-base-content">
        Settings
      </h2>
      <nav className="flex flex-col gap-0.5">
        {ITEMS.map(({ to, label, icon: I }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-base-content/70 hover:bg-base-200"
              }`
            }
          >
            <I className="size-4 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>

    {/* ── Right pane content ───────────────────────────────────────── */}
    <div className="flex-1 overflow-y-auto p-6 bg-base-100">
      <Outlet />
    </div>
  </div>
);

export default SettingsLayout;
