// PCC-only spec hierarchy driving the generic editor components.
// Adding a new resource is a single class instantiation.

import { adminApi } from "@/api/admin";
import type { ApiResult } from "@/types";
import type { Column, Field } from "./model";

// ── Base ────────────────────────────────────────────────────────────────
export abstract class Spec {
  abstract readonly name: string;
  abstract readonly title: string;
  abstract readonly fields: readonly Field[];
}

export abstract class ActionSpec extends Spec {
  abstract readonly method: string;
  abstract readonly restPath: string;
  abstract readonly initialBody: Record<string, unknown>;
  abstract send(body: unknown): Promise<ApiResult>;
}

export abstract class ResourceSpec extends Spec {
  abstract readonly restPath: string;
  abstract readonly columns: readonly Column[];
  readonly idKey: string = "id";
  protected abstract readonly listKey: string;
  readonly exampleBody: Record<string, unknown> = {};

  abstract list(page: number, limit: number): Promise<ApiResult>;
  abstract create(body: unknown): Promise<ApiResult>;
  abstract update(id: string, body: unknown): Promise<ApiResult>;
  abstract remove(id: string): Promise<ApiResult>;

  extractRows(envelope: unknown): {
    rows: Record<string, unknown>[];
    totalPages: number;
  } {
    const d =
      (envelope as { data?: Record<string, unknown> } | null)?.data ?? {};
    return {
      rows: (d[this.listKey] as Record<string, unknown>[]) ?? [],
      totalPages: (d.totalPages as number) ?? 1,
    };
  }
}

// ── PCC CRUD resources ─────────────────────────────────────────────────
type CrudApi = {
  list: (page: number, limit: number) => Promise<ApiResult>;
  create: (body: unknown) => Promise<ApiResult>;
  update: (id: string, body: unknown) => Promise<ApiResult>;
  delete: (id: string) => Promise<ApiResult>;
};

class PccResource extends ResourceSpec {
  readonly name: string;
  readonly title: string;
  readonly restPath: string;
  readonly fields: readonly Field[];
  readonly columns: readonly Column[];
  protected readonly listKey: string;
  private readonly api: CrudApi;
  declare readonly exampleBody: Record<string, unknown>;

  constructor(
    name: string,
    title: string,
    restPath: string,
    fields: readonly Field[],
    columns: readonly Column[],
    listKey: string,
    api: CrudApi,
    exampleBody: Record<string, unknown> = {},
  ) {
    super();
    this.name = name;
    this.title = title;
    this.restPath = restPath;
    this.fields = fields;
    this.columns = columns;
    this.listKey = listKey;
    this.api = api;
    this.exampleBody = exampleBody;
  }
  list(p: number, l: number) {
    return this.api.list(p, l);
  }
  create(b: unknown) {
    return this.api.create(b);
  }
  update(id: string, b: unknown) {
    return this.api.update(id, b);
  }
  remove(id: string) {
    return this.api.delete(id);
  }
}

export const AGENT_SPEC = new PccResource(
  "agent",
  "Agent management",
  "/v1/agent",
  [
    { key: "name", label: "name", type: "string", required: true },
    {
      key: "stringee_user_id",
      label: "stringee_user_id",
      type: "string",
      required: true,
    },
    { key: "manual_status", label: "manual_status", type: "string" },
    { key: "routing_type", label: "routing_type", type: "number" },
    { key: "phone_number", label: "phone_number", type: "string" },
  ],
  [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "stringee_user_id", label: "User" },
    { key: "manual_status", label: "Manual" },
    { key: "system_status", label: "System" },
    { key: "device_status", label: "Device" },
  ],
  "agents",
  adminApi.agent,
  { name: "AGENT_NAME", stringee_user_id: "USER_ID" },
);

export const GROUP_SPEC = new PccResource(
  "group",
  "Group management",
  "/v1/group",
  [{ key: "name", label: "name", type: "string", required: true }],
  [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
  ],
  "groups",
  adminApi.group,
  { name: "GROUP_NAME" },
);

export const QUEUE_SPEC = new PccResource(
  "queue",
  "Queue management",
  "/v1/queue",
  [
    { key: "name", label: "name", type: "string", required: true },
    {
      key: "strategy",
      label: "strategy",
      type: "string",
      hint: "e.g. round_robin",
    },
  ],
  [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "strategy", label: "Strategy" },
  ],
  "queues",
  adminApi.queue,
  { name: "QUEUE_NAME", strategy: "round_robin" },
);

export const NUMBER_SPEC = new PccResource(
  "number",
  "Number management",
  "/v1/number",
  [
    { key: "number", label: "number", type: "string", required: true },
    { key: "treeId", label: "treeId", type: "string" },
  ],
  [
    { key: "id", label: "ID" },
    { key: "number", label: "Number" },
    { key: "treeId", label: "IVR Tree" },
  ],
  "numbers",
  adminApi.number,
  { number: "STRINGEE_NUMBER", treeId: "IVR_TREE_ID" },
);

export const IVR_TREE_SPEC = new PccResource(
  "ivr-tree",
  "IVR tree management",
  "/v1/ivr/tree",
  [{ key: "name", label: "name", type: "string", required: true }],
  [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
  ],
  "trees",
  adminApi.ivrTree,
  { name: "TREE_NAME" },
);

export const SIP_ACCOUNT_SPEC = new PccResource(
  "sip-account",
  "SIP account management",
  "/v1/sip/account",
  [
    { key: "agentId", label: "agentId", type: "string", required: true },
    { key: "password", label: "password", type: "string", required: true },
  ],
  [
    { key: "id", label: "ID" },
    { key: "username", label: "Username" },
    { key: "domain", label: "Domain" },
    { key: "port", label: "Port" },
  ],
  "sip_accounts",
  adminApi.sipAccount,
  { agentId: "AGENT_ID", password: "SIP_PASSWORD" },
);
