import { type FC } from "react";
import { adminApi } from "@/api/admin";
import TabView, { type Tab } from "../admin/TabView";
import JsonApiCard from "../admin/JsonApiCard";
import DualEditor from "../admin/editor/DualEditor";
import {
  AGENT_SPEC,
  GROUP_SPEC,
  IVR_TREE_SPEC,
  NUMBER_SPEC,
  QUEUE_SPEC,
  SIP_ACCOUNT_SPEC,
} from "../admin/editor/specs";

// Inline body-keyed wired card. Pulls URL params (e.g. `groupId`) out of the
// edited body and forwards the remainder to `send`.
const wiredCard =
  (
    title: string,
    method: string,
    path: string,
    body: Record<string, unknown>,
    send: (b: Record<string, unknown>) => Promise<import("@/types").ApiResult>,
    description?: string,
  ) =>
  () => (
    <JsonApiCard
      title={title}
      method={method}
      path={path}
      description={description}
      initialBody={JSON.stringify(body, null, 2)}
      onSend={(b) => send((b as Record<string, unknown>) ?? {})}
    />
  );

const TABS: Tab[] = [
  {
    key: "pcc-token",
    label: "PCC Token",
    render: () => (
      <JsonApiCard
        title="Generate PCC / ICC REST API token"
        method="GET"
        path="/admin/pcc-token"
        description="Token for the Programmable Contact Center REST API (agents, queues, IVR, routing)."
        initialBody="{}"
        onSend={() => adminApi.pccToken()}
      />
    ),
  },
  {
    key: "callout",
    label: "Callout (agent → customer)",
    render: wiredCard(
      "Outbound: route to agent then customer",
      "POST",
      "/admin/pcc/calls/callout",
      {
        agentUserId: "AGENT_USER_ID",
        toAgentFromNumberDisplay: "STRINGEE_NUMBER",
        toAgentFromNumberDisplayAlias: "STRINGEE_NUMBER",
        toCustomerFromNumber: "STRINGEE_NUMBER",
        customerNumber: "DESTINATION_NUMBER",
      },
      (b) => adminApi.callout(b),
    ),
  },
  { key: "agent", label: "Agent", render: () => <DualEditor spec={AGENT_SPEC} /> },
  { key: "group", label: "Group", render: () => <DualEditor spec={GROUP_SPEC} /> },
  { key: "queue", label: "Queue", render: () => <DualEditor spec={QUEUE_SPEC} /> },
  { key: "number", label: "Number", render: () => <DualEditor spec={NUMBER_SPEC} /> },
  { key: "ivr-tree", label: "IVR Tree", render: () => <DualEditor spec={IVR_TREE_SPEC} /> },
  {
    key: "sip-account",
    label: "SIP Account",
    render: () => <DualEditor spec={SIP_ACCOUNT_SPEC} />,
  },
  {
    key: "group-routing",
    label: "Group Routing",
    render: wiredCard(
      "Assign group to queue",
      "POST",
      "/admin/pcc/groups/{groupId}/queues/{queueId}",
      { groupId: "GROUP_ID", queueId: "QUEUE_ID", priority: 1 },
      (b) => {
        const { groupId, queueId, ...rest } = b as {
          groupId: string;
          queueId: string;
        };
        return adminApi.assignGroupToQueue(groupId, queueId, rest);
      },
    ),
  },
  {
    key: "ivr-tree-node",
    label: "IVR Tree Node",
    render: wiredCard(
      "IVR tree node management",
      "POST",
      "/admin/pcc/ivr-trees/{treeId}/nodes",
      { treeId: "TREE_ID", message: "NODE_MESSAGE" },
      (b) => {
        const { treeId, ...rest } = b as { treeId: string };
        return adminApi.addIvrNode(treeId, rest);
      },
    ),
  },
  {
    key: "ivr-keypress",
    label: "IVR Keypress",
    render: wiredCard(
      "IVR node keypress management",
      "POST",
      "/admin/pcc/ivr-nodes/{nodeId}/keypresses",
      { nodeId: "NODE_ID", key: "1", action: "GOTO_NODE" },
      (b) => {
        const { nodeId, ...rest } = b as { nodeId: string };
        return adminApi.configureIvrKeypress(nodeId, rest);
      },
    ),
  },
];

const PCCPage: FC = () => (
  <main className="mx-auto max-w-4xl px-4 py-6 space-y-4">
    <div>
      <h1 className="text-2xl font-bold">Stringee PCC</h1>
      <p className="text-sm text-base-content/60">
        Programmable Contact Center management — agents, queues, IVR,
        routing, callout.
      </p>
    </div>
    <TabView tabs={TABS} />
  </main>
);

export default PCCPage;
