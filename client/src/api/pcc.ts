import { ApiClient } from "@/lib/apiClient";
import { ApiResource } from "@/lib/apiResource";
import type { ApiResult } from "@/types";

// One client rooted at the server's /admin/pcc prefix.
export const pccClient = new ApiClient("/admin/pcc");

// PCC / ICC resources. Slugs match server/src/routes/pcc.ts.
export const pcc = {
  agent: new ApiResource(pccClient, "/agents"),
  queue: new ApiResource(pccClient, "/queues"),
  group: new ApiResource(pccClient, "/groups"),
  number: new ApiResource(pccClient, "/numbers"),
  ivrTree: new ApiResource(pccClient, "/ivr-trees"),
  sipAccount: new ApiResource(pccClient, "/sip-accounts"),
};

// One-off endpoints (not standard CRUD).
export const pccCalls = {
  callout: (body: unknown): Promise<ApiResult> =>
    pccClient.request("POST", "/calls/callout", body),
};

export const pccGroups = {
  assignToQueue: (groupId: string, queueId: string, body?: unknown) =>
    pcc.group
      .sub(groupId, `queues/${encodeURIComponent(queueId)}`)
      .create(body ?? {}),
  removeFromQueue: (groupId: string, queueId: string) =>
    pccClient.request(
      "DELETE",
      `/groups/${encodeURIComponent(groupId)}/queues/${encodeURIComponent(queueId)}`,
    ),
};

export const pccIvr = {
  addNode: (treeId: string, body: unknown) =>
    pcc.ivrTree.sub(treeId, "nodes").create(body),
  configureKeypress: (nodeId: string, body: unknown) =>
    pccClient.request(
      "POST",
      `/ivr-nodes/${encodeURIComponent(nodeId)}/keypresses`,
      body,
    ),
};
