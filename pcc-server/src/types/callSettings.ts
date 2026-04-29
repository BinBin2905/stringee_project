import type { PccBaseResponse } from "./common.js";

// GET /v1/callsettings — read project-level webhook URLs for the
// Programmable Contact Center.
export interface CallSettings {
  account: number;
  project: number;
  get_customer_info_url?: string;
  get_customer_info_timeout?: number;
  event_url?: string;
  callout_answer_url?: string;
}

export interface GetCallSettingsResponse extends PccBaseResponse {
  callSetting?: CallSettings;
}

// PUT /v1/callsettings — only the supplied fields are updated.
export interface UpdateCallSettingsRequest {
  get_customer_info_url?: string;
  get_customer_info_timeout?: number;
  event_url?: string;
  callout_answer_url?: string;
}

export type UpdateCallSettingsResponse = PccBaseResponse;

// Query Stringee hits on `get_customer_info_url`.
export interface GetCustomerInfoQuery {
  from: string;
  to: string;
  project: number;
}
