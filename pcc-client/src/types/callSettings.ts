import type { PccBaseResponse } from "./common";

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

export interface UpdateCallSettingsRequest {
  get_customer_info_url?: string;
  get_customer_info_timeout?: number;
  event_url?: string;
  callout_answer_url?: string;
}

export type UpdateCallSettingsResponse = PccBaseResponse;
