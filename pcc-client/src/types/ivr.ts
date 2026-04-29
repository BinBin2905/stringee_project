import type { PccBaseResponse, PccListQuery } from "./common";

// ─── IVR tree ──────────────────────────────────────────────────────────

export interface IvrTree {
  id: string;
  account: number;
  project: number;
  tree_name: string;
  root_node?: string;
}

export interface CreateIvrTreeRequest {
  tree_name: string;
}

export interface CreateIvrTreeResponse extends PccBaseResponse {
  ivrTreeID?: string;
}

export type ListIvrTreesQuery = PccListQuery;

export interface ListIvrTreesResponse extends PccBaseResponse {
  data: {
    totalCount: string;
    totalPages: number;
    currentPage: number;
    limit: number;
    ivrTrees: IvrTree[];
  };
}

export interface UpdateIvrTreeRequest {
  tree_name: string;
}

export interface UpdateIvrTreeResponse extends PccBaseResponse {
  ivrTreeID?: string;
}

export type DeleteIvrTreeResponse = PccBaseResponse;

// ─── IVR node ──────────────────────────────────────────────────────────

// `talk` = TTS; `play` = audio file URL.
export type IvrNodePlayMode = "talk" | "play";

export interface IvrNode {
  id: string;
  account: number;
  project: number;
  tree: string;
  node_name: string;
  node_play_mode: IvrNodePlayMode;
  node_play_content: string;
  bargeIn?: boolean;
  loop_count?: number;
  sched?: number;
  voice?: string;
  speed?: number;
  keypress_timeout?: number;
}

export interface CreateIvrNodeRequest {
  tree: string;
  node_name: string;
  node_play_mode: IvrNodePlayMode;
  node_play_content: string;
  bargeIn?: boolean;
  loop_count?: number;
  sched?: number;
  voice?: string;
  speed?: number;
  keypress_timeout?: number;
}

export interface CreateIvrNodeResponse extends PccBaseResponse {
  ivrNodeID?: string;
  isRootNode?: boolean;
}

export interface ListIvrNodesQuery {
  tree?: string;
}

export interface ListIvrNodesResponse extends PccBaseResponse {
  data: {
    totalCount: string;
    totalPages: number;
    currentPage: number;
    limit: number;
    ivrNodes: IvrNode[];
  };
}

export type UpdateIvrNodeRequest = Partial<Omit<CreateIvrNodeRequest, "tree">>;

export interface UpdateIvrNodeResponse extends PccBaseResponse {
  ivrNodeID?: string;
}

export type DeleteIvrNodeResponse = PccBaseResponse;

// ─── IVR keypress ──────────────────────────────────────────────────────

// 1 = voicemail, 2 = queue routing, 3 = phone forwarding,
// 4 = next IVR node, 5 = SMS, 6 = stop call.
export type IvrKeypressAction = 1 | 2 | 3 | 4 | 5 | 6;

export type IvrKeypressKey =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "*"
  | "#"
  | "EMPTY_KEY"
  | "INVALID_KEY";

export interface IvrKeypress {
  id: string;
  account: number;
  project: number;
  tree: string;
  node: string;
  node_key: IvrKeypressKey;
  action: IvrKeypressAction;
  next_node?: string;
  queue_id?: string;
  to_phone_number?: string;
  sms?: string;
  from_number_callout_to_agent?: string;
}

export interface CreateIvrKeypressRequest {
  node: string;
  node_key: IvrKeypressKey;
  action: IvrKeypressAction;
  next_node?: string;
  queue_id?: string;
  from_number_callout_to_agent?: string;
  to_phone_number?: string;
  sms?: string;
}

export interface CreateIvrKeypressResponse extends PccBaseResponse {
  ivrNodeKeyID?: string;
}

export interface ListIvrKeypressesQuery {
  node: string;
}

export interface ListIvrKeypressesResponse extends PccBaseResponse {
  data: {
    totalCount: string;
    totalPages: number;
    currentPage: number;
    limit: number;
    ivrNodeKeys: IvrKeypress[];
  };
}

export type UpdateIvrKeypressRequest = Partial<Omit<CreateIvrKeypressRequest, "node">>;

export interface UpdateIvrKeypressResponse extends PccBaseResponse {
  ivrNodeKeyID?: string;
}

export type DeleteIvrKeypressResponse = PccBaseResponse;
