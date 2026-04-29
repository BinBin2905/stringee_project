// Shared response/request envelopes for the PCC REST API as proxied by
// pcc-server. Mirrors pcc-server/src/types/common.ts so the UI has no
// server dependency.

export interface PccBaseResponse {
  r: number;
  project: number;
  message?: string;
}

export interface PccListQuery {
  page?: number;
  limit?: number;
}

// 0 / 1 booleans returned by the API (most read endpoints serialize
// booleans as integers even when create/update accept real booleans).
export type IntBool = 0 | 1;
