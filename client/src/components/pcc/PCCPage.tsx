import { type FC } from "react";
import TabView, { type Tab } from "../admin/TabView";
import JsonApiCard from "../admin/JsonApiCard";
import { shellCard } from "../admin/shell";
import { adminApi } from "@/api/admin";
import DualEditor from "../admin/editor/DualEditor";
import PCCGuard from "../PCCGuard";
import {
  AGENT_SPEC,
  GROUP_SPEC,
  IVR_TREE_SPEC,
  NUMBER_SPEC,
  QUEUE_SPEC,
} from "../admin/editor/specs";

// ── PCC subtabs — one per section in the PCC overview sidebar ────────────
// Wired CRUD resources get a DualEditor (Table ↔ JSON). Un-specced sections
// stay as JSON-only shells.
const TABS: Tab[] = [
  {
    key: "pcc-token",
    label: "PCC Token",
    render: () => (
      <JsonApiCard
        title="Generate PCC / ICC REST API token"
        method="GET"
        path="/admin/pcc-token"
        description="Token for the Programmable Contact Center REST API (agents, queues, IVR, routing). Byte-identical to the Call REST token — Stringee dispatches on URL, not claim."
        initialBody="{}"
        onSend={() => adminApi.pccToken()}
      />
    ),
  },
  {
    key: "blacklist",
    label: "Blacklist",
    render: shellCard(
      "Blacklist number management",
      "POST",
      "/v1/icc/blacklist",
      { number: "BLOCKED_NUMBER", reason: "spam" },
    ),
  },
  {
    key: "call-settings",
    label: "Call Settings",
    render: shellCard(
      "Call settings",
      "POST",
      "/v1/icc/call-settings",
      { recording: true, maxRingSec: 30 },
    ),
  },
  {
    key: "make-call-to-agent",
    label: "Make Call To Agent",
    render: shellCard(
      "Make call to an agent, then connect to a phone",
      "POST",
      "/v1/icc/call/agent-then-phone",
      {
        agentId: "AGENT_ID",
        from: { type: "external", number: "STRINGEE_NUMBER" },
        to: { type: "external", number: "DESTINATION_NUMBER" },
      },
    ),
  },
  {
    key: "sip-account",
    label: "SIP Account",
    render: shellCard(
      "SIP account management",
      "POST",
      "/v1/icc/sip-account",
      { username: "SIP_USER", password: "SIP_PASS", domain: "sip.provider.tld" },
    ),
  },
  {
    key: "transfer",
    label: "Transfer Call",
    render: shellCard(
      "Transfer call (PCC)",
      "POST",
      "/v1/icc/call/transfer",
      { callId: "YOUR_CALL_ID", to: { type: "agent", id: "AGENT_ID" } },
    ),
  },
  { key: "number", label: "Number", render: () => <DualEditor spec={NUMBER_SPEC} /> },
  {
    key: "group-routing",
    label: "Group Routing",
    render: shellCard(
      "Group routing",
      "POST",
      "/v1/icc/group-routing",
      { queueId: "QUEUE_ID", groupId: "GROUP_ID", priority: 1 },
    ),
  },
  { key: "queue", label: "Queue", render: () => <DualEditor spec={QUEUE_SPEC} /> },
  {
    key: "group-agent",
    label: "Group Agents",
    render: shellCard(
      "Manage agents in a group",
      "POST",
      "/v1/icc/group/{groupId}/agent",
      { agentId: "AGENT_ID" },
    ),
  },
  { key: "group", label: "Group", render: () => <DualEditor spec={GROUP_SPEC} /> },
  { key: "agent", label: "Agent", render: () => <DualEditor spec={AGENT_SPEC} /> },
  {
    key: "ivr-keypress",
    label: "IVR Keypress",
    render: shellCard(
      "IVR node keypress management",
      "POST",
      "/v1/icc/ivr/node/{nodeId}/keypress",
      { key: "1", action: "GOTO_NODE" },
    ),
  },
  {
    key: "ivr-tree-node",
    label: "IVR Tree Node",
    render: shellCard(
      "IVR tree node management",
      "POST",
      "/v1/icc/ivr/tree/{treeId}/node",
      { name: "NODE_NAME", parentId: "PARENT_NODE_ID" },
    ),
  },
  { key: "ivr-tree", label: "IVR Tree", render: () => <DualEditor spec={IVR_TREE_SPEC} /> },
];

const PCCPage: FC = () => (
  <PCCGuard>
    <main className="mx-auto max-w-4xl px-4 py-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Stringee PCC</h1>
        <p className="text-sm text-base-content/60">
          Integrable Contact Center reference — one tab per section in the PCC overview.
        </p>
      </div>
      <TabView tabs={TABS} />
    </main>
  </PCCGuard>
);

export default PCCPage;
