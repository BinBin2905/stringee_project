// Shared response envelope returned by every PCC REST endpoint.
// `r` is the result code (0 = success, non-zero = error) and `project` is
// the Stringee project ID.
export interface PccBaseResponse {
  r: number;
  project: number;
  message?: string;
}

// Pagination wrapper used by every list endpoint.
export interface PccListData<T, K extends string = "items"> {
  totalCount?: string;
  totalPages?: number;
  currentPage?: number;
  limit?: number;
}

export interface PccListQuery {
  page?: number;
  limit?: number;
}

// 0 / 1 booleans returned by the API (most read endpoints serialize booleans
// as integers even when create/update accept real booleans).
export type IntBool = 0 | 1;
