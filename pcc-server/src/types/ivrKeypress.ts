import type { PccBaseResponse } from "./common.js";

// 1 = voicemail, 2 = queue routing, 3 = phone forwarding,
// 4 = next IVR node, 5 = SMS, 6 = stop call.
export type IvrKeypressAction = 1 | 2 | 3 | 4 | 5 | 6;

// Digits, * and #, plus the documented sentinel values for "no key pressed"
// and "invalid key".
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

export interface UpdateIvrKeypressRequest {
  node_key?: IvrKeypressKey;
  action?: IvrKeypressAction;
  next_node?: string;
  queue_id?: string;
  from_number_callout_to_agent?: string;
  to_phone_number?: string;
  sms?: string;
}

export interface UpdateIvrKeypressResponse extends PccBaseResponse {
  ivrNodeKeyID?: string;
}

export type DeleteIvrKeypressResponse = PccBaseResponse;
