import axios from "axios";
import { http } from "@/lib/http";
import type { ApiResource } from "@/lib/apiResource";
import { pcc, pccCalls, pccGroups, pccIvr } from "./pcc";
import type { ApiResult } from "@/types";

// ── Declarative endpoint table, matches server/src/routes/admin.ts ──
type EndpointKey =
  | "make-call"
  | "put-actions"
  | "stop-call"
  | "transfer-call"
  | "add-participant"
  | "force-video-floor"
  | "send-message"
  | "call-log"
  | "rest-token";

// Generic caller: returns { status, data } whether the request succeeded or
// the server sent a 4xx/5xx — UI code only checks `status`.
async function call<T = unknown>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
): Promise<ApiResult<T>> {
  try {
    const res = await http.request<T>({
      url: `/admin${path}`,
      method,
      data: body,
    });
    return { status: res.status, data: res.data };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      return { status: err.response.status, data: err.response.data as T };
    }
    return {
      status: 0,
      data: { error: (err as Error).message } as unknown as T,
    };
  }
}

// Adapt an ApiResource to the legacy CrudApi shape used by editor specs:
// { list(page, limit), create, update, delete }.
function legacy(resource: ApiResource) {
  return {
    list: (page = 1, limit = 20) =>
      resource.list(`page=${page}&limit=${limit}`),
    create: (body: unknown) => resource.create(body),
    update: (id: string, body: unknown) => resource.update(id, body),
    delete: (id: string) => resource.remove(id),
  };
}

export const adminApi = {
  // Generic JSON-body POSTs — keyed by endpoint name
  post<T = unknown>(key: Extract<EndpointKey, `${string}`>, body: unknown) {
    return call<T>("POST", `/${key}`, body);
  },

  // REST token debug
  restToken: () => call("GET", "/rest-token"),
  pccToken: () => call("GET", "/pcc-token"),

  // Call log — accepts a raw query string so `search_after[]=…&search_after[]=…`
  // repeats survive intact.
  callLog: (qs: string) => call("GET", `/call-log${qs ? `?${qs}` : ""}`),

  // Recording download URL (rendered in an <a href>).
  recordingUrl(recordId: string, format?: string): string {
    const base = `${import.meta.env.VITE_BASE_DEMO_PROJECT_URL}/admin/recording/${encodeURIComponent(recordId)}`;
    return format ? `${base}?format=${encodeURIComponent(format)}` : base;
  },

  // ── PCC / ICC CRUD — backed by the OOP layer in api/pcc.ts ───────────
  agent: legacy(pcc.agent),
  group: legacy(pcc.group),
  queue: legacy(pcc.queue),
  number: legacy(pcc.number),
  ivrTree: legacy(pcc.ivrTree),
  sipAccount: legacy(pcc.sipAccount),

  // ── PCC / ICC special endpoints (non-CRUD) ───────────────────────────
  callout: pccCalls.callout,
  assignGroupToQueue: pccGroups.assignToQueue,
  removeGroupFromQueue: pccGroups.removeFromQueue,
  addIvrNode: pccIvr.addNode,
  configureIvrKeypress: pccIvr.configureKeypress,
};

export type { EndpointKey };
