import { type FC } from "react";
import { adminApi } from "@/api/admin";
import JsonApiCard from "./JsonApiCard";
import CallLogCard from "./CallLogCard";
import RecordingCard from "./RecordingCard";
import TabView, { type Tab } from "./TabView";
import DualEditor from "./editor/DualEditor";
import {
  ADD_PARTICIPANT,
  FORCE_VIDEO,
  MAKE_CALL,
  PUT_ACTIONS,
  SEND_MESSAGE,
  STOP_CALL,
  TRANSFER_CALL,
} from "./editor/specs";

export type { Tab };

// ── REST Token ────────────────────────────────────────────────────────────
const RestTokenPane: FC = () => (
  <JsonApiCard
    title="Generate REST API token"
    method="GET"
    path="/admin/rest-token"
    description="Short-lived JWT signed with rest_api=true. Sent as X-STRINGEE-AUTH on Call REST API requests."
    initialBody="{}"
    onSend={() => adminApi.restToken()}
  />
);

// ── Stringee Call REST API tabs (Table ↔ JSON via DualEditor) ─────────────
const CALL_REST_TABS: Tab[] = [
  { key: "make-call", label: "Make Call", render: () => <DualEditor spec={MAKE_CALL} /> },
  { key: "put-actions", label: "Put SCCO", render: () => <DualEditor spec={PUT_ACTIONS} /> },
  { key: "stop-call", label: "Stop Call", render: () => <DualEditor spec={STOP_CALL} /> },
  { key: "transfer", label: "Transfer", render: () => <DualEditor spec={TRANSFER_CALL} /> },
  { key: "add-participant", label: "Add Participant", render: () => <DualEditor spec={ADD_PARTICIPANT} /> },
  { key: "force-video", label: "Force Video Floor", render: () => <DualEditor spec={FORCE_VIDEO} /> },
  { key: "send-message", label: "Send Custom Message", render: () => <DualEditor spec={SEND_MESSAGE} /> },
  { key: "call-log", label: "Call Log", render: () => <CallLogCard /> },
  { key: "recording", label: "Recording", render: () => <RecordingCard /> },
];

const TOP_TABS: Tab[] = [
  { key: "rest-token", label: "REST Token", render: () => <RestTokenPane /> },
  {
    key: "stringeeCallRestApi",
    label: "stringeeCallRestApi",
    render: () => <TabView tabs={CALL_REST_TABS} size="sm" />,
  },
];

const AdminPage: FC = () => (
  <main className="mx-auto max-w-4xl px-4 py-6 space-y-4">
    <div>
      <h1 className="text-2xl font-bold">Stringee Admin</h1>
      <p className="text-sm text-base-content/60">
        REST API reference for the Stringee Call REST API (dev).
      </p>
    </div>
    <TabView tabs={TOP_TABS} />
  </main>
);

export default AdminPage;
