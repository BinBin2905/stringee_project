// SIP account responses use a slightly different envelope (`msg` instead of
// `message`) and don't carry the `project` field on every reply.
export interface SipAccountBaseResponse {
  r: number;
  message?: string;
  msg?: string;
}

export interface SipAccount {
  user_name: string;
  extension: number;
  stringee_user_id?: string;
}

export interface CreateSipAccountRequest {
  user_name: string;
  password: string;
  stringee_user_id?: string;
  extension: number;
}

export interface CreateSipAccountResponse extends SipAccountBaseResponse {
  res_create_subscriber?: number;
}

export interface ListSipAccountsQuery {
  username?: string;
  stringee_user_id?: string;
  extension?: number;
}

export interface ListSipAccountsResponse extends SipAccountBaseResponse {
  data: {
    rows: SipAccount[];
    totalPages?: number;
    totalCount?: number;
  };
}

export interface UpdateSipAccountRequest {
  extension: number;
  stringee_user_id?: string;
  password: string;
}

export interface UpdateSipAccountResponse extends SipAccountBaseResponse {
  res_update_subscriber?: boolean;
}

export interface DeleteSipAccountResponse extends SipAccountBaseResponse {
  res_delete_subscriber?: boolean;
}
