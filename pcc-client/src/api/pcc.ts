import { ApiClient } from "@/lib/apiClient";
import { ApiResource } from "@/lib/apiResource";
import type {
  ApiResult,
  GetCallSettingsResponse,
  ListGroupAgentsResponse,
  ListGroupRoutingsResponse,
  UpdateCallSettingsRequest,
  UpdateCallSettingsResponse,
} from "@/types";

// One client rooted at the server's /admin/pcc prefix.
export const pccClient = new ApiClient("/admin/pcc");

// PCC / ICC resources. Slugs match pcc-server/src/routes/pcc.ts.
export const pcc = {
  agent: new ApiResource(pccClient, "/agents"),
  queue: new ApiResource(pccClient, "/queues"),
  group: new ApiResource(pccClient, "/groups"),
  number: new ApiResource(pccClient, "/numbers"),
  ivrTree: new ApiResource(pccClient, "/ivr-trees"),
  sipAccount: new ApiResource(pccClient, "/sip-accounts"),
};

export const pccCalls = {
  callout: (body: unknown): Promise<ApiResult> =>
    pccClient.request("POST", "/calls/callout", body),
};

// Routing tables that connect a queue to its groups, and a group to
// its agents. Both endpoints take a single query-string filter (?queue
// or ?group) so they don't fit the generic ApiResource shape cleanly.
export const pccRouting = {
  groupRoutings: (
    queueId: string,
  ): Promise<ApiResult<ListGroupRoutingsResponse>> =>
    pccClient.request<ListGroupRoutingsResponse>(
      "GET",
      "/group-routings",
      undefined,
      `queue=${encodeURIComponent(queueId)}`,
    ),
  groupAgents: (
    groupId: string,
  ): Promise<ApiResult<ListGroupAgentsResponse>> =>
    pccClient.request<ListGroupAgentsResponse>(
      "GET",
      "/group-agents",
      undefined,
      `group=${encodeURIComponent(groupId)}`,
    ),
};

// Project-level call settings — the four URLs shown in the Stringee
// Call Settings dashboard (get_customer_info_url, event_url, etc.).
export const pccCallSettings = {
  get: (): Promise<ApiResult<GetCallSettingsResponse>> =>
    pccClient.request<GetCallSettingsResponse>("GET", "/callsettings"),
  update: (
    body: UpdateCallSettingsRequest,
  ): Promise<ApiResult<UpdateCallSettingsResponse>> =>
    pccClient.request<UpdateCallSettingsResponse>("PUT", "/callsettings", body),
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
