import { type FC, type ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router/dom";

import Layout from "@/components/Layout";
import SettingsLayout from "@/components/SettingsLayout";
import Login from "@/components/Login";
import Toaster from "@/components/Toaster";

import Dashboard from "@/components/pages/Dashboard";
import CallsPage from "@/components/pages/CallsPage";
import EventsPage from "@/components/pages/EventsPage";
import BusinessHour from "@/components/pages/BusinessHour";
import SettingsStub from "@/components/pages/SettingsStub";
import CallSettingsPanel from "@/components/pcc/CallSettings";
import SoftphonePage from "@/components/softphone/SoftphonePage";

import DualEditor from "@/components/admin/editor/DualEditor";
import {
  AGENT_SPEC,
  GROUP_SPEC,
  IVR_TREE_SPEC,
  NUMBER_SPEC,
  QUEUE_SPEC,
  SIP_ACCOUNT_SPEC,
} from "@/components/admin/editor/specs";

// Bare wrapper for routes that shouldn't render the dashboard shell
// (login + standalone softphone window).
const Bare: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-base-200 text-base-content">
    {children}
    <Toaster />
  </div>
);

const router = createBrowserRouter([
  { path: "/login", element: <Bare><Login /></Bare> },
  { path: "/softphone", element: <Bare><SoftphonePage /></Bare> },
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "events", element: <EventsPage /> },
      { path: "calls", element: <CallsPage /> },
      {
        path: "settings",
        element: <SettingsLayout />,
        children: [
          { index: true, element: <Navigate to="business-hour" replace /> },
          { path: "numbers", element: <DualEditor spec={NUMBER_SPEC} /> },
          { path: "blacklist", element: <SettingsStub title="Blacklist number" /> },
          { path: "ivr-tree", element: <DualEditor spec={IVR_TREE_SPEC} /> },
          { path: "agents", element: <DualEditor spec={AGENT_SPEC} /> },
          { path: "groups", element: <DualEditor spec={GROUP_SPEC} /> },
          { path: "queues", element: <DualEditor spec={QUEUE_SPEC} /> },
          { path: "greeting", element: <SettingsStub title="Greeting file" /> },
          { path: "business-hour", element: <BusinessHour /> },
          { path: "call-settings", element: <CallSettingsPanel /> },
          { path: "button-call", element: <SettingsStub title="Button Call settings" /> },
          { path: "sip", element: <DualEditor spec={SIP_ACCOUNT_SPEC} /> },
        ],
      },
    ],
  },
]);

const App = () => <RouterProvider router={router} />;

export default App;
