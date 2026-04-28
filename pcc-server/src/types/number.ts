import type { IntBool, PccBaseResponse, PccListQuery } from "./common.js";

export interface PccNumber {
  id: string;
  account: number;
  project: number;
  number: string;
  nickname?: string;
  allow_outbound_calls: IntBool;
  enable_ivr: IntBool;
  ivr_menu?: string;
  queue_id?: string;
  record_outbound_calls?: IntBool;
}

export interface CreateNumberRequest {
  number: string;
  nickname?: string;
  allow_outbound_calls: boolean;
  enable_ivr: boolean;
  ivr_menu?: string;
  queue_id?: string;
  record_outbound_calls?: boolean;
}

export interface CreateNumberResponse extends PccBaseResponse {
  numberID?: string;
}

export type ListNumbersQuery = PccListQuery;

export interface ListNumbersResponse extends PccBaseResponse {
  data: {
    totalCount: string;
    totalPages: number;
    currentPage: number;
    limit: number;
    numbers: PccNumber[];
  };
}

export type UpdateNumberRequest = CreateNumberRequest;

export type UpdateNumberResponse = PccBaseResponse;

export type DeleteNumberResponse = PccBaseResponse;
