import axios from "axios";
import { http } from "@/lib/http";
import type { ApiResource } from "@/lib/apiResource";
import { pcc, pccCalls, pccGroups, pccIvr } from "./pcc";
import type { ApiResult } from "@/types";

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

// Adapt an ApiResource to the legacy CrudApi shape used by editor specs.
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
  pccToken: () => call("GET", "/pcc-token"),

  agent: legacy(pcc.agent),
  group: legacy(pcc.group),
  queue: legacy(pcc.queue),
  number: legacy(pcc.number),
  ivrTree: legacy(pcc.ivrTree),
  sipAccount: legacy(pcc.sipAccount),

  callout: pccCalls.callout,
  assignGroupToQueue: pccGroups.assignToQueue,
  removeGroupFromQueue: pccGroups.removeFromQueue,
  addIvrNode: pccIvr.addNode,
  configureIvrKeypress: pccIvr.configureKeypress,
};
