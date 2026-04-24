import { type FC } from "react";
import { adminApi } from "@/api/admin";
import JsonApiCard from "./JsonApiCard";
import CallLogCard from "./CallLogCard";
import RecordingCard from "./RecordingCard";
import TabView, { type Tab } from "./TabView";
import { shellCard } from "./shell";
import DualEditor from "./editor/DualEditor";
import PCCGuard from "../PCCGuard";
import {
  ADD_PARTICIPANT,
  AGENT_SPEC,
  FORCE_VIDEO,
  GROUP_SPEC,
  IVR_TREE_SPEC,
  MAKE_CALL,
  NUMBER_SPEC,
  PUT_ACTIONS,
  QUEUE_SPEC,
  SEND_MESSAGE,
  STOP_CALL,
  TRANSFER_CALL,
} from "./editor/specs";

export type { Tab };

// ── REST Token ────────────────────────────────────────────────────────────
// Single token: Stringee signs one JWT that authenticates both the Call REST
// API and the PCC / ICC REST API. Dispatch is by URL, not by claim.
const RestTokenPane: FC = () => (
  <JsonApiCard
    title="Generate REST API token (Call + PCC / ICC)"
    method="GET"
    path="/admin/rest-token"
    description="Short-lived JWT signed with rest_api=true. Sent as X-STRINGEE-AUTH. Works for both the Call REST API and the PCC / ICC REST API — Stringee dispatches on URL, not claim."
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

// ── PCC / ICC REST API tabs ───────────────────────────────────────────────
// Wired CRUD resources render read-only (edits live on /pcc). Nested
// resources remain JSON-only shells until you spec them.
const PCC_REST_TABS: Tab[] = [
  { key: "agent", label: "Agent", render: () => <DualEditor spec={AGENT_SPEC} readonly /> },
  { key: "group", label: "Group", render: () => <DualEditor spec={GROUP_SPEC} readonly /> },
  { key: "queue", label: "Queue", render: () => <DualEditor spec={QUEUE_SPEC} readonly /> },
  { key: "number", label: "Number", render: () => <DualEditor spec={NUMBER_SPEC} readonly /> },
  { key: "ivr-tree", label: "IVR Tree", render: () => <DualEditor spec={IVR_TREE_SPEC} readonly /> },
  {
    key: "ivr-tree-node",
    label: "IVR Tree Node",
    render: shellCard(
      "IVR tree node management",
      "POST",
      "/v1/ivr/tree/{treeId}/node",
      { name: "NODE_NAME" },
      "Nested resource — wire the server route before enabling Table edit.",
    ),
  },
  {
    key: "ivr-keypress",
    label: "IVR Keypress",
    render: shellCard(
      "IVR node keypress management",
      "POST",
      "/v1/ivr/node/{nodeId}/keypress",
      { key: "1", action: "GOTO_NODE" },
    ),
  },
  {
    key: "group-agent",
    label: "Group Agents",
    render: shellCard(
      "Manage agents in a group",
      "POST",
      "/v1/group/{groupId}/agent",
      { agentId: "AGENT_ID" },
    ),
  },
  {
    key: "group-routing",
    label: "Group Routing",
    render: shellCard(
      "Group routing",
      "POST",
      "/v1/queue/{queueId}/routing",
      { groupId: "GROUP_ID", priority: 1 },
    ),
  },
];

const TOP_TABS: Tab[] = [
  { key: "rest-token", label: "REST Token", render: () => <RestTokenPane /> },
  {
    key: "stringeeCallRestApi",
    label: "stringeeCallRestApi",
    render: () => <TabView tabs={CALL_REST_TABS} size="sm" />,
  },
  {
    key: "PCCRestApi",
    label: "PCCRestApi",
    render: () => (
      <PCCGuard>
        <TabView tabs={PCC_REST_TABS} size="sm" />
      </PCCGuard>
    ),
  },
];

const AdminPage: FC = () => (
  <main className="mx-auto max-w-4xl px-4 py-6 space-y-4">
    <div>
      <h1 className="text-2xl font-bold">Stringee Admin</h1>
      <p className="text-sm text-base-content/60">
        REST API reference for the Stringee Call REST API and PCC / ICC REST API (dev).
      </p>
    </div>
    <TabView tabs={TOP_TABS} />
  </main>
);

export default AdminPage;
