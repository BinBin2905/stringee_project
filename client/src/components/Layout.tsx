import { NavLink, Outlet } from "react-router";
import type { FC } from "react";
import TokenStatusPanel from "./TokenStatusPanel";

const Layout: FC = () => {
  const navClass = ({ isActive }: { isActive: boolean }): string =>
    `tab ${isActive ? "tab-active" : ""}`;

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <div className="navbar bg-base-100 border-b border-base-300 px-4 shadow-sm">
        <div className="flex-1">
          <span className="text-lg font-semibold tracking-tight">
            Stringee Dev
          </span>
        </div>
        <div role="tablist" className="tabs tabs-box">
          <NavLink to="/" end role="tab" className={navClass}>
            Client
          </NavLink>
          <NavLink to="/admin" role="tab" className={navClass}>
            Admin
          </NavLink>
          <NavLink to="/pcc" role="tab" className={navClass}>
            PCC
          </NavLink>
        </div>
      </div>
      <Outlet />
      <TokenStatusPanel />
    </div>
  );
};

export default Layout;
